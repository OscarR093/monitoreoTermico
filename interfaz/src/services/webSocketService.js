// src/hooks/useWebSocket.js
// Asumo que este archivo está en services/webSocketService.js como lo importas
import { useEffect, useState } from "react";

const useWebSocket = (setTabsData, setPlcStatus) => { // Renombré setThermopiles a setTabsData
  const [env, setEnv] = useState(null);

  // Obtener variables de entorno desde el servidor
  useEffect(() => {
    fetch("/api/env")
      .then((response) => response.json())
      .then((data) => {
        setEnv(data);
      })
      .catch((error) => {
        console.error("Error al obtener variables de entorno:", error);
        // Fallback a desarrollo si falla. ASEGÚRATE que este puerto sea el de tu servidor Node.js
        setEnv({ APP_ENV: "development", WS_HOST: "localhost:8080" }); 
      });
  }, []);

  // Configurar WebSocket cuando las variables estén disponibles
  useEffect(() => {
    if (!env) return; // Esperar hasta que env esté listo

    const isProduction = env.APP_ENV === "production";

    // ASEGÚRATE que este puerto (8080) coincida con tu WebSocketServer.js
    const wsUrl = isProduction ? `wss://${env.WS_HOST}` : `ws://${env.WS_HOST}`;
    
    const ws = new WebSocket(wsUrl);

    const handleOpen = () => {
      console.log("Conectado al servidor WebSocket");
      setPlcStatus('Conectado al servidor WebSocket'); // Usamos setPlcStatus del componente padre
      ws.send("react-client"); // Notificar al servidor que es un cliente React
    };

    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // console.log('Mensaje recibido en useWebSocket:', message); // Para depurar

        if (message.type === 'temperatures' && Array.isArray(message.data)) {
          // Recibimos el paquete consolidado de temperaturas
          setTabsData((prevTabsData) => { // Actualizamos prevTabsData
            const updatedTabsData = prevTabsData.map(tab => {
              // Buscar el termopar correspondiente por su 'nombre'
              const matchingThermopar = message.data.find(tp => tp.nombre === tab.name);

              if (matchingThermopar) {
                let displayTemperature = "---";
                if (matchingThermopar.estado === "conectado" && matchingThermopar.temperatura !== null) {
                  displayTemperature = `${matchingThermopar.temperatura.toFixed(1)}°C`;
                } else if (matchingThermopar.estado === "Estabilizando...") {
                  displayTemperature = "...";
                }
                
                return {
                  ...tab,
                  temperature: displayTemperature,
                  status: matchingThermopar.estado // También puedes guardar el estado si lo necesitas para estilos
                };
              }
              return tab; // Devolver el tab sin cambios si no hay termopar coincidente
            });
            return updatedTabsData;
          });
          setPlcStatus('Datos PLC recibidos.');
        } else if (message.type === 'status' && typeof message.message === 'string') {
          // Si recibimos un mensaje de estado global (ej. PLC no conectado)
          setPlcStatus(message.message);
          if (message.message.includes('PLC no conectado') || message.message.includes('Python PLC desconectado')) {
            setTabsData((prevTabsData) => {
              return prevTabsData.map(tab => ({
                ...tab,
                temperature: "---",
                status: "desconectado"
              }));
            });
          }
        } else {
          console.warn('Mensaje desconocido o con formato inesperado del servidor:', message);
        }
      } catch (error) {
        console.error("Error al parsear mensaje WebSocket:", error);
      }
    };

    const handleError = (error) => {
      console.error("Error en la conexión WebSocket:", error);
      setPlcStatus('Error en la conexión WebSocket.');
    };

    const handleClose = (event) => {
      console.log("Desconectado del servidor WebSocket. Código:", event.code, "Razón:", event.reason);
      setPlcStatus('Desconectado del servidor. Reconectando...');
      
      // Marcar todos los termopares como desconectados si la conexión WS se cierra
      setTabsData((prevTabsData) => {
        return prevTabsData.map(tab => ({
          ...tab,
          temperature: "---",
          status: "desconectado"
        }));
      });

      // Simple lógica de reconexión (puede ser más robusta)
      setTimeout(() => {
        console.log("Intentando reconectar al WebSocket...");
        // Al re-ejecutar el useEffect, se creará una nueva instancia de WebSocket
        // y se adjuntarán los manejadores nuevamente.
      }, 3000); 
    };

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("error", handleError);
    ws.addEventListener("close", handleClose);

    // Función de limpieza al desmontar el componente o al re-ejecutar el efecto
    return () => {
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("message", handleMessage);
      ws.removeEventListener("error", handleError);
      ws.removeEventListener("close", handleClose);
      ws.close();
    };
  }, [env, setTabsData, setPlcStatus]); // Dependencias ajustadas

  return null;
};

export default useWebSocket;