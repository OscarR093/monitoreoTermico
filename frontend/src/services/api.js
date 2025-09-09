import axios from 'axios'

const api = axios.create({
  baseURL: '/api', // URL base relativa
  withCredentials: true // Necesario para enviar cookies
})

// Interceptor para manejar errores 401 silenciosamente
api.interceptors.response.use(
  (response) => response, // Respuestas exitosas pasan sin cambios
  (error) => {
    if (error.response?.status === 401) {
      // No registramos el 401 en consola, ya que es esperado cuando no hay sesión
      return Promise.reject(error)
    }
    // Otros errores sí se registran para depuración
    console.error('Error inesperado en la solicitud:', error)
    return Promise.reject(error)
  }
)

// Funciones sin try-catch redundante
const get = (endpoint) => api.get(endpoint).then((response) => response.data)
const post = (endpoint, data) => api.post(endpoint, data).then((response) => response.data)
const put = (endpoint, data) => api.put(endpoint, data).then((response) => response.data)
const del = (endpoint) => api.delete(endpoint).then((response) => response.data)

export default { get, post, put, del }
