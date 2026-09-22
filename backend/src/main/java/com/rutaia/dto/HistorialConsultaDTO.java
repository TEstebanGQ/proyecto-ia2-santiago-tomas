package com.rutaia.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class HistorialConsultaDTO {

    private Long idConsulta;
    private Long idRecomendacion;
    private String pregunta;
    private LocalDateTime fecha;
    private String estado;
    private String respuesta;
    private List<FuenteResponseDTO> fuentes = new ArrayList<>();
    private Integer puntuacion;
    private String comentario;

    public HistorialConsultaDTO() {
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

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
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
