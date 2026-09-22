package com.rutaia.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("RutaIA - API REST de Orientación Académica y Recomendación de Cursos")
                        .version("1.0.0")
                        .description("API REST centralizada para el registro de estudiantes, catálogo de cursos institucionales, orquestación de consultas vocacionales en lenguaje natural mediante RAG y evaluación de recomendaciones.")
                        .contact(new Contact()
                                .name("Equipo Santiago y Tomás - IA2")
                                .email("contacto@rutaia.edu.co")));
    }
}
