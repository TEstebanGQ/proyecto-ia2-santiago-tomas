package com.rutaia.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recomendaciones")
public class Recomendacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consulta_id", nullable = false, unique = true)
    private Consulta consulta;

    @Column(name = "respuesta_texto", nullable = false, columnDefinition = "TEXT")
    private String respuestaTexto;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(nullable = false, length = 30)
    private String estado;

    @OneToMany(mappedBy = "recomendacion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Fuente> fuentes = new ArrayList<>();

    @OneToOne(mappedBy = "recomendacion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Calificacion calificacion;

    public Recomendacion() {
    }

    public Recomendacion(Consulta consulta, String respuestaTexto, String estado) {
        this.consulta = consulta;
        this.respuestaTexto = respuestaTexto;
        this.estado = estado;
    }

    @PrePersist
    protected void onCreate() {
        if (this.fecha == null) {
            this.fecha = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "Respondida";
        }
    }

    public void addFuente(Fuente fuente) {
        fuentes.add(fuente);
        fuente.setRecomendacion(this);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Consulta getConsulta() {
        return consulta;
    }

    public void setConsulta(Consulta consulta) {
        this.consulta = consulta;
    }

    public String getRespuestaTexto() {
        return respuestaTexto;
    }

    public void setRespuestaTexto(String respuestaTexto) {
        this.respuestaTexto = respuestaTexto;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public List<Fuente> getFuentes() {
        return fuentes;
    }

    public void setFuentes(List<Fuente> fuentes) {
        this.fuentes = fuentes;
    }

    public Calificacion getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(Calificacion calificacion) {
        this.calificacion = calificacion;
    }
}
