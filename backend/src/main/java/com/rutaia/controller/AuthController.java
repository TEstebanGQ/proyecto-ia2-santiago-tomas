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
import com.rutaia.service.GoogleIdentityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
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
    private final GoogleIdentityService googleIdentityService;

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    public AuthController(
            EstudianteRepository estudianteRepository,
            DocenteRepository docenteRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            RedisTokenService redisTokenService,
            AuditoriaService auditoriaService,
            GoogleIdentityService googleIdentityService
    ) {
        this.estudianteRepository = estudianteRepository;
        this.docenteRepository = docenteRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.redisTokenService = redisTokenService;
        this.auditoriaService = auditoriaService;
        this.googleIdentityService = googleIdentityService;
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
                .secure(secureCookie)
                .sameSite(secureCookie ? "None" : "Lax")
                .path("/")
                .maxAge(86400)
                .build();

        AuthResponseDTO response = new AuthResponseDTO(
                        id,
                        nombre,
                        email,
                        rol,
                        nivel,
                        area,
                        tokenJwt,
                        request.getProveedor() != null ? request.getProveedor() : "local"
                );
        usuarioRepository.findByCorreoElectronicoIgnoreCase(email)
                .ifPresent(usuario -> response.setDebeCambiarPassword(Boolean.TRUE.equals(usuario.getDebeCambiarPassword())));

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/cambiar-password-inicial")
    @Operation(summary = "Cambiar obligatoriamente la contraseña inicial del usuario autenticado")
    public ResponseEntity<Map<String, String>> cambiarPasswordInicial(
            @jakarta.validation.Valid @RequestBody com.rutaia.dto.CambioPasswordInicialDTO request,
            HttpServletRequest servletRequest
    ) {
        String token = extractToken(servletRequest);
        if (token == null || !jwtUtil.esTokenValido(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = jwtUtil.extraerEmail(token);
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreoElectronicoIgnoreCase(email);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Usuario usuario = usuarioOpt.get();
        if (!passwordEncoder.matches(request.getPasswordActual(), usuario.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("mensaje", "La contraseña actual no es correcta."));
        }
        if (passwordEncoder.matches(request.getNuevaPassword(), usuario.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "La nueva contraseña debe ser diferente a la inicial."));
        }
        usuario.setPassword(passwordEncoder.encode(request.getNuevaPassword()));
        usuario.setDebeCambiarPassword(false);
        usuarioRepository.save(usuario);
        auditoriaService.registrarEvento("CAMBIO_PASSWORD_INICIAL", email, usuario.getNombreCompleto(), usuario.getRol(), "El usuario actualizó su contraseña inicial obligatoria.");
        return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente."));
    }

    @GetMapping("/google/check")
    @Operation(summary = "Comprobar si una cuenta de Google ya existe en RutaIA y si su perfil académico está completo")
    public ResponseEntity<Map<String, Object>> checkGoogle(@RequestParam("email") String email) {
        String emailLimpio = email != null ? email.trim().toLowerCase() : "";
        Map<String, Object> resp = new HashMap<>();
        resp.put("email", emailLimpio);

        Optional<Usuario> uOpt = usuarioRepository.findByCorreoElectronicoIgnoreCase(emailLimpio);
        if (uOpt.isPresent()) {
            Usuario u = uOpt.get();
            String rol = u.getRol() != null ? u.getRol().toUpperCase() : "ESTUDIANTE";
            resp.put("existe", true);
            resp.put("nombre", u.getNombreCompleto());
            resp.put("rol", rol);
            resp.put("nivelExperiencia", u.getNivelExperiencia());
            resp.put("areaInteres", u.getAreaInteres());
            resp.put("departamentoFacultad", u.getDepartamentoFacultad());

            // Si es SUPERADMIN o ADMINISTRADOR, no requiere datos de estudiante
            if ("SUPERADMIN".equals(rol) || "ADMINISTRADOR".equals(rol)) {
                resp.put("perfilCompleto", true);
                resp.put("requiereCompletarPerfil", false);
            } else {
                boolean completo = u.getNivelExperiencia() != null && !u.getNivelExperiencia().isBlank()
                        && u.getAreaInteres() != null && !u.getAreaInteres().isBlank();
                resp.put("perfilCompleto", completo);
                resp.put("requiereCompletarPerfil", !completo);
            }
        } else {
            resp.put("existe", false);
            resp.put("perfilCompleto", false);
            resp.put("requiereCompletarPerfil", true);
        }

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/google")
    @Operation(summary = "Autenticar o registrar mediante Google Sign-In (Genera JWT y almacena en Redis)")
    public ResponseEntity<AuthResponseDTO> googleLogin(@RequestBody AuthRequestDTO request) {
        GoogleIdentityService.GoogleProfile googleProfile;
        try {
            googleProfile = googleIdentityService.verify(request.getCredential());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        // Google solo registra e inicia sesiones del rol ESTUDIANTE. Los roles institucionales
        // privilegiados se administran exclusivamente desde el panel Superadmin.
        String email = googleProfile.email();
        String nombre = googleProfile.name();
        String rol = "ESTUDIANTE";
        String nivel = request.getNivelExperiencia() != null ? request.getNivelExperiencia().trim() : null;
        String area = request.getAreaInteres() != null ? request.getAreaInteres().trim() : null;
        String facultad = request.getDepartamentoFacultad() != null ? request.getDepartamentoFacultad().trim() : null;
        Long id;

        // Comprobar si existe en tabla usuarios
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreoElectronicoIgnoreCase(email);
        if (usuarioOpt.isPresent()) {
            Usuario u = usuarioOpt.get();
            if (!"ESTUDIANTE".equalsIgnoreCase(u.getRol())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            rol = u.getRol().toUpperCase();
            id = u.getId();
            nombre = u.getNombreCompleto();

            // Si es Administrador o Superadmin, ingresa directamente
            if ("SUPERADMIN".equals(rol) || "ADMINISTRADOR".equals(rol)) {
                nivel = u.getNivelExperiencia() != null ? u.getNivelExperiencia() : ("SUPERADMIN".equals(rol) ? "Superadmin" : "Coordinador");
                area = u.getAreaInteres() != null ? u.getAreaInteres() : ("SUPERADMIN".equals(rol) ? "Gobierno Institucional y Superadministración" : "Administración y Gestión Curricular");
            } else {
                // Verificar si tiene perfil completo
                boolean tieneNivel = u.getNivelExperiencia() != null && !u.getNivelExperiencia().isBlank();
                boolean tieneArea = u.getAreaInteres() != null && !u.getAreaInteres().isBlank();

                // Si le falta información y la petición la incluye, actualizarla
                if ((!tieneNivel || !tieneArea) && (nivel != null && !nivel.isBlank() && area != null && !area.isBlank())) {
                    u.setNivelExperiencia(nivel);
                    u.setAreaInteres(area);
                    if (facultad != null && !facultad.isBlank()) {
                        u.setDepartamentoFacultad(facultad);
                    }
                    u = usuarioRepository.save(u);
                    tieneNivel = true;
                    tieneArea = true;

                    final Usuario usuarioActualizado = u;
                    if ("ESTUDIANTE".equals(rol)) {
                        estudianteRepository.findByCorreoElectronicoIgnoreCase(email).ifPresent(est -> {
                            est.setNivelExperiencia(usuarioActualizado.getNivelExperiencia());
                            est.setAreaInteres(usuarioActualizado.getAreaInteres());
                            estudianteRepository.save(est);
                        });
                    }
                }

                // Si aún le falta información obligatoria, requerirla
                if (!tieneNivel || !tieneArea) {
                    AuthResponseDTO incompleteResp = new AuthResponseDTO();
                    incompleteResp.setEmail(email);
                    incompleteResp.setNombre(nombre);
                    incompleteResp.setRol(rol);
                    incompleteResp.setRequiereCompletarPerfil(true);
                    incompleteResp.setMensaje("Para continuar con Google, es obligatorio completar el nivel de experiencia y área de interés.");
                    return ResponseEntity.ok(incompleteResp);
                }

                nivel = u.getNivelExperiencia();
                area = u.getAreaInteres();
            }
        } else if ("SUPERADMIN".equalsIgnoreCase(rol)) {
            id = 0L;
            rol = "SUPERADMIN";
            nivel = "Superadmin";
            area = "Gobierno Institucional y Superadministración";
        } else if ("ADMINISTRADOR".equalsIgnoreCase(rol)) {
            id = 0L;
            rol = "ADMINISTRADOR";
            nivel = "Coordinador";
            area = "Administración y Gestión Curricular";
        } else {
            // Usuario NUEVO por Google
            // Validar obligatoriedad de nivelExperiencia y areaInteres
            if (nivel == null || nivel.isBlank() || area == null || area.isBlank()
                    || request.getPassword() == null || request.getPassword().trim().length() < 6) {
                AuthResponseDTO incompleteResp = new AuthResponseDTO();
                incompleteResp.setEmail(email);
                incompleteResp.setNombre(nombre);
                incompleteResp.setRol(rol);
                incompleteResp.setRequiereCompletarPerfil(true);
                incompleteResp.setMensaje("Para registrarte con Google, es obligatorio completar el nivel de experiencia académica y el área de interés vocacional.");
                return ResponseEntity.ok(incompleteResp);
            }

            // Normalizar rol para registro nuevo (solo ESTUDIANTE o DOCENTE)
            if (!"DOCENTE".equalsIgnoreCase(rol)) {
                rol = "ESTUDIANTE";
            } else {
                rol = "DOCENTE";
            }

            if (facultad == null || facultad.isBlank()) {
                facultad = "DOCENTE".equals(rol) ? "Facultad de Ingeniería" : "Google Pregrado";
            }

            Usuario u = new Usuario(nombre, email, passwordEncoder.encode(request.getPassword().trim()), rol, nivel, area, facultad);
            u = usuarioRepository.save(u);
            id = u.getId();

            if ("DOCENTE".equals(rol)) {
                if (!docenteRepository.findByCorreoElectronicoIgnoreCase(email).isPresent()) {
                    Docente doc = new Docente(nombre, email, area, facultad);
                    docenteRepository.save(doc);
                }
            } else {
                Optional<Estudiante> optEst = estudianteRepository.findByCorreoElectronicoIgnoreCase(email);
                if (optEst.isPresent()) {
                    Estudiante est = optEst.get();
                    est.setNivelExperiencia(nivel);
                    est.setAreaInteres(area);
                    estudianteRepository.save(est);
                } else {
                    Estudiante est = new Estudiante(nombre, email, nivel, area);
                    est = estudianteRepository.save(est);
                    id = est.getId();
                }
            }
        }

        // Generar JWT y guardar sesión completa en Redis
        String tokenJwt = jwtUtil.generarToken(email, rol, id, nombre);
        redisTokenService.registrarSesion(tokenJwt, id, nombre, email, rol, nivel, area, "google");

        // Registrar auditoría de ingreso
        auditoriaService.registrarEvento("INGRESO", email, nombre, rol, "Inicio de sesión con Google Sign-In");

        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("rutaia_token", tokenJwt)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(secureCookie ? "None" : "Lax")
                .path("/")
                .maxAge(86400)
                .build();

        AuthResponseDTO authResp = new AuthResponseDTO(
                id,
                nombre,
                email,
                rol,
                nivel,
                area,
                tokenJwt,
                "google"
        );
        authResp.setRequiereCompletarPerfil(false);
        authResp.setDepartamentoFacultad(facultad);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString())
                .body(authResp);
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
                .secure(secureCookie)
                .sameSite(secureCookie ? "None" : "Lax")
                .path("/")
                .maxAge(0)
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
