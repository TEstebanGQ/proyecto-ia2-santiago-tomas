package com.rutaia.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class DocenteEstudianteDTO {

    private Long id;
    private String nombreCompleto;
    private String correoElectronico;
    private String nivelExperiencia;
    private String areaInteres;
    private LocalDateTime fechaCreacion;
    private List<String> cursosInscritos = new ArrayList<>();
    private Integer totalCursosInscritos = 0;

    public DocenteEstudianteDTO() {
    }

    public DocenteEstudianteDTO(Long id, String nombreCompleto, String correoElectronico,
                                String nivelExperiencia, String areaInteres, LocalDateTime fechaCreacion,
                                List<String> cursosInscritos) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.correoElectronico = correoElectronico;
        this.nivelExperiencia = nivelExperiencia;
        this.areaInteres = areaInteres;
        this.fechaCreacion = fechaCreacion;
        this.cursosInscritos = cursosInscritos != null ? cursosInscritos : new ArrayList<>();
        this.totalCursosInscritos = this.cursosInscritos.size();
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

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public List<String> getCursosInscritos() {
        return cursosInscritos;
    }

    public void setCursosInscritos(List<String> cursosInscritos) {
        this.cursosInscritos = cursosInscritos != null ? cursosInscritos : new ArrayList<>();
        this.totalCursosInscritos = this.cursosInscritos.size();
    }

    public Integer getTotalCursosInscritos() {
        return totalCursosInscritos;
    }

    public void setTotalCursosInscritos(Integer totalCursosInscritos) {
        this.totalCursosInscritos = totalCursosInscritos;
    }
}
