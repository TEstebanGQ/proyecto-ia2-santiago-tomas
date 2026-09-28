package com.rutaia.controller;

import com.rutaia.dto.ComparacionEmbeddingsRequestDTO;
import com.rutaia.dto.ComparacionEmbeddingsResponseDTO;
import com.rutaia.dto.ConsultaRecomendacionDTO;
import com.rutaia.dto.RecomendacionResponseDTO;
import com.rutaia.service.ConsultaService;
import com.rutaia.service.EmbeddingComparisonService;
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
    private final EmbeddingComparisonService embeddingComparisonService;

    public ConsultaController(ConsultaService consultaService, EmbeddingComparisonService embeddingComparisonService) {
        this.consultaService = consultaService;
        this.embeddingComparisonService = embeddingComparisonService;
    }

    @PostMapping("/recomendar")
    @Operation(summary = "Realizar consulta en lenguaje natural y generar recomendación RAG (RF 06 - RF 15)")
    public ResponseEntity<RecomendacionResponseDTO> procesarConsulta(@Valid @RequestBody ConsultaRecomendacionDTO dto) {
        RecomendacionResponseDTO respuesta = consultaService.procesarConsulta(dto);
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/comparar-embeddings")
    @Operation(summary = "Comparar semánticamente dos preguntas mediante sus embeddings vectoriales sin usar un LLM")
    public ResponseEntity<ComparacionEmbeddingsResponseDTO> compararEmbeddings(@Valid @RequestBody ComparacionEmbeddingsRequestDTO dto) {
        ComparacionEmbeddingsResponseDTO respuesta = embeddingComparisonService.comparar(dto);
        return ResponseEntity.ok(respuesta);
    }
}
