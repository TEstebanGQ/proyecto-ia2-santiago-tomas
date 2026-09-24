package com.rutaia.service;

import com.rutaia.dto.UsuarioDTO;
import com.rutaia.dto.UsuarioPasswordDTO;
import com.rutaia.dto.UsuarioRegistroDTO;
import com.rutaia.entity.Docente;
import com.rutaia.entity.Estudiante;
import com.rutaia.entity.Usuario;
import com.rutaia.repository.DocenteRepository;
import com.rutaia.repository.EstudianteRepository;
import com.rutaia.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EstudianteRepository estudianteRepository;

    @Mock
    private DocenteRepository docenteRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private UsuarioService usuarioService;

    private Authentication superAdminAuth;
    private Authentication adminAuth;

    @BeforeEach
    void setUp() {
        superAdminAuth = new UsernamePasswordAuthenticationToken(
                "superadmin@universidad.edu.co",
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_SUPERADMIN"))
        );

        adminAuth = new UsernamePasswordAuthenticationToken(
                "admin@universidad.edu.co",
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMINISTRADOR"))
        );
    }

    @Test
    @DisplayName("Superadmin puede crear un usuario con rol ADMINISTRADOR")
    void testSuperadminPuedeCrearAdministrador() {
        UsuarioRegistroDTO dto = new UsuarioRegistroDTO(
                "Nuevo Admin",
                "nuevo.admin@universidad.edu.co",
                "password123",
                "ADMINISTRADOR",
                "Coordinador",
                "Gestión Curricular",
                "Facultad"
        );

        when(usuarioRepository.existsByCorreoElectronicoIgnoreCase(anyString())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> {
            Usuario u = i.getArgument(0);
            u.setId(10L);
            return u;
        });

        UsuarioDTO result = usuarioService.crearUsuario(dto, superAdminAuth);

        assertNotNull(result);
        assertEquals("nuevo.admin@universidad.edu.co", result.getCorreoElectronico());
        assertEquals("ADMINISTRADOR", result.getRol());
        verify(auditoriaService).registrarEvento(eq("CREACION_USUARIO"), anyString(), anyString(), eq("SUPERADMIN"), anyString());
    }

    @Test
    @DisplayName("Superadmin puede crear un usuario con rol DOCENTE y sincronizarlo")
    void testSuperadminPuedeCrearDocente() {
        UsuarioRegistroDTO dto = new UsuarioRegistroDTO(
                "Nuevo Docente",
                "nuevo.docente@universidad.edu.co",
                "password123",
                "DOCENTE",
                "Docente Titular",
                "Programación",
                "Facultad de Ingeniería"
        );

        when(usuarioRepository.existsByCorreoElectronicoIgnoreCase(anyString())).thenReturn(false);
        when(docenteRepository.findByCorreoElectronicoIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> {
            Usuario u = i.getArgument(0);
            u.setId(11L);
            return u;
        });

        UsuarioDTO result = usuarioService.crearUsuario(dto, superAdminAuth);

        assertNotNull(result);
        assertEquals("DOCENTE", result.getRol());
        verify(docenteRepository).save(any(Docente.class));
    }

    @Test
    @DisplayName("Superadmin puede crear un usuario con rol ESTUDIANTE y sincronizarlo")
    void testSuperadminPuedeCrearEstudiante() {
        UsuarioRegistroDTO dto = new UsuarioRegistroDTO(
                "Nuevo Estudiante",
                "nuevo.estudiante@universidad.edu.co",
                "password123",
                "ESTUDIANTE",
                "Principiante",
                "Inteligencia Artificial",
                "Pregrado"
        );

        when(usuarioRepository.existsByCorreoElectronicoIgnoreCase(anyString())).thenReturn(false);
        when(estudianteRepository.findByCorreoElectronicoIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> {
            Usuario u = i.getArgument(0);
            u.setId(12L);
            return u;
        });

        UsuarioDTO result = usuarioService.crearUsuario(dto, superAdminAuth);

        assertNotNull(result);
        assertEquals("ESTUDIANTE", result.getRol());
        verify(estudianteRepository).save(any(Estudiante.class));
    }

    @Test
    @DisplayName("Administrador puede crear Docente y Estudiante")
    void testAdminPuedeCrearDocenteYEstudiante() {
        UsuarioRegistroDTO dtoDocente = new UsuarioRegistroDTO(
                "Docente Por Admin",
                "docente.admin@universidad.edu.co",
                "password123",
                "DOCENTE",
                "Docente Titular",
                "Bases de Datos",
                "Facultad de Ingeniería"
        );

        when(usuarioRepository.existsByCorreoElectronicoIgnoreCase(anyString())).thenReturn(false);
        when(docenteRepository.findByCorreoElectronicoIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> {
            Usuario u = i.getArgument(0);
            u.setId(15L);
            return u;
        });

        UsuarioDTO result = usuarioService.crearUsuario(dtoDocente, adminAuth);
        assertNotNull(result);
        assertEquals("DOCENTE", result.getRol());
        verify(auditoriaService).registrarEvento(eq("CREACION_USUARIO"), anyString(), anyString(), eq("ADMINISTRADOR"), anyString());
    }

    @Test
    @DisplayName("Administrador NO puede crear otro Administrador (lanza AccessDeniedException)")
    void testAdminNoPuedeCrearAdministrador() {
        UsuarioRegistroDTO dto = new UsuarioRegistroDTO(
                "Intento Admin",
                "intento.admin@universidad.edu.co",
                "password123",
                "ADMINISTRADOR",
                "Coordinador",
                "Administración",
                "Facultad"
        );

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                usuarioService.crearUsuario(dto, adminAuth)
        );

        assertTrue(ex.getMessage().contains("Solo el Superadmin puede crear Administradores"));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Superadmin y Administrador pueden configurar contraseñas de usuarios")
    void testConfigurarPasswordUsuario() {
        Usuario usuario = new Usuario("Docente Prueba", "docente@universidad.edu.co", "oldHash", "DOCENTE", "Titular", "IA", "Ingeniería");
        usuario.setId(20L);

        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode("nuevaPassword123")).thenReturn("newHashedPassword");

        UsuarioPasswordDTO pwdDto = new UsuarioPasswordDTO("nuevaPassword123");
        usuarioService.cambiarPassword(20L, pwdDto, adminAuth);

        assertEquals("newHashedPassword", usuario.getPassword());
        verify(usuarioRepository).save(usuario);
        verify(auditoriaService).registrarEvento(eq("CONFIGURACION_PASSWORD"), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Administrador NO puede cambiar la contraseña de un Superadmin (lanza AccessDeniedException)")
    void testAdminNoPuedeCambiarPasswordSuperadmin() {
        Usuario superadmin = new Usuario("Superadmin", "superadmin@universidad.edu.co", "oldHash", "SUPERADMIN", "Superadmin", "Gobierno", "Rectoría");
        superadmin.setId(1L);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(superadmin));

        UsuarioPasswordDTO pwdDto = new UsuarioPasswordDTO("nuevaPassword123");

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                usuarioService.cambiarPassword(1L, pwdDto, adminAuth)
        );

        assertTrue(ex.getMessage().contains("Superadmin"));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Administrador NO puede cambiar la contraseña de otro Administrador (lanza AccessDeniedException)")
    void testAdminNoPuedeCambiarPasswordOtroAdmin() {
        Usuario otroAdmin = new Usuario("Otro Administrador", "otro.admin@universidad.edu.co", "oldHash", "ADMINISTRADOR", "Coordinador", "Curricular", "Decanatura");
        otroAdmin.setId(2L);

        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(otroAdmin));

        UsuarioPasswordDTO pwdDto = new UsuarioPasswordDTO("nuevaPassword123");

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                usuarioService.cambiarPassword(2L, pwdDto, adminAuth)
        );

        assertTrue(ex.getMessage().contains("Docentes y Estudiantes"));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Superadmin lista todos los usuarios (Superadmin, Administrador, Docente, Estudiante)")
    void testSuperadminListaTodosLosUsuarios() {
        Usuario u1 = new Usuario("Super", "super@univ.edu.co", "h1", "SUPERADMIN", "Super", "Gob", "Rec");
        Usuario u2 = new Usuario("Admin", "admin@univ.edu.co", "h2", "ADMINISTRADOR", "Coord", "Curr", "Dec");
        Usuario u3 = new Usuario("Doc", "doc@univ.edu.co", "h3", "DOCENTE", "Titular", "IA", "Ing");
        Usuario u4 = new Usuario("Est", "est@univ.edu.co", "h4", "ESTUDIANTE", "Intermedio", "Web", "Pre");

        when(usuarioRepository.findAllByOrderByFechaCreacionDesc()).thenReturn(List.of(u1, u2, u3, u4));

        List<UsuarioDTO> lista = usuarioService.listarUsuarios(superAdminAuth);

        assertEquals(4, lista.size());
    }

    @Test
    @DisplayName("Administrador solo lista Docentes y Estudiantes (excluye Superadmins y otros Administradores)")
    void testAdministradorSoloListaDocentesYEstudiantes() {
        Usuario u1 = new Usuario("Super", "super@univ.edu.co", "h1", "SUPERADMIN", "Super", "Gob", "Rec");
        Usuario u2 = new Usuario("Admin", "admin@univ.edu.co", "h2", "ADMINISTRADOR", "Coord", "Curr", "Dec");
        Usuario u3 = new Usuario("Doc", "doc@univ.edu.co", "h3", "DOCENTE", "Titular", "IA", "Ing");
        Usuario u4 = new Usuario("Est", "est@univ.edu.co", "h4", "ESTUDIANTE", "Intermedio", "Web", "Pre");

        when(usuarioRepository.findAllByOrderByFechaCreacionDesc()).thenReturn(List.of(u1, u2, u3, u4));

        List<UsuarioDTO> lista = usuarioService.listarUsuarios(adminAuth);

        assertEquals(2, lista.size());
        assertTrue(lista.stream().allMatch(u -> "DOCENTE".equals(u.getRol()) || "ESTUDIANTE".equals(u.getRol())));
        assertTrue(lista.stream().noneMatch(u -> "SUPERADMIN".equals(u.getRol()) || "ADMINISTRADOR".equals(u.getRol())));
    }
}
