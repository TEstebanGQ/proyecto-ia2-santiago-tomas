package com.rutaia.repository;

import com.rutaia.entity.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
    List<Consulta> findByEstudianteIdOrderByFechaDesc(Long estudianteId);
    long countByEstado(String estado);
    long countByEstudianteId(Long estudianteId);
    long countByEstudianteIdAndEstado(Long estudianteId, String estado);
}
