// Modelo para almacenar temperaturas de la API
let apiTemperatures = {};

const getApiTemperatures = () => apiTemperatures;

const addApiTemperature = (equipo, temperatura) => {
    apiTemperatures[equipo] = temperatura;
};

module.exports = { getApiTemperatures, addApiTemperature };
