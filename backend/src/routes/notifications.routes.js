import { Router } from 'express';
import Notification from '../models/notificationsModel.js';
import { asyncHandler, requireUser, validateId } from '../middleware/auth.js';

const router = Router();

router.use(requireUser);

router.get('/', asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('restaurantId', 'name image')
        .populate('dishId', 'name image');
    res.json(notifications);
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