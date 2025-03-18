import DBLocal from 'db-local'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from './config.js'

const { Schema } = new DBLocal({ path: './db' })

const User = Schema('User', {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true } // Nuevo campo de correo electrónico
})

export class UserRepository {
  static create ({ username, password, email }) {
    Validation.username(username)
    Validation.password(password)
    Validation.email(email)
    const existingUser = User.findOne({ username })
    if (existingUser) throw new Error(`${username} already exists`)
    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS)
    const id = crypto.randomUUID()
    User.create({
      _id: id,
      username,
      password: hashedPassword,
      email
    }).save()

    return id
  }

  static login ({ username, password }) {
    Validation.username(username)
    Validation.password(password)
    const user = User.findOne({ username })
    if (!user) throw new Error('Username does not exist')
    const isValid = bcrypt.compareSync(password, user.password)
    if (!isValid) throw new Error('password is invalid')
    return {
      id: user._id,
      username: user.username
    }
  }

  static getUsers () {
    const users = User.find({})
    return users
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

  static validateEmail (email) {
    // Expresión regular básica para validar el formato del correo electrónico
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
}
