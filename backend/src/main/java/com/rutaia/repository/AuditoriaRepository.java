package com.rutaia.repository;

import com.rutaia.entity.BitacoraAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditoriaRepository extends JpaRepository<BitacoraAuditoria, Long> {

    List<BitacoraAuditoria> findAllByOrderByFechaDesc();

    @Query("SELECT COUNT(DISTINCT a.usuarioEmail) FROM BitacoraAuditoria a")
    long countUsuariosActivosConIngreso();

    @Query("SELECT a.usuarioEmail, COUNT(a.id) FROM BitacoraAuditoria a GROUP BY a.usuarioEmail")
    List<Object[]> countAccionesPorUsuarioAuditoria();

    @Query(value = "SELECT TO_CHAR(fecha, 'YYYY-MM-DD') AS dia, COUNT(*) AS total FROM auditoria GROUP BY dia ORDER BY dia ASC", nativeQuery = true)
    List<Object[]> countAccionesPorDia();
}
