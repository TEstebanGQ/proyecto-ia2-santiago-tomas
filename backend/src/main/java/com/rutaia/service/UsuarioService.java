package com.rutaia.service;

import com.rutaia.dto.UsuarioDTO;
import com.rutaia.dto.UsuarioPasswordDTO;
import com.rutaia.dto.UsuarioRegistroDTO;
import com.rutaia.dto.UsuarioRolUpdateDTO;
import com.rutaia.dto.UsuarioUpdateDTO;
import com.rutaia.entity.Docente;
import com.rutaia.entity.Estudiante;
import com.rutaia.entity.Usuario;
import com.rutaia.repository.DocenteRepository;
import com.rutaia.repository.EstudianteRepository;
import com.rutaia.repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;
    private final DocenteRepository docenteRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditoriaService auditoriaService;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            EstudianteRepository estudianteRepository,
            DocenteRepository docenteRepository,
            PasswordEncoder passwordEncoder,
            AuditoriaService auditoriaService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.estudianteRepository = estudianteRepository;
        this.docenteRepository = docenteRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditoriaService = auditoriaService;
    }

    public List<UsuarioDTO> listarUsuarios(Authentication auth) {
        List<UsuarioDTO> todos = usuarioRepository.findAllByOrderByFechaCreacionDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        if (isSuperAdmin(auth)) {
            return todos;
        }

        // Si el usuario autenticado es ADMINISTRADOR:
        // Solo se le enlisten usuarios (ESTUDIANTE) y docentes (DOCENTE).
        // NUNCA superadministradores ni otros administradores.
        return todos.stream()
                .filter(u -> {
                    String r = u.getRol() != null ? u.getRol().toUpperCase() : "";
                    return "DOCENTE".equalsIgnoreCase(r) || "ESTUDIANTE".equalsIgnoreCase(r);
                })
                .collect(Collectors.toList());
    }

    public List<UsuarioDTO> listarUsuarios() {
        return listarUsuarios(null);
    }

    public UsuarioDTO obtenerPorId(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        return toDTO(u);
    }

    public List<String> obtenerRolesPermitidos(Authentication auth) {
        if (isSuperAdmin(auth)) {
            return List.of("ADMINISTRADOR", "DOCENTE", "ESTUDIANTE");
        }
        if (isAdmin(auth)) {
            return List.of("DOCENTE", "ESTUDIANTE");
        }
        return List.of();
    }

    @Transactional
    public UsuarioDTO crearUsuario(UsuarioRegistroDTO dto, Authentication auth) {
        String rolDestino = dto.getRol() != null ? dto.getRol().trim().toUpperCase() : "";
        String callerEmail = auth != null ? auth.getName() : "sistema";

        boolean superAdmin = isSuperAdmin(auth);
        boolean admin = isAdmin(auth);

        if (!superAdmin && !admin) {
            throw new AccessDeniedException("No tienes permisos suficientes para registrar usuarios en el sistema.");
        }

        // Validación de permisos por jerarquía de roles
        if ("ADMINISTRADOR".equalsIgnoreCase(rolDestino) || "SUPERADMIN".equalsIgnoreCase(rolDestino)) {
            if (!superAdmin) {
                throw new AccessDeniedException("El Administrador solo puede crear Docentes y Estudiantes. Solo el Superadmin puede crear Administradores.");
            }
        }

        if (!List.of("ADMINISTRADOR", "DOCENTE", "ESTUDIANTE", "SUPERADMIN").contains(rolDestino)) {
            throw new IllegalArgumentException("Rol inválido: " + rolDestino + ". Los roles permitidos son ADMINISTRADOR, DOCENTE o ESTUDIANTE.");
        }

        String emailLimpio = dto.getCorreoElectronico().trim().toLowerCase();
        if (usuarioRepository.existsByCorreoElectronicoIgnoreCase(emailLimpio)) {
            throw new IllegalArgumentException("Ya existe un usuario registrado con el correo: " + emailLimpio);
        }

        String passwordHasheada = passwordEncoder.encode(dto.getPassword().trim());

        Usuario nuevoUsuario = new Usuario(
                dto.getNombreCompleto().trim(),
                emailLimpio,
                passwordHasheada,
                rolDestino,
                dto.getNivelExperiencia(),
                dto.getAreaInteres(),
                dto.getDepartamentoFacultad()
        );

        nuevoUsuario = usuarioRepository.save(nuevoUsuario);

        // Sincronizar según el rol específico para mantener integridad de servicios
        if ("DOCENTE".equalsIgnoreCase(rolDestino)) {
            if (!docenteRepository.findByCorreoElectronicoIgnoreCase(emailLimpio).isPresent()) {
                String area = (dto.getAreaInteres() != null && !dto.getAreaInteres().isBlank())
                        ? dto.getAreaInteres().trim() : "Docencia General";
                String facultad = (dto.getDepartamentoFacultad() != null && !dto.getDepartamentoFacultad().isBlank())
                        ? dto.getDepartamentoFacultad().trim() : "Facultad de Ingeniería";
                Docente doc = new Docente(dto.getNombreCompleto().trim(), emailLimpio, area, facultad);
                docenteRepository.save(doc);
            }
        } else if ("ESTUDIANTE".equalsIgnoreCase(rolDestino)) {
            if (!estudianteRepository.findByCorreoElectronicoIgnoreCase(emailLimpio).isPresent()) {
                String nivel = (dto.getNivelExperiencia() != null && !dto.getNivelExperiencia().isBlank())
                        ? dto.getNivelExperiencia().trim() : "Principiante";
                String area = (dto.getAreaInteres() != null && !dto.getAreaInteres().isBlank())
                        ? dto.getAreaInteres().trim() : "Tecnología e Inteligencia Artificial";
                Estudiante est = new Estudiante(dto.getNombreCompleto().trim(), emailLimpio, nivel, area);
                estudianteRepository.save(est);
            }
        }

        // Registrar auditoría del sistema
        String callerRol = superAdmin ? "SUPERADMIN" : "ADMINISTRADOR";
        auditoriaService.registrarEvento(
                "CREACION_USUARIO",
                callerEmail,
                callerEmail,
                callerRol,
                "Se creó el usuario " + emailLimpio + " con rol " + rolDestino
        );

        return toDTO(nuevoUsuario);
    }

    @Transactional
    public void cambiarPassword(Long id, UsuarioPasswordDTO dto, Authentication auth) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        boolean superAdmin = isSuperAdmin(auth);
        boolean admin = isAdmin(auth);
        String callerEmail = auth != null ? auth.getName() : "sistema";

        if (!superAdmin && !admin) {
            throw new AccessDeniedException("No tienes permisos para configurar contraseñas de usuarios.");
        }

        // Un Administrador solo puede configurar contraseñas de Docentes y Estudiantes (nunca Superadmins ni otros Administradores)
        if (!superAdmin) {
            String targetRol = usuario.getRol() != null ? usuario.getRol().toUpperCase() : "";
            if ("SUPERADMIN".equalsIgnoreCase(targetRol) || "ADMINISTRADOR".equalsIgnoreCase(targetRol)) {
                throw new AccessDeniedException("Un Administrador solo puede configurar contraseñas de Docentes y Estudiantes (no puede modificar a Superadmin ni a otro Administrador).");
            }
        }

        String passwordHasheada = passwordEncoder.encode(dto.getNuevaPassword().trim());
        usuario.setPassword(passwordHasheada);
        usuarioRepository.save(usuario);

        String callerRol = superAdmin ? "SUPERADMIN" : "ADMINISTRADOR";
        auditoriaService.registrarEvento(
                "CONFIGURACION_PASSWORD",
                callerEmail,
                callerEmail,
                callerRol,
                "Contraseña configurada/actualizada para el usuario: " + usuario.getCorreoElectronico()
        );
    }

    @Transactional
    public UsuarioDTO actualizarUsuario(Long id, UsuarioUpdateDTO dto, Authentication auth) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        boolean superAdmin = isSuperAdmin(auth);
        boolean admin = isAdmin(auth);
        String callerEmail = auth != null ? auth.getName() : "sistema";

        if (!superAdmin && !admin) {
            throw new AccessDeniedException("No tienes permisos para editar usuarios.");
        }

        String targetRol = usuario.getRol() != null ? usuario.getRol().toUpperCase() : "";

        // Admin solo puede editar Docentes y Estudiantes
        if (!superAdmin && ("SUPERADMIN".equals(targetRol) || "ADMINISTRADOR".equals(targetRol))) {
            throw new AccessDeniedException("Un Administrador solo puede editar Docentes y Estudiantes.");
        }

        // Nadie puede editar otro Superadmin (ni el propio Superadmin a otro Superadmin)
        if ("SUPERADMIN".equals(targetRol) && !callerEmail.equalsIgnoreCase(usuario.getCorreoElectronico())) {
            throw new AccessDeniedException("No se puede modificar otro Superadmin.");
        }

        if (dto.getNombreCompleto() != null && !dto.getNombreCompleto().isBlank()) {
            usuario.setNombreCompleto(dto.getNombreCompleto().trim());
        }
        if (dto.getAreaInteres() != null) {
            usuario.setAreaInteres(dto.getAreaInteres().trim());
        }
        if (dto.getNivelExperiencia() != null) {
            usuario.setNivelExperiencia(dto.getNivelExperiencia().trim());
        }
        if (dto.getDepartamentoFacultad() != null) {
            usuario.setDepartamentoFacultad(dto.getDepartamentoFacultad().trim());
        }

        usuario = usuarioRepository.save(usuario);

        // Sincronizar con tabla docentes si aplica
        if ("DOCENTE".equals(targetRol)) {
            docenteRepository.findByCorreoElectronicoIgnoreCase(usuario.getCorreoElectronico()).ifPresent(doc -> {
                if (dto.getNombreCompleto() != null && !dto.getNombreCompleto().isBlank())
                    doc.setNombreCompleto(dto.getNombreCompleto().trim());
                if (dto.getAreaInteres() != null)
                    doc.setAreaEspecialidad(dto.getAreaInteres().trim());
                if (dto.getDepartamentoFacultad() != null)
                    doc.setDepartamentoFacultad(dto.getDepartamentoFacultad().trim());
                docenteRepository.save(doc);
            });
        }

        // Sincronizar con tabla estudiantes si aplica
        if ("ESTUDIANTE".equals(targetRol)) {
            estudianteRepository.findByCorreoElectronicoIgnoreCase(usuario.getCorreoElectronico()).ifPresent(est -> {
                if (dto.getNombreCompleto() != null && !dto.getNombreCompleto().isBlank())
                    est.setNombreCompleto(dto.getNombreCompleto().trim());
                if (dto.getAreaInteres() != null)
                    est.setAreaInteres(dto.getAreaInteres().trim());
                if (dto.getNivelExperiencia() != null)
                    est.setNivelExperiencia(dto.getNivelExperiencia().trim());
                estudianteRepository.save(est);
            });
        }

        String callerRol = superAdmin ? "SUPERADMIN" : "ADMINISTRADOR";
        auditoriaService.registrarEvento(
                "EDICION_USUARIO",
                callerEmail,
                callerEmail,
                callerRol,
                "Datos editados para el usuario: " + usuario.getCorreoElectronico()
        );

        return toDTO(usuario);
    }

    @Transactional
    public UsuarioDTO toggleActivoUsuario(Long id, boolean activo, Authentication auth) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        boolean superAdmin = isSuperAdmin(auth);
        boolean admin = isAdmin(auth);
        String callerEmail = auth != null ? auth.getName() : "sistema";

        if (!superAdmin && !admin) {
            throw new AccessDeniedException("No tienes permisos para cambiar el estado de usuarios.");
        }

        String targetRol = usuario.getRol() != null ? usuario.getRol().toUpperCase() : "";

        // Admin solo puede activar/desactivar Docentes y Estudiantes
        if (!superAdmin && ("SUPERADMIN".equals(targetRol) || "ADMINISTRADOR".equals(targetRol))) {
            throw new AccessDeniedException("Un Administrador solo puede activar/desactivar Docentes y Estudiantes.");
        }

        // Superadmin no puede desactivarse a sí mismo
        if (callerEmail.equalsIgnoreCase(usuario.getCorreoElectronico()) && !activo) {
            throw new AccessDeniedException("No puedes desactivar tu propia cuenta.");
        }

        usuario.setActivo(activo);
        usuario = usuarioRepository.save(usuario);

        // Sincronizar con tabla docentes si aplica
        if ("DOCENTE".equals(targetRol)) {
            docenteRepository.findByCorreoElectronicoIgnoreCase(usuario.getCorreoElectronico()).ifPresent(doc -> {
                doc.setActivo(activo);
                docenteRepository.save(doc);
            });
        }

        // Sincronizar con tabla estudiantes si aplica
        if ("ESTUDIANTE".equals(targetRol)) {
            estudianteRepository.findByCorreoElectronicoIgnoreCase(usuario.getCorreoElectronico()).ifPresent(est -> {
                est.setActivo(activo);
                estudianteRepository.save(est);
            });
        }

        String accion = activo ? "ACTIVACION_USUARIO" : "DESACTIVACION_USUARIO";
        String callerRol = superAdmin ? "SUPERADMIN" : "ADMINISTRADOR";
        auditoriaService.registrarEvento(
                accion,
                callerEmail,
                callerEmail,
                callerRol,
                (activo ? "Activación" : "Desactivación") + " del usuario: " + usuario.getCorreoElectronico()
        );

        return toDTO(usuario);
    }

    @Transactional
    public UsuarioDTO cambiarRolUsuario(Long id, UsuarioRolUpdateDTO dto, Authentication auth) {
        if (!isSuperAdmin(auth)) {
            throw new AccessDeniedException("Solo el Super Administrador tiene autorización exclusiva para cambiar los roles de los usuarios.");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        String targetRolActual = usuario.getRol() != null ? usuario.getRol().toUpperCase() : "";
        if ("SUPERADMIN".equalsIgnoreCase(targetRolActual)) {
            throw new AccessDeniedException("No se puede cambiar el rol de la cuenta principal del Super Administrador institucional.");
        }

        String nuevoRol = dto.getNuevoRol() != null ? dto.getNuevoRol().trim().toUpperCase() : "";
        if (!List.of("ADMINISTRADOR", "DOCENTE", "ESTUDIANTE").contains(nuevoRol)) {
            throw new IllegalArgumentException("Rol inválido: " + nuevoRol + ". Los roles permitidos son ADMINISTRADOR, DOCENTE o ESTUDIANTE.");
        }

        String callerEmail = auth != null ? auth.getName() : "superadmin";
        String emailUsuario = usuario.getCorreoElectronico();

        // Si se proporcionan campos adicionales, actualizarlos
        if (dto.getNivelExperiencia() != null && !dto.getNivelExperiencia().isBlank()) {
            usuario.setNivelExperiencia(dto.getNivelExperiencia().trim());
        }
        if (dto.getAreaInteres() != null && !dto.getAreaInteres().isBlank()) {
            usuario.setAreaInteres(dto.getAreaInteres().trim());
        }
        if (dto.getDepartamentoFacultad() != null && !dto.getDepartamentoFacultad().isBlank()) {
            usuario.setDepartamentoFacultad(dto.getDepartamentoFacultad().trim());
        }

        // Si cambia a DOCENTE: asegurar registro en tabla docentes
        if ("DOCENTE".equals(nuevoRol)) {
            String areaDoc = (usuario.getAreaInteres() != null && !usuario.getAreaInteres().isBlank())
                    ? usuario.getAreaInteres() : "Docencia General";
            String facDoc = (usuario.getDepartamentoFacultad() != null && !usuario.getDepartamentoFacultad().isBlank())
                    ? usuario.getDepartamentoFacultad() : "Facultad de Ingeniería";

            Optional<Docente> docOpt = docenteRepository.findByCorreoElectronicoIgnoreCase(emailUsuario);
            if (docOpt.isPresent()) {
                Docente doc = docOpt.get();
                doc.setAreaEspecialidad(areaDoc);
                doc.setDepartamentoFacultad(facDoc);
                doc.setActivo(true);
                docenteRepository.save(doc);
            } else {
                Docente doc = new Docente(usuario.getNombreCompleto(), emailUsuario, areaDoc, facDoc);
                docenteRepository.save(doc);
            }
        }

        // Si cambia a ESTUDIANTE: asegurar registro en tabla estudiantes
        if ("ESTUDIANTE".equals(nuevoRol)) {
            String nivelEst = (usuario.getNivelExperiencia() != null && !usuario.getNivelExperiencia().isBlank())
                    ? usuario.getNivelExperiencia() : "Principiante";
            String areaEst = (usuario.getAreaInteres() != null && !usuario.getAreaInteres().isBlank())
                    ? usuario.getAreaInteres() : "Tecnología e Inteligencia Artificial";

            Optional<Estudiante> estOpt = estudianteRepository.findByCorreoElectronicoIgnoreCase(emailUsuario);
            if (estOpt.isPresent()) {
                Estudiante est = estOpt.get();
                est.setNivelExperiencia(nivelEst);
                est.setAreaInteres(areaEst);
                est.setActivo(true);
                estudianteRepository.save(est);
            } else {
                Estudiante est = new Estudiante(usuario.getNombreCompleto(), emailUsuario, nivelEst, areaEst);
                estudianteRepository.save(est);
            }
        }

        // Si cambia a ADMINISTRADOR: asegurar datos curriculares
        if ("ADMINISTRADOR".equals(nuevoRol)) {
            if (usuario.getNivelExperiencia() == null || usuario.getNivelExperiencia().isBlank()) {
                usuario.setNivelExperiencia("Coordinador");
            }
            if (usuario.getAreaInteres() == null || usuario.getAreaInteres().isBlank()) {
                usuario.setAreaInteres("Administración y Gestión Curricular");
            }
        }

        usuario.setRol(nuevoRol);
        usuario = usuarioRepository.save(usuario);

        // Registrar auditoría institucional
        auditoriaService.registrarEvento(
                "CAMBIO_ROL",
                callerEmail,
                callerEmail,
                "SUPERADMIN",
                "El Superadmin cambió el rol de " + emailUsuario + " de " + targetRolActual + " a " + nuevoRol
        );

        return toDTO(usuario);
    }

    private boolean isSuperAdmin(Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) return false;
        return auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equalsIgnoreCase("ROLE_SUPERADMIN") ||
                a.getAuthority().equalsIgnoreCase("SUPERADMIN")
        );
    }

    private boolean isAdmin(Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) return false;
        return auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equalsIgnoreCase("ROLE_ADMINISTRADOR") ||
                a.getAuthority().equalsIgnoreCase("ADMINISTRADOR")
        );
    }

    private UsuarioDTO toDTO(Usuario u) {
        return new UsuarioDTO(
                u.getId(),
                u.getNombreCompleto(),
                u.getCorreoElectronico(),
                u.getRol(),
                u.getNivelExperiencia(),
                u.getAreaInteres(),
                u.getDepartamentoFacultad(),
                u.getActivo(),
                u.getFechaCreacion()
        );
    }
}
