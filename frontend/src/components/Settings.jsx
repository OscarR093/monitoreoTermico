// src/components/Settings.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from './Header'

// --- Iconos SVG ---
const EyeIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' /><circle cx='12' cy='12' r='3' /></svg>
)

const EyeOffIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M9.88 9.88a3 3 0 1 0 4.24 4.24' /><path d='M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' /><path d='M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' /><line x1='2' x2='22' y1='2' y2='22' /></svg>
)

function Settings ({ onLogout, user }) {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [notification, setNotification] = useState({ message: '', type: '' })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    async function fetchUserData () {
      try {
        const data = await api.get('/auth/check')
        setUserData(data.user)
        setFormData({ fullName: data.user.fullName, email: data.user.email, password: '' })
      } catch (err) {
        console.error('Error al cargar datos del usuario', err)
        onLogout()
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [navigate, onLogout])

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ message: '', type: '' }), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    setNotification({ message: '', type: '' })

    try {
      const updatedData = {}
      if (formData.fullName && formData.fullName !== userData.fullName) updatedData.fullName = formData.fullName
      if (formData.email && formData.email !== userData.email) updatedData.email = formData.email
      if (formData.password) updatedData.password = formData.password

      if (Object.keys(updatedData).length === 0) {
        setNotification({ message: 'No hay cambios para guardar.', type: 'info' })
        setIsUpdating(false)
        return
      }

      const response = await api.put(`/users/${userData.id}`, updatedData)
      setUserData(response)
      setFormData({ fullName: response.fullName, email: response.email, password: '' })
      setNotification({ message: 'Usuario actualizado correctamente.', type: 'success' })
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      setNotification({ message: 'Error al actualizar. Intente de nuevo.', type: 'error' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteUser = async () => {
    setIsDeleting(true)
    setNotification({ message: '', type: '' })
    try {
      await api.del(`/users/${userData.id}`)
      await onLogout()
      navigate('/login')
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      setNotification({ message: 'Error al eliminar la cuenta.', type: 'error' })
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

  if (loading) {
    return (
      <div className='flex flex-col h-screen font-sans bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 text-gray-100'>
        <Header 
          title="Ajustes de Cuenta"
          user={user}
          onLogout={onLogout}
          showBackButton={true}
        />
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-xl font-semibold text-gray-100'>Cargando...</div>
        </div>
      </div>
    )
  }

  // --- Colores para notificaciones ---
  const notificationColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  }

  return (
    <div className='flex flex-col h-screen font-sans bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 text-gray-100'>
      {/* Header Component */}
      <Header 
        title="Ajustes de Cuenta"
        user={user}
        onLogout={onLogout}
        showBackButton={true}
      />

      {/* Main Content */}
      <main className='flex-1 overflow-y-auto mt-20 p-4 sm:p-6 lg:p-8'>
        <div className='max-w-4xl mx-auto'>
          {notification.message && (
            <div className={`rounded-lg p-4 mb-6 text-white font-medium ${notificationColors[notification.type] || 'bg-gray-600'}`}>
              {notification.message}
            </div>
          )}

          <div className='bg-gray-800 border border-red-600/30 p-8 rounded-xl shadow-2xl mb-8'>
            <h2 className='text-xl font-bold text-gray-100 border-b border-gray-600 pb-3 mb-6'>
              Hola, {userData.fullName}
            </h2>
            <form onSubmit={handleUpdateUser} className='space-y-4'>
              <div>
                <label htmlFor='fullName' className='block text-sm font-bold text-gray-300 mb-1'>
                  Nombre Completo
                </label>
                <input 
                  id='fullName' 
                  name='fullName' 
                  type='text' 
                  value={formData.fullName} 
                  onChange={handleInputChange} 
                  className='w-full px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                />
              </div>
              <div>
                <label htmlFor='email' className='block text-sm font-bold text-gray-300 mb-1'>
                  Correo Electrónico
                </label>
                <input 
                  id='email' 
                  name='email' 
                  type='email' 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className='w-full px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                />
              </div>
              <div>
                <label htmlFor='password' className='block text-sm font-bold text-gray-300 mb-1'>
                  Nueva Contraseña
                </label>
                <div className='relative'>
                  <input 
                    id='password' 
                    name='password' 
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    placeholder='Dejar en blanco para no cambiar' 
                    className='w-full px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                  />
                  <button 
                    type='button' 
                    onClick={() => setShowPassword(!showPassword)} 
                    className='absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200'
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <div className='pt-2'>
                <button 
                  type='submit' 
                  disabled={isUpdating} 
                  className='w-full sm:w-auto px-6 py-2 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200 disabled:bg-gray-600'
                >
                  {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>

          <div className='bg-gray-800 border border-yellow-600/30 p-8 rounded-xl shadow-2xl border-t-4 border-yellow-500'>
            <h3 className='text-xl font-bold text-yellow-400'>Zona de Peligro</h3>
            <p className='text-gray-300 mt-2 mb-4'>
              La eliminación de la cuenta es una acción permanente e irreversible.
            </p>
            <button 
              onClick={() => setIsDeleteModalOpen(true)} 
              className='bg-transparent text-yellow-400 font-bold py-2 px-4 rounded-lg border-2 border-yellow-500 hover:bg-yellow-500 hover:text-gray-900 transition-colors'
            >
              Eliminar mi Cuenta
            </button>
          </div>
        </div>
      </main>

      {isDeleteModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4'>
          <div className='bg-gray-800 border border-red-600/30 rounded-lg shadow-2xl p-6 w-full max-w-md'>
            <h3 className='text-xl font-bold text-gray-100'>¿Estás seguro?</h3>
            <p className='text-gray-300 my-4'>
              Esta acción no se puede deshacer. Se eliminarán todos tus datos de forma permanente.
            </p>
            <div className='flex justify-end gap-4 mt-6'>
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                disabled={isDeleting} 
                className='px-4 py-2 font-bold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50'
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteUser} 
                disabled={isDeleting} 
                className='px-4 py-2 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-600'
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
