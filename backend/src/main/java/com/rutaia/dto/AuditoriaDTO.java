package com.rutaia.dto;

import java.time.LocalDateTime;

public class AuditoriaDTO {
    private Long id;
    private String tipoEvento;
    private String usuarioEmail;
    private String usuarioNombre;
    private String rol;
    private String detalle;
    private LocalDateTime fecha;

    public AuditoriaDTO() {
    }

    public AuditoriaDTO(Long id, String tipoEvento, String usuarioEmail, String usuarioNombre, String rol, String detalle, LocalDateTime fecha) {
        this.id = id;
        this.tipoEvento = tipoEvento;
        this.usuarioEmail = usuarioEmail;
        this.usuarioNombre = usuarioNombre;
        this.rol = rol;
        this.detalle = detalle;
        this.fecha = fecha;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTipoEvento() {
        return tipoEvento;
    }

    public void setTipoEvento(String tipoEvento) {
        this.tipoEvento = tipoEvento;
    }

    public String getUsuarioEmail() {
        return usuarioEmail;
    }

    public void setUsuarioEmail(String usuarioEmail) {
        this.usuarioEmail = usuarioEmail;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public String getDetalle() {
        return detalle;
    }

    public void setDetalle(String detalle) {
        this.detalle = detalle;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
