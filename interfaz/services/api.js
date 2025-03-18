import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // URL base relativa
  withCredentials: true, // Necesario para enviar cookies
});

// Función genérica para realizar una solicitud GET
const get = async (endpoint) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud GET:', error);
    throw error;
  }
};

// Función genérica para realizar una solicitud POST
const post = async (endpoint, data) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud POST:', error);
    throw error;
  }
};

// Función genérica para realizar una solicitud PUT
const put = async (endpoint, data) => {
  try {
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud PUT:', error);
    throw error;
  }
};

// Función genérica para realizar una solicitud DELETE
const del = async (endpoint) => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud DELETE:', error);
    throw error;
  }
};

export default { get, post, put, del };
