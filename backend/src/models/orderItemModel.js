import mongoose from 'mongoose';

export const orderItemSchema = new mongoose.Schema(
    {
        dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
        name: { type: String, required: true, trim: true },
        size: { type: String, required: true, trim: true },
        unitPrice: { type: Number, required: true, default: 0 },
        quantity: { type: Number, required: true, default: 1, min: 1 },
    }
);

export default mongoose.model('OrderItem', orderItemSchema);