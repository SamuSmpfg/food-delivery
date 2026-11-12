import { Router } from 'express'
import { clerkClient, getAuth } from '@clerk/express'
import User from '../models/userModel.js'
import { asyncHandler, requireUser } from '../middleware/auth.js'

const router = Router()

const ALLOWED_ROLES = ['customer', 'chef', 'courier']

const buildName = (firstName, lastName, email) =>
  `${firstName} ${lastName}`.trim() || email.split('@')[0]

router.post('/sync', asyncHandler(async (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })

  const clerkUser = await clerkClient.users.getUser(userId)
  const primary =
    clerkUser.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId) ??
    clerkUser.emailAddresses[0]
  const email = primary?.emailAddress
  if (!email) return res.status(400).json({ message: 'Email not found' })

  const firstName = clerkUser.firstName ?? ''
  const lastName = clerkUser.lastName ?? ''
  const name = buildName(firstName, lastName, email)


  const clerkRole = clerkUser.publicMetadata?.role
  const role = ALLOWED_ROLES.includes(clerkRole) ? clerkRole : 'customer'

  const existing = await User.exists({ clerkId: userId })

  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    { $set: { email, firstName, lastName, name, role } },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  )

  res.status(existing ? 200 : 201).json({ user, isNewUser: !existing })
}))

router.get('/account', requireUser, asyncHandler(async (req, res) => {
  res.json(req.user)
}))

router.put('/account', requireUser, asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body

  if (firstName !== undefined) req.user.firstName = firstName
  if (lastName !== undefined) req.user.lastName = lastName
  if (phone !== undefined) req.user.phone = String(phone)
  req.user.name = buildName(req.user.firstName, req.user.lastName, req.user.email)

  await req.user.save()
  res.json(req.user)
}))

router.put('/account/location', requireUser, asyncHandler(async (req, res) => {
  const { lat, lng, label, street, number, apartment, postCode, city, state } = req.body

  const latitude = Number(lat)
  const longitude = Number(lng)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(400).json({ message: 'lat and lng are required' })
  }

  const current = req.user.address ? req.user.address.toObject() : {}
  const incoming = { label, street, number, apartment, postCode, city, state }
  const cleaned = Object.fromEntries(
    Object.entries(incoming).filter(([, value]) => value !== undefined)
  )

  req.user.address = {
    ...current,
    ...cleaned,
    location: { lat: latitude, lng: longitude }
  }

  await req.user.save()
  res.json(req.user)
}))

export default router