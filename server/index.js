const express = require('express');
const http = require('http');
const { wss, getTemperatures, addTemperature } = require('./websocketServer');

const app = express();
app.use(express.json());

const server = http.createServer(app);

// Integrar WebSocket con el servidor HTTP
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Ruta HTTP para obtener temperaturas
app.get('/temperaturas', (req, res) => {
    res.json(getTemperatures());
});

// Ruta HTTP para agregar temperaturas
app.post('/temperaturas', (req, res) => {
    const { equipo, temperatura } = req.body;
    addTemperature(equipo, temperatura);
    res.status(201).send(`Temperatura agregada para ${equipo}`);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor HTTP corriendo en http://localhost:${PORT}`);
});
