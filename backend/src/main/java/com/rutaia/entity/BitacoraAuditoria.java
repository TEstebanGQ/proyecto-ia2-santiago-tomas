package com.rutaia.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria")
public class BitacoraAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_evento", nullable = false, length = 50)
    private String tipoEvento; // 'INGRESO', 'REGISTRO'

    @Column(name = "usuario_email", nullable = false, length = 150)
    private String usuarioEmail;

    @Column(name = "usuario_nombre", length = 150)
    private String usuarioNombre;

    @Column(name = "rol", nullable = false, length = 50)
    private String rol; // 'ESTUDIANTE', 'ADMINISTRADOR'

    @Column(name = "detalle", columnDefinition = "TEXT")
    private String detalle;

    @Column(name = "fecha", nullable = false, updatable = false)
    private LocalDateTime fecha;

    public BitacoraAuditoria() {
        this.fecha = LocalDateTime.now();
    }

    public BitacoraAuditoria(String tipoEvento, String usuarioEmail, String usuarioNombre, String rol, String detalle) {
        this.tipoEvento = tipoEvento;
        this.usuarioEmail = usuarioEmail;
        this.usuarioNombre = usuarioNombre;
        this.rol = rol;
        this.detalle = detalle;
        this.fecha = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.fecha == null) {
            this.fecha = LocalDateTime.now();
        }
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
