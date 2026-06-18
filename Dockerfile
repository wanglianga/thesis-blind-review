FROM node:18-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package.json ./
RUN npm install --registry=https://registry.npmmirror.com
COPY frontend/ ./
RUN npm run build

FROM maven:3.9.6-eclipse-temurin-17 AS backend-builder
WORKDIR /backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

FROM nginx:alpine

RUN apk add --no-cache openjdk17-jre

COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=backend-builder /backend/target/*.jar /app/app.jar

ENV DB_HOST=localhost
ENV DB_PORT=3306
ENV DB_NAME=thesis_review
ENV DB_USERNAME=root
ENV DB_PASSWORD=password

EXPOSE 80 8080

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
