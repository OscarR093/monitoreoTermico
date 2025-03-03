import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Tabs from "./Tabs";
import Login from "./Login"; // Componente de login que crearemos
import "./styles.css";
import { useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación

  // Componente protegido para rutas autenticadas
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        {/* Ruta para el login */}
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        {/* Ruta protegida para Tabs */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Tabs />
            </ProtectedRoute>
          }
        />
        {/* Redirigir cualquier ruta desconocida al login o a la raíz */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;