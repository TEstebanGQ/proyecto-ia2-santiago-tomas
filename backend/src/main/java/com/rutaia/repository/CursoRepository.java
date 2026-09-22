package com.rutaia.repository;

import com.rutaia.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {

    List<Curso> findByActivoTrue();

    List<Curso> findByActivoTrueAndCategoriaIgnoreCase(String categoria);

    List<Curso> findByActivoTrueAndNivelIgnoreCase(String nivel);

    List<Curso> findByActivoTrueAndCategoriaIgnoreCaseAndNivelIgnoreCase(String categoria, String nivel);

    @Query(value = "SELECT c.nombre, COUNT(f.id) as total_recomendaciones FROM fuentes f JOIN cursos c ON f.curso_id = c.id GROUP BY c.id, c.nombre ORDER BY total_recomendaciones DESC LIMIT 1", nativeQuery = true)
    List<Object[]> findCursoMasRecomendado();

    @Query(value = "SELECT c.nombre, COUNT(f.id) as total_recomendaciones " +
                   "FROM fuentes f " +
                   "JOIN recomendaciones r ON f.recomendacion_id = r.id " +
                   "JOIN consultas con ON r.consulta_id = con.id " +
                   "JOIN cursos c ON f.curso_id = c.id " +
                   "WHERE con.estudiante_id = :estudianteId " +
                   "GROUP BY c.id, c.nombre " +
                   "ORDER BY total_recomendaciones DESC LIMIT 1", nativeQuery = true)
    List<Object[]> findCursoMasRecomendadoPorEstudiante(@org.springframework.data.repository.query.Param("estudianteId") Long estudianteId);
}
