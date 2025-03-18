import { useState, useEffect } from "react";
import api from '../../services/api'; // Ajusta la ruta según tu estructura

function Bienvenido() {
  const [userData, setUserData] = useState(null); // Estado para los datos del usuario
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado para errores

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await api.get('/auth/check');
        setUserData(response.user); // Guardamos los datos del usuario (id, username)
      } catch (err) {
        setError('No se pudo cargar la información del usuario');
        console.error('Error al obtener userData:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []); // Array vacío para que se ejecute solo al montar el componente

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h3>Bienvenido, {userData?.fullName || "Usuario"}</h3>
    </div>
  );
}

export default Bienvenido;