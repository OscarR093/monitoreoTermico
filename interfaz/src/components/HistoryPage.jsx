// src/components/HistoryPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HistoryPage = ({ user, onLogout }) => {
  const { nombreEquipo } = useParams();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChart, setShowChart] = useState(true); // Cambiado a 'true' para que la gráfica sea la vista inicial

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/thermocouple-history/${encodeURIComponent(nombreEquipo)}`);
        setHistoryData(data);
      } catch (err) {
        setError("Error al cargar el historial. Intente de nuevo más tarde.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistoryData();
  }, [nombreEquipo]);

  const handleBack = () => {
    navigate("/");
  };

  const chartData = {
    labels: historyData.map(data => new Date(data.timestamp).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })),
    datasets: [{
      label: 'Temperatura (°C)',
      data: historyData.map(data => data.temperatura),
      borderColor: 'rgb(220, 38, 38)',
      backgroundColor: 'rgba(220, 38, 38, 0.5)',
      tension: 0.2,
      pointRadius: 5,
    }],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Temperatura de ${nombreEquipo}`,
        font: {
            size: 16
        }
      },
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Hora de medición'
            }
        },
        y: {
            title: {
                display: true,
                text: 'Temperatura (°C)'
            },
            min: 600,
            max: 850,
        }
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-100 text-gray-800">
      <header className="bg-white p-4 shadow-md flex items-center fixed top-0 left-0 w-full z-30">
        <button onClick={handleBack} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800">
          Volver
        </button>
        <h1 className="text-xl font-bold ml-4">Historial de {nombreEquipo}</h1>
      </header>

      <main className="flex-1 w-full mt-20 p-4 md:p-6 overflow-y-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {loading && <p className="text-center">Cargando historial...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && historyData.length === 0 && !error && (
            <p className="text-center text-gray-500">No se encontraron datos históricos.</p>
          )}

          {!loading && historyData.length > 0 && (
            showChart ? (
              <div className="h-96">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="overflow-auto rounded-lg shadow-inner h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Temperatura (°C)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyData.map((data, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {new Date(data.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {data.temperatura}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
          
          {/* El botón de alternancia ahora está debajo de la tabla/gráfica */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowChart(!showChart)}
              className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              {showChart ? "Ver Tabla" : "Ver Gráfica"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;