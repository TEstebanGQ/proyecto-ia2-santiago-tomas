package com.rutaia.repository;

import com.rutaia.entity.Fuente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FuenteRepository extends JpaRepository<Fuente, Long> {
    List<Fuente> findByRecomendacionId(Long recomendacionId);

    @org.springframework.data.jpa.repository.Query("SELECT f FROM Fuente f " +
           "JOIN FETCH f.recomendacion r " +
           "JOIN FETCH r.consulta c " +
           "JOIN FETCH c.estudiante e " +
           "JOIN FETCH f.curso cur " +
           "LEFT JOIN FETCH r.calificacion cal " +
           "WHERE LOWER(cur.categoria) = LOWER(:categoria) " +
           "ORDER BY c.fecha DESC")
    List<Fuente> findByCursoCategoriaOrderByFechaDesc(@org.springframework.data.repository.query.Param("categoria") String categoria);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT c.id) FROM Fuente f " +
           "JOIN f.recomendacion r " +
           "JOIN r.consulta c " +
           "JOIN f.curso cur " +
           "WHERE LOWER(cur.categoria) = LOWER(:categoria)")
    long countConsultasPorCategoria(@org.springframework.data.repository.query.Param("categoria") String categoria);
}
