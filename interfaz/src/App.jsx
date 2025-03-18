import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Tabs from "./Tabs";
import Login from "./Login";
import "./styles.css";
import { useState, useEffect } from "react";
import api from '../services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/auth/check');
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        console.log(`ocurrio un error ${error}`)
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await api.post('/logout'); // Llama a la ruta de logout del backend
      setIsAuthenticated(false); // Actualiza el estado
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) return <div>Cargando...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Tabs onLogout={handleLogout} /> {/* Pasamos handleLogout como prop */}
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;