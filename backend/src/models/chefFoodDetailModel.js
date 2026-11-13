import mongoose from 'mongoose'
import { ingredientSchema } from './ingredientModel.js'
import { addressSchema } from './addressModel.js'

const chefFoodDetailSchema = new mongoose.Schema(
    {
        restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
        dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', unique: true, sparse: true },
        name: { type: String, maxLength: 100, trim: true, required: true },
        price: { type: Number, min: 0, required: true },
        image: { type: String, trim: true },
        classification: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], default: 'Breakfast' },
        deliveryMode: { type: String, enum: ['Delivery', 'Pickup', 'Dine-in'], default: 'Delivery' },
        address: addressSchema,
        rating: { type: Number, min: 0, max: 5, default: 0 },
        reviewsCount: { type: Number, min: 0, default: 0 },
        ingredients: [ingredientSchema],
        description: { type: String, maxLength: 500, trim: true }
    },
    { timestamps: true }
)

export default mongoose.model('FoodDetail', chefFoodDetailSchema)