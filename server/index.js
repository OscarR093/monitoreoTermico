const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let pythonClient = null; // Referencia al cliente Python
let reactClient = null; // Referencia al cliente React
let escucha=false;

wss.on('connection', function connection(ws) {
    console.log('Cliente conectado');

    // Identificar el tipo de cliente
    ws.on('message', function incoming(message) {
        const newMessage = message.toString("utf-8"); // Convertir el mensaje a string

        if (newMessage === "python-client") {
            console.log('Cliente Python conectado');
            pythonClient = ws; // Guardar referencia al cliente Python
            return;
        }

        if (newMessage === "react-client") {
            console.log('Cliente React conectado');
            reactClient = ws; // Guardar referencia al cliente React

            // Notificar al cliente Python que inicie el envío de datos
            if (pythonClient && pythonClient.readyState === WebSocket.OPEN) {
                pythonClient.send(JSON.stringify({ action: "start" }));
                console.log('Solicitud de inicio enviada al cliente Python.');
                escucha=true;
            }
            return;
        }

        // Si el mensaje proviene del cliente Python y el cliente React está conectado
        if (escucha) {
            console.log('Mensaje recibido del cliente Python:', newMessage);

            // Reenviar el mensaje al cliente React
            reactClient.send(JSON.stringify({ message: `${newMessage}` }));
        }
    });

    // Manejar la desconexión de clientes
    ws.on('close', () => {
        if (ws === pythonClient) {
            console.log('Cliente Python desconectado');
            pythonClient = null; // Eliminar referencia al cliente Python
        }

        if (ws === reactClient) {
            console.log('Cliente React desconectado');
            reactClient = null; // Eliminar referencia al cliente React
            escucha=false

            // Notificar al cliente Python que detenga el envío de datos
            if (pythonClient && pythonClient.readyState === WebSocket.OPEN) {
                pythonClient.send(JSON.stringify({ action: "stop" }));
                console.log('Solicitud de detención enviada al cliente Python.');
            }
        }
    });

    ws.on('error', (error) => {
        console.error('Error en la conexión:', error);
    });
});

console.log('Servidor WebSocket corriendo en ws://localhost:8080');