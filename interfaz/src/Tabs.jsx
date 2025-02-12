import { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import horno from "./assets/horno.gif";

const TabsComponent = () => {
  const [tabsData, setTabsData] = useState([
    { name: "Torre Fusora", temperature: "Conectando...", image: "" },
    { name: "Linea 1", temperature: "30°C", image: "" },
    { name: "Linea 2", temperature: "22°C", image: "" },
    { name: "Linea 3", temperature: "28°C", image: "" },
    { name: "Linea 4", temperature: "20°C", image: "" },
    { name: "Linea 7", temperature: "26°C", image: "" },
    { name: "Ep 1", temperature: "24°C", image: "" },
    { name: "Ep 2", temperature: "24°C", image: "" },
  ]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("Conectado al servidor WebSocket");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newTemperature = data.message;
      console.log("Temperatura recibida:", newTemperature);

      setTabsData((prevTabsData) =>
        prevTabsData.map((tab) =>
          tab.name === "Torre Fusora"
            ? { ...tab, temperature: `${newTemperature}°C` }
            : tab
        )
      );
    };

    ws.onerror = (error) => {
      console.error("Error en la conexión WebSocket:", error);
    };

    ws.onclose = () => {
      console.log("Desconectado del servidor WebSocket");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <Tabs>
      <TabList>
        {tabsData.map((tab, index) => (
          <Tab key={index}>{tab.name}</Tab>
        ))}
      </TabList>

      {tabsData.map((tab, index) => (
        <TabPanel key={index} style={{ textAlign: "center" }}>
          <h2>{tab.name}</h2>
          <b>Temperatura: {tab.temperature}</b>
          <img
            src={horno}
            alt={`Imagen de ${tab.name}`}
            style={{
              width: "300px",
              height: "300px",
              display: "block",
              margin: "10px auto",
              borderRadius: "10px",
            }}
          />
        </TabPanel>
      ))}
    </Tabs>
  );
};

export default TabsComponent;