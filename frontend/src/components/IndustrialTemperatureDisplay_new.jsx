// src/components/IndustrialTemperatureDisplay.jsx
import React from 'react'

const IndustrialTemperatureDisplay = ({ 
  temperature, 
  deviceName, 
  isActive = true 
}) => {
  // Lógica de colores basada en rangos de temperatura
  const getTemperatureColor = (temp, deviceName) => {
    if (!isActive) return '#6B7280' // gray-500 para dispositivos inactivos
    
    // Extraer el valor numérico de la temperatura
    let numericTemp = 0
    if (typeof temp === 'number' && !isNaN(temp)) {
      numericTemp = temp
    } else if (typeof temp === 'string' && !isNaN(parseFloat(temp))) {
      numericTemp = parseFloat(temp)
    } else if (temp && typeof temp === 'object' && temp.value !== undefined) {
      numericTemp = typeof temp.value === 'number' ? temp.value : parseFloat(temp.value) || 0
    }
    
    // Rangos específicos para Torre Fusora
    if (deviceName?.toLowerCase().includes('torre') || deviceName?.toLowerCase().includes('fusora')) {
      if (numericTemp < 710) return '#dc2626' // red-600
      if (numericTemp <= 780) return '#10b981' // green-500
      return '#dc2626' // red-600
    }
    
    // Rangos para otros dispositivos
    if (numericTemp < 710) return '#dc2626' // red-600
    if (numericTemp <= 750) return '#10b981' // green-500
    return '#dc2626' // red-600
  }

  const displayColor = getTemperatureColor(temperature, deviceName)
  
  // Formatear la temperatura para el display - manejar diferentes tipos de datos
  const formatTemperature = (temp) => {
    if (!isActive) return '---.-'
    
    // Si es un número, formatearlo
    if (typeof temp === 'number' && !isNaN(temp)) {
      return temp.toFixed(1)
    }
    
    // Si es una cadena que puede convertirse a número
    if (typeof temp === 'string' && !isNaN(parseFloat(temp))) {
      return parseFloat(temp).toFixed(1)
    }
    
    // Si es un objeto con propiedad value
    if (temp && typeof temp === 'object' && temp.value !== undefined) {
      if (typeof temp.value === 'number' && !isNaN(temp.value)) {
        return temp.value.toFixed(1)
      }
    }
    
    // Valor por defecto
    return '0.0'
  }
  
  const formattedTemp = formatTemperature(temperature)
  
  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Display industrial personalizado */}
      <div className="relative flex items-center">
        <div 
          className="
            font-mono text-4xl font-bold px-4 py-2 
            bg-black border-2 border-gray-600 rounded-md
            shadow-inner
          "
          style={{ 
            color: displayColor,
            fontFamily: 'Monaco, "Lucida Console", monospace',
            textShadow: `0 0 10px ${displayColor}`,
            backgroundColor: '#0a0a0a',
            borderColor: '#374151'
          }}
        >
          {formattedTemp}
        </div>
        
        {/* Unidad °C */}
        <div 
          className="ml-2 text-2xl font-bold"
          style={{ color: displayColor }}
        >
          °C
        </div>
      </div>
      
      {/* Indicador de estado */}
      <div className="flex items-center space-x-2">
        <div 
          className={`w-2 h-2 rounded-full ${
            isActive 
              ? 'bg-green-400 animate-pulse' 
              : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-gray-400">
          {isActive ? 'En línea' : 'Desconectado'}
        </span>
      </div>
    </div>
  )
}

export default IndustrialTemperatureDisplay
