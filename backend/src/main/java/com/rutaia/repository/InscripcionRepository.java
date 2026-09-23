package com.rutaia.repository;

import com.rutaia.entity.Inscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {
    List<Inscripcion> findByCursoIdOrderByFechaInscripcionDesc(Long cursoId);
    List<Inscripcion> findByEstudianteIdOrderByFechaInscripcionDesc(Long estudianteId);
    Optional<Inscripcion> findByEstudianteIdAndCursoId(Long estudianteId, Long cursoId);
    boolean existsByEstudianteIdAndCursoId(Long estudianteId, Long cursoId);
    long countByCursoId(Long cursoId);
}
