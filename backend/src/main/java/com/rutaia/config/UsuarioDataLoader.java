package com.rutaia.config;

import com.rutaia.entity.Docente;
import com.rutaia.entity.Estudiante;
import com.rutaia.entity.Usuario;
import com.rutaia.repository.DocenteRepository;
import com.rutaia.repository.EstudianteRepository;
import com.rutaia.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(10)
public class UsuarioDataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(UsuarioDataLoader.class);

    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;
    private final DocenteRepository docenteRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioDataLoader(
            UsuarioRepository usuarioRepository,
            EstudianteRepository estudianteRepository,
            DocenteRepository docenteRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.estudianteRepository = estudianteRepository;
        this.docenteRepository = docenteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("Inicializando y sincronizando usuarios del sistema...");

        // 1. Superadmin institucional
        if (!usuarioRepository.findByCorreoElectronicoIgnoreCase("superadmin@universidad.edu.co").isPresent()) {
            Usuario superadmin = new Usuario(
                    "Super Administrador del Sistema",
                    "superadmin@universidad.edu.co",
                    passwordEncoder.encode("password123"),
                    "SUPERADMIN",
                    "Superadmin",
                    "Gobierno Institucional y Superadministración",
                    "Rectoría y Vicerrectoría Académica"
            );
            usuarioRepository.save(superadmin);
            log.info("Usuario Superadmin inicial creado: superadmin@universidad.edu.co");
        }

        // 2. Administrador académico
        if (!usuarioRepository.findByCorreoElectronicoIgnoreCase("admin@universidad.edu.co").isPresent()) {
            Usuario admin = new Usuario(
                    "Administrador Académico",
                    "admin@universidad.edu.co",
                    passwordEncoder.encode("password123"),
                    "ADMINISTRADOR",
                    "Coordinador",
                    "Administración y Gestión Curricular",
                    "Dirección Académica"
            );
            usuarioRepository.save(admin);
            log.info("Usuario Administrador inicial creado: admin@universidad.edu.co");
        }

        // 3. Docente titular
        if (!usuarioRepository.findByCorreoElectronicoIgnoreCase("profesor.programacion@universidad.edu.co").isPresent()) {
            Usuario docente = new Usuario(
                    "Profesor de Programación",
                    "profesor.programacion@universidad.edu.co",
                    passwordEncoder.encode("password123"),
                    "DOCENTE",
                    "Docente Titular",
                    "Programación",
                    "Facultad de Ingeniería"
            );
            usuarioRepository.save(docente);

            docenteRepository.findByCorreoElectronicoIgnoreCase("profesor.programacion@universidad.edu.co").ifPresentOrElse(
                    d -> {
                        if (d.getNombreCompleto() == null || d.getNombreCompleto().isBlank()) {
                            d.setNombreCompleto("Profesor de Programación");
                            docenteRepository.save(d);
                        }
                    },
                    () -> {
                        Docente d = new Docente(
                                "Profesor de Programación",
                                "profesor.programacion@universidad.edu.co",
                                "Programación",
                                "Facultad de Ingeniería"
                        );
                        docenteRepository.save(d);
                    }
            );
            log.info("Usuario Docente inicial verificado y sincronizado: profesor.programacion@universidad.edu.co");
        }

        // 4. Sincronizar todos los estudiantes existentes en la tabla estudiantes a la tabla usuarios
        List<Estudiante> estudiantes = estudianteRepository.findAll();
        for (Estudiante est : estudiantes) {
            String correo = est.getCorreoElectronico().trim().toLowerCase();
            if (!usuarioRepository.findByCorreoElectronicoIgnoreCase(correo).isPresent()) {
                Usuario uEst = new Usuario(
                        est.getNombreCompleto(),
                        correo,
                        passwordEncoder.encode("password123"),
                        "ESTUDIANTE",
                        est.getNivelExperiencia(),
                        est.getAreaInteres(),
                        "Pregrado"
                );
                usuarioRepository.save(uEst);
            }
        }

        log.info("Sincronización de usuarios completada exitosamente.");
    }
}
