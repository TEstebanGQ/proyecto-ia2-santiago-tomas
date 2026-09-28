package com.rutaia.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public class ComparacionEmbeddingsResponseDTO {

    @Schema(description = "Texto de la pregunta A", example = "Quiero aprender a crear páginas web")
    private String preguntaA;

    @Schema(description = "Texto de la pregunta B", example = "Me interesa desarrollar sitios con HTML y CSS")
    private String preguntaB;

    @Schema(description = "Similitud del coseno calculada directamente sobre los vectores sin intermediación de LLM", example = "0.87")
    private Double similitud;

    public ComparacionEmbeddingsResponseDTO() {
    }

    public ComparacionEmbeddingsResponseDTO(String preguntaA, String preguntaB, Double similitud) {
        this.preguntaA = preguntaA;
        this.preguntaB = preguntaB;
        this.similitud = similitud;
    }

    public String getPreguntaA() {
        return preguntaA;
    }

    public void setPreguntaA(String preguntaA) {
        this.preguntaA = preguntaA;
    }

    public String getPreguntaB() {
        return preguntaB;
    }

    public void setPreguntaB(String preguntaB) {
        this.preguntaB = preguntaB;
    }

    public Double getSimilitud() {
        return similitud;
    }

    public void setSimilitud(Double similitud) {
        this.similitud = similitud;
    }
}
