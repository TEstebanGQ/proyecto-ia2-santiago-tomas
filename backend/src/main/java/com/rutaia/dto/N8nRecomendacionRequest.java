package com.rutaia.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class N8nRecomendacionRequest {

    @JsonProperty("id_consulta")
    private Long idConsulta;

    private String pregunta;

    @JsonProperty("nivel_experiencia")
    private String nivelExperiencia;

    @JsonProperty("area_interes")
    private String areaInteres;

    @JsonProperty("cursos_previos")
    private java.util.List<String> cursosPrevios;

    @JsonProperty("contexto_previo")
    private String contextoPrevio;

    public N8nRecomendacionRequest() {
    }

    public N8nRecomendacionRequest(Long idConsulta, String pregunta, String nivelExperiencia, String areaInteres) {
        this.idConsulta = idConsulta;
        this.pregunta = pregunta;
        this.nivelExperiencia = nivelExperiencia;
        this.areaInteres = areaInteres;
    }

    public N8nRecomendacionRequest(Long idConsulta, String pregunta, String nivelExperiencia, String areaInteres, java.util.List<String> cursosPrevios, String contextoPrevio) {
        this.idConsulta = idConsulta;
        this.pregunta = pregunta;
        this.nivelExperiencia = nivelExperiencia;
        this.areaInteres = areaInteres;
        this.cursosPrevios = cursosPrevios;
        this.contextoPrevio = contextoPrevio;
    }

    public Long getIdConsulta() {
        return idConsulta;
    }

    public void setIdConsulta(Long idConsulta) {
        this.idConsulta = idConsulta;
    }

    public String getPregunta() {
        return pregunta;
    }

    public void setPregunta(String pregunta) {
        this.pregunta = pregunta;
    }

    public String getNivelExperiencia() {
        return nivelExperiencia;
    }

    public void setNivelExperiencia(String nivelExperiencia) {
        this.nivelExperiencia = nivelExperiencia;
    }

    public String getAreaInteres() {
        return areaInteres;
    }

    public void setAreaInteres(String areaInteres) {
        this.areaInteres = areaInteres;
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
