package com.rutaia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ConsultaRecomendacionDTO {

    @NotNull(message = "El identificador del estudiante es obligatorio")
    private Long estudianteId;

    @NotBlank(message = "La pregunta no puede estar vacía")
    private String pregunta;

    public ConsultaRecomendacionDTO() {
    }

    public ConsultaRecomendacionDTO(Long estudianteId, String pregunta) {
        this.estudianteId = estudianteId;
        this.pregunta = pregunta;
    }

    public Long getEstudianteId() {
        return estudianteId;
    }

    public void setEstudianteId(Long estudianteId) {
        this.estudianteId = estudianteId;
    }

    public String getPregunta() {
        return pregunta;
    }

    public void setPregunta(String pregunta) {
        this.pregunta = pregunta;
    }
}
