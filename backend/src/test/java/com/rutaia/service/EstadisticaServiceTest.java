package com.rutaia.service;

import com.rutaia.dto.EstadisticasDTO;
import com.rutaia.repository.CalificacionRepository;
import com.rutaia.repository.ConsultaRepository;
import com.rutaia.repository.CursoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EstadisticaServiceTest {

    @Mock
    private ConsultaRepository consultaRepository;

    @Mock
    private CalificacionRepository calificacionRepository;

    @Mock
    private CursoRepository cursoRepository;

    @InjectMocks
    private EstadisticaService estadisticaService;

    @Test
    @DisplayName("Nuevo estudiante sin consultas debe retornar métricas en 0")
    void testEstudianteNuevoEstadisticasEnCero() {
        Long nuevoEstudianteId = 99L;

        when(consultaRepository.countByEstudianteId(nuevoEstudianteId)).thenReturn(0L);
        when(consultaRepository.countByEstudianteIdAndEstado(nuevoEstudianteId, "Respondida")).thenReturn(0L);
        when(consultaRepository.countByEstudianteIdAndEstado(nuevoEstudianteId, "Sin resultados")).thenReturn(0L);
        when(consultaRepository.countByEstudianteIdAndEstado(nuevoEstudianteId, "Error")).thenReturn(0L);
        when(calificacionRepository.obtenerPromedioPuntuacionPorEstudiante(nuevoEstudianteId)).thenReturn(null);
        when(cursoRepository.findCursoMasRecomendadoPorEstudiante(nuevoEstudianteId)).thenReturn(Collections.emptyList());

        EstadisticasDTO dto = estadisticaService.obtenerEstadisticas(nuevoEstudianteId);

        assertNotNull(dto);
        assertEquals(0, dto.getTotalConsultas());
        assertEquals(0, dto.getConsultasRespondidas());
        assertEquals(0, dto.getConsultasSinResultados());
        assertEquals(0, dto.getConsultasError());
        assertNull(dto.getPromedioCalificaciones());
        assertEquals("Ninguno aún", dto.getCursoMasRecomendado());
    }

    @Test
    @DisplayName("Estudiante con consultas debe retornar solo sus estadísticas individuales")
    void testEstudianteConConsultas() {
        Long estudianteId = 5L;

        when(consultaRepository.countByEstudianteId(estudianteId)).thenReturn(3L);
        when(consultaRepository.countByEstudianteIdAndEstado(estudianteId, "Respondida")).thenReturn(2L);
        when(consultaRepository.countByEstudianteIdAndEstado(estudianteId, "Sin resultados")).thenReturn(1L);
        when(consultaRepository.countByEstudianteIdAndEstado(estudianteId, "Error")).thenReturn(0L);
        when(calificacionRepository.obtenerPromedioPuntuacionPorEstudiante(estudianteId)).thenReturn(4.5);
        
        Object[] row = new Object[]{"Desarrollo Backend con Spring Boot", 2L};
        when(cursoRepository.findCursoMasRecomendadoPorEstudiante(estudianteId)).thenReturn(List.<Object[]>of(row));

        EstadisticasDTO dto = estadisticaService.obtenerEstadisticas(estudianteId);

        assertNotNull(dto);
        assertEquals(3, dto.getTotalConsultas());
        assertEquals(2, dto.getConsultasRespondidas());
        assertEquals(1, dto.getConsultasSinResultados());
        assertEquals(0, dto.getConsultasError());
        assertEquals(4.5, dto.getPromedioCalificaciones());
        assertTrue(dto.getCursoMasRecomendado().contains("Desarrollo Backend con Spring Boot"));
    }

    @Test
    @DisplayName("Sin estudianteId debe calcular estadísticas globales")
    void testEstadisticasGlobales() {
        when(consultaRepository.count()).thenReturn(50L);
        when(consultaRepository.countByEstado("Respondida")).thenReturn(40L);
        when(consultaRepository.countByEstado("Sin resultados")).thenReturn(8L);
        when(consultaRepository.countByEstado("Error")).thenReturn(2L);
        when(calificacionRepository.obtenerPromedioPuntuacion()).thenReturn(4.8);
        when(cursoRepository.findCursoMasRecomendado()).thenReturn(Collections.emptyList());

        EstadisticasDTO dto = estadisticaService.obtenerEstadisticas(null);

        assertNotNull(dto);
        assertEquals(50, dto.getTotalConsultas());
        assertEquals(40, dto.getConsultasRespondidas());
        assertEquals(8, dto.getConsultasSinResultados());
        assertEquals(2, dto.getConsultasError());
        assertEquals(4.8, dto.getPromedioCalificaciones());
    }
}
