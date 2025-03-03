import { useEffect } from "react";

const useWebSocket = (url, setTabsData) => {
    useEffect(() => {
    const ws = new WebSocket(url);
    const handleOpen = () => {
        console.log("Conectado al servidor WebSocket");
        ws.send("react-client");
    };
    const handleMessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Datos recibidos 1:", data);

        const { equipo, temperatura } = data; // Extraer directamente del JSON
        console.log(equipo)
        if (equipo && temperatura !== undefined) {
            console.log(temperatura)
            setTabsData((prevTabsData) =>
                prevTabsData.map((tab) =>
                    tab.tag === equipo
                        ? { ...tab, temperature: `${temperatura}°C` }
                        : tab
                )
            );
        }
    }
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
    }, [url, setTabsData]);
};

export default useWebSocket;