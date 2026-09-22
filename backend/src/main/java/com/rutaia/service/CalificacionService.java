package com.rutaia.service;

import com.rutaia.dto.CalificacionDTO;
import com.rutaia.entity.Calificacion;
import com.rutaia.entity.Recomendacion;
import com.rutaia.exception.BusinessRuleException;
import com.rutaia.exception.ConflictException;
import com.rutaia.exception.ResourceNotFoundException;
import com.rutaia.repository.CalificacionRepository;
import com.rutaia.repository.RecomendacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CalificacionService {

    private final CalificacionRepository calificacionRepository;
    private final RecomendacionRepository recomendacionRepository;

    public CalificacionService(CalificacionRepository calificacionRepository, RecomendacionRepository recomendacionRepository) {
        this.calificacionRepository = calificacionRepository;
        this.recomendacionRepository = recomendacionRepository;
    }

    @Transactional
    public CalificacionDTO calificarRecomendacion(CalificacionDTO dto) {
        // Validación de rango de estrellas 1 a 5 (RF 17, Reglas de negocio)
        if (dto.getPuntuacion() == null || dto.getPuntuacion() < 1 || dto.getPuntuacion() > 5) {
            throw new BusinessRuleException("La calificación debe ser un valor entero entre 1 y 5 estrellas.");
        }

        Recomendacion recomendacion = recomendacionRepository.findById(dto.getRecomendacionId())
                .orElseThrow(() -> new ResourceNotFoundException("Recomendación no encontrada con ID: " + dto.getRecomendacionId()));

        // Aceptar una sola calificación por recomendación (RF 17)
        if (calificacionRepository.existsByRecomendacionId(dto.getRecomendacionId())) {
            throw new ConflictException("Esta recomendación ya cuenta con una calificación registrada.");
        }

        Calificacion calificacion = new Calificacion(
                recomendacion,
                dto.getPuntuacion(),
                dto.getComentario() != null ? dto.getComentario().trim() : null
        );

        calificacionRepository.save(calificacion);
        return dto;
    }
}
