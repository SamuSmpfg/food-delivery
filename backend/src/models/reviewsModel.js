import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, required: true, trim: true, maxlength: 100 },
        description: { type: String, required: true, trim: true, maxlength: 500 },
    },
    { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);