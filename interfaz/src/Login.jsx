import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./services/api";
import "./styles.css";

function Login({ setIsAuthenticated, setUser }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Attempting login with:", { username, password });
      const response = await api.post("/login", { username, password });
      console.log("Login response:", response);
      setUser(response.user || response); // Ajusta según la estructura del backend
      setIsAuthenticated(true);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error.response?.status, error.response?.data);
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Usuario:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Contraseña:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default Login;