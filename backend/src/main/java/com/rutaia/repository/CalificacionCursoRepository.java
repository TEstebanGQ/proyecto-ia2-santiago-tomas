package com.rutaia.repository;

import com.rutaia.entity.CalificacionCurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalificacionCursoRepository extends JpaRepository<CalificacionCurso, Long> {

    List<CalificacionCurso> findByCursoId(Long cursoId);

    @Query("SELECT AVG(c.puntuacion) FROM CalificacionCurso c WHERE c.curso.id = :cursoId")
    Double findPromedioPuntuacionByCursoId(@Param("cursoId") Long cursoId);

    @Query("SELECT COUNT(c) FROM CalificacionCurso c WHERE c.curso.id = :cursoId")
    Long countByCursoId(@Param("cursoId") Long cursoId);
}
