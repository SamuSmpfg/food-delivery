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
    console.log(req.user._id)

    const userId = new mongoose.Types.ObjectId(req.user._id);
    const usersCollection = mongoose.model('User').collection.name;

    const conversations = await Message.aggregate([
        { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
        { $addFields: { sortDate: { $ifNull: ['$createdAt', '$updatedAt'] } } },
        { $sort: { sortDate: -1, _id: -1 } },
        {
            $addFields: {
                otherUserId: {
                    $cond: [{ $eq: ['$senderId', userId] }, '$receiverId', '$senderId']
                }
            }
        },
        {
            $group: {
                _id: { orderId: '$orderId', otherUserId: '$otherUserId' },
                lastMessage: { $first: '$message' },
                lastMessageAt: { $first: '$sortDate' },
                unreadCount: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$isRead', false] }] },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        { $sort: { lastMessageAt: -1, '_id.orderId': -1, '_id.otherUserId': -1 } },
        {
            $lookup: {
                from: usersCollection,
                localField: '_id.otherUserId',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 0,
                orderId: '$_id.orderId',
                user: {
                    _id: { $ifNull: ['$user._id', '$_id.otherUserId'] },
                    name: { $ifNull: ['$user.name', 'Unknown user'] }
                },
                lastMessage: 1,
                lastMessageAt: 1,
                unreadCount: 1
            }
        }
    ]);

    res.json(conversations);
}));

router.get('/order/:orderId', validateId('orderId'), asyncHandler(async (req, res) => {
    const participants = await getParticipants(req.params.orderId);
    if (!participants) return res.status(404).json({ message: 'Order not found' });
    if (!participants.includes(String(req.user._id))) return res.status(403).json({ message: 'Forbidden' });
    const messages = await Message.find({
        orderId: req.params.orderId,
        $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    }).sort({ createdAt: 1, updatedAt: 1 });
    res.json(messages);
}));

router.post('/', asyncHandler(async (req, res) => {
    const { orderId, receiverId, message } = req.body;
    if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(receiverId) || !message?.trim()) {
        return res.status(400).json({ message: 'orderId, receiverId and message are required' });
    }
    const participants = await getParticipants(orderId);
    if (!participants) return res.status(404).json({ message: 'Order not found' });
    if (!participants.includes(String(req.user._id)) || !participants.includes(String(receiverId))) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const created = await Message.create({ orderId, senderId: req.user._id, receiverId, message });
    res.status(201).json(created);
}));

router.patch('/order/:orderId/read', validateId('orderId'), asyncHandler(async (req, res) => {
    const { userId } = req.query;
    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ message: 'userId is required' });
    }

    await Message.updateMany(
        {
            orderId: req.params.orderId,
            senderId: userId,
            receiverId: req.user._id,
            isRead: false
        },
        { isRead: true }
    );
    res.status(204).end();
}));

router.delete('/order/:orderId', validateId('orderId'), asyncHandler(async (req, res) => {
    const { userId } = req.query;
    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ message: 'userId is required' });
    }

    await Message.deleteMany({
        orderId: req.params.orderId,
        $or: [
            { senderId: req.user._id, receiverId: userId },
            { senderId: userId, receiverId: req.user._id }
        ]
    });
    res.status(204).end();
}));

export default router;