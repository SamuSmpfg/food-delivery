import mongoose from 'mongoose';
import { addressSchema } from './addressModel.js';
import { paymentMethodSchema } from './paymentMethod.js';

const userSchema = new mongoose.Schema(
    {
        clerkId: { type: String, required: true, trim: true, unique: true },
        firstName: { type: String, trim: true, default: '' },
        lastName: { type: String, trim: true, default: '' },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true, default: '' },
        role: {
            type: String,
            enum: ['customer', 'chef', 'courier'],
            default: 'customer'
        },
        stripeCustomerId: { type: String, default: null },
        address: addressSchema,
        paymentMethods: [paymentMethodSchema],
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);