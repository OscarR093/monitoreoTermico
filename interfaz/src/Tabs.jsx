import { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "./styles.css";
import horno from "./assets/horno.gif";
import logo from "./assets/fagorlogo.png";
import useWebSocket from "../services/webSocketService";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const TabsComponent = ({ onLogout }) => {
  const navigate = useNavigate();
  const [tabsData, setTabsData] = useState([
    { id: 1, name: "Torre Fusora", temperature: "Conectando...", image: "", tag: "TF" },
    { id: 2, name: "Linea 1", temperature: "Conectando...", image: "", tag: "L1" },
    { id: 3, name: "Linea 2", temperature: "Conectando...", image: "", tag: "L2" },
    { id: 4, name: "Linea 3", temperature: "Conectando...", image: "", tag: "L3" },
    { id: 5, name: "Linea 4", temperature: "Conectando...", image: "", tag: "L4" },
    { id: 6, name: "Linea 7", temperature: "Conectando...", image: "", tag: "L7" },
    { id: 7, name: "Ep 1", temperature: "Conectando...", image: "", tag: "EP1" },
    { id: 8, name: "Ep 2", temperature: "Conectando...", image: "", tag: "EP2" },
    { id: 9, name: "Ep 3", temperature: "Conectando...", image: "", tag: "EP3" },
  ]);
  const [userData, setUserData] = useState(null);

  // Llamar a useWebSocket sin pasar URL, dejando que el servicio decida
  useWebSocket(setTabsData);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const data = await api.get("/auth/check");
        setUserData(data.user);
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        navigate("/login");
      }
    }
    fetchUserData();
  }, [navigate]);

  const handleLogoutClick = async () => {
    await onLogout();
    navigate("/login");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleAdminClick = () => {
    console.log(userData.admin);
    navigate("/admin/users");
  };

  if (!userData) return <div>Cargando...</div>;

  return (
    <Tabs>
      <img src={logo} alt="Logo Fagor" />
      <h2>Monitoreo Térmico</h2>
      <h3>Bienvenido, {userData.fullName}</h3>
      <button onClick={handleLogoutClick} className="logout-button">
        Cerrar Sesión
      </button>
      <button onClick={handleSettingsClick} className="settings-button">
        Ajustes
      </button>
      {userData.admin && (
        <button onClick={handleAdminClick} className="admin-button">
          Gestión de Usuarios
        </button>
      )}

      <TabList>
        {tabsData.map((tab) => (
          <Tab key={tab.id}>{tab.name}</Tab>
        ))}
      </TabList>

      {tabsData.map((tab) => (
        <TabPanel key={tab.id} style={{ textAlign: "center" }}>
          <h2>{tab.name}</h2>
          <b style={{ fontSize: "30px" }}>Temperatura: {tab.temperature}</b>
          <img src={horno} alt={`Imagen de ${tab.name}`} className="graficoEnPantalla" />
        </TabPanel>
      ))}
    </Tabs>
  );
};

export default TabsComponent;