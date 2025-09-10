import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from './config.js'
import User from './models/user-model.js'

export class UserRepository {
  static async create ({ username, password, email, fullName, admin = false, isSuperAdmin = false, cellPhone, mustChangePassword }) {
    Validation.username(username)
    Validation.password(password)
    Validation.email(email)
    Validation.fullName(fullName)

    const existingUser = await User.findOne({ username })
    if (existingUser) throw new Error(`${username} already exists`)

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      fullName,
      admin,
      isSuperAdmin,
      cellPhone,
      mustChangePassword
    })
    const savedUser = await newUser.save()

    return savedUser._id.toString()
  }

  static async login ({ username, password }) {
    Validation.username(username)
    Validation.password(password)

    const user = await User.findOne({ username })
    if (!user) throw new Error('Username does not exist')

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error('Password is invalid')

    return {
      id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      admin: user.admin,
      isSuperAdmin: user.isSuperAdmin || false,
      mustChangePassword: user.mustChangePassword || false,
      email: user.email,
      cellPhone: user.cellPhone
    }
  }

  static async getUsers () {
    const users = await User.find({}, '-password')
    return users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      admin: user.admin
    }))
  }

  static async getUserById (id) {
    const user = await User.findById(id, '-password')
    if (!user) throw new Error('User not found')

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      admin: user.admin
    }
  }

  static async updateUserById (id, updateFields) {
    const { username, email, fullName, admin, password, cellPhone, mustChangePassword } = updateFields

    // Validaciones
    if (username) Validation.username(username)
    if (email) Validation.email(email)
    if (fullName) Validation.fullName(fullName)
    if (admin !== undefined && typeof admin !== 'boolean') {
      throw new Error('Admin must be a boolean')
    }
    if (password) Validation.password(password)
    if (mustChangePassword !== undefined && typeof mustChangePassword !== 'boolean') {
      throw new Error('mustChangePassword must be a boolean')
    }

    // Verificar si el username o email ya existen
    if (username || email) {
      const query = {
        _id: { $ne: id },
        $or: []
      }

      if (username) query.$or.push({ username })
      if (email) query.$or.push({ email })

      const existingUser = await User.findOne(query)
      if (existingUser) {
        // Error genérico para no revelar si fue el email o username
        const error = new Error('Credenciales no disponibles')
        error.status = 409 // Conflict
        throw error
      }
    }

    const updateData = {}
    if (username) updateData.username = username
    if (email) updateData.email = email
    if (fullName) updateData.fullName = fullName
    if (admin !== undefined) updateData.admin = admin
    if (cellPhone) updateData.cellPhone = cellPhone
    if (mustChangePassword !== undefined) updateData.mustChangePassword = mustChangePassword
    if (password) updateData.password = await bcrypt.hash(password, SALT_ROUNDS)

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true, select: '-password' }
    )

    if (!updatedUser) throw new Error('User not found')

    return {
      id: updatedUser._id.toString(),
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      admin: updatedUser.admin
    }
  }

  static async deleteUserById (id) {
    const deletedUser = await User.findByIdAndDelete(id)
    if (!deletedUser) throw new Error('User not found')
    return { id: deletedUser._id.toString() }
  }
}

class Validation {
  static username (username) {
    if (typeof username !== 'string') throw new Error('Username must be a String')
    if (username.length < 3) throw new Error('Username must be at least 3 characters long')
  }

  static password (password) {
    if (typeof password !== 'string') throw new Error('Password must be a String')
    if (password.length < 3) throw new Error('Password must be at least 3 characters long')
  }

  static email (email) {
    if (typeof email !== 'string') throw new Error('Email must be a String')
    if (!this.validateEmail(email)) throw new Error('Invalid email format')
  }

  static fullName (fullName) {
    if (typeof fullName !== 'string') throw new Error('FullName must be a String')
    if (fullName.length < 2) throw new Error('FullName must be at least 2 characters long')
  }

  static validateEmail (email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
}
