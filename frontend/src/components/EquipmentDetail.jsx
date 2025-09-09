// src/components/EquipmentDetail.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import TechnicalGauge from './TechnicalGauge'
import useWebSocket from '../services/webSocketService'
import logo from '../assets/fagorlogo.png'

const ArrowLeftIcon = () => (
  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
  </svg>
)

const HistoryIcon = () => (
  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
  </svg>
)

const EquipmentDetail = ({ onLogout, user }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { equipmentName } = useParams()
  
  // Estado para los datos del equipo y PLC
  const [equipmentData, setEquipmentData] = useState([])
  const [plcStatus, setPlcStatus] = useState('Inicializando...')
  
  // Obtenemos los datos iniciales del equipo desde el state de navegación
  const initialEquipment = location.state || { 
    name: equipmentName, 
    temperature: '---',
    id: 1
  }

  // Inicializamos con todos los equipos para que el WebSocket funcione
  useEffect(() => {
    const initialEquipmentList = [
      { id: 1, name: 'Torre Fusora', temperature: '---' },
      { id: 2, name: 'Linea 1', temperature: '---' },
      { id: 3, name: 'Linea 2', temperature: '---' },
      { id: 4, name: 'Linea 3', temperature: '---' },
      { id: 5, name: 'Linea 4', temperature: '---' },
      { id: 6, name: 'Linea 7', temperature: '---' },
      { id: 7, name: 'Estacion 1', temperature: '---' },
      { id: 8, name: 'Estacion 2', temperature: '---' }
    ]
    
    // Si tenemos datos iniciales del location.state, los usamos para el equipo actual
    if (location.state) {
      const updatedList = initialEquipmentList.map(eq => 
        eq.name === location.state.name ? { ...eq, ...location.state } : eq
      )
      setEquipmentData(updatedList)
    } else {
      setEquipmentData(initialEquipmentList)
    }
  }, [location.state])

  // Conectamos al WebSocket para recibir actualizaciones en tiempo real
  useWebSocket(setEquipmentData, setPlcStatus)

  // Obtenemos los datos actuales del equipo específico
  const equipment = equipmentData.find(eq => eq.name === equipmentName) || initialEquipment

  const handleGoBack = () => {
    navigate('/')
  }

  const handleViewHistory = () => {
    navigate(`/history/${equipment.name}`)
  }

  const isValidTemp = typeof equipment.temperature === 'number' && !isNaN(equipment.temperature)
  const isPlcConnected = plcStatus.toLowerCase() === 'ok' || plcStatus.toLowerCase().includes('recibidos')

  const getStatusInfo = () => {
    if (!isValidTemp) {
      return {
        status: 'Desconectado',
        color: 'text-red-400',
        bgColor: 'bg-red-900/20',
        borderColor: 'border-red-500'
      }
    }
    
    const temp = equipment.temperature
    const isTorreFusora = equipment.name === 'Torre Fusora'
    const minRange = 710
    const maxRange = isTorreFusora ? 780 : 750
    
    if (temp >= minRange && temp <= maxRange) {
      return {
        status: 'Óptimo',
        color: 'text-green-400',
        bgColor: 'bg-green-900/20',
        borderColor: 'border-green-500'
      }
    } else if (temp < 400) {
      return {
        status: 'Frío',
        color: 'text-blue-400',
        bgColor: 'bg-blue-900/20',
        borderColor: 'border-blue-500'
      }
    } else if (temp < minRange) {
      return {
        status: 'Calentando',
        color: 'text-orange-400',
        bgColor: 'bg-orange-900/20',
        borderColor: 'border-orange-500'
      }
    } else {
      return {
        status: 'Crítico',
        color: 'text-red-400',
        bgColor: 'bg-red-900/20',
        borderColor: 'border-red-500'
      }
    }
  }

  const statusInfo = getStatusInfo()

  // Función para obtener el color de la temperatura numérica
  const getTemperatureDisplayColor = () => {
    if (!isValidTemp) return 'text-gray-300'
    
    const temp = equipment.temperature
    const isTorreFusora = equipment.name === 'Torre Fusora'
    const minRange = 710
    const maxRange = isTorreFusora ? 780 : 750
    
    if (temp >= minRange && temp <= maxRange) {
      return 'text-green-300'
    } else {
      return 'text-red-300'
    }
  }

  return (
    <div className='flex flex-col h-screen font-sans bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 text-gray-100'>
      {/* ================= HEADER ================= */}
      <header className='bg-gray-900 border-b border-red-600 p-4 shadow-2xl flex justify-between items-center'>
        <div className='flex items-center gap-4'>
          <button 
            onClick={handleGoBack}
            className='flex items-center gap-2 text-gray-300 hover:text-gray-100 transition-colors'
          >
            <ArrowLeftIcon />
            <span className='hidden sm:inline'>Volver al Dashboard</span>
          </button>
          <img src={logo} alt='Logo Fagor' className='h-10 w-auto filter brightness-110' />
        </div>

        <div className='flex-grow text-center'>
          <h1 className='text-xl font-bold text-gray-100'>Detalle del Equipo</h1>
          <span className={`text-xs font-medium ${isPlcConnected ? 'text-green-400' : 'text-red-400'}`}>
            {plcStatus}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <button 
            onClick={handleViewHistory}
            className='flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors'
          >
            <HistoryIcon />
            <span className='hidden sm:inline'>Historial</span>
          </button>
        </div>
      </header>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <main className='flex-1 p-4 md:p-6 overflow-y-auto'>
        <div className='max-w-4xl mx-auto'>
          {/* Información del equipo */}
          <div className='bg-gray-800 border border-red-600/30 rounded-xl shadow-2xl p-6 mb-6'>
            <div className='text-center mb-6'>
              <div className='flex items-center justify-center gap-3 mb-2'>
                <h2 className='text-3xl font-bold text-gray-100'>{equipment.name}</h2>
                {/* Indicador de tiempo real */}
                <div className={`w-3 h-3 rounded-full ${isValidTemp ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                <div className={`w-3 h-3 rounded-full ${isValidTemp ? 'bg-green-500' : 'bg-red-500'} shadow-lg`} />
                <span className={`font-semibold ${statusInfo.color}`}>
                  {statusInfo.status}
                </span>
              </div>
              <p className='text-xs text-gray-400 mt-2'>
                {isValidTemp ? '🔄 Actualizando en tiempo real' : '⚠️ Sin conexión'}
              </p>
            </div>

            {/* Stats cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
              <div className='bg-gray-900 border border-gray-600 rounded-lg p-4 text-center'>
                <div className={`text-2xl font-bold ${getTemperatureDisplayColor()}`}>
                  {isValidTemp ? `${equipment.temperature}°C` : '---'}
                </div>
                <div className='text-sm text-gray-300'>Temperatura Actual</div>
              </div>
              
              <div className='bg-gray-900 border border-gray-600 rounded-lg p-4 text-center'>
                <div className='text-2xl font-bold text-gray-100'>
                  {equipment.name === 'Torre Fusora' ? '780°C' : '750°C'}
                </div>
                <div className='text-sm text-gray-300'>Rango Máximo</div>
              </div>
              
              <div className='bg-gray-900 border border-gray-600 rounded-lg p-4 text-center'>
                <div className={`text-2xl font-bold ${isValidTemp ? 'text-green-300' : 'text-red-300'}`}>
                  {isValidTemp ? 'Online' : 'Offline'}
                </div>
                <div className='text-sm text-gray-300'>Estado de Conexión</div>
              </div>
            </div>

            {/* Gauge */}
            <div className='flex justify-center'>
              <TechnicalGauge 
                value={equipment.temperature} 
                max={1000} 
                equipmentName={equipment.name}
                chartId={`gauge-chart-${equipment.id}`} 
              />
            </div>
          </div>

          {/* Acciones */}
          <div className='bg-gray-800 border border-red-600/30 rounded-xl shadow-2xl p-6'>
            <h3 className='text-xl font-bold text-gray-100 mb-4'>Acciones Disponibles</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <button
                onClick={handleViewHistory}
                className='flex items-center justify-center gap-3 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors'
              >
                <HistoryIcon />
                Ver Historial Completo
              </button>
              
              <button
                onClick={handleGoBack}
                className='flex items-center justify-center gap-3 bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors'
              >
                <ArrowLeftIcon />
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EquipmentDetail
