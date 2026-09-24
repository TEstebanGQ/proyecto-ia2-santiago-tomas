package com.rutaia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UsuarioPasswordDTO {

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 6, message = "La nueva contraseña debe contener al menos 6 caracteres")
    private String nuevaPassword;

    public UsuarioPasswordDTO() {
    }

    public UsuarioPasswordDTO(String nuevaPassword) {
        this.nuevaPassword = nuevaPassword;
    }

    public String getNuevaPassword() {
        return nuevaPassword;
    }

    public void setNuevaPassword(String nuevaPassword) {
        this.nuevaPassword = nuevaPassword;
    }
}
