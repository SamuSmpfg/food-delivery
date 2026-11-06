import { Router } from 'express';
import mongoose from 'mongoose';
import CartItem from '../models/cartItemModel.js';
import Dish from '../models/dishesModel.js';
import { asyncHandler, requireUser, validateId } from '../middleware/auth.js';

const router = Router();

router.use(requireUser);

router.get('/', asyncHandler(async (req, res) => {
    const cartItems = await CartItem.find({ userId: req.user._id }).populate('dishId');
    const items = cartItems
        .filter((item) => item.dishId)
        .map((item) => {
            const dish = item.dishId;
            const size = dish.sizes.id(item.sizeId);
            return {
                _id: item._id,
                dishId: dish._id,
                restaurantId: dish.restaurantId,
                name: dish.name,
                image: dish.image,
                sizeId: item.sizeId,
                size: size?.label ?? '',
                unitPrice: size?.price ?? 0,
                quantity: item.quantity
            };
        });
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subTotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    res.json({ items, count, subTotal });
}));

router.post('/', asyncHandler(async (req, res) => {
    const { dishId, sizeId } = req.body;
    const quantity = Number(req.body.quantity ?? 1);
    if (!mongoose.isValidObjectId(dishId) || !mongoose.isValidObjectId(sizeId)) {
        return res.status(400).json({ message: 'Invalid dishId or sizeId' });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Invalid quantity' });
    }
    const dish = await Dish.findOne({ _id: dishId, available: true });
    if (!dish || !dish.sizes.id(sizeId)) return res.status(404).json({ message: 'Dish or size not found' });
    const item = await CartItem.findOneAndUpdate(
        { userId: req.user._id, dishId, sizeId },
        { $inc: { quantity } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(item);
}));

router.patch('/:id', validateId(), asyncHandler(async (req, res) => {
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity)) return res.status(400).json({ message: 'Invalid quantity' });
    if (quantity < 1) {
        await CartItem.deleteOne({ _id: req.params.id, userId: req.user._id });
        return res.status(204).end();
    }
    const item = await CartItem.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { quantity },
        { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    res.json(item);
}));

router.delete('/:id', validateId(), asyncHandler(async (req, res) => {
    await CartItem.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.status(204).end();
}));

router.delete('/', asyncHandler(async (req, res) => {
    await CartItem.deleteMany({ userId: req.user._id });
    res.status(204).end();
}));

export default router;