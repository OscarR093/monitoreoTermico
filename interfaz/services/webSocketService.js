import { useEffect } from "react";

const useWebSocket = (setTabsData) => {
  useEffect(() => {
    const isProduction = import.meta.env.VITE_APP_ENV === "production";
    console.log("Valor de VITE_APP_ENV:", import.meta.env.VITE_APP_ENV);
    console.log("¿Es producción?:", isProduction);

    const wsUrl = isProduction
      ? `wss://${window.location.host}`
      : "ws://localhost:8080";

    console.log("Intentando conectar al WebSocket en:", wsUrl);

    const ws = new WebSocket(wsUrl);

    const handleOpen = () => {
      console.log("Conectado al servidor WebSocket");
      ws.send("react-client");
    };

    const handleMessage = (event) => {
      console.log("Datos recibidos:", JSON.parse(event.data));
      const { equipo, temperatura } = JSON.parse(event.data);
      if (equipo && temperatura !== undefined) {
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

    const handleClose = (event) => {
      console.log("Desconectado del servidor WebSocket. Código:", event.code, "Razón:", event.reason);
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