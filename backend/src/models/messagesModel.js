import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        body: { type: String, required: true, trim: true },
        readAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export default mongoose.model('Message', messageSchema);