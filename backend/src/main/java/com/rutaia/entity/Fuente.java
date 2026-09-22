package com.rutaia.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "fuentes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"recomendacion_id", "curso_id"})
})
public class Fuente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recomendacion_id", nullable = false)
    private Recomendacion recomendacion;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(name = "similitud_score", nullable = false, precision = 5, scale = 4)
    private BigDecimal similitudScore;

    public Fuente() {
    }

    public Fuente(Recomendacion recomendacion, Curso curso, BigDecimal similitudScore) {
        this.recomendacion = recomendacion;
        this.curso = curso;
        this.similitudScore = similitudScore;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Recomendacion getRecomendacion() {
        return recomendacion;
    }

    public void setRecomendacion(Recomendacion recomendacion) {
        this.recomendacion = recomendacion;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
    }

    public BigDecimal getSimilitudScore() {
        return similitudScore;
    }

    public void setSimilitudScore(BigDecimal similitudScore) {
        this.similitudScore = similitudScore;
    }
}
