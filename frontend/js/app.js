/**
 * RutaIA - Controlador Principal de la Aplicación Frontend
 * Concepto: Editorial Learning Lab
 */

import { api } from './api.js';
import { state } from './state.js';
import { ui } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (state.usuario) {
    ui.renderUsuarioHeader(state.usuario);
  }

  initNavigation();
  initPastelTiles();
  initTestChips();
  initQueryForm();
  initCatalogFilters();
  initStudentModal();
  initQuickSearch();
  initAuthModal();
  initAdminPanel();

  await cargarDatosIniciales();
});

// 1. Navegación por Vistas (Sidebar y Enlaces Bento)
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-item');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.dataset.view;
      if (targetView) cambiarVista(targetView);
    });
  });

  // Enlace "Ver catálogo ➔" en mosaicos bento y botón en fallback box
  const btnSeeCatalog = document.getElementById('btn-see-catalog');
  if (btnSeeCatalog) {
    btnSeeCatalog.addEventListener('click', () => cambiarVista('catalogo'));
  }

  const fallbackCatalogBtn = document.getElementById('fallback-catalog-btn');
  if (fallbackCatalogBtn) {
    fallbackCatalogBtn.addEventListener('click', () => cambiarVista('catalogo'));
  }

  // Enlace "Ver todos" en widget lateral de historial
  const seeAllHistoryBtn = document.querySelector('.link-see-all-side');
  if (seeAllHistoryBtn) {
    seeAllHistoryBtn.addEventListener('click', () => cambiarVista('historial'));
  }

  // Botón Cerrar Sesión (invalida en Redis y redirige a login.html)
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      try {
        await api.logout();
      } catch (e) {
        console.warn('Error durante logout:', e);
      }
      window.location.href = 'login.html?logout=true';
    });
  }
}

export function cambiarVista(viewId) {
  // 1. Descartar vista registro obsoleta
  if (viewId === 'registro') {
    viewId = 'asesor';
  }

  // 2. Proteger vista admin exclusiva para Administrador
  if (viewId === 'admin' && (!state.usuario || state.usuario.rol !== 'ADMINISTRADOR')) {
    ui.showToast('Acceso restringido: Esta vista es exclusiva para el rol de Administrador.', 'error');
    viewId = 'asesor';
  }

  // Actualizar botones de navegación activa en sidebar
  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.view === viewId);
  });

  // Actualizar secciones de vista
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === `view-${viewId}`);
  });

  if (viewId === 'catalogo') cargarCatalogo();
  if (viewId === 'historial') cargarHistorial();
  if (viewId === 'estadisticas') cargarEstadisticas();
  if (viewId === 'admin') {
    cargarCursosAdmin();
    cargarEstudiantesAdmin();
  }
  
  // Desplazar al tope del contenido
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 2. Mosaicos Pastel de Categorías (Bento Grid)
function initPastelTiles() {
  const tiles = document.querySelectorAll('.pastel-tile');
  const textarea = document.getElementById('query-input');

  tiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const query = tile.dataset.query;
      if (query && textarea) {
        textarea.value = query;
        ejecutarConsulta(query);
      }
    });
  });
}

// 3. Chips de Consultas Obligatorias y Botón de Opciones
function initTestChips() {
  const chips = document.querySelectorAll('.chip-item');
  const textarea = document.getElementById('query-input');
  const toggleBtn = document.getElementById('toggle-chips-btn');
  const tray = document.getElementById('suggested-chips-tray');

  if (toggleBtn && tray) {
    toggleBtn.addEventListener('click', () => {
      const isVisible = tray.style.display !== 'none';
      tray.style.display = isVisible ? 'none' : 'block';
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.dataset.query;
      if (query && textarea) {
        textarea.value = query;
        textarea.focus();
        ejecutarConsulta(query);
      }
    });
  });
}

// 4. Formulario de Consulta Inteligente (RF 06)
function initQueryForm() {
  const submitBtn = document.getElementById('submit-query-btn');
  const textarea = document.getElementById('query-input');

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const pregunta = textarea.value.trim();
      ejecutarConsulta(pregunta);
    });
  }

  // Atajo Enter para enviar (Ctrl+Enter o Enter simple)
  if (textarea) {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const pregunta = textarea.value.trim();
        ejecutarConsulta(pregunta);
      }
    });
  }
}

async function ejecutarConsulta(pregunta) {
  if (!pregunta) {
    ui.showToast('Por favor escribe tu duda o consulta vocacional.', 'error');
    return;
  }

  if (!state.estudianteActivo) {
    ui.showToast('Debes seleccionar o registrar un estudiante antes de consultar.', 'error');
    abrirModalEstudiantes();
    return;
  }

  // Asegurar que estamos en la vista de Asesor
  cambiarVista('asesor');
  ui.setLoading(true);

  try {
    const resultado = await api.solicitarRecomendacion(state.estudianteActivo.id, pregunta);
    state.setUltimaRecomendacion(resultado);

    ui.renderResultadoRecomendacion(resultado, async (recId, puntuacion, comentario) => {
      return await api.calificarRecomendacion(recId, puntuacion, comentario);
    });

    if (resultado.estadoFinal === 'Sin resultados') {
      ui.showToast('No se identificaron cursos del catálogo para esta consulta.', 'info');
    } else {
      ui.showToast('¡Recomendación vocacional generada exitosamente!', 'success');
    }

    // Actualizar historial en segundo plano
    actualizarHistorialesEstudiante();
  } catch (err) {
    ui.showToast(err.message, 'error');
  } finally {
    ui.setLoading(false);
  }
}

// 5. Búsqueda Rápida en el Header
function initQuickSearch() {
  const searchInput = document.getElementById('quick-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = searchInput.value.trim();
      if (val) {
        cambiarVista('catalogo');
        const catalogSearch = document.getElementById('catalog-search');
        if (catalogSearch) {
          catalogSearch.value = val;
          catalogSearch.dispatchEvent(new Event('input'));
        }
      }
    }
  });
}

// 6. Filtros del Catálogo (RF 04)
function initCatalogFilters() {
  const searchInput = document.getElementById('catalog-search');
  const categorySelect = document.getElementById('catalog-category');
  const levelSelect = document.getElementById('catalog-level');

  const aplicarFiltros = () => {
    const searchVal = (searchInput.value || '').toLowerCase().trim();
    const catVal = categorySelect ? categorySelect.value : '';
    const levelVal = levelSelect ? levelSelect.value : '';

    let filtrados = state.cursos || [];

    if (catVal) {
      filtrados = filtrados.filter(c => c.categoria.toLowerCase() === catVal.toLowerCase());
    }
    if (levelVal) {
      filtrados = filtrados.filter(c => c.nivel.toLowerCase() === levelVal.toLowerCase());
    }
    if (searchVal) {
      filtrados = filtrados.filter(c =>
        c.nombre.toLowerCase().includes(searchVal) ||
        c.descripcion.toLowerCase().includes(searchVal) ||
        c.categoria.toLowerCase().includes(searchVal)
      );
    }

    ui.renderCatalogo(filtrados);
  };

  if (searchInput) searchInput.addEventListener('input', aplicarFiltros);
  if (categorySelect) categorySelect.addEventListener('change', aplicarFiltros);
  if (levelSelect) levelSelect.addEventListener('change', aplicarFiltros);
}

// 7. Registro de Estudiantes (RF 01)
function initRegistrationForm() {
  const form = document.getElementById('student-register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreCompleto = document.getElementById('reg-nombre').value.trim();
    const correoElectronico = document.getElementById('reg-correo').value.trim();
    const nivelExperiencia = document.getElementById('reg-nivel').value;
    const areaInteres = document.getElementById('reg-area').value.trim();

    try {
      const nuevo = await api.registrarEstudiante({
        nombreCompleto,
        correoElectronico,
        nivelExperiencia,
        areaInteres
      });

      state.estudiantes.push(nuevo);
      state.setEstudianteActivo(nuevo);
      ui.renderEstudianteActivo(nuevo);
      ui.showToast(`¡Estudiante ${nuevo.nombreCompleto} registrado exitosamente!`, 'success');

      form.reset();
      cambiarVista('asesor');
      actualizarHistorialesEstudiante();
    } catch (err) {
      ui.showToast(err.message, 'error');
    }
  });
}

// 8. Modal y Selector de Estudiante Activo
function initStudentModal() {
  const modal = document.getElementById('students-modal');
  const openBtn = document.getElementById('change-student-btn');
  const closeBtn = document.getElementById('close-students-modal');

  if (openBtn) {
    openBtn.addEventListener('click', () => abrirModalEstudiantes());
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  if (modal) {
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  window.addEventListener('cambiar-estudiante', (e) => {
    const est = e.detail;
    state.setEstudianteActivo(est);
    ui.renderEstudianteActivo(est);
    ui.showToast(`Perfil activo: ${est.nombreCompleto}`, 'info');
    if (modal) modal.style.display = 'none';
    actualizarHistorialesEstudiante();
  });
}

function abrirModalEstudiantes() {
  const modal = document.getElementById('students-modal');
  if (!modal) return;
  ui.renderSelectorEstudiantes(state.estudiantes, state.estudianteActivo ? state.estudianteActivo.id : null);
  modal.style.display = 'flex';
}

// 9. Cargas de Datos y Conexión con Spring Boot
async function cargarDatosIniciales() {
  try {
    const estudiantes = await api.getEstudiantes();
    state.setEstudiantes(estudiantes);

    // Inicializar estado de usuario y header
    if (state.usuario) {
      ui.renderUsuarioHeader(state.usuario);
    } else if (state.estudianteActivo) {
      ui.renderEstudianteActivo(state.estudianteActivo);
    }

    const cursos = await api.getCursos();
    state.setCursos(cursos);
    poblarCategoriasSelect(cursos);

    if (state.estudianteActivo) {
      actualizarHistorialesEstudiante();
    }
  } catch (err) {
    console.warn('Backend aún conectándose:', err.message);
  }
}

function poblarCategoriasSelect(cursos) {
  const select = document.getElementById('catalog-category');
  if (!select) return;

  const categorias = [...new Set(cursos.map(c => c.categoria))].sort();
  select.innerHTML = '<option value="">Todas las categorías</option>';
  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

async function cargarCatalogo() {
  try {
    const cursos = await api.getCursos();
    state.setCursos(cursos);
    ui.renderCatalogo(cursos);
  } catch (err) {
    ui.showToast('Error al cargar el catálogo de cursos: ' + err.message, 'error');
  }
}

async function actualizarHistorialesEstudiante() {
  if (!state.estudianteActivo) return;
  try {
    const historial = await api.getHistorial(state.estudianteActivo.id);
    state.setHistorial(historial);
    
    // Renderizar widget de historial rápido
    ui.renderHistorialRapido(historial, (item) => mostrarDetalleHistorial(item));
  } catch (err) {
    console.warn('No se pudo actualizar historial rápido:', err.message);
  }
}

async function cargarHistorial() {
  if (!state.estudianteActivo) {
    ui.showToast('Selecciona un estudiante para revisar su historial.', 'info');
    return;
  }
  try {
    const historial = await api.getHistorial(state.estudianteActivo.id);
    state.setHistorial(historial);
    ui.renderHistorial(historial, (item) => mostrarDetalleHistorial(item));
  } catch (err) {
    ui.showToast('Error al cargar historial: ' + err.message, 'error');
  }
}

function mostrarDetalleHistorial(item) {
  state.setUltimaRecomendacion({
    idConsulta: item.idConsulta,
    idRecomendacion: item.idRecomendacion,
    pregunta: item.pregunta,
    respuesta: item.respuesta,
    fuentes: item.fuentes,
    similitudes: (item.fuentes || []).map(f => f.similitud),
    estadoFinal: item.estado,
    fecha: item.fecha,
    calificacionPuntuacion: item.puntuacion,
    calificacionComentario: item.comentario
  });
  cambiarVista('asesor');
  ui.renderResultadoRecomendacion(state.ultimaRecomendacion, async (recId, puntuacion, comentario) => {
    return await api.calificarRecomendacion(recId, puntuacion, comentario);
  });
}

async function cargarEstadisticas() {
  try {
    const stats = await api.getEstadisticas();
    state.setEstadisticas(stats);
    ui.renderEstadisticas(stats);
  } catch (err) {
    ui.showToast('Error al cargar estadísticas: ' + err.message, 'error');
  }
}

// Utilidad global invocada desde tarjetas de curso en el catálogo
window.consultarCursoSemantico = (nombreCurso) => {
  const textarea = document.getElementById('query-input');
  if (textarea) {
    textarea.value = `Quiero información y orientación sobre el curso: ${nombreCurso}`;
    cambiarVista('asesor');
    ejecutarConsulta(textarea.value);
  }
};

// Modal con detalles del curso
window.verDetalleCursoModal = (nombreCurso) => {
  const curso = state.cursos.find(c => c.nombre.toLowerCase().trim() === nombreCurso.toLowerCase().trim()) || {
    nombre: nombreCurso,
    categoria: 'Tecnología',
    nivel: 'Intermedio',
    duracionHoras: 40,
    descripcion: 'Formación académica especializada con estándares de la industria, orientada a la adquisición de competencias profesionales.'
  };
  ui.mostrarModalDetalleCurso(curso);
};

// ==========================================================================
// 10. MODAL DE AUTENTICACIÓN Y ROLES (GOOGLE / ESTUDIANTE / ADMIN)
// ==========================================================================
function initAuthModal() {
  const modal = document.getElementById('auth-modal');
  const openBtn = document.getElementById('btn-open-login');
  const closeBtn = document.getElementById('close-auth-modal');
  const tabLogin = document.getElementById('auth-tab-login');
  const tabRegister = document.getElementById('auth-tab-register');
  const googleBtn = document.getElementById('btn-google-login');
  const cardStudent = document.getElementById('role-card-student');
  const cardAdmin = document.getElementById('role-card-admin');
  const loginForm = document.getElementById('auth-login-form');
  const registerForm = document.getElementById('auth-register-student-form');

  if (openBtn) {
    openBtn.addEventListener('click', () => ui.mostrarModalAuth('login'));
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (modal) {
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // Pestañas
  if (tabLogin) tabLogin.addEventListener('click', () => ui.mostrarModalAuth('login'));
  if (tabRegister) tabRegister.addEventListener('click', () => ui.mostrarModalAuth('register'));

  // Autenticación con Google
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        const authData = await api.loginGoogle('estudiante.google@universidad.edu.co', 'Estudiante Google Demo', 'ESTUDIANTE');
        state.setUsuario(authData);
        ui.renderUsuarioHeader(authData);
        if (modal) modal.style.display = 'none';
        ui.showToast(`¡Autenticado con Google! Sesión activa: ${authData.nombre} (${authData.rol})`, 'success');
        
        if (authData.rol === 'ESTUDIANTE') {
          actualizarHistorialesEstudiante();
          cambiarVista('asesor');
        } else {
          cambiarVista('admin');
        }
      } catch (err) {
        ui.showToast('Error en autenticación con Google: ' + err.message, 'error');
      }
    });
  }

  // Tarjeta acceso rápido Estudiante (Santiago Gómez)
  if (cardStudent) {
    cardStudent.addEventListener('click', async () => {
      try {
        const authData = await api.login('santiago.gomez@universidad.edu.co', 'ESTUDIANTE', 'Santiago Gómez Morales');
        state.setUsuario(authData);
        ui.renderUsuarioHeader(authData);
        if (modal) modal.style.display = 'none';
        ui.showToast('Sesión activa como Estudiante: Santiago Gómez', 'success');
        actualizarHistorialesEstudiante();
        cambiarVista('asesor');
      } catch (err) {
        ui.showToast('Error al iniciar sesión: ' + err.message, 'error');
      }
    });
  }

  // Tarjeta acceso rápido Administrador
  if (cardAdmin) {
    cardAdmin.addEventListener('click', async () => {
      try {
        const authData = await api.login('admin@universidad.edu.co', 'ADMINISTRADOR', 'Administrador Curricular');
        state.setUsuario(authData);
        ui.renderUsuarioHeader(authData);
        if (modal) modal.style.display = 'none';
        ui.showToast('Sesión activa como Administrador Curricular', 'success');
        cambiarVista('admin');
      } catch (err) {
        ui.showToast('Error al iniciar sesión: ' + err.message, 'error');
      }
    });
  }

  // Formulario de Inicio de Sesión
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email').value.trim();
      const rol = document.getElementById('auth-role').value;

      try {
        const authData = await api.login(email, rol);
        state.setUsuario(authData);
        ui.renderUsuarioHeader(authData);
        if (modal) modal.style.display = 'none';
        ui.showToast(`Bienvenido(a). Rol activo: ${authData.rol}`, 'success');

        if (authData.rol === 'ADMINISTRADOR') {
          cambiarVista('admin');
        } else {
          actualizarHistorialesEstudiante();
          cambiarVista('asesor');
        }
      } catch (err) {
        ui.showToast('Error al iniciar sesión: ' + err.message, 'error');
      }
    });
  }

  // Formulario de Auto-Inscripción de Estudiante (RF 01)
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombreCompleto = document.getElementById('auth-reg-nombre').value.trim();
      const correoElectronico = document.getElementById('auth-reg-correo').value.trim();
      const nivelExperiencia = document.getElementById('auth-reg-nivel').value;
      const areaInteres = document.getElementById('auth-reg-area').value.trim();

      try {
        const nuevo = await api.registrarEstudiante({
          nombreCompleto,
          correoElectronico,
          nivelExperiencia,
          areaInteres
        });

        const authData = await api.login(correoElectronico, 'ESTUDIANTE', nombreCompleto);
        state.estudiantes.push(nuevo);
        state.setUsuario(authData);
        state.setEstudianteActivo(nuevo);
        ui.renderUsuarioHeader(authData);

        if (modal) modal.style.display = 'none';
        registerForm.reset();
        ui.showToast(`¡Inscripción exitosa! Bienvenido(a) ${nuevo.nombreCompleto}`, 'success');
        actualizarHistorialesEstudiante();
        cambiarVista('asesor');
      } catch (err) {
        ui.showToast('Error al inscribirse: ' + err.message, 'error');
      }
    });
  }
}

// ==========================================================================
// 11. PANEL DE ADMINISTRACIÓN DE CURSOS (RF 03)
// ==========================================================================
function initAdminPanel() {
  const openNewBtn = document.getElementById('btn-open-new-course');
  const modal = document.getElementById('course-modal');
  const closeBtn = document.getElementById('close-course-modal');
  const cancelBtn = document.getElementById('btn-cancel-course-modal');
  const form = document.getElementById('course-admin-form');
  const searchInput = document.getElementById('admin-course-filter');
  const statusFilter = document.getElementById('admin-status-filter');

  if (openNewBtn) {
    openNewBtn.addEventListener('click', () => ui.mostrarModalCursoAdmin());
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
  }

  if (modal) {
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // Filtrado de cursos en tabla admin
  function aplicarFiltrosAdmin() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const status = statusFilter ? statusFilter.value : 'todos';

    const filtrados = (state.cursosAdmin || []).filter(c => {
      const matchText = !query ||
        c.nombre.toLowerCase().includes(query) ||
        (c.categoria && c.categoria.toLowerCase().includes(query)) ||
        (c.nivel && c.nivel.toLowerCase().includes(query));

      const esActivo = c.activo !== false;
      const matchStatus = status === 'todos' ||
        (status === 'activos' && esActivo) ||
        (status === 'inactivos' && !esActivo);

      return matchText && matchStatus;
    });

    ui.renderCursosAdmin(
      filtrados,
      (curso) => ui.mostrarModalCursoAdmin(curso),
      (curso) => toggleActivoCurso(curso)
    );
  }

  if (searchInput) searchInput.addEventListener('input', aplicarFiltrosAdmin);
  if (statusFilter) statusFilter.addEventListener('change', aplicarFiltrosAdmin);

  // Guardar curso (Crear o Actualizar)
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('course-form-id').value;
      const nombre = document.getElementById('course-form-nombre').value.trim();
      const descripcion = document.getElementById('course-form-descripcion').value.trim();
      const categoria = document.getElementById('course-form-categoria').value.trim();
      const nivel = document.getElementById('course-form-nivel').value;
      const duracionHoras = parseInt(document.getElementById('course-form-duracion').value, 10);
      const prerrequisitos = document.getElementById('course-form-prerrequisitos').value.trim();

      const cursoData = { nombre, descripcion, categoria, nivel, duracionHoras, prerrequisitos };

      try {
        if (id) {
          await api.actualizarCurso(id, cursoData);
          ui.showToast(`Curso #${id} actualizado correctamente.`, 'success');
        } else {
          await api.crearCurso(cursoData);
          ui.showToast(`Curso "${nombre}" creado y registrado en el catálogo.`, 'success');
        }

        if (modal) modal.style.display = 'none';
        form.reset();
        await cargarCursosAdmin();
        await cargarCatalogo();
      } catch (err) {
        ui.showToast('Error al procesar el curso: ' + err.message, 'error');
      }
    });
  }

  // ==========================================================
  // PESTAÑAS SUB-PANEL ADMIN (RF 03 CURSOS VS RF 02 ESTUDIANTES)
  // ==========================================================
  const subtabCourses = document.getElementById('subtab-admin-courses');
  const subtabStudents = document.getElementById('subtab-admin-students');
  const paneCourses = document.getElementById('admin-pane-courses');
  const paneStudents = document.getElementById('admin-pane-students');

  if (subtabCourses && subtabStudents) {
    subtabCourses.addEventListener('click', () => {
      subtabCourses.classList.add('active');
      subtabStudents.classList.remove('active');
      if (paneCourses) paneCourses.style.display = 'block';
      if (paneStudents) paneStudents.style.display = 'none';
      cargarCursosAdmin();
    });

    subtabStudents.addEventListener('click', () => {
      subtabStudents.classList.add('active');
      subtabCourses.classList.remove('active');
      if (paneStudents) paneStudents.style.display = 'block';
      if (paneCourses) paneCourses.style.display = 'none';
      cargarEstudiantesAdmin();
    });
  }

  // Búsqueda por Identificador de Estudiante (RF 02)
  const studentSearchForm = document.getElementById('admin-student-search-form');
  const studentIdInput = document.getElementById('admin-student-id-input');
  if (studentSearchForm) {
    studentSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = studentIdInput ? studentIdInput.value.trim() : '';
      if (!val) {
        ui.showToast('Por favor ingresa un número de ID para consultar.', 'error');
        return;
      }
      inspeccionarEstudianteAdmin(val);
    });
  }

  // Botón Refrescar Lista de Estudiantes
  const refreshStudentsBtn = document.getElementById('btn-admin-refresh-students');
  if (refreshStudentsBtn) {
    refreshStudentsBtn.addEventListener('click', () => {
      cargarEstudiantesAdmin();
      ui.showToast('Lista de estudiantes actualizada.', 'info');
    });
  }

  // Filtrado en vivo de Estudiantes en tabla
  const studentFilterInput = document.getElementById('admin-student-table-filter');
  if (studentFilterInput) {
    studentFilterInput.addEventListener('input', () => {
      const q = studentFilterInput.value.toLowerCase().trim();
      const filtrados = (state.estudiantes || []).filter(est => {
        return !q ||
          (est.nombreCompleto && est.nombreCompleto.toLowerCase().includes(q)) ||
          (est.correoElectronico && est.correoElectronico.toLowerCase().includes(q)) ||
          (est.areaInteres && est.areaInteres.toLowerCase().includes(q)) ||
          (est.nivelExperiencia && est.nivelExperiencia.toLowerCase().includes(q)) ||
          String(est.id) === q;
      });
      ui.renderEstudiantesAdmin(filtrados, (est) => {
        if (studentIdInput) studentIdInput.value = est.id;
        inspeccionarEstudianteAdmin(est.id);
      });
    });
  }
}

async function cargarCursosAdmin() {
  try {
    const cursos = await api.getCursosAdmin();
    state.setCursosAdmin(cursos);
    ui.renderCursosAdmin(
      cursos,
      (curso) => ui.mostrarModalCursoAdmin(curso),
      (curso) => toggleActivoCurso(curso)
    );
  } catch (err) {
    ui.showToast('Error al cargar cursos para administración: ' + err.message, 'error');
  }
}

async function toggleActivoCurso(curso) {
  const esActivo = curso.activo !== false;
  try {
    if (esActivo) {
      await api.desactivarCurso(curso.id);
      ui.showToast(`Curso #${curso.id} (${curso.nombre}) desactivado del catálogo.`, 'info');
    } else {
      await api.activarCurso(curso.id);
      ui.showToast(`Curso #${curso.id} (${curso.nombre}) activado exitosamente.`, 'success');
    }
    await cargarCursosAdmin();
    await cargarCatalogo();
  } catch (err) {
    ui.showToast('Error al modificar estado del curso: ' + err.message, 'error');
  }
}

// ==========================================================================
// 12. CONSULTA DE ESTUDIANTES Y RESPUESTA ADECUADA CUANDO NO EXISTE (RF 02)
// ==========================================================================
export async function cargarEstudiantesAdmin() {
  try {
    const lista = await api.getEstudiantes();
    state.setEstudiantes(lista);

    const filterInput = document.getElementById('admin-student-table-filter');
    const studentIdInput = document.getElementById('admin-student-id-input');
    const q = filterInput ? filterInput.value.toLowerCase().trim() : '';

    const filtrados = q ? lista.filter(e =>
      (e.nombreCompleto && e.nombreCompleto.toLowerCase().includes(q)) ||
      (e.correoElectronico && e.correoElectronico.toLowerCase().includes(q)) ||
      (e.areaInteres && e.areaInteres.toLowerCase().includes(q))
    ) : lista;

    ui.renderEstudiantesAdmin(filtrados, (est) => {
      if (studentIdInput) studentIdInput.value = est.id;
      inspeccionarEstudianteAdmin(est.id);
    });
  } catch (err) {
    ui.showToast('Error al listar estudiantes: ' + err.message, 'error');
  }
}

export async function inspeccionarEstudianteAdmin(id) {
  const searchBtn = document.getElementById('btn-search-student-id');
  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<span>Consultando...</span>';
  }

  try {
    const estudiante = await api.getEstudiante(id);
    let historial = [];
    try {
      historial = await api.getHistorial(id);
    } catch (e) {
      console.warn('Historial no disponible:', e.message);
    }

    ui.renderFichaEstudianteAdmin(estudiante, historial, () => {
      const inp = document.getElementById('admin-student-id-input');
      if (inp) inp.value = '';
    });
    ui.showToast(`Estudiante #${estudiante.id} (${estudiante.nombreCompleto}) cargado correctamente.`, 'success');
  } catch (err) {
    // Responder adecuadamente cuando el estudiante no exista (RF 02)
    ui.renderErrorEstudianteAdmin(id, err.message);
    ui.showToast(`Estudiante no encontrado con ID #${id}.`, 'error');
  } finally {
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.innerHTML = '<span>Consultar por ID</span><span class="btn-arrow">➔</span>';
    }
  }
}

