import express, { Router } from 'express'
import { Webhook } from 'svix'
import User from '../models/userModel.js'

const router = Router()

router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) return res.status(500).json({ message: 'Webhook secret not configured' })

  let event
  try {
    event = new Webhook(secret).verify(req.body.toString(), {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature']
    })
  } catch {
    return res.status(400).json({ message: 'Invalid signature' })
  }

  try {
    const data = event.data

    if (event.type === 'user.created' || event.type === 'user.updated') {
      const primary =
        data.email_addresses?.find((item) => item.id === data.primary_email_address_id) ??
        data.email_addresses?.[0]
      const email = primary?.email_address
      if (!email) return res.status(200).json({ received: true })

      const firstName = data.first_name ?? ''
      const lastName = data.last_name ?? ''
      const name = `${firstName} ${lastName}`.trim() || email.split('@')[0]

      await User.findOneAndUpdate(
        { clerkId: data.id },
        { $set: { email, firstName, lastName, name } },
        { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
      )
    }

    if (event.type === 'user.deleted' && data.id) {
      await User.deleteOne({ clerkId: data.id })
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Webhook handling failed' })
  }
})

export default router