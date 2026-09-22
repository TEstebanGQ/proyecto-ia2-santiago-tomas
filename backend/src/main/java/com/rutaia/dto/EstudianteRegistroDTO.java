package com.rutaia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class EstudianteRegistroDTO {

    @NotBlank(message = "El nombre completo es obligatorio")
    private String nombreCompleto;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El formato del correo electrónico no es válido")
    private String correoElectronico;

    @NotBlank(message = "El nivel de experiencia es obligatorio")
    @Pattern(regexp = "^(Principiante|Intermedio|Avanzado)$", message = "El nivel de experiencia debe ser Principiante, Intermedio o Avanzado")
    private String nivelExperiencia;

    @NotBlank(message = "El área de interés es obligatoria")
    private String areaInteres;

    private String password;

    public EstudianteRegistroDTO() {
    }

    public EstudianteRegistroDTO(String nombreCompleto, String correoElectronico, String nivelExperiencia, String areaInteres) {
        this.nombreCompleto = nombreCompleto;
        this.correoElectronico = correoElectronico;
        this.nivelExperiencia = nivelExperiencia;
        this.areaInteres = areaInteres;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
