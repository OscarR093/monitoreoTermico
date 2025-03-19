import { useState } from "react";
import { Tab, Tabs as ReactTabs, TabList, TabPanel } from "react-tabs"; // Renombramos Tabs importado
import "react-tabs/style/react-tabs.css";
import "./styles.css";
import horno from "./assets/horno.gif";
import torre from "./assets/torreFusora.png"
import logo from "./assets/fagorlogo.png";
import useWebSocket from "./services/webSocketService";
import { useNavigate } from "react-router-dom";

const TabsComponent = ({ onLogout, user }) => { // Cambiamos Tabs a TabsComponent
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [tabsOpen, setTabsOpen] = useState(false);

  useWebSocket(setTabsData);

  const handleLogoutClick = async () => {
    await onLogout();
    navigate("/login");
    setMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    setMenuOpen(false);
  };

  const handleAdminClick = () => {
    navigate("/admin/users");
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setTabsOpen(false);
  };

  const toggleTabs = () => {
    setTabsOpen(!tabsOpen);
    setMenuOpen(false);
  };

  const handleTabSelect = () => {
    setTabsOpen(false);
  };

  if (!user) return null; // ProtectedRoute maneja la redirección

  return (
    <div className="tabs-wrapper">
      <div className="header">
        <img src={logo} alt="Logo Fagor" className="logo" />
        <h1>Monitoreo Térmico</h1>
        <h3>Bienvenido, {user.fullName}</h3>
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
        <div className={`button-group ${menuOpen ? "open" : ""}`}>
          <button onClick={handleSettingsClick} className="settings-button">
            Ajustes
          </button>
          {user.admin && (
            <button onClick={handleAdminClick} className="admin-button">
              Gestión de Usuarios
            </button>
          )}
          <button onClick={handleLogoutClick} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <button className="tabs-toggle" onClick={toggleTabs}>
        ☰ Pestañas
      </button>
      <ReactTabs className="react-tabs" onSelect={handleTabSelect}> {/* Usamos ReactTabs */}
        <TabList className={`react-tabs__tab-list ${tabsOpen ? "open" : ""}`}>
          {tabsData.map((tab) => (
            <Tab key={tab.id}>{tab.name}</Tab>
          ))}
        </TabList>

        {tabsData.map((tab) => (
          <TabPanel key={tab.id} className="react-tabs__tab-panel">
            <h2>{tab.name}</h2>
            <b className="temperature">Temperatura: {tab.temperature}</b>
            <img src={tab.name ==="Torre Fusora"? torre :horno} alt={`Imagen de ${tab.name}`} className="graficoEnPantalla" />
          </TabPanel>
        ))}
      </ReactTabs>
    </div>
  );
};

export default TabsComponent; // Exportamos como TabsComponent