package com.rutaia.repository;
import com.rutaia.entity.Conversacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface ConversacionRepository extends JpaRepository<Conversacion, Long> { }
