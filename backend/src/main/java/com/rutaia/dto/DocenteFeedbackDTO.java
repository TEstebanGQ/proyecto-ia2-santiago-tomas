package com.rutaia.dto;

import java.time.LocalDateTime;

public class DocenteFeedbackDTO {

    private Long idConsulta;
    private Long idRecomendacion;
    private String estudianteNombre;
    private String estudianteNivel;
    private String pregunta;
    private LocalDateTime fecha;
    private Long cursoId;
    private String cursoNombre;
    private String cursoCategoria;
    private Double similitud;
    private String respuesta;
    private Integer puntuacion;
    private String comentario;

    public DocenteFeedbackDTO() {
    }

    public DocenteFeedbackDTO(Long idConsulta, Long idRecomendacion, String estudianteNombre, String estudianteNivel,
                              String pregunta, LocalDateTime fecha, Long cursoId, String cursoNombre,
                              String cursoCategoria, Double similitud, String respuesta,
                              Integer puntuacion, String comentario) {
        this.idConsulta = idConsulta;
        this.idRecomendacion = idRecomendacion;
        this.estudianteNombre = estudianteNombre;
        this.estudianteNivel = estudianteNivel;
        this.pregunta = pregunta;
        this.fecha = fecha;
        this.cursoId = cursoId;
        this.cursoNombre = cursoNombre;
        this.cursoCategoria = cursoCategoria;
        this.similitud = similitud;
        this.respuesta = respuesta;
        this.puntuacion = puntuacion;
        this.comentario = comentario;
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

    public String getEstudianteNombre() {
        return estudianteNombre;
    }

    public void setEstudianteNombre(String estudianteNombre) {
        this.estudianteNombre = estudianteNombre;
    }

    public String getEstudianteNivel() {
        return estudianteNivel;
    }

    public void setEstudianteNivel(String estudianteNivel) {
        this.estudianteNivel = estudianteNivel;
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

    public Long getCursoId() {
        return cursoId;
    }

    public void setCursoId(Long cursoId) {
        this.cursoId = cursoId;
    }

    public String getCursoNombre() {
        return cursoNombre;
    }

    public void setCursoNombre(String cursoNombre) {
        this.cursoNombre = cursoNombre;
    }

    public String getCursoCategoria() {
        return cursoCategoria;
    }

    public void setCursoCategoria(String cursoCategoria) {
        this.cursoCategoria = cursoCategoria;
    }

    public Double getSimilitud() {
        return similitud;
    }

    public void setSimilitud(Double similitud) {
        this.similitud = similitud;
    }

    public String getRespuesta() {
        return respuesta;
    }

    public void setRespuesta(String respuesta) {
        this.respuesta = respuesta;
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
