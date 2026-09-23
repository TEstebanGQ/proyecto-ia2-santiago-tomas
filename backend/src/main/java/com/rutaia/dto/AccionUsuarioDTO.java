package com.rutaia.dto;

import java.time.LocalDateTime;

public class AccionUsuarioDTO {
    private Long usuarioId;
    private String nombre;
    private String email;
    private String rol;
    private long totalAcciones;
    private LocalDateTime ultimaActividad;

    public AccionUsuarioDTO() {
    }

    public AccionUsuarioDTO(Long usuarioId, String nombre, String email, String rol, long totalAcciones, LocalDateTime ultimaActividad) {
        this.usuarioId = usuarioId;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
        this.totalAcciones = totalAcciones;
        this.ultimaActividad = ultimaActividad;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public long getTotalAcciones() {
        return totalAcciones;
    }

    public void setTotalAcciones(long totalAcciones) {
        this.totalAcciones = totalAcciones;
    }

    public LocalDateTime getUltimaActividad() {
        return ultimaActividad;
    }

    public void setUltimaActividad(LocalDateTime ultimaActividad) {
        this.ultimaActividad = ultimaActividad;
    }
}
