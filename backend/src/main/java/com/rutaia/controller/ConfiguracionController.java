package com.rutaia.controller;

import com.rutaia.dto.UmbralConfigDTO;
import com.rutaia.service.ConfiguracionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuracion")
@Tag(name = "Configuración", description = "Endpoints para la gestión de parámetros de configuración RAG y del sistema")
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;

    public ConfiguracionController(ConfiguracionService configuracionService) {
        this.configuracionService = configuracionService;
    }

    @GetMapping("/umbral")
    @Operation(summary = "Obtener el porcentaje y valor decimal del umbral de similitud RAG")
    public ResponseEntity<UmbralConfigDTO> obtenerUmbral() {
        return ResponseEntity.ok(configuracionService.obtenerUmbral());
    }

    @PutMapping("/umbral")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    @Operation(summary = "Actualizar el porcentaje del umbral RAG (Exclusivo Administrador y Superadmin)")
    public ResponseEntity<UmbralConfigDTO> guardarUmbral(@RequestParam Double porcentaje) {
        return ResponseEntity.ok(configuracionService.guardarUmbral(porcentaje));
    }
}
