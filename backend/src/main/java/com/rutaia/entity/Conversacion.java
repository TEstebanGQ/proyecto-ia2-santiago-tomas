package com.rutaia.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversaciones")
public class Conversacion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
    public Conversacion() { }
    public Conversacion(Estudiante estudiante) { this.estudiante = estudiante; }
    @PrePersist protected void onCreate() { LocalDateTime ahora = LocalDateTime.now(); if (fechaInicio == null) fechaInicio = ahora; if (fechaActualizacion == null) fechaActualizacion = ahora; }
    @PreUpdate protected void onUpdate() { fechaActualizacion = LocalDateTime.now(); }
    public Long getId() { return id; }
    public Estudiante getEstudiante() { return estudiante; }
}
