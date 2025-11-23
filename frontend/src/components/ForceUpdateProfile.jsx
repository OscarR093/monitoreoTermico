import { useState } from 'react'
import api from '../services/api'

// Componente Modal para mensajes de éxito
const SuccessModal = ({ isOpen, message, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
      <div className='bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all border border-gray-700'>
        <div className='text-center'>
          {/* Ícono de éxito */}
          <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900/50 mb-4'>
            <svg className='h-6 w-6 text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
            </svg>
          </div>

          <h3 className='text-lg font-medium text-gray-100 mb-4'>
            {message}
          </h3>

          <button
            onClick={onConfirm}
            className='w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all duration-200'
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}

const ForceUpdateProfile = ({ user }) => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    cellPhone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [validations, setValidations] = useState({
    password: true,
    confirmPassword: true
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    // Validar contraseñas
    if (name === 'password' || name === 'confirmPassword') {
      setValidations(prev => ({
        ...prev,
        password: form.password.length >= 6,
        confirmPassword: form.password === form.confirmPassword
      }))
    }
  }

  const validateForm = () => {
    const newValidations = {
      password: form.password.length >= 6,
      confirmPassword: form.password === form.confirmPassword
    }
    setValidations(newValidations)
    return Object.values(newValidations).every(v => v)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      setError('Por favor, verifica los campos marcados en rojo.')
      return
    }

    setLoading(true)
    try {
      // Enviar solo los datos necesarios, excluyendo confirmPassword
      // y preservando el campo admin del usuario actual
      const { confirmPassword, ...dataToSend } = form
      await api.put(`/users/${user.id}`, {
        ...dataToSend,
        admin: user.admin, // Preservar permisos de administrador
        mustChangePassword: false
      })

      // Mostrar el modal de éxito
      setShowSuccessModal(true)
      setLoading(false)
    } catch (error) {
      console.error('Error al actualizar:', error)
      if (error.response?.status === 400) {
        setError('Los datos proporcionados no son válidos. Por favor, verifica la información.')
      } else if (error.response?.status === 409) {
        setError('El correo electrónico o nombre de usuario ya está en uso. Por favor, utiliza otro.')
      } else {
        setError('No se pudo actualizar la información. Por favor, intenta de nuevo más tarde.')
      }
      setLoading(false)
    }
  }

  const handleSuccessConfirm = async () => {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Error al hacer logout:', error)
    } finally {
      window.location.href = '/login'
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 font-sans'>
      <SuccessModal
        isOpen={showSuccessModal}
        message='¡Datos actualizados correctamente! Serás redirigido al inicio de sesión.'
        onConfirm={handleSuccessConfirm}
      />

      <div className='w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700'>
        <div className='text-center space-y-2'>
          <h2 className='text-3xl font-extrabold text-gray-100'>Actualiza tus datos</h2>
          <p className='text-gray-400'>Por seguridad, debes actualizar tu información y contraseña antes de continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='space-y-4'>
            <div className='relative'>
              <label htmlFor='username' className='block text-sm font-medium text-gray-300 mb-2'>Usuario</label>
              <input
                id='username'
                name='username'
                type='text'
                value={form.username}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200'
                placeholder={user.username}
              />
            </div>

            <div className='relative'>
              <label htmlFor='password' className='block text-sm font-medium text-gray-300 mb-2'>
                Nueva contraseña
                {!validations.password && (
                  <span className='text-red-400 text-xs ml-2'>Mínimo 6 caracteres</span>
                )}
              </label>
              <div className='relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 pr-12 text-gray-100 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${validations.password ? 'border-gray-600 focus:ring-red-500 focus:border-red-500' : 'border-red-500 focus:ring-red-500'
                    }`}
                  placeholder='••••••••'
                  minLength={6}
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                      </svg>
                    )
                    : (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                      </svg>
                    )}
                </button>
              </div>
            </div>

            <div className='relative'>
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-300 mb-2'>
                Confirmar contraseña
                {!validations.confirmPassword && (
                  <span className='text-red-400 text-xs ml-2'>Las contraseñas no coinciden</span>
                )}
              </label>
              <div className='relative'>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 pr-12 text-gray-100 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${validations.confirmPassword ? 'border-gray-600 focus:ring-red-500 focus:border-red-500' : 'border-red-500 focus:ring-red-500'
                    }`}
                  placeholder='••••••••'
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword
                    ? (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                      </svg>
                    )
                    : (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                      </svg>
                    )}
                </button>
              </div>
            </div>

            <div className='relative'>
              <label htmlFor='fullName' className='block text-sm font-medium text-gray-300 mb-2'>Nombre completo</label>
              <input
                id='fullName'
                name='fullName'
                type='text'
                value={form.fullName}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200'
                placeholder={user.fullName}
              />
            </div>

            <div className='relative'>
              <label htmlFor='email' className='block text-sm font-medium text-gray-300 mb-2'>Correo electrónico</label>
              <input
                id='email'
                name='email'
                type='email'
                value={form.email}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200'
                placeholder={user.email}
              />
            </div>

            <div className='relative'>
              <label htmlFor='cellPhone' className='block text-sm font-medium text-gray-300 mb-2'>Teléfono</label>
              <input
                id='cellPhone'
                name='cellPhone'
                type='text'
                value={form.cellPhone}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200'
                placeholder={user.cellPhone}
              />
            </div>
          </div>

          {error && (
            <div className='p-4 rounded-lg bg-red-900/50 border border-red-800 text-red-200 text-sm'>
              <p className='font-medium'>{error}</p>
            </div>
          )}

          <button
            type='submit'
            disabled={loading || showSuccessModal}
            className='w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-4 focus:ring-red-500/30'
          >
            {loading
              ? (
                <span className='flex items-center justify-center'>
                  <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                  </svg>
                  Actualizando...
                </span>
              )
              : (
                'Actualizar datos'
              )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForceUpdateProfile
