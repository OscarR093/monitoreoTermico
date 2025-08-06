---
config:
  theme: default
---
gantt
    title Cronograma del Proyecto de Monitoreo Térmico
    dateFormat  YYYY-MM-DD
    axisFormat  %d-%b
    section Planificación
    Revisión de requerimientos         :done, a1, 2025-04-01, 5d
    Diseño preliminar del sistema      :done, a2, 2025-04-06, 5d
    section Hardware
    Ensamble del prototipo             :active, a3, 2025-04-11, 10d
    Pruebas de lectura local           :a4, 2025-04-21, 5d
    section Software Cliente (Python)
    Desarrollo del cliente Python      :a5, 2025-04-26, 8d
    section Backend (Node.js)
    Servidor con WebSocket             :a6, 2025-05-04, 11d
    section Frontend (React)
    Interfaz gráfica React             :a7, 2025-05-15, 11d
    section Integración
    Integración y pruebas              :a8, 2025-05-26, 11d
    section Validación
    Validación en planta               :a9, 2025-06-06, 16d
    section Cierre
    Ajustes y documentación            :a10, 2025-06-22, 19d
    Presentación y entrega final       :a11, 2025-07-11, 21d
