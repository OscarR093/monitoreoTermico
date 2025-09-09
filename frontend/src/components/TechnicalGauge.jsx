import React from 'react'
import ReactECharts from 'echarts-for-react'

const TechnicalGauge = ({ value, max = 1000, equipmentName = '' }) => {
  const isValidNumber = typeof value === 'number' && !isNaN(value)
  
  // Función para obtener el color según los rangos específicos
  const getTemperatureColor = () => {
    if (!isValidNumber) return '#6B7280' // gray-500
    
    const temp = value
    const isTorreFusora = equipmentName === 'Torre Fusora'
    const minRange = 710
    const maxRange = isTorreFusora ? 780 : 750
    
    if (temp >= minRange && temp <= maxRange) {
      return '#10B981' // green-500
    } else {
      return '#EF4444' // red-500
    }
  }
  
  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 28,
            color: [
              [0.3, '#3B82F6'], // blue
              [0.7, '#F59E0B'], // amber  
              [0.85, '#10B981'], // green
              [1, '#EF4444'] // red
            ]
          }
        },
        pointer: {
          show: isValidNumber,
          length: '80%',
          width: 8,
          itemStyle: { color: '#DC2626' }
        },
        axisTick: { distance: -32, length: 12, lineStyle: { color: '#D1D5DB', width: 1.5 } },
        splitLine: { distance: -36, length: 24, lineStyle: { color: '#D1D5DB', width: 2.5 } },
        axisLabel: { distance: -48, color: '#F3F4F6', fontSize: 16 },
        detail: {
          show: false
        },
        data: [
          { value: isValidNumber ? value : 0 }
        ]
      }
    ],
    backgroundColor: 'transparent'
  }

  return (
    <div className='w-full flex flex-col items-center pb-8'>
      <div style={{ width: 480, height: 350, maxWidth: '100%' }}>
        <ReactECharts option={option} style={{ width: '100%', height: 350 }} />
      </div>
      <span className={isValidNumber
        ? `-mt-10 text-6xl font-black tracking-tight drop-shadow-lg select-none ${getTemperatureColor() === '#10B981' ? 'text-green-300' : 'text-red-300'}`
        : '-mt-10 text-2xl font-semibold text-gray-300 select-none'}
      >
        {isValidNumber ? `${value} °C` : 'Desconectado'}
      </span>
    </div>
  )
}

export default TechnicalGauge
