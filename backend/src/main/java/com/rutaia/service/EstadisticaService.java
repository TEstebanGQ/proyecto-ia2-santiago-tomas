package com.rutaia.service;

import com.rutaia.dto.AccionDiaDTO;
import com.rutaia.dto.AccionUsuarioDTO;
import com.rutaia.dto.AuditoriaDTO;
import com.rutaia.dto.EstadisticasAdminDTO;
import com.rutaia.dto.EstadisticasDTO;
import com.rutaia.entity.Estudiante;
import com.rutaia.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EstadisticaService {

    private final ConsultaRepository consultaRepository;
    private final CalificacionRepository calificacionRepository;
    private final CursoRepository cursoRepository;
    private final EstudianteRepository estudianteRepository;
    private final AuditoriaRepository auditoriaRepository;
    private final AuditoriaService auditoriaService;

    public EstadisticaService(ConsultaRepository consultaRepository,
                               CalificacionRepository calificacionRepository,
                               CursoRepository cursoRepository,
                               EstudianteRepository estudianteRepository,
                               AuditoriaRepository auditoriaRepository,
                               AuditoriaService auditoriaService) {
        this.consultaRepository = consultaRepository;
        this.calificacionRepository = calificacionRepository;
        this.cursoRepository = cursoRepository;
        this.estudianteRepository = estudianteRepository;
        this.auditoriaRepository = auditoriaRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public EstadisticasDTO obtenerEstadisticas() {
        return obtenerEstadisticas(null);
    }

    @Transactional(readOnly = true)
    public EstadisticasDTO obtenerEstadisticas(Long estudianteId) {
        if (estudianteId != null) {
            long total = consultaRepository.countByEstudianteId(estudianteId);
            long respondidas = consultaRepository.countByEstudianteIdAndEstado(estudianteId, "Respondida");
            long sinResultados = consultaRepository.countByEstudianteIdAndEstado(estudianteId, "Sin resultados");
            long errores = consultaRepository.countByEstudianteIdAndEstado(estudianteId, "Error");

            Double promedio = calificacionRepository.obtenerPromedioPuntuacionPorEstudiante(estudianteId);
            if (promedio != null) {
                promedio = Math.round(promedio * 100.0) / 100.0;
            }

            String cursoTop = "Ninguno aún";
            List<Object[]> topCursos = cursoRepository.findCursoMasRecomendadoPorEstudiante(estudianteId);
            if (topCursos != null && !topCursos.isEmpty() && topCursos.get(0) != null) {
                Object[] row = topCursos.get(0);
                if (row.length > 0 && row[0] != null) {
                    cursoTop = row[0].toString() + " (" + row[1] + " recomendaciones)";
                }
            }

            return new EstadisticasDTO(
                    total,
                    respondidas,
                    sinResultados,
                    errores,
                    promedio,
                    cursoTop
            );
        }

        long total = consultaRepository.count();
        long respondidas = consultaRepository.countByEstado("Respondida");
        long sinResultados = consultaRepository.countByEstado("Sin resultados");
        long errores = consultaRepository.countByEstado("Error");

        Double promedio = calificacionRepository.obtenerPromedioPuntuacion();
        if (promedio != null) {
            promedio = Math.round(promedio * 100.0) / 100.0;
        }

        String cursoTop = "Ninguno aún";
        List<Object[]> topCursos = cursoRepository.findCursoMasRecomendado();
        if (topCursos != null && !topCursos.isEmpty() && topCursos.get(0) != null) {
            Object[] row = topCursos.get(0);
            if (row.length > 0 && row[0] != null) {
                cursoTop = row[0].toString() + " (" + row[1] + " recomendaciones)";
            }
        }

        return new EstadisticasDTO(
                total,
                respondidas,
                sinResultados,
                errores,
                promedio,
                cursoTop
        );
    }

    @Transactional(readOnly = true)
    public EstadisticasAdminDTO obtenerEstadisticasAdminGlobales() {
        // 1. Métricas básicas globales de consultas y satisfacción
        EstadisticasDTO baseStats = obtenerEstadisticas(null);

        // 2. Total de usuarios (Estudiantes registrados + 1 Administrador)
        long totalEstudiantes = estudianteRepository.count();
        long totalUsuarios = totalEstudiantes + 1; // Cuenta admin incluida

        // 3. Bitácora de auditoría completa
        List<AuditoriaDTO> bitacora = auditoriaService.obtenerTodos();

        // 4. Usuarios activos (Usuarios únicos registrados en auditoría o con consultas)
        long usuariosActivos = bitacora.stream()
                .map(AuditoriaDTO::getUsuarioEmail)
                .filter(Objects::nonNull)
                .distinct()
                .count();
        if (usuariosActivos == 0) {
            usuariosActivos = totalUsuarios;
        }

        // 5. Acciones por usuario (Agrupación de consultas y eventos de auditoría por email/estudiante)
        List<AccionUsuarioDTO> accionesPorUsuario = calcularAccionesPorUsuario();

        // 6. Acciones por día (Agrupación de actividad diaria)
        List<AccionDiaDTO> accionesPorDia = calcularAccionesPorDia(bitacora);

        return new EstadisticasAdminDTO(
                totalUsuarios,
                usuariosActivos,
                baseStats.getTotalConsultas(),
                baseStats.getConsultasRespondidas(),
                baseStats.getConsultasSinResultados(),
                baseStats.getConsultasError(),
                baseStats.getPromedioCalificaciones(),
                baseStats.getCursoMasRecomendado(),
                accionesPorUsuario,
                accionesPorDia,
                bitacora
        );
    }

    private List<AccionUsuarioDTO> calcularAccionesPorUsuario() {
        Map<String, AccionUsuarioDTO> mapAcciones = new LinkedHashMap<>();

        // Agregar primero al Administrador
        mapAcciones.put("admin@universidad.edu.co", new AccionUsuarioDTO(
                0L,
                "Administrador Académico",
                "admin@universidad.edu.co",
                "ADMINISTRADOR",
                0L,
                null
        ));

        // Agregar todos los estudiantes registrados
        List<Estudiante> estudiantes = estudianteRepository.findAll();
        for (Estudiante est : estudiantes) {
            long totalConsultas = consultaRepository.countByEstudianteId(est.getId());
            mapAcciones.put(est.getCorreoElectronico().toLowerCase(), new AccionUsuarioDTO(
                    est.getId(),
                    est.getNombreCompleto(),
                    est.getCorreoElectronico(),
                    "ESTUDIANTE",
                    totalConsultas,
                    est.getFechaCreacion()
            ));
        }

        // Enriquecer con conteo de eventos de auditoría (ingresos y registros)
        List<Object[]> auditCounts = auditoriaRepository.countAccionesPorUsuarioAuditoria();
        for (Object[] row : auditCounts) {
            if (row != null && row.length >= 2 && row[0] != null) {
                String email = row[0].toString().toLowerCase();
                long count = ((Number) row[1]).longValue();
                if (mapAcciones.containsKey(email)) {
                    AccionUsuarioDTO dto = mapAcciones.get(email);
                    dto.setTotalAcciones(dto.getTotalAcciones() + count);
                } else {
                    mapAcciones.put(email, new AccionUsuarioDTO(
                            null,
                            email,
                            email,
                            email.contains("admin") ? "ADMINISTRADOR" : "ESTUDIANTE",
                            count,
                            null
                    ));
                }
            }
        }

        return new ArrayList<>(mapAcciones.values());
    }

    private List<AccionDiaDTO> calcularAccionesPorDia(List<AuditoriaDTO> bitacora) {
        Map<String, Long> mapDias = new TreeMap<>();

        if (bitacora != null) {
            for (AuditoriaDTO dto : bitacora) {
                if (dto.getFecha() != null) {
                    String dia = dto.getFecha().toLocalDate().toString();
                    mapDias.put(dia, mapDias.getOrDefault(dia, 0L) + 1);
                }
            }
        }

        if (mapDias.isEmpty()) {
            mapDias.put(java.time.LocalDate.now().toString(), Math.max(1L, consultaRepository.count()));
        }

        List<AccionDiaDTO> lista = new ArrayList<>();
        for (Map.Entry<String, Long> entry : mapDias.entrySet()) {
            lista.add(new AccionDiaDTO(entry.getKey(), entry.getValue()));
        }
        return lista;
    }
}
