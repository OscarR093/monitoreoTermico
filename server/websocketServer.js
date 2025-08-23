// websocketServer.js con MQTT

import { WebSocketServer, WebSocket } from 'ws'
import mqtt from 'mqtt'

// --- 1. CONFIGURACIÓN ---
const MQTT_BROKER_HOST = process.env.MQTT_BROKER_HOST
const MQTT_BROKER_PORT = process.env.MQTT_BROKER_PORT
const MQTT_USER = process.env.MQTT_USER
const MQTT_PASSWORD = process.env.MQTT_PASSWORD

// Tópicos a los que nos suscribiremos (el '+' es un comodín para todos los equipos)
const TOPIC_HISTORY = 'plcTemperaturas/historial/+'
const TOPIC_REALTIME = 'plcTemperaturas/tiemporeal/+'
const TOPIC_CONTROL = 'gatewayTemperaturas/control/tiemporeal'

// --- 2. INICIALIZACIÓN DEL SERVIDOR WEBSOCKET ---
const wss = new WebSocketServer({ noServer: true })

// --- 3. CONEXIÓN AL BROKER MQTT ---
console.log('Intentando conectar al broker MQTT...')

const mqttClient = mqtt.connect(MQTT_BROKER_HOST, {
  port: MQTT_BROKER_PORT,
  username: MQTT_USER,
  password: MQTT_PASSWORD,
  protocol: 'mqtts',
  rejectUnauthorized: true // Asegúrate de que tu certificado sea válido
})

mqttClient.on('connect', () => {
  console.log('✅ Conectado exitosamente al broker MQTT.')

  // Suscribirse a los tópicos de datos
  mqttClient.subscribe(TOPIC_HISTORY, (err) => {
    if (!err) console.log(`Suscrito al tópico de historial: ${TOPIC_HISTORY}`)
  })
  mqttClient.subscribe(TOPIC_REALTIME, (err) => {
    if (!err) console.log(`Suscrito al tópico de tiempo real: ${TOPIC_REALTIME}`)
  })
})

mqttClient.on('error', (error) => {
  console.error('❌ Error en la conexión MQTT:', error)
})

// --- 4. LÓGICA DE REENVÍO DE DATOS ---
// Cuando llega un mensaje del broker, lo reenviamos a todos los clientes web
mqttClient.on('message', (topic, payload) => {
  const messageStr = payload.toString()
  console.log(`Mensaje recibido del broker en topic '${topic}': ${messageStr}`)

  // Reenviar a todos los clientes WebSocket conectados
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // El payload ya es un JSON, lo enviamos tal cual
      client.send(messageStr)
    }
  })
})

// --- 5. GESTIÓN DE CLIENTES WEBSOCKET ---
wss.on('connection', function connection (ws) {
  console.log(`Cliente web conectado. Total de clientes: ${wss.clients.size}`)

  // Si este es el PRIMER cliente en conectarse, enviamos el comando START
  if (wss.clients.size === 1) {
    console.log('Enviando comando START al gateway...')
    mqttClient.publish(TOPIC_CONTROL, 'START')
  }

  ws.on('close', () => {
    console.log(`Cliente web desconectado. Total de clientes: ${wss.clients.size}`)

    // Si este era el ÚLTIMO cliente, enviamos el comando STOP
    if (wss.clients.size === 0) {
      console.log('Enviando comando STOP al gateway...')
      mqttClient.publish(TOPIC_CONTROL, 'STOP')
    }
  })

  ws.on('error', (error) => {
    console.error('Error en cliente WebSocket:', error)
  })
})

// Exporta el wss para que pueda ser adjuntado a tu servidor HTTP
// (Asumo que tienes un `server.js` o `index.js` que hace esto)
export { wss }
