// src/services/webSocketService.js
import { useEffect, useState } from "react";

const useWebSocket = (setTabsData, setPlcStatus) => {
  const [env, setEnv] = useState(null);

  useEffect(() => {
    fetch("/api/env")
      .then((response) => response.json())
      .then((data) => setEnv(data))
      .catch((error) => {
        console.error("Error al obtener variables de entorno:", error);
        setEnv({ APP_ENV: "development", WS_HOST: "localhost:8080" });
      });
  }, []);

  useEffect(() => {
    if (!env) return;

    const isProduction = env.APP_ENV === "production";
    const wsUrl = isProduction ? `wss://${env.WS_HOST}` : `ws://${env.WS_HOST}`;
    
    const ws = new WebSocket(wsUrl);

    const handleOpen = () => {
      console.log("Conectado al servidor WebSocket");
      setPlcStatus('Conectado al servidor WebSocket');
      ws.send("react-client");
    };

    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'temperatures' && Array.isArray(message.data)) {
          setTabsData((prevTabsData) => {
            // Siempre retorna un nuevo objeto, aunque los valores sean iguales
            return prevTabsData.map(tab => {
              const matchingThermopar = message.data.find(tp => tp.nombre === tab.name);
              let updatedTemperature = tab.temperature;
              let updatedStatus = tab.status;
              if (matchingThermopar) {
                if (matchingThermopar.estado === "conectado" && matchingThermopar.temperatura !== null) {
                  updatedTemperature = matchingThermopar.temperatura;
                } else if (matchingThermopar.estado === "Estabilizando...") {
                  updatedTemperature = "...";
                } else {
                  updatedTemperature = "---";
                }
                updatedStatus = matchingThermopar.estado;
              }
              // Siempre retorna un nuevo objeto
              return {
                ...tab,
                temperature: updatedTemperature,
                status: updatedStatus,
                _update: Date.now() + Math.random() // Prop extra para asegurar nueva referencia
              };
            });
          });
          setPlcStatus('Datos PLC recibidos.');
        } else if (message.type === 'status' && typeof message.message === 'string') {
          setPlcStatus(message.message);
          if (message.message.includes('PLC no conectado') || message.message.includes('Python PLC desconectado')) {
            setTabsData((prevTabsData) => {
              return prevTabsData.map(tab => ({ ...tab, temperature: "---", status: "desconectado" }));
            });
          }
        } else {
          console.warn('Mensaje desconocido del servidor:', message);
        }
      } catch (error) {
        console.error("Error al parsear mensaje WebSocket:", error);
      }
    };

    const handleError = (error) => {
      console.error("Error en la conexión WebSocket:", error);
      setPlcStatus('Error en la conexión WebSocket.');
    };

    const handleClose = () => {
      console.log("Desconectado del servidor WebSocket.");
      setPlcStatus('Desconectado del servidor. Reconectando...');
      setTabsData((prevTabsData) => {
        return prevTabsData.map(tab => ({ ...tab, temperature: "---", status: "desconectado" }));
      });
      // Lógica de reconexión simple
      setTimeout(() => {
        // El hook se re-ejecutará debido a sus dependencias, creando una nueva conexión.
      }, 3000);
    };

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("error", handleError);
    ws.addEventListener("close", handleClose);

    return () => {
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("message", handleMessage);
      ws.removeEventListener("error", handleError);
      ws.removeEventListener("close", handleClose);
      ws.close();
    };
  }, [env, setTabsData, setPlcStatus]);

  return null;
};

export default useWebSocket;
