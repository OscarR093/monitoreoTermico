// src/components/HistoryPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Line } from 'react-chartjs-2'
import Header from './Header'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
)

// --- Componentes de UI para estados ---
const LoadingSpinner = () => (
  <div className='flex flex-col items-center justify-center h-96'>
    <svg className='animate-spin h-10 w-10 text-red-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
    </svg>
    <p className='mt-4 text-lg font-semibold text-gray-300'>Cargando historial...</p>
  </div>
)

const ErrorMessage = ({ message }) => (
  <div className='flex flex-col items-center justify-center h-96 bg-red-900/20 border border-red-800 rounded-lg p-4'>
    <p className='text-lg font-bold text-red-300'>Ocurrió un error</p>
    <p className='mt-2 text-gray-400'>{message}</p>
  </div>
)

const EmptyState = () => (
  <div className='flex flex-col items-center justify-center h-96'>
    <p className='text-lg font-semibold text-gray-400'>No se encontraron datos históricos para este equipo.</p>
  </div>
)

const HistoryPage = ({ onLogout, user }) => {
  const { nombreEquipo } = useParams()
  const navigate = useNavigate()
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('chart') // Estado para controlar la vista: 'chart' o 'table'
  const [timeRange, setTimeRange] = useState(24) // Horas a mostrar: 6, 12, 24
  const scrollContainerRef = useRef(null)
  const chartRef = useRef(null)

  // Detectar si es móvil
  const isMobile = window.innerWidth < 768

  // Efecto para hacer scroll al final (derecha) cuando se carga la gráfica
  useEffect(() => {
    if (view === 'chart' && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
    }
  }, [historyData, view, timeRange])

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setLoading(true)
        const data = await api.get(`/thermocouple-history/${encodeURIComponent(nombreEquipo)}`)
        // Los datos ya vienen ordenados desde el backend (más recientes primero)
        // Para el gráfico necesitamos orden cronológico, para la tabla el orden actual
        setHistoryData(data)
      } catch (err) {
        setError('No se pudo cargar el historial. Intente de nuevo más tarde.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistoryData()
  }, [nombreEquipo])

  const handleBack = () => navigate('/')

  // Función para resetear zoom
  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom()
    }
  }

  // Filtrar datos según el rango de tiempo seleccionado
  const getFilteredData = () => {
    const now = new Date()
    const cutoffTime = new Date(now.getTime() - (timeRange * 60 * 60 * 1000))
    return historyData.filter(data => new Date(data.timestamp) >= cutoffTime)
  }

  // Datos filtrados y ordenados cronológicamente para el gráfico
  const filteredData = getFilteredData()
  const chartDataSorted = [...filteredData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  // En móvil, reducir puntos mostrando solo cada N puntos
  const samplingRate = isMobile && chartDataSorted.length > 50 ? Math.ceil(chartDataSorted.length / 50) : 1
  const sampledData = chartDataSorted.filter((_, index) => index % samplingRate === 0)

  const chartData = {
    labels: sampledData.map(data => new Date(data.timestamp).toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })),
    datasets: [{
      label: `Temperatura (°C) de ${nombreEquipo}`,
      data: sampledData.map(data => data.temperatura),
      borderColor: '#dc2626', // red-600
      backgroundColor: 'rgba(220, 38, 38, 0.1)', // red-600 con opacidad
      fill: true,
      tension: 0.3,
      pointBackgroundColor: '#dc2626', // red-600
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: isMobile ? 3 : 4,
      pointHoverRadius: isMobile ? 6 : 8,
      pointHoverBackgroundColor: '#b91c1c', // red-700
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 3
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e5e7eb', // gray-200
          font: {
            size: isMobile ? 12 : 14
          }
        }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: '#374151', // gray-700
        titleColor: '#f9fafb', // gray-50
        bodyColor: '#f9fafb', // gray-50
        borderColor: '#6b7280', // gray-500
        borderWidth: 1,
        titleFont: {
          size: isMobile ? 12 : 14
        },
        bodyFont: {
          size: isMobile ? 11 : 13
        }
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: !isMobile, // Deshabilitar zoom con rueda en móvil
            speed: 0.1
          },
          pinch: {
            enabled: true // Habilitar pinch zoom en móvil
          },
          mode: 'x'
        },
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: null // Permitir pan sin tecla modificadora
        },
        limits: {
          x: { min: 'original', max: 'original' }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#d1d5db', // gray-300
          maxRotation: isMobile ? 45 : 0,
          minRotation: isMobile ? 45 : 0,
          font: {
            size: isMobile ? 10 : 12
          }
        },
        grid: {
          color: '#4b5563' // gray-600
        }
      },
      y: {
        min: 600,
        max: 850,
        ticks: {
          color: '#d1d5db', // gray-300
          font: {
            size: isMobile ? 10 : 12
          }
        },
        grid: {
          color: '#4b5563' // gray-600
        }
      }
    }
  }

  return (
    <div className='min-h-screen font-sans bg-gray-900 text-gray-100'>
      <Header
        title={`Historial: ${nombreEquipo}`}
        user={user}
        onLogout={onLogout}
        showBackButton={true}
      />

      <main className='flex-1 overflow-y-auto mt-20 p-4 md:p-6'>
        <div className='bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-2xl'>
          {/* --- Selector de Vista (UI Mejorada) --- */}
          <div className='flex justify-center mb-4 bg-gray-700 rounded-lg p-1'>
            <button
              onClick={() => setView('chart')}
              className={`w-full py-2 px-4 font-semibold rounded-md transition-colors ${view === 'chart'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-600 hover:text-gray-100'
                }`}
            >
              Gráfica
            </button>
            <button
              onClick={() => setView('table')}
              className={`w-full py-2 px-4 font-semibold rounded-md transition-colors ${view === 'table'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-600 hover:text-gray-100'
                }`}
            >
              Tabla
            </button>
          </div>

          {/* --- Filtros de Tiempo (solo visible en vista de gráfica) --- */}
          {view === 'chart' && (
            <div className='mb-4'>
              <div className='flex flex-wrap gap-2 items-center justify-between'>
                <div className='flex gap-2'>
                  <button
                    onClick={() => setTimeRange(6)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === 6
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    6h
                  </button>
                  <button
                    onClick={() => setTimeRange(12)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === 12
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    12h
                  </button>
                  <button
                    onClick={() => setTimeRange(24)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === 24
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    24h
                  </button>
                </div>
                <button
                  onClick={handleResetZoom}
                  className='px-3 py-1.5 text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-md transition-colors'
                >
                  🔄 Reset Zoom
                </button>
              </div>
              <p className='text-xs text-gray-400 mt-2'>
                {isMobile ? '📱 Usa dos dedos para hacer zoom y arrastra para navegar' : '🖱️ Usa la rueda del ratón para zoom y arrastra para navegar'}
              </p>
            </div>
          )}

          {/* --- Contenido Dinámico --- */}
          {loading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && (
            historyData.length === 0
              ? <EmptyState />
              : (
                view === 'chart'
                  ? (
                    <div className='w-full'>
                      <div className='h-96 md:h-[500px] bg-gray-900 rounded-lg p-4'>
                        <Line ref={chartRef} data={chartData} options={chartOptions} />
                      </div>
                    </div>
                  )
                  : (
                    <div className='overflow-auto rounded-lg shadow-inner h-96 bg-gray-900 border border-gray-700'>
                      <table className='min-w-full divide-y divide-gray-700'>
                        <thead className='bg-gray-800 sticky top-0'>
                          <tr>
                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider'>Fecha y Hora</th>
                            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider'>Temperatura (°C)</th>
                          </tr>
                        </thead>
                        <tbody className='bg-gray-900 divide-y divide-gray-700'>
                          {historyData.map((data, index) => (
                            <tr key={index} className='hover:bg-gray-800 transition-colors'>
                              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200'>
                                {new Date(data.timestamp).toLocaleString('es-ES')}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-400'>
                                {data.temperatura}°C
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
              )
          )}
        </div>
      </main>
    </div>
  )
}

export default HistoryPage
