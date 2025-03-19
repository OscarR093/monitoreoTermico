import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TabsComponent from "./Tabs";
import Login from "./Login";
import Settings from "./components/Settings";
import UserManagement from "./components/UserManagement";
import "./styles.css";
import { useState, useEffect } from "react";
import api from "./services/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await api.get("/auth/check"); // Usa api.get que devuelve solo data
        setUser(response.user || response); // Ajusta según la estructura del backend
        setIsAuthenticated(true);
      } catch (error) {
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
    if (loading) return <div className="loading">Cargando...</div>;
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to /login");
      return <Navigate to="/login" />;
    }
    if (adminOnly && !user?.admin) {
      return <Navigate to="/" />;
    }
    return children;
  };

  if (loading) return <div className="loading">Cargando...</div>;

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
              <TabsComponent onLogout={handleLogout} user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings onLogout={handleLogout} user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly={true}>
              <UserManagement user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;