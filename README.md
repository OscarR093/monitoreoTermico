Monitoreo Térmico IIoT 🌡️
Este proyecto es una aplicación de Internet Industrial de las Cosas (IIoT) diseñada para el monitoreo de temperatura en tiempo real y el almacenamiento de datos históricos, utilizando un stack de tecnologías modernas y seguras.
📝 Descripción General
La aplicación captura datos de temperatura desde un Gateway (Python) conectado a 8 sensores de termopares en un PLC. Estos datos se envían de forma segura mediante el protocolo MQTTS a un broker EMQX. Un backend en Node.js procesa los datos de los siguientes tópicos:

Tiempo Real: Datos leídos cada 2 segundos y retransmitidos vía WebSocket para visualización instantánea en la interfaz.
Histórico: Datos almacenados cada 20 minutos en una base de datos MongoDB.
Control: Comandos enviados desde el backend al gateway para activar o desactivar el flujo de datos en tiempo real.

La información se presenta al usuario a través de un frontend interactivo desarrollado en React.
⚙️ Tecnologías Utilizadas



Área
Tecnología



Frontend
React, Vite


Backend
Node.js, Express, WebSockets


Base de Datos
MongoDB


Broker de Mensajes
EMQX (MQTT)


Gateway
Python


Despliegue
Docker, Docker Compose, Traefik


🚀 Guía de Despliegue Rápido
Esta guía describe cómo desplegar la aplicación en un servidor de producción. El repositorio de código y la imagen de Docker son privados.
📋 Prerrequisitos

Un servidor o VPS (ej. Ubuntu 22.04) con una IP pública y acceso sudo.
Un nombre de dominio (ej. midominio.com) configurado en el DNS para apuntar a la IP del servidor.
Acceso al repositorio privado en GitHub (OscarR093/monitoreoTermico).
Acceso a la imagen privada en Docker Hub (oscarr093/monitoreotermico).
Git, Docker y Docker Compose instalados en el servidor.

🛠️ Paso 1: Clonar el Repositorio
Clona el repositorio privado desde GitHub:
git clone git@github.com:OscarR093/monitoreoTermico.git
cd monitoreoTermico


Nota: Asegúrate de tener configurada una clave SSH en tu servidor con acceso al repositorio privado en GitHub.

🔧 Paso 2: Configurar el Entorno
Crea y configura el archivo .env:
cp .env.example .env
nano .env

Edita .env con tus credenciales y configuración, incluyendo:

DOMAIN_URL: Tu dominio (ej. midominio.com).
LETSENCRYPT_EMAIL: Correo para Let's Encrypt.
Credenciales para MongoDB, EMQX y JWT.

📁 Paso 3: Preparar Volúmenes para Traefik
Crea la carpeta y el archivo para los certificados SSL de Traefik:
mkdir traefik-data
touch traefik-data/acme.json
chmod 600 traefik-data/acme.json

🔑 Paso 4: Iniciar Sesión en Docker Hub
Inicia sesión en Docker Hub para acceder a la imagen privada:
docker login

Ingresa tu usuario y contraseña de Docker Hub con permisos para oscarr093/monitoreotermico.
🚀 Paso 5: Levantar los Servicios
Inicia la aplicación en modo producción:
docker compose -f docker-compose.prod.yml up -d

✅ Verificación

Verifica que los contenedores estén corriendo:
docker ps


Revisa los logs de Traefik para confirmar que el certificado SSL se generó:
docker logs mi-traefik-proxy


Accede a la aplicación en tu navegador: https://<tu-dominio>.

Opcionalmente, accede al dashboard de EMQX en: http://<tu-dominio>:18083.



Nota: Asegúrate de que el DNS de tu dominio esté correctamente configurado para apuntar a la IP de tu servidor.

📜 Licencia
Este proyecto está bajo la Licencia MIT.
📫 Contacto
Oscar R. - GitHub | Correo: tu-correo@example.com