// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Login from './Login'
import Settings from './components/Settings'
import UserManagement from './components/UserManagement'
import HistoryPage from './components/HistoryPage'
import EquipmentDetail from './components/EquipmentDetail'
import ForceUpdateProfile from './components/ForceUpdateProfile'
import './index.css'
import { useState, useEffect } from 'react'
import api from './services/api'

function App () {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth () {
      try {
        // Siempre obtenemos el usuario desde /api/auth/check
        const response = await api.get('/auth/check')
        // Si la respuesta tiene .user, usamos ese objeto
        if (response && response.user) {
          setUser(response.user)
        } else {
          setUser(response)
        }
        setIsAuthenticated(true)
      } catch (error) {
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await api.post('/logout')
      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (loading) return <div className='text-center text-2xl p-12 text-gray-600'>Cargando...</div>
    if (!isAuthenticated) {
      return <Navigate to='/login' />
    }
    if (adminOnly && !user?.admin) {
      return <Navigate to='/' />
    }
    return children
  }

  if (loading) return <div className='text-center text-2xl p-12 text-gray-600'>Cargando...</div>

  // --- Redirección obligatoria si el usuario debe actualizar datos ---
  if (isAuthenticated && user?.mustChangePassword) {
    return <ForceUpdateProfile user={user} />
  }

  return (
    <Router>
      <Routes>
        <Route
          path='/login'
          element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />}
        />
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <Dashboard onLogout={handleLogout} user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path='/settings'
          element={
            <ProtectedRoute>
              <Settings onLogout={handleLogout} user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/users'
          element={
            <ProtectedRoute adminOnly>
              <UserManagement user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        {/* --- NUEVA RUTA PARA EL HISTORIAL --- */}
        <Route
          path='/history/:nombreEquipo'
          element={
            <ProtectedRoute>
              <HistoryPage onLogout={handleLogout} user={user} />
            </ProtectedRoute>
          }
        />
        {/* --- NUEVA RUTA PARA DETALLE DE EQUIPO --- */}
        <Route
          path='/equipment-detail/:equipmentName'
          element={
            <ProtectedRoute>
              <EquipmentDetail onLogout={handleLogout} user={user} />
            </ProtectedRoute>
          }
        />
        <Route path='*' element={<Navigate to={isAuthenticated ? '/' : '/login'} />} />
      </Routes>
    </Router>
  )
}

export default App
