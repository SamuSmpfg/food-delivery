import express from 'express'
import Graph from '../models/graphModel.js'

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const period = (req.query.period || 'DAILY').toUpperCase()

        if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(period)) {
            return res.status(400).json({ message: 'Período inválido' })
        }

        const filter = { period }

        if (req.query.date) {
            const date = new Date(req.query.date)

            if (Number.isNaN(date.getTime())) {
                return res.status(400).json({ message: 'Data inválida' })
            }

            date.setHours(0, 0, 0, 0)
            filter.date = date
        }

        const graph = await Graph.findOne(filter).sort({ date: -1 })

        if (!graph) {
            return res.json({ period, date: null, totalRevenue: 0, points: [] })
        }

        res.json({
            period: graph.period,
            date: graph.date,
            totalRevenue: graph.totalRevenue,
            points: graph.points
        })
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar gráfico' })
    }
})

export default router