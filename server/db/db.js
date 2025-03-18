import mongoose from 'mongoose'
import { MONGODB_URI } from '../config.js'

async function connectDB () {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Conectado a MongoDB con Mongoose')
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error)
    throw error
  }
}

export default connectDB
