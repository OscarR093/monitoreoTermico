const express = require('express');
const http = require('http');
const { wss } = require('./websocketServer');
const tempRoutes = require('./routes/temperatureRoutes');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config(); // Cargar variables de entorno desde .env

const app = express();
app.use(express.json());

// Integrar rutas de la API y usuarios
app.use('/api/temp', tempRoutes);
app.use('/api/users', userRoutes);

const server = http.createServer(app);

// Integrar WebSocket con el servidor HTTP
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor HTTP corriendo en http://localhost:${PORT}`);
});
