package com.rutaia.dto;

public class EstadisticasDTO {

    private long totalConsultas;
    private long consultasRespondidas;
    private long consultasSinResultados;
    private long consultasError;
    private Double promedioCalificaciones;
    private String cursoMasRecomendado;

    public EstadisticasDTO() {
    }

    public EstadisticasDTO(long totalConsultas, long consultasRespondidas, long consultasSinResultados, long consultasError, Double promedioCalificaciones, String cursoMasRecomendado) {
        this.totalConsultas = totalConsultas;
        this.consultasRespondidas = consultasRespondidas;
        this.consultasSinResultados = consultasSinResultados;
        this.consultasError = consultasError;
        this.promedioCalificaciones = promedioCalificaciones;
        this.cursoMasRecomendado = cursoMasRecomendado;
    }

    public long getTotalConsultas() {
        return totalConsultas;
    }

    public void setTotalConsultas(long totalConsultas) {
        this.totalConsultas = totalConsultas;
    }

    public long getConsultasRespondidas() {
        return consultasRespondidas;
    }

    public void setConsultasRespondidas(long consultasRespondidas) {
        this.consultasRespondidas = consultasRespondidas;
    }

    public long getConsultasSinResultados() {
        return consultasSinResultados;
    }

    public void setConsultasSinResultados(long consultasSinResultados) {
        this.consultasSinResultados = consultasSinResultados;
    }

    public long getConsultasError() {
        return consultasError;
    }

    public void setConsultasError(long consultasError) {
        this.consultasError = consultasError;
    }

    public Double getPromedioCalificaciones() {
        return promedioCalificaciones;
    }

    public void setPromedioCalificaciones(Double promedioCalificaciones) {
        this.promedioCalificaciones = promedioCalificaciones;
    }

    public String getCursoMasRecomendado() {
        return cursoMasRecomendado;
    }

    public void setCursoMasRecomendado(String cursoMasRecomendado) {
        this.cursoMasRecomendado = cursoMasRecomendado;
    }
}
