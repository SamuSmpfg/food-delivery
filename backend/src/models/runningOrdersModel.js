import mongoose from 'mongoose'

const runningOrderSchema = new mongoose.Schema(
    {
        foodType: {
            type: String,
            enum: ["BREAKFAST", "LUNCH", "DINNER"],
            required: true
        },
        name: { type: String, required: true, trim: true },
        image: { type: String, default: null },
        orderId: { type: String, required: true, unique: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["RUNNING", "DONE", "CANCELLED"],
            default: "RUNNING",
            index: true
        }
    },
    { timestamps: true }
)

export default mongoose.model('RunningOrder', runningOrderSchema);