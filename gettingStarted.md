Guía de Despliegue en Servidor Limpio
Esta guía detalla los pasos necesarios para desplegar la aplicación "Monitoreo Térmico" en un servidor Linux limpio (Ubuntu 22.04 LTS recomendado) utilizando Docker y Certbot.

1. Preparación del Servidor
Estos comandos iniciales configuran el servidor con las herramientas necesarias.

a. Actualizar el Sistema
sudo apt update && sudo apt upgrade -y

b. Instalar Docker, Docker Compose y Git
# Instalar Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker

# Instalar el plugin moderno de Docker Compose
sudo apt install docker-compose-plugin -y

# Añadir tu usuario al grupo de Docker para no necesitar 'sudo'
sudo usermod -aG docker ${USER}

¡Importante! Después de añadir tu usuario al grupo docker, debes cerrar la sesión SSH y volver a conectarte para que los cambios tengan efecto.

c. Instalar Certbot
sudo apt install certbot -y

2. Clonar el Repositorio
Clona el proyecto desde GitHub a tu servidor.

# Reemplaza con la URL SSH de tu repositorio
git clone git@github.com:OscarR093/monitoreoTermico.git

# Entra al directorio del proyecto
cd monitoreoTermico

3. Configuración del Entorno
El sistema se configura a través de un archivo .env. Copia la plantilla y rellena tus secretos.

a. Crear el archivo .env
cp env.example .env

b. Editar el archivo y añadir tus secretos
nano .env

Asegúrate de rellenar todas las variables, especialmente DOMAIN_URL, CERT_EMAIL y las contraseñas.

4. Generación de Certificados SSL (Certbot)
Este paso genera los certificados SSL/TLS de Let's Encrypt para tu dominio.

a. Asegurar que los puertos 80 y 443 estén libres
Si por alguna razón los contenedores ya están corriendo, detenlos:

docker compose -f docker-compose.prod.yml down

b. Ejecutar Certbot
# Reemplaza el dominio y el email con los valores de tu .env
sudo certbot certonly --standalone -d tu_dominio.duckdns.org --agree-tos -m tu_email@ejemplo.com --no-eff-email

Si el comando tiene éxito, los certificados se guardarán en /etc/letsencrypt/live/tu_dominio.duckdns.org/.

c. Copiar Certificados al Proyecto
Copia los certificados a la carpeta ./certs para que Docker pueda usarlos.

# Crea la carpeta 'certs' si no existe
mkdir -p certs

# Copia la llave privada
sudo cp /etc/letsencrypt/live/tu_dominio.duckdns.org/privkey.pem ./certs/server.key

# Copia el certificado público
sudo cp /etc/letsencrypt/live/tu_dominio.duckdns.org/fullchain.pem ./certs/server.crt

# Corrige los permisos de los archivos
sudo chown $USER:$USER ./certs/*

5. Despliegue con Docker Compose
Con todo configurado, el último paso es levantar todos los servicios.

a. Iniciar Sesión en Docker Hub
Esto es necesario para descargar tu imagen privada de la aplicación.

docker login

Introduce tu nombre de usuario y tu contraseña o token de acceso.

b. Lanzar la Aplicación
docker compose -f docker-compose.prod.yml up -d

Docker descargará las imágenes necesarias, creará los contenedores y los iniciará en segundo plano. Después de unos momentos, tu aplicación estará en línea y accesible de forma segura en https://tu_dominio.duckdns.org.

Mantenimiento: Renovación de Certificados
Los certificados de Let's Encrypt son válidos por 90 días. Certbot configura una tarea automática para renovarlos, pero deberás recargar los servicios manualmente para que tomen los nuevos certificados.

Aproximadamente cada 3 meses, ejecuta los siguientes comandos:

# 1. Renovar el certificado
sudo certbot renew

# 2. Copiar los nuevos certificados al proyecto (mismos comandos del paso 4.c)
sudo cp /etc/letsencrypt/live/tu_dominio.duckdns.org/privkey.pem ./certs/server.key
sudo cp /etc/letsencrypt/live/tu_dominio.duckdns.org/fullchain.pem ./certs/server.crt
sudo chown $USER:$USER ./certs/*

# 3. Reiniciar los servicios que usan los certificados
docker compose -f docker-compose.prod.yml restart caddy emqx
