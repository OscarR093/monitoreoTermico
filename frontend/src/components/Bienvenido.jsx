import { useState, useEffect } from "react";
import api from '../../services/api';

function Bienvenido() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await api.get('/auth/check');
        setUserData(response.user);
      } catch (err) {
        setError('No se pudo cargar la información del usuario');
        console.error('Error al obtener userData:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  if (loading) return <div className="text-center text-2xl p-12 text-gray-600">Cargando...</div>;
  if (error) return <div className="text-center text-2xl p-12 text-red-600">{error}</div>;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700">Bienvenido, {userData?.fullName || "Usuario"}</h3>
    </div>
  );
}

export default Bienvenido;