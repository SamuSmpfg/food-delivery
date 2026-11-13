import { Router } from 'express';
import Dish from '../models/dishesModel.js';
import Restaurant from '../models/restuarantModel.js';
import { asyncHandler, requireUser, requireRole, validateId } from '../middleware/auth.js';
import { pick } from '../utils/pick.js';

const router = Router();

const editable = [
    'name', 'description', 'image', 'classification', 'deliveryMode',
    'sizes', 'ingredients', 'avgPrepMinutes', 'available'
];

router.get('/', asyncHandler(async (req, res) => {
    const { q, restaurantId, classification, deliveryMode } = req.query;
    const filter = { available: true };
    if (q) filter.name = { $regex: String(q).trim(), $options: 'i' };
    if (restaurantId) filter.restaurantId = restaurantId;
    if (classification) filter.classification = classification;
    if (deliveryMode) filter.deliveryMode = deliveryMode;
    const dishes = await Dish.find(filter).sort({ rating: -1, orderCount: -1 }).limit(100);
    res.json(dishes);
}));

router.get('/popular', requireUser, requireRole('chef'), asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id');
    const dishes = await Dish.find({ restaurantId: { $in: restaurants.map((r) => r._id) } })
        .sort({ orderCount: -1, rating: -1, reviewsCount: -1 })
        .limit(10);
    res.json(dishes);
}));

router.get('/:id', validateId(), asyncHandler(async (req, res) => {
    const dish = await Dish.findById(req.params.id).populate('restaurantId', 'name image rating deliveryFee isOpen');
    if (!dish) return res.status(404).json({ message: 'Dish not found' });
    res.json(dish);
}));

router.post('/', requireUser, requireRole('chef'), asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findOne({ _id: req.body.restaurantId, ownerId: req.user._id });
    if (!restaurant) return res.status(403).json({ message: 'Forbidden' });
    const dish = await Dish.create({ ...pick(req.body, editable), restaurantId: restaurant._id });
    res.status(201).json(dish);
}));

router.put('/:id', requireUser, requireRole('chef'), validateId(), asyncHandler(async (req, res) => {
    const dish = await Dish.findById(req.params.id);
    if (!dish) return res.status(404).json({ message: 'Dish not found' });
    const restaurant = await Restaurant.findOne({ _id: dish.restaurantId, ownerId: req.user._id });
    if (!restaurant) return res.status(403).json({ message: 'Forbidden' });
    dish.set(pick(req.body, editable));
    await dish.save();
    res.json(dish);
}));

router.delete('/:id', requireUser, requireRole('chef'), validateId(), asyncHandler(async (req, res) => {
    const dish = await Dish.findById(req.params.id);
    if (!dish) return res.status(404).json({ message: 'Dish not found' });
    const restaurant = await Restaurant.findOne({ _id: dish.restaurantId, ownerId: req.user._id });
    if (!restaurant) return res.status(403).json({ message: 'Forbidden' });
    await dish.deleteOne();
    res.status(204).end();
}));

export default router;