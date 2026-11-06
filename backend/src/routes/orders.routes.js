import { Router } from 'express'
import mongoose from 'mongoose'
import { getAuth, clerkClient } from '@clerk/express'
import Order from '../models/orderModel.js'
import User from '../models/userModel.js'
import Restaurant from '../models/restuarantModel.js'
import Dish from '../models/dishesModel.js'

const router = Router()

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
      console.log('ORDERS 401: requisição sem usuário autenticado no Clerk', req.method, req.originalUrl)
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await findOrCreateUser(clerkId)
    if (!user) {
      console.log('ORDERS 404: usuário do Clerk sem email', clerkId)
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
  console.log('ORDERS ROUTER', req.method, req.originalUrl, 'auth header:', !!req.headers.authorization)
  next()
})

router.use(requireUser)

const POPULATE_RESTAURANT = { path: 'restaurantId', select: 'name image' }

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
    console.log('POST /api/orders recebido', JSON.stringify(req.body))
    const { restaurantId, items, deliveryAddress } = req.body

    if (!mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant id' })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'The order has no items' })
    }

    if (items.some((item) => !mongoose.isValidObjectId(item?.dishId))) {
      return res.status(400).json({ message: 'Invalid dish id' })
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

      console.log('SIZE DEBUG', JSON.stringify(dish.sizes), JSON.stringify(size))

      if (!size.label || typeof size.price !== 'number') {
        console.error('Prato com tamanho malformado:', String(dish._id), JSON.stringify(dish.sizes))
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

    const order = await Order.create({
      userId: req.user._id,
      restaurantId: restaurant._id,
      items: orderItems,
      stages: [{ status: 'pending' }],
      subTotal,
      deliveryFee,
      total,
      estimatedMinutes: restaurant.averageDeliveryTime,
      ...(deliveryAddress ? { deliveryAddress } : {})
    })

    await order.populate(POPULATE_RESTAURANT)
    res.status(201).json(toResponse(order))
  } catch (error) {
    console.error('CREATE ORDER ERROR:', error)
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message })
    }
    res.status(500).json({ message: 'Could not create the order' })
  }
})

router.patch('/:id/cancel', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id' })
    }

    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id })
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'This order can no longer be cancelled' })
    }

    order.status = 'cancelled'
    order.stages.push({ status: 'cancelled' })
    await order.save()

    await order.populate(POPULATE_RESTAURANT)
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

    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id })
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'A cancelled order cannot be completed' })
    }

    if (order.status !== 'delivered') {
      order.status = 'delivered'
      order.stages.push({ status: 'delivered' })
      await order.save()
    }

    await order.populate(POPULATE_RESTAURANT)
    res.json(toResponse(order))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Could not complete the order' })
  }
})

export default router