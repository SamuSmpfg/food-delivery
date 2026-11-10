import { Router } from 'express';
import mongoose from 'mongoose';
import Message from '../models/messagesModel.js';
import Order from '../models/orderModel.js';
import Restaurant from '../models/restuarantModel.js';
import { asyncHandler, requireUser, validateId } from '../middleware/auth.js';

const router = Router();

router.use(requireUser);

const getParticipants = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) return null;
    const restaurant = await Restaurant.findById(order.restaurantId);
    return [order.userId, order.courierId, restaurant?.ownerId].filter(Boolean).map(String);
};

router.get('/conversations', asyncHandler(async (req, res) => {
    const userId = String(req.user._id);
    const messages = await Message.find({
        $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    })
        .sort({ createdAt: -1 })
        .populate('senderId', 'name')
        .populate('receiverId', 'name');

    const conversations = new Map();

    for (const message of messages) {
        const isReceiver = String(message.receiverId._id) === userId;
        const other = isReceiver ? message.senderId : message.receiverId;
        const key = `${message.orderId}:${other._id}`;

        if (!conversations.has(key)) {
            conversations.set(key, {
                orderId: message.orderId,
                user: { _id: other._id, name: other.name },
                lastMessage: message.body,
                lastMessageAt: message.createdAt,
                unreadCount: 0
            });
        }

        if (isReceiver && !message.readAt) {
            conversations.get(key).unreadCount += 1;
        }
    }

    res.json([...conversations.values()]);
}));

router.get('/order/:orderId', validateId('orderId'), asyncHandler(async (req, res) => {
    const participants = await getParticipants(req.params.orderId);
    if (!participants) return res.status(404).json({ message: 'Order not found' });
    if (!participants.includes(String(req.user._id))) return res.status(403).json({ message: 'Forbidden' });
    const messages = await Message.find({
        orderId: req.params.orderId,
        $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    }).sort({ createdAt: 1 });
    res.json(messages);
}));

router.post('/', asyncHandler(async (req, res) => {
    const { orderId, receiverId, body } = req.body;
    if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(receiverId) || !body?.trim()) {
        return res.status(400).json({ message: 'orderId, receiverId and body are required' });
    }
    const participants = await getParticipants(orderId);
    if (!participants) return res.status(404).json({ message: 'Order not found' });
    if (!participants.includes(String(req.user._id)) || !participants.includes(String(receiverId))) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const message = await Message.create({ orderId, senderId: req.user._id, receiverId, body });
    res.status(201).json(message);
}));

router.patch('/order/:orderId/read', validateId('orderId'), asyncHandler(async (req, res) => {
    await Message.updateMany(
        { orderId: req.params.orderId, receiverId: req.user._id, readAt: null },
        { readAt: new Date() }
    );
    res.status(204).end();
}));

export default router;