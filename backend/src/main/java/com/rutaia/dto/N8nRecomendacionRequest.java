package com.rutaia.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class N8nRecomendacionRequest {

    @JsonProperty("id_consulta")
    private Long idConsulta;

    private String pregunta;

    @JsonProperty("nivel_experiencia")
    private String nivelExperiencia;

    @JsonProperty("area_interes")
    private String areaInteres;

    @JsonProperty("cursos_previos")
    private List<String> cursosPrevios;

    @JsonProperty("contexto_previo")
    private String contextoPrevio;

    private Double umbral;

    public N8nRecomendacionRequest() {
    }

    public N8nRecomendacionRequest(
            Long idConsulta,
            String pregunta,
            String nivelExperiencia,
            String areaInteres
    ) {
        this.idConsulta = idConsulta;
        this.pregunta = pregunta;
        this.nivelExperiencia = nivelExperiencia;
        this.areaInteres = areaInteres;
    }

    public N8nRecomendacionRequest(
            Long idConsulta,
            String pregunta,
            String nivelExperiencia,
            String areaInteres,
            List<String> cursosPrevios,
            String contextoPrevio
    ) {
        this.idConsulta = idConsulta;
        this.pregunta = pregunta;
        this.nivelExperiencia = nivelExperiencia;
        this.areaInteres = areaInteres;
        this.cursosPrevios = cursosPrevios;
        this.contextoPrevio = contextoPrevio;
    }

    public N8nRecomendacionRequest(
            Long idConsulta,
            String pregunta,
            String nivelExperiencia,
            String areaInteres,
            Double umbral
    ) {
        this.idConsulta = idConsulta;
        this.pregunta = pregunta;
        this.nivelExperiencia = nivelExperiencia;
        this.areaInteres = areaInteres;
        this.umbral = umbral;
    }

    public N8nRecomendacionRequest(
            Long idConsulta,
            String pregunta,
            String nivelExperiencia,
            String areaInteres,
            List<String> cursosPrevios,
            String contextoPrevio,
            Double umbral
    ) {
        this.idConsulta = idConsulta;
        this.pregunta = pregunta;
        this.nivelExperiencia = nivelExperiencia;
        this.areaInteres = areaInteres;
        this.cursosPrevios = cursosPrevios;
        this.contextoPrevio = contextoPrevio;
        this.umbral = umbral;
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

    public List<String> getCursosPrevios() {
        return cursosPrevios;
    }

    public void setCursosPrevios(List<String> cursosPrevios) {
        this.cursosPrevios = cursosPrevios;
    }

    public String getContextoPrevio() {
        return contextoPrevio;
    }

    public void setContextoPrevio(String contextoPrevio) {
        this.contextoPrevio = contextoPrevio;
    }

    public Double getUmbral() {
        return umbral;
    }

    public void setUmbral(Double umbral) {
        this.umbral = umbral;
    }
}