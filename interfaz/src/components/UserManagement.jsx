import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles.css";

function UserManagement({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    admin: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get("/users");
        // response ya es el array de usuarios, no response.data
        const filteredUsers = response.filter((user) => !user.admin);
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Error fetching users:", err.response?.status, err.response?.data || err.message);
        setError("Error al cargar usuarios: " + (err.message || "Desconocido"));
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/register", formData);
      setUsers([...users, { id: response.id, ...formData }]); // Ajusta según la respuesta
      setFormData({ username: "", password: "", email: "", fullName: "", admin: false });
      alert("Usuario agregado correctamente");
    } catch (error) {
      console.error("Error al agregar usuario:", error.response?.status, error.response?.data);
      alert("Error al agregar usuario");
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${username}"?`)) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter((user) => user.id !== id));
        alert("Usuario eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar usuario:", error.response?.status, error.response?.data);
        alert("Error al eliminar usuario");
      }
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="loading">{error}</div>;

  return (
    <div className="settings-container">
      <h2>Gestión de Usuarios</h2>
      <p>Bienvenido, {user.fullName}</p>

      <div className="settings-form">
        <h3>Agregar Nuevo Usuario</h3>
        <form onSubmit={handleAddUser}>
          <div>
            <label>Nombre de usuario:</label>
            <input type="text" name="username" value={formData.username} onChange={handleInputChange} required />
          </div>
          <div>
            <label>Contraseña:</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
          </div>
          <div>
            <label>Correo Electrónico:</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div>
            <label>Nombre Completo:</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
          </div>
          <div>
            <label>
              Administrador:
              <input type="checkbox" name="admin" checked={formData.admin} onChange={handleInputChange} />
            </label>
          </div>
          <button type="submit">Agregar Usuario</button>
        </form>
      </div>

      <div className="user-list">
        <h3>Usuarios Actuales</h3>
        {users.length === 0 ? (
          <p>No hay usuarios registrados.</p>
        ) : (
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                {user.fullName} ({user.username}) - {user.email} - {user.admin ? "Admin" : "Usuario"}
                <button className="delete-button" onClick={() => handleDeleteUser(user.id, user.username)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="back-button" onClick={() => navigate("/")}>Volver</button>
    </div>
  );
}

export default UserManagement;