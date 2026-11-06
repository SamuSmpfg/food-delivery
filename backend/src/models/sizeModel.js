import mongoose from 'mongoose';

export const sizeSchema = new mongoose.Schema(
    {
        label: { type: String, required: true, trim: true },
        price: { type: Number, required: true, default: 0 },
    }
);

export default mongoose.model('Size', sizeSchema);