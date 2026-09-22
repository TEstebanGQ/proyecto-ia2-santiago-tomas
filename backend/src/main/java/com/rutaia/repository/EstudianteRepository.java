package com.rutaia.repository;

import com.rutaia.entity.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {
    Optional<Estudiante> findByCorreoElectronico(String correoElectronico);
    Optional<Estudiante> findByCorreoElectronicoIgnoreCase(String correoElectronico);
    boolean existsByCorreoElectronico(String correoElectronico);
}
