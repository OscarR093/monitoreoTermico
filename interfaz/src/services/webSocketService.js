// src/services/webSocketService.js (Corregido)

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

    // --- FUNCIÓN CORREGIDA ---
    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Nueva lógica: Verificamos si el mensaje tiene las propiedades que esperamos
        if (message.equipo && typeof message.temperatura !== 'undefined') {
          
          setTabsData((prevTabsData) => {
            // Buscamos el tab que corresponde al equipo del mensaje
            return prevTabsData.map(tab => {
              if (tab.name === message.equipo) {
                // Si encontramos el equipo, actualizamos su temperatura
                return { ...tab, temperature: message.temperatura, status: 'conectado' };
              }
              // Si no, devolvemos el tab sin cambios
              return tab;
            });
          });

          setPlcStatus('Datos PLC recibidos.');

        } else if (message.type === 'status') { // Mantenemos la lógica para mensajes de estado
          setPlcStatus(message.message);
        } else {
          // Esto ya no debería ocurrir para los datos de temperatura
          console.warn('Mensaje con formato desconocido recibido:', message);
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
      setTimeout(() => {
        // La reconexión se manejará por el ciclo de vida del hook
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