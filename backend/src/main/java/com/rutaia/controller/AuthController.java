package com.rutaia.controller;

import com.rutaia.dto.AuthRequestDTO;
import com.rutaia.dto.AuthResponseDTO;
import com.rutaia.entity.Docente;
import com.rutaia.entity.Estudiante;
import com.rutaia.entity.Usuario;
import com.rutaia.repository.DocenteRepository;
import com.rutaia.repository.EstudianteRepository;
import com.rutaia.repository.UsuarioRepository;
import com.rutaia.security.JwtUtil;
import com.rutaia.service.AuditoriaService;
import com.rutaia.service.RedisTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Gestión de sesiones con JWT firmado, roles y almacenamiento en Redis")
public class AuthController {

    private final EstudianteRepository estudianteRepository;
    private final DocenteRepository docenteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisTokenService redisTokenService;
    private final AuditoriaService auditoriaService;

    public AuthController(
            EstudianteRepository estudianteRepository,
            DocenteRepository docenteRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            RedisTokenService redisTokenService,
            AuditoriaService auditoriaService
    ) {
        this.estudianteRepository = estudianteRepository;
        this.docenteRepository = docenteRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.redisTokenService = redisTokenService;
        this.auditoriaService = auditoriaService;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión con rol Estudiante, Docente, Administrador o Superadmin (Genera JWT y almacena en Redis)")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        String rol = request.getRol() != null ? request.getRol().trim().toUpperCase() : "ESTUDIANTE";

        if (email.isBlank()) {
            if ("SUPERADMIN".equalsIgnoreCase(rol)) email = "superadmin@universidad.edu.co";
            else if ("ADMINISTRADOR".equalsIgnoreCase(rol)) email = "admin@universidad.edu.co";
            else if ("DOCENTE".equalsIgnoreCase(rol)) email = "profesor.programacion@universidad.edu.co";
            else email = "estudiante@universidad.edu.co";
        }

        Long id;
        String nombre;
        String nivel;
        String area;

        // 1. Verificar si el usuario ya existe en la base de datos de credenciales (usuarios)
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreoElectronicoIgnoreCase(email);

        if (usuarioOpt.isPresent()) {
            Usuario u = usuarioOpt.get();

            // Validar contraseña si fue provista
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                String raw = request.getPassword().trim();
                boolean matches = false;
                if (u.getPassword().startsWith("$2a$") || u.getPassword().startsWith("$2b$") || u.getPassword().startsWith("$2y$")) {
                    matches = passwordEncoder.matches(raw, u.getPassword());
                } else {
                    matches = u.getPassword().equals(raw);
                }
                if (!matches) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
            }

            rol = u.getRol().toUpperCase();
            nombre = u.getNombreCompleto();
            email = u.getCorreoElectronico();
            id = u.getId();

            if ("SUPERADMIN".equalsIgnoreCase(rol)) {
                nivel = "Superadmin";
                area = u.getAreaInteres() != null ? u.getAreaInteres() : "Gobierno Institucional y Superadministración";
            } else if ("ADMINISTRADOR".equalsIgnoreCase(rol)) {
                nivel = "Coordinador";
                area = u.getAreaInteres() != null ? u.getAreaInteres() : "Administración y Gestión Curricular";
            } else if ("DOCENTE".equalsIgnoreCase(rol)) {
                Optional<Docente> optDoc = docenteRepository.findByCorreoElectronicoIgnoreCase(email);
                if (optDoc.isPresent()) {
                    id = optDoc.get().getId();
                    area = optDoc.get().getAreaEspecialidad();
                } else {
                    area = u.getAreaInteres() != null ? u.getAreaInteres() : "Programación";
                }
                nivel = "Docente Titular";
            } else {
                Optional<Estudiante> optEst = estudianteRepository.findByCorreoElectronicoIgnoreCase(email);
                if (optEst.isPresent()) {
                    id = optEst.get().getId();
                    nivel = optEst.get().getNivelExperiencia();
                    area = optEst.get().getAreaInteres();
                } else {
                    nivel = u.getNivelExperiencia() != null ? u.getNivelExperiencia() : "Principiante";
                    area = u.getAreaInteres() != null ? u.getAreaInteres() : "Desarrollo Web";
                }
            }
        } else {
            // 2. Si no estaba en la tabla de usuarios, procesar según rol solicitado o correo
            if ("SUPERADMIN".equalsIgnoreCase(rol) || email.contains("superadmin")) {
                rol = "SUPERADMIN";
                if (email.isBlank()) email = "superadmin@universidad.edu.co";
                nombre = "Super Administrador del Sistema";
                nivel = "Superadmin";
                area = "Gobierno Institucional y Superadministración";

                Usuario nuevoSuper = new Usuario(
                        nombre,
                        email,
                        passwordEncoder.encode(request.getPassword() != null && !request.getPassword().isBlank() ? request.getPassword() : "password123"),
                        rol,
                        nivel,
                        area,
                        "Rectoría"
                );
                nuevoSuper = usuarioRepository.save(nuevoSuper);
                id = nuevoSuper.getId();
            } else if ("ADMINISTRADOR".equalsIgnoreCase(rol) || email.contains("admin")) {
                rol = "ADMINISTRADOR";
                if (email.isBlank()) email = "admin@universidad.edu.co";
                nombre = "Administrador Académico";
                nivel = "Coordinador";
                area = "Administración y Gestión Curricular";

                Usuario nuevoAdmin = new Usuario(
                        nombre,
                        email,
                        passwordEncoder.encode(request.getPassword() != null && !request.getPassword().isBlank() ? request.getPassword() : "password123"),
                        rol,
                        nivel,
                        area,
                        "Dirección Académica"
                );
                nuevoAdmin = usuarioRepository.save(nuevoAdmin);
                id = nuevoAdmin.getId();
            } else if ("DOCENTE".equalsIgnoreCase(rol) || email.contains("profesor") || email.contains("docente")) {
                rol = "DOCENTE";
                if (email.isBlank()) email = "profesor.programacion@universidad.edu.co";
                Optional<Docente> optDoc = docenteRepository.findByCorreoElectronicoIgnoreCase(email);
                Docente doc;
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
                    doc = new Docente(nom, email, especialidad, "Facultad de Ingeniería");
                    doc = docenteRepository.save(doc);
                }
                id = doc.getId();
                nombre = doc.getNombreCompleto();
                email = doc.getCorreoElectronico();
                nivel = "Docente Titular";
                area = doc.getAreaEspecialidad();

                Usuario nuevoDoc = new Usuario(
                        nombre,
                        email,
                        passwordEncoder.encode(request.getPassword() != null && !request.getPassword().isBlank() ? request.getPassword() : "password123"),
                        rol,
                        nivel,
                        area,
                        doc.getDepartamentoFacultad()
                );
                usuarioRepository.save(nuevoDoc);
            } else {
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

                if (!usuarioRepository.findByCorreoElectronicoIgnoreCase(email).isPresent()) {
                    Usuario nuevoEst = new Usuario(
                            nombre,
                            email,
                            passwordEncoder.encode(request.getPassword() != null && !request.getPassword().isBlank() ? request.getPassword() : "password123"),
                            rol,
                            nivel,
                            area,
                            "Pregrado"
                    );
                    usuarioRepository.save(nuevoEst);
                }
            }
        }

        // 3. Generar JWT firmado criptográficamente
        String tokenJwt = jwtUtil.generarToken(email, rol, id, nombre);

        // 4. Registrar sesión completa en Redis (el perfil de usuario reside en Redis, nunca en localStorage)
        redisTokenService.registrarSesion(tokenJwt, id, nombre, email, rol, nivel, area, request.getProveedor() != null ? request.getProveedor() : "local");

        // 5. Registrar evento de auditoría de ingreso
        auditoriaService.registrarEvento(
                "INGRESO",
                email,
                nombre,
                rol,
                "Inicio de sesión exitoso (" + (request.getProveedor() != null ? request.getProveedor() : "local") + ")"
        );

        // 6. Establecer HttpOnly Cookie para que el navegador NO almacene el token en localStorage/caché
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

        // Comprobar si existe en tabla usuarios
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreoElectronicoIgnoreCase(email);
        if (usuarioOpt.isPresent()) {
            Usuario u = usuarioOpt.get();
            rol = u.getRol().toUpperCase();
            id = u.getId();
            nombre = u.getNombreCompleto();
            nivel = u.getNivelExperiencia() != null ? u.getNivelExperiencia() : "Principiante";
            area = u.getAreaInteres() != null ? u.getAreaInteres() : "Tecnología";
        } else if (email.contains("superadmin") || (request.getRol() != null && request.getRol().equalsIgnoreCase("SUPERADMIN"))) {
            id = 0L;
            rol = "SUPERADMIN";
            nivel = "Superadmin";
            area = "Gobierno Institucional y Superadministración";
        } else if (email.contains("admin") || (request.getRol() != null && request.getRol().equalsIgnoreCase("ADMINISTRADOR"))) {
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

            Usuario u = new Usuario(nombre, email, passwordEncoder.encode(UUID.randomUUID().toString()), rol, nivel, area, "Google Pregrado");
            usuarioRepository.save(u);
        }

        // Generar JWT y guardar sesión completa en Redis
        String tokenJwt = jwtUtil.generarToken(email, rol, id, nombre);
        redisTokenService.registrarSesion(tokenJwt, id, nombre, email, rol, nivel, area, "google");

        // Registrar auditoría de ingreso
        auditoriaService.registrarEvento("INGRESO", email, nombre, rol, "Inicio de sesión con Google Sign-In");

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

    @GetMapping("/me")
    @Operation(summary = "Obtener el perfil y estado de sesión del usuario autenticado directamente desde Redis")
    public ResponseEntity<Map<String, Object>> getSesionActual(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null || !jwtUtil.esTokenValido(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Map<String, Object> sesion = redisTokenService.obtenerSesion(token);
        if (sesion != null) {
            return ResponseEntity.ok(sesion);
        }

        // Si la clave en Redis no está disponible pero el JWT es válido, reconstruir la sesión
        String email = jwtUtil.extraerEmail(token);
        String rol = jwtUtil.extraerRol(token);
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreoElectronicoIgnoreCase(email);
        if (usuarioOpt.isPresent()) {
            Usuario u = usuarioOpt.get();
            redisTokenService.registrarSesion(
                    token,
                    u.getId(),
                    u.getNombreCompleto(),
                    u.getCorreoElectronico(),
                    u.getRol(),
                    u.getNivelExperiencia(),
                    u.getAreaInteres(),
                    "local"
            );
            return ResponseEntity.ok(redisTokenService.obtenerSesion(token));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PutMapping("/me/active-student/{studentId}")
    @Operation(summary = "Actualizar el estudiante activo en la sesión persistida en Redis")
    public ResponseEntity<Map<String, Object>> updateActiveStudent(
            @PathVariable Long studentId,
            HttpServletRequest request
    ) {
        String token = extractToken(request);
        if (token == null || !jwtUtil.esTokenValido(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        redisTokenService.actualizarAtributo(token, "activeStudentId", studentId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("activeStudentId", studentId);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión e invalidar sesión activa en el servidor Redis")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        String token = extractToken(request);
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
        resp.put("mensaje", "Sesión cerrada correctamente. Token y perfil invalidados en el servidor Redis.");
        resp.put("revocado", revocado);
        resp.put("timestamp", new Date());

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(resp);
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie c : request.getCookies()) {
                if ("rutaia_token".equals(c.getName())) {
                    return c.getValue();
                }
            }
        }
        return null;
    }
}
