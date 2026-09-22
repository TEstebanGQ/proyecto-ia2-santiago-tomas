package com.rutaia.controller;

import com.rutaia.dto.ConsultaRecomendacionDTO;
import com.rutaia.dto.RecomendacionResponseDTO;
import com.rutaia.service.ConsultaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/consultas")
@Tag(name = "Consultas y Recomendaciones", description = "Recomendación de cursos mediante búsqueda semántica y RAG")
public class ConsultaController {

    private final ConsultaService consultaService;

    public ConsultaController(ConsultaService consultaService) {
        this.consultaService = consultaService;
    }

    @PostMapping("/recomendar")
    @Operation(summary = "Realizar consulta en lenguaje natural y generar recomendación RAG (RF 06 - RF 15)")
    public ResponseEntity<RecomendacionResponseDTO> procesarConsulta(@Valid @RequestBody ConsultaRecomendacionDTO dto) {
        RecomendacionResponseDTO respuesta = consultaService.procesarConsulta(dto);
        return ResponseEntity.ok(respuesta);
    }
}
