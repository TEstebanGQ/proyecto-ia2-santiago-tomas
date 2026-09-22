package com.rutaia.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class N8nRecomendacionResponse {

    @JsonProperty("id_consulta")
    private Long idConsulta;

    private String pregunta;
    private String respuesta;

    private List<N8nFuenteDTO> fuentes = new ArrayList<>();
    private List<BigDecimal> similitudes = new ArrayList<>();

    @JsonProperty("estado_final")
    private String estadoFinal;

    public N8nRecomendacionResponse() {
    }

    public static class N8nFuenteDTO {
        private Long id;
        private String nombre;
        private String descripcion;
        private String categoria;
        private String nivel;

        @JsonProperty("duracion_horas")
        private Integer duracionHoras;

        private BigDecimal similitud;

        public N8nFuenteDTO() {
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public String getDescripcion() {
            return descripcion;
        }

        public void setDescripcion(String descripcion) {
            this.descripcion = descripcion;
        }

        public String getCategoria() {
            return categoria;
        }

        public void setCategoria(String categoria) {
            this.categoria = categoria;
        }

        public String getNivel() {
            return nivel;
        }

        public void setNivel(String nivel) {
            this.nivel = nivel;
        }

        public Integer getDuracionHoras() {
            return duracionHoras;
        }

        public void setDuracionHoras(Integer duracionHoras) {
            this.duracionHoras = duracionHoras;
        }

        public BigDecimal getSimilitud() {
            return similitud;
        }

        public void setSimilitud(BigDecimal similitud) {
            this.similitud = similitud;
        }
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

    public String getRespuesta() {
        return respuesta;
    }

    public void setRespuesta(String respuesta) {
        this.respuesta = respuesta;
    }

    public List<N8nFuenteDTO> getFuentes() {
        return fuentes;
    }

    public void setFuentes(List<N8nFuenteDTO> fuentes) {
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
}
