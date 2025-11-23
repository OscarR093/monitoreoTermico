export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://devuser:devpassword@localhost:27017/monitoreoTermico?authSource=admin'
export const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey'
export const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883' // <-- Ajuste aquí
export const MQTT_USER = process.env.MQTT_USER || ''
export const MQTT_PASS = process.env.MQTT_PASS || ''
export const PORT = process.env.PORT || 3000
export const SALT_ROUNDS = 10
