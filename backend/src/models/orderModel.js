import mongoose from 'mongoose';
import { orderItemSchema } from './orderItemModel.js';
import { orderStageSchema } from './orderStage.js';
import { addressSchema } from './addressModel.js';

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        courierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        items: { type: [orderItemSchema], required: true },
        stages: [orderStageSchema],
        status: {
            type: String,
            enum: ['pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'],
            default: 'pending'
        },
        subTotal: { type: Number, required: true },
        deliveryFee: { type: Number, required: true },
        total: { type: Number, required: true },
        deliveryAddress: addressSchema,
        payment: {
            stripePaymentIntentId: { type: String, default: null },
            status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }
        },
        estimatedMinutes: { type: Number, required: true },
    },
    { timestamps: true }
);

export default mongoose.model('Order', orderSchema);