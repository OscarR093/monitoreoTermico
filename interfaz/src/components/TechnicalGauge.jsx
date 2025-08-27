//import React from 'react';
import GaugeChart from 'react-gauge-chart';

const TechnicalGauge = ({ value, max = 1000, chartId = 'gauge-chart' }) => {
  const isValidNumber = typeof value === 'number' && !isNaN(value);
  return (
    <div className="w-full flex flex-col items-center">
      <GaugeChart
        id={chartId}
        nrOfLevels={30}
        colors={["#008FFB", "#00E396", "#FF4560"]}
        arcWidth={0.3}
        percent={isValidNumber && max > 0 ? value / max : 0}
        textColor="#1f2937"
        formatTextValue={() => ''} // No mostrar valor dentro del gauge
        needleColor={isValidNumber ? "#1f2937" : "#e0e0e0"}
        needleBaseColor={isValidNumber ? "#1f2937" : "#e0e0e0"}
        style={{ width: '400px', height: '220px', maxWidth: '100%' }}
      />
      {isValidNumber ? (
        <span className="mt-4 text-6xl font-black text-slate-800 tracking-tight drop-shadow-lg select-none">
          {`${value} °C`}
        </span>
      ) : (
        <span className="mt-4 text-2xl font-semibold text-slate-500 select-none">
          Desconectado
        </span>
      )}
    </div>
  );
};

export default TechnicalGauge;
