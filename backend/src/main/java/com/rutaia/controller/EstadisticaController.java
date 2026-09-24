package com.rutaia.controller;

import com.rutaia.dto.EstadisticasAdminDTO;
import com.rutaia.dto.EstadisticasDTO;
import com.rutaia.repository.EstudianteRepository;
import com.rutaia.service.EstadisticaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/estadisticas")
@Tag(name = "Estadísticas", description = "Métricas y resumen global o personal del sistema")
public class EstadisticaController {

    private final EstadisticaService estadisticaService;
    private final EstudianteRepository estudianteRepository;

    public EstadisticaController(EstadisticaService estadisticaService, EstudianteRepository estudianteRepository) {
        this.estadisticaService = estadisticaService;
        this.estudianteRepository = estudianteRepository;
    }

    @GetMapping
    @Operation(summary = "Consultar estadísticas del sistema o específicas de un estudiante (RF 18)")
    public ResponseEntity<EstadisticasDTO> obtenerEstadisticas(
            @RequestParam(required = false) Long estudianteId,
            Authentication authentication
    ) {
        if (estudianteId == null && authentication != null && authentication.isAuthenticated()) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR") || a.getAuthority().equals("ROLE_SUPERADMIN"));
            if (!isAdmin) {
                String email = authentication.getName();
                if (email != null && !email.isBlank()) {
                    var estOpt = estudianteRepository.findByCorreoElectronicoIgnoreCase(email);
                    if (estOpt.isPresent()) {
                        estudianteId = estOpt.get().getId();
                    }
                }
            }
        }
        return ResponseEntity.ok(estadisticaService.obtenerEstadisticas(estudianteId));
    }

    @GetMapping("/admin")
    @Operation(summary = "Consultar estadísticas globales administrativas y bitácora de auditoría de todo el sistema")
    public ResponseEntity<EstadisticasAdminDTO> obtenerEstadisticasAdmin() {
        return ResponseEntity.ok(estadisticaService.obtenerEstadisticasAdminGlobales());
    }
}
