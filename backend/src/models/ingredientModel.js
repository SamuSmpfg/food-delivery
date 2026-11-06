import mongoose from 'mongoose';

export const ingredientSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        kind: { type: String, enum: ['Basic', 'Fruit'], required: true },
    }
);

export default mongoose.model('Ingredient', ingredientSchema);