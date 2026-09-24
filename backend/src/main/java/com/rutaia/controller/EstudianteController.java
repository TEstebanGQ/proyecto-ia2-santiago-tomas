package com.rutaia.controller;

import com.rutaia.dto.EstudianteRegistroDTO;
import com.rutaia.dto.EstudianteResponseDTO;
import com.rutaia.dto.HistorialConsultaDTO;
import com.rutaia.service.DocenteService;
import com.rutaia.service.EstudianteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/estudiantes")
@Tag(name = "Estudiantes", description = "Operaciones para el registro, consulta e historial de estudiantes")
public class EstudianteController {

    private final EstudianteService estudianteService;
    private final DocenteService docenteService;

    public EstudianteController(EstudianteService estudianteService, DocenteService docenteService) {
        this.estudianteService = estudianteService;
        this.docenteService = docenteService;
    }

    private boolean isDocente(Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) return false;
        return auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equalsIgnoreCase("ROLE_DOCENTE") ||
                a.getAuthority().equalsIgnoreCase("DOCENTE")
        );
    }

    @PostMapping
    @Operation(summary = "Registrar un nuevo estudiante (RF 01)")
    public ResponseEntity<EstudianteResponseDTO> registrar(@Valid @RequestBody EstudianteRegistroDTO dto) {
        EstudianteResponseDTO nuevo = estudianteService.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @GetMapping
    @Operation(summary = "Listar todos los estudiantes registrados (RF 02)")
    public ResponseEntity<List<EstudianteResponseDTO>> listarTodos(Authentication authentication) {
        if (isDocente(authentication)) {
            String email = authentication.getName();
            List<com.rutaia.dto.DocenteEstudianteDTO> docentesEst = docenteService.listarEstudiantesDocente(email);
            List<EstudianteResponseDTO> resp = docentesEst.stream().map(d -> new EstudianteResponseDTO(
                    d.getId(), d.getNombreCompleto(), d.getCorreoElectronico(), d.getNivelExperiencia(), d.getAreaInteres(), d.getFechaCreacion()
            )).collect(Collectors.toList());
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.ok(estudianteService.listarTodos());
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar estudiantes por nombre o correo (RF 02)")
    public ResponseEntity<List<EstudianteResponseDTO>> buscarPorNombre(
            @RequestParam String query,
            Authentication authentication) {
        if (isDocente(authentication)) {
            String email = authentication.getName();
            List<com.rutaia.dto.DocenteEstudianteDTO> docentesEst = docenteService.buscarEstudiantesDocente(email, query);
            List<EstudianteResponseDTO> resp = docentesEst.stream().map(d -> new EstudianteResponseDTO(
                    d.getId(), d.getNombreCompleto(), d.getCorreoElectronico(), d.getNivelExperiencia(), d.getAreaInteres(), d.getFechaCreacion()
            )).collect(Collectors.toList());
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.ok(estudianteService.buscarPorNombre(query));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar un estudiante por identificador (RF 02)")
    public ResponseEntity<EstudianteResponseDTO> obtenerPorId(
            @PathVariable Long id,
            Authentication authentication) {
        if (isDocente(authentication)) {
            String email = authentication.getName();
            com.rutaia.dto.DocenteEstudianteDTO d = docenteService.obtenerEstudianteDocente(email, id);
            return ResponseEntity.ok(new EstudianteResponseDTO(
                    d.getId(), d.getNombreCompleto(), d.getCorreoElectronico(), d.getNivelExperiencia(), d.getAreaInteres(), d.getFechaCreacion()
            ));
        }
        return ResponseEntity.ok(estudianteService.obtenerPorId(id));
    }

    @GetMapping("/{id}/historial")
    @Operation(summary = "Consultar el historial de consultas y recomendaciones de un estudiante (RF 02, RF 16)")
    public ResponseEntity<List<HistorialConsultaDTO>> obtenerHistorial(
            @PathVariable Long id,
            Authentication authentication) {
        if (isDocente(authentication)) {
            String email = authentication.getName();
            return ResponseEntity.ok(docenteService.obtenerHistorialEstudianteDocente(email, id));
        }
        return ResponseEntity.ok(estudianteService.obtenerHistorial(id));
    }

    @PostMapping("/{estudianteId}/inscribir/{cursoId}")
    @Operation(summary = "Inscribir un estudiante a un curso (exclusivo para estudiantes)")
    public ResponseEntity<com.rutaia.dto.InscripcionResponseDTO> inscribir(
            @PathVariable Long estudianteId,
            @PathVariable Long cursoId,
            org.springframework.security.core.Authentication authentication) {
        String role = null;
        if (authentication != null && authentication.getAuthorities() != null && !authentication.getAuthorities().isEmpty()) {
            role = authentication.getAuthorities().iterator().next().getAuthority();
        }
        com.rutaia.dto.InscripcionResponseDTO inscripcion = estudianteService.inscribirEstudiante(estudianteId, cursoId, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(inscripcion);
    }

    @GetMapping("/{estudianteId}/inscripciones")
    @Operation(summary = "Consultar los cursos en los que un estudiante está matriculado")
    public ResponseEntity<List<com.rutaia.dto.InscripcionResponseDTO>> listarInscripciones(@PathVariable Long estudianteId) {
        return ResponseEntity.ok(estudianteService.listarInscripcionesPorEstudiante(estudianteId));
    }
}
