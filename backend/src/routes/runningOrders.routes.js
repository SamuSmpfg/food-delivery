import express from 'express'
import RunningOrder from '../models/runningOrdersModel.js'

const router = express.Router()

const VALID_STATUS = ['PENDING', 'RUNNING', 'DONE', 'CANCELLED']

router.get('/', async (req, res) => {
    try {
        const status = (req.query.status || 'RUNNING').toUpperCase()

        if (!VALID_STATUS.includes(status)) {
            return res.status(400).json({ message: 'Status inválido' })
        }

        const orders = await RunningOrder
            .find({ status })
            .sort({ createdAt: -1 })

        res.json({ count: orders.length, orders })
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar pedidos' })
    }
})

router.post('/', async (req, res) => {
    try {
        const { foodType, name, image, orderId, price } = req.body
        const order = await RunningOrder.create({ foodType, name, image, orderId, price })

        res.status(201).json(order)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

const changeStatus = (from, to) => async (req, res) => {
    try {
        const order = await RunningOrder.findOneAndUpdate(
            { _id: req.params.id, status: from },
            { status: to },
            { new: true }
        )

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado ou já atualizado' })
        }

        res.json(order)
    } catch (error) {
        res.status(400).json({ message: 'Id inválido' })
    }
}

router.patch('/:id/accept', changeStatus('PENDING', 'RUNNING'))
router.patch('/:id/decline', changeStatus('PENDING', 'CANCELLED'))

router.patch('/:id/done', changeStatus('RUNNING', 'DONE'))
router.patch('/:id/cancel', changeStatus('RUNNING', 'CANCELLED'))

export default router