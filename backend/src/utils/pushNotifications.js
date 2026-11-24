import { Expo } from 'expo-server-sdk'
import User from '../models/userModel.js'

const expo = new Expo(
  process.env.EXPO_ACCESS_TOKEN ? { accessToken: process.env.EXPO_ACCESS_TOKEN } : undefined
)

export const sendPushToUser = async (userId, { title, body, data = {} }) => {
  const user = await User.findById(userId).select('expoPushTokens')
  const tokens = (user?.expoPushTokens ?? []).filter((token) => Expo.isExpoPushToken(token))
  if (tokens.length === 0) return

  const messages = tokens.map((to) => ({
    to,
    sound: 'default',
    title,
    body,
    data,
    channelId: 'orders',
    priority: 'high'
  }))

  for (const chunk of expo.chunkPushNotifications(messages)) {
    const tickets = await expo.sendPushNotificationsAsync(chunk)

    const dead = []
    tickets.forEach((ticket, index) => {
      if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
        dead.push(chunk[index].to)
      }
    })

    if (dead.length > 0) {
      await User.updateOne({ _id: userId }, { $pull: { expoPushTokens: { $in: dead } } })
    }
  }
}