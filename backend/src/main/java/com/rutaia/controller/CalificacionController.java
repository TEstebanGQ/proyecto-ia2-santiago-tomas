package com.rutaia.controller;

import com.rutaia.dto.CalificacionDTO;
import com.rutaia.service.CalificacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calificaciones")
@Tag(name = "Calificaciones", description = "Calificación de las recomendaciones generadas (1 a 5 estrellas)")
public class CalificacionController {

    private final CalificacionService calificacionService;

    public CalificacionController(CalificacionService calificacionService) {
        this.calificacionService = calificacionService;
    }

    @PostMapping
    @Operation(summary = "Calificar una recomendación generada (RF 17)")
    public ResponseEntity<CalificacionDTO> calificar(@Valid @RequestBody CalificacionDTO dto) {
        CalificacionDTO registrada = calificacionService.calificarRecomendacion(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(registrada);
    }
}
