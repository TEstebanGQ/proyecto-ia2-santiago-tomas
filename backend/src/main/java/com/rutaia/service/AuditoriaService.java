package com.rutaia.service;

import com.rutaia.dto.AuditoriaDTO;
import com.rutaia.entity.BitacoraAuditoria;
import com.rutaia.repository.AuditoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;

    public AuditoriaService(AuditoriaRepository auditoriaRepository) {
        this.auditoriaRepository = auditoriaRepository;
    }

    @Transactional
    public BitacoraAuditoria registrarEvento(String tipoEvento, String usuarioEmail, String usuarioNombre, String rol, String detalle) {
        BitacoraAuditoria bitacora = new BitacoraAuditoria(
                tipoEvento != null ? tipoEvento.toUpperCase() : "INGRESO",
                usuarioEmail != null ? usuarioEmail.trim().toLowerCase() : "desconocido@universidad.edu.co",
                usuarioNombre != null ? usuarioNombre.trim() : "Usuario",
                rol != null ? rol.toUpperCase() : "ESTUDIANTE",
                detalle
        );
        return auditoriaRepository.save(bitacora);
    }

    @Transactional(readOnly = true)
    public List<AuditoriaDTO> obtenerTodos() {
        return auditoriaRepository.findAllByOrderByFechaDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private AuditoriaDTO mapToDTO(BitacoraAuditoria b) {
        return new AuditoriaDTO(
                b.getId(),
                b.getTipoEvento(),
                b.getUsuarioEmail(),
                b.getUsuarioNombre(),
                b.getRol(),
                b.getDetalle(),
                b.getFecha()
        );
    }
}
