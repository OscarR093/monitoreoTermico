import dotenv from 'dotenv'
dotenv.config()
export const PORT = process.env.PORT// Puerto por defecto 3000 si no está en .env
export const SALT_ROUNDS = 10 // Valor fijo, no depende de .env
export const JWT_SECRET = process.env.JWT_SECRET // Secreto por defecto si no está en .env
