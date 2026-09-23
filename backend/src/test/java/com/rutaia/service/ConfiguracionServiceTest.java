package com.rutaia.service;

import com.rutaia.dto.UmbralConfigDTO;
import com.rutaia.entity.Configuracion;
import com.rutaia.repository.ConfiguracionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConfiguracionServiceTest {

    @Mock
    private ConfiguracionRepository configuracionRepository;

    @InjectMocks
    private ConfiguracionService configuracionService;

    @Test
    @DisplayName("Obtener umbral por defecto cuando no existe en BD")
    void testObtenerUmbralDefecto() {
        when(configuracionRepository.findByClave("RAG_UMBRAL_PORCENTAJE")).thenReturn(Optional.empty());

        UmbralConfigDTO result = configuracionService.obtenerUmbral();

        assertNotNull(result);
        assertEquals(40.0, result.getPorcentaje());
        assertEquals(new BigDecimal("0.4000"), result.getValorDecimal());
        assertEquals("Equilibrado (Recomendado)", result.getEtiqueta());
    }

    @Test
    @DisplayName("Guardar nuevo porcentaje de umbral")
    void testGuardarUmbralValido() {
        when(configuracionRepository.findByClave("RAG_UMBRAL_PORCENTAJE")).thenReturn(Optional.empty());

        UmbralConfigDTO result = configuracionService.guardarUmbral(65.0);

        assertNotNull(result);
        assertEquals(65.0, result.getPorcentaje());
        assertEquals(new BigDecimal("0.6500"), result.getValorDecimal());
        verify(configuracionRepository, times(1)).save(any(Configuracion.class));
    }
}
