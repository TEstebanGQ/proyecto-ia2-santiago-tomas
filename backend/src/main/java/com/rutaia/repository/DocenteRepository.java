package com.rutaia.repository;

import com.rutaia.entity.Docente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocenteRepository extends JpaRepository<Docente, Long> {
    Optional<Docente> findByCorreoElectronico(String correoElectronico);
    Optional<Docente> findByCorreoElectronicoIgnoreCase(String correoElectronico);
    boolean existsByCorreoElectronico(String correoElectronico);
}
