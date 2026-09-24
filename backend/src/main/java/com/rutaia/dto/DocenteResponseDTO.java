package com.rutaia.dto;

import java.time.LocalDateTime;

public class DocenteResponseDTO {

    private Long id;
    private String nombreCompleto;
    private String correoElectronico;
    private String areaEspecialidad;
    private String departamentoFacultad;
    private LocalDateTime fechaCreacion;
    private Boolean activo;

    public DocenteResponseDTO() {
    }

    public DocenteResponseDTO(Long id, String nombreCompleto, String correoElectronico, String areaEspecialidad, String departamentoFacultad, LocalDateTime fechaCreacion, Boolean activo) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.correoElectronico = correoElectronico;
        this.areaEspecialidad = areaEspecialidad;
        this.departamentoFacultad = departamentoFacultad;
        this.fechaCreacion = fechaCreacion;
        this.activo = activo;
    }

    // Backward compatibility constructor (defaults activo to true)
    public DocenteResponseDTO(Long id, String nombreCompleto, String correoElectronico, String areaEspecialidad, String departamentoFacultad, LocalDateTime fechaCreacion) {
        this(id, nombreCompleto, correoElectronico, areaEspecialidad, departamentoFacultad, fechaCreacion, true);
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

    public String getAreaEspecialidad() {
        return areaEspecialidad;
    }

    public void setAreaEspecialidad(String areaEspecialidad) {
        this.areaEspecialidad = areaEspecialidad;
    }

    public String getDepartamentoFacultad() {
        return departamentoFacultad;
    }

    public void setDepartamentoFacultad(String departamentoFacultad) {
        this.departamentoFacultad = departamentoFacultad;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
