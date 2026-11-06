import mongoose from 'mongoose';

export const paymentMethodSchema = new mongoose.Schema(
    {
        stripePaymentMethodId: { type: String, required: true },
        brand: { type: String, required: true },
        last4: { type: String, required: true },
        expMonth: { type: Number, required: true },
        expYear: { type: Number, required: true }
    }
);

export default mongoose.model('PaymentMethod', paymentMethodSchema);