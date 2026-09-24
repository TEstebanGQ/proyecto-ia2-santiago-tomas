package com.rutaia.service;

import com.rutaia.dto.CalificacionCursoDTO;
import com.rutaia.dto.CursoDTO;
import com.rutaia.dto.CursoResponseDTO;
import com.rutaia.entity.CalificacionCurso;
import com.rutaia.entity.Curso;
import com.rutaia.exception.BusinessRuleException;
import com.rutaia.exception.ResourceNotFoundException;
import com.rutaia.repository.CalificacionCursoRepository;
import com.rutaia.repository.CursoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CursoService {

    private final CursoRepository cursoRepository;
    private final CalificacionCursoRepository calificacionCursoRepository;
    private final QdrantSyncService qdrantSyncService;

    public CursoService(CursoRepository cursoRepository, CalificacionCursoRepository calificacionCursoRepository, QdrantSyncService qdrantSyncService) {
        this.cursoRepository = cursoRepository;
        this.calificacionCursoRepository = calificacionCursoRepository;
        this.qdrantSyncService = qdrantSyncService;
    }

    @Transactional(readOnly = true)
    public List<CursoResponseDTO> listarCursosActivos(String categoria, String nivel) {
        List<Curso> cursos;
        boolean hasCategoria = categoria != null && !categoria.isBlank();
        boolean hasNivel = nivel != null && !nivel.isBlank();

        if (hasCategoria && hasNivel) {
            cursos = cursoRepository.findByActivoTrueAndCategoriaIgnoreCaseAndNivelIgnoreCase(categoria.trim(), nivel.trim());
        } else if (hasCategoria) {
            cursos = cursoRepository.findByActivoTrueAndCategoriaIgnoreCase(categoria.trim());
        } else if (hasNivel) {
            cursos = cursoRepository.findByActivoTrueAndNivelIgnoreCase(nivel.trim());
        } else {
            cursos = cursoRepository.findByActivoTrue();
        }

        return cursos.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CursoResponseDTO> listarTodosAdmin() {
        return cursoRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CursoResponseDTO obtenerPorId(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + id));
        return mapToResponse(curso);
    }

    @Transactional
    public CursoResponseDTO crear(CursoDTO dto) {
        validarReglasCurso(dto);
        Curso curso = new Curso(
                dto.getNombre().trim(),
                dto.getDescripcion().trim(),
                dto.getCategoria().trim(),
                dto.getNivel().trim(),
                dto.getDuracionHoras(),
                dto.getPrerrequisitos() != null ? dto.getPrerrequisitos().trim() : null,
                dto.getActivo() != null ? dto.getActivo() : true
        );
        Curso guardado = cursoRepository.save(curso);

        // Sincronización automática con Qdrant Vector DB si está activo (RF 05)
        if (Boolean.TRUE.equals(guardado.getActivo())) {
            qdrantSyncService.sincronizarCurso(guardado);
        }

        return mapToResponse(guardado);
    }

    @Transactional
    public CursoResponseDTO actualizar(Long id, CursoDTO dto) {
        validarReglasCurso(dto);
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + id));

        curso.setNombre(dto.getNombre().trim());
        curso.setDescripcion(dto.getDescripcion().trim());
        curso.setCategoria(dto.getCategoria().trim());
        curso.setNivel(dto.getNivel().trim());
        curso.setDuracionHoras(dto.getDuracionHoras());
        curso.setPrerrequisitos(dto.getPrerrequisitos() != null ? dto.getPrerrequisitos().trim() : null);
        if (dto.getActivo() != null) {
            curso.setActivo(dto.getActivo());
        }

        Curso actualizado = cursoRepository.save(curso);

        // Sincronización o eliminación del vector según el estado de activación
        if (Boolean.TRUE.equals(actualizado.getActivo())) {
            qdrantSyncService.sincronizarCurso(actualizado);
        } else {
            qdrantSyncService.eliminarVectorCurso(id);
        }

        return mapToResponse(actualizado);
    }

    @Transactional
    public CursoResponseDTO desactivar(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + id));
        curso.setActivo(false);
        Curso actualizado = cursoRepository.save(curso);

        // Eliminación inmediata del vector en Qdrant al desactivar el curso
        qdrantSyncService.eliminarVectorCurso(id);

        return mapToResponse(actualizado);
    }

    @Transactional
    public CursoResponseDTO activar(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + id));
        curso.setActivo(true);
        Curso actualizado = cursoRepository.save(curso);

        // Sincronización y reindexación del vector en Qdrant al reactivar el curso
        qdrantSyncService.sincronizarCurso(actualizado);

        return mapToResponse(actualizado);
    }

    @Transactional
    public CalificacionCursoDTO calificarCurso(Long cursoId, CalificacionCursoDTO dto) {
        if (dto.getPuntuacion() == null || dto.getPuntuacion() < 1 || dto.getPuntuacion() > 5) {
            throw new BusinessRuleException("La calificación debe ser un valor entero entre 1 y 5 estrellas.");
        }

        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + cursoId));

        CalificacionCurso calificacion = new CalificacionCurso(
                curso,
                dto.getPuntuacion(),
                dto.getComentario() != null ? dto.getComentario().trim() : null,
                dto.getEstudianteId()
        );

        calificacionCursoRepository.save(calificacion);
        dto.setCursoId(cursoId);
        return dto;
    }

    private void validarReglasCurso(CursoDTO dto) {
        if (dto.getDuracionHoras() == null || dto.getDuracionHoras() <= 0) {
            throw new BusinessRuleException("La duración del curso debe ser mayor que cero horas.");
        }
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new BusinessRuleException("El curso no puede registrarse sin nombre.");
        }
        if (dto.getDescripcion() == null || dto.getDescripcion().isBlank()) {
            throw new BusinessRuleException("El curso no puede registrarse sin descripción.");
        }
    }

    public CursoResponseDTO mapToResponse(Curso c) {
        CursoResponseDTO response = new CursoResponseDTO(
                c.getId(),
                c.getNombre(),
                c.getDescripcion(),
                c.getCategoria(),
                c.getNivel(),
                c.getDuracionHoras(),
                c.getPrerrequisitos(),
                c.getActivo(),
                c.getFechaCreacion()
        );

        Double promedio = calificacionCursoRepository.findPromedioPuntuacionByCursoId(c.getId());
        Long total = calificacionCursoRepository.countByCursoId(c.getId());

        response.setPromedioCalificaciones(promedio != null ? Math.round(promedio * 10.0) / 10.0 : null);
        response.setTotalCalificaciones(total != null ? total : 0L);

        return response;
    }
}
