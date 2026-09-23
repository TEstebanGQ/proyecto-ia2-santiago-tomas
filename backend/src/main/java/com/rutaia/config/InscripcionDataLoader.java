package com.rutaia.config;

import com.rutaia.entity.Curso;
import com.rutaia.entity.Estudiante;
import com.rutaia.entity.Inscripcion;
import com.rutaia.repository.CursoRepository;
import com.rutaia.repository.EstudianteRepository;
import com.rutaia.repository.InscripcionRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class InscripcionDataLoader implements ApplicationRunner {

    private final InscripcionRepository inscripcionRepository;
    private final EstudianteRepository estudianteRepository;
    private final CursoRepository cursoRepository;

    public InscripcionDataLoader(InscripcionRepository inscripcionRepository,
                                 EstudianteRepository estudianteRepository,
                                 CursoRepository cursoRepository) {
        this.inscripcionRepository = inscripcionRepository;
        this.estudianteRepository = estudianteRepository;
        this.cursoRepository = cursoRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (inscripcionRepository.count() == 0) {
            List<Estudiante> estudiantes = estudianteRepository.findAll();
            List<Curso> cursos = cursoRepository.findAll();
            if (!estudiantes.isEmpty() && !cursos.isEmpty()) {
                for (Curso c : cursos) {
                    int total = (int) (c.getId() % 3) + 2;
                    for (int i = 0; i < total && i < estudiantes.size(); i++) {
                        Estudiante est = estudiantes.get((int) ((c.getId() + i * 2) % estudiantes.size()));
                        if (!inscripcionRepository.existsByEstudianteIdAndCursoId(est.getId(), c.getId())) {
                            String estado = (i % 2 == 0) ? "En Curso" : "Inscrito";
                            inscripcionRepository.save(new Inscripcion(est, c, estado, LocalDateTime.now().minusDays(i * 3 + 2)));
                        }
                    }
                }
            }
        }
    }
}
