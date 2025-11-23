import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// --- ✅ CORRECCIÓN: Se ajusta la ruta de importación para api.js
import api from '../services/api'
import Header from './Header'

// --- Iconos SVG ---
const AddUserIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' /><circle cx='9' cy='7' r='4' /><line x1='22' x2='16' y1='11' y2='11' /><line x1='19' x2='19' y1='8' y2='14' /></svg>
)
const TrashIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='3 6 5 6 21 6' /><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' /><line x1='10' x2='10' y1='11' y2='17' /><line x1='14' x2='14' y1='11' y2='17' /></svg>
)
const SpinnerIcon = () => (
  <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' /><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' /></svg>
)

function UserManagement({ user: currentUser, onLogout }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    showPassword: false,
    admin: false
  })

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState({ message: '', type: '' })
  const [userToDelete, setUserToDelete] = useState(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get('/users')
        // --- ✅ CAMBIO: Filtra al usuario actual y al super usuario ---
        const filteredUsers = response.filter(
          (u) => u.username !== currentUser.username && !u.isSuperAdmin
        )
        setUsers(filteredUsers)
      } catch (err) {
        setNotification({ message: 'Error al cargar usuarios.', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [currentUser.username])

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ message: '', type: '' }), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await api.post('/register', {
        username: formData.username,
        password: formData.password,
        admin: formData.admin
      })

      if (response && response.id) {
        // Agregamos el nuevo usuario solo si tenemos una respuesta válida
        setUsers([...users, {
          id: response.id,
          username: formData.username,
          admin: formData.admin || false
        }])
        setFormData({ username: '', password: '', showPassword: false, admin: false })
        setNotification({ message: 'Usuario agregado correctamente.', type: 'success' })
      } else {
        throw new Error('Respuesta inválida del servidor')
      }
    } catch (error) {
      setNotification({ message: 'Error al agregar usuario.', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    setIsSubmitting(true)
    try {
      await api.del(`/users/${userToDelete.id}`)
      setUsers(users.filter((user) => user.id !== userToDelete.id))
      setNotification({ message: 'Usuario eliminado correctamente.', type: 'success' })
    } catch (error) {
      setNotification({ message: 'Error al eliminar usuario.', type: 'error' })
    } finally {
      setIsSubmitting(false)
      setUserToDelete(null)
    }
  }

  const notificationColors = {
    success: 'bg-green-600 border-green-700',
    error: 'bg-red-600 border-red-700'
  }

  if (loading) return <div className='flex items-center justify-center h-screen bg-gray-900 text-xl font-semibold text-gray-100'>Cargando...</div>

  return (
    <div className='min-h-screen bg-gray-900 font-sans'>
      <Header
        title="Gestión de Usuarios"
        user={currentUser}
        onLogout={onLogout}
        showBackButton={true}
      />

      <main className='flex-1 overflow-y-auto mt-20 p-4 sm:p-6 lg:p-8'>
        <div className='max-w-6xl mx-auto'>
          {notification.message && (
            <div className={`fixed bottom-5 right-5 z-50 rounded-lg p-4 text-white font-medium shadow-lg border ${notificationColors[notification.type]}`}>
              {notification.message}
            </div>
          )}

          <div className='grid grid-cols-1 lg:grid-cols-5 gap-8'>
            <div className='lg:col-span-2'>
              <div className='bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-2xl sticky top-6'>
                <h2 className='text-xl font-bold text-gray-100 border-b border-gray-600 pb-3 mb-6 flex items-center gap-2'>
                  <AddUserIcon /> Agregar Nuevo Usuario
                </h2>
                <form onSubmit={handleAddUser} className='space-y-4'>
                  <InputField label='Nombre de usuario' name='username' value={formData.username} onChange={handleInputChange} />
                  <div className="relative">
                    <label className='block text-sm font-medium text-gray-300 mb-2'>Contraseña</label>
                    <div className="relative">
                      <input
                        name='password'
                        type={formData.showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className='w-full px-4 py-3 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors'
                        placeholder='Ingrese la contraseña'
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        {formData.showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {currentUser.isSuperAdmin && (
                    <div className='flex items-center gap-2 pt-2'>
                      <input
                        type='checkbox'
                        name='admin'
                        checked={formData.admin}
                        onChange={handleInputChange}
                        className='h-4 w-4 rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500 focus:ring-offset-gray-800'
                      />
                      <label className='text-sm font-medium text-gray-300'>Conceder permisos de Administrador</label>
                    </div>
                  )}
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full flex justify-center items-center gap-2 mt-6 px-6 py-3 font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
                  >
                    {isSubmitting ? <><SpinnerIcon /> Agregando...</> : 'Agregar Usuario'}
                  </button>
                </form>
              </div>
            </div>

            <div className='lg:col-span-3 bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-2xl'>
              <h2 className='text-xl font-bold text-gray-100 border-b border-gray-600 pb-3 mb-4'>Usuarios Registrados</h2>
              {users.length === 0 ? (
                <p className='text-gray-400 mt-4'>No hay otros usuarios registrados.</p>
              ) : (
                <ul className='divide-y divide-gray-700'>
                  {users.map((u) => (
                    <li key={u.id} className='flex flex-col sm:flex-row justify-between items-start sm:items-center py-4'>
                      <div className='flex-grow text-left mb-2 sm:mb-0'>
                        <p className='font-semibold text-gray-100 flex items-center gap-2 flex-wrap'>
                          {u.username}
                          <span className="text-gray-400 font-normal">({u.fullName || 'Sin nombre completo'})</span>
                          {u.admin && <span className='text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded-full'>Admin</span>}
                        </p>
                      </div>
                      {/* --- ✅ CORRECCIÓN: Se revisa la lógica para que el botón de eliminar se muestre correctamente */}
                      {(currentUser.admin && !u.admin) || (currentUser.isSuperAdmin && u.admin)
                        ? (
                          <button
                            onClick={() => setUserToDelete(u)}
                            className='flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors w-full sm:w-auto text-red-200 bg-red-900/50 hover:bg-red-800/70 border border-red-800'
                          >
                            <TrashIcon /> Eliminar
                          </button>
                        )
                        : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>

      {userToDelete && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
          <div className='bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-6 w-full max-w-md'>
            <h3 className='text-xl font-bold text-gray-100'>Confirmar Eliminación</h3>
            {/* --- ✅ CAMBIO: El nombre que se muestra es el username --- */}
            <p className='text-gray-300 my-4'>¿Estás seguro de que quieres eliminar al usuario <strong className='text-gray-100'>{userToDelete.username}</strong>? Esta acción es irreversible.</p>
            <div className='flex justify-end gap-4 mt-6'>
              <button
                onClick={() => setUserToDelete(null)}
                disabled={isSubmitting}
                className='px-4 py-2 font-semibold text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50'
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className='flex justify-center items-center gap-2 px-4 py-2 font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-colors disabled:opacity-50 w-32 focus:outline-none focus:ring-4 focus:ring-red-500/30'
              >
                {isSubmitting ? <SpinnerIcon /> : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const InputField = ({ label, ...props }) => (
  <div>
    <label className='block text-sm font-medium text-gray-300 mb-2'>{label}</label>
    <input
      {...props}
      required
      className='w-full px-4 py-3 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors'
      placeholder={`Ingrese ${label.toLowerCase()}`}
    />
  </div>
)

export default UserManagement
