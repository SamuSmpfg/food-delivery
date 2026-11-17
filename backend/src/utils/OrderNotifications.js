import Notification from '../models/notificationsModel.js';

const STATUS_MESSAGES = {
    accepted: { title: 'Order accepted', description: 'The restaurant accepted your order.' },
    preparing: { title: 'Preparing your order', description: 'The restaurant started preparing your order.' },
    ready: { title: 'Order ready', description: 'Your order is ready.' },
    cancelled: { title: 'Order cancelled', description: 'The restaurant cancelled your order.' }
};

export const notifyCustomerOfStatus = async (order, actorId) => {
    const message = STATUS_MESSAGES[order.status];
    if (!message) return;

    try {
        await Notification.create({
            userId: order.userId,
            actorId,
            restaurantId: order.restaurantId?._id ?? order.restaurantId,
            orderId: order._id,
            title: message.title,
            description: message.description
        });
    } catch (error) {
        console.error('ORDER NOTIFICATION ERROR:', error.message);
    }
};