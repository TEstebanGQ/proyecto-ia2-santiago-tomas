package com.rutaia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UsuarioRolUpdateDTO {

    @NotBlank(message = "El nuevo rol es obligatorio")
    @Pattern(regexp = "^(ADMINISTRADOR|DOCENTE|ESTUDIANTE)$", message = "El rol debe ser ADMINISTRADOR, DOCENTE o ESTUDIANTE")
    private String nuevoRol;

    @Size(max = 50, message = "El nivel de experiencia no puede superar 50 caracteres")
    private String nivelExperiencia;

    @Size(max = 100, message = "El área de interés no puede superar 100 caracteres")
    private String areaInteres;

    @Size(max = 100, message = "El departamento o facultad no puede superar 100 caracteres")
    private String departamentoFacultad;

    public UsuarioRolUpdateDTO() {
    }

    public UsuarioRolUpdateDTO(String nuevoRol, String nivelExperiencia, String areaInteres, String departamentoFacultad) {
        this.nuevoRol = nuevoRol;
        this.nivelExperiencia = nivelExperiencia;
        this.areaInteres = areaInteres;
        this.departamentoFacultad = departamentoFacultad;
    }

    public String getNuevoRol() {
        return nuevoRol;
    }

    public void setNuevoRol(String nuevoRol) {
        this.nuevoRol = nuevoRol;
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
}
