import mongoose from 'mongoose';

export const INGREDIENT_KINDS = ['Basic', 'Fruit'];

export const ingredientSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        kind: { type: String, enum: INGREDIENT_KINDS, required: true, default: 'Basic' },
        allergy: { type: Boolean, default: false },
    }
);

export default mongoose.model('Ingredient', ingredientSchema);