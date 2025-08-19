// src/components/TemperatureGauge.jsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

const TemperatureGauge = ({ temperature }) => {
    const numericTemp = parseFloat(temperature) || 0;
    const MAX_TEMP = 1000;

    // Función para determinar el color basado en la temperatura
    const getColor = (temp) => {
        if (temp < 700) return '#008FFB'; // Azul
        if (temp <= 800) return '#00E396'; // Verde
        return '#FF4560'; // Rojo
    };

    const data = {
        datasets: [{
            label: 'Temperatura',
            // El primer valor es la temperatura, el segundo es lo que falta para llegar al máximo
            data: [numericTemp, MAX_TEMP - numericTemp],
            backgroundColor: [getColor(numericTemp), '#e0e0e0'], // Color dinámico y gris para el fondo
            borderColor: ['rgba(0, 0, 0, 0)'], // Sin borde
            circumference: 180, // Media rosquilla (180 grados)
            rotation: -90,      // Empieza desde la izquierda
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '80%', // El grosor del arco del medidor
        plugins: {
            tooltip: {
                enabled: false // Desactivamos el tooltip que aparece por defecto
            }
        }
    };

    // Plugin para dibujar el texto de la temperatura en el centro del gráfico
    const textCenterPlugin = {
        id: 'textCenter',
        beforeDatasetsDraw(chart) {
            const { ctx, width, height } = chart;
            ctx.save();
            ctx.font = 'bold 2rem sans-serif'; // Tamaño y fuente del texto
            ctx.fillStyle = '#1f2937'; // Color del texto
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const text = `${numericTemp}°C`;
            // Posicionamos el texto en el centro, ajustando la altura ligeramente
            ctx.fillText(text, width / 2, height * 0.85);
            ctx.restore();
        }
    };

    return (
        <div className="w-64 h-auto relative">
            <Doughnut
                data={data}
                options={options}
                plugins={[textCenterPlugin]}
            />
        </div>
    );
};

export default TemperatureGauge;