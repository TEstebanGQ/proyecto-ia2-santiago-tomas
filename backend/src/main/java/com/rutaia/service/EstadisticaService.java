package com.rutaia.service;

import com.rutaia.dto.EstadisticasDTO;
import com.rutaia.repository.CalificacionRepository;
import com.rutaia.repository.ConsultaRepository;
import com.rutaia.repository.CursoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EstadisticaService {

    private final ConsultaRepository consultaRepository;
    private final CalificacionRepository calificacionRepository;
    private final CursoRepository cursoRepository;

    public EstadisticaService(ConsultaRepository consultaRepository,
                              CalificacionRepository calificacionRepository,
                              CursoRepository cursoRepository) {
        this.consultaRepository = consultaRepository;
        this.calificacionRepository = calificacionRepository;
        this.cursoRepository = cursoRepository;
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
}
