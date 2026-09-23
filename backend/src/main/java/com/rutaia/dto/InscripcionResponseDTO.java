package com.rutaia.dto;

import java.time.LocalDateTime;

public class InscripcionResponseDTO {

    private Long id;
    private Long estudianteId;
    private String estudianteNombre;
    private String estudianteCorreo;
    private String estudianteNivel;
    private String estudianteAreaInteres;
    private Long cursoId;
    private String cursoNombre;
    private LocalDateTime fechaInscripcion;
    private String estado;

    public InscripcionResponseDTO() {
    }

    public InscripcionResponseDTO(Long id, Long estudianteId, String estudianteNombre, String estudianteCorreo,
                                  String estudianteNivel, String estudianteAreaInteres, Long cursoId,
                                  String cursoNombre, LocalDateTime fechaInscripcion, String estado) {
        this.id = id;
        this.estudianteId = estudianteId;
        this.estudianteNombre = estudianteNombre;
        this.estudianteCorreo = estudianteCorreo;
        this.estudianteNivel = estudianteNivel;
        this.estudianteAreaInteres = estudianteAreaInteres;
        this.cursoId = cursoId;
        this.cursoNombre = cursoNombre;
        this.fechaInscripcion = fechaInscripcion;
        this.estado = estado;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEstudianteId() {
        return estudianteId;
    }

    public void setEstudianteId(Long estudianteId) {
        this.estudianteId = estudianteId;
    }

    public String getEstudianteNombre() {
        return estudianteNombre;
    }

    public void setEstudianteNombre(String estudianteNombre) {
        this.estudianteNombre = estudianteNombre;
    }

    public String getEstudianteCorreo() {
        return estudianteCorreo;
    }

    public void setEstudianteCorreo(String estudianteCorreo) {
        this.estudianteCorreo = estudianteCorreo;
    }

    public String getEstudianteNivel() {
        return estudianteNivel;
    }

    public void setEstudianteNivel(String estudianteNivel) {
        this.estudianteNivel = estudianteNivel;
    }

    public String getEstudianteAreaInteres() {
        return estudianteAreaInteres;
    }

    public void setEstudianteAreaInteres(String estudianteAreaInteres) {
        this.estudianteAreaInteres = estudianteAreaInteres;
    }

    public Long getCursoId() {
        return cursoId;
    }

    public void setCursoId(Long cursoId) {
        this.cursoId = cursoId;
    }

    public String getCursoNombre() {
        return cursoNombre;
    }

    public void setCursoNombre(String cursoNombre) {
        this.cursoNombre = cursoNombre;
    }

    public LocalDateTime getFechaInscripcion() {
        return fechaInscripcion;
    }

    public void setFechaInscripcion(LocalDateTime fechaInscripcion) {
        this.fechaInscripcion = fechaInscripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
