package com.rutaia.dto;

public class AuthRequestDTO {

    private String email;
    private String password;
    private String rol;
    private String nombre;
    private String proveedor;

    public AuthRequestDTO() {
    }

    public AuthRequestDTO(String email, String password, String rol, String nombre, String proveedor) {
        this.email = email;
        this.password = password;
        this.rol = rol;
        this.nombre = nombre;
        this.proveedor = proveedor;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getProveedor() {
        return proveedor;
    }

    public void setProveedor(String proveedor) {
        this.proveedor = proveedor;
    }
}
