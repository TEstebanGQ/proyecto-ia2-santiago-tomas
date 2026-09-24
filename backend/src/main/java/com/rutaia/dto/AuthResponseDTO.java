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
    private Boolean requiereCompletarPerfil = false;
    private String mensaje;
    private String departamentoFacultad;

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
        this.requiereCompletarPerfil = false;
    }

    public AuthResponseDTO(Long id, String nombre, String email, String rol, String nivelExperiencia, String areaInteres, String token, String proveedor, Boolean requiereCompletarPerfil, String mensaje, String departamentoFacultad) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
        this.nivelExperiencia = nivelExperiencia;
        this.areaInteres = areaInteres;
        this.token = token;
        this.proveedor = proveedor;
        this.requiereCompletarPerfil = requiereCompletarPerfil;
        this.mensaje = mensaje;
        this.departamentoFacultad = departamentoFacultad;
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

    public Boolean getRequiereCompletarPerfil() {
        return requiereCompletarPerfil;
    }

    public void setRequiereCompletarPerfil(Boolean requiereCompletarPerfil) {
        this.requiereCompletarPerfil = requiereCompletarPerfil;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getDepartamentoFacultad() {
        return departamentoFacultad;
    }

    public void setDepartamentoFacultad(String departamentoFacultad) {
        this.departamentoFacultad = departamentoFacultad;
    }
}
