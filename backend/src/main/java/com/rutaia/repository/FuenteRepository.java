package com.rutaia.repository;

import com.rutaia.entity.Fuente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FuenteRepository extends JpaRepository<Fuente, Long> {
    List<Fuente> findByRecomendacionId(Long recomendacionId);
}
