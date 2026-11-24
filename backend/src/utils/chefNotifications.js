import Notification from '../models/notificationsModel.js'
import Restaurant from '../models/restuarantModel.js'

const notifyChef = async ({ order, restaurant, customer, type, title, description }) => {
  try {
    const target =
      restaurant ??
      (await Restaurant.findById(order.restaurantId?._id ?? order.restaurantId).select('ownerId name'))
    if (!target?.ownerId) return

    const firstDish = order.items?.[0]?.dishId

    await Notification.create({
      userId: target.ownerId,
      actorId: customer?._id,
      restaurantId: target._id,
      dishId: firstDish?._id ?? firstDish,
      orderId: order._id,
      type,
      title,
      description
    })
  } catch (error) {
    console.error('CHEF NOTIFICATION ERROR:', error)
  }
}

export const notifyChefOfNewOrder = ({ order, restaurant, customer }) =>
  notifyChef({
    order,
    restaurant,
    customer,
    type: 'order_new',
    title: `${customer?.name ?? 'A customer'}`,
    description: 'placed a new order'
  })

export const notifyChefOfCancellation = ({ order, customer }) =>
  notifyChef({
    order,
    customer,
    type: 'order_cancelled',
    title: `${customer?.name ?? 'The customer'}`,
    description: `agreed to cancel`
  })