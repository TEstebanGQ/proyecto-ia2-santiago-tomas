package com.rutaia;

import com.rutaia.dto.CursoDTO;
import com.rutaia.dto.EstudianteRegistroDTO;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RutaIaApplicationTests {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("RF 01: Debe aceptar únicamente niveles Principiante, Intermedio y Avanzado")
    void testValidacionNivelEstudiante() {
        // Válido
        EstudianteRegistroDTO valido = new EstudianteRegistroDTO(
                "Tomás Restrepo",
                "tomas.restrepo@universidad.edu.co",
                "Intermedio",
                "Inteligencia Artificial"
        );
        assertTrue(validator.validate(valido).isEmpty(), "Un estudiante con nivel Intermedio debe ser válido");

        // Inválido
        EstudianteRegistroDTO invalido = new EstudianteRegistroDTO(
                "Tomás Restrepo",
                "tomas.restrepo@universidad.edu.co",
                "Experto",
                "Inteligencia Artificial"
        );
        assertFalse(validator.validate(invalido).isEmpty(), "Un estudiante con nivel 'Experto' debe fallar la validación");
    }

    @Test
    @DisplayName("RF 03 / Regla: La duración de un curso debe ser mayor que cero")
    void testValidacionDuracionCurso() {
        // Válido
        CursoDTO cursoValido = new CursoDTO(
                "Python para IA",
                "Curso práctico de Python y Machine Learning",
                "Inteligencia Artificial",
                "Básico",
                40,
                true
        );
        assertTrue(validator.validate(cursoValido).isEmpty(), "Un curso con 40 horas debe ser válido");

        // Inválido duración 0
        CursoDTO cursoInvalido = new CursoDTO(
                "Python para IA",
                "Curso práctico de Python y Machine Learning",
                "Inteligencia Artificial",
                "Básico",
                0,
                true
        );
        assertFalse(validator.validate(cursoInvalido).isEmpty(), "Un curso con 0 horas de duración debe fallar la validación");
    }

    @Test
    @DisplayName("RF 03: El nivel del curso debe ser Básico, Intermedio o Avanzado")
    void testValidacionNivelCurso() {
        CursoDTO cursoNivelInvalido = new CursoDTO(
                "DevOps Avanzado",
                "Orquestación con Kubernetes",
                "DevOps",
                "Master",
                50,
                true
        );
        assertFalse(validator.validate(cursoNivelInvalido).isEmpty(), "Un curso con nivel 'Master' debe ser rechazado");
    }
}
