package com.rutaia.dto;

public class AuthResponseDTO {

    private Long id;
    private String nombre;
    private String email;
    private String rol;
    private String nivelExperiencia;
    private String areaInteres;
    private String token;
    private String proveedor;

    public AuthResponseDTO() {
    }

    public AuthResponseDTO(Long id, String nombre, String email, String rol, String nivelExperiencia, String areaInteres, String token, String proveedor) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
        this.nivelExperiencia = nivelExperiencia;
        this.areaInteres = areaInteres;
        this.token = token;
        this.proveedor = proveedor;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getProveedor() {
        return proveedor;
    }

    public void setProveedor(String proveedor) {
        this.proveedor = proveedor;
    }
}
