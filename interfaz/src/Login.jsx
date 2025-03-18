import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../services/api';
import "./styles.css";

function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { username, password }); // Ya incluye /api por baseURL
      setIsAuthenticated(true);
      navigate("/");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Usuario o contraseña incorrectos");
      } else {
        alert("Error en el servidor. Intenta de nuevo más tarde.");
      }
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Inicio de Sesión</h2>
      <h3>Monitoreo Térmico</h3>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuario"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
          />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default Login;