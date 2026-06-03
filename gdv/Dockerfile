# Usa una imagen base de Node.js para construir la aplicación
FROM node:18-alpine AS build

WORKDIR /app

# Copia los archivos de package.json
COPY package*.json ./

# Instala las dependencias
RUN npm install --legacy-peer-deps

# Copia el resto de los archivos
COPY . .

# Variables de entorno para la construcción
ARG REACT_APP_PRAXSUITE_QUERY_URL
ARG REACT_APP_PRAXSUITE_TABLES
ARG REACT_APP_TURNSTILE_SITE_KEY

# Define las variables de entorno
ENV REACT_APP_PRAXSUITE_QUERY_URL=$REACT_APP_PRAXSUITE_QUERY_URL
ENV REACT_APP_PRAXSUITE_TABLES=$REACT_APP_PRAXSUITE_TABLES
ENV REACT_APP_TURNSTILE_SITE_KEY=$REACT_APP_TURNSTILE_SITE_KEY

# Construye la aplicación
RUN npm run build

# Usa una imagen base de Nginx para servir la aplicación
FROM nginx:alpine

# Copia la configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copia la aplicación construida
COPY --from=build /app/build /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]