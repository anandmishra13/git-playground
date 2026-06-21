# === STAGE 1: Build the Angular App ===
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# === STAGE 2: Serve the App with Nginx ===
FROM nginx:alpine
# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the compiled Angular files from Stage 1 (build) into Nginx public directory
COPY --from=build /app/dist/git-playground/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
