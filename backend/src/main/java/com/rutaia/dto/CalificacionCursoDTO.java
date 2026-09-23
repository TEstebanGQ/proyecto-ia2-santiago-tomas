package com.rutaia.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CalificacionCursoDTO {

    private Long cursoId;

    @NotNull(message = "La puntuación es obligatoria.")
    @Min(value = 1, message = "La calificación mínima es 1 estrella.")
    @Max(value = 5, message = "La calificación máxima es 5 estrellas.")
    private Integer puntuacion;

    private String comentario;

    private Long estudianteId;

    public CalificacionCursoDTO() {
    }

    public CalificacionCursoDTO(Long cursoId, Integer puntuacion, String comentario, Long estudianteId) {
        this.cursoId = cursoId;
        this.puntuacion = puntuacion;
        this.comentario = comentario;
        this.estudianteId = estudianteId;
    }

    public Long getCursoId() {
        return cursoId;
    }

    public void setCursoId(Long cursoId) {
        this.cursoId = cursoId;
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

    public Long getEstudianteId() {
        return estudianteId;
    }

    public void setEstudianteId(Long estudianteId) {
        this.estudianteId = estudianteId;
    }
}
