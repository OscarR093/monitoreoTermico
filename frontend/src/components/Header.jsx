// src/components/Header.jsx
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/fagorlogo.png'

// --- Iconos SVG ---
const MenuIcon = () => (
  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16m-7 6h7' />
  </svg>
)

const CloseIcon = () => (
  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
  </svg>
)

const Header = ({ 
  title = "Dashboard de Temperaturas", 
  user, 
  onLogout, 
  showBackButton = false,
  onBack,
  rightContent = null
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mainMenuOpen, setMainMenuOpen] = useState(false)

  const toggleMainMenu = () => setMainMenuOpen(!mainMenuOpen)

  const handleNavigate = (path) => {
    navigate(path)
    setMainMenuOpen(false)
  }

  const handleLogoutClick = () => {
    onLogout()
    setMainMenuOpen(false)
  }

  const handleBackClick = () => {
    if (onBack) {
      onBack()
    } else {
      navigate('/')
    }
  }

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className='bg-gray-900 border-b border-red-600 p-4 shadow-2xl flex justify-between items-center fixed top-0 left-0 w-full z-30'>
        <div className='flex items-center gap-4'>
          {showBackButton && (
            <button 
              onClick={handleBackClick}
              className='flex items-center gap-2 text-gray-300 hover:text-gray-100 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800'
            >
              <ArrowLeftIcon />
              <span className='hidden sm:inline font-medium'>Volver</span>
            </button>
          )}
          
          <div className='flex items-center gap-3'>
            <img src={logo} alt='Logo Fagor' className='h-10 w-auto filter brightness-110' />
            <div className='hidden sm:block h-8 w-px bg-gray-600'></div>
            <div className='hidden sm:flex items-center gap-2'>
              <div className='w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-bold'>
                  {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className='text-gray-300 font-medium'>
                {user?.fullName || user?.username || 'Usuario'}
              </span>
            </div>
          </div>
        </div>

        <div className='hidden sm:flex flex-grow justify-center'>
          <div className='text-center'>
            <h1 className='text-xl font-bold text-gray-100'>{title}</h1>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          {/* Contenido personalizado del lado derecho */}
          {rightContent}
          
          <nav className='hidden md:flex items-center gap-3'>
            <button onClick={() => handleNavigate('/settings')} className='bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors'>
              Ajustes
            </button>
            {user?.admin && location.pathname !== '/admin/users' && (
              <button onClick={() => handleNavigate('/admin/users')} className='bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors'>
                Gestión
              </button>
            )}
            <button onClick={handleLogoutClick} className='bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors'>
              Cerrar Sesión
            </button>
          </nav>
          
          <div className='md:hidden'>
            <button onClick={toggleMainMenu} className='text-gray-300 focus:outline-none p-2'>
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* --- Panel de Menú Móvil --- */}
      <div className={`fixed inset-0 bg-black bg-opacity-70 z-40 transition-opacity md:hidden ${mainMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleMainMenu} />
      <div className={`fixed top-0 right-0 h-full w-64 bg-gray-900 border-l border-red-600 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${mainMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='p-4'>
          <button onClick={toggleMainMenu} className='absolute top-4 right-4 text-gray-400 hover:text-gray-200'>
            <CloseIcon />
          </button>
          <h2 className='text-lg font-bold mb-6 mt-2 text-gray-100'>Menú</h2>
          <nav className='flex flex-col gap-4'>
            <button onClick={() => handleNavigate('/settings')} className='w-full text-left bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors'>
              Ajustes
            </button>
            {user?.admin && location.pathname !== '/admin/users' && (
              <button onClick={() => handleNavigate('/admin/users')} className='w-full text-left bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors'>
                Gestión
              </button>
            )}
            <button onClick={handleLogoutClick} className='w-full text-left bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors'>
              Cerrar Sesión
            </button>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Header
