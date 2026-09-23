package com.rutaia.dto;

import java.time.LocalDateTime;

public class CursoResponseDTO {

    private Long id;
    private String nombre;
    private String descripcion;
    private String categoria;
    private String nivel;
    private Integer duracionHoras;
    private String prerrequisitos;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private Double promedioCalificaciones;
    private Long totalCalificaciones;

    public CursoResponseDTO() {
    }

    public CursoResponseDTO(Long id, String nombre, String descripcion, String categoria, String nivel, Integer duracionHoras, Boolean activo, LocalDateTime fechaCreacion) {
        this(id, nombre, descripcion, categoria, nivel, duracionHoras, null, activo, fechaCreacion);
    }

    public CursoResponseDTO(Long id, String nombre, String descripcion, String categoria, String nivel, Integer duracionHoras, String prerrequisitos, Boolean activo, LocalDateTime fechaCreacion) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.nivel = nivel;
        this.duracionHoras = duracionHoras;
        this.prerrequisitos = prerrequisitos;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
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

    public String getPrerrequisitos() {
        return prerrequisitos;
    }

    public void setPrerrequisitos(String prerrequisitos) {
        this.prerrequisitos = prerrequisitos;
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

    private Integer totalInscritos = 0;

    public Integer getTotalInscritos() {
        return totalInscritos != null ? totalInscritos : 0;
    }

    public void setTotalInscritos(Integer totalInscritos) {
        this.totalInscritos = totalInscritos;
    }

    public Double getPromedioCalificaciones() {
        return promedioCalificaciones;
    }

    public void setPromedioCalificaciones(Double promedioCalificaciones) {
        this.promedioCalificaciones = promedioCalificaciones;
    }

    public Long getTotalCalificaciones() {
        return totalCalificaciones;
    }

    public void setTotalCalificaciones(Long totalCalificaciones) {
        this.totalCalificaciones = totalCalificaciones;
    }
    }
}
