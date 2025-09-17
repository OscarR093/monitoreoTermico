import express from 'express'
import { PORT, JWT_SECRET } from './config.js'
// import { API_KEY_SECRET } from './config.js'
import { UserRepository } from './user-repository.js'
import jwt from 'jsonwebtoken'
import http from 'http'
import cookieParser from 'cookie-parser'
import { wss } from './websocketServer.js'
import connectDB from './db/db.js'
import path from 'path'
import { getHistoryModel } from './models/thermocouple-history.js'
import User from './models/user-model.js'

// --- CAPTURA GLOBAL DE ERRORES ---
process.on('uncaughtException', (err, origin) => {
  console.error('<<<<< UNCAUGHT EXCEPTION >>>>>')
  console.error(`Caught exception: ${err}\n` + `Exception origin: ${origin}`)
  console.error('Stack:', err.stack)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('<<<<< UNHANDLED REJECTION >>>>>')
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// import { Types } from 'mongoose'

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
  // 1. Extraemos las cookies de la petición de upgrade.
  const cookies = request.headers.cookie
  let token = null

  if (cookies) {
    // Buscamos nuestra cookie 'access_token'
    const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('access_token='))
    if (tokenCookie) {
      token = tokenCookie.split('=')[1]
    }
  }

  // 2. Si no hay token, rechazamos la conexión.
  if (!token) {
    console.log('Intento de conexión WebSocket sin token. Rechazado.')
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
    return
  }

  // 3. Verificamos el token JWT.
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // Si el token es inválido, rechazamos la conexión.
      console.log('Intento de conexión WebSocket con token inválido. Rechazado.')
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    // 4. Si el token es válido, procedemos a establecer la conexión WebSocket.
    //    Guardamos los datos del usuario en la petición para poder usarlos después.
    request.user = decoded

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  })
})

// --- AÑADE ESTA FUNCIÓN COMPLETA ---
const createSuperUserOnStartup = async () => {
  try {
    const userCount = await User.countDocuments()
    if (userCount > 0) {
      console.log('La base de datos ya tiene usuarios. No se creará el super usuario.')
      return
    }
    const username = process.env.SUPER_USER_USERNAME // || 'suSuperUserperadmin'
    const password = process.env.SUPER_USER_PASSWORD // || 'superadmin123'
    if (!username || !password) {
      console.log('Variables de entorno para super usuario no definidas. Omitiendo creación.')
      return
    }
    console.log('No se encontraron usuarios. Creando super usuario...')
    await UserRepository.create({
      username,
      password,
      fullName: 'Administrador del Sistema',
      email: 'admin@sistema.com',
      admin: true,
      isSuperAdmin: true,
      cellPhone: '0000000000',
      mustChangePassword: true
    })
    console.log('✅ ¡Super usuario creado exitosamente!')
  } catch (error) {
    console.error('❌ Error al crear el super usuario:', error.message)
  }
}
// Conectar a la base de datos
connectDB()
  .then(async () => {
    // Una vez que la conexión es exitosa, ejecuta la función de verificación
    await createSuperUserOnStartup()
  })
  .catch((err) => {
    console.error('No se pudo iniciar el servidor debido a un error en la DB:', err)
    process.exit(1)
  })

// Middleware de autenticación con JWT (para el frontend)
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

// --- ✅ NUEVO MIDDLEWARE PARA VERIFICAR ROL DE ADMIN ---
const authorizeAdmin = (req, res, next) => {
  // Se asume que authenticateToken ya se ejecutó y pobló req.user
  if (!req.user || !req.user.admin) {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' })
  }
  next()
}

const authorizeSuperUser = (req, res, next) => {
  // Se asume que authenticateToken ya se ejecutó
  if (!req.user || !req.user.isSuperAdmin) {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Super Usuario.' })
  }
  next()
}
// Middleware de autenticación con API Key (para la app de escritorio)
/*
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  if (!apiKey || apiKey !== API_KEY_SECRET) {
    return res.status(401).json({ message: 'API Key inválida o no proporcionada' })
  }
  next()
}
*/
// Rutas de la API REST
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await UserRepository.login({ username, password })

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        admin: user.admin,
        isSuperAdmin: user.isSuperAdmin,
        mustChangePassword: user.mustChangePassword
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

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
    if (req.user.id !== req.params.id && !req.user.admin) {
      return res.status(403).json({ message: 'Acceso denegado' })
    }

    // Si hay una contraseña nueva, forzamos mustChangePassword a false
    if (req.body.password) {
      req.body.mustChangePassword = false
    }

    const updatedUser = await UserRepository.updateUserById(req.params.id, req.body)
    res.json(updatedUser)
  } catch (error) {
    // Manejo de errores específicos
    const status = error.status || 400
    const message = status === 409
      ? 'El correo electrónico o nombre de usuario no está disponible'
      : error.message || 'Error al actualizar el usuario'

    res.status(status).json({ message })
  }
})

app.delete('/api/users/:id', authenticateToken, async (req, res, next) => {
  try {
    const userIdToDelete = req.params.id
    const requestingUser = req.user // El usuario que hace la petición

    // 1. Obtenemos el usuario que se va a eliminar ANTES de cualquier otra lógica.
    const userToDelete = await UserRepository.getUserById(userIdToDelete)
    if (!userToDelete) {
      return res.status(404).json({ message: 'Usuario no encontrado.' })
    }

    // --- ✅ NUEVA REGLA DE SEGURIDAD ---
    // 2. Nadie, ni siquiera él mismo, puede eliminar al Super Usuario.
    if (userToDelete.isSuperAdmin) {
      return res.status(403).json({ message: 'El Super Usuario no puede ser eliminado.' })
    }

    // 3. Caso de auto-eliminación (ahora es seguro porque ya sabemos que no es el Super Admin).
    if (requestingUser.id === userIdToDelete) {
      await UserRepository.deleteUserById(userIdToDelete)

      res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })

      return res.json({ message: 'Tu cuenta ha sido eliminada correctamente.' })
    }

    // 4. Lógica para que un admin/super-admin elimine a OTRO usuario.

    // 4.1. Si el objetivo es un admin (pero no super-admin)...
    if (userToDelete.admin) {
      // ...solo un superusuario puede eliminarlo.
      return authorizeSuperUser(req, res, async () => {
        await UserRepository.deleteUserById(userIdToDelete)
        res.json({ message: 'Administrador eliminado correctamente.' })
      })
    }

    // 4.2. Si el objetivo es un usuario normal...
    if (!requestingUser.admin) {
      return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador para eliminar a otros usuarios.' })
    }

    await UserRepository.deleteUserById(userIdToDelete)
    res.json({ message: 'Usuario eliminado correctamente.' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

app.post('/api/register', authenticateToken, authorizeAdmin, async (req, res) => {
  // 1. El admin solo envía el nombre de usuario y una contraseña temporal.
  const { username, password } = req.body

  // Verificación básica de que los datos mínimos están presentes
  if (!username || !password) {
    return res.status(400).json({ message: 'Se requiere nombre de usuario y contraseña.' })
  }

  try {
    // 2. Llenamos los campos requeridos por el modelo con datos de ejemplo (placeholders).
    //    El email debe ser único, por lo que lo basamos en el username.
    const placeholderData = {
      fullName: 'Usuario Pendiente de Actualización',
      email: `${username.toLowerCase()}@example.local`,
      cellPhone: '0000000000'
    }

    // 3. Creamos el usuario en la base de datos.
    //    - 'admin' será 'false' por defecto.
    //    - 'mustChangePassword' será 'true' por defecto gracias al modelo.
    const id = await UserRepository.create({
      username,
      password,
      fullName: placeholderData.fullName,
      email: placeholderData.email,
      cellPhone: placeholderData.cellPhone
    })

    // 4. Respondemos con éxito.
    res.status(201).json({ id })
  } catch (error) {
    // Manejo de errores, como un username duplicado.
    res.status(400).json({ message: error.message })
  }
})

app.get('/api/auth/check', authenticateToken, (req, res) => {
  console.log('Usuario autenticado:', req.user)
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

app.post('/protected', authenticateToken, authorizeAdmin, (req, res) => {
  const message = req.user.admin
    ? `Bienvenido administrador ${req.user.fullName}, esta es una ruta protegida`
    : `Bienvenido ${req.user.fullName}, esta es una ruta protegida`
  res.json({ message })
})

app.get('/api/env', (req, res) => {
  res.json({
    // Si NODE_ENV no está definida, asumimos 'development'
    APP_ENV: process.env.NODE_ENV || 'development',
    // Si DOMAIN_URL no está definida, usamos 'localhost:3000'
    WS_HOST: process.env.DOMAIN_URL || 'localhost:3000'
  })
})

// Endpoint GET para obtener el historial (protegido con JWT para el frontend)
app.get('/api/thermocouple-history/:nombre', authenticateToken, async (req, res) => {
  const nombreEquipo = req.params.nombre

  try {
    // 1. Obtenemos el modelo dinámico para el equipo solicitado
    const HistoryModel = getHistoryModel(nombreEquipo)

    // 2. Calculamos la fecha de hace 24 horas
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    // 3. Consulta filtrada por las últimas 24 horas
    const historyData = await HistoryModel.find({
      timestamp: { $gte: twentyFourHoursAgo } // Solo registros de las últimas 24 horas
    })
      .sort({ timestamp: -1 }) // Ordena por fecha, los más nuevos primero
      .select('temperatura timestamp -_id') // Selecciona solo los campos que necesitas

    if (historyData.length === 0) {
      return res.status(404).json({ message: 'No se encontraron registros para este equipo en las últimas 24 horas' })
    }

    res.status(200).json(historyData)
  } catch (error) {
    console.error('Error al obtener el historial:', error)
    res.status(500).json({ message: 'Error interno del servidor al obtener el historial' })
  }
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
