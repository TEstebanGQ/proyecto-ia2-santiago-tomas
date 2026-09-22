package com.rutaia.controller;

import com.rutaia.dto.CursoDTO;
import com.rutaia.dto.CursoResponseDTO;
import com.rutaia.service.CursoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cursos")
@Tag(name = "Cursos", description = "Catálogo y administración de cursos institucionales")
public class CursoController {

    private final CursoService cursoService;

    public CursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    @GetMapping
    @Operation(summary = "Catálogo de cursos activos con filtros opcionales (RF 04)")
    public ResponseEntity<List<CursoResponseDTO>> listarCursosActivos(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String nivel) {
        return ResponseEntity.ok(cursoService.listarCursosActivos(categoria, nivel));
    }

    @GetMapping("/admin")
    @Operation(summary = "Listar todos los cursos incluyendo inactivos (Panel Administrativo RF 03)")
    public ResponseEntity<List<CursoResponseDTO>> listarTodosAdmin() {
        return ResponseEntity.ok(cursoService.listarTodosAdmin());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar un curso por identificador")
    public ResponseEntity<CursoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.obtenerPorId(id));
    }

    @PostMapping
    @Operation(summary = "Registrar un nuevo curso institucional (RF 03)")
    public ResponseEntity<CursoResponseDTO> crear(@Valid @RequestBody CursoDTO dto) {
        CursoResponseDTO nuevo = cursoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar información de un curso existente (RF 03)")
    public ResponseEntity<CursoResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody CursoDTO dto) {
        return ResponseEntity.ok(cursoService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(summary = "Desactivar un curso para excluirlo del catálogo y recomendaciones (RF 03)")
    public ResponseEntity<CursoResponseDTO> desactivar(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.desactivar(id));
    }

    @PatchMapping("/{id}/activar")
    @Operation(summary = "Activar un curso previamente desactivado (RF 03)")
    public ResponseEntity<CursoResponseDTO> activar(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.activar(id));
    }
}
