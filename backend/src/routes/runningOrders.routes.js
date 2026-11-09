import express from 'express'
import RunningOrder from '../models/runningOrdersModel.js'

const router = express.Router()

// Lista os pedidos em andamento + quantos são (o "17" do título)
router.get('/', async (req, res) => {
    try {
        const orders = await RunningOrder
            .find({ status: 'RUNNING' })
            .sort({ createdAt: -1 })

        res.json({ count: orders.length, orders })
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar pedidos' })
    }
})

// Cria um pedido novo
router.post('/', async (req, res) => {
    try {
        const { foodType, name, image, orderId, price } = req.body
        const order = await RunningOrder.create({ foodType, name, image, orderId, price })

        res.status(201).json(order)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// Botão "Done": só funciona se o pedido ainda estiver em andamento
router.patch('/:id/done', async (req, res) => {
    try {
        const order = await RunningOrder.findOneAndUpdate(
            { _id: req.params.id, status: 'RUNNING' },
            { status: 'DONE' },
            { new: true }
        )

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado ou já finalizado' })
        }

        res.json(order)
    } catch (error) {
        res.status(400).json({ message: 'Id inválido' })
    }
})

// Botão "Cancel": mesma ideia
router.patch('/:id/cancel', async (req, res) => {
    try {
        const order = await RunningOrder.findOneAndUpdate(
            { _id: req.params.id, status: 'RUNNING' },
            { status: 'CANCELLED' },
            { new: true }
        )

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado ou já finalizado' })
        }

        res.json(order)
    } catch (error) {
        res.status(400).json({ message: 'Id inválido' })
    }
})

export default router