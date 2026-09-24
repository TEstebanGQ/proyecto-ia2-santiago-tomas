package com.rutaia.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rutaia.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class RedisTokenService {

    private static final Logger log = LoggerFactory.getLogger(RedisTokenService.class);
    private static final String TOKEN_PREFIX = "auth:token:";

    private final StringRedisTemplate redisTemplate;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    public RedisTokenService(StringRedisTemplate redisTemplate, JwtUtil jwtUtil, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.jwtUtil = jwtUtil;
        this.objectMapper = objectMapper;
    }

    /**
     * Guarda la sesión completa del usuario en Redis bajo la clave del token activo.
     * Toda la información del perfil del usuario reside en el servidor Redis y NUNCA en localStorage.
     */
    public void registrarSesion(String token, Long id, String nombre, String email, String rol, String nivel, String area, String proveedor) {
        try {
            String clave = TOKEN_PREFIX + token;
            Map<String, Object> session = new HashMap<>();
            session.put("id", id != null ? id : 0L);
            session.put("nombre", nombre);
            session.put("email", email);
            session.put("rol", rol);
            session.put("nivelExperiencia", nivel);
            session.put("areaInteres", area);
            session.put("proveedor", proveedor != null ? proveedor : "local");
            if ("ESTUDIANTE".equalsIgnoreCase(rol) && id != null) {
                session.put("activeStudentId", id);
            }

            String valor = objectMapper.writeValueAsString(session);
            long ttlSeconds = jwtUtil.getExpirationMs() / 1000;
            redisTemplate.opsForValue().set(clave, valor, ttlSeconds, TimeUnit.SECONDS);
            log.info("Sesión completa registrada en Redis exitosamente para: {} (Rol: {})", email, rol);
        } catch (Exception e) {
            log.warn("No se pudo registrar la sesión en Redis (verificar contenedor Redis): {}", e.getMessage());
        }
    }

    /**
     * Compatibilidad: registra token con email y rol.
     */
    public void registrarToken(String token, String email, String rol) {
        registrarSesion(token, null, null, email, rol, null, null, "local");
    }

    /**
     * Recupera el objeto completo de sesión almacenado en Redis para el token.
     */
    public Map<String, Object> obtenerSesion(String token) {
        if (token == null || token.isBlank()) return null;
        try {
            String clave = TOKEN_PREFIX + token;
            String valor = redisTemplate.opsForValue().get(clave);
            if (valor != null && !valor.isBlank()) {
                return objectMapper.readValue(valor, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            log.warn("Error consultando sesión de usuario en Redis: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Actualiza un atributo específico en la sesión activa en Redis (por ejemplo el activeStudentId).
     */
    public void actualizarAtributo(String token, String key, Object value) {
        if (token == null || key == null) return;
        try {
            String clave = TOKEN_PREFIX + token;
            String valor = redisTemplate.opsForValue().get(clave);
            Map<String, Object> session;
            if (valor != null && !valor.isBlank()) {
                session = objectMapper.readValue(valor, new TypeReference<Map<String, Object>>() {});
            } else {
                session = new HashMap<>();
            }
            session.put(key, value);
            Long ttl = redisTemplate.getExpire(clave, TimeUnit.SECONDS);
            if (ttl == null || ttl <= 0) {
                ttl = jwtUtil.getExpirationMs() / 1000;
            }
            redisTemplate.opsForValue().set(clave, objectMapper.writeValueAsString(session), ttl, TimeUnit.SECONDS);
            log.info("Atributo '{}' actualizado en sesión de Redis para token {}", key, token);
        } catch (Exception e) {
            log.warn("Error al actualizar atributo en Redis: {}", e.getMessage());
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
            return jwtUtil.esTokenValido(token);
        }
    }

    /**
     * Elimina la sesión y el token de Redis al cerrar sesión (Logout), invalidándolo en el servidor.
     */
    public boolean revocarToken(String token) {
        try {
            String clave = TOKEN_PREFIX + token;
            Boolean eliminado = redisTemplate.delete(clave);
            log.info("Sesión revocada en Redis: {}", eliminado);
            return Boolean.TRUE.equals(eliminado);
        } catch (Exception e) {
            log.warn("Error al revocar sesión en Redis: {}", e.getMessage());
            return false;
        }
    }
}
