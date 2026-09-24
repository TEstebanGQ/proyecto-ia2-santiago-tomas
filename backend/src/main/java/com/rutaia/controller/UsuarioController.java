package com.rutaia.controller;

import com.rutaia.dto.UsuarioDTO;
import com.rutaia.dto.UsuarioPasswordDTO;
import com.rutaia.dto.UsuarioRegistroDTO;
import com.rutaia.dto.UsuarioRolUpdateDTO;
import com.rutaia.dto.UsuarioUpdateDTO;
import com.rutaia.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuarios", description = "Gestión de usuarios del sistema, control jerárquico de roles y configuración de contraseñas")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    @Operation(summary = "Listar usuarios del sistema según permisos (Superadmin lista todos; Administrador solo lista Estudiantes y Docentes)")
    public ResponseEntity<List<UsuarioDTO>> listarUsuarios(Authentication auth) {
        return ResponseEntity.ok(usuarioService.listarUsuarios(auth));
    }

    @GetMapping("/roles-permitidos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    @Operation(summary = "Obtener roles que el usuario autenticado tiene permitido crear")
    public ResponseEntity<List<String>> obtenerRolesPermitidos(Authentication auth) {
        return ResponseEntity.ok(usuarioService.obtenerRolesPermitidos(auth));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    @Operation(summary = "Obtener detalle de un usuario por su identificador")
    public ResponseEntity<UsuarioDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    @Operation(summary = "Crear nuevo usuario (Superadmin: crea Administrador, Docente, Estudiante; Administrador: solo Docente y Estudiante)")
    public ResponseEntity<UsuarioDTO> crearUsuario(
            @Valid @RequestBody UsuarioRegistroDTO dto,
            Authentication auth
    ) {
        UsuarioDTO nuevo = usuarioService.crearUsuario(dto, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    @Operation(summary = "Editar datos básicos de un usuario (nombre, área, nivel, departamento)")
    public ResponseEntity<UsuarioDTO> actualizarUsuario(
            @PathVariable("id") Long id,
            @Valid @RequestBody UsuarioUpdateDTO dto,
            Authentication auth
    ) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, dto, auth));
    }

    @PatchMapping("/{id}/activo")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    @Operation(summary = "Activar o desactivar un usuario del sistema")
    public ResponseEntity<UsuarioDTO> toggleActivo(
            @PathVariable("id") Long id,
            @RequestParam("activo") boolean activo,
            Authentication auth
    ) {
        return ResponseEntity.ok(usuarioService.toggleActivoUsuario(id, activo, auth));
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    @Operation(summary = "Configurar o restablecer contraseña de un usuario")
    public ResponseEntity<Map<String, String>> cambiarPassword(
            @PathVariable("id") Long id,
            @Valid @RequestBody UsuarioPasswordDTO dto,
            Authentication auth
    ) {
        usuarioService.cambiarPassword(id, dto, auth);
        return ResponseEntity.ok(Map.of(
                "mensaje", "Contraseña configurada exitosamente para el usuario.",
                "estado", "OK"
        ));
    }

    @PatchMapping("/{id}/rol")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @Operation(summary = "Cambiar el rol de un usuario del sistema (Exclusivo Superadmin: puede cambiar a ADMINISTRADOR, DOCENTE o ESTUDIANTE)")
    public ResponseEntity<UsuarioDTO> cambiarRol(
            @PathVariable("id") Long id,
            @Valid @RequestBody UsuarioRolUpdateDTO dto,
            Authentication auth
    ) {
        return ResponseEntity.ok(usuarioService.cambiarRolUsuario(id, dto, auth));
    }
}
