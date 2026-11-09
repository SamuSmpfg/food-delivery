import mongoose from 'mongoose'

const pointSchema = new mongoose.Schema(
    {
        // início do intervalo (ex.: 2026-11-09T10:00 para "10AM"); o front formata o rótulo
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
        // dia/semana/mês de referência
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