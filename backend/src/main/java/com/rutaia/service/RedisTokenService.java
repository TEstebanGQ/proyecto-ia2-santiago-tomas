package com.rutaia.service;

import com.rutaia.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedisTokenService {

    private static final Logger log = LoggerFactory.getLogger(RedisTokenService.class);
    private static final String TOKEN_PREFIX = "auth:token:";

    private final StringRedisTemplate redisTemplate;
    private final JwtUtil jwtUtil;

    public RedisTokenService(StringRedisTemplate redisTemplate, JwtUtil jwtUtil) {
        this.redisTemplate = redisTemplate;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Guarda el JWT en Redis para gestionar la sesión en el servidor
     * y evitar que el token dependa exclusivamente de la caché del navegador.
     */
    public void registrarToken(String token, String email, String rol) {
        try {
            String clave = TOKEN_PREFIX + token;
            String valor = String.format("{\"email\":\"%s\",\"rol\":\"%s\"}", email, rol);
            long ttlSeconds = jwtUtil.getExpirationMs() / 1000;
            redisTemplate.opsForValue().set(clave, valor, ttlSeconds, TimeUnit.SECONDS);
            log.info("Token registrado en Redis exitosamente para el usuario: {} (Rol: {})", email, rol);
        } catch (Exception e) {
            log.warn("No se pudo registrar el token en Redis (verificar contenedor Redis): {}", e.getMessage());
        }
    }

    /**
     * Verifica si el token existe y está activo en Redis.
     */
    public boolean isTokenActivo(String token) {
        try {
            String clave = TOKEN_PREFIX + token;
            Boolean existe = redisTemplate.hasKey(clave);
            return Boolean.TRUE.equals(existe);
        } catch (Exception e) {
            log.warn("Error consultando Redis, validando únicamente firma JWT: {}", e.getMessage());
            // Si Redis no está disponible temporalmente, la firma JWT criptográfica respalda la validez
            return jwtUtil.esTokenValido(token);
        }
    }

    /**
     * Elimina el token de Redis al cerrar sesión (Logout), invalidándolo en el servidor.
     */
    public boolean revocarToken(String token) {
        try {
            String clave = TOKEN_PREFIX + token;
            Boolean eliminado = redisTemplate.delete(clave);
            log.info("Token revocado en Redis: {}", eliminado);
            return Boolean.TRUE.equals(eliminado);
        } catch (Exception e) {
            log.warn("Error al revocar token en Redis: {}", e.getMessage());
            return false;
        }
    }
}
