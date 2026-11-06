import mongoose from 'mongoose';

export const addressSchema = new mongoose.Schema(
    {
        label: { type: String, enum: ['home', 'work', 'other'] },
        street: { type: String, trim: true },
        number: { type: String, trim: true },
        apartment: { type: String, trim: true },
        postCode: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        location: {
            lat: { type: Number },
            lng: { type: Number }
        }
    }
);

export default mongoose.model('Address', addressSchema);