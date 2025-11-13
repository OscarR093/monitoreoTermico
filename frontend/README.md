# Frontend del Sistema de Monitoreo Térmico

El frontend es una aplicación React moderna que proporciona la interfaz de usuario para el sistema de monitoreo térmico. Permite visualizar datos en tiempo real, acceder a datos históricos y gestionar usuarios del sistema.

## 📋 Tabla de Contenidos

- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Componentes Principales](#componentes-principales)
- [Arquitectura de la Aplicación](#arquitectura-de-la-aplicación)
- [Configuración del Entorno](#configuración-del-entorno)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Flujo de Autenticación](#flujo-de-autenticación)
- [Conexión WebSocket](#conexión-websocket)
- [Gestión de Estado](#gestión-de-estado)
- [Estilos y Diseño](#estilos-y-diseño)

## ✨ Características Principales

- **Visualización en tiempo real**: Gráficos actualizados constantemente con datos térmicos
- **Interfaz de usuario intuitiva**: Diseño moderno y responsivo
- **Gestión de usuarios**: Registro, edición y eliminación de usuarios
- **Autenticación segura**: Sistema de login con JWT
- **Visualización histórica**: Consulta de datos térmicos almacenados
- **Dashboard interactivo**: Panel de control con métricas clave

## ⚙️ Tecnologías Utilizadas

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| React | 18+ | Biblioteca para interfaces de usuario |
| Vite | Latest | Herramienta de build y desarrollo |
| React Router | Latest | Enrutamiento de aplicaciones |
| Tailwind CSS | Latest | Framework de CSS utilitario |
| WebSocket | Latest | Comunicación bidireccional en tiempo real |
| Axios | Latest | Cliente HTTP para peticiones API |
| JWT Decode | Latest | Decodificación de tokens JWT |
| Recharts | Latest | Biblioteca para gráficos y visualizaciones |

## 📁 Estructura del Proyecto

```
frontend/
├── public/                 # Recursos estáticos
├── src/                    # Código fuente principal
│   ├── components/         # Componentes reutilizables
│   │   ├── auth/           # Componentes de autenticación
│   │   ├── charts/         # Componentes de gráficos
│   │   ├── common/         # Componentes generales
│   │   └── layout/         # Componentes de estructura
│   ├── context/            # Contextos de React
│   ├── hooks/              # Hooks personalizados
│   ├── pages/              # Páginas de la aplicación
│   ├── services/           # Servicios de API
│   ├── utils/              # Utilidades generales
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Punto de entrada
│   └── styles/            # Archivos de estilo
├── test/                   # Pruebas unitarias
├── package.json           # Dependencias y scripts
├── vite.config.js         # Configuración de Vite
├── tailwind.config.js     # Configuración de Tailwind
└── index.html             # Plantilla HTML
```

## 🧩 Componentes Principales

### Componentes de Autenticación
- `LoginForm`: Formulario de inicio de sesión
- `RegisterForm`: Formulario de registro de usuarios
- `ProtectedRoute`: Componente de enrutamiento protegido

### Componentes de Visualización
- `RealTimeChart`: Gráfico en tiempo real de temperaturas
- `HistoricalChart`: Gráfico de datos históricos
- `TemperatureGauge`: Indicador de temperatura individual
- `DataGrid`: Tabla de datos térmicos

### Componentes Generales
- `Header`: Barra superior con navegación
- `Sidebar`: Menú lateral de navegación
- `Footer`: Pie de página
- `Modal`: Componente modal reutilizable
- `Button`: Botón estilizado
- `Input`: Campo de entrada estilizado

### Componentes de Layout
- `DashboardLayout`: Estructura del panel principal
- `AuthLayout`: Estructura para pantallas de autenticación

## 🏗️ Arquitectura de la Aplicación

La aplicación sigue una arquitectura basada en componentes con:

### Enrutamiento
- **Rutas Públicas**: Login, registro
- **Rutas Protegidas**: Dashboard, usuarios, configuración
- **Rutas Condicionales**: Diferente acceso según rol de usuario

### Gestión de Estado
- **React Context**: Estado global para autenticación
- **React Hooks**: Estado local en componentes
- **Prop Drilling**: Pasaje de datos entre componentes

### Comunicación con Backend
- **API REST**: Consultas a endpoints protegidos
- **WebSocket**: Recepción en tiempo real de datos térmicos
- **Eventos**: Gestión de eventos del sistema

## 🔧 Configuración del Entorno

La aplicación frontend se configura principalmente a través de variables de entorno:

### Variables Comunes

- `VITE_API_URL`: URL del backend (por defecto: http://localhost:3000)
- `VITE_WS_URL`: URL para WebSocket (por defecto: ws://localhost:3000)

## 🚀 Instalación y Ejecución

### Requisitos

- Node.js 18+
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar en modo producción
npm run preview
```

### Scripts Disponibles

- `dev`: Iniciar servidor de desarrollo
- `build`: Compilar para producción
- `preview`: Previsualizar build de producción
- `lint`: Ejecutar linter
- `test`: Ejecutar pruebas unitarias

## 🔐 Flujo de Autenticación

El sistema de autenticación incluye:

### Proceso de Login
1. El usuario introduce credenciales
2. Se envían a `/api/login` del backend
3. El backend devuelve JWT y datos de usuario
4. Token se guarda en cookies con seguridad
5. Se redirige al dashboard

### Protección de Rutas
- Verificación de token JWT en cookies
- Decodificación del token para obtener permisos
- Validación de roles (admin, super admin)
- Redirección si no está autenticado

### Validación de Roles
- Componentes condicionales según rol
- Acceso restringido a ciertas funciones
- Mensajes de error personalizados

## 🔌 Conexión WebSocket

### Configuración
- Conexión automática al cargar el dashboard
- Reautenticación con token JWT en cookies
- Reconexión automática en caso de desconexión
- Manejo de errores de conexión

### Flujo de Datos
1. El cliente WebSocket se conecta al backend
2. Se reciben datos térmicos en tiempo real
3. Los datos se actualizan en gráficos y componentes
4. El sistema detecta desconexión y reconecta si es necesario

### Mensajes Recibidos
- Temperatura en tiempo real
- Timestamps de lectura
- Identificación de equipo
- Estados de conexión

## 📊 Gestión de Estado

### Contextos Utilizados

#### AuthContext
- Información del usuario autenticado
- Estado de autenticación
- Funciones de login/logout
- Permisos y roles

#### WebSocketContext
- Estado de conexión WebSocket
- Datos térmicos en tiempo real
- Funciones de control de conexión

#### ThemeContext
- Configuración de tema (oscuro/claro)
- Preferencias de usuario

### Hooks Personalizados

#### useAuth
- Acceso a estado de autenticación
- Verificación de roles
- Funciones de autenticación

#### useWebSocket
- Manejo de conexión WebSocket
- Recepción de mensajes
- Estado de conexión

#### useApi
- Llamadas a API REST
- Manejo de errores
- Carga de datos

## 🎨 Estilos y Diseño

### Framework de CSS
- **Tailwind CSS**: Sistema de clases utilitarias
- **Configuración Personalizada**: Colores del sistema, tamaños, tipografía

### Componentes Estilizados
- **Botones**: Diferentes variantes según estado y función
- **Formularios**: Campos con validación visual
- **Tablas**: Datos organizados y estilizados
- **Tarjetas**: Información agrupada visualmente

### Diseño Responsivo
- Adaptación a diferentes tamaños de pantalla
- Menú móvil para navegación
- Gráficos adaptables

### Sistema de Colores
- **Primario**: Azul industrial para elementos principales
- **Éxito**: Verde para operaciones exitosas
- **Alerta**: Amarillo para advertencias
- **Error**: Rojo para errores o estados críticos
- **Fondo**: Grises neutros para interfaz profesional

## 🧪 Pruebas

### Tipos de Pruebas
- **Pruebas Unitarias**: Componentes individuales
- **Pruebas de Integración**: Flujo de autenticación
- **Pruebas de Interfaz**: Interacción con usuarios

### Cobertura
- Componentes principales
- Hooks personalizados
- Servicios de API
- Contextos