// user-model.js
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Es buena práctica que el email sea único
  fullName: { type: String, required: true },
  admin: { type: Boolean, default: false },
  // --- ✅ NUEVOS CAMPOS ---
  isSuperAdmin: { type: Boolean, default: false },
  cellPhone: {
    type: String,
    required: false, // No es obligatorio al crear
    default: '' // Valor por defecto
  },
  mustChangePassword: {
    type: Boolean,
    default: true // Por defecto, todos los usuarios nuevos deben cambiarla
  }
}, {
  timestamps: true
})

const User = mongoose.model('User', userSchema)

export default User
