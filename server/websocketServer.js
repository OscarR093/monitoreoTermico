// websocketServer.js
import { WebSocketServer, WebSocket } from 'ws'

const wss = new WebSocketServer({ noServer: true })

let pythonClient = null // Referencia al cliente Python
const reactClients = new Set() // Conjunto de clientes React conectados
const temperatures = {} // Objeto para almacenar temperaturas (lo añadí porque lo usas en getTemperatures/addTemperature)

wss.on('connection', function connection (ws) {
  console.log('Cliente conectado')

  ws.on('message', function incoming (message) {
    const newMessage = message.toString('utf-8') // Convertir el mensaje a string

    if (newMessage === 'python-client') {
      console.log('Cliente Python conectado')
      pythonClient = ws // Guardar referencia al cliente Python
      return
    }

    if (newMessage === 'react-client') {
      console.log('Cliente React conectado')
      reactClients.add(ws) // Añadir referencia al cliente React

      // Notificar al cliente Python que inicie el envío de datos
      if (pythonClient && pythonClient.readyState === WebSocket.OPEN) {
        pythonClient.send(JSON.stringify({ action: 'start' }))
        console.log('Solicitud de inicio enviada al cliente Python.')
      }
      return
    }

    // Si el mensaje proviene del cliente Python
    if (ws === pythonClient) {
      console.log('Mensaje recibido del cliente Python:', newMessage)
      let messageToSend

      // Intentar parsear newMessage como JSON, si falla, tratarlo como string
      try {
        messageToSend = JSON.parse(newMessage) // Si es JSON válido, lo convierte en objeto
      } catch (error) {
        // Si no es JSON, envolverlo en un objeto
        messageToSend = { message: newMessage }
      }

      // Reenviar el mensaje a todos los clientes React conectados
      reactClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          console.log('Enviando a React:', JSON.stringify(messageToSend))
          client.send(JSON.stringify(messageToSend))
        }
      })
    }
  })

  ws.on('close', () => {
    if (ws === pythonClient) {
      console.log('Cliente Python desconectado')
      pythonClient = null
    } else {
      console.log('Cliente React desconectado')
      reactClients.delete(ws)

      // Notificar al cliente Python que detenga el envío si no hay clientes React
      if (reactClients.size === 0 && pythonClient && pythonClient.readyState === WebSocket.OPEN) {
        pythonClient.send(JSON.stringify({ action: 'stop' }))
        console.log('Solicitud de detención enviada al cliente Python.')
      }
    }
  })

  ws.on('error', (error) => {
    console.error('Error en la conexión:', error)
  })
})

const getTemperatures = () => temperatures
const addTemperature = (equipo, temperatura) => {
  temperatures[equipo] = temperatura
}

export { wss, getTemperatures, addTemperature }
