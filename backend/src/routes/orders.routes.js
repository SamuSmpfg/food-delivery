import { Router } from 'express'
import mongoose from 'mongoose'
import { getAuth, clerkClient } from '@clerk/express'
import Order from '../models/orderModel.js'
import User from '../models/userModel.js'
import Restaurant from '../models/restuarantModel.js'
import Dish from '../models/dishesModel.js'
import { verifyPaymentIntent, refundOrderIfPaid } from '../utils/stripePayments.js'
import { notifyCustomerOfStatus } from '../utils/orderNotifications.js'
import { notifyChefOfNewOrder, notifyChefOfCancellation } from '../utils/chefNotifications.js'

const router = Router()

const REQUIRE_PAYMENT_INTENT = process.env.REQUIRE_PAYMENT_INTENT === 'true'
const DEFAULT_ESTIMATED_MINUTES = 30

const findOrCreateUser = async (clerkId) => {
  const existing = await User.findOne({ clerkId })
  if (existing) return existing

  const clerkUser = await clerkClient.users.getUser(clerkId)
  const primary =
    clerkUser.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId) ??
    clerkUser.emailAddresses[0]
  const email = primary?.emailAddress
  if (!email) return null

  const firstName = clerkUser.firstName ?? ''
  const lastName = clerkUser.lastName ?? ''
  const name = `${firstName} ${lastName}`.trim() || email.split('@')[0]

  try {
    return await User.findOneAndUpdate(
      { clerkId },
      { $set: { email, firstName, lastName, name } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    )
  } catch (error) {
    if (error.code === 11000) return User.findOne({ clerkId })
    throw error
  }
}

const requireUser = async (req, res, next) => {
  try {
    const { userId: clerkId } = getAuth(req)
    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await findOrCreateUser(clerkId)
    if (!user) {
      return res.status(404).json({ message: 'User not found (the account has no email address)' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('ORDERS requireUser ERROR:', error)
    res.status(500).json({ message: 'Could not authenticate the user' })
  }
}

router.use((req, res, next) => {
  next()
})

router.use(requireUser)

const POPULATE_RESTAURANT = { path: 'restaurantId', select: 'name image' }
const getRestaurantObjectId = (order) => order.restaurantId?._id ?? order.restaurantId
const creditRestaurantBalance = async (order) => {
  const marked = await Order.findOneAndUpdate(
    { _id: order._id, balanceCredited: false },
    { $set: { balanceCredited: true, 'paymentStatus.status': 'paid' } },
    { new: true }
  )
  if (!marked) return false

  try {
    await Restaurant.updateOne(
      { _id: getRestaurantObjectId(order) },
      { $inc: { availableBalance: order.total } }
    )
    return true
  } catch (error) {
    await Order.updateOne(
      { _id: order._id },
      { $set: { balanceCredited: false, 'paymentStatus.status': 'unpaid' } }
    )
    throw error
  }
}

const debitRestaurantBalance = async (order) => {
  const marked = await Order.findOneAndUpdate(
    { _id: order._id, balanceCredited: true },
    { $set: { balanceCredited: false, 'paymentStatus.status': 'unpaid' } },
    { new: true }
  )
  if (!marked) return false

  try {
    await Restaurant.updateOne(
      { _id: getRestaurantObjectId(order) },
      { $inc: { availableBalance: -order.total } }
    )
    return true
  } catch (error) {
    await Order.updateOne(
      { _id: order._id },
      { $set: { balanceCredited: true, 'paymentStatus.status': 'paid' } }
    )
    throw error
  }
}

const creditCashOrderIfDelivered = async (order) => {
  if (order && order.status === 'delivered' && order.paymentMethod === 'cash') {
    await creditRestaurantBalance(order)
  }
}

const toResponse = (order) => {
  const data = order.toObject()
  const restaurant =
    data.restaurantId && typeof data.restaurantId === 'object' && data.restaurantId.name
      ? data.restaurantId
      : null

  return {
    ...data,
    restaurantId: restaurant ? restaurant._id : data.restaurantId,
    restaurantName: restaurant?.name ?? '',
    restaurantImage: restaurant?.image ?? '',
    itemsCount: (data.items ?? []).reduce((sum, item) => sum + item.quantity, 0)
  }
}

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate(POPULATE_RESTAURANT)

    res.json(orders.map(toResponse))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Could not load the orders' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress } = req.body
    const paymentIntentId =
      typeof req.body.paymentIntentId === 'string' && req.body.paymentIntentId.trim()
        ? req.body.paymentIntentId.trim()
        : null

    const paymentMethod = paymentIntentId
      ? 'card'
      : req.body.paymentMethod === 'cash'
        ? 'cash'
        : 'card'

    if (!mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant id' })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'The order has no items' })
    }

    if (items.some((item) => !mongoose.isValidObjectId(item?.dishId))) {
      return res.status(400).json({ message: 'Invalid dish id' })
    }

    if (paymentMethod === 'card' && !paymentIntentId && REQUIRE_PAYMENT_INTENT) {
      return res.status(400).json({ message: 'A confirmed payment is required' })
    }

    if (paymentIntentId) {
      const existingOrder = await Order.findOne({
        userId: req.user._id,
        'payment.stripePaymentIntentId': paymentIntentId
      }).populate(POPULATE_RESTAURANT)
      if (existingOrder) return res.status(200).json(toResponse(existingOrder))
    }

    const restaurant = await Restaurant.findById(restaurantId)
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' })
    }

    const dishes = await Dish.find({
      _id: { $in: items.map((item) => item.dishId) },
      restaurantId: restaurant._id
    })
    const dishById = new Map(dishes.map((dish) => [String(dish._id), dish]))

    const orderItems = []
    for (const item of items) {
      const dish = dishById.get(String(item.dishId))
      if (!dish) {
        return res.status(400).json({ message: 'A dish does not belong to this restaurant' })
      }

      const quantity = Number(item.quantity)
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: `Invalid quantity for ${dish.name}` })
      }

      const sizes = Array.isArray(dish.sizes) ? dish.sizes : []
      const size = item.size
        ? sizes.find((option) => option.label === item.size)
        : sizes[0]
      if (!size) {
        return res.status(400).json({ message: `Invalid size for ${dish.name}` })
      }

      if (!size.label || typeof size.price !== 'number') {
        console.error('Dish with an irregularly shaped size:', String(dish._id), JSON.stringify(dish.sizes))
        return res.status(400).json({ message: `The dish ${dish.name} has a malformed size (missing label or price)` })
      }

      orderItems.push({
        dishId: dish._id,
        name: dish.name,
        size: size.label,
        unitPrice: size.price,
        quantity
      })
    }

    const round = (value) => Math.round(value * 100) / 100
    const subTotal = round(orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))
    const deliveryFee = restaurant.deliveryFee ?? 0
    const total = round(subTotal + deliveryFee)

    const deliveryMinutes = Number(restaurant.averageDeliveryTime) || 0
    const prepMinutes = Math.max(
      0,
      ...orderItems.map((item) => Number(dishById.get(String(item.dishId))?.avgPrepMinutes) || 0)
    )
    const estimatedMinutes = deliveryMinutes + prepMinutes || DEFAULT_ESTIMATED_MINUTES

    let payment = null
    if (paymentIntentId) {
      const check = await verifyPaymentIntent(paymentIntentId, total)
      if (!check.ok) {
        return res.status(400).json({ message: check.message })
      }
      payment = { stripePaymentIntentId: paymentIntentId, status: 'paid' }
    }

    const order = await Order.create({
      userId: req.user._id,
      restaurantId: restaurant._id,
      items: orderItems,
      stages: [{ status: 'pending' }],
      subTotal,
      deliveryFee,
      total,
      estimatedMinutes,
      paymentMethod,
      ...(payment ? { payment } : {}),
      ...(deliveryAddress ? { deliveryAddress } : {})
    })

    if (paymentMethod === 'card' && payment) {
      await creditRestaurantBalance(order)
    }

    try {
      await notifyChefOfNewOrder({ order, restaurant, customer: req.user })
    } catch (notifyError) {
      console.error('NOTIFY CHEF (NEW ORDER) ERROR:', notifyError)
    }

    await order.populate(POPULATE_RESTAURANT)
    res.status(201).json(toResponse(order))
  } catch (error) {
    console.error('CREATE ORDER ERROR:', error)
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This payment was already used for another order' })
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message })
    }
    res.status(500).json({ message: 'Could not create the order' })
  }
})

const CUSTOMER_CANCELLABLE = ['pending', 'accepted']
const CUSTOMER_COMPLETABLE = ['ready', 'delivering']

router.patch('/:id/cancel', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id' })
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, status: { $in: CUSTOMER_CANCELLABLE } },
      { $set: { status: 'cancelled' }, $push: { stages: { status: 'cancelled' } } },
      { new: true, runValidators: true }
    ).populate(POPULATE_RESTAURANT)

    if (!order) {
      const exists = await Order.exists({ _id: req.params.id, userId: req.user._id })
      if (!exists) return res.status(404).json({ message: 'Order not found' })
      return res.status(400).json({ message: 'This order can no longer be cancelled' })
    }

    await refundOrderIfPaid(order)
    await debitRestaurantBalance(order)

    try {
      await notifyChefOfCancellation({ order, customer: req.user })
    } catch (notifyError) {
      console.error('NOTIFY CHEF (CANCEL) ERROR:', notifyError)
    }

    res.json(toResponse(order))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Could not cancel the order' })
  }
})

router.patch('/:id/complete', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id' })
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, status: { $in: CUSTOMER_COMPLETABLE } },
      { $set: { status: 'delivered' }, $push: { stages: { status: 'delivered' } } },
      { new: true, runValidators: true }
    ).populate(POPULATE_RESTAURANT)

    if (order) {
      await creditCashOrderIfDelivered(order)
      return res.json(toResponse(order))
    }

    const existing = await Order.findOne({ _id: req.params.id, userId: req.user._id }).populate(POPULATE_RESTAURANT)
    if (!existing) return res.status(404).json({ message: 'Order not found' })
    if (existing.status === 'delivered') return res.json(toResponse(existing))

    res.status(400).json({ message: 'The order is not ready to be completed yet' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Could not complete the order' })
  }
})

const FOOD_TIMEZONE = 'America/Sao_Paulo'

const hourFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  hourCycle: 'h23',
  timeZone: FOOD_TIMEZONE
})

const getFoodType = (date) => {
  const hour = Number(hourFormatter.format(new Date(date)))
  if (hour < 11) return 'BREAKFAST'
  if (hour < 16) return 'LUNCH'
  return 'DINNER'
}

const ORDER_STATUSES = ['pending', 'accepted', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled']
const DEFAULT_RESTAURANT_STATUSES = ['pending', 'accepted', 'preparing']

const STATUS_TRANSITIONS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivering: ['delivered'],
  delivered: [],
  cancelled: []
}

const CHEF_POPULATE = [
  POPULATE_RESTAURANT,
  { path: 'items.dishId', select: 'image', model: Dish }
]

const toRestaurantOrderResponse = (order) => {
  const data = order.toObject()
  const items = data.items ?? []
  const first = items[0]
  const extra = items.length - 1

  const name = first ? (extra > 0 ? `${first.name} +${extra} more` : first.name) : 'Order'
  const image = first?.dishId?.image ?? data.restaurantId?.image ?? null

  return {
    _id: data._id,
    foodType: getFoodType(data.createdAt),
    name,
    image,
    orderId: String(data._id).slice(-6).toUpperCase(),
    price: data.total,
    status: data.status,
    createdAt: data.createdAt,
    restaurantId: data.restaurantId?._id ?? data.restaurantId,
    itemsCount: items.reduce((sum, item) => sum + item.quantity, 0)
  }
}

const getChefRestaurantIds = async (userId) => {
  const restaurants = await Restaurant.find({ ownerId: userId }).select('_id')
  return restaurants.map((restaurant) => restaurant._id)
}

router.get('/restaurant', async (req, res) => {
  try {
    const rawStatus = String(req.query.status || DEFAULT_RESTAURANT_STATUSES.join(','))
    const statuses = rawStatus
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)

    if (statuses.length === 0 || statuses.some((value) => !ORDER_STATUSES.includes(value))) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const restaurantIds = await getChefRestaurantIds(req.user._id)
    if (restaurantIds.length === 0) {
      return res.status(403).json({ message: 'This account does not own a restaurant' })
    }

    const orders = await Order.find({
      restaurantId: { $in: restaurantIds },
      status: { $in: statuses }
    })
      .sort({ createdAt: -1 })
      .populate(CHEF_POPULATE)

    res.json({ count: orders.length, orders: orders.map(toRestaurantOrderResponse) })
  } catch (error) {
    console.error('RESTAURANT ORDERS ERROR:', error)
    res.status(500).json({ message: 'Could not load the orders' })
  }
})

router.patch('/:id/status', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id' })
    }

    const nextStatus = String(req.body?.status || '').trim().toLowerCase()
    if (!ORDER_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const restaurant = await Restaurant.findOne({
      _id: order.restaurantId,
      ownerId: req.user._id
    }).select('_id')
    if (!restaurant) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const allowed = STATUS_TRANSITIONS[order.status] ?? []
    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({
        message: `Cannot change an order from ${order.status} to ${nextStatus}`
      })
    }

    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: order.status },
      { $set: { status: nextStatus }, $push: { stages: { status: nextStatus } } },
      { new: true, runValidators: true }
    ).populate(CHEF_POPULATE)

    if (!updated) {
      return res.status(409).json({ message: 'The order was updated by someone else, try again' })
    }

    if (nextStatus === 'cancelled') {
      await refundOrderIfPaid(updated)
      await debitRestaurantBalance(updated)
    }

    if (nextStatus === 'delivered') {
      await creditCashOrderIfDelivered(updated)
    }

    if (nextStatus === 'accepted' && updated.paymentMethod === 'card') {
      await creditRestaurantBalance(updated)
    }

    await notifyCustomerOfStatus(updated, req.user._id)

    res.json(toRestaurantOrderResponse(updated))
  } catch (error) {
    console.error('UPDATE ORDER STATUS ERROR:', error)
    res.status(500).json({ message: 'Could not update the order' })
  }
})

export default router