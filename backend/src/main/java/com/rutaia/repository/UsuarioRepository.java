package com.rutaia.repository;

import com.rutaia.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreoElectronicoIgnoreCase(String correoElectronico);

    boolean existsByCorreoElectronicoIgnoreCase(String correoElectronico);

    List<Usuario> findAllByOrderByFechaCreacionDesc();

    List<Usuario> findByRolIgnoreCase(String rol);
}
