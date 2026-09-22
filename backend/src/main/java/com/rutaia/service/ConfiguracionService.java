package com.rutaia.service;

import com.rutaia.dto.UmbralConfigDTO;
import com.rutaia.entity.Configuracion;
import com.rutaia.repository.ConfiguracionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class ConfiguracionService {

    private static final String CLAVE_UMBRAL = "RAG_UMBRAL_PORCENTAJE";
    private static final double UMBRAL_DEFECTO_PORCENTAJE = 40.0;

    private final ConfiguracionRepository configuracionRepository;

    public ConfiguracionService(ConfiguracionRepository configuracionRepository) {
        this.configuracionRepository = configuracionRepository;
    }

    @Transactional(readOnly = true)
    public UmbralConfigDTO obtenerUmbral() {
        double pct = configuracionRepository.findByClave(CLAVE_UMBRAL)
                .map(c -> {
                    try {
                        return Double.parseDouble(c.getValor());
                    } catch (Exception e) {
                        return UMBRAL_DEFECTO_PORCENTAJE;
                    }
                })
                .orElse(UMBRAL_DEFECTO_PORCENTAJE);

        return construirDTO(pct);
    }

    @Transactional
    public UmbralConfigDTO guardarUmbral(Double nuevoPorcentaje) {
        if (nuevoPorcentaje == null || nuevoPorcentaje < 0.0 || nuevoPorcentaje > 100.0) {
            throw new IllegalArgumentException("El porcentaje del umbral debe estar entre 0% y 100%.");
        }

        Configuracion config = configuracionRepository.findByClave(CLAVE_UMBRAL)
                .orElseGet(() -> new Configuracion(CLAVE_UMBRAL, String.valueOf(UMBRAL_DEFECTO_PORCENTAJE)));

        config.setValor(String.valueOf(nuevoPorcentaje));
        configuracionRepository.save(config);

        return construirDTO(nuevoPorcentaje);
    }

    private UmbralConfigDTO construirDTO(double pct) {
        BigDecimal decimal = BigDecimal.valueOf(pct / 100.0).setScale(4, RoundingMode.HALF_UP);
        String etiqueta;
        if (pct < 35.0) {
            etiqueta = "Alta Cobertura / Sensibilidad Flexiva";
        } else if (pct <= 65.0) {
            etiqueta = "Equilibrado (Recomendado)";
        } else {
            etiqueta = "Exigente / Similitud Estricta";
        }

        return new UmbralConfigDTO(pct, decimal, etiqueta);
    }
}
