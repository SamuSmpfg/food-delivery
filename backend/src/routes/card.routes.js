import { Router } from 'express'
import mongoose from 'mongoose'
import User from '../models/userModel.js'
import { requireUser } from '../middleware/auth.js'

const router = Router()
router.use(requireUser)

router.get('/', (req, res) => {
  res.json(req.user.savedCards ?? [])
})

router.post('/', async (req, res) => {
  try {
    const brand = req.body?.brand
    const holder = String(req.body?.holder ?? '').trim()
    const last4 = String(req.body?.last4 ?? '')

    if (!['visa', 'mastercard'].includes(brand) || !holder || !/^\d{4}$/.test(last4)) {
      return res.status(400).json({ message: 'Invalid card data' })
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        savedCards: { $not: { $elemMatch: { brand, last4 } } }
      },
      { $push: { savedCards: { brand, holder, last4 } } },
      { new: true, runValidators: true }
    )

    if (!user) {
      return res.status(409).json({ message: 'This card has already been added' })
    }

    res.status(201).json(user.savedCards[user.savedCards.length - 1])
  } catch (error) {
    console.error('CREATE CARD ERROR:', error)
    res.status(500).json({ message: 'Could not save the card' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid card id' })
    }
    await User.updateOne({ _id: req.user._id }, { $pull: { savedCards: { _id: req.params.id } } })
    res.status(204).end()
  } catch (error) {
    console.error('DELETE CARD ERROR:', error)
    res.status(500).json({ message: 'Could not remove the card' })
  }
})

export default router