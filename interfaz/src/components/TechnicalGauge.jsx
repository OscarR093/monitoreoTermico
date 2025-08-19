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
      formatTextValue={() => `${value} °C`} // Se mantiene el formato para el gauge
      needleColor="#1f2937"
      needleBaseColor="#1f2937"
      style={{ width: '340px', height: '180px' }}
    />
    {/* Etiqueta de temperatura eliminada para evitar redundancia visual */}
  </div>
);

export default TechnicalGauge;
