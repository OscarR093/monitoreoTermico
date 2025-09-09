// src/components/EquipmentDetail.jsx
import React from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import TechnicalGauge from './TechnicalGauge'
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
  
  // Obtenemos los datos del equipo desde el state de navegación o los valores por defecto
  const equipment = location.state || { 
    name: equipmentName, 
    temperature: '---',
    id: 1
  }

  const handleGoBack = () => {
    navigate('/')
  }

  const handleViewHistory = () => {
    navigate(`/history/${equipment.name}`)
  }

  const isValidTemp = typeof equipment.temperature === 'number' && !isNaN(equipment.temperature)

  const getStatusInfo = () => {
    if (!isValidTemp) {
      return {
        status: 'Desconectado',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300'
      }
    }
    
    const temp = equipment.temperature
    if (temp <= 300) {
      return {
        status: 'Normal',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300'
      }
    }
    if (temp <= 600) {
      return {
        status: 'Operacional',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300'
      }
    }
    if (temp <= 800) {
      return {
        status: 'Alerta',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300'
      }
    }
    return {
      status: 'Crítico',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300'
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className='flex flex-col h-screen font-sans bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800'>
      {/* ================= HEADER ================= */}
      <header className='bg-white p-4 shadow-md flex justify-between items-center'>
        <div className='flex items-center gap-4'>
          <button 
            onClick={handleGoBack}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors'
          >
            <ArrowLeftIcon />
            <span className='hidden sm:inline'>Volver al Dashboard</span>
          </button>
          <img src={logo} alt='Logo Fagor' className='h-10 w-auto' />
        </div>

        <div className='flex-grow text-center'>
          <h1 className='text-xl font-bold'>Detalle del Equipo</h1>
        </div>

        <div className='flex items-center gap-2'>
          <button 
            onClick={handleViewHistory}
            className='flex items-center gap-2 bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-800 transition-colors'
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
          <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
            <div className='text-center mb-6'>
              <h2 className='text-3xl font-bold text-slate-800 mb-2'>{equipment.name}</h2>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                <div className={`w-3 h-3 rounded-full ${isValidTemp ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`font-semibold ${statusInfo.color}`}>
                  {statusInfo.status}
                </span>
              </div>
            </div>

            {/* Stats cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
              <div className='bg-gray-50 rounded-lg p-4 text-center'>
                <div className='text-2xl font-bold text-gray-800'>
                  {isValidTemp ? `${equipment.temperature}°C` : '---'}
                </div>
                <div className='text-sm text-gray-600'>Temperatura Actual</div>
              </div>
              
              <div className='bg-gray-50 rounded-lg p-4 text-center'>
                <div className='text-2xl font-bold text-gray-800'>1000°C</div>
                <div className='text-sm text-gray-600'>Temperatura Máxima</div>
              </div>
              
              <div className='bg-gray-50 rounded-lg p-4 text-center'>
                <div className={`text-2xl font-bold ${isValidTemp ? 'text-green-600' : 'text-red-600'}`}>
                  {isValidTemp ? 'Online' : 'Offline'}
                </div>
                <div className='text-sm text-gray-600'>Estado de Conexión</div>
              </div>
            </div>

            {/* Gauge */}
            <div className='flex justify-center'>
              <TechnicalGauge 
                value={equipment.temperature} 
                max={1000} 
                chartId={`gauge-chart-${equipment.id}`} 
              />
            </div>
          </div>

          {/* Acciones */}
          <div className='bg-white rounded-xl shadow-lg p-6'>
            <h3 className='text-xl font-bold text-slate-800 mb-4'>Acciones Disponibles</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <button
                onClick={handleViewHistory}
                className='flex items-center justify-center gap-3 bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors'
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
