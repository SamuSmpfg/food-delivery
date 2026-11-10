import express, { Router } from 'express'
import { Webhook } from 'svix'
import User from '../models/userModel.js'

const router = Router()

const VALID_ROLES = ['customer', 'chef', 'courier']

router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const headers = {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    }

    const rawBody = req.body.toString()

    try {
      new Webhook(process.env.CLERK_WEBHOOK_SECRET).verify(rawBody, headers)
    } catch {
      return res.status(400).json({ message: 'Invalid signature' })
    }

    const { type, data } = JSON.parse(rawBody)

    if (type === 'user.created' || type === 'user.updated') {
      const email = data.email_addresses?.find(
        (item) => item.id === data.primary_email_address_id
      )?.email_address

      if (!email) return res.status(200).json({ received: true })

      const firstName = data.first_name || ''
      const lastName = data.last_name || ''
      const name = `${firstName} ${lastName}`.trim() || email.split('@')[0]

      const metadataRole = data.public_metadata?.role
      const hasValidRole = VALID_ROLES.includes(metadataRole)

      const update = {
        $set: { clerkId: data.id, email, firstName, lastName, name },
      }

      if (hasValidRole) {
        update.$set.role = metadataRole
      } else {
        update.$setOnInsert = { role: 'customer' }
      }

      await User.findOneAndUpdate({ clerkId: data.id }, update, { upsert: true, new: true })
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Clerk webhook error:', error)
    return res.status(500).json({ message: 'Webhook handling failed' })
  }
})

export default router