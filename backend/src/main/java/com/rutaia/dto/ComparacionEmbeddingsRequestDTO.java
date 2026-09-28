package com.rutaia.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public class ComparacionEmbeddingsRequestDTO {

    @NotBlank(message = "La pregunta A es obligatoria")
    @Schema(description = "Primera pregunta o texto para comparar", example = "Quiero aprender a crear páginas web")
    private String preguntaA;

    @NotBlank(message = "La pregunta B es obligatoria")
    @Schema(description = "Segunda pregunta o texto para comparar", example = "Me interesa desarrollar sitios con HTML y CSS")
    private String preguntaB;

    public ComparacionEmbeddingsRequestDTO() {
    }

    public ComparacionEmbeddingsRequestDTO(String preguntaA, String preguntaB) {
        this.preguntaA = preguntaA;
        this.preguntaB = preguntaB;
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
}
