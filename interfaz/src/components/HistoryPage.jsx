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
    Filler // Importar para el relleno del área
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// --- Componentes de UI para estados ---
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-96">
        <svg className="animate-spin h-10 w-10 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg font-semibold text-gray-600">Cargando historial...</p>
    </div>
);

const ErrorMessage = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-96 bg-amber-50 rounded-lg p-4">
        <p className="text-lg font-bold text-amber-700">Ocurrió un error</p>
        <p className="mt-2 text-gray-600">{message}</p>
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-96">
        <p className="text-lg font-semibold text-gray-500">No se encontraron datos históricos para este equipo.</p>
    </div>
);


const HistoryPage = () => {
    const { nombreEquipo } = useParams();
    const navigate = useNavigate();
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('chart'); // Estado para controlar la vista: 'chart' o 'table'

    useEffect(() => {
        const fetchHistoryData = async () => {
            try {
                setLoading(true);
                const data = await api.get(`/thermocouple-history/${encodeURIComponent(nombreEquipo)}`);
                setHistoryData(data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))); // Ordenar por fecha
            } catch (err) {
                setError("No se pudo cargar el historial. Intente de nuevo más tarde.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistoryData();
    }, [nombreEquipo]);

    const handleBack = () => navigate("/");

    const chartData = {
        labels: historyData.map(data => new Date(data.timestamp).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' })),
        datasets: [{
            label: `Temperatura (°C) de ${nombreEquipo}`,
            data: historyData.map(data => data.temperatura),
            borderColor: '#334155', // slate-700
            backgroundColor: 'rgba(51, 65, 85, 0.1)', // slate-700 con opacidad
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#334155', // slate-700
            pointRadius: 3,
            pointHoverRadius: 6,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            title: { display: false },
        },
        scales: {
            y: { min: 600, max: 850 }
        }
    };

    return (
        <div className="min-h-screen font-sans bg-gray-100 text-gray-800">
            <header className="bg-white p-4 shadow-md flex items-center fixed top-0 left-0 w-full z-30">
                <button onClick={handleBack} className="bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-800 transition-colors">
                    Volver
                </button>
                <h1 className="text-xl font-bold ml-4">Historial: {nombreEquipo}</h1>
            </header>

            <main className="flex-1 w-full mt-20 p-4 md:p-6">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    {/* --- Selector de Vista (UI Mejorada) --- */}
                    <div className="flex justify-center mb-6 bg-gray-200 rounded-lg p-1">
                        <button onClick={() => setView('chart')} className={`w-full py-2 px-4 font-bold rounded-md transition-colors ${view === 'chart' ? 'bg-slate-700 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                            Gráfica
                        </button>
                        <button onClick={() => setView('table')} className={`w-full py-2 px-4 font-bold rounded-md transition-colors ${view === 'table' ? 'bg-slate-700 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                            Tabla
                        </button>
                    </div>

                    {/* --- Contenido Dinámico --- */}
                    {loading && <LoadingSpinner />}
                    {error && <ErrorMessage message={error} />}
                    {!loading && !error && (
                        historyData.length === 0 ? <EmptyState /> : (
                            view === 'chart' ? (
                                <div className="h-96 w-full">
                                    <Line data={chartData} options={chartOptions} />
                                </div>
                            ) : (
                                <div className="overflow-auto rounded-lg shadow-inner h-96">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Temperatura (°C)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {historyData.map((data, index) => (
                                                <tr key={index} className="hover:bg-gray-50 even:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(data.timestamp).toLocaleString('es-ES')}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{data.temperatura}</td>
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
    );
};

export default HistoryPage;