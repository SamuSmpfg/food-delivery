import express from 'express'
import Order from '../models/orderModel.js'
import Restaurant from '../models/restuarantModel.js'
import { requireUser } from '../middleware/auth.js'

const router = express.Router()

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const CARD_CREDITED = ['accepted', 'preparing', 'ready', 'delivering', 'delivered']

function partsInTz(date, tz) {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  return Object.fromEntries(f.formatToParts(date).map((p) => [p.type, p.value]))
}

function tzOffsetMs(date, tz) {
  const p = partsInTz(date, tz)
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second)
  return asUTC - Math.floor(date.getTime() / 1000) * 1000
}

function startOfDayInTz(date, tz) {
  const p = partsInTz(date, tz)
  const guess = Date.UTC(+p.year, +p.month - 1, +p.day)
  return new Date(guess - tzOffsetMs(new Date(guess), tz))
}

const stageTime = (order, status) =>
  order.stages?.find((s) => s.status === status)?.at ?? null

// Quando o dinheiro "entrou"? Retorna null se ainda não contou.
function creditedAt(order) {
  if (order.status === 'cancelled') return null

  const isCard = Boolean(order.payment?.stripePaymentIntentId)

  if (isCard) {
    if (!CARD_CREDITED.includes(order.status)) return null
    return stageTime(order, 'accepted') ?? order.updatedAt
  }

  if (order.status !== 'delivered') return null
  return stageTime(order, 'delivered') ?? order.updatedAt
}

router.get('/', requireUser, async (req, res) => {
  try {
    const period = String(req.query.period || 'DAILY').toUpperCase()
    if (!['DAILY', 'WEEKLY'].includes(period)) {
      return res.status(400).json({ message: 'Período inválido' })
    }

    const tz = String(req.query.tz || 'UTC')
    try { new Intl.DateTimeFormat('en', { timeZone: tz }) }
    catch { return res.status(400).json({ message: 'Fuso horário inválido' }) }

    // todos os restaurantes do chef (e não só o primeiro)
    const restaurants = await Restaurant.find({ ownerId: req.user._id }).select('_id name')

    if (!restaurants.length) {
      return res.json({ period, date: null, totalRevenue: 0, points: [] })
    }

    const restaurantIds = restaurants.map((r) => r._id)

    const now = new Date()
    const todayStart = startOfDayInTz(now, tz)

    // as "gavetinhas"
    let rangeStart, bucketMs, bucketCount
    if (period === 'DAILY') {
      rangeStart = todayStart
      bucketMs = HOUR
      bucketCount = Math.max(Math.floor((now - todayStart) / HOUR) + 1, 2)
    } else {
      rangeStart = new Date(todayStart.getTime() - 6 * DAY)
      bucketMs = DAY
      bucketCount = 7
    }

    const orders = await Order.find({
      restaurantId: { $in: restaurantIds },
      status: { $ne: 'cancelled' },
      updatedAt: { $gte: rangeStart },
    }).lean()

    const buckets = Array.from({ length: bucketCount }, (_, i) => ({
      time: new Date(rangeStart.getTime() + i * bucketMs).toISOString(),
      revenue: 0,
    }))

    for (const order of orders) {
      const at = creditedAt(order)
      if (!at) continue
      const idx = Math.floor((new Date(at) - rangeStart) / bucketMs)
      if (idx < 0 || idx >= bucketCount) continue
      buckets[idx].revenue += order.total ?? 0
    }

    const points = buckets.map((b) => ({ ...b, revenue: Math.round(b.revenue * 100) / 100 }))
    const totalRevenue = points.reduce((sum, p) => sum + p.revenue, 0)

    res.json({ period, date: rangeStart.toISOString(), totalRevenue, points })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erro ao buscar gráfico' })
  }
})

export default router