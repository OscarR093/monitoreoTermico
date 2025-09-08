import { WebSocketServer, WebSocket } from 'ws'
import mqtt from 'mqtt'
import { getHistoryModel } from './models/thermocouple-history.js'

// --- 1. CAMBIO: Importamos la configuración desde el punto central ---
import {
  MQTT_BROKER_URL,
  MQTT_USER,
  MQTT_PASS
} from './config.js'

// --- CONSTANTES DEL PROYECTO (Sin cambios) ---
const TOPIC_HISTORY = 'plcTemperaturas/historial/+'
const TOPIC_REALTIME = 'plcTemperaturas/tiemporeal/+'
const TOPIC_CONTROL = 'gatewayTemperaturas/control/tiemporeal'

// --- INICIALIZACIÓN Y CONEXIÓN (Refactorizada) ---
const wss = new WebSocketServer({ noServer: true })
// --- 2. CAMBIO: Usamos la variable de URL correcta ---
console.log(`Intentando conectar al broker MQTT en ${MQTT_BROKER_URL}...`)

// --- 3. CAMBIO: Conexión simplificada usando la URL completa ---
// La librería 'mqtt' extrae el protocolo, host y puerto de la URL.
const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
  username: MQTT_USER,
  password: MQTT_PASS
})

mqttClient.on('connect', () => {
  console.log('✅ Conectado exitosamente al broker MQTT.')
  mqttClient.subscribe([TOPIC_HISTORY, TOPIC_REALTIME]) // Buena práctica: suscribirse a varios temas a la vez
})

mqttClient.on('error', (error) => console.error('❌ Error en la conexión MQTT:', error))

// --- LÓGICA DE MANEJO DE MENSAJES (Sin cambios) ---
mqttClient.on('message', async (topic, payload) => {
  const messageStr = payload.toString()

  try {
    const messageJson = JSON.parse(messageStr)

    if (topic.startsWith('plcTemperaturas/historial/')) {
      if (messageJson.temperatura !== null && !isNaN(messageJson.temperatura)) {
        const equipmentName = messageJson.equipo
        console.log(`HISTORIAL: Recibido dato de ${equipmentName} para guardar en DB.`)

        try {
          const HistoryModel = getHistoryModel(equipmentName)
          const newHistoryEntry = new HistoryModel({
            timestamp: new Date(messageJson.timestamp * 1000),
            temperatura: messageJson.temperatura,
            equipo: equipmentName
          })
          await newHistoryEntry.save()
          console.log(`✅ Dato de ${equipmentName} guardado en la colección '${HistoryModel.collection.name}'.`)
        } catch (error) {
          console.error(`❌ Error al guardar en MongoDB para ${equipmentName}: ${error}`)
        }
      } else {
        console.log(`HISTORIAL: Dato de '${messageJson.equipo}' ignorado (temperatura inválida).`)
      }
    }

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr)
      }
    })
  } catch (error) {
    console.error('Error al procesar el mensaje MQTT:', error)
  }
})

// --- GESTIÓN DE CLIENTES WEBSOCKET (Sin cambios) ---
wss.on('connection', function connection (ws) {
  console.log(`WEB -> Cliente web conectado. Total: ${wss.clients.size}`)
  if (wss.clients.size === 1) {
    console.log('MQTT -> Enviando comando START al gateway...')
    mqttClient.publish(TOPIC_CONTROL, 'START')
  }
  ws.on('close', () => {
    console.log(`WEB -> Cliente web desconectado. Total: ${wss.clients.size}`)
    if (wss.clients.size === 0) {
      console.log('MQTT -> Enviando comando STOP al gateway...')
      mqttClient.publish(TOPIC_CONTROL, 'STOP')
    }
  })
  ws.on('error', (error) => console.error('WEB -> Error en cliente WebSocket:', error))
})

export { wss }
