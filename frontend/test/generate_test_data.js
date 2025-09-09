// generate_test_data.js
import axios from 'axios'
// import { MONGODB_URI } from './config.js'; // Asegúrate de que este archivo exista

// Lista de equipos de tu interfaz
const equipos = [
  { id: 1, name: 'Torre Fusora' },
  { id: 2, name: 'Linea 1' },
  { id: 3, name: 'Linea 2' },
  { id: 4, name: 'Linea 3' },
  { id: 5, name: 'Linea 4' },
  { id: 6, name: 'Linea 7' },
  { id: 7, name: 'Estacion 1' },
  { id: 8, name: 'Estacion 2' }
]

const apiEndpoint = 'http://localhost:8080/api/thermocouple-data' // Ajusta el puerto si es diferente

async function generateData () {
  try {
    console.log('Generando y enviando datos de prueba...')

    const numRegistros = 24
    const minTemp = 650
    const maxTemp = 800

    // Calcular el timestamp para el primer registro (hace 12 horas)
    const currentTime = new Date()
    currentTime.setHours(currentTime.getHours() - 12)

    for (let i = 0; i < numRegistros; i++) {
      const payload = {
        // Enviar el timestamp calculado para cada registro
        timestamp: currentTime.toISOString(),
        data: equipos.map(equipo => {
          const temperatura = (Math.random() * (maxTemp - minTemp) + minTemp).toFixed(2)
          const estado = 'conectado'

          return {
            termopar: equipo.id,
            nombre: equipo.name,
            temperatura: parseFloat(temperatura),
            estado
          }
        })
      }

      // Enviar el payload a tu servidor
      await axios.post(apiEndpoint, payload)
      console.log(`Registro ${i + 1} de ${numRegistros} enviado con timestamp: ${payload.timestamp}`)

      // Incrementar el tiempo en 30 minutos para el próximo registro
      currentTime.setMinutes(currentTime.getMinutes() + 30)
    }

    console.log('Datos de prueba enviados exitosamente.')
  } catch (error) {
    console.error('Error al generar o enviar datos de prueba:', error.message)
  }
}

generateData()
