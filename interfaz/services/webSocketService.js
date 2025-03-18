import { useEffect } from "react";

const useWebSocket = (setTabsData) => {
  useEffect(() => {
    // Determinar si estamos en producción o desarrollo usando Vite
    const isProduction = import.meta.env.VITE_APP_ENV === "production";
    
    // Construir la URL del WebSocket
    const wsUrl = isProduction
      ? `wss://${window.location.host}` // Render en producción
      : "ws://localhost:8080"; // Localhost en desarrollo

    console.log("Intentando conectar al WebSocket en:", wsUrl);

    const ws = new WebSocket(wsUrl);

    const handleOpen = () => {
      console.log("Conectado al servidor WebSocket");
      ws.send("react-client");
    };

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Datos recibidos:", data);

      const { equipo, temperatura } = data; // Extraer directamente del JSON
      console.log(equipo);
      if (equipo && temperatura !== undefined) {
        console.log(temperatura);
        setTabsData((prevTabsData) =>
          prevTabsData.map((tab) =>
            tab.tag === equipo ? { ...tab, temperature: `${temperatura}°C` } : tab
          )
        );
      }
    };

    const handleError = (error) => {
      console.error("Error en la conexión WebSocket:", error);
    };

    const handleClose = () => {
      console.log("Desconectado del servidor WebSocket");
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
  }, [setTabsData]);
};

export default useWebSocket;