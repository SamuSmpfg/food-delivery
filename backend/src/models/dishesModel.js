import mongoose from 'mongoose';
import { sizeSchema } from './sizeModel.js';
import { ingredientSchema } from './ingredientModel.js';

const dishSchema = new mongoose.Schema(
    {
        restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        image: { type: String, required: true, trim: true },
        category: { type: [String], required: true },
        classification: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
        deliveryMode: { type: String, enum: ['Delivery', 'Pickup', 'Dine-in'], required: true },
        sizes: [sizeSchema],
        ingredients: [ingredientSchema],
        avgPrepMinutes: { type: Number, required: true, default: 0 },
        available: { type: Boolean, required: true, default: true },
        rating: { type: Number, required: true, default: 0 },
        reviewsCount: { type: Number, required: true, default: 0 },
        orderCount: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);


export default mongoose.model('Dish', dishSchema);