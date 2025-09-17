// src/components/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from './services/api'
import logo from './assets/logo.png' // Asegúrate que la ruta al logo es correcta

// --- Iconos SVG para el campo de contraseña ---
const EyeIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' />
    <circle cx='12' cy='12' r='3' />
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M9.88 9.88a3 3 0 1 0 4.24 4.24' />
    <path d='M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' />
    <path d='M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' />
    <line x1='2' x2='22' y1='2' y2='22' />
  </svg>
)

function Login ({ setIsAuthenticated, setUser }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/login', { username, password })
      setUser(response.user || response)
      setIsAuthenticated(true)
      navigate('/')
    } catch (err) {
      console.error('Login failed:', err.response?.status, err.response?.data)
      setError('Usuario o contraseña incorrectos. Por favor, intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 font-sans'>
      <div className='w-full max-w-sm p-8 space-y-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700'>
        <img src={logo} alt='Logo Fagor' className='w-60 mx-auto filter brightness-110' />

        <h2 className='text-2xl font-bold text-center text-gray-100'>
          Acceso al sistema de monitoreo
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='username' className='block text-sm font-medium text-gray-300 mb-2'>
              Usuario
            </label>
            <input
              id='username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className='w-full px-4 py-3 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors'
              placeholder='Ingrese su usuario'
            />
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-300 mb-2'>
              Contraseña
            </label>
            <div className='relative'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='w-full px-4 py-3 pr-12 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors'
                placeholder='Ingrese su contraseña'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-200 transition-colors'
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && (
            <div className='px-4 py-3 text-sm font-medium text-red-200 bg-red-900/50 border border-red-800 rounded-lg'>
              {error}
            </div>
          )}

          <div>
            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 mt-6 font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-500/30 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed shadow-lg'
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
