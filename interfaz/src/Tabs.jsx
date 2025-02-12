import { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import horno from "./assets/horno.gif";

const TabsComponent = () => {
  // Datos iniciales para cada pestaña
const [tabsData] = useState([
    { name: "Torre Fusora", temperature: "25°C", image: "" },
    { name: "Linea 1", temperature: "30°C", image: "" },
    { name: "Linea 2", temperature: "22°C", image: "" },
    { name: "Linea 3", temperature: "28°C", image: "" },
    { name: "Linea 4", temperature: "20°C", image: "" },
    { name: "Linea 7", temperature: "26°C", image: "" },
    { name: "Ep 1", temperature: "24°C", image: "" },
    { name: "Ep 2", temperature: "24°C", image: "" },
]);

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
        <p>Temperatura: {tab.temperature}</p>
        <img
            src={horno}
            alt={`Imagen de ${tab.name}`}
            style={{
              width: "300px", // Tamaño fijo
            height: "300px",
            display: "block",
              margin: "10px auto", // Centrar la imagen
              borderRadius: "10px", // Bordes redondeados opcional
            }}
        />
        </TabPanel>
    ))}
    </Tabs>
);
};

export default TabsComponent;
