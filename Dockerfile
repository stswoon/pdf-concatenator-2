FROM node:24.15.0 AS builder
WORKDIR /app
COPY scripts ./scripts
COPY package.json package-lock.json ./
RUN npm ci
COPY src ./src
COPY public ./public
COPY index.html tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts ./
RUN npm run build

FROM nginx:1.27.3
COPY --from=builder /app/dist ./usr/share/nginx/html
COPY start.sh /etc/nginx/
RUN chmod +x /etc/nginx/start.sh
ARG NGINX_PORT
EXPOSE $NGINX_PORT
CMD "/etc/nginx/start.sh"

# docker build . -t pdf
# docker run --rm --name pdf -p 8081:8081 -e NGINX_PORT=8081 pdf
