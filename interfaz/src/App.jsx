import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TabsComponent from "./Tabs";
import Login from "./Login";
import Settings from "./components/Settings";
import UserManagement from "./components/UserManagement";
// Elimina esta línea: import "./styles.css";
import "./index.css"
import { useState, useEffect } from "react";
import api from "./services/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await api.get("/auth/check");
        setUser(response.user || response);
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
    if (loading) return <div className="text-center text-2xl p-12 text-gray-600">Cargando...</div>;
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    if (adminOnly && !user?.admin) {
      return <Navigate to="/" />;
    }
    return children;
  };

  if (loading) return <div className="text-center text-2xl p-12 text-gray-600">Cargando...</div>;

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