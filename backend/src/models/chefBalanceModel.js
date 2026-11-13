import mongoose from 'mongoose'

const chefSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true, index: true },
    balance: { type: Number, required: true, default: 0, min: 0 },
    ordersCount: { type: Number, required: true, default: 0, min: 0 }
}, { timestamps: true })

export default mongoose.model('Chef', chefSchema)