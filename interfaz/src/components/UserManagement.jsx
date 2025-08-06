import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

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
      setUsers([...users, { id: response.id, ...formData }]);
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
        await api.del(`/users/${id}`);
        setUsers(users.filter((user) => user.id !== id));
        alert("Usuario eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar usuario:", error.response?.status, error.response?.data);
        alert("Error al eliminar usuario");
      }
    }
  };

  // Clases con la paleta blanco, negro y rojo
  if (loading) return <div className="flex items-center justify-center h-screen bg-white text-xl font-bold text-black">Cargando...</div>;
  if (error) return <div className="flex items-center justify-center h-screen bg-white text-xl font-bold text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6 sm:p-8 text-center text-black">
        <h2 className="text-3xl font-extrabold text-red-600 mb-2">Gestión de Usuarios</h2>
        <p className="text-lg text-black mb-6">Bienvenido, {user.fullName}</p>
        
        {/* Sección de Agregar Nuevo Usuario */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-black/10 shadow-md">
          <h3 className="text-2xl font-bold text-red-600 mb-5">Agregar Nuevo Usuario</h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <label className="block text-sm font-semibold mb-1 text-black">Nombre de usuario:</label>
              <input type="text" name="username" value={formData.username} onChange={handleInputChange} required 
                className="w-full p-3 rounded-md bg-white text-black border border-black/30 focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-200" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-black">Contraseña:</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} required 
                className="w-full p-3 rounded-md bg-white text-black border border-black/30 focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-200" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-black">Correo Electrónico:</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required 
                className="w-full p-3 rounded-md bg-white text-black border border-black/30 focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-200" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-black">Nombre Completo:</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required 
                className="w-full p-3 rounded-md bg-white text-black border border-black/30 focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-200" />
            </div>
            <div className="flex items-center gap-2 mt-2 md:col-span-2">
              <input type="checkbox" name="admin" checked={formData.admin} onChange={handleInputChange} 
                className="form-checkbox h-5 w-5 text-red-600 rounded border-black/30 focus:ring-red-600" />
              <label className="text-sm font-semibold text-black">Administrador</label>
            </div>
            <button type="submit" 
              className="bg-red-600 text-white font-bold py-3 px-6 rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition duration-200 md:col-span-2">
              Agregar Usuario
            </button>
          </form>
        </div>
        
        {/* Sección de Usuarios Actuales */}
        <div className="bg-white rounded-lg p-6 border border-black/10 shadow-md">
          <h3 className="text-2xl font-bold text-red-600 mb-5">Usuarios Actuales</h3>
          {users.length === 0 ? (
            <p className="text-black/80">No hay usuarios registrados.</p>
          ) : (
            <ul className="divide-y divide-black/10">
              {users.map((user) => (
                <li key={user.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4">
                  <div className="flex-grow text-left mb-2 sm:mb-0">
                    <span className="block font-semibold text-black">{user.fullName} ({user.username})</span>
                    <span className="block text-black/80">{user.email} - {user.admin ? "Admin" : "Usuario"}</span>
                  </div>
                  <button 
                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-200 w-full sm:w-auto"
                    onClick={() => handleDeleteUser(user.id, user.username)}>
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Botón Volver */}
        <button 
          className="mt-8 bg-black text-white font-bold py-3 px-6 rounded-md shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black transition duration-200"
          onClick={() => navigate("/")}>
          Volver
        </button>
      </div>
    </div>
  );
}

export default UserManagement;