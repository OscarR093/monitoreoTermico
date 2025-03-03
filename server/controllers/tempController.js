const { getApiTemperatures, addApiTemperature } = require('../models/temperatureModel');

exports.getTemperaturas = (req, res) => {
    res.json(getApiTemperatures());
};

exports.addTemperatura = (req, res) => {
    const { equipo, temperatura } = req.body;
    addApiTemperature(equipo, temperatura);
    res.status(201).send(`Temperatura agregada para ${equipo}`);
};
