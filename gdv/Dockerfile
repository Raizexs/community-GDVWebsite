# Usa una imagen base de Node.js para construir la aplicación
FROM node:16 AS build

WORKDIR /app

# Copia los archivos de package.json
COPY package*.json ./

# Instala las dependencias
RUN npm install --legacy-peer-deps

# Copia el resto de los archivos
COPY . .

# Construye la aplicación para producción
RUN npm run build

# Usa una imagen ligera de Nginx
FROM nginx:alpine

# Copia el archivo de configuración personalizado de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copia los archivos construidos de React a Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
