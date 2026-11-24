import { Router } from 'express';
import { Expo } from 'expo-server-sdk';
import Notification from '../models/notificationsModel.js';
import User from '../models/userModel.js';
import { asyncHandler, requireUser, validateId } from '../middleware/auth.js';

const router = Router();

router.use(requireUser);

router.get('/', asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('actorId', 'name image')
        .populate('restaurantId', 'name image')
        .populate('dishId', 'name image');
    res.json(notifications);
}));

router.post('/push-token', asyncHandler(async (req, res) => {
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    if (!Expo.isExpoPushToken(token)) {
        return res.status(400).json({ message: 'Invalid push token' });
    }

    await User.updateMany(
        { _id: { $ne: req.user._id }, expoPushTokens: token },
        { $pull: { expoPushTokens: token } }
    );
    await User.updateOne({ _id: req.user._id }, { $addToSet: { expoPushTokens: token } });
    res.status(204).end();
}));

router.delete('/push-token', asyncHandler(async (req, res) => {
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    if (token) {
        await User.updateOne({ _id: req.user._id }, { $pull: { expoPushTokens: token } });
    }
    res.status(204).end();
}));

router.delete('/:id', validateId(), asyncHandler(async (req, res) => {
    await Notification.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.status(204).end();
}));

router.delete('/', asyncHandler(async (req, res) => {
    await Notification.deleteMany({ userId: req.user._id });
    res.status(204).end();
}));

export default router;