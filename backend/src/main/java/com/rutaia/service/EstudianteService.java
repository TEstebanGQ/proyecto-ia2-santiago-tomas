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
import java.util.stream.Collectors;

@Service
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;
    private final ConsultaRepository consultaRepository;

    public EstudianteService(EstudianteRepository estudianteRepository, ConsultaRepository consultaRepository) {
        this.estudianteRepository = estudianteRepository;
        this.consultaRepository = consultaRepository;
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
