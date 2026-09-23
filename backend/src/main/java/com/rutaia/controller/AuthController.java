package com.rutaia.controller;

import com.rutaia.dto.AuthRequestDTO;
import com.rutaia.dto.AuthResponseDTO;
import com.rutaia.entity.Estudiante;
import com.rutaia.repository.EstudianteRepository;
import com.rutaia.security.JwtUtil;
import com.rutaia.service.RedisTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Gestión de sesiones con JWT firmado, roles y almacenamiento en Redis")
public class AuthController {

    private final EstudianteRepository estudianteRepository;
    private final com.rutaia.repository.DocenteRepository docenteRepository;
    private final JwtUtil jwtUtil;
    private final RedisTokenService redisTokenService;

    public AuthController(
            EstudianteRepository estudianteRepository,
            com.rutaia.repository.DocenteRepository docenteRepository,
            JwtUtil jwtUtil,
            RedisTokenService redisTokenService
    ) {
        this.estudianteRepository = estudianteRepository;
        this.docenteRepository = docenteRepository;
        this.jwtUtil = jwtUtil;
        this.redisTokenService = redisTokenService;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión con rol Estudiante, Docente o Administrador (Genera JWT y almacena en Redis)")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        String rol = request.getRol() != null ? request.getRol().trim().toUpperCase() : "ESTUDIANTE";

        Long id;
        String nombre;
        String nivel;
        String area;

        // 1. Rol Administrador
        if ("ADMINISTRADOR".equalsIgnoreCase(rol) || email.contains("admin")) {
            id = 0L;
            nombre = "Administrador Académico";
            if (email.isBlank()) email = "admin@universidad.edu.co";
            rol = "ADMINISTRADOR";
            nivel = "Coordinador";
            area = "Administración y Gestión Curricular";
        } else if ("DOCENTE".equalsIgnoreCase(rol) || email.contains("profesor") || email.contains("docente")) {
            // 2. Rol Docente
            rol = "DOCENTE";
            if (email.isBlank()) email = "profesor.programacion@universidad.edu.co";
            Optional<com.rutaia.entity.Docente> optDoc = docenteRepository.findByCorreoElectronicoIgnoreCase(email);
            com.rutaia.entity.Docente doc;
            if (optDoc.isPresent()) {
                doc = optDoc.get();
            } else {
                String nom = request.getNombre() != null ? request.getNombre() : "Profesor de Programación";
                String especialidad = "Programación";
                String lower = email.toLowerCase();
                if (lower.contains("ia") || lower.contains("inteligencia")) {
                    especialidad = "Inteligencia Artificial";
                    nom = "Dr. Especialista en IA";
                } else if (lower.contains("devops") || lower.contains("cloud")) {
                    especialidad = "DevOps y Cloud";
                    nom = "Ing. Especialista DevOps";
                } else if (lower.contains("datos") || lower.contains("data")) {
                    especialidad = "Bases de Datos";
                    nom = "Prof. Especialista en Datos";
                }
                doc = new com.rutaia.entity.Docente(nom, email, especialidad, "Facultad de Ingeniería");
                doc = docenteRepository.save(doc);
            }
            id = doc.getId();
            nombre = doc.getNombreCompleto();
            email = doc.getCorreoElectronico();
            nivel = "Docente Titular";
            area = doc.getAreaEspecialidad();
        } else {
            // 3. Rol Estudiante
            rol = "ESTUDIANTE";
            Optional<Estudiante> optEst = estudianteRepository.findByCorreoElectronicoIgnoreCase(email);
            Estudiante est;
            if (optEst.isPresent()) {
                est = optEst.get();
            } else {
                List<Estudiante> todos = estudianteRepository.findAll();
                if (!todos.isEmpty()) {
                    est = todos.get(0);
                } else {
                    est = new Estudiante(
                            request.getNombre() != null ? request.getNombre() : "Estudiante Institucional",
                            email.isBlank() ? "estudiante@universidad.edu.co" : email,
                            "Intermedio",
                            "Desarrollo Web"
                    );
                    est = estudianteRepository.save(est);
                }
            }
            id = est.getId();
            nombre = est.getNombreCompleto();
            email = est.getCorreoElectronico();
            nivel = est.getNivelExperiencia();
            area = est.getAreaInteres();
        }

        // 3. Generar JWT firmado criptográficamente
        String tokenJwt = jwtUtil.generarToken(email, rol, id, nombre);

        // 4. Registrar sesión en Redis para que el servidor gestione la validez del token
        redisTokenService.registrarToken(tokenJwt, email, rol);

        // 5. Establecer HttpOnly Cookie para que el navegador NO almacene el token en localStorage/caché
        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("rutaia_token", tokenJwt)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(86400)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponseDTO(
                        id,
                        nombre,
                        email,
                        rol,
                        nivel,
                        area,
                        tokenJwt,
                        request.getProveedor() != null ? request.getProveedor() : "local"
                ));
    }

    @PostMapping("/google")
    @Operation(summary = "Autenticar o registrar mediante Google Sign-In (Genera JWT y almacena en Redis)")
    public ResponseEntity<AuthResponseDTO> googleLogin(@RequestBody AuthRequestDTO request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "usuario.google@universidad.edu.co";
        String nombre = request.getNombre() != null && !request.getNombre().isBlank() ? request.getNombre().trim() : "Usuario Google";
        String rol;
        Long id;
        String nivel;
        String area;

        // Si es correo administrativo
        if (email.contains("admin") || (request.getRol() != null && request.getRol().equalsIgnoreCase("ADMINISTRADOR"))) {
            id = 0L;
            rol = "ADMINISTRADOR";
            nivel = "Coordinador";
            area = "Administración y Gestión Curricular";
        } else {
            rol = "ESTUDIANTE";
            Optional<Estudiante> optEst = estudianteRepository.findByCorreoElectronicoIgnoreCase(email);
            Estudiante est;
            if (optEst.isPresent()) {
                est = optEst.get();
            } else {
                est = new Estudiante(
                        nombre,
                        email,
                        "Principiante",
                        "Tecnología e Inteligencia Artificial"
                );
                est = estudianteRepository.save(est);
            }
            id = est.getId();
            nombre = est.getNombreCompleto();
            email = est.getCorreoElectronico();
            nivel = est.getNivelExperiencia();
            area = est.getAreaInteres();
        }

        // Generar JWT y guardar en Redis
        String tokenJwt = jwtUtil.generarToken(email, rol, id, nombre);
        redisTokenService.registrarToken(tokenJwt, email, rol);

        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("rutaia_token", tokenJwt)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(86400)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponseDTO(
                        id,
                        nombre,
                        email,
                        rol,
                        nivel,
                        area,
                        tokenJwt,
                        "google"
                ));
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión e invalidar token activo en el servidor Redis")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie c : request.getCookies()) {
                if ("rutaia_token".equals(c.getName())) {
                    token = c.getValue();
                    break;
                }
            }
        }

        boolean revocado = false;
        if (token != null) {
            revocado = redisTokenService.revocarToken(token);
        }

        org.springframework.http.ResponseCookie deleteCookie = org.springframework.http.ResponseCookie.from("rutaia_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        Map<String, Object> resp = new HashMap<>();
        resp.put("mensaje", "Sesión cerrada correctamente. Token invalidado en el servidor Redis.");
        resp.put("revocado", revocado);
        resp.put("timestamp", new Date());

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(resp);
    }
}
