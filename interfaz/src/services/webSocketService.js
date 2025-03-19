import { useEffect, useState } from "react";

const useWebSocket = (setTabsData) => {
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
        // Fallback a desarrollo si falla
        setEnv({ APP_ENV: "development", WS_HOST: "localhost:8080" });
      });
  }, []);

  // Configurar WebSocket cuando las variables estén disponibles
  useEffect(() => {
    if (!env) return; // Esperar hasta que env esté listo

    const isProduction = env.APP_ENV === "production";

    const wsUrl = isProduction ? `wss://${env.WS_HOST}` : "ws://localhost:8080";


    const ws = new WebSocket(wsUrl);

    const handleOpen = () => {
      console.log("Conectado al servidor WebSocket");
      ws.send("react-client");
    };

    const handleMessage = (event) => {
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
  }, [env, setTabsData]); // Dependencias ajustadas para incluir env

  return null; // Mantengo el retorno como null para no alterar el uso
};

export default useWebSocket;