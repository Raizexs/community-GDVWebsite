# Usa una imagen base de Node.js para construir la aplicación
FROM node:18-alpine AS build

WORKDIR /app

# Copia los archivos de package.json
COPY package*.json ./

# Instala las dependencias
RUN npm install --legacy-peer-deps

# Copia el resto de los archivos
COPY . .

# 1. Recibir los argumentos desde GitHub Actions
ARG REACT_APP_TURNSTILE_SITE_KEY
ARG REACT_APP_GAMES_PROXY_URL
ARG REACT_APP_CONTACT_API_URL

# 2. Transformarlos en variables de entorno para la compilación de React
ENV REACT_APP_TURNSTILE_SITE_KEY=$REACT_APP_TURNSTILE_SITE_KEY
ENV REACT_APP_GAMES_PROXY_URL=$REACT_APP_GAMES_PROXY_URL
ENV REACT_APP_CONTACT_API_URL=$REACT_APP_CONTACT_API_URL

# Construye la aplicación para producción
RUN npm run build

# Usa una imagen ligera oficial de Nginx
FROM nginx:alpine

# Copia la configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copia los archivos construidos de React al directorio de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]