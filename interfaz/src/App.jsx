import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Tabs from "./Tabs"; // Ajusta el nombre si es diferente
import Login from "./Login";
import Settings from "./components/Settings";
import UserManagement from "./components/UserManagement"; // Nuevo componente
import "./styles.css";
import { useState, useEffect } from "react";
import api from "../services/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await api.get("/auth/check");
        setUser(response);
        setIsAuthenticated(true);
      } catch (error) {
        // El 401 es manejado por el interceptor, no hacemos nada aquí
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (loading) return <div>Cargando...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (adminOnly && !user?.admin) {
      return <Navigate to="/" />;
    }
    return children;
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Tabs onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly={true}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;