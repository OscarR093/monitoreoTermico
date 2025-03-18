import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles.css";

function Settings({ onLogout }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const data = await api.get('/auth/check');
        setUserData(data.user);
        setFormData({ fullName: data.user.fullName, email: data.user.email, password: "" });
      } catch (err) {
        setError('Error al cargar datos del usuario');
        console.error(err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {};
      if (formData.fullName) updatedData.fullName = formData.fullName;
      if (formData.email) updatedData.email = formData.email;
      if (formData.password) updatedData.password = formData.password;

      const response = await api.put(`/users/${userData.id}`, updatedData);
      setUserData(response);
      setFormData({ fullName: response.fullName, email: response.email, password: "" });
      alert('Usuario actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      alert('Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta?')) {
      try {
        await api.delete(`/users/${userData.id}`);
        await onLogout();
        navigate('/login');
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="settings-container">
      <h2>Ajustes de Cuenta</h2>
      <h3>Bienvenido, {userData.fullName}</h3>
      <form onSubmit={handleUpdateUser} className="settings-form">
        <div>
          <label>Nombre Completo:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Correo Electrónico:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Nueva Contraseña (dejar en blanco para no cambiar):</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Guardar Cambios</button>
      </form>
      <button onClick={handleDeleteUser} className="delete-button">
        Eliminar Cuenta
      </button>
      <button onClick={() => navigate('/')} className="back-button">
        Volver
      </button>
    </div>
  );
}

export default Settings;