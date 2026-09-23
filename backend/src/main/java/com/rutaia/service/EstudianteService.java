package com.rutaia.service;

import com.rutaia.dto.EstudianteRegistroDTO;
import com.rutaia.dto.EstudianteResponseDTO;
import com.rutaia.dto.FuenteResponseDTO;
import com.rutaia.dto.HistorialConsultaDTO;
import com.rutaia.entity.Consulta;
import com.rutaia.entity.Estudiante;
import com.rutaia.entity.Fuente;
import com.rutaia.entity.Recomendacion;
import com.rutaia.exception.ConflictException;
import com.rutaia.exception.ResourceNotFoundException;
import com.rutaia.repository.ConsultaRepository;
import com.rutaia.repository.EstudianteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import com.rutaia.dto.InscripcionResponseDTO;
import com.rutaia.entity.Curso;
import com.rutaia.entity.Inscripcion;
import com.rutaia.exception.BusinessRuleException;
import com.rutaia.repository.CursoRepository;
import com.rutaia.repository.InscripcionRepository;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;
    private final ConsultaRepository consultaRepository;
    private final InscripcionRepository inscripcionRepository;
    private final CursoRepository cursoRepository;
    private final AuditoriaService auditoriaService;

    public EstudianteService(
            EstudianteRepository estudianteRepository,
            ConsultaRepository consultaRepository,
            InscripcionRepository inscripcionRepository,
            CursoRepository cursoRepository,
            AuditoriaService auditoriaService
    ) {
        this.estudianteRepository = estudianteRepository;
        this.consultaRepository = consultaRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.cursoRepository = cursoRepository;
        this.auditoriaService = auditoriaService;
    }

    private final AuditoriaService auditoriaService;

    public EstudianteService(EstudianteRepository estudianteRepository, ConsultaRepository consultaRepository, AuditoriaService auditoriaService) {
        this.estudianteRepository = estudianteRepository;
        this.consultaRepository = consultaRepository;
        this.auditoriaService = auditoriaService;

    }

    @Transactional
    public EstudianteResponseDTO registrar(EstudianteRegistroDTO dto) {
        if (estudianteRepository.existsByCorreoElectronico(dto.getCorreoElectronico().trim().toLowerCase())) {
            throw new ConflictException("Ya existe un estudiante registrado con el correo electrónico: " + dto.getCorreoElectronico());
        }

        Estudiante estudiante = new Estudiante(
                dto.getNombreCompleto().trim(),
                dto.getCorreoElectronico().trim().toLowerCase(),
                dto.getNivelExperiencia().trim(),
                dto.getAreaInteres().trim()
        );

        Estudiante guardado = estudianteRepository.save(estudiante);

        auditoriaService.registrarEvento(
                "REGISTRO",
                guardado.getCorreoElectronico(),
                guardado.getNombreCompleto(),
                "ESTUDIANTE",
                "Registro de nuevo estudiante (" + guardado.getAreaInteres() + " - " + guardado.getNivelExperiencia() + ")"
        );

        return mapToResponse(guardado);
    }

    @Transactional(readOnly = true)
    public List<EstudianteResponseDTO> listarTodos() {
        return estudianteRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EstudianteResponseDTO> buscarPorNombre(String query) {
        if (query == null || query.trim().isEmpty()) {
            return listarTodos();
        }
        String q = query.trim();
        return estudianteRepository.findByNombreCompletoContainingIgnoreCaseOrCorreoElectronicoContainingIgnoreCase(q, q)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EstudianteResponseDTO obtenerPorId(Long id) {
        Estudiante estudiante = estudianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con ID: " + id));
        return mapToResponse(estudiante);
    }

    @Transactional(readOnly = true)
    public List<HistorialConsultaDTO> obtenerHistorial(Long estudianteId) {
        if (!estudianteRepository.existsById(estudianteId)) {
            throw new ResourceNotFoundException("Estudiante no encontrado con ID: " + estudianteId);
        }

        List<Consulta> consultas = consultaRepository.findByEstudianteIdOrderByFechaDesc(estudianteId);
        List<HistorialConsultaDTO> historial = new ArrayList<>();

        for (Consulta c : consultas) {
            HistorialConsultaDTO item = new HistorialConsultaDTO();
            item.setIdConsulta(c.getId());
            item.setPregunta(c.getPregunta());
            item.setFecha(c.getFecha());
            item.setEstado(c.getEstado());

            Recomendacion rec = c.getRecomendacion();
            if (rec != null) {
                item.setIdRecomendacion(rec.getId());
                item.setRespuesta(rec.getRespuestaTexto());

                if (rec.getFuentes() != null) {
                    List<FuenteResponseDTO> fuentesDTO = rec.getFuentes().stream().map(f -> new FuenteResponseDTO(
                            f.getCurso().getId(),
                            f.getCurso().getNombre(),
                            f.getCurso().getDescripcion(),
                            f.getCurso().getCategoria(),
                            f.getCurso().getNivel(),
                            f.getCurso().getDuracionHoras(),
                            f.getSimilitudScore()
                    )).collect(Collectors.toList());
                    item.setFuentes(fuentesDTO);
                }

                if (rec.getCalificacion() != null) {
                    item.setPuntuacion(rec.getCalificacion().getPuntuacion());
                    item.setComentario(rec.getCalificacion().getComentario());
                }
            }
            historial.add(item);
        }

        return historial;
    }

    @Transactional
    public InscripcionResponseDTO inscribirEstudiante(Long estudianteId, Long cursoId, String roleAutenticado) {
        if (roleAutenticado != null && !"ROLE_ESTUDIANTE".equals(roleAutenticado) && !"ESTUDIANTE".equals(roleAutenticado)) {
            throw new BusinessRuleException("Solo los estudiantes pueden inscribirse a los cursos.");
        }

        Estudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con ID: " + estudianteId));

        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con ID: " + cursoId));

        if (curso.getActivo() != null && !curso.getActivo()) {
            throw new BusinessRuleException("No es posible inscribirse a un curso inactivo.");
        }

        Optional<Inscripcion> existente = inscripcionRepository.findByEstudianteIdAndCursoId(estudianteId, cursoId);
        if (existente.isPresent()) {
            Inscripcion ins = existente.get();
            return new InscripcionResponseDTO(
                    ins.getId(),
                    estudiante.getId(),
                    estudiante.getNombreCompleto(),
                    estudiante.getCorreoElectronico(),
                    estudiante.getNivelExperiencia(),
                    estudiante.getAreaInteres(),
                    curso.getId(),
                    curso.getNombre(),
                    ins.getFechaInscripcion(),
                    ins.getEstado()
            );
        }

        Inscripcion nueva = new Inscripcion(estudiante, curso, "Inscrito", java.time.LocalDateTime.now());
        Inscripcion guardada = inscripcionRepository.save(nueva);

        return new InscripcionResponseDTO(
                guardada.getId(),
                estudiante.getId(),
                estudiante.getNombreCompleto(),
                estudiante.getCorreoElectronico(),
                estudiante.getNivelExperiencia(),
                estudiante.getAreaInteres(),
                curso.getId(),
                curso.getNombre(),
                guardada.getFechaInscripcion(),
                guardada.getEstado()
        );
    }

    @Transactional(readOnly = true)
    public List<InscripcionResponseDTO> listarInscripcionesPorEstudiante(Long estudianteId) {
        if (!estudianteRepository.existsById(estudianteId)) {
            throw new ResourceNotFoundException("Estudiante no encontrado con ID: " + estudianteId);
        }
        return inscripcionRepository.findByEstudianteIdOrderByFechaInscripcionDesc(estudianteId)
                .stream()
                .map(ins -> new InscripcionResponseDTO(
                        ins.getId(),
                        ins.getEstudiante().getId(),
                        ins.getEstudiante().getNombreCompleto(),
                        ins.getEstudiante().getCorreoElectronico(),
                        ins.getEstudiante().getNivelExperiencia(),
                        ins.getEstudiante().getAreaInteres(),
                        ins.getCurso().getId(),
                        ins.getCurso().getNombre(),
                        ins.getFechaInscripcion(),
                        ins.getEstado()
                ))
                .collect(Collectors.toList());
    }

    private EstudianteResponseDTO mapToResponse(Estudiante estudiante) {
        return new EstudianteResponseDTO(
                estudiante.getId(),
                estudiante.getNombreCompleto(),
                estudiante.getCorreoElectronico(),
                estudiante.getNivelExperiencia(),
                estudiante.getAreaInteres(),
                estudiante.getFechaCreacion()
        );
    }
}
