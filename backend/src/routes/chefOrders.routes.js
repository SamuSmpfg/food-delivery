import { Router } from 'express';
import Order from '../models/orderModel.js';
import Restaurant from '../models/restuarantModel.js';
import { asyncHandler, requireUser, requireRole, validateId } from '../middleware/auth.js';

const router = Router();

const RUNNING_STATUSES = ['pending', 'preparing', 'ready', 'delivering'];

router.get('/running', requireUser, requireRole('chef'), asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const orders = await Order.find({
        restaurantId: { $in: restaurants.map((restaurant) => restaurant._id) },
        status: { $in: RUNNING_STATUSES }
    }).sort({ createdAt: -1 });
    res.json(orders);
}));

router.patch('/:id/cancel', requireUser, requireRole('chef'), validateId(), asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const restaurant = await Restaurant.findOne({ _id: order.restaurantId, ownerId: req.user._id });
    if (!restaurant) return res.status(403).json({ message: 'Forbidden' });

    if (!RUNNING_STATUSES.includes(order.status)) {
        return res.status(400).json({ message: 'Order is not running' });
    }

    order.status = 'cancelled';
    await order.save();
    res.json(order);
}));

export default router;