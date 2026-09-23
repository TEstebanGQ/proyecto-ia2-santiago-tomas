package com.rutaia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ConsultaRecomendacionDTO {

    @NotNull(message = "El identificador del estudiante es obligatorio")
    private Long estudianteId;

    @NotBlank(message = "La pregunta no puede estar vacía")
    private String pregunta;

    private java.util.List<String> cursosPrevios;

    private String contextoPrevio;

    public ConsultaRecomendacionDTO() {
    }

    public ConsultaRecomendacionDTO(Long estudianteId, String pregunta) {
        this.estudianteId = estudianteId;
        this.pregunta = pregunta;
    }

    public ConsultaRecomendacionDTO(Long estudianteId, String pregunta, java.util.List<String> cursosPrevios, String contextoPrevio) {
        this.estudianteId = estudianteId;
        this.pregunta = pregunta;
        this.cursosPrevios = cursosPrevios;
        this.contextoPrevio = contextoPrevio;
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

    public java.util.List<String> getCursosPrevios() {
        return cursosPrevios;
    }

    public void setCursosPrevios(java.util.List<String> cursosPrevios) {
        this.cursosPrevios = cursosPrevios;
    }

    public String getContextoPrevio() {
        return contextoPrevio;
    }

    public void setContextoPrevio(String contextoPrevio) {
        this.contextoPrevio = contextoPrevio;
    }
}
