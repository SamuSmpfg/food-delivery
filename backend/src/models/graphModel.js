import mongoose from 'mongoose'

const pointSchema = new mongoose.Schema(
    {
        time: { type: Date, required: true },
        revenue: { type: Number, required: true, min: 0 }
    },
    { _id: false }
)

const graphSchema = new mongoose.Schema(
    {
        period: {
            type: String,
            enum: ["DAILY", "WEEKLY", "MONTHLY"],
            required: true
        },
        date: { type: Date, required: true },
        points: { type: [pointSchema], default: [] }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

graphSchema.virtual('totalRevenue').get(function () {
    return this.points.reduce((sum, p) => sum + p.revenue, 0)
})

graphSchema.index({ period: 1, date: 1 }, { unique: true })

export default mongoose.model('Graph', graphSchema);