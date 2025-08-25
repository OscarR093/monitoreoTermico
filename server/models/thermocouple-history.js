// models/thermocouple-history.js

import mongoose from 'mongoose'
const { Schema, model } = mongoose

// 1. Esquema simplificado para una ÚNICA lectura de historial
const historySchema = new Schema({
  timestamp: { type: Date, required: true },
  temperatura: { type: Number, required: true },
  equipo: { type: String, required: true }
})

// 2. Función "fábrica" que crea (o reutiliza) un modelo para una colección específica
export const getHistoryModel = (equipmentName) => {
  // 3. Convertimos el nombre del equipo a un nombre de colección válido y limpio
  // Ejemplo: "E. P. 1" se convierte en "e_p_1"
  const collectionName = equipmentName.replace(/[\s.]+/g, '_').toLowerCase()

  // 4. Mongoose crea el modelo para esa colección específica.
  // Se encarga de no crear duplicados si se llama a la función varias veces.
  return model(collectionName, historySchema)
}
