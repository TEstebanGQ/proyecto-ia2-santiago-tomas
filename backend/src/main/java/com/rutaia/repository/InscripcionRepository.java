package com.rutaia.repository;

import com.rutaia.entity.Estudiante;
import com.rutaia.entity.Inscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT DISTINCT i.estudiante FROM Inscripcion i WHERE LOWER(i.curso.categoria) = LOWER(:categoria) ORDER BY i.estudiante.nombreCompleto ASC")
    List<Estudiante> findEstudiantesByCursoCategoria(@Param("categoria") String categoria);

    @Query("SELECT DISTINCT i.estudiante FROM Inscripcion i WHERE LOWER(i.curso.categoria) = LOWER(:categoria) AND (LOWER(i.estudiante.nombreCompleto) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(i.estudiante.correoElectronico) LIKE LOWER(CONCAT('%', :query, '%'))) ORDER BY i.estudiante.nombreCompleto ASC")
    List<Estudiante> buscarEstudiantesPorCursoCategoria(@Param("categoria") String categoria, @Param("query") String query);

    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END FROM Inscripcion i WHERE i.estudiante.id = :estudianteId AND LOWER(i.curso.categoria) = LOWER(:categoria)")
    boolean existsByEstudianteIdAndCursoCategoria(@Param("estudianteId") Long estudianteId, @Param("categoria") String categoria);

    @Query("SELECT i FROM Inscripcion i WHERE i.estudiante.id = :estudianteId AND LOWER(i.curso.categoria) = LOWER(:categoria) ORDER BY i.fechaInscripcion DESC")
    List<Inscripcion> findByEstudianteIdAndCursoCategoria(@Param("estudianteId") Long estudianteId, @Param("categoria") String categoria);
}
