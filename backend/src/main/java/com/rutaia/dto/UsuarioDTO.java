package com.rutaia.dto;

import java.time.LocalDateTime;

public class UsuarioDTO {

    private Long id;
    private String nombreCompleto;
    private String correoElectronico;
    private String rol;
    private String nivelExperiencia;
    private String areaInteres;
    private String departamentoFacultad;
    private Boolean activo;
    private LocalDateTime fechaCreacion;

    public UsuarioDTO() {
    }

    public UsuarioDTO(
            Long id,
            String nombreCompleto,
            String correoElectronico,
            String rol,
            String nivelExperiencia,
            String areaInteres,
            String departamentoFacultad,
            Boolean activo,
            LocalDateTime fechaCreacion
    ) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.correoElectronico = correoElectronico;
        this.rol = rol;
        this.nivelExperiencia = nivelExperiencia;
        this.areaInteres = areaInteres;
        this.departamentoFacultad = departamentoFacultad;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getCorreoElectronico() {
        return correoElectronico;
    }

    public void setCorreoElectronico(String correoElectronico) {
        this.correoElectronico = correoElectronico;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
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

    public String getDepartamentoFacultad() {
        return departamentoFacultad;
    }

    public void setDepartamentoFacultad(String departamentoFacultad) {
        this.departamentoFacultad = departamentoFacultad;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
