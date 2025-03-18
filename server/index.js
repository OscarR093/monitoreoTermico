import express from 'express'
import { PORT, JWT_SECRET } from './config.js'
import { UserRepository } from './user-repository.js'
import jwt from 'jsonwebtoken'
import http from 'http'
import cookieParser from 'cookie-parser'
import { wss } from './websocketServer.js'

const app = express()
app.use(express.json())
app.use(cookieParser())

const server = http.createServer(app)

// Integrar WebSocket con el servidor HTTP
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request)
  })
})

// Middleware para verificar el token
const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token

  if (!token) {
    return res.status(401).json({ message: 'No hay token proporcionado' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded // Almacena los datos del usuario en req.user
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' })
  }
}

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Hola server')
})

// Ruta de login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  try {
    const user = UserRepository.login({ username, password })
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '1h'
    })
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60
    }).json(user)
  } catch (error) {
    res.status(401).json({ message: error.message })
  }
})

// Ruta para obtener usuarios
app.get('/api/users', (req, res) => {
  const users = UserRepository.getUsers()
  res.json(users)
})

// Ruta de registro
app.post('/api/register', (req, res) => {
  const { username, password, email } = req.body
  console.log(req.body)
  try {
    const id = UserRepository.create({ username, password, email })
    res.json({ id })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Ruta para verificar el token
app.get('/api/auth/check', authenticateToken, (req, res) => {
  res.status(200).json({ user: req.user }) // Devuelve los datos del usuario decodificados del token
})

// Ruta de logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })
  res.json({ message: 'Sesión cerrada exitosamente' })
})

// Ruta protegida (ejemplo)
app.post('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Bienvenido ${req.user.username}, esta es una ruta protegida` })
})

// Iniciar el servidor HTTP con WebSocket integrado
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
