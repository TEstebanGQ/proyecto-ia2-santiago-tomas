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
                        .requestMatchers(HttpMethod.POST, "/api/cursos/*/calificaciones").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/estadisticas/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/", "/api").permitAll()

                        // Operaciones Administrativas de Cursos y Configuración exclusivas para rol ADMINISTRADOR (RF 03, RF 05)
                        .requestMatchers(HttpMethod.GET, "/api/cursos/admin").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.POST, "/api/cursos").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PUT, "/api/cursos/**").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/cursos/**").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PUT, "/api/configuracion/**").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.GET, "/api/configuracion/**").permitAll()

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
