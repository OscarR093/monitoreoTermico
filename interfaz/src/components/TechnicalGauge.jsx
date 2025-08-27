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
            width: 18,
            color: [
              [0.7, '#008FFB'],
              [0.8, '#00E396'],
              [1, '#FF4560']
            ]
          }
        },
        pointer: {
          show: isValidNumber,
          length: '70%',
          width: 6,
          itemStyle: { color: '#1f2937' }
        },
        axisTick: { distance: -22, length: 8, lineStyle: { color: '#888', width: 1 } },
        splitLine: { distance: -25, length: 18, lineStyle: { color: '#888', width: 2 } },
        axisLabel: { distance: -36, color: '#888', fontSize: 12 },
        detail: {
          valueAnimation: true,
          fontSize: isValidNumber ? 38 : 24,
          fontWeight: isValidNumber ? 900 : 600,
          color: isValidNumber ? '#1f2937' : '#888',
          offsetCenter: [0, '60%'],
          formatter: isValidNumber ? '{value} °C' : 'Desconectado',
        },
        data: [
          { value: isValidNumber ? value : 0 }
        ]
      }
    ]
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div style={{ width: 340, height: 220, maxWidth: '100%' }}>
        <ReactECharts option={option} style={{ width: '100%', height: 220 }} />
      </div>
    </div>
  );
};

export default TechnicalGauge;
