import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
        title: { type: String, required: true, trim: true, maxlength: 50 },
        at: { type: Date, default: Date.now },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            validate: { validator: Number.isInteger, message: 'rating must be an integer' }
        },
        description: { type: String, trim: true, maxlength: 500, default: '' },
    },
    { timestamps: true }
);

reviewSchema.index({ restaurantId: 1, createdAt: -1 });
reviewSchema.index({ dishId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, orderId: 1, dishId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);