import mongoose from 'mongoose'

console.log('Node', process.version)
console.log('MONGODB_URI definida:', !!process.env.MONGODB_URI)
console.log('CLERK_SECRET_KEY definida:', !!process.env.CLERK_SECRET_KEY)
console.log('STRIPE_SECRET_KEY definida:', !!process.env.STRIPE_SECRET_KEY)

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI não está definida')
  process.exit(1)
}

try {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  console.log('MongoDB conectado com sucesso')
  await mongoose.disconnect()
  process.exit(0)
} catch (error) {
  console.error('Falha ao conectar no MongoDB:', error.message)
  process.exit(1)
}