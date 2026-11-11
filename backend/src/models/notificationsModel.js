import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        rating: { type: Number, min: 1, max: 5 },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);