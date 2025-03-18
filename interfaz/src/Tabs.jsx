import { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "./styles.css";
import horno from "./assets/horno.gif";
import logo from "./assets/fagorlogo.png";
import useWebSocket from "../services/webSocketService";
import Bienvenido from "./components/Bienvenido";
import { useNavigate } from "react-router-dom";

const TabsComponent = ({ onLogout }) => { // Recibimos onLogout como prop
  const navigate = useNavigate(); // Para redirigir tras logout
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

  useWebSocket("ws://localhost:8080", setTabsData);

  // Función para manejar el cierre de sesión
  const handleLogoutClick = async () => {
    await onLogout(); // Llama a la función de logout pasada desde App
    navigate("/login"); // Redirige a la página de login
  };

  return (
    <Tabs>
      <img src={logo} alt="Logo Fagor" />
      <h2>Monitoreo Térmico</h2>
      <Bienvenido/>
      <button onClick={handleLogoutClick} className="logout-button">
        Cerrar Sesión
      </button>
      <TabList>
        {tabsData.map((tab) => (
          <Tab key={tab.id}>{tab.name}</Tab>
        ))}
      </TabList>

      {tabsData.map((tab) => (
        <TabPanel key={tab.id} style={{ textAlign: "center" }}>
          <h2>{tab.name}</h2>
          <b style={{ fontSize: "30px" }}>Temperatura: {tab.temperature}</b>
          <img
            src={horno}
            alt={`Imagen de ${tab.name}`}
            className="graficoEnPantalla"
          />
        </TabPanel>
      ))}
    </Tabs>
  );
};

export default TabsComponent;