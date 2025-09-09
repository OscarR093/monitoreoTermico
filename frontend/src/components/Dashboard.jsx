// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useWebSocket from '../services/webSocketService'
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

// Componente para cada celda del dashboard
const TemperatureCard = ({ equipment, onClick }) => {
  const isValidTemp = typeof equipment.temperature === 'number' && !isNaN(equipment.temperature)
  
  // Lógica de rangos específicos por equipo
  const getTemperatureStatus = (temp, equipmentName) => {
    if (!isValidTemp) return { 
      status: 'disconnected', 
      color: 'text-gray-400', 
      bgColor: 'bg-gray-700 border-gray-600 hover:bg-gray-650',
      tempColor: 'text-gray-400'
    }
    
    const isTorreFusora = equipmentName === 'Torre Fusora'
    const minRange = 710
    const maxRange = isTorreFusora ? 780 : 750
    
    if (temp >= minRange && temp <= maxRange) {
      return {
        status: 'optimal',
        color: 'text-green-300',
        bgColor: 'bg-gray-700 border-green-500 hover:bg-gray-600',
        tempColor: 'text-green-300'
      }
    } else if (temp < 400) {
      return {
        status: 'low',
        color: 'text-blue-300',
        bgColor: 'bg-gray-700 border-blue-500 hover:bg-gray-600',
        tempColor: 'text-blue-300'
      }
    } else if (temp < minRange) {
      return {
        status: 'warming',
        color: 'text-orange-300',
        bgColor: 'bg-gray-700 border-orange-500 hover:bg-gray-600',
        tempColor: 'text-orange-300'
      }
    } else {
      return {
        status: 'critical',
        color: 'text-red-300',
        bgColor: 'bg-gray-700 border-red-500 hover:bg-gray-600',
        tempColor: 'text-red-300'
      }
    }
  }

  const tempStatus = getTemperatureStatus(equipment.temperature, equipment.name)

  return (
    <div
      onClick={onClick}
      className={`
        relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl
        ${tempStatus.bgColor} backdrop-blur-sm shadow-lg
      `}
    >
      <div className='flex flex-col items-center justify-center h-full'>
        <h3 className='text-lg font-bold text-gray-100 mb-3 text-center'>
          {equipment.name}
        </h3>
        
        <div className={`text-4xl font-black mb-2 ${tempStatus.tempColor} drop-shadow-sm`}>
          {isValidTemp ? `${equipment.temperature}°C` : '---'}
        </div>
        
        <div className={`text-sm font-medium ${isValidTemp ? 'text-gray-300' : 'text-gray-400'}`}>
          {isValidTemp ? 'En Línea' : 'Desconectado'}
        </div>
        
        {/* Indicador de estado con diseño industrial */}
        <div className={`
          absolute top-3 right-3 w-4 h-4 rounded-sm border-2 border-gray-500
          ${isValidTemp ? 'bg-green-500 shadow-green-500/50 shadow-lg' : 'bg-gray-500'}
        `} />
        
        {/* Línea decorativa industrial */}
        <div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-b-xl opacity-80' />
      </div>
    </div>
  )
}

const Dashboard = ({ onLogout, user }) => {
  const navigate = useNavigate()
  const [equipmentData, setEquipmentData] = useState([])
  const [plcStatus, setPlcStatus] = useState('Inicializando...')
  const [mainMenuOpen, setMainMenuOpen] = useState(false)

  const isPlcConnected = plcStatus.toLowerCase() === 'ok' || plcStatus.toLowerCase().includes('recibidos')

  useEffect(() => {
    const initialEquipment = [
      { id: 1, name: 'Torre Fusora', temperature: '---' },
      { id: 2, name: 'Linea 1', temperature: '---' },
      { id: 3, name: 'Linea 2', temperature: '---' },
      { id: 4, name: 'Linea 3', temperature: '---' },
      { id: 5, name: 'Linea 4', temperature: '---' },
      { id: 6, name: 'Linea 7', temperature: '---' },
      { id: 7, name: 'Estacion 1', temperature: '---' },
      { id: 8, name: 'Estacion 2', temperature: '---' }
    ]
    setEquipmentData(initialEquipment)
  }, [])

  useWebSocket(setEquipmentData, setPlcStatus)

  const toggleMainMenu = () => setMainMenuOpen(!mainMenuOpen)

  const handleNavigate = (path) => {
    navigate(path)
    setMainMenuOpen(false)
  }

  const handleLogoutClick = () => {
    onLogout()
    setMainMenuOpen(false)
  }

  const handleEquipmentClick = (equipment) => {
    navigate(`/equipment-detail/${equipment.name}`, { state: equipment })
  }

  return (
    <div className='flex flex-col h-screen font-sans bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 text-gray-100'>
      {/* ================= HEADER ================= */}
      <header className='bg-gray-900 border-b border-red-600 p-4 shadow-2xl flex justify-between items-center fixed top-0 left-0 w-full z-30'>
        <div className='flex items-center gap-2'>
          <div className='flex flex-col items-start'>
            <img src={logo} alt='Logo Fagor' className='h-10 w-auto mr-20 filter brightness-110' />
            <span className={`-mt-1 ml-1 px-2 py-0.5 rounded-full text-white font-semibold text-[10px] transition-colors sm:hidden ${isPlcConnected ? 'bg-red-600' : 'bg-gray-700'}`}>
              {isPlcConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        <div className='hidden sm:flex flex-grow justify-center'>
          <h1 className='text-xl font-bold text-center text-gray-100'>Dashboard de Temperaturas</h1>
        </div>

        <div className='flex items-center gap-4'>
          <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-white font-semibold text-sm transition-colors ${isPlcConnected ? 'bg-red-600' : 'bg-gray-700'}`}>
            {plcStatus}
          </span>
          <nav className='hidden md:flex items-center gap-3'>
            <button onClick={() => handleNavigate('/settings')} className='bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors'>Ajustes</button>
            {user?.admin && (
              <button onClick={() => handleNavigate('/admin/users')} className='bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors'>Gestión</button>
            )}
            <button onClick={handleLogoutClick} className='bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors'>Cerrar Sesión</button>
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
          <button onClick={toggleMainMenu} className='absolute top-4 right-4 text-gray-400 hover:text-gray-200'><CloseIcon /></button>
          <h2 className='text-lg font-bold mb-6 mt-2 text-gray-100'>Menú</h2>
          <nav className='flex flex-col gap-4'>
            <button onClick={() => handleNavigate('/settings')} className='w-full text-left bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors'>Ajustes</button>
            {user?.admin && (
              <button onClick={() => handleNavigate('/admin/users')} className='w-full text-left bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors'>Gestión</button>
            )}
            <button onClick={handleLogoutClick} className='w-full text-left bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors'>Cerrar Sesión</button>
          </nav>
        </div>
      </div>

      {/* ================= DASHBOARD GRID ================= */}
      <main className='flex-1 w-full mt-20 p-4 md:p-6 overflow-y-auto'>
        <div className='max-w-7xl mx-auto'>
          <div className='mb-6 text-center'>
            <h2 className='text-2xl font-bold text-gray-100 mb-2'>Monitoreo Industrial en Tiempo Real</h2>
            <p className='text-gray-300'>Haz clic en cualquier equipo para ver detalles completos</p>
            {/* Línea decorativa industrial */}
            <div className='w-24 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-3 rounded-full'></div>
          </div>
          
          {/* Grid 2x4 responsive con estilo industrial */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
            {equipmentData.map((equipment) => (
              <TemperatureCard
                key={equipment.id}
                equipment={equipment}
                onClick={() => handleEquipmentClick(equipment)}
              />
            ))}
          </div>
          
          {/* Footer decorativo industrial */}
          <div className='mt-8 text-center'>
            <div className='inline-flex items-center gap-2 text-gray-400 text-sm'>
              <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
              <span>Sistema Activo</span>
              <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
