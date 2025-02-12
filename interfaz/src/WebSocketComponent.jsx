import { useState, useEffect } from "react";

const WebSocketComponent = () => {
  const [message, setMessage] = useState("Esperando mensaje...");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("Conectado al WebSocket");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data); // Convertir mensaje en JSON
        console.log("Mensaje recibido:", data);
        setMessage(data.message); // Mostrar mensaje recibido
      } catch (error) {
        console.error("Error al procesar el mensaje:", error);
      }
    };

    socket.onclose = () => {
      console.log("Desconectado del WebSocket");
    };

    socket.onerror = (error) => {
      console.error("Error en WebSocket:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Mensaje recibido por WebSocket:</h2>
      <p style={{ fontSize: "24px", fontWeight: "bold", color: "blue" }}>
        {message}
      </p>
    </div>
  );
};

export default WebSocketComponent;
