// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useWebSocket from '../services/webSocketService'
import Header from './Header'
import IndustrialTemperatureDisplay from './IndustrialTemperatureDisplay'

// Componente para cada celda del dashboard
const TemperatureCard = ({ equipment, onClick }) => {
  const navigate = useNavigate()
  
  // Determinar si el equipo está realmente activo basado en datos válidos
  const hasValidTemperature = equipment.temperature && 
    ((typeof equipment.temperature === 'number' && !isNaN(equipment.temperature)) ||
     (typeof equipment.temperature === 'object' && equipment.temperature.value !== undefined && 
      typeof equipment.temperature.value === 'number' && !isNaN(equipment.temperature.value)))
  
  const isActive = hasValidTemperature && equipment.isActive !== false
  const temperatureValue = equipment.temperature?.value || equipment.temperature || 0

  const handleCardClick = () => {
    navigate(`/equipment-detail/${equipment.name}`, { state: equipment })
  }

  return (
    <div 
      className={`
        bg-gray-900 p-6 rounded-lg shadow-lg border-2 transition-all duration-300 cursor-pointer
        hover:shadow-xl transform hover:scale-105
        ${isActive ? 'border-red-600 hover:border-red-500' : 'border-gray-600 hover:border-gray-500'}
      `}
      onClick={handleCardClick}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-bold text-red-500">{equipment.name}</h3>
          <div className={`
            w-3 h-3 rounded-full flex-shrink-0
            ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}
          `} />
        </div>
        
        <IndustrialTemperatureDisplay 
          temperature={temperatureValue}
          deviceName={equipment.name}
          isActive={isActive}
        />
        
        <div className="text-sm text-gray-400 text-center">
          <div>Estado: {isActive ? 'Activo' : 'Inactivo'}</div>
          <div className="text-xs opacity-75">Click para ver detalles</div>
        </div>
      </div>
    </div>
  )
}

const Dashboard = ({ onLogout, user }) => {
  const navigate = useNavigate()
  const [equipmentData, setEquipmentData] = useState([])

  useWebSocket(setEquipmentData, null)

  useEffect(() => {
    const initialEquipment = [
      { id: 1, name: 'Torre Fusora', temperature: { value: 0 }, isActive: true },
      { id: 2, name: 'Linea 1', temperature: { value: 0 }, isActive: true },
      { id: 3, name: 'Linea 2', temperature: { value: 0 }, isActive: true },
      { id: 4, name: 'Linea 3', temperature: { value: 0 }, isActive: true },
      { id: 5, name: 'Linea 4', temperature: { value: 0 }, isActive: true },
      { id: 6, name: 'Linea 7', temperature: { value: 0 }, isActive: true },
      { id: 7, name: 'Estacion 1', temperature: { value: 0 }, isActive: true },
      { id: 8, name: 'Estacion 2', temperature: { value: 0 }, isActive: true }
    ]
    if (equipmentData.length === 0) {
      setEquipmentData(initialEquipment)
    }
  }, [equipmentData.length])

  const handleEquipmentClick = (equipment) => {
    navigate(`/equipment-detail/${equipment.name}`, { state: equipment })
  }

  return (
    <div className='flex flex-col h-screen font-sans bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 text-gray-100'>
      {/* Header Component */}
      <Header 
        title="Dashboard de Temperaturas"
        user={user}
        onLogout={onLogout}
      />

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
            {equipmentData.map((equipment, index) => (
              <TemperatureCard
                key={equipment.id || equipment._id || index}
                equipment={equipment}
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
