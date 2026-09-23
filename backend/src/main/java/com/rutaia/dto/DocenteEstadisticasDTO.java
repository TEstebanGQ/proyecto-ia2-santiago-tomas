package com.rutaia.dto;

public class DocenteEstadisticasDTO {

    private String areaEspecialidad;
    private long totalCursosEspecialidad;
    private long cursosActivos;
    private long totalConsultasRelacionadas;
    private Double promedioCalificacionCursos;
    private String cursoMasDemandado;
    private long totalCalificacionesRecibidas;

    public DocenteEstadisticasDTO() {
    }

    public DocenteEstadisticasDTO(String areaEspecialidad, long totalCursosEspecialidad, long cursosActivos,
                                  long totalConsultasRelacionadas, Double promedioCalificacionCursos,
                                  String cursoMasDemandado, long totalCalificacionesRecibidas) {
        this.areaEspecialidad = areaEspecialidad;
        this.totalCursosEspecialidad = totalCursosEspecialidad;
        this.cursosActivos = cursosActivos;
        this.totalConsultasRelacionadas = totalConsultasRelacionadas;
        this.promedioCalificacionCursos = promedioCalificacionCursos;
        this.cursoMasDemandado = cursoMasDemandado;
        this.totalCalificacionesRecibidas = totalCalificacionesRecibidas;
    }

    public String getAreaEspecialidad() {
        return areaEspecialidad;
    }

    public void setAreaEspecialidad(String areaEspecialidad) {
        this.areaEspecialidad = areaEspecialidad;
    }

    public long getTotalCursosEspecialidad() {
        return totalCursosEspecialidad;
    }

    public void setTotalCursosEspecialidad(long totalCursosEspecialidad) {
        this.totalCursosEspecialidad = totalCursosEspecialidad;
    }

    public long getCursosActivos() {
        return cursosActivos;
    }

    public void setCursosActivos(long cursosActivos) {
        this.cursosActivos = cursosActivos;
    }

    public long getTotalConsultasRelacionadas() {
        return totalConsultasRelacionadas;
    }

    public void setTotalConsultasRelacionadas(long totalConsultasRelacionadas) {
        this.totalConsultasRelacionadas = totalConsultasRelacionadas;
    }

    public Double getPromedioCalificacionCursos() {
        return promedioCalificacionCursos;
    }

    public void setPromedioCalificacionCursos(Double promedioCalificacionCursos) {
        this.promedioCalificacionCursos = promedioCalificacionCursos;
    }

    public String getCursoMasDemandado() {
        return cursoMasDemandado;
    }

    public void setCursoMasDemandado(String cursoMasDemandado) {
        this.cursoMasDemandado = cursoMasDemandado;
    }

    public long getTotalCalificacionesRecibidas() {
        return totalCalificacionesRecibidas;
    }

    public void setTotalCalificacionesRecibidas(long totalCalificacionesRecibidas) {
        this.totalCalificacionesRecibidas = totalCalificacionesRecibidas;
    }
}
