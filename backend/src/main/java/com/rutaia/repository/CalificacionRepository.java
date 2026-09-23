package com.rutaia.repository;

import com.rutaia.entity.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {
    Optional<Calificacion> findByRecomendacionId(Long recomendacionId);
    boolean existsByRecomendacionId(Long recomendacionId);

    @Query("SELECT AVG(c.puntuacion) FROM Calificacion c")
    Double obtenerPromedioPuntuacion();

    @Query("SELECT AVG(c.puntuacion) FROM Calificacion c JOIN c.recomendacion r JOIN r.consulta con WHERE con.estudiante.id = :estudianteId")
    Double obtenerPromedioPuntuacionPorEstudiante(@org.springframework.data.repository.query.Param("estudianteId") Long estudianteId);

    @Query("SELECT AVG(c.puntuacion) FROM Calificacion c JOIN c.recomendacion r JOIN r.fuentes f JOIN f.curso cur WHERE LOWER(cur.categoria) = LOWER(:categoria)")
    Double obtenerPromedioPuntuacionPorCategoria(@org.springframework.data.repository.query.Param("categoria") String categoria);

    @Query("SELECT COUNT(DISTINCT c.id) FROM Calificacion c JOIN c.recomendacion r JOIN r.fuentes f JOIN f.curso cur WHERE LOWER(cur.categoria) = LOWER(:categoria)")
    long countCalificacionesPorCategoria(@org.springframework.data.repository.query.Param("categoria") String categoria);
}
