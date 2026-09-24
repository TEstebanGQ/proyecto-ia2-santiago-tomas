package com.rutaia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UsuarioRegistroDTO {

    @NotBlank(message = "El nombre completo es obligatorio")
    private String nombreCompleto;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El formato del correo electrónico no es válido")
    private String correoElectronico;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe contener al menos 6 caracteres")
    private String password;

    @NotBlank(message = "El rol es obligatorio")
    private String rol; // 'ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'

    private String nivelExperiencia;

    private String areaInteres;

    private String departamentoFacultad;

    public UsuarioRegistroDTO() {
    }

    public UsuarioRegistroDTO(
            String nombreCompleto,
            String correoElectronico,
            String password,
            String rol,
            String nivelExperiencia,
            String areaInteres,
            String departamentoFacultad
    ) {
        this.nombreCompleto = nombreCompleto;
        this.correoElectronico = correoElectronico;
        this.password = password;
        this.rol = rol;
        this.nivelExperiencia = nivelExperiencia;
        this.areaInteres = areaInteres;
        this.departamentoFacultad = departamentoFacultad;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
}
