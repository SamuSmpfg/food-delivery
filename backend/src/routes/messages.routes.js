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