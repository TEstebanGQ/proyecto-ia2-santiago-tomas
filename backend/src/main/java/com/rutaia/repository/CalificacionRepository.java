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
}
