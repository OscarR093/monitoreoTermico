const WebSocket = require('ws');

const wss = new WebSocket.Server({ noServer: true });

let pythonClient = null; // Referencia al cliente Python
const reactClients = new Set(); // Conjunto de clientes React conectados

wss.on('connection', function connection(ws) {
    console.log('Cliente conectado');

    ws.on('message', function incoming(message) {
        const newMessage = message.toString("utf-8"); // Convertir el mensaje a string

        if (newMessage === "python-client") {
            console.log('Cliente Python conectado');
            pythonClient = ws; // Guardar referencia al cliente Python
            return;
        }

        if (newMessage === "react-client") {
            console.log('Cliente React conectado');
            reactClients.add(ws); // Añadir referencia al cliente React

            // Notificar al cliente Python que inicie el envío de datos
            if (pythonClient && pythonClient.readyState === WebSocket.OPEN) {
                pythonClient.send(JSON.stringify({ action: "start" }));
                console.log('Solicitud de inicio enviada al cliente Python.');
            }
            return;
        }

        // Si el mensaje proviene del cliente Python
        if (ws === pythonClient) {
            console.log('Mensaje recibido del cliente Python:', newMessage);
            let messageToSend;
        
            // Intentar parsear newMessage como JSON, si falla, tratarlo como string
            try {
                messageToSend = JSON.parse(newMessage); // Si es JSON válido, lo convierte en objeto
            } catch (error) {
                // Si no es JSON (como "python-client" o "action: start"), mantenerlo como string
                messageToSend = { message: newMessage }; // Envolver el string en un objeto
            }
        
            // Reenviar el mensaje a todos los clientes React conectados
            reactClients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    console.log('Enviando a React:', JSON.stringify(messageToSend)); // Para depurar
                    client.send(JSON.stringify(messageToSend)); // Enviar como JSON
                }
            });
        }
    });

    ws.on('close', () => {
        if (ws === pythonClient) {
            console.log('Cliente Python desconectado');
            pythonClient = null; // Eliminar referencia al cliente Python
        } else {
            console.log('Cliente React desconectado');
            reactClients.delete(ws); // Eliminar referencia al cliente React

            // Notificar al cliente Python que detenga el envío de datos si no hay clientes React
            if (reactClients.size === 0 && pythonClient && pythonClient.readyState === WebSocket.OPEN) {
                pythonClient.send(JSON.stringify({ action: "stop" }));
                console.log('Solicitud de detención enviada al cliente Python.');
            }
        }
    });

    ws.on('error', (error) => {
        console.error('Error en la conexión:', error);
    });
});

const getTemperatures = () => temperatures;
const addTemperature = (equipo, temperatura) => {
    temperatures[equipo] = temperatura;
};

module.exports = { wss, getTemperatures, addTemperature };
