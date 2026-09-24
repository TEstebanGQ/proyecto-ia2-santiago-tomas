package com.rutaia.service;

import com.rutaia.dto.CursoDTO;
import com.rutaia.dto.CursoResponseDTO;
import com.rutaia.dto.DocenteEstadisticasDTO;
import com.rutaia.dto.DocenteFeedbackDTO;
import com.rutaia.dto.DocenteResponseDTO;
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
import com.rutaia.dto.DocenteEstudianteDTO;
import com.rutaia.dto.HistorialConsultaDTO;
import com.rutaia.dto.InscripcionResponseDTO;
import com.rutaia.entity.Estudiante;
import com.rutaia.entity.Inscripcion;
import com.rutaia.repository.EstudianteRepository;
import com.rutaia.repository.InscripcionRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocenteService {

    private final DocenteRepository docenteRepository;
    private final CursoRepository cursoRepository;
    private final CursoService cursoService;
    private final FuenteRepository fuenteRepository;
    private final CalificacionRepository calificacionRepository;
    private final InscripcionRepository inscripcionRepository;
    private final EstudianteRepository estudianteRepository;
    private final EstudianteService estudianteService;

    public DocenteService(DocenteRepository docenteRepository,
                          CursoRepository cursoRepository,
                          CursoService cursoService,
                          FuenteRepository fuenteRepository,
                          CalificacionRepository calificacionRepository,
                          InscripcionRepository inscripcionRepository,
                          EstudianteRepository estudianteRepository,
                          EstudianteService estudianteService) {
        this.docenteRepository = docenteRepository;
        this.cursoRepository = cursoRepository;
        this.cursoService = cursoService;
        this.fuenteRepository = fuenteRepository;
        this.calificacionRepository = calificacionRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.estudianteRepository = estudianteRepository;
        this.estudianteService = estudianteService;
    }

    @Transactional
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
    public List<DocenteResponseDTO> listarTodosDocentes() {
        List<Docente> docentes = docenteRepository.findAll();
        return docentes.stream().map(d -> new DocenteResponseDTO(
                d.getId(),
                d.getNombreCompleto(),
                d.getCorreoElectronico(),
                d.getAreaEspecialidad(),
                d.getDepartamentoFacultad(),
                d.getFechaCreacion()
        )).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CursoResponseDTO> listarCursosEspecialidad(String emailDocente) {
        Docente docente = obtenerDocentePorEmail(emailDocente);
        List<Curso> cursos = cursoRepository.findByCategoriaIgnoreCaseOrderByNombreAsc(docente.getAreaEspecialidad());
        return cursos.stream().map(c -> {
            CursoResponseDTO dto = cursoService.mapToResponse(c);
            dto.setTotalInscritos((int) inscripcionRepository.countByCursoId(c.getId()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InscripcionResponseDTO> obtenerInscritosPorCurso(String emailDocente, Long cursoId) {
        Docente docente = obtenerDocentePorEmail(emailDocente);
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + cursoId));

        if (!docente.getAreaEspecialidad().equalsIgnoreCase(curso.getCategoria())) {
            throw new BusinessRuleException("Frontera curricular: Solo puedes consultar estudiantes inscritos en cursos de tu especialidad (" + docente.getAreaEspecialidad() + ")");
        }

        List<Inscripcion> inscripciones = inscripcionRepository.findByCursoIdOrderByFechaInscripcionDesc(cursoId);
        return inscripciones.stream().map(ins -> new InscripcionResponseDTO(
                ins.getId(),
                ins.getEstudiante().getId(),
                ins.getEstudiante().getNombreCompleto(),
                ins.getEstudiante().getCorreoElectronico(),
                ins.getEstudiante().getNivelExperiencia(),
                ins.getEstudiante().getAreaInteres(),
                curso.getId(),
                curso.getNombre(),
                ins.getFechaInscripcion(),
                ins.getEstado()
        )).collect(Collectors.toList());
    }

    @Transactional
    public CursoResponseDTO crearCursoEspecialidad(String emailDocente, CursoDTO dto) {
        throw new BusinessRuleException("Permiso restringido: Los docentes tienen permisos de visualización curricular y supervisión de estudiantes inscritos. La creación de asignaturas corresponde a la Administración.");
    }

    @Transactional
    public CursoResponseDTO actualizarCursoEspecialidad(String emailDocente, Long id, CursoDTO dto) {
        throw new BusinessRuleException("Permiso restringido: Los docentes no pueden modificar el contenido oficial del catálogo de cursos. Debe ser gestionado por la Administración.");
    }

    @Transactional
    public CursoResponseDTO desactivarCursoEspecialidad(String emailDocente, Long id) {
        throw new BusinessRuleException("Permiso restringido: Los docentes no pueden desactivar ni eliminar cursos del catálogo institucional.");
    }

    @Transactional
    public CursoResponseDTO activarCursoEspecialidad(String emailDocente, Long id) {
        throw new BusinessRuleException("Permiso restringido: Los docentes no pueden alterar el estado de publicación de los cursos.");
    }

    @Transactional
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

    @Transactional
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

    @Transactional(readOnly = true)
    public List<DocenteEstudianteDTO> listarEstudiantesDocente(String emailDocente) {
        Docente docente = obtenerDocentePorEmail(emailDocente);
        String categoria = docente.getAreaEspecialidad();
        List<Estudiante> estudiantes = inscripcionRepository.findEstudiantesByCursoCategoria(categoria);
        return estudiantes.stream()
                .map(e -> mapToDocenteEstudianteDTO(e, categoria))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocenteEstudianteDTO> buscarEstudiantesDocente(String emailDocente, String query) {
        Docente docente = obtenerDocentePorEmail(emailDocente);
        String categoria = docente.getAreaEspecialidad();
        String q = (query != null) ? query.trim() : "";
        List<Estudiante> estudiantes = inscripcionRepository.buscarEstudiantesPorCursoCategoria(categoria, q);
        return estudiantes.stream()
                .map(e -> mapToDocenteEstudianteDTO(e, categoria))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocenteEstudianteDTO obtenerEstudianteDocente(String emailDocente, Long estudianteId) {
        Docente docente = obtenerDocentePorEmail(emailDocente);
        String categoria = docente.getAreaEspecialidad();

        boolean estaInscrito = inscripcionRepository.existsByEstudianteIdAndCursoCategoria(estudianteId, categoria);
        if (!estaInscrito) {
            throw new ResourceNotFoundException("El estudiante #" + estudianteId + " no está matriculado en ningún curso de su especialidad (" + categoria + ")");
        }

        Estudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con ID: " + estudianteId));

        return mapToDocenteEstudianteDTO(estudiante, categoria);
    }

    @Transactional(readOnly = true)
    public List<HistorialConsultaDTO> obtenerHistorialEstudianteDocente(String emailDocente, Long estudianteId) {
        Docente docente = obtenerDocentePorEmail(emailDocente);
        String categoria = docente.getAreaEspecialidad();

        boolean estaInscrito = inscripcionRepository.existsByEstudianteIdAndCursoCategoria(estudianteId, categoria);
        if (!estaInscrito) {
            throw new ResourceNotFoundException("Frontera de datos: Solo puede consultar el historial de estudiantes matriculados en sus cátedras");
        }

        return estudianteService.obtenerHistorial(estudianteId);
    }

    private DocenteEstudianteDTO mapToDocenteEstudianteDTO(Estudiante e, String categoria) {
        List<Inscripcion> inscripciones = inscripcionRepository.findByEstudianteIdAndCursoCategoria(e.getId(), categoria);
        List<String> nombresCursos = inscripciones.stream()
                .map(i -> i.getCurso().getNombre())
                .collect(Collectors.toList());

        return new DocenteEstudianteDTO(
                e.getId(),
                e.getNombreCompleto(),
                e.getCorreoElectronico(),
                e.getNivelExperiencia(),
                e.getAreaInteres(),
                e.getFechaCreacion(),
                nombresCursos
        );
    }
}
