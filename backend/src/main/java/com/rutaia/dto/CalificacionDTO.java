package com.rutaia.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CalificacionDTO {

    @NotNull(message = "El ID de la recomendación es obligatorio")
    private Long recomendacionId;

    @NotNull(message = "La puntuación es obligatoria")
    @Min(value = 1, message = "La puntuación mínima es 1 estrella")
    @Max(value = 5, message = "La puntuación máxima es 5 estrellas")
    private Integer puntuacion;

    private String comentario;

    public CalificacionDTO() {
    }

    public CalificacionDTO(Long recomendacionId, Integer puntuacion, String comentario) {
        this.recomendacionId = recomendacionId;
        this.puntuacion = puntuacion;
        this.comentario = comentario;
    }

    public Long getRecomendacionId() {
        return recomendacionId;
    }

    public void setRecomendacionId(Long recomendacionId) {
        this.recomendacionId = recomendacionId;
    }

    public Integer getPuntuacion() {
        return puntuacion;
    }

    public void setPuntuacion(Integer puntuacion) {
        this.puntuacion = puntuacion;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }
}
