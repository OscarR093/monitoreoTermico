import React from 'react';
import ReactApexChart from 'react-apexcharts';

const TechnicalGauge = ({ value, max = 1000 }) => {
  const isValidNumber = typeof value === 'number' && !isNaN(value);
  const percent = isValidNumber && max > 0 ? value / max : 0;

  const options = {
    chart: {
      type: 'radialBar',
      offsetY: -10,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 800 }
      },
      sparkline: { enabled: true }
    },
    plotOptions: {
      radialBar: {
        startAngle: -120,
        endAngle: 120,
        hollow: { size: '60%' },
        track: { background: '#e0e0e0', strokeWidth: '100%' },
        dataLabels: {
          name: { show: false },
          value: {
            show: true,
            fontSize: isValidNumber ? '3rem' : '2rem',
            fontWeight: isValidNumber ? 900 : 600,
            color: isValidNumber ? '#1f2937' : '#888',
            offsetY: 16,
            formatter: () => isValidNumber ? `${value} °C` : 'Desconectado',
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#00E396', '#FF4560'],
        inverseColors: false,
        stops: [0, 50, 100],
      },
      colors: ['#008FFB'],
    },
    stroke: { lineCap: 'round' },
    labels: ['Temperatura'],
  };

  const series = [isValidNumber ? Math.round(percent * 100) : 0];

  return (
    <div className="w-full flex flex-col items-center">
      <div style={{ width: 340, height: 220, maxWidth: '100%' }}>
        <ReactApexChart options={options} series={series} type="radialBar" height={220} />
      </div>
    </div>
  );
};

export default TechnicalGauge;
