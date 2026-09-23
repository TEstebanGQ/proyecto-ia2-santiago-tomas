package com.rutaia.dto;

public class AccionDiaDTO {
    private String fecha; // YYYY-MM-DD
    private long totalAcciones;

    public AccionDiaDTO() {
    }

    public AccionDiaDTO(String fecha, long totalAcciones) {
        this.fecha = fecha;
        this.totalAcciones = totalAcciones;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public long getTotalAcciones() {
        return totalAcciones;
    }

    public void setTotalAcciones(long totalAcciones) {
        this.totalAcciones = totalAcciones;
    }
}
