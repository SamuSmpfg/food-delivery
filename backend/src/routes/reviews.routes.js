import { Router } from 'express';
import mongoose from 'mongoose';
import Review from '../models/reviewsModel.js';
import Order from '../models/orderModel.js';
import Dish from '../models/dishesModel.js';
import Restaurant from '../models/restuarantModel.js';
import Notification from '../models/notificationsModel.js';
import { asyncHandler, requireUser, validateId } from '../middleware/auth.js';

const router = Router();

const refreshStats = async (Model, id, field) => {
    const [stats] = await Review.aggregate([
        { $match: { [field]: id } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    await Model.findByIdAndUpdate(id, {
        rating: stats ? Math.round(stats.avg * 10) / 10 : 0,
        reviewsCount: stats ? stats.count : 0
    });
};

router.get('/restaurant/:id', validateId(), asyncHandler(async (req, res) => {
    const reviews = await Review.find({ restaurantId: req.params.id })
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .limit(50);
    res.json(reviews);
}));

router.get('/dish/:id', validateId(), asyncHandler(async (req, res) => {
    const reviews = await Review.find({ dishId: req.params.id })
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .limit(50);
    res.json(reviews);
}));

router.post('/', requireUser, asyncHandler(async (req, res) => {
    const { orderId, dishId, rating, title, description } = req.body;
    if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(dishId)) {
        return res.status(400).json({ message: 'Invalid orderId or dishId' });
    }

    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'delivered') return res.status(400).json({ message: 'Order not delivered yet' });
    if (!order.items.some((item) => String(item.dishId) === String(dishId))) {
        return res.status(400).json({ message: 'Dish is not part of this order' });
    }

    const exists = await Review.exists({ userId: req.user._id, orderId, dishId });
    if (exists) return res.status(409).json({ message: 'Dish already reviewed for this order' });

    const review = await Review.create({
        userId: req.user._id,
        restaurantId: order.restaurantId,
        dishId,
        orderId,
        rating,
        title,
        description
    });

    await refreshStats(Dish, review.dishId, 'dishId');
    await refreshStats(Restaurant, review.restaurantId, 'restaurantId');

    const restaurant = await Restaurant.findById(review.restaurantId);
    if (restaurant) {
        await Notification.create({
            userId: restaurant.ownerId,
            restaurantId: restaurant._id,
            dishId,
            orderId,
            rating: review.rating,
            title: 'New review',
            description: review.title
        });
    }

    res.status(201).json(review);
}));

export default router;