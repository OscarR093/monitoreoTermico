import express from 'express'
import { PORT, JWT_SECRET } from './config.js'
import { UserRepository } from './user-repository.js'
import jwt from 'jsonwebtoken'
import http from 'http'
import cookieParser from 'cookie-parser'
import { wss } from './websocketServer.js'
import connectDB from './db/db.js'
import path from 'path'

const app = express()
app.use(express.json())
app.use(cookieParser())

// Servir archivos estáticos del frontend (carpeta dist)
const __dirname = path.resolve()
app.use(express.static(path.join(__dirname, 'dist')))

// Crear servidor HTTP para Express y WebSocket
const server = http.createServer(app)

// Configurar WebSocket
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request)
  })
})

// Conectar a la base de datos
connectDB().catch((err) => {
  console.error('No se pudo iniciar el servidor debido a un error en la DB:', err)
  process.exit(1)
})

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token
  if (!token) return res.status(401).json({ message: 'No hay token proporcionado' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' })
  }
}

// Rutas de la API REST
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign(
      { id: user.id, username: user.username, fullName: user.fullName, admin: user.admin },
      JWT_SECRET,
      { expiresIn: '1h' }
    )
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS en producción
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60
    }).json(user)
  } catch (error) {
    res.status(401).json({ message: error.message })
  }
})

app.get('/api/users', authenticateToken, async (req, res) => {
  const users = await UserRepository.getUsers()
  res.json(users)
})

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await UserRepository.getUserById(req.params.id)
    res.json(user)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
})

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { username, email, fullName, admin, password } = req.body
    if (req.user.id !== req.params.id && !req.user.admin) {
      return res.status(403).json({ message: 'Acceso denegado' })
    }
    const updatedUser = await UserRepository.updateUserById(req.params.id, {
      username,
      email,
      fullName,
      admin,
      password
    })
    res.json(updatedUser)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && !req.user.admin) {
      return res.status(403).json({ message: 'Acceso denegado' })
    }
    await UserRepository.deleteUserById(req.params.id)
    res.json({ message: 'Usuario eliminado correctamente' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

app.post('/api/register', async (req, res) => {
  const { username, password, email, fullName, admin } = req.body
  try {
    const id = await UserRepository.create({ username, password, email, fullName, admin })
    res.json({ id })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

app.get('/api/auth/check', authenticateToken, (req, res) => {
  res.status(200).json({ user: req.user })
})

app.post('/api/logout', (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })
  res.json({ message: 'Sesión cerrada exitosamente' })
})

app.post('/protected', authenticateToken, (req, res) => {
  const message = req.user.admin
    ? `Bienvenido administrador ${req.user.fullName}, esta es una ruta protegida`
    : `Bienvenido ${req.user.fullName}, esta es una ruta protegida`
  res.json({ message })
})

app.get('/api/env', (req, res) => {
  const env = {
    APP_ENV: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    WS_HOST: process.env.NODE_ENV === 'production' ? req.headers.host : 'localhost:8080'
  }
  res.json(env)
})

// Ruta catch-all para el frontend (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// Iniciar el servidor en el puerto asignado por Render
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log('WebSocket listo para conexiones en wss://', server.address())
})
