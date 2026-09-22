package com.rutaia.service;

import com.rutaia.dto.EstudianteResponseDTO;
import com.rutaia.entity.Estudiante;
import com.rutaia.repository.ConsultaRepository;
import com.rutaia.repository.EstudianteRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EstudianteServiceTest {

    @Mock
    private EstudianteRepository estudianteRepository;

    @Mock
    private ConsultaRepository consultaRepository;

    @InjectMocks
    private EstudianteService estudianteService;

    @Test
    @DisplayName("Buscar estudiantes por coincidencia de nombre o correo")
    void testBuscarPorNombreCoincidencias() {
        String query = "Santiago";
        Estudiante e1 = new Estudiante("Santiago Gómez", "santiago@universidad.edu.co", "Principiante", "IA");
        e1.setId(1L);

        when(estudianteRepository.findByNombreCompletoContainingIgnoreCaseOrCorreoElectronicoContainingIgnoreCase(query, query))
                .thenReturn(List.of(e1));

        List<EstudianteResponseDTO> resultados = estudianteService.buscarPorNombre(query);

        assertNotNull(resultados);
        assertEquals(1, resultados.size());
        assertEquals("Santiago Gómez", resultados.get(0).getNombreCompleto());
        assertEquals("santiago@universidad.edu.co", resultados.get(0).getCorreoElectronico());
        verify(estudianteRepository, times(1))
                .findByNombreCompletoContainingIgnoreCaseOrCorreoElectronicoContainingIgnoreCase(query, query);
    }
}
