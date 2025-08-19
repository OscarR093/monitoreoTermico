// websocketServer.js
import { WebSocketServer, WebSocket } from 'ws'

const wss = new WebSocketServer({ noServer: true })

let pythonClient = null // Referencia al cliente Python
const reactClients = new Set() // Conjunto de clientes React conectados

// Objeto para almacenar la última instantánea de temperaturas y estados de los termopares
// Inicialmente vacío, se llenará con los datos del Python client
const currentThermopileData = {}

wss.on('connection', function connection (ws) {
  console.log('Cliente conectado')

  ws.on('message', function incoming (message) {
    const newMessage = message.toString('utf-8') // Convertir el mensaje a string

    // Identificación de clientes
    if (newMessage === 'python-client') {
      console.log('Cliente Python conectado')
      pythonClient = ws // Guardar referencia al cliente Python
      return
    }

    if (newMessage === 'react-client') {
      console.log('Cliente React conectado')
      reactClients.add(ws) // Añadir referencia al cliente React

      // Notificar al cliente Python que inicie el envío de datos
      // ¡Importante! También envía los datos actuales si ya están disponibles.
      if (pythonClient && pythonClient.readyState === WebSocket.OPEN) {
        pythonClient.send(JSON.stringify({ action: 'start' }))
        console.log('Solicitud de inicio enviada al cliente Python.')

        // Si ya tenemos datos del PLC, envíaselos inmediatamente al nuevo React client
        if (Object.keys(currentThermopileData).length > 0) {
          console.log('Enviando datos actuales a nuevo cliente React:', currentThermopileData)
          ws.send(JSON.stringify({ type: 'temperatures', data: Object.values(currentThermopileData) }))
        } else {
          // Podrías enviar un mensaje indicando que los datos aún no están disponibles
          ws.send(JSON.stringify({ type: 'status', message: 'Esperando datos del PLC...' }))
        }
      } else {
        // Si no hay cliente Python conectado, notifica al cliente React
        ws.send(JSON.stringify({ type: 'status', message: 'Cliente Python PLC no conectado. No hay datos disponibles.' }))
      }
      return
    }

    // Si el mensaje proviene del cliente Python
    if (ws === pythonClient) {
      // console.log('Mensaje recibido del cliente Python (raw):', newMessage) // Descomentar para depurar el mensaje crudo

      let parsedMessage
      try {
        parsedMessage = JSON.parse(newMessage) // Parsear el JSON enviado por Python
      } catch (error) {
        console.error('Error al parsear JSON del cliente Python:', error.message)
        // Si no es JSON válido, no podemos procesarlo como esperado.
        // Podrías enviar un error a los clientes React o simplemente ignorarlo.
        return
      }

      // --- AQUÍ ES DONDE PROCESAMOS EL JSON CONSOLIDADO ---
      if (parsedMessage.type === 'temperatures' && Array.isArray(parsedMessage.data)) {
        console.log('Datos de temperaturas consolidados recibidos de Python.')

        // Actualizar el estado local `currentThermopileData` con los nuevos datos

        // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
        // === CORRECCIÓN ===
        // Cambiamos la forma en que se guarda la información en la caché.
        // En lugar de usar una clave "termopar" que no existe, usamos "nombre".
        // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼

        parsedMessage.data.forEach(tp => {
          // LÍNEA ORIGINAL (INCORRECTA):
          // currentThermopileData[`Termopar_${tp.termopar}`] = tp

          // LÍNEA CORREGIDA:
          // Usamos el nombre del equipo como clave única, que sí viene en los datos.
          currentThermopileData[tp.nombre] = tp
        })

        // Reenviar el mensaje completo (tal cual) a todos los clientes React conectados
        reactClients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(parsedMessage))
          }
        })
      } else if (parsedMessage.type === 'status' && typeof parsedMessage.message === 'string') {
        // ... (resto del código sin cambios)
        console.log(`Mensaje de estado de Python: ${parsedMessage.message}`)

        // Si el PLC se desconecta, podrías querer "limpiar" los datos actuales
        // o actualizar el estado de cada termopar a "desconectado"
        if (parsedMessage.message === 'PLC no conectado') {
          Object.keys(currentThermopileData).forEach(key => {
            currentThermopileData[key].estado = 'desconectado'
            currentThermopileData[key].temperatura = null
          })
          console.log('Estado de todos los termopares actualizado a "desconectado" debido a PLC global.')
          // Opcional: Podrías querer enviar un paquete de temperaturas con todos los estados en 'desconectado'
          // en lugar de solo el mensaje de status.
        }

        // Reenviar el mensaje de estado a todos los clientes React
        reactClients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(parsedMessage))
          }
        })
      } else {
        console.log('Mensaje de Python con formato desconocido:', parsedMessage)
        // Si es otro tipo de mensaje de Python no esperado, reenviarlo como está o manejarlo.
        reactClients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(parsedMessage))
          }
        })
      }
    }
  })

  ws.on('close', () => {
    if (ws === pythonClient) {
      console.log('Cliente Python desconectado')
      pythonClient = null

      // Cuando el Python client se desconecta, actualiza los datos en el servidor
      // y notifica a los clientes React que los datos ya no están disponibles.
      Object.keys(currentThermopileData).forEach(key => {
        currentThermopileData[key].estado = 'desconectado'
        currentThermopileData[key].temperatura = null
      })
      reactClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'status', message: 'Cliente Python PLC desconectado. Datos no disponibles.' }))
          // También podrías enviar el último paquete de temperaturas con todos los estados en "desconectado"
          client.send(JSON.stringify({ type: 'temperatures', data: Object.values(currentThermopileData) }))
        }
      })
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

// Función para obtener los últimos datos de temperaturas (si se necesitan en otras partes de tu app Node.js)
const getTemperatures = () => Object.values(currentThermopileData)

// No necesitamos addTemperature aquí ya que los datos vienen del Python client
// const addTemperature = (equipo, temperatura) => {
//   temperatures[equipo] = temperatura
// }

export { wss, getTemperatures }
