// src/components/IndustrialTemperatureDisplay.jsx
import React from 'react'

const IndustrialTemperatureDisplay = ({ 
  temperature, 
  deviceName, 
  isActive = true 
}) => {
  // Determinar si realmente tenemos datos válidos de temperatura
  const hasValidTemperature = temperature && 
    ((typeof temperature === 'number' && !isNaN(temperature) && temperature > 0) ||
     (typeof temperature === 'object' && temperature.value !== undefined && 
      typeof temperature.value === 'number' && !isNaN(temperature.value) && temperature.value > 0) ||
     (typeof temperature === 'string' && !isNaN(parseFloat(temperature)) && parseFloat(temperature) > 0))
  
  // El dispositivo está realmente activo solo si tiene datos válidos Y el flag isActive es true
  const isReallyActive = hasValidTemperature && isActive
  // Lógica de colores basada en rangos de temperatura
  const getTemperatureColor = (temp, deviceName) => {
    if (!isReallyActive) return '#6B7280' // gray-500 para dispositivos inactivos
    
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
    // Si no está activo o no hay datos válidos, mostrar guiones
    if (!isReallyActive) return '---.-'
    
    // Si es un número válido, formatearlo
    if (typeof temp === 'number' && !isNaN(temp) && temp > 0) {
      return temp.toFixed(1)
    }
    
    // Si es una cadena que puede convertirse a número válido
    if (typeof temp === 'string' && !isNaN(parseFloat(temp)) && parseFloat(temp) > 0) {
      return parseFloat(temp).toFixed(1)
    }
    
    // Si es un objeto con propiedad value válida
    if (temp && typeof temp === 'object' && temp.value !== undefined) {
      if (typeof temp.value === 'number' && !isNaN(temp.value) && temp.value > 0) {
        return temp.value.toFixed(1)
      }
    }
    
    // Si no hay datos válidos, mostrar guiones
    return '---.-'
  }
  
  const formattedTemp = formatTemperature(temperature)
  
  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Display industrial personalizado */}
      <div className="relative flex items-center">
        <div 
          className="
            text-5xl font-bold px-4 py-3 
            bg-black border-2 border-gray-600 rounded-md
            shadow-inner tracking-wider relative
          "
          style={{ 
            color: displayColor,
            fontFamily: '"DS-Digital", "Orbitron", "Share Tech Mono", monospace',
            textShadow: `0 0 3px ${displayColor}60`,
            backgroundColor: '#000000',
            borderColor: '#374151',
            letterSpacing: '0.15em',
            fontWeight: 'normal',
            textAlign: 'center',
            width: '180px',
            height: '70px',
            lineHeight: '1.2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `
              inset 0 2px 4px rgba(0,0,0,0.6),
              0 1px 3px rgba(0,0,0,0.3)
            `
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
            isReallyActive 
              ? 'bg-green-400 animate-pulse' 
              : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-gray-400">
          {isReallyActive ? 'En línea' : 'Desconectado'}
        </span>
      </div>
    </div>
  )
}

export default IndustrialTemperatureDisplay
