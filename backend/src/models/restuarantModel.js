import mongoose from 'mongoose';
import { addressSchema } from './addressModel.js';

const restaurantSchema = new mongoose.Schema(
    {
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        image: { type: String, required: true, trim: true },
        address: addressSchema,
        specialty: { type: [String], required: true },
        category: { type: [String], required: true },
        deliveryFee: { type: Number, required: true, default: 0 },
        rating: { type: Number, required: true, default: 0 },
        averageDeliveryTime: { type: Number, required: true, default: 0 },
        reviewsCount: { type: Number, required: true, default: 0 },
        isOpen: { type: Boolean, required: true, default: true },
    },
    { timestamps: true }
);

export default mongoose.model('Restaurant', restaurantSchema);