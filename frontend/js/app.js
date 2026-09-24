/**
 * RutaIA - Controlador Principal de la Aplicación Frontend
 * Concepto: Editorial Learning Lab
 */

import { api } from './api.js';
import { state } from './state.js';
import { ui } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Obtener y validar sesión activa directamente desde Redis (vía HttpOnly Cookie)
  try {
    const sesion = await api.getSesion();
    if (sesion && (sesion.email || sesion.id !== undefined)) {
      state.setUsuario(sesion);
      if (sesion.activeStudentId) {
        state.usuario.activeStudentId = sesion.activeStudentId;
      }
    } else {
      window.location.replace('login.html');
      return;
    }
  } catch (err) {
    console.warn('Error validando sesión activa en Redis:', err);
    window.location.replace('login.html');
    return;
  }

  if (state.usuario) {
    ui.renderUsuarioHeader(state.usuario);
  }

  window.navegarACatalogo = () => cambiarVista('catalogo');

  initNavigation();
  initMobileNavigation();
  initPastelTiles();
  initTestChips();
  initQueryForm();
  initChatControls();
  initScrollBottomButton();
  initCatalogFilters();
  initStudentModal();
  initQuickSearch();
  initAuthModal();
  initAdminPanel();
  initDocentePanel();
  initRegisterView();

  ui.renderChatSession(state.chatSession, onCalificarHandler);

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

  // Botón Cerrar Sesión — muestra modal de confirmación
  const btnLogout = document.getElementById('btn-logout');
  const logoutModal = document.getElementById('logout-confirm-modal');
  const btnLogoutConfirm = document.getElementById('btn-logout-confirm');
  const btnLogoutCancel = document.getElementById('btn-logout-cancel');

  const doLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn('Error durante logout:', e);
    }
    window.location.href = 'login.html?logout=true';
  };

  if (btnLogout && logoutModal) {
    btnLogout.addEventListener('click', () => {
      logoutModal.style.display = 'flex';
    });
  }
  if (btnLogoutConfirm) {
    btnLogoutConfirm.addEventListener('click', doLogout);
  }
  if (btnLogoutCancel && logoutModal) {
    btnLogoutCancel.addEventListener('click', () => {
      logoutModal.style.display = 'none';
    });
  }
}

// Navegación Móvil (Drawer y Backdrop)
function initMobileNavigation() {
  const btnMenu = document.getElementById('btn-mobile-menu');
  const btnClose = document.getElementById('btn-close-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const sidebar = document.getElementById('app-sidebar');

  const openDrawer = () => {
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  };

  const closeDrawer = () => {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  };

  if (btnMenu) btnMenu.addEventListener('click', openDrawer);
  if (btnClose) btnClose.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // Cerrar el drawer al seleccionar una opción de navegación en móviles
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeDrawer();
      }
    });
  });
}

// Inicialización de la Vista de Registro de Estudiantes
function initRegisterView() {
  const form = document.getElementById('view-student-register-form');
  const btnGoToQuery = document.getElementById('btn-go-to-query-from-reg');

  if (btnGoToQuery) {
    btnGoToQuery.addEventListener('click', () => {
      cambiarVista('asesor');
      const input = document.getElementById('query-input');
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombreInput = document.getElementById('view-reg-nombre');
      const correoInput = document.getElementById('view-reg-correo');
      const nivelSelect = document.getElementById('view-reg-nivel');
      const areaInput = document.getElementById('view-reg-area');

      const errNombre = document.getElementById('view-reg-nombre-error');
      const errCorreo = document.getElementById('view-reg-correo-error');
      const errArea = document.getElementById('view-reg-area-error');

      if (errNombre) errNombre.textContent = '';
      if (errCorreo) errCorreo.textContent = '';
      if (errArea) errArea.textContent = '';

      const nombre = (nombreInput ? nombreInput.value : '').trim();
      const correo = (correoInput ? correoInput.value : '').trim();
      const nivel = nivelSelect ? nivelSelect.value : 'Intermedio';
      const area = (areaInput ? areaInput.value : '').trim();

      let hasError = false;
      if (!nombre) {
        if (errNombre) errNombre.textContent = 'El nombre completo es obligatorio.';
        hasError = true;
      }
      if (!correo || !correo.includes('@')) {
        if (errCorreo) errCorreo.textContent = 'Ingresa un correo institucional válido.';
        hasError = true;
      }
      if (!area) {
        if (errArea) errArea.textContent = 'El área de interés es obligatoria.';
        hasError = true;
      }

      if (hasError) return;

      const submitBtn = document.getElementById('btn-submit-student-register');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Registrando estudiante...</span>';
      }

      try {
        const nuevoEstudiante = await api.registrarEstudiante({
          nombreCompleto: nombre,
          correoElectronico: correo,
          nivelExperiencia: nivel,
          areaInteres: area
        });

        ui.showToast(`¡Estudiante ${nuevoEstudiante.nombreCompleto} registrado exitosamente!`, 'success');

        // Actualizar estado global
        const actualizados = [...(state.estudiantes || []), nuevoEstudiante];
        state.setEstudiantes(actualizados);
        state.setEstudianteActivo(nuevoEstudiante);

        // Actualizar interfaz reactiva
        ui.renderEstudianteActivo(nuevoEstudiante);
        cargarVistaRegistro();

        form.reset();
        if (nivelSelect) nivelSelect.value = 'Intermedio';
        if (areaInput) areaInput.value = 'Inteligencia Artificial';
      } catch (err) {
        ui.showToast(err.message || 'Error al registrar estudiante.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Completar Registro de Estudiante</span><span class="btn-arrow">➔</span>';
        }
      }
    });
  }
}

export function cargarVistaRegistro() {
  ui.renderVistaRegistro(state.estudianteActivo, state.estudiantes, (estudianteSeleccionado) => {
    state.setEstudianteActivo(estudianteSeleccionado);
    ui.renderEstudianteActivo(estudianteSeleccionado);
    cargarVistaRegistro();
    ui.showToast(`Perfil activo cambiado a: ${estudianteSeleccionado.nombreCompleto}`, 'info');
  });
}

export function cambiarVista(viewId) {
  // Proteger vista admin, metricas y auditoría exclusiva para Administrador y Superadmin
  if ((viewId === 'admin' || viewId === 'metricas' || viewId === 'auditoria') && (!state.usuario || (state.usuario.rol !== 'ADMINISTRADOR' && state.usuario.rol !== 'SUPERADMIN'))) {
    ui.showToast('Acceso restringido: Esta vista es exclusiva para Administradores y Superadministradores.', 'error');
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

  if (viewId === 'registro') cargarVistaRegistro();
  if (viewId === 'catalogo') cargarCatalogo();
  if (viewId === 'historial') cargarHistorial();
  if (viewId === 'estadisticas') cargarEstadisticas();
  if (viewId === 'admin') {
    cargarCursosAdmin();
    cargarEstudiantesAdmin();
    cargarUmbralAdmin();
    cargarUsuariosAdmin();
  }
  if (viewId === 'metricas') {
    cargarEstadisticasAdmin();
  }
  if (viewId === 'auditoria') {
    cargarEstadisticasAdmin();
  }
  if (viewId === 'docente') {
    cargarPanelDocente();
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
  const textareaWelcome = document.getElementById('query-input-welcome');
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
      if (query) {
        if (textarea) textarea.value = query;
        if (textareaWelcome) textareaWelcome.value = query;
        ejecutarConsulta(query);
      }
    });
  });
}

// 4. Formulario de Consulta Inteligente (RF 06)
function initQueryForm() {
  const submitBtn = document.getElementById('submit-query-btn');
  const textarea = document.getElementById('query-input');

  const submitWelcomeBtn = document.getElementById('submit-query-welcome-btn');
  const textareaWelcome = document.getElementById('query-input-welcome');

  const autoResize = (el, minH = 24, maxH = 200) => {
    if (!el) return;
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    if (scrollH > maxH) {
      el.style.height = `${maxH}px`;
      el.style.overflowY = 'auto';
    } else {
      el.style.height = `${Math.max(scrollH, minH)}px`;
      el.style.overflowY = 'hidden';
    }
  };

  if (textarea) {
    textarea.addEventListener('input', () => autoResize(textarea, 24, 200));
    textarea.addEventListener('paste', () => setTimeout(() => autoResize(textarea, 24, 200), 0));
    textarea.addEventListener('cut', () => setTimeout(() => autoResize(textarea, 24, 200), 0));
  }

  if (textareaWelcome) {
    textareaWelcome.addEventListener('input', () => autoResize(textareaWelcome, 52, 220));
    textareaWelcome.addEventListener('paste', () => setTimeout(() => autoResize(textareaWelcome, 52, 220), 0));
    textareaWelcome.addEventListener('cut', () => setTimeout(() => autoResize(textareaWelcome, 52, 220), 0));
  }

  const enviarDesde = (inputEl, btnEl) => {
    if (btnEl && btnEl.disabled) return;
    if (state.chatSession && !state.puedeEnviarMensaje()) return;
    const pregunta = inputEl ? inputEl.value.trim() : '';
    if (inputEl) {
      inputEl.value = '';
      inputEl.style.height = 'auto';
      inputEl.style.overflowY = 'hidden';
    }
    ejecutarConsulta(pregunta);
  };

  if (submitBtn) {
    submitBtn.addEventListener('click', () => enviarDesde(textarea, submitBtn));
  }
  if (textarea) {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarDesde(textarea, submitBtn);
      }
    });
  }

  if (submitWelcomeBtn) {
    submitWelcomeBtn.addEventListener('click', () => enviarDesde(textareaWelcome, submitWelcomeBtn));
  }
  if (textareaWelcome) {
    textareaWelcome.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarDesde(textareaWelcome, submitWelcomeBtn);
      }
    });
  }
}

// Manejador centralizado de calificaciones
const onCalificarHandler = async (recId, puntuacion, comentario) => {
  const resCal = await api.calificarRecomendacion(recId, puntuacion, comentario);
  state.guardarCalificacionEnMensaje(recId, puntuacion, comentario);
  cargarEstadisticas();
  return resCal;
};

// Controles de Sesión de Chat (Reiniciar conversación)
function initChatControls() {
  const resetBtn = document.getElementById('btn-reset-chat');
  const resetBtnFromLimit = document.getElementById('btn-new-chat-from-limit');

  const reiniciarHandler = () => {
    state.reiniciarChat();
    ui.renderChatSession(state.chatSession, onCalificarHandler);
    const textarea = document.getElementById('query-input');
    const textareaWelcome = document.getElementById('query-input-welcome');
    if (textarea) {
      textarea.value = '';
      textarea.style.height = 'auto';
      textarea.style.overflowY = 'hidden';
    }
    if (textareaWelcome) {
      textareaWelcome.value = '';
      textareaWelcome.style.height = 'auto';
      textareaWelcome.style.overflowY = 'hidden';
    }
    ui.showToast('Sesión de conversación reiniciada. ¡Listo para una nueva consulta!', 'info');
  };

  if (resetBtn) resetBtn.addEventListener('click', reiniciarHandler);
  if (resetBtnFromLimit) resetBtnFromLimit.addEventListener('click', reiniciarHandler);
}

// Botón Flotante para Bajar al Último Mensaje
function initScrollBottomButton() {
  const scrollArea = document.getElementById('chat-scroll-area');
  const scrollBtn = document.getElementById('btn-scroll-bottom');
  if (!scrollArea || !scrollBtn) return;

  scrollArea.addEventListener('scroll', () => {
    const distanceToBottom = scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight;
    if (distanceToBottom > 240) {
      scrollBtn.style.display = 'flex';
    } else {
      scrollBtn.style.display = 'none';
    }
  });

  scrollBtn.addEventListener('click', () => {
    scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: 'smooth' });
    scrollBtn.style.display = 'none';
  });
}

async function ejecutarConsulta(pregunta) {
  // Validar si superó el límite de 5 consultas en esta sesión (Ventana deslizante)
  if (!state.puedeEnviarMensaje()) {
    ui.showToast('Has alcanzado el límite de 5 consultas en esta sesión. Inicia una nueva conversación para continuar.', 'warning');
    return;
  }

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

  // Obtener contexto de cursos previos para enriquecer al LLM sin gastar tokens en respuestas largas
  const contexto = state.obtenerContextoCompacto();

  // Agregar turno del estudiante inmediatamente a la interfaz (0 tokens gastados)
  state.agregarMensajeUsuario(pregunta);
  ui.renderChatSession(state.chatSession, onCalificarHandler);

  const textarea = document.getElementById('query-input');
  if (textarea) textarea.value = '';
  const textareaWelcome = document.getElementById('query-input-welcome');
  if (textareaWelcome) textareaWelcome.value = '';

  ui.setLoading(true);

  try {
    const resultado = await api.solicitarRecomendacion(
      state.estudianteActivo.id,
      pregunta,
      contexto.cursosPrevios,
      contexto.contextoPrevio
    );
    state.setUltimaRecomendacion(resultado);
    state.agregarRespuestaIA(resultado);

    ui.renderChatSession(state.chatSession, onCalificarHandler);

    if (resultado.estadoFinal === 'Sin resultados') {
      ui.showToast('No se identificaron cursos del catálogo para esta consulta.', 'info');
    } else {
      ui.showToast('¡Recomendación vocacional generada exitosamente!', 'success');
    }

    // Actualizar historial y estadísticas en segundo plano
    actualizarHistorialesEstudiante();
    cargarEstadisticas();
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
    const searchVal = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase().trim();
    const catVal = (categorySelect ? categorySelect.value : '').toLowerCase().trim();
    const levelVal = (levelSelect ? levelSelect.value : '').toLowerCase().trim();

    let filtrados = state.cursos || [];

    if (catVal) {
      filtrados = filtrados.filter(c => (c.categoria || '').toLowerCase() === catVal);
    }
    if (levelVal) {
      filtrados = filtrados.filter(c => (c.nivel || '').toLowerCase() === levelVal);
    }
    if (searchVal) {
      filtrados = filtrados.filter(c =>
        (c.nombre || '').toLowerCase().includes(searchVal) ||
        (c.descripcion || '').toLowerCase().includes(searchVal) ||
        (c.categoria || '').toLowerCase().includes(searchVal)
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

  window.addEventListener('cambiar-estudiante', (e) => {
    const est = e.detail;
    state.setEstudianteActivo(est);
    ui.renderEstudianteActivo(est);
    ui.renderChatSession(state.chatSession, onCalificarHandler);
    ui.showToast(`Perfil activo: ${est.nombreCompleto}`, 'info');
    if (modal) modal.style.display = 'none';
    actualizarHistorialesEstudiante();
    cargarEstadisticas();
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
  // 1. Cargar catálogo de cursos prioritariamente (ruta pública)
  try {
    const cursos = await api.getCursos();
    state.setCursos(cursos || []);
    poblarCategoriasSelect(cursos || []);
  } catch (err) {
    console.warn('No se pudo precargar cursos:', err.message);
  }

  // 2. Cargar lista de estudiantes y perfil activo
  try {
    const estudiantes = await api.getEstudiantes();
    state.setEstudiantes(estudiantes || []);

    if (state.usuario) {
      ui.renderUsuarioHeader(state.usuario);
    } else if (state.estudianteActivo) {
      ui.renderEstudianteActivo(state.estudianteActivo);
    }

    if (state.estudianteActivo) {
      actualizarHistorialesEstudiante();
    }
  } catch (err) {
    console.warn('Backend aún conectándose a estudiantes:', err.message);
  }
}

function poblarCategoriasSelect(cursos) {
  const select = document.getElementById('catalog-category');
  if (!select || !Array.isArray(cursos)) return;

  const categorias = [...new Set(cursos.map(c => c.categoria).filter(Boolean))].sort();
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
    let cursos = state.cursos;
    if (!cursos || cursos.length === 0) {
      cursos = await api.getCursos();
      state.setCursos(cursos || []);
      poblarCategoriasSelect(cursos || []);
    } else {
      // Refrescar en background para tener siempre los datos más recientes
      api.getCursos().then(nuevos => {
        if (nuevos && nuevos.length > 0) {
          state.setCursos(nuevos);
          poblarCategoriasSelect(nuevos);
        }
      }).catch(e => console.warn('Sync background cursos:', e));
    }
    ui.renderCatalogo(cursos || []);
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

    if (state.esEstudiante()) {
      const inscripciones = await api.getInscripcionesEstudiante(state.estudianteActivo.id);
      state.setInscripciones(inscripciones);
    }
  } catch (err) {
    console.warn('No se pudo actualizar historial o inscripciones:', err.message);
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
    const resCal = await api.calificarRecomendacion(recId, puntuacion, comentario);
    cargarEstadisticas();
    return resCal;
  });
}

let cacheStatsAdmin = null;

async function cargarEstadisticasAdmin() {
  try {
    const data = await api.getEstadisticasAdmin();
    cacheStatsAdmin = data;
    ui.renderEstadisticasAdmin(data);
  } catch (err) {
    console.error('Error al cargar estadísticas admin:', err);
    ui.showToast('Error al cargar estadísticas globales y auditoría: ' + err.message, 'error');
  }
}

async function cargarEstadisticas() {
  try {
    const isAdmin = state.esAdmin();
    const estudianteId = (state.usuario && state.usuario.rol === 'ESTUDIANTE')
      ? (state.usuario.id || (state.estudianteActivo ? state.estudianteActivo.id : null))
      : null;
    const stats = await api.getEstadisticas(isAdmin ? null : estudianteId);
    state.setEstadisticas(stats);
    ui.renderEstadisticas(stats, state.usuario);
    if (isAdmin) {
      cargarEstadisticasAdmin();
    }
  } catch (err) {
    ui.showToast('Error al cargar estadísticas: ' + err.message, 'error');
  }
}

// Utilidad global para volver desde el detalle de historial a la conversación activa
window.volverAlChatActivo = () => {
  cambiarVista('asesor');
  ui.renderChatSession(state.chatSession, onCalificarHandler);
};

// Utilidad global invocada desde tarjetas de curso en el catálogo
window.consultarCursoSemantico = (nombreCurso) => {
  const textarea = document.getElementById('query-input');
  if (textarea) {
    textarea.value = `Quiero información y orientación sobre el curso: ${nombreCurso}`;
    cambiarVista('asesor');
    ejecutarConsulta(textarea.value);
  }
};

// Modal con detalles del curso y matriculación
window.verDetalleCursoModal = (nombreCurso) => {
  const curso = state.cursos.find(c => c.nombre.toLowerCase().trim() === nombreCurso.toLowerCase().trim()) || {
    id: null,
    nombre: nombreCurso,
    categoria: 'Tecnología',
    nivel: 'Intermedio',
    duracionHoras: 40,
    descripcion: 'Formación académica especializada con estándares de la industria, orientada a la adquisición de competencias profesionales.'
  };
  ui.mostrarModalDetalleCurso(curso, handleInscribirmeEnCurso);
};

// Matricular estudiante a un curso (Exclusivo para el rol ESTUDIANTE con confirmación previa)
window.inscribirseACurso = async (cursoId, btnEl) => {
  if (!state.esEstudiante()) {
    ui.showToast('Solo los estudiantes pueden inscribirse a los cursos.', 'warning');
    return;
  }
  let estudianteId = state.estudianteActivo ? state.estudianteActivo.id : (state.usuario ? state.usuario.id : null);
  if (!estudianteId && state.estudiantes && state.estudiantes.length > 0) {
    estudianteId = state.estudiantes[0].id;
  }
  if (!estudianteId) {
    estudianteId = 1;
  }

  const curso = state.cursos.find(c => c.id == cursoId || (c.nombre && String(cursoId) === c.nombre.toLowerCase().trim())) || {
    id: Number(cursoId) || 1,
    nombre: 'Curso Académico'
  };
  const cId = curso.id || Number(cursoId) || 1;
  const cNombre = curso.nombre || 'el curso seleccionado';

  // Mostrar modal de confirmación antes de formalizar la matrícula
  ui.mostrarModalConfirmacionInscripcion(curso, async () => {
    try {
      if (btnEl) {
        btnEl.disabled = true;
        btnEl.dataset.original = btnEl.innerHTML;
        btnEl.innerHTML = `<span>Inscribiendo...</span> <svg class="spin-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>`;
      }
      await api.inscribirCurso(estudianteId, cId);
      state.agregarInscripcion(cId);
      ui.showToast(`Inscripción exitosa: te has matriculado en "${cNombre}".`, 'success');

      const renderEnrolledState = (targetBtn) => {
        if (targetBtn.classList.contains('btn-enroll-mini')) {
          targetBtn.className = 'badge-enrolled-mini';
          targetBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Inscrito</span>
          `;
          targetBtn.disabled = true;
        } else {
          targetBtn.className = 'btn-enrolled-badge';
          targetBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Ya estás inscrito</span>
          `;
          targetBtn.disabled = true;
        }
      };

      if (btnEl) {
        renderEnrolledState(btnEl);
      }

      // Actualizar botones de este curso en todo el DOM
      document.querySelectorAll(`button[data-curso-id="${cId}"], button[onclick*="inscribirseACurso(${cId}"]`).forEach(b => {
        if (b !== btnEl) {
          renderEnrolledState(b);
        }
      });

    } catch (err) {
      ui.showToast(err.message || 'Error al procesar la inscripción.', 'error');
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.innerHTML = btnEl.dataset.original || `<span>Inscribirme</span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>`;
      }
    }
  });
};

// Modal global para calificar un curso
window.abrirModalCalificarCurso = (cursoId, nombreCurso) => {
  let estudianteId = state.estudianteActivo ? state.estudianteActivo.id : (state.usuario ? state.usuario.id : null);
  if (!estudianteId && state.estudiantes && state.estudiantes.length > 0) {
    estudianteId = state.estudiantes[0].id;
  }

  ui.mostrarModalCalificarCurso(cursoId, nombreCurso, async (cId, puntuacion, comentario) => {
    await api.calificarCurso(cId, puntuacion, comentario, estudianteId);
    ui.showToast(`¡Gracias! Has calificado "${nombreCurso}" con ${puntuacion} estrellas.`, 'success');

    // Actualizar cursos en estado local y re-renderizar catálogo
    try {
      const cursosActualizados = await api.getCursos();
      state.cursos = cursosActualizados;
      ui.renderCatalogo(cursosActualizados, state.usuario);
    } catch (e) {
      console.warn('No se pudo refrescar el catálogo tras calificar:', e);
    }
  });
};

async function handleInscribirmeEnCurso(curso, btnEl) {
  const cId = curso ? (curso.id || curso) : null;
  return window.inscribirseACurso(cId, btnEl);
}

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

        if (authData.rol === 'ADMINISTRADOR' || authData.rol === 'SUPERADMIN') {
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
    openNewBtn.addEventListener('click', () => ui.mostrarModalCursoAdmin(null, state.docentes));
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
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
      (curso) => ui.mostrarModalCursoAdmin(curso, state.docentes),
      (curso) => toggleActivoCurso(curso),
      state.docentes
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
      let categoria = document.getElementById('course-form-categoria').value.trim();
      const docenteSelect = document.getElementById('course-form-docente');
      if (!categoria && docenteSelect && docenteSelect.value) {
        categoria = docenteSelect.value.trim();
      }
      const nivel = document.getElementById('course-form-nivel').value;
      const duracionHoras = parseInt(document.getElementById('course-form-duracion').value, 10);
      const prerrequisitos = document.getElementById('course-form-prerrequisitos').value.trim();

      const cursoData = { nombre, descripcion, categoria, nivel, duracionHoras, prerrequisitos };

      try {
        const isDocente = state.usuario && state.usuario.rol === 'DOCENTE';
        if (id) {
          if (isDocente) {
            await api.actualizarDocenteCurso(id, cursoData, state.usuario ? state.usuario.email : null);
          } else {
            await api.actualizarCurso(id, cursoData);
          }
          ui.showToast(`Curso #${id} actualizado correctamente.`, 'success');
        } else {
          if (isDocente) {
            await api.crearDocenteCurso(cursoData, state.usuario ? state.usuario.email : null);
          } else {
            await api.crearCurso(cursoData);
          }
          ui.showToast(`Curso "${nombre}" creado y registrado en el catálogo.`, 'success');
        }

        if (modal) modal.style.display = 'none';
        form.reset();
        if (isDocente) {
          await cargarPanelDocente();
        } else {
          await cargarCursosAdmin();
        }
        await cargarCatalogo();
      } catch (err) {
        ui.showToast('Error al procesar el curso: ' + err.message, 'error');
      }
    });
  }

  // ==========================================================
  // PESTAÑAS SUB-PANEL ADMIN (CURSOS, ESTUDIANTES, CONFIGURACIÓN UMBRAL, USUARIOS)
  // ==========================================================
  const subtabCourses = document.getElementById('subtab-admin-courses');
  const subtabStudents = document.getElementById('subtab-admin-students');
  const subtabConfig = document.getElementById('subtab-admin-config');
  const subtabUsers = document.getElementById('subtab-admin-users');
  const paneCourses = document.getElementById('admin-pane-courses');
  const paneStudents = document.getElementById('admin-pane-students');
  const paneConfig = document.getElementById('admin-pane-config');
  const paneUsers = document.getElementById('admin-pane-users');

  const deactivateAllSubtabs = () => {
    [subtabCourses, subtabStudents, subtabConfig, subtabUsers].forEach(t => t && t.classList.remove('active'));
    [paneCourses, paneStudents, paneConfig, paneUsers].forEach(p => p && (p.style.display = 'none'));
  };

  if (subtabCourses) {
    subtabCourses.addEventListener('click', () => {
      deactivateAllSubtabs();
      subtabCourses.classList.add('active');
      if (paneCourses) paneCourses.style.display = 'block';
      cargarCursosAdmin();
    });
  }
  if (subtabStudents) {
    subtabStudents.addEventListener('click', () => {
      deactivateAllSubtabs();
      subtabStudents.classList.add('active');
      if (paneStudents) paneStudents.style.display = 'block';
      cargarEstudiantesAdmin();
    });
  }
  if (subtabConfig) {
    subtabConfig.addEventListener('click', () => {
      deactivateAllSubtabs();
      subtabConfig.classList.add('active');
      if (paneConfig) paneConfig.style.display = 'block';
      cargarUmbralAdmin();
    });
  }
  if (subtabUsers) {
    subtabUsers.addEventListener('click', () => {
      deactivateAllSubtabs();
      subtabUsers.classList.add('active');
      if (paneUsers) paneUsers.style.display = 'block';
      cargarUsuariosAdmin();
    });
  }

  // Eventos de Gestión de Usuarios y Roles (Superadmin & Administrador)
  const btnOpenNewUser = document.getElementById('btn-open-new-user');
  if (btnOpenNewUser) {
    btnOpenNewUser.addEventListener('click', async () => {
      try {
        const roles = await api.getRolesPermitidos();
        ui.openModalCrearUsuario(roles);
      } catch (e) {
        ui.openModalCrearUsuario(state.esSuperAdmin() ? ['ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'] : ['DOCENTE', 'ESTUDIANTE']);
      }
    });
  }

  const btnCloseUserModal = document.getElementById('btn-close-user-modal');
  const btnCancelUserModal = document.getElementById('btn-cancel-user-modal');
  if (btnCloseUserModal) btnCloseUserModal.addEventListener('click', () => ui.closeModalCrearUsuario());
  if (btnCancelUserModal) btnCancelUserModal.addEventListener('click', () => ui.closeModalCrearUsuario());
  // Selector de Rol dinámico en Crear Usuario
  const selectCreateRol = document.getElementById('user-create-rol');
  if (selectCreateRol) {
    selectCreateRol.addEventListener('change', () => {
      ui.actualizarCamposCrearUsuarioPorRol(selectCreateRol.value);
    });
  }

  // Modales de usuario: se cierran únicamente con botones ✕ o Cancelar
  const userCreateModal = document.getElementById('user-create-modal');
  const userPwdModal = document.getElementById('user-password-modal');

  // Tecla Escape para cerrar modales de usuario
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (userCreateModal && userCreateModal.style.display === 'flex') {
        ui.closeModalCrearUsuario();
      }
      if (userPwdModal && userPwdModal.style.display === 'flex') {
        ui.closeModalPassword();
      }
    }
  });

  // Ojo para mostrar / ocultar contraseñas en los modales de administración
  document.querySelectorAll('.modal-input-pwd-box .btn-toggle-pwd').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      btn.classList.toggle('active', isPwd);
      btn.title = isPwd ? 'Ocultar contraseña' : 'Ver contraseña';
    });
  });

  // Validación reactiva en tiempo real para cambio de contraseña
  const pwdInputNew = document.getElementById('pwd-input-new');
  const pwdInputConfirm = document.getElementById('pwd-input-confirm');
  const pwdMatchHint = document.getElementById('pwd-match-hint');

  function actualizarIndicadorPassword() {
    if (!pwdMatchHint) return;
    const valNew = pwdInputNew ? pwdInputNew.value : '';
    const valConf = pwdInputConfirm ? pwdInputConfirm.value : '';

    if (!valNew && !valConf) {
      pwdMatchHint.className = 'pwd-feedback-hint neutral';
      pwdMatchHint.innerHTML = '<span>Ingresa al menos 6 caracteres</span>';
      return;
    }

    if (valNew.length < 6) {
      pwdMatchHint.className = 'pwd-feedback-hint invalid';
      pwdMatchHint.innerHTML = `<span>Mínimo 6 caracteres (${valNew.length}/6)</span>`;
      return;
    }

    if (!valConf) {
      pwdMatchHint.className = 'pwd-feedback-hint neutral';
      pwdMatchHint.innerHTML = '<span>Escribe la confirmación de la contraseña</span>';
      return;
    }

    if (valNew === valConf) {
      pwdMatchHint.className = 'pwd-feedback-hint valid';
      pwdMatchHint.innerHTML = '<span>✓ Las contraseñas coinciden perfectamente</span>';
    } else {
      pwdMatchHint.className = 'pwd-feedback-hint invalid';
      pwdMatchHint.innerHTML = '<span>✕ Las contraseñas no coinciden aún</span>';
    }
  }

  if (pwdInputNew) pwdInputNew.addEventListener('input', actualizarIndicadorPassword);
  if (pwdInputConfirm) pwdInputConfirm.addEventListener('input', actualizarIndicadorPassword);

  const formCreateUser = document.getElementById('user-create-form');
  if (formCreateUser) {
    formCreateUser.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombreCompleto = document.getElementById('user-create-name').value.trim();
      const correoElectronico = document.getElementById('user-create-email').value.trim();
      const rol = document.getElementById('user-create-rol').value;
      const password = document.getElementById('user-create-password').value;
      const areaInteres = document.getElementById('user-create-area').value.trim();
      const nivelExperiencia = document.getElementById('user-create-nivel').value;
      const departamentoFacultad = document.getElementById('user-create-facultad').value.trim();

      if (!nombreCompleto) {
        ui.showToast('Por favor ingresa el nombre completo del usuario', 'warning');
        document.getElementById('user-create-name').focus();
        return;
      }

      if (!correoElectronico || !correoElectronico.includes('@') || !correoElectronico.includes('.')) {
        ui.showToast('Por favor ingresa un correo electrónico institucional válido', 'warning');
        document.getElementById('user-create-email').focus();
        return;
      }

      if (!password || password.length < 6) {
        ui.showToast('La contraseña debe tener un mínimo de 6 caracteres', 'warning');
        document.getElementById('user-create-password').focus();
        return;
      }

      const saveBtn = document.getElementById('btn-save-user');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span>Guardando usuario...</span>';
      }

      try {
        await api.crearUsuario({
          nombreCompleto,
          correoElectronico,
          password,
          rol,
          areaInteres,
          nivelExperiencia,
          departamentoFacultad
        });
        ui.closeModalCrearUsuario();
        ui.showToast(`Usuario ${correoElectronico} (${rol}) creado exitosamente`, 'success');
        await cargarUsuariosAdmin();
      } catch (err) {
        ui.showToast('Error al crear usuario: ' + err.message, 'error');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<span>Crear Usuario</span><span class="btn-arrow">➔</span>';
        }
      }
    });
  }

  const btnRefreshUsers = document.getElementById('btn-admin-refresh-users');
  if (btnRefreshUsers) {
    btnRefreshUsers.addEventListener('click', () => {
      cargarUsuariosAdmin();
      ui.showToast('Lista de usuarios actualizada', 'info');
    });
  }

  const userFilterInput = document.getElementById('admin-user-filter');
  if (userFilterInput) {
    userFilterInput.addEventListener('input', () => {
      aplicarFiltrosUsuariosAdmin();
    });
  }

  const userRoleFilterSelect = document.getElementById('admin-user-role-filter');
  if (userRoleFilterSelect) {
    userRoleFilterSelect.addEventListener('change', () => {
      aplicarFiltrosUsuariosAdmin();
    });
  }

  // Modales de Contraseña
  const btnClosePwdModal = document.getElementById('btn-close-pwd-modal');
  const btnCancelPwdModal = document.getElementById('btn-cancel-pwd-modal');
  if (btnClosePwdModal) btnClosePwdModal.addEventListener('click', () => ui.closeModalPassword());
  if (btnCancelPwdModal) btnCancelPwdModal.addEventListener('click', () => ui.closeModalPassword());

  const formChangePwd = document.getElementById('user-password-form');
  if (formChangePwd) {
    formChangePwd.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = document.getElementById('pwd-modal-user-id').value;
      const pwdNew = document.getElementById('pwd-input-new').value;
      const pwdConfirm = document.getElementById('pwd-input-confirm').value;

      if (!pwdNew || pwdNew.length < 6) {
        ui.showToast('La nueva contraseña debe tener al menos 6 caracteres.', 'error');
        document.getElementById('pwd-input-new').focus();
        return;
      }

      if (pwdNew !== pwdConfirm) {
        ui.showToast('Las contraseñas no coinciden. Por favor verifícalas.', 'error');
        document.getElementById('pwd-input-confirm').focus();
        return;
      }

      const saveBtn = document.getElementById('btn-save-pwd');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span>Actualizando contraseña...</span>';
      }

      try {
        await api.cambiarPasswordUsuario(userId, pwdNew);
        ui.closeModalPassword();
        ui.showToast('Contraseña de usuario actualizada exitosamente', 'success');
        await cargarUsuariosAdmin();
      } catch (err) {
        ui.showToast('Error al actualizar contraseña: ' + err.message, 'error');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<span>Guardar Contraseña</span><span class="btn-arrow">➔</span>';
        }
      }
    });
  }

  // Eventos para filtros y refresco de estadísticas globales y auditoría
  const btnRefreshStats = document.getElementById('btn-admin-refresh-stats');
  if (btnRefreshStats) {
    btnRefreshStats.addEventListener('click', () => {
      cargarEstadisticasAdmin();
      ui.showToast('Métricas globales actualizadas', 'info');
    });
  }

  const btnRefreshAudit = document.getElementById('btn-admin-refresh-audit');
  if (btnRefreshAudit) {
    btnRefreshAudit.addEventListener('click', () => {
      cargarEstadisticasAdmin();
      ui.showToast('Bitácora de auditoría actualizada', 'info');
    });
  }

  const userActionsFilter = document.getElementById('admin-user-actions-filter');
  if (userActionsFilter) {
    userActionsFilter.addEventListener('input', () => {
      if (cacheStatsAdmin) ui.renderEstadisticasAdmin(cacheStatsAdmin);
    });
  }

  const auditSearch = document.getElementById('admin-audit-search');
  if (auditSearch) {
    auditSearch.addEventListener('input', () => {
      if (cacheStatsAdmin) ui.renderTablaAuditoria(cacheStatsAdmin.auditoria || []);
    });
  }

  const auditTypeFilter = document.getElementById('admin-audit-type-filter');
  if (auditTypeFilter) {
    auditTypeFilter.addEventListener('change', () => {
      if (cacheStatsAdmin) ui.renderTablaAuditoria(cacheStatsAdmin.auditoria || []);
    });
  }

  // Sincronización del Slider e Input Numérico de Umbral
  const thresholdSlider = document.getElementById('admin-threshold-slider');
  const thresholdNumberInput = document.getElementById('admin-threshold-number-input');
  const thresholdForm = document.getElementById('admin-threshold-form');

  if (thresholdSlider && thresholdNumberInput) {
    thresholdSlider.addEventListener('input', () => {
      thresholdNumberInput.value = thresholdSlider.value;
      actualizarEtiquetaVisualUmbral(parseFloat(thresholdSlider.value));
    });
    thresholdNumberInput.addEventListener('input', () => {
      thresholdSlider.value = thresholdNumberInput.value;
      actualizarEtiquetaVisualUmbral(parseFloat(thresholdNumberInput.value) || 0);
    });
  }

  if (thresholdForm) {
    thresholdForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = parseFloat(thresholdNumberInput ? thresholdNumberInput.value : '40');
      if (isNaN(val) || val < 0 || val > 100) {
        ui.showToast('Por favor ingresa un porcentaje válido entre 0% y 100%.', 'error');
        return;
      }
      try {
        const res = await api.actualizarUmbral(val);
        actualizarUIUmbral(res);
        ui.showToast(`Configuración guardada: Umbral RAG establecido en ${res.porcentaje}% (${res.valorDecimal}).`, 'success');
      } catch (err) {
        ui.showToast('Error al guardar configuración de umbral: ' + err.message, 'error');
      }
    });
  }

  // Búsqueda General por Nombre o Correo de Estudiante (RF 02)
  const studentSearchForm = document.getElementById('admin-student-search-form');
  const studentNameInput = document.getElementById('admin-student-name-input');
  if (studentSearchForm) {
    studentSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = studentNameInput ? studentNameInput.value.trim() : '';
      if (!val) {
        ui.showToast('Por favor ingresa un nombre o correo para consultar.', 'error');
        return;
      }
      inspeccionarEstudiantePorNombreAdmin(val);
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
        if (studentNameInput) studentNameInput.value = est.nombreCompleto;
        inspeccionarEstudianteAdmin(est.id);
      });
    });
  }
}

async function cargarCursosAdmin() {
  try {
    const [cursos, docentes] = await Promise.all([
      api.getCursosAdmin(),
      api.getDocentes().catch(err => {
        console.warn('No se pudieron obtener docentes para cátedras:', err);
        return [];
      })
    ]);
    state.setCursosAdmin(cursos);
    state.setDocentes(docentes);
    ui.renderCursosAdmin(
      cursos,
      (curso) => ui.mostrarModalCursoAdmin(curso, state.docentes),
      (curso) => toggleActivoCurso(curso),
      state.docentes
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
// 11b. GESTIÓN DE USUARIOS Y ROLES (SUPERADMIN & ADMINISTRADOR)
// ==========================================================================
let cacheUsuariosAdmin = [];

export async function cargarUsuariosAdmin() {
  try {
    const [usuarios, cursos] = await Promise.all([
      api.getUsuarios(),
      api.getCursosAdmin().catch(() => state.cursosAdmin || [])
    ]);
    cacheUsuariosAdmin = usuarios || [];
    if (cursos && cursos.length > 0) {
      state.setCursosAdmin(cursos);
    }
    aplicarFiltrosUsuariosAdmin();
  } catch (err) {
    console.error('Error al cargar usuarios:', err);
    ui.showToast('Error al cargar usuarios: ' + err.message, 'error');
  }
}

export function aplicarFiltrosUsuariosAdmin() {
  const filterInput = document.getElementById('admin-user-filter');
  const roleSelect = document.getElementById('admin-user-role-filter');

  const q = filterInput ? filterInput.value.toLowerCase().trim() : '';
  const rolFilter = roleSelect ? roleSelect.value : 'todos';

  let filtrados = cacheUsuariosAdmin || [];

  // Si no es Superadmin (es decir, es Administrador), solo se le enlisten Docentes y Estudiantes
  if (!state.esSuperAdmin()) {
    filtrados = filtrados.filter(u => {
      const r = (u.rol || '').toUpperCase();
      return r === 'DOCENTE' || r === 'ESTUDIANTE';
    });
  }

  if (rolFilter !== 'todos') {
    filtrados = filtrados.filter(u => (u.rol || '').toUpperCase() === rolFilter.toUpperCase());
  }

  if (q) {
    filtrados = filtrados.filter(u =>
      (u.nombreCompleto && u.nombreCompleto.toLowerCase().includes(q)) ||
      (u.correoElectronico && u.correoElectronico.toLowerCase().includes(q)) ||
      (u.rol && u.rol.toLowerCase().includes(q)) ||
      (u.areaInteres && u.areaInteres.toLowerCase().includes(q)) ||
      (u.departamentoFacultad && u.departamentoFacultad.toLowerCase().includes(q))
    );
  }

  const currentRole = state.usuario ? (state.usuario.rol || '').toUpperCase() : 'ADMINISTRADOR';

  ui.renderUsuariosAdmin(
    filtrados,
    (usuario) => {
      if ((usuario.rol === 'SUPERADMIN' || usuario.rol === 'ADMINISTRADOR') && !state.esSuperAdmin()) {
        ui.showToast('Un Administrador solo puede configurar contraseñas de Docentes y Estudiantes.', 'error');
        return;
      }
      ui.openModalPassword(usuario);
    },
    currentRole,
    state.cursosAdmin,
    (docente, cursosAsignados) => {
      ui.mostrarModalCursosDocenteAdmin(docente, cursosAsignados);
    }
  );
}

// ==========================================================================
// 12. CONSULTA DE ESTUDIANTES Y RESPUESTA ADECUADA CUANDO NO EXISTE (RF 02)
// ==========================================================================
export async function cargarEstudiantesAdmin() {
  try {
    const lista = await api.getEstudiantes();
    state.setEstudiantes(lista);

    const filterInput = document.getElementById('admin-student-table-filter');
    const studentNameInput = document.getElementById('admin-student-name-input');
    const q = filterInput ? filterInput.value.toLowerCase().trim() : '';

    const filtrados = q ? lista.filter(e =>
      (e.nombreCompleto && e.nombreCompleto.toLowerCase().includes(q)) ||
      (e.correoElectronico && e.correoElectronico.toLowerCase().includes(q)) ||
      (e.areaInteres && e.areaInteres.toLowerCase().includes(q))
    ) : lista;

    ui.renderEstudiantesAdmin(filtrados, (est) => {
      if (studentNameInput) studentNameInput.value = est.nombreCompleto;
      inspeccionarEstudianteAdmin(est.id);
    });
  } catch (err) {
    ui.showToast('Error al listar estudiantes: ' + err.message, 'error');
  }
}

export async function inspeccionarEstudiantePorNombreAdmin(query) {
  const searchBtn = document.getElementById('btn-search-student-name');
  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<span>Buscando...</span>';
  }

  try {
    let resultados = [];
    try {
      resultados = await api.buscarEstudiantes(query);
    } catch (e) {
      console.warn('Fallback a filtrado en memoria:', e.message);
      const qLower = query.toLowerCase();
      resultados = (state.estudiantes || []).filter(e =>
        (e.nombreCompleto && e.nombreCompleto.toLowerCase().includes(qLower)) ||
        (e.correoElectronico && e.correoElectronico.toLowerCase().includes(qLower))
      );
    }

    if (!resultados || resultados.length === 0) {
      ui.renderErrorEstudianteAdmin(query, 'No existen registros con el nombre o correo ingresado.');
      ui.showToast(`No se encontraron estudiantes para "${query}".`, 'error');
      return;
    }

    if (resultados.length === 1) {
      await inspeccionarEstudianteAdmin(resultados[0].id);
    } else {
      ui.renderResultadosBusquedaEstudiantesAdmin(query, resultados, async (est) => {
        await inspeccionarEstudianteAdmin(est.id);
      });
      ui.showToast(`Se encontraron ${resultados.length} coincidencias para "${query}".`, 'info');
    }
  } catch (err) {
    ui.renderErrorEstudianteAdmin(query, err.message);
    ui.showToast(`Error al consultar estudiantes: ${err.message}`, 'error');
  } finally {
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.innerHTML = '<span>Consultar por Nombre</span><span class="btn-arrow">➔</span>';
    }
  }
}

export async function inspeccionarEstudianteAdmin(id) {
  try {
    const estudiante = await api.getEstudiante(id);
    let historial = [];
    try {
      historial = await api.getHistorial(id);
    } catch (e) {
      console.warn('Historial no disponible:', e.message);
    }

    ui.renderFichaEstudianteAdmin(estudiante, historial, () => {
      const inp = document.getElementById('admin-student-name-input');
      if (inp) inp.value = '';
    });
  } catch (err) {
    ui.renderErrorEstudianteAdmin(`ID #${id}`, err.message);
    ui.showToast(`Estudiante no encontrado con ID #${id}.`, 'error');
  }
}

export async function cargarUmbralAdmin() {
  try {
    const data = await api.getUmbral();
    actualizarUIUmbral(data);
  } catch (err) {
    console.warn('Error al obtener umbral RAG:', err.message);
  }
}

function actualizarUIUmbral(data) {
  const displayVal = document.getElementById('admin-umbral-display-value');
  const decimalVal = document.getElementById('admin-umbral-decimal-value');
  const slider = document.getElementById('admin-threshold-slider');
  const numInp = document.getElementById('admin-threshold-number-input');

  if (displayVal) displayVal.textContent = `${data.porcentaje}%`;
  if (decimalVal) decimalVal.textContent = `(${data.valorDecimal})`;
  if (slider) slider.value = data.porcentaje;
  if (numInp) numInp.value = data.porcentaje;

  actualizarEtiquetaVisualUmbral(data.porcentaje);
}

function actualizarEtiquetaVisualUmbral(pct) {
  const badgeStatus = document.getElementById('admin-umbral-badge-status');
  if (!badgeStatus) return;

  if (pct < 35.0) {
    badgeStatus.textContent = 'Alta Cobertura / Flexible';
    badgeStatus.className = 'status-pill sin-resultados';
    badgeStatus.style.background = '#DBEAFE';
    badgeStatus.style.color = '#1E40AF';
  } else if (pct <= 65.0) {
    badgeStatus.textContent = 'Equilibrado (Recomendado)';
    badgeStatus.className = 'status-pill respondida';
    badgeStatus.style.background = '#DCFCE7';
    badgeStatus.style.color = '#166534';
  } else {
    badgeStatus.textContent = 'Exigente / Estricto';
    badgeStatus.className = 'status-pill';
    badgeStatus.style.background = '#FEF3C7';
    badgeStatus.style.color = '#92400E';
  }
}

// ==========================================================================
// 13. PANEL DOCENTE: GESTIÓN DE ESPECIALIDAD, FEEDBACK Y ANALÍTICAS
// ==========================================================================
function initDocentePanel() {
  const openNewBtn = document.getElementById('btn-open-docente-new-course');
  const subtabCourses = document.getElementById('subtab-docente-courses');
  const subtabFeedback = document.getElementById('subtab-docente-feedback');
  const subtabStats = document.getElementById('subtab-docente-stats');
  const subtabStudents = document.getElementById('subtab-docente-students');

  const paneCourses = document.getElementById('docente-pane-courses');
  const paneFeedback = document.getElementById('docente-pane-feedback');
  const paneStats = document.getElementById('docente-pane-stats');
  const paneStudents = document.getElementById('docente-pane-students');

  const switchDocenteTab = (targetTab) => {
    if (subtabCourses) subtabCourses.classList.toggle('active', targetTab === 'courses');
    if (subtabFeedback) subtabFeedback.classList.toggle('active', targetTab === 'feedback');
    if (subtabStats) subtabStats.classList.toggle('active', targetTab === 'stats');
    if (subtabStudents) subtabStudents.classList.toggle('active', targetTab === 'students');

    if (paneCourses) paneCourses.style.display = (targetTab === 'courses') ? 'block' : 'none';
    if (paneFeedback) paneFeedback.style.display = (targetTab === 'feedback') ? 'block' : 'none';
    if (paneStats) paneStats.style.display = (targetTab === 'stats') ? 'block' : 'none';
    if (paneStudents) paneStudents.style.display = (targetTab === 'students') ? 'block' : 'none';

    if (targetTab === 'students') {
      cargarEstudiantesDocente();
    }
  };

  if (subtabCourses) subtabCourses.addEventListener('click', () => switchDocenteTab('courses'));
  if (subtabFeedback) subtabFeedback.addEventListener('click', () => switchDocenteTab('feedback'));
  if (subtabStats) subtabStats.addEventListener('click', () => switchDocenteTab('stats'));
  if (subtabStudents) subtabStudents.addEventListener('click', () => switchDocenteTab('students'));

  if (openNewBtn) {
    openNewBtn.addEventListener('click', () => {
      const area = state.docentePerfil ? state.docentePerfil.areaEspecialidad : (state.usuario ? state.usuario.area : 'Programación');
      abrirModalCursoDocente(null, area);
    });
  }

  // Búsqueda de Estudiante de tus Cursos por Nombre o Correo
  const studentSearchForm = document.getElementById('docente-student-search-form');
  const studentNameInput = document.getElementById('docente-student-name-input');
  if (studentSearchForm) {
    studentSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = studentNameInput ? studentNameInput.value.trim() : '';
      if (!val) {
        ui.showToast('Por favor ingresa un nombre o correo para consultar.', 'error');
        return;
      }
      inspeccionarEstudiantePorNombreDocente(val);
    });
  }

  // Botón Refrescar Lista de Estudiantes del Docente
  const refreshStudentsBtn = document.getElementById('btn-docente-refresh-students');
  if (refreshStudentsBtn) {
    refreshStudentsBtn.addEventListener('click', () => {
      cargarEstudiantesDocente();
      ui.showToast('Lista de estudiantes de tu cátedra actualizada.', 'info');
    });
  }

  // Filtrado en vivo de Estudiantes en tabla del Docente
  const studentFilterInput = document.getElementById('docente-student-table-filter');
  if (studentFilterInput) {
    studentFilterInput.addEventListener('input', () => {
      const q = studentFilterInput.value.toLowerCase().trim();
      const filtrados = (state.estudiantesDocente || []).filter(est => {
        return !q ||
          (est.nombreCompleto && est.nombreCompleto.toLowerCase().includes(q)) ||
          (est.correoElectronico && est.correoElectronico.toLowerCase().includes(q)) ||
          (est.nivelExperiencia && est.nivelExperiencia.toLowerCase().includes(q)) ||
          (est.cursosInscritos && est.cursosInscritos.some(c => c.toLowerCase().includes(q))) ||
          String(est.id) === q;
      });
      ui.renderDocenteEstudiantes(filtrados, (est) => {
        if (studentNameInput) studentNameInput.value = est.nombreCompleto;
        inspeccionarEstudianteDocente(est.id);
      });
    });
  }
}

function abrirModalCursoDocente(curso = null, areaEspecialidad = 'Programación') {
  const modal = document.getElementById('course-modal');
  const title = document.getElementById('course-modal-title');
  const subtitle = document.getElementById('course-modal-subtitle');
  const form = document.getElementById('course-admin-form');
  const catInput = document.getElementById('course-form-categoria');
  const docenteGroup = document.getElementById('course-form-docente-group');

  if (!modal || !form) return;
  form.reset();
  if (docenteGroup) docenteGroup.style.display = 'none';

  const area = areaEspecialidad || (state.docentePerfil ? state.docentePerfil.areaEspecialidad : 'Programación');

  if (curso) {
    if (title) title.textContent = `Editar Asignatura: ${curso.nombre}`;
    if (subtitle) subtitle.textContent = `Actualiza las competencias y prerrequisitos dentro de tu cátedra (${area}):`;
    document.getElementById('course-form-id').value = curso.id;
    document.getElementById('course-form-nombre').value = curso.nombre || '';
    document.getElementById('course-form-descripcion').value = curso.descripcion || '';
    if (catInput) {
      catInput.value = area;
      catInput.readOnly = true;
    }
    document.getElementById('course-form-nivel').value = (curso.nivel === 'Básico' ? 'Principiante' : curso.nivel) || 'Intermedio';
    document.getElementById('course-form-duracion').value = curso.duracionHoras || 40;
    document.getElementById('course-form-prerrequisitos').value = curso.prerrequisitos || '';
  } else {
    if (title) title.textContent = `Registrar Nueva Asignatura en ${area}`;
    if (subtitle) subtitle.textContent = `Define los contenidos curriculares y prerrequisitos de tu especialidad:`;
    document.getElementById('course-form-id').value = '';
    if (catInput) {
      catInput.value = area;
      catInput.readOnly = true;
    }
    document.getElementById('course-form-nivel').value = 'Principiante';
    document.getElementById('course-form-duracion').value = 40;
  }

  modal.style.display = 'flex';
}

async function toggleActivoDocenteCurso(id, activar) {
  try {
    const email = state.usuario ? state.usuario.email : null;
    if (activar) {
      await api.activarDocenteCurso(id, email);
      ui.showToast('Curso reactivado y vector reindexado en Qdrant.', 'success');
    } else {
      await api.desactivarDocenteCurso(id, email);
      ui.showToast('Curso desactivado y vector removido de Qdrant.', 'info');
    }
    await cargarPanelDocente();
    await cargarCatalogo();
  } catch (err) {
    ui.showToast('Error al cambiar estado del curso: ' + err.message, 'error');
  }
}

async function cargarPanelDocente() {
  try {
    const email = state.usuario ? state.usuario.email : null;
    const perfil = await api.getDocentePerfil(email);
    state.setDocentePerfil(perfil);

    const [cursos, feedback, stats] = await Promise.all([
      api.getDocenteCursos(email),
      api.getDocenteFeedback(email),
      api.getDocenteEstadisticas(email)
    ]);

    state.setCursosDocente(cursos);
    state.setDocenteFeedback(feedback);
    state.setDocenteEstadisticas(stats);

    ui.renderDocenteCursos(
      cursos,
      perfil,
      async (curso) => {
        try {
          const currentEmail = state.usuario ? state.usuario.email : null;
          const inscritos = await api.getDocenteInscritosCurso(curso.id, currentEmail);
          ui.mostrarModalInscritosDocente(curso, inscritos);
        } catch (err) {
          ui.showToast('Error al consultar inscritos: ' + err.message, 'error');
        }
      }
    );
    ui.renderDocenteFeedback(feedback);
    ui.renderDocenteEstadisticas(stats);
    await cargarEstudiantesDocente();
  } catch (err) {
    ui.showToast('Error al cargar panel docente: ' + err.message, 'error');
  }
}

export async function cargarEstudiantesDocente() {
  try {
    const email = state.usuario ? state.usuario.email : null;
    const lista = await api.getDocenteEstudiantes(email);
    state.setEstudiantesDocente(lista);

    const filterInput = document.getElementById('docente-student-table-filter');
    const studentNameInput = document.getElementById('docente-student-name-input');
    const q = filterInput ? filterInput.value.toLowerCase().trim() : '';

    const filtrados = q ? lista.filter(e =>
      (e.nombreCompleto && e.nombreCompleto.toLowerCase().includes(q)) ||
      (e.correoElectronico && e.correoElectronico.toLowerCase().includes(q)) ||
      (e.cursosInscritos && e.cursosInscritos.some(c => c.toLowerCase().includes(q))) ||
      (e.nivelExperiencia && e.nivelExperiencia.toLowerCase().includes(q))
    ) : lista;

    ui.renderDocenteEstudiantes(filtrados, (est) => {
      if (studentNameInput) studentNameInput.value = est.nombreCompleto;
      inspeccionarEstudianteDocente(est.id);
    });
  } catch (err) {
    console.warn('Error al listar estudiantes de cátedra docente:', err.message);
  }
}

export async function inspeccionarEstudiantePorNombreDocente(query) {
  const searchBtn = document.getElementById('btn-search-docente-student');
  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<span>Buscando...</span>';
  }

  try {
    const email = state.usuario ? state.usuario.email : null;
    let resultados = [];
    try {
      resultados = await api.buscarDocenteEstudiantes(query, email);
    } catch (e) {
      console.warn('Fallback a filtrado local en cátedra:', e.message);
      const qLower = query.toLowerCase();
      resultados = (state.estudiantesDocente || []).filter(e =>
        (e.nombreCompleto && e.nombreCompleto.toLowerCase().includes(qLower)) ||
        (e.correoElectronico && e.correoElectronico.toLowerCase().includes(qLower))
      );
    }

    if (!resultados || resultados.length === 0) {
      ui.renderErrorEstudianteDocente(query, 'No tienes estudiantes matriculados en tus cursos con ese nombre o correo.');
      ui.showToast(`No se encontraron estudiantes en tus asignaturas para "${query}".`, 'error');
      return;
    }

    if (resultados.length === 1) {
      await inspeccionarEstudianteDocente(resultados[0].id);
    } else {
      ui.renderResultadosBusquedaEstudiantesDocente(query, resultados, async (est) => {
        await inspeccionarEstudianteDocente(est.id);
      });
      ui.showToast(`Se encontraron ${resultados.length} coincidencias en tu cátedra para "${query}".`, 'info');
    }
  } catch (err) {
    ui.renderErrorEstudianteDocente(query, err.message);
    ui.showToast(`Error al consultar estudiante: ${err.message}`, 'error');
  } finally {
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.innerHTML = '<span>Consultar</span><span class="btn-arrow">➔</span>';
    }
  }
}

export async function inspeccionarEstudianteDocente(id) {
  try {
    const email = state.usuario ? state.usuario.email : null;
    const estudiante = await api.getDocenteEstudiante(id, email);
    let historial = [];
    try {
      historial = await api.getDocenteEstudianteHistorial(id, email);
    } catch (e) {
      console.warn('Historial no disponible:', e.message);
    }

    ui.renderFichaEstudianteDocente(estudiante, historial, () => {
      const inp = document.getElementById('docente-student-name-input');
      if (inp) inp.value = '';
    });
  } catch (err) {
    ui.renderErrorEstudianteDocente(`ID #${id}`, err.message);
    ui.showToast(err.message || `Estudiante no encontrado en tus asignaturas.`, 'error');
  }
}


