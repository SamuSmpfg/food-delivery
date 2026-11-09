import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import { clerkMiddleware } from '@clerk/express'
import webhooksRoutes from './routes/webhooks.routes.js'
import userRoutes from './routes/user.routes.js'
import paymentRoutes from './routes/paymentMethods.routes.js'
import chefInvitationsRoutes from './routes/chefInvitations.routes.js'
import chefApplicationsRoutes from './routes/chefApplications.routes.js'
import chefOrders from './routes/chefOrders.routes.js';
import runningOrdersRoutes from './routes/runningOrders.routes.js'
import graphRoutes from './routes/graph.routes.js'
import routes from './routes/index.routes.js'

const app = express()

app.use('/api/webhooks', webhooksRoutes)

app.use(express.json())
app.use(clerkMiddleware())

app.use('/api/user', userRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', chefInvitationsRoutes)
app.use('/api/chef-applications', chefApplicationsRoutes)
app.use('/api/chef/orders', chefOrders);
app.use('/api/running-orders', runningOrdersRoutes)
app.use('/api/graph', graphRoutes)
app.use('/api', routes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error(err)
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' })
  }
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

const port = process.env.PORT || 3000

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI não está definida. Confira o arquivo .env')
  process.exit(1)
}

console.log('Conectando ao MongoDB...')

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log('MongoDB conectado')
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  })