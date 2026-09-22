package com.rutaia.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RecomendacionResponseDTO {

    private Long idConsulta;
    private Long idRecomendacion;
    private String pregunta;
    private String respuesta;
    private List<FuenteResponseDTO> fuentes = new ArrayList<>();
    private List<BigDecimal> similitudes = new ArrayList<>();
    private String estadoFinal;
    private LocalDateTime fecha;
    private Integer calificacionPuntuacion;
    private String calificacionComentario;

    public RecomendacionResponseDTO() {
    }

    public Long getIdConsulta() {
        return idConsulta;
    }

    public void setIdConsulta(Long idConsulta) {
        this.idConsulta = idConsulta;
    }

    public Long getIdRecomendacion() {
        return idRecomendacion;
    }

    public void setIdRecomendacion(Long idRecomendacion) {
        this.idRecomendacion = idRecomendacion;
    }

    public String getPregunta() {
        return pregunta;
    }

    public void setPregunta(String pregunta) {
        this.pregunta = pregunta;
    }

    public String getRespuesta() {
        return respuesta;
    }

    public void setRespuesta(String respuesta) {
        this.respuesta = respuesta;
    }

    public List<FuenteResponseDTO> getFuentes() {
        return fuentes;
    }

    public void setFuentes(List<FuenteResponseDTO> fuentes) {
        this.fuentes = fuentes;
    }

    public List<BigDecimal> getSimilitudes() {
        return similitudes;
    }

    public void setSimilitudes(List<BigDecimal> similitudes) {
        this.similitudes = similitudes;
    }

    public String getEstadoFinal() {
        return estadoFinal;
    }

    public void setEstadoFinal(String estadoFinal) {
        this.estadoFinal = estadoFinal;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public Integer getCalificacionPuntuacion() {
        return calificacionPuntuacion;
    }

    public void setCalificacionPuntuacion(Integer calificacionPuntuacion) {
        this.calificacionPuntuacion = calificacionPuntuacion;
    }

    public String getCalificacionComentario() {
        return calificacionComentario;
    }

    public void setCalificacionComentario(String calificacionComentario) {
        this.calificacionComentario = calificacionComentario;
    }
}
