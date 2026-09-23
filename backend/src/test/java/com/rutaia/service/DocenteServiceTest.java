package com.rutaia.service;

import com.rutaia.dto.CursoDTO;
import com.rutaia.dto.CursoResponseDTO;
import com.rutaia.dto.DocenteEstadisticasDTO;
import com.rutaia.dto.DocenteFeedbackDTO;
import com.rutaia.entity.*;
import com.rutaia.exception.BusinessRuleException;
import com.rutaia.repository.CalificacionRepository;
import com.rutaia.repository.CursoRepository;
import com.rutaia.repository.DocenteRepository;
import com.rutaia.repository.FuenteRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocenteServiceTest {

    @Mock
    private DocenteRepository docenteRepository;

    @Mock
    private CursoRepository cursoRepository;

    @Mock
    private CursoService cursoService;

    @Mock
    private FuenteRepository fuenteRepository;

    @Mock
    private CalificacionRepository calificacionRepository;

    @InjectMocks
    private DocenteService docenteService;

    @Test
    @DisplayName("Frontera curricular: Docente no puede crear cursos fuera de su especialidad")
    void testDocenteNoPuedeCrearCursoOtraEspecialidad() {
        String email = "profesor.web@universidad.edu.co";
        Docente docente = new Docente("Profesor Web", email, "Programación", "Ingeniería");
        when(docenteRepository.findByCorreoElectronicoIgnoreCase(email)).thenReturn(Optional.of(docente));

        CursoDTO cursoIA = new CursoDTO("Redes Neuronales", "Deep Learning", "Inteligencia Artificial", "Avanzado", 40, true);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () -> {
            docenteService.crearCursoEspecialidad(email, cursoIA);
        });

        assertTrue(ex.getMessage().contains("Frontera curricular"));
        verify(cursoService, never()).crear(any());
    }

    @Test
    @DisplayName("Docente puede crear cursos dentro de su especialidad")
    void testDocentePuedeCrearCursoSuEspecialidad() {
        String email = "profesor.web@universidad.edu.co";
        Docente docente = new Docente("Profesor Web", email, "Programación", "Ingeniería");
        when(docenteRepository.findByCorreoElectronicoIgnoreCase(email)).thenReturn(Optional.of(docente));

        CursoDTO cursoWeb = new CursoDTO("React Avanzado", "Frontend reactivo", "Programación", "Intermedio", 45, true);
        CursoResponseDTO resEsperado = new CursoResponseDTO(10L, "React Avanzado", "Frontend reactivo", "Programación", "Intermedio", 45, null, true, LocalDateTime.now());
        when(cursoService.crear(cursoWeb)).thenReturn(resEsperado);

        CursoResponseDTO res = docenteService.crearCursoEspecialidad(email, cursoWeb);

        assertNotNull(res);
        assertEquals("React Avanzado", res.getNombre());
        verify(cursoService, times(1)).crear(cursoWeb);
    }

    @Test
    @DisplayName("Estadísticas del docente deben corresponder exclusivamente a su área")
    void testEstadisticasDocentePorArea() {
        String email = "profesor.ia@universidad.edu.co";
        Docente docente = new Docente("Profesor IA", email, "Inteligencia Artificial", "Ingeniería");
        when(docenteRepository.findByCorreoElectronicoIgnoreCase(email)).thenReturn(Optional.of(docente));

        when(cursoRepository.countByCategoriaIgnoreCase("Inteligencia Artificial")).thenReturn(5L);
        when(cursoRepository.countByCategoriaIgnoreCaseAndActivoTrue("Inteligencia Artificial")).thenReturn(4L);
        when(fuenteRepository.countConsultasPorCategoria("Inteligencia Artificial")).thenReturn(12L);
        when(calificacionRepository.obtenerPromedioPuntuacionPorCategoria("Inteligencia Artificial")).thenReturn(4.75);
        when(calificacionRepository.countCalificacionesPorCategoria("Inteligencia Artificial")).thenReturn(8L);

        Object[] topRow = new Object[]{"Machine Learning Práctico", 6L};
        when(cursoRepository.findCursoMasRecomendadoPorCategoria("Inteligencia Artificial")).thenReturn(Collections.singletonList(topRow));

        DocenteEstadisticasDTO stats = docenteService.obtenerEstadisticas(email);

        assertNotNull(stats);
        assertEquals("Inteligencia Artificial", stats.getAreaEspecialidad());
        assertEquals(5, stats.getTotalCursosEspecialidad());
        assertEquals(4, stats.getCursosActivos());
        assertEquals(12, stats.getTotalConsultasRelacionadas());
        assertEquals(4.75, stats.getPromedioCalificacionCursos());
        assertEquals(8, stats.getTotalCalificacionesRecibidas());
        assertTrue(stats.getCursoMasDemandado().contains("Machine Learning Práctico"));
    }

    @Test
    @DisplayName("Feedback de estudiantes debe mapear correctamente fuentes, recomendaciones y calificaciones")
    void testFeedbackConsultasDocente() {
        String email = "profesor.web@universidad.edu.co";
        Docente docente = new Docente("Profesor Web", email, "Programación", "Ingeniería");
        when(docenteRepository.findByCorreoElectronicoIgnoreCase(email)).thenReturn(Optional.of(docente));

        Estudiante est = new Estudiante("Tomás Restrepo", "tomas@universidad.edu.co", "Intermedio", "Programación");
        Consulta consulta = new Consulta(est, "¿Cómo aprender APIs REST?", "Respondida");
        Recomendacion rec = new Recomendacion(consulta, "Te sugerimos Spring Boot", "Respondida");
        Calificacion cal = new Calificacion(rec, 5, "Excelente recomendación!");
        rec.setCalificacion(cal);

        Curso curso = new Curso("Spring Boot 3", "APIs REST seguras", "Programación", "Intermedio", 60, true);
        Fuente fuente = new Fuente(rec, curso, BigDecimal.valueOf(0.8500));

        when(fuenteRepository.findByCursoCategoriaOrderByFechaDesc("Programación")).thenReturn(List.of(fuente));

        List<DocenteFeedbackDTO> feedback = docenteService.obtenerFeedbackConsultas(email);

        assertNotNull(feedback);
        assertEquals(1, feedback.size());
        DocenteFeedbackDTO item = feedback.get(0);
        assertEquals("Tomás Restrepo", item.getEstudianteNombre());
        assertEquals("¿Cómo aprender APIs REST?", item.getPregunta());
        assertEquals("Spring Boot 3", item.getCursoNombre());
        assertEquals(5, item.getPuntuacion());
        assertEquals("Excelente recomendación!", item.getComentario());
        assertEquals(0.85, item.getSimilitud(), 0.001);
    }
}
