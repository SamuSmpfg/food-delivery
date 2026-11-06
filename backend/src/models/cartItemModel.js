import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
        sizeId: { type: mongoose.Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 }
    }
);

cartItemSchema.index({ userId: 1, dishId: 1, sizeId: 1 }, { unique: true });

export default mongoose.model('CartItem', cartItemSchema);