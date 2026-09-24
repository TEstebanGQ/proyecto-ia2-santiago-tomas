# Stage 1: Compilacion y empaquetado con JDK 17
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

COPY gradlew gradlew
COPY gradlew.bat gradlew.bat
COPY gradle gradle
COPY build.gradle build.gradle
COPY settings.gradle settings.gradle

# Normalizar saltos de linea y dar permisos de ejecucion
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

COPY src src
RUN ./gradlew bootJar --no-daemon -x test


# Stage 2: Imagen ligera de ejecucion con JRE 17
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copiar el jar compilado
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
