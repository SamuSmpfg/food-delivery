import Stripe from 'stripe';
import Order from '../models/orderModel.js';

let stripeClient = null;
const getStripe = () => {
    if (!stripeClient) stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
    return stripeClient;
};

export const verifyPaymentIntent = async (paymentIntentId, total) => {
    try {
        const intent = await getStripe().paymentIntents.retrieve(paymentIntentId);

        if (intent.status !== 'succeeded') {
            return { ok: false, message: 'Payment has not been completed' };
        }
        if (intent.amount_received !== Math.round(total * 100)) {
            return { ok: false, message: 'Payment amount does not match the order total' };
        }
        return { ok: true };
    } catch (error) {
        console.error('VERIFY PAYMENT ERROR:', error.message);
        return { ok: false, message: 'Could not verify the payment' };
    }
};

export const refundOrderIfPaid = async (order) => {
    const paymentIntentId = order.payment?.stripePaymentIntentId;
    if (order.payment?.status !== 'paid' || !paymentIntentId) return false;

    try {
        const refund = await getStripe().refunds.create(
            { payment_intent: paymentIntentId },
            { idempotencyKey: `refund-order-${order._id}` }
        );

        await Order.updateOne(
            { _id: order._id },
            { $set: { 'payment.status': 'refunded', 'payment.refundId': refund.id } }
        );

        order.payment.status = 'refunded';
        order.payment.refundId = refund.id;
        return true;
    } catch (error) {
        console.error('REFUND ERROR for order', String(order._id), error.message);
        return false;
    }
};