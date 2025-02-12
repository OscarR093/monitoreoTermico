const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    console.log('Cliente conectado');

    // Escuchar mensajes entrantes
    ws.on('message', function incoming(message) {
        console.log('Mensaje recibido: %s', message);

        // Reenviar el mensaje a todos los clientes conectados
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) { // Verificar que el cliente esté conectado
                client.send(JSON.stringify({ message: `${message}` }));
            }
        });
    });

    ws.on('close', () => {
        console.log('Cliente desconectado');
    });

    ws.on('error', (error) => {
        console.error('Error en la conexión:', error);
    });
});

console.log('Servidor WebSocket corriendo en ws://localhost:8080');