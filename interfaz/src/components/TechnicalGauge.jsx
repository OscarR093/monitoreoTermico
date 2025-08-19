//import React from 'react';
import GaugeChart from 'react-gauge-chart';

const TechnicalGauge = ({ value, max = 1000 }) => (
  <div className="w-full flex flex-col items-center">
    <GaugeChart
      id="gauge-chart"
      nrOfLevels={30}
      colors={["#008FFB", "#00E396", "#FF4560"]}
      arcWidth={0.3}
      percent={typeof value === 'number' && max > 0 ? value / max : 0}
      textColor="#1f2937"
      formatTextValue={() => ''} // No mostrar valor dentro del gauge
      needleColor="#1f2937"
      needleBaseColor="#1f2937"
  style={{ width: '400px', height: '220px', maxWidth: '100%' }}
    />
    <span className="mt-4 text-6xl font-black text-slate-800 tracking-tight drop-shadow-lg select-none">
      {typeof value === 'number' ? `${value} °C` : value}
    </span>
  </div>
);

export default TechnicalGauge;
