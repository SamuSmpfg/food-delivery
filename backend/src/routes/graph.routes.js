import express from 'express'
import Graph from '../models/graphModel.js'

const router = express.Router()

// Devolve os pontos do gráfico e o total
// Exemplo: GET /api/graph?period=DAILY&date=2026-11-09
router.get('/', async (req, res) => {
    try {
        const period = (req.query.period || 'DAILY').toUpperCase()

        if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(period)) {
            return res.status(400).json({ message: 'Período inválido' })
        }

        // se não mandar data, usa o início de hoje
        const date = req.query.date ? new Date(req.query.date) : new Date()
        date.setHours(0, 0, 0, 0)

        const graph = await Graph.findOne({ period, date })

        if (!graph) {
            return res.json({ period, date, totalRevenue: 0, points: [] })
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