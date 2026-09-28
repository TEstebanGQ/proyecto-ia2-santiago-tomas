package com.rutaia.controller;

import com.rutaia.dto.CursoDTO;
import com.rutaia.dto.CursoResponseDTO;
import com.rutaia.dto.DocenteEstadisticasDTO;
import com.rutaia.dto.DocenteFeedbackDTO;
import com.rutaia.dto.DocenteResponseDTO;
import com.rutaia.entity.Docente;
import com.rutaia.service.DocenteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/docentes")
@Tag(name = "Docentes", description = "Gestión curricular por especialidad, monitoreo de feedback y analíticas docentes")
public class DocenteController {

    private final DocenteService docenteService;

    public DocenteController(DocenteService docenteService) {
        this.docenteService = docenteService;
    }

    private String extraerEmail(Authentication authentication, String emailParam) {
        if (emailParam != null && !emailParam.isBlank()) {
            return emailParam.trim();
        }
        if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
            return authentication.getName().trim();
        }
        return "profesor.programacion@universidad.edu.co";
    }

    @GetMapping
    @Operation(summary = "Listar todos los docentes registrados en la institución")
    public ResponseEntity<List<DocenteResponseDTO>> listarTodos() {
        return ResponseEntity.ok(docenteService.listarTodosDocentes());
    }

    @GetMapping("/perfil")
    @Operation(summary = "Obtener perfil del docente actual")
    public ResponseEntity<DocenteResponseDTO> obtenerPerfil(
            @RequestParam(required = false) String email,
            Authentication authentication) {
        String emailDocente = extraerEmail(authentication, email);
        Docente d = docenteService.obtenerDocentePorEmail(emailDocente);
        return ResponseEntity.ok(new DocenteResponseDTO(
                d.getId(),
                d.getNombreCompleto(),
                d.getCorreoElectronico(),
                d.getAreaEspecialidad(),
                d.getDepartamentoFacultad(),
                d.getFechaCreacion()
        ));
    }

    @GetMapping("/cursos")
    @Operation(summary = "Listar cursos del área de especialidad del docente")
    public ResponseEntity<List<CursoResponseDTO>> listarCursos(
            @RequestParam(required = false) String email,
            Authentication authentication) {
        String emailDocente = extraerEmail(authentication, email);
        return ResponseEntity.ok(docenteService.listarCursosEspecialidad(emailDocente));
    }

    @GetMapping("/cursos/{id}/inscritos")
    @Operation(summary = "Consultar lista de estudiantes inscritos en un curso de su especialidad")
    public ResponseEntity<List<com.rutaia.dto.InscripcionResponseDTO>> listarInscritos(
            @PathVariable Long id,
            @RequestParam(required = false) String email,
            Authentication authentication) {
        String emailDocente = extraerEmail(authentication, email);
        return ResponseEntity.ok(docenteService.obtenerInscritosPorCurso(emailDocente, id));
    }

    @PostMapping("/cursos")
    @Operation(summary = "Crear nuevo curso validando frontera curricular de especialidad")
    public ResponseEntity<CursoResponseDTO> crearCurso(
            @RequestParam(required = false) String email,
            @Valid @RequestBody CursoDTO dto,
            Authentication authentication) {
        String emailDocente = extraerEmail(authentication, email);
        CursoResponseDTO nuevo = docenteService.crearCursoEspecialidad(emailDocente, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/cursos/{id}")
    @Operation(summary = "Actualizar curso validando frontera curricular de especialidad")
    public ResponseEntity<CursoResponseDTO> actualizarCurso(
            @PathVariable Long id,
            @RequestParam(required = false) String email,
            @Valid @RequestBody CursoDTO dto,
            Authentication authentication) {
        String emailDocente = extraerEmail(authentication, email);
        return ResponseEntity.ok(docenteService.actualizarCursoEspecialidad(emailDocente, id, dto));
    }

    @PatchMapping("/cursos/{id}/desactivar")
    @Operation(summary = "Desactivar curso de su especialidad (elimina vector en Qdrant)")
    public ResponseEntity<CursoResponseDTO> desactivarCurso(
            @PathVariable Long id,
            @RequestParam(required = false) String email,
            Authentication authentication) {
        String emailDocente = extraerEmail(authentication, email);
        return ResponseEntity.ok(docenteService.desactivarCursoEspecialidad(emailDocente, id));
    }

    @PatchMapping("/cursos/{id}/activar")
    @Operation(summary = "Activar curso de su especialidad (reindexa vector en Qdrant)")
    public ResponseEntity<CursoResponseDTO> activarCurso(
            @PathVariable Long id,
            @RequestParam(required = false) String email,
            Authentication authentication) {
        String emailDocente = extraerEmail(authentication, email);
        return ResponseEntity.ok(docenteService.activarCursoEspecialidad(emailDocente, id));
    }

    @GetMapping("/feedback")
    @Operation(summary = "Monitoreo de consultas de estudiantes y valoraciones de sus asignaturas")
    public ResponseEntity<List<DocenteFeedbackDTO>> obtenerFeedback(
            @RequestParam(required = false) String email,
            Authentication authentication) {
        String emailDocente = extraerEmail(authentication, email);
        return ResponseEntity.ok(docenteService.obtenerFeedbackConsultas(emailDocente));
    }

    @GetMapping("/estadisticas")
    @Operation(summary = "Analíticas académicas de la cátedra y especialidad del docente")
    public ResponseEntity<DocenteEstadisticasDTO> obtenerEstadisticas(
            @RequestParam(required = false) String email,
            Authentication authentication) {
        String emailDocente = extraerEmail(authentication, email);
        return ResponseEntity.ok(docenteService.obtenerEstadisticas(emailDocente));
    }

    @GetMapping("/estudiantes")
    @Operation(summary = "Listar estudiantes matriculados en cursos de la cátedra del docente")
    public ResponseEntity<List<com.rutaia.dto.DocenteEstudianteDTO>> listarEstudiantes(
            @RequestParam(required = false) String email,
            Authentication authentication) {
        String emailDocente = extraerEmail(authentication, email);
        return ResponseEntity.ok(docenteService.listarEstudiantesDocente(emailDocente));
    }

    @GetMapping("/estudiantes/buscar")
    @Operation(summary = "Buscar estudiantes matriculados en cursos del docente por nombre o correo")
    public ResponseEntity<List<com.rutaia.dto.DocenteEstudianteDTO>> buscarEstudiantes(
            @RequestParam String query,
            @RequestParam(required = false) String email,
            Authentication authentication) {
        String emailDocente = extraerEmail(authentication, email);
        return ResponseEntity.ok(docenteService.buscarEstudiantesDocente(emailDocente, query));
    }

    @GetMapping("/estudiantes/{id}")
    @Operation(summary = "Consultar detalle de un estudiante matriculado en cursos del docente")
    public ResponseEntity<com.rutaia.dto.DocenteEstudianteDTO> obtenerEstudiante(
            @PathVariable Long id,
            @RequestParam(required = false) String email,
            Authentication authentication) {
        String emailDocente = extraerEmail(authentication, email);
        return ResponseEntity.ok(docenteService.obtenerEstudianteDocente(emailDocente, id));
    }

    @GetMapping("/estudiantes/{id}/historial")
    @Operation(summary = "Consultar historial de un estudiante matriculado en cursos del docente")
    public ResponseEntity<List<com.rutaia.dto.HistorialConsultaDTO>> obtenerHistorialEstudiante(
            @PathVariable Long id,
            @RequestParam(required = false) String email,
            Authentication authentication) {
        String emailDocente = extraerEmail(authentication, email);
        return ResponseEntity.ok(docenteService.obtenerHistorialEstudianteDocente(emailDocente, id));
    }
}
