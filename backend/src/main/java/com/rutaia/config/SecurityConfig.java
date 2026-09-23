package com.rutaia.config;

import com.rutaia.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Peticiones Pre-flight OPTIONS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Rutas públicas de Autenticación, Registro de Estudiantes, Documentación y Catálogo Básico
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/estudiantes").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cursos").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/estadisticas").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/", "/api").permitAll()

                        // Operaciones del rol DOCENTE (Gestión de su especialidad, feedback, analíticas de área)
                        .requestMatchers("/api/docentes/**").hasAnyRole("DOCENTE", "ADMINISTRADOR")

                        // Operaciones Administrativas de Cursos
                        .requestMatchers(HttpMethod.GET, "/api/cursos/admin").hasAnyRole("ADMINISTRADOR", "DOCENTE")
                        .requestMatchers(HttpMethod.POST, "/api/cursos").hasAnyRole("ADMINISTRADOR", "DOCENTE")
                        .requestMatchers(HttpMethod.PUT, "/api/cursos/**").hasAnyRole("ADMINISTRADOR", "DOCENTE")
                        .requestMatchers(HttpMethod.PATCH, "/api/cursos/**").hasAnyRole("ADMINISTRADOR", "DOCENTE")

                        // Resto de operaciones (consultas RAG, calificaciones, gestión estudiantes) requieren autenticación
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
