// src/components/HistoryPage.jsx
import { useState, useEffect } from 'react'
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
  Filler // Importar para el relleno del área
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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

  // Datos ordenados cronológicamente para el gráfico (más antiguos a la izquierda)
  const chartDataSorted = [...historyData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  const chartData = {
    labels: chartDataSorted.map(data => new Date(data.timestamp).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' })),
    datasets: [{
      label: `Temperatura (°C) de ${nombreEquipo}`,
      data: chartDataSorted.map(data => data.temperatura),
      borderColor: '#dc2626', // red-600
      backgroundColor: 'rgba(220, 38, 38, 0.1)', // red-600 con opacidad
      fill: true,
      tension: 0.3,
      pointBackgroundColor: '#dc2626', // red-600
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#b91c1c', // red-700
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 3
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          color: '#e5e7eb', // gray-200
          font: {
            size: 14
          }
        }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: '#374151', // gray-700
        titleColor: '#f9fafb', // gray-50
        bodyColor: '#f9fafb', // gray-50
        borderColor: '#6b7280', // gray-500
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#d1d5db' // gray-300
        },
        grid: {
          color: '#4b5563' // gray-600
        }
      },
      y: { 
        min: 600, 
        max: 850,
        ticks: {
          color: '#d1d5db' // gray-300
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
          <div className='flex justify-center mb-6 bg-gray-700 rounded-lg p-1'>
            <button 
              onClick={() => setView('chart')} 
              className={`w-full py-2 px-4 font-semibold rounded-md transition-colors ${
                view === 'chart' 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-600 hover:text-gray-100'
              }`}
            >
              Gráfica
            </button>
            <button 
              onClick={() => setView('table')} 
              className={`w-full py-2 px-4 font-semibold rounded-md transition-colors ${
                view === 'table' 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-600 hover:text-gray-100'
              }`}
            >
              Tabla
            </button>
          </div>

          {/* --- Contenido Dinámico --- */}
          {loading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && (
            historyData.length === 0
              ? <EmptyState />
              : (
                  view === 'chart'
                    ? (
                      <div className='h-96 w-full bg-gray-900 rounded-lg p-4'>
                        <Line data={chartData} options={chartOptions} />
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
