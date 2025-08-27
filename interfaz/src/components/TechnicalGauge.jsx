import React from 'react';
import ReactECharts from 'echarts-for-react';

const TechnicalGauge = ({ value, max = 1000 }) => {
  const isValidNumber = typeof value === 'number' && !isNaN(value);
  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: max,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 28,
            color: [
              [0.7, '#008FFB'],
              [0.8, '#00E396'],
              [1, '#FF4560']
            ]
          }
        },
        pointer: {
          show: isValidNumber,
          length: '80%',
          width: 8,
          itemStyle: { color: '#1f2937' }
        },
        axisTick: { distance: -32, length: 12, lineStyle: { color: '#888', width: 1.5 } },
        splitLine: { distance: -36, length: 24, lineStyle: { color: '#888', width: 2.5 } },
        axisLabel: { distance: -48, color: '#888', fontSize: 16 },
        detail: {
          show: false,
        },
        data: [
          { value: isValidNumber ? value : 0 }
        ]
      }
    ]
  };

  return (
    <div className="w-full flex flex-col items-center pb-8">
      <div style={{ width: 480, height: 350, maxWidth: '100%' }}>
        <ReactECharts option={option} style={{ width: '100%', height: 350 }} />
      </div>
      <span className={isValidNumber
        ? "mt-2 text-6xl font-black text-slate-800 tracking-tight drop-shadow-lg select-none"
        : "mt-2 text-2xl font-semibold text-slate-500 select-none"}
      >
        {isValidNumber ? `${value} °C` : 'Desconectado'}
      </span>
    </div>
  );
};

export default TechnicalGauge;
