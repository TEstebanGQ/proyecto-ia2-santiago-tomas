package com.rutaia.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inscripciones", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"estudiante_id", "curso_id"})
})
public class Inscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(name = "fecha_inscripcion", nullable = false, updatable = false)
    private LocalDateTime fechaInscripcion;

    @Column(nullable = false, length = 30)
    private String estado = "Inscrito";

    public Inscripcion() {
    }

    public Inscripcion(Estudiante estudiante, Curso curso) {
        this(estudiante, curso, "Inscrito", LocalDateTime.now());
    }

    public Inscripcion(Estudiante estudiante, Curso curso, String estado) {
        this(estudiante, curso, estado, LocalDateTime.now());
    }

    public Inscripcion(Estudiante estudiante, Curso curso, String estado, LocalDateTime fechaInscripcion) {
        this.estudiante = estudiante;
        this.curso = curso;
        this.estado = estado != null ? estado : "Inscrito";
        this.fechaInscripcion = fechaInscripcion != null ? fechaInscripcion : LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.fechaInscripcion == null) {
            this.fechaInscripcion = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "Inscrito";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Estudiante getEstudiante() {
        return estudiante;
    }

    public void setEstudiante(Estudiante estudiante) {
        this.estudiante = estudiante;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
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
