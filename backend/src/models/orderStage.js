import mongoose from 'mongoose';

export const orderStageSchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ['pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'],
            required: true
        },
        at: { type: Date, default: Date.now },
    },
    { _id: false }
);

export default mongoose.model('OrderStage', orderStageSchema);