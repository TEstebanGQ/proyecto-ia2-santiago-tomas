package com.rutaia.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class CursoDTO {

    @NotBlank(message = "El nombre del curso es obligatorio")
    private String nombre;

    @NotBlank(message = "La descripción del curso es obligatoria")
    private String descripcion;

    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;

    @NotBlank(message = "El nivel es obligatorio")
    @Pattern(regexp = "^(Principiante|Básico|Intermedio|Avanzado)$", message = "El nivel debe ser Principiante, Básico, Intermedio o Avanzado")
    private String nivel;

    @NotNull(message = "La duración en horas es obligatoria")
    @Min(value = 1, message = "La duración de un curso debe ser mayor que cero")
    private Integer duracionHoras;

    private String prerrequisitos;

    private Boolean activo = true;

    public CursoDTO() {
    }

    public CursoDTO(String nombre, String descripcion, String categoria, String nivel, Integer duracionHoras, Boolean activo) {
        this(nombre, descripcion, categoria, nivel, duracionHoras, null, activo);
    }

    public CursoDTO(String nombre, String descripcion, String categoria, String nivel, Integer duracionHoras, String prerrequisitos, Boolean activo) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.nivel = nivel;
        this.duracionHoras = duracionHoras;
        this.prerrequisitos = prerrequisitos;
        this.activo = activo != null ? activo : true;
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
}
