import { Router } from 'express';
import Restaurant from '../models/restuarantModel.js';
import Dish from '../models/dishesModel.js';
import { asyncHandler, requireUser, requireRole, validateId } from '../middleware/auth.js';
import { pick } from '../utils/pick.js';

const router = Router();

const editable = ['name', 'description', 'image', 'address', 'deliveryFee', 'averageDeliveryTime', 'isOpen'];

router.get('/', asyncHandler(async (req, res) => {
    const { q, isOpen } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: String(q).trim(), $options: 'i' };
    if (isOpen !== undefined) filter.isOpen = isOpen === 'true';
    const restaurants = await Restaurant.find(filter).sort({ rating: -1 });
    res.json(restaurants);
}));

router.get('/mine', requireUser, requireRole('chef'), asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find({ ownerId: req.user._id });
    res.json(restaurants);
}));

router.get('/:id', validateId(), asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
}));

router.get('/:id/dishes', validateId(), asyncHandler(async (req, res) => {
    const { classification } = req.query;
    const filter = { restaurantId: req.params.id, available: true };
    if (classification) filter.classification = classification;
    const dishes = await Dish.find(filter).sort({ orderCount: -1 });
    res.json(dishes);
}));

router.post('/', requireUser, requireRole('chef'), asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.create({ ...pick(req.body, editable), ownerId: req.user._id });
    res.status(201).json(restaurant);
}));

router.put('/:id', requireUser, requireRole('chef'), validateId(), asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findOneAndUpdate(
        { _id: req.params.id, ownerId: req.user._id },
        pick(req.body, editable),
        { new: true, runValidators: true }
    );
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
}));

export default router;