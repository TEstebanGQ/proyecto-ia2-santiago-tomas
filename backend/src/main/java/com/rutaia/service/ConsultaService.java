package com.rutaia.service;

import com.rutaia.dto.*;
import com.rutaia.entity.*;
import com.rutaia.exception.BusinessRuleException;
import com.rutaia.exception.ResourceNotFoundException;
import com.rutaia.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ConsultaService {

    private static final Logger log = LoggerFactory.getLogger(ConsultaService.class);

    private final EstudianteRepository estudianteRepository;
    private final CursoRepository cursoRepository;
    private final ConsultaRepository consultaRepository;
    private final RecomendacionRepository recomendacionRepository;
    private final N8nOrquestadorService n8nOrquestadorService;
    private final ConfiguracionService configuracionService;

    public ConsultaService(
            EstudianteRepository estudianteRepository,
            CursoRepository cursoRepository,
            ConsultaRepository consultaRepository,
            RecomendacionRepository recomendacionRepository,
            N8nOrquestadorService n8nOrquestadorService,
            ConfiguracionService configuracionService
    ) {
        this.estudianteRepository = estudianteRepository;
        this.cursoRepository = cursoRepository;
        this.consultaRepository = consultaRepository;
        this.recomendacionRepository = recomendacionRepository;
        this.n8nOrquestadorService = n8nOrquestadorService;
        this.configuracionService = configuracionService;
    }

    @Transactional
    public RecomendacionResponseDTO procesarConsulta(ConsultaRecomendacionDTO dto) {

        // Regla: Validar que la pregunta no esté vacía
        if (dto.getPregunta() == null || dto.getPregunta().trim().isBlank()) {
            throw new BusinessRuleException(
                    "La pregunta de la consulta no puede estar vacía."
            );
        }

        // Regla: Toda consulta deberá pertenecer a un estudiante existente
        // RF 02 - Reglas de Negocio
        Estudiante estudiante = estudianteRepository.findById(dto.getEstudianteId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "El estudiante con ID " + dto.getEstudianteId()
                                        + " no existe en el sistema."
                        )
                );

        // RF 07: Registrar consulta con estado inicial Pendiente
        Consulta consulta = new Consulta(
                estudiante,
                dto.getPregunta().trim(),
                "Pendiente"
        );

        consulta = consultaRepository.save(consulta);

        // Obtener el umbral decimal actual
        // Ejemplo: 40.0% -> 0.40
        Double umbralDecimal = configuracionService
                .obtenerUmbral()
                .getValorDecimal()
                .doubleValue();

        // RF 08: Enviar a n8n:
        // - id_consulta
        // - pregunta
        // - nivel_experiencia
        // - area_interes
        // - cursos_previos
        // - contexto_previo
        // - umbral
        N8nRecomendacionRequest n8nRequest = new N8nRecomendacionRequest(
                consulta.getId(),
                consulta.getPregunta(),
                estudiante.getNivelExperiencia(),
                estudiante.getAreaInteres(),
                dto.getCursosPrevios(),
                dto.getContextoPrevio(),
                umbralDecimal
        );

        N8nRecomendacionResponse n8nResponse =
                n8nOrquestadorService.enviarConsultaAn8n(n8nRequest);

        // El catálogo sigue disponible aunque el orquestador externo esté
        // reiniciando o no responda. Esto evita mostrar un error técnico al estudiante.
        if ("Error".equalsIgnoreCase(n8nResponse.getEstadoFinal())) {
            log.warn("n8n no estuvo disponible para la consulta #{}; se usa el catálogo local", consulta.getId());
            n8nResponse = crearRespuestaCatalogoLocal(consulta);
        }

        // RF 14: Procesamiento y almacenamiento según estado final
        RecomendacionResponseDTO responseDTO =
                new RecomendacionResponseDTO();

        responseDTO.setIdConsulta(consulta.getId());
        responseDTO.setPregunta(consulta.getPregunta());

        if ("Respondida".equalsIgnoreCase(n8nResponse.getEstadoFinal())) {

            consulta.setEstado("Respondida");
            consultaRepository.save(consulta);

            Recomendacion recomendacion = new Recomendacion(
                    consulta,
                    n8nResponse.getRespuesta(),
                    "Respondida"
            );

            recomendacion = recomendacionRepository.save(recomendacion);

            List<FuenteResponseDTO> fuentesDTOList = new ArrayList<>();
            List<BigDecimal> similitudesList = new ArrayList<>();

            if (n8nResponse.getFuentes() != null) {

                for (N8nRecomendacionResponse.N8nFuenteDTO f :
                        n8nResponse.getFuentes()) {

                    Optional<Curso> cursoOpt = Optional.empty();

                    if (f.getId() != null) {
                        cursoOpt = cursoRepository.findById(f.getId());
                    }

                    if (cursoOpt.isEmpty() && f.getNombre() != null) {
                        cursoOpt = cursoRepository.findAll()
                                .stream()
                                .filter(c ->
                                        c.getNombre()
                                                .equalsIgnoreCase(
                                                        f.getNombre().trim()
                                                )
                                )
                                .findFirst();
                    }

                    if (cursoOpt.isPresent()) {

                        Curso curso = cursoOpt.get();

                        BigDecimal score =
                                f.getSimilitud() != null
                                        ? f.getSimilitud()
                                        : BigDecimal.valueOf(0.70);

                        Fuente fuente = new Fuente(
                                recomendacion,
                                curso,
                                score
                        );

                        recomendacion.addFuente(fuente);

                        fuentesDTOList.add(
                                new FuenteResponseDTO(
                                        curso.getId(),
                                        curso.getNombre(),
                                        curso.getDescripcion(),
                                        curso.getCategoria(),
                                        curso.getNivel(),
                                        curso.getDuracionHoras(),
                                        score
                                )
                        );

                        similitudesList.add(score);
                    }
                }

                recomendacion =
                        recomendacionRepository.save(recomendacion);
            }

            responseDTO.setIdRecomendacion(recomendacion.getId());
            responseDTO.setRespuesta(recomendacion.getRespuestaTexto());
            responseDTO.setFuentes(fuentesDTOList);
            responseDTO.setSimilitudes(similitudesList);
            responseDTO.setEstadoFinal("Respondida");
            responseDTO.setFecha(recomendacion.getFecha());

        } else if (
                "Sin resultados".equalsIgnoreCase(
                        n8nResponse.getEstadoFinal()
                )
        ) {

            consulta.setEstado("Sin resultados");
            consultaRepository.save(consulta);

            Recomendacion recomendacion = new Recomendacion(
                    consulta,
                    n8nResponse.getRespuesta() != null
                            ? n8nResponse.getRespuesta()
                            : "No se encontraron cursos en el catálogo que coincidan con la búsqueda.",
                    "Sin resultados"
            );

            recomendacion =
                    recomendacionRepository.save(recomendacion);

            responseDTO.setIdRecomendacion(recomendacion.getId());
            responseDTO.setRespuesta(recomendacion.getRespuestaTexto());
            responseDTO.setFuentes(new ArrayList<>());
            responseDTO.setSimilitudes(new ArrayList<>());
            responseDTO.setEstadoFinal("Sin resultados");
            responseDTO.setFecha(recomendacion.getFecha());

        } else {

            // Caso Error:
            // n8n, Qdrant o LLM fallaron
            consulta.setEstado("Error");
            consultaRepository.save(consulta);

            responseDTO.setRespuesta(
                    n8nResponse.getRespuesta() != null
                            ? n8nResponse.getRespuesta()
                            : "Ocurrió un error al procesar la recomendación con el motor de IA."
            );

            responseDTO.setFuentes(new ArrayList<>());
            responseDTO.setSimilitudes(new ArrayList<>());
            responseDTO.setEstadoFinal("Error");
        }

        return responseDTO;
    }

    private N8nRecomendacionResponse crearRespuestaCatalogoLocal(Consulta consulta) {
        List<Curso> cursos = cursoRepository.findByActivoTrue();
        N8nRecomendacionResponse respuesta = new N8nRecomendacionResponse();
        respuesta.setIdConsulta(consulta.getId());
        respuesta.setPregunta(consulta.getPregunta());
        respuesta.setEstadoFinal(cursos.isEmpty() ? "Sin resultados" : "Respondida");

        List<N8nRecomendacionResponse.N8nFuenteDTO> fuentes = new ArrayList<>();
        for (Curso curso : cursos) {
            N8nRecomendacionResponse.N8nFuenteDTO fuente = new N8nRecomendacionResponse.N8nFuenteDTO();
            fuente.setId(curso.getId());
            fuente.setNombre(curso.getNombre());
            fuente.setDescripcion(curso.getDescripcion());
            fuente.setCategoria(curso.getCategoria());
            fuente.setNivel(curso.getNivel());
            fuente.setDuracionHoras(curso.getDuracionHoras());
            fuente.setSimilitud(BigDecimal.valueOf(0.70));
            fuentes.add(fuente);
        }
        respuesta.setFuentes(fuentes);
        respuesta.setRespuesta(cursos.isEmpty()
                ? "Actualmente no hay cursos activos en el catálogo institucional."
                : "Mientras el asesor IA se reconecta, estos son los cursos disponibles en el catálogo institucional.");
        return respuesta;
    }
}
