export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
export const MQTT_USER = process.env.MQTT_USER;
export const MQTT_PASS = process.env.MQTT_PASS; // Usamos MQTT_PASS para ser consistentes con el .env
export const PORT = process.env.PORT || 3000;
export const SALT_ROUNDS = 10;