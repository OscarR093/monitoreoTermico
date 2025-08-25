// websocketServer.js con guardado dinámico en MongoDB

import { WebSocketServer, WebSocket } from 'ws'
import mqtt from 'mqtt'
// --- 1. CAMBIO: Importamos nuestra nueva "fábrica" de modelos ---
import { getHistoryModel } from './models/thermocouple-history.js'

// --- CONFIGURACIÓN (desde variables de entorno) ---
const MQTT_BROKER_HOST = process.env.MQTT_BROKER_HOST
const MQTT_BROKER_PORT = process.env.MQTT_BROKER_PORT
const MQTT_USER = process.env.MQTT_USER
const MQTT_PASSWORD = process.env.MQTT_PASSWORD

const TOPIC_HISTORY = 'plcTemperaturas/historial/+'
const TOPIC_REALTIME = 'plcTemperaturas/tiemporeal/+'
const TOPIC_CONTROL = 'gatewayTemperaturas/control/tiemporeal'

// --- INICIALIZACIÓN Y CONEXIÓN (Sin cambios) ---
const wss = new WebSocketServer({ noServer: true })
console.log(`Intentando conectar al broker MQTT en ${MQTT_BROKER_HOST}...`)

const mqttClient = mqtt.connect(MQTT_BROKER_HOST, {
  port: MQTT_BROKER_PORT,
  username: MQTT_USER,
  password: MQTT_PASSWORD,
  protocol: 'mqtts',
  rejectUnauthorized: true
})

mqttClient.on('connect', () => {
  console.log('✅ Conectado exitosamente al broker MQTT.')
  mqttClient.subscribe(TOPIC_HISTORY)
  mqttClient.subscribe(TOPIC_REALTIME)
})

mqttClient.on('error', (error) => console.error('❌ Error en la conexión MQTT:', error))

// --- 2. CAMBIO: LÓGICA DE MANEJO DE MENSAJES CON GUARDADO EN DB ---
mqttClient.on('message', async (topic, payload) => {
  const messageStr = payload.toString()

  try {
    const messageJson = JSON.parse(messageStr)

    // Verificamos si es un mensaje del tópico de historial
    if (topic.startsWith('plcTemperaturas/historial/')) {
      // Filtro: Solo guardamos si la temperatura no es null y es un número válido.
      if (messageJson.temperatura !== null && !isNaN(messageJson.temperatura)) {
        const equipmentName = messageJson.equipo
        console.log(`HISTORIAL: Recibido dato de ${equipmentName} para guardar en DB.`)

        try {
          // Usamos la "fábrica" para obtener el modelo de la colección correcta
          const HistoryModel = getHistoryModel(equipmentName)

          // Creamos el nuevo documento para la base de datos
          const newHistoryEntry = new HistoryModel({
            timestamp: new Date(messageJson.timestamp * 1000), // Convertimos timestamp Unix a objeto Date
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

    // El reenvío a los clientes web se hace para TODOS los mensajes (historial y tiempo real)
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
