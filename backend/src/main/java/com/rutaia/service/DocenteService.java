package com.rutaia.service;

import com.rutaia.dto.CursoDTO;
import com.rutaia.dto.CursoResponseDTO;
import com.rutaia.dto.DocenteEstadisticasDTO;
import com.rutaia.dto.DocenteFeedbackDTO;
import com.rutaia.entity.Curso;
import com.rutaia.entity.Docente;
import com.rutaia.entity.Fuente;
import com.rutaia.exception.BusinessRuleException;
import com.rutaia.exception.ResourceNotFoundException;
import com.rutaia.repository.CalificacionRepository;
import com.rutaia.repository.CursoRepository;
import com.rutaia.repository.DocenteRepository;
import com.rutaia.repository.FuenteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocenteService {

    private final DocenteRepository docenteRepository;
    private final CursoRepository cursoRepository;
    private final CursoService cursoService;
    private final FuenteRepository fuenteRepository;
    private final CalificacionRepository calificacionRepository;

    public DocenteService(DocenteRepository docenteRepository,
                          CursoRepository cursoRepository,
                          CursoService cursoService,
                          FuenteRepository fuenteRepository,
                          CalificacionRepository calificacionRepository) {
        this.docenteRepository = docenteRepository;
        this.cursoRepository = cursoRepository;
        this.cursoService = cursoService;
        this.fuenteRepository = fuenteRepository;
        this.calificacionRepository = calificacionRepository;
    }

    @Transactional(readOnly = true)
    public Docente obtenerDocentePorEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResourceNotFoundException("Correo del docente no proporcionado");
        }
        return docenteRepository.findByCorreoElectronicoIgnoreCase(email.trim())
                .orElseGet(() -> {
                    // Fallback predeterminado según el correo
                    String nombre = "Profesor Académico";
                    String especialidad = "Programación";
                    String lower = email.toLowerCase();
                    if (lower.contains("ia") || lower.contains("inteligencia")) {
                        especialidad = "Inteligencia Artificial";
                        nombre = "Dr. Especialista en IA";
                    } else if (lower.contains("devops") || lower.contains("cloud")) {
                        especialidad = "DevOps y Cloud";
                        nombre = "Ing. Especialista DevOps";
                    } else if (lower.contains("datos") || lower.contains("data")) {
                        especialidad = "Bases de Datos";
                        nombre = "Prof. Especialista en Datos";
                    }
                    Docente nuevo = new Docente(nombre, email.trim(), especialidad, "Facultad de Ingeniería");
                    return docenteRepository.save(nuevo);
                });
    }

    @Transactional(readOnly = true)
    public List<CursoResponseDTO> listarCursosEspecialidad(String emailDocente) {
        Docente docente = obtenerDocentePorEmail(emailDocente);
        List<Curso> cursos = cursoRepository.findByCategoriaIgnoreCaseOrderByNombreAsc(docente.getAreaEspecialidad());
        return cursos.stream().map(cursoService::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public CursoResponseDTO crearCursoEspecialidad(String emailDocente, CursoDTO dto) {
        Docente docente = obtenerDocentePorEmail(emailDocente);
        if (!docente.getAreaEspecialidad().equalsIgnoreCase(dto.getCategoria())) {
            throw new BusinessRuleException("Frontera curricular: Como docente solo puedes crear cursos dentro de tu especialidad: " + docente.getAreaEspecialidad());
        }
        return cursoService.crear(dto);
    }

    @Transactional
    public CursoResponseDTO actualizarCursoEspecialidad(String emailDocente, Long id, CursoDTO dto) {
        Docente docente = obtenerDocentePorEmail(emailDocente);
        Curso actual = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + id));

        if (!docente.getAreaEspecialidad().equalsIgnoreCase(actual.getCategoria())) {
            throw new BusinessRuleException("Frontera curricular: No tienes permisos para modificar cursos fuera de tu especialidad (" + docente.getAreaEspecialidad() + ")");
        }
        if (!docente.getAreaEspecialidad().equalsIgnoreCase(dto.getCategoria())) {
            throw new BusinessRuleException("No puedes cambiar la categoría de un curso a una diferente a tu especialidad (" + docente.getAreaEspecialidad() + ")");
        }

        return cursoService.actualizar(id, dto);
    }

    @Transactional
    public CursoResponseDTO desactivarCursoEspecialidad(String emailDocente, Long id) {
        Docente docente = obtenerDocentePorEmail(emailDocente);
        Curso actual = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + id));

        if (!docente.getAreaEspecialidad().equalsIgnoreCase(actual.getCategoria())) {
            throw new BusinessRuleException("Frontera curricular: No tienes permisos para desactivar cursos fuera de tu especialidad (" + docente.getAreaEspecialidad() + ")");
        }

        return cursoService.desactivar(id);
    }

    @Transactional
    public CursoResponseDTO activarCursoEspecialidad(String emailDocente, Long id) {
        Docente docente = obtenerDocentePorEmail(emailDocente);
        Curso actual = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + id));

        if (!docente.getAreaEspecialidad().equalsIgnoreCase(actual.getCategoria())) {
            throw new BusinessRuleException("Frontera curricular: No tienes permisos para activar cursos fuera de tu especialidad (" + docente.getAreaEspecialidad() + ")");
        }

        return cursoService.activar(id);
    }

    @Transactional(readOnly = true)
    public List<DocenteFeedbackDTO> obtenerFeedbackConsultas(String emailDocente) {
        Docente docente = obtenerDocentePorEmail(emailDocente);
        List<Fuente> fuentes = fuenteRepository.findByCursoCategoriaOrderByFechaDesc(docente.getAreaEspecialidad());

        List<DocenteFeedbackDTO> feedbackList = new ArrayList<>();
        for (Fuente f : fuentes) {
            Double sim = f.getSimilitudScore() != null ? f.getSimilitudScore().doubleValue() : 0.0;
            Integer score = null;
            String com = null;
            if (f.getRecomendacion() != null && f.getRecomendacion().getCalificacion() != null) {
                score = f.getRecomendacion().getCalificacion().getPuntuacion();
                com = f.getRecomendacion().getCalificacion().getComentario();
            }

            feedbackList.add(new DocenteFeedbackDTO(
                    f.getRecomendacion() != null && f.getRecomendacion().getConsulta() != null ? f.getRecomendacion().getConsulta().getId() : null,
                    f.getRecomendacion() != null ? f.getRecomendacion().getId() : null,
                    f.getRecomendacion() != null && f.getRecomendacion().getConsulta() != null && f.getRecomendacion().getConsulta().getEstudiante() != null
                            ? f.getRecomendacion().getConsulta().getEstudiante().getNombreCompleto() : "Estudiante",
                    f.getRecomendacion() != null && f.getRecomendacion().getConsulta() != null && f.getRecomendacion().getConsulta().getEstudiante() != null
                            ? f.getRecomendacion().getConsulta().getEstudiante().getNivelExperiencia() : "General",
                    f.getRecomendacion() != null && f.getRecomendacion().getConsulta() != null ? f.getRecomendacion().getConsulta().getPregunta() : "",
                    f.getRecomendacion() != null && f.getRecomendacion().getConsulta() != null ? f.getRecomendacion().getConsulta().getFecha() : null,
                    f.getCurso() != null ? f.getCurso().getId() : null,
                    f.getCurso() != null ? f.getCurso().getNombre() : "Curso",
                    f.getCurso() != null ? f.getCurso().getCategoria() : docente.getAreaEspecialidad(),
                    sim,
                    f.getRecomendacion() != null ? f.getRecomendacion().getRespuestaTexto() : "",
                    score,
                    com
            ));
        }
        return feedbackList;
    }

    @Transactional(readOnly = true)
    public DocenteEstadisticasDTO obtenerEstadisticas(String emailDocente) {
        Docente docente = obtenerDocentePorEmail(emailDocente);
        String especialidad = docente.getAreaEspecialidad();

        long totalCursos = cursoRepository.countByCategoriaIgnoreCase(especialidad);
        long cursosActivos = cursoRepository.countByCategoriaIgnoreCaseAndActivoTrue(especialidad);
        long totalConsultas = fuenteRepository.countConsultasPorCategoria(especialidad);

        Double promedio = calificacionRepository.obtenerPromedioPuntuacionPorCategoria(especialidad);
        if (promedio != null) {
            promedio = Math.round(promedio * 100.0) / 100.0;
        }

        long totalCalificaciones = calificacionRepository.countCalificacionesPorCategoria(especialidad);

        String cursoTop = "Ninguno aún";
        List<Object[]> topCursos = cursoRepository.findCursoMasRecomendadoPorCategoria(especialidad);
        if (topCursos != null && !topCursos.isEmpty() && topCursos.get(0) != null) {
            Object[] row = topCursos.get(0);
            if (row.length > 0 && row[0] != null) {
                cursoTop = row[0].toString() + " (" + row[1] + " recomendaciones)";
            }
        }

        return new DocenteEstadisticasDTO(
                especialidad,
                totalCursos,
                cursosActivos,
                totalConsultas,
                promedio,
                cursoTop,
                totalCalificaciones
        );
    }
}
