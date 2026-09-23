/**
 * RutaIA - Controlador de Interfaz de Usuario (UI) y Renderizado del DOM
 * Concepto: Editorial Learning Lab
 */

import { state } from './state.js';

export const ui = {
  // Notificaciones Toast de alta legibilidad
  showToast(mensaje, tipo = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
      <span style="font-size: 1.1rem; font-weight: bold;">${tipo === 'success' ? '✓' : tipo === 'error' ? '⚠' : 'ℹ'}</span>
      <div style="flex: 1;">${mensaje}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => toast.remove(), 320);
    }, 4500);
  },

  // Estado del Estudiante / Usuario Activo en Barra de Navegación y Widgets
  renderEstudianteActivo(estudiante) {
    const avatarEl = document.getElementById('user-avatar');
    const nameEl = document.getElementById('user-name');
    const badgeEl = document.getElementById('user-role-badge');
    const widgetLevelEl = document.getElementById('profile-widget-level');
    const widgetAreaEl = document.getElementById('profile-widget-area');

    if (!estudiante) {
      if (avatarEl) avatarEl.textContent = '?';
      if (nameEl) nameEl.textContent = 'Sin usuario seleccionado';
      if (badgeEl) {
        badgeEl.textContent = 'Invitado';
        badgeEl.className = 'user-role-badge';
      }
      if (widgetLevelEl) widgetLevelEl.textContent = 'Sin definir';
      if (widgetAreaEl) widgetAreaEl.textContent = 'General';
      return;
    }

    const nombre = estudiante.nombreCompleto || estudiante.nombre || 'Usuario Institucional';
    const initials = nombre
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    if (avatarEl) avatarEl.textContent = initials || 'US';
    const mobileInitials = document.getElementById('mobile-user-initials');
    if (mobileInitials) mobileInitials.textContent = initials || 'US';

    if (nameEl) nameEl.textContent = nombre;

    const rol = (estudiante.rol || 'ESTUDIANTE').toUpperCase();
    if (badgeEl) {
      if (rol === 'ADMINISTRADOR') {
        badgeEl.textContent = 'Administrador';
        badgeEl.className = 'user-role-badge role-badge-admin';
      } else if (rol === 'DOCENTE') {
        badgeEl.textContent = 'Docente';
        badgeEl.className = 'user-role-badge role-badge-docente';
      } else {
        badgeEl.textContent = 'Estudiante';
        badgeEl.className = 'user-role-badge role-badge-student';
      }
    }

    
    // Widgets del perfil en barra lateral / Bento
    if (widgetLevelEl) widgetLevelEl.textContent = estudiante.nivelExperiencia || estudiante.nivel || 'Principiante';
    if (widgetAreaEl) widgetAreaEl.textContent = estudiante.areaInteres || estudiante.area || 'Tecnología';
  },

  renderUsuarioHeader(usuario) {
    this.renderEstudianteActivo(usuario);
    // Ajustar visibilidad o estilo de botones de navegación según rol
    const navAdmin = document.getElementById('nav-admin-item');
    const navDocente = document.getElementById('nav-docente-item');
    if (navAdmin) {
      navAdmin.style.display = (usuario && usuario.rol === 'ADMINISTRADOR') ? 'flex' : 'none';
    }
    if (navDocente) {
      navDocente.style.display = (usuario && usuario.rol === 'DOCENTE') ? 'flex' : 'none';
    }
  },

  // Renderizado dinámico de la Vista Oficial de Registro
  renderVistaRegistro(estudianteActivo, estudiantes, onSeleccionar) {
    // 1. Perfil activo en la vista de registro
    const activeAvatar = document.getElementById('view-reg-active-avatar');
    const activeName = document.getElementById('view-reg-active-name');
    const activeEmail = document.getElementById('view-reg-active-email');
    const activeLevel = document.getElementById('view-reg-active-level');
    const activeArea = document.getElementById('view-reg-active-area');

    if (estudianteActivo) {
      const nombre = estudianteActivo.nombreCompleto || estudianteActivo.nombre || 'Estudiante';
      const initials = nombre
        .split(' ')
        .filter(n => n.length > 0)
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      if (activeAvatar) activeAvatar.textContent = initials || 'ES';
      if (activeName) activeName.textContent = nombre;
      if (activeEmail) activeEmail.textContent = estudianteActivo.correoElectronico || estudianteActivo.email || '-';
      if (activeLevel) activeLevel.textContent = estudianteActivo.nivelExperiencia || estudianteActivo.nivel || 'Principiante';
      if (activeArea) activeArea.textContent = estudianteActivo.areaInteres || estudianteActivo.area || 'General';
    }

    // 2. Directorio de estudiantes
    const listEl = document.getElementById('view-reg-students-list');
    const countEl = document.getElementById('view-reg-students-count');
    if (countEl) countEl.textContent = (estudiantes || []).length;

    if (!listEl) return;
    listEl.innerHTML = '';

    if (!estudiantes || estudiantes.length === 0) {
      listEl.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No hay estudiantes registrados aún.</div>';
      return;
    }

    const activoId = estudianteActivo ? estudianteActivo.id : null;

    estudiantes.forEach(est => {
      const isSelected = est.id === activoId;
      const row = document.createElement('div');
      row.className = `directory-student-row ${isSelected ? 'active' : ''}`;

      row.innerHTML = `
        <div class="directory-student-meta">
          <span class="directory-student-name">${est.nombreCompleto}</span>
          <span class="directory-student-sub">${est.correoElectronico} • ${est.nivelExperiencia}</span>
        </div>
        <button type="button" class="btn-activate-student">
          ${isSelected ? 'Activo ✓' : 'Seleccionar'}
        </button>
      `;

      if (!isSelected && onSeleccionar) {
        row.querySelector('.btn-activate-student').addEventListener('click', () => {
          onSeleccionar(est);
        });
      }

      listEl.appendChild(row);
    });
  },

  // Modal para Seleccionar Estudiante
  renderSelectorEstudiantes(estudiantes, activoId) {
    const listEl = document.getElementById('students-modal-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    if (estudiantes.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No hay estudiantes registrados aún. Puedes registrar uno en la pestaña correspondiente.
        </div>
      `;
      return;
    }

    estudiantes.forEach(est => {
      const isSelected = est.id === activoId;
      const item = document.createElement('div');
      item.className = `modal-student-item ${isSelected ? 'selected' : ''}`;
      
      const initials = est.nombreCompleto.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

      item.innerHTML = `
        <div class="student-avatar-badge">${initials}</div>
        <div class="student-info-meta">
          <div class="student-item-header">
            <span class="student-name">${est.nombreCompleto}</span>
            ${isSelected ? '<span class="status-pill respondida" style="font-size:0.75rem; padding: 0.15rem 0.5rem;">Activo</span>' : ''}
          </div>
          <div class="student-tags">
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-right:3px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              ${est.correoElectronico}
            </span>
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-right:3px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              ${est.nivelExperiencia}
            </span>
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-right:3px;"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
              ${est.areaInteres}
            </span>
          </div>
        </div>
      `;
      item.onclick = () => {
        const event = new CustomEvent('cambiar-estudiante', { detail: est });
        window.dispatchEvent(event);
      };
      listEl.appendChild(item);
    });
  },

  // Indicador de Carga dentro del Chat
  setLoading(isLoading, title = 'Consultando Asesor Vocacional con RAG...', desc = 'Generando embeddings semánticos, recuperando cursos de Qdrant y sintetizando orientación...') {
    const loadingBox = document.getElementById('loading-box');
    const resultBox = document.getElementById('result-card');
    const submitBtn = document.getElementById('submit-query-btn');

    if (loadingBox) {
      loadingBox.style.display = isLoading ? 'inline-flex' : 'none';
      const titleEl = document.getElementById('loading-title');
      const descEl = document.getElementById('loading-desc');
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;

      if (isLoading) {
        const scrollArea = document.getElementById('chat-scroll-area');
        if (scrollArea) {
          setTimeout(() => {
            scrollArea.scrollTop = scrollArea.scrollHeight;
          }, 30);
        }
      }
    }
    if (resultBox && isLoading) {
      resultBox.style.display = 'none';
    }
    if (submitBtn) {
      submitBtn.disabled = isLoading;
    }
  },

  // Helper para escapar HTML seguro
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // Actualizar la barra superior de sesión
  updateChatSessionBar(turnCount, maxTurns) {
    const turnCountEl = document.getElementById('session-turn-count');
    const sessionBadge = document.getElementById('session-badge');
    const limitBanner = document.getElementById('session-limit-banner');
    const queryInput = document.getElementById('query-input');
    const submitBtn = document.getElementById('submit-query-btn');
    const sessionHint = document.getElementById('session-hint');

    if (turnCountEl) {
      turnCountEl.textContent = turnCount;
    }

    const isFull = turnCount >= maxTurns;

    if (sessionBadge) {
      sessionBadge.classList.toggle('badge-full', isFull);
      if (isFull) {
        sessionBadge.innerHTML = `Sesión: <strong>${turnCount}</strong> / ${maxTurns} completada`;
      } else {
        sessionBadge.innerHTML = `Sesión: <strong>${turnCount}</strong> / ${maxTurns} consultas`;
      }
    }

    if (sessionHint) {
      if (isFull) {
        sessionHint.textContent = 'Has alcanzado el límite de 5 consultas en esta sesión.';
      } else if (turnCount > 0) {
        sessionHint.textContent = 'Puedes profundizar o hacer preguntas de seguimiento sobre los cursos anteriores.';
      } else {
        sessionHint.textContent = 'Conversación activa: puedes hacer hasta 5 consultas en esta sesión.';
      }
    }

    if (limitBanner) {
      limitBanner.style.display = isFull ? 'flex' : 'none';
    }

    if (queryInput) {
      queryInput.disabled = isFull;
      if (isFull) {
        queryInput.placeholder = 'Límite de 5 consultas completado. Inicia una nueva conversación para consultar otro tema.';
      } else {
        queryInput.placeholder = 'Escribe tu pregunta o seguimiento aquí...';
      }
    }

    if (submitBtn) {
      submitBtn.disabled = isFull;
    }
  },

  // Renderizar la sesión conversacional completa (Hilo de hasta 5 turnos - natural chat UX)
  renderChatSession(chatSession, onCalificar) {
    this.updateChatSessionBar(chatSession.turnCount, chatSession.maxTurns);

    const welcomeState = document.getElementById('chat-welcome-state');
    const threadContainer = document.getElementById('chat-thread-container');
    const resultCard = document.getElementById('result-card');
    const scrollArea = document.getElementById('chat-scroll-area');

    if (!threadContainer) return;

    if (threadContainer) threadContainer.style.display = 'flex';
    if (resultCard) resultCard.style.display = 'none';

    if (!chatSession.mensajes || chatSession.mensajes.length === 0) {
      if (welcomeState) welcomeState.style.display = 'flex';
      threadContainer.innerHTML = '';
      return;
    }

    if (welcomeState) welcomeState.style.display = 'none';
    if (scrollArea) scrollArea.style.display = 'flex';
    threadContainer.innerHTML = '';

    const turnos = {};
    chatSession.mensajes.forEach(msg => {
      const t = msg.turno || 1;
      if (!turnos[t]) turnos[t] = {};
      if (msg.remitente === 'usuario') {
        turnos[t].usuario = msg;
      } else {
        turnos[t].ia = msg;
      }
    });

    const activeTurnsWithIa = [];

    Object.keys(turnos).sort((a, b) => Number(a) - Number(b)).forEach(turnoKey => {
      const { usuario, ia } = turnos[turnoKey];
      const turnBlock = document.createElement('div');
      turnBlock.className = 'chat-turn-block';
      turnBlock.id = `chat-turn-${turnoKey}`;

      let turnHtml = '';

      if (usuario) {
        const timeStr = usuario.timestamp ? new Date(usuario.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        turnHtml += `
          <div class="chat-turn-header">
            <span class="chat-turn-tag">Consulta ${turnoKey} de ${chatSession.maxTurns}</span>
            <span class="chat-turn-tag">${timeStr}</span>
          </div>
          <div class="chat-user-row">
            <div class="chat-user-bubble">
              <div class="chat-user-meta">
                <strong>Tú</strong>
              </div>
              <div class="chat-user-text">${this.escapeHtml(usuario.texto)}</div>
            </div>
          </div>
        `;
      }

      if (ia) {
        activeTurnsWithIa.push({ turnoKey, ia });
        const estadoLimpio = ia.estadoFinal || 'Respondida';
        const estadoClass = estadoLimpio.toLowerCase().includes('sin') ? 'sin-resultados' : 'respondida';
        const esSinResultados = estadoLimpio.toLowerCase().includes('sin') || !ia.fuentes || ia.fuentes.length === 0;

        turnHtml += `
          <div class="chat-ia-wrapper">
            <div class="chat-ia-bubble-container">
              <div class="chat-ia-bubble-header">
                <div class="chat-ia-brand">
                  <div class="chat-ia-brand-avatar">✦</div>
                  <div class="chat-ia-brand-name">RutaIA Asesor</div>
                </div>
                <span class="status-pill ${estadoClass}">${estadoLimpio}</span>
              </div>
              <div class="chat-ia-text">${this.escapeHtml(ia.texto)}</div>
        `;

        if (esSinResultados) {
          turnHtml += `
            <div class="fallback-bento-card" style="display: flex; margin-bottom: 0.5rem;">
              <div class="fallback-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div class="fallback-content">
                <h4 class="fallback-title">No encontramos cursos específicos</h4>
                <p class="fallback-message">Prueba profundizando en tu interés o explora el catálogo académico general.</p>
              </div>
              <button class="btn-secondary-pill" onclick="window.navegarACatalogo && window.navegarACatalogo()">
                Ver catálogo
              </button>
            </div>
          `;
        } else {
          const topCourse = ia.fuentes[0];
          const simPct = (topCourse.similitud * 100).toFixed(1);
          const matchLabel = simPct >= 70 ? 'Alta coincidencia' : simPct >= 45 ? 'Coincidencia media' : 'Coincidencia exploratoria';

          turnHtml += `
            <div class="featured-course-card" style="margin-bottom: 0.75rem;">
              <div class="featured-course-layout">
                <div class="featured-course-thumb">
                  <div class="thumb-window-bar">
                    <span class="dot-red"></span>
                    <span class="dot-yellow"></span>
                    <span class="dot-green"></span>
                  </div>
                  <div class="thumb-code-lines">
                    <div class="line w-80 code-accent"></div>
                    <div class="line w-60"></div>
                    <div class="line w-90"></div>
                    <div class="line w-40 code-subaccent"></div>
                  </div>
                  <div class="thumb-badge-tag">${this.escapeHtml(topCourse.categoria || 'Curso')}</div>
                </div>

                <div class="featured-course-info">
                  <div class="featured-header-row">
                    <span class="match-pill-green">${matchLabel}</span>
                  </div>
                  <h3 class="course-headline-title">${this.escapeHtml(topCourse.nombre)}</h3>
                  <div class="course-meta-pills">
                    <span>Nivel: <strong>${this.escapeHtml(topCourse.nivel)}</strong></span>
                    <span>Duración: <strong>${topCourse.duracionHoras}h</strong></span>
                    <span>Categoría: <strong>${this.escapeHtml(topCourse.categoria)}</strong></span>
                  </div>
                  <p class="course-short-desc">${this.escapeHtml(topCourse.descripcion)}</p>
                </div>

                <div class="featured-course-actions">
                  <div class="similarity-circle-badge">
                    <span class="similarity-circle-val">${simPct}%</span>
                    <span class="similarity-circle-txt">Similitud</span>
                  </div>
                  <button class="btn-course-details" onclick="window.verDetalleCursoModal('${topCourse.nombre.replace(/'/g, "\\'")}')">
                    Ver detalles →
                  </button>
                </div>
              </div>
            </div>
          `;

          if (ia.fuentes.length > 1) {
            turnHtml += `
              <div class="sources-bento-section" style="margin-bottom: 0.75rem;">
                <div class="sources-section-title">
                  <span>Otras opciones del catálogo</span>
                  <span class="sources-counter">${ia.fuentes.length} cursos</span>
                </div>
                <div class="sources-list">
            `;
            ia.fuentes.slice(1).forEach((f, idx) => {
              const fSim = (f.similitud * 100).toFixed(1);
              turnHtml += `
                <div class="source-item-row">
                  <div class="source-item-left">
                    <div class="source-item-name">${idx + 2}. ${this.escapeHtml(f.nombre)}</div>
                    <div class="source-item-meta">
                      <span>${this.escapeHtml(f.categoria)}</span> • <span>${this.escapeHtml(f.nivel)}</span> • ${f.duracionHoras} hrs
                    </div>
                  </div>
                  <div class="source-item-right">
                    <span class="source-item-sim">${fSim}%</span>
                    <button class="source-item-action" onclick="window.verDetalleCursoModal('${f.nombre.replace(/'/g, "\\'")}')" title="Ver plan de estudios">➔</button>
                  </div>
                </div>
              `;
            });
            turnHtml += `
                </div>
              </div>
            `;
          }
        }

        // Calificación Inline debajo de la respuesta de la IA (RF 17)
        if (ia.calificacionPuntuacion) {
          turnHtml += `
            <div class="chat-inline-rating">
              <div class="chat-rating-confirmed">
                <span>✓ Calificado con ${ia.calificacionPuntuacion} estrellas</span>
                ${ia.calificacionComentario ? `<span style="color:#64748B; font-weight:normal;">• "${this.escapeHtml(ia.calificacionComentario)}"</span>` : ''}
              </div>
            </div>
          `;
        } else if (ia.recomendacionId) {
          turnHtml += `
            <div class="chat-inline-rating" id="chat-rating-turn-${turnoKey}">
              <div class="chat-rating-prompt">
                <span class="chat-rating-label">¿Qué tal te pareció esta recomendación?</span>
                <div class="chat-star-row" id="star-row-turn-${turnoKey}">
                  <button type="button" class="chat-star-btn" data-rating="1" data-turn="${turnoKey}" title="1 estrella">★</button>
                  <button type="button" class="chat-star-btn" data-rating="2" data-turn="${turnoKey}" title="2 estrellas">★</button>
                  <button type="button" class="chat-star-btn" data-rating="3" data-turn="${turnoKey}" title="3 estrellas">★</button>
                  <button type="button" class="chat-star-btn" data-rating="4" data-turn="${turnoKey}" title="4 estrellas">★</button>
                  <button type="button" class="chat-star-btn" data-rating="5" data-turn="${turnoKey}" title="5 estrellas">★</button>
                </div>
              </div>
              <div class="chat-rating-comment-box" id="comment-box-turn-${turnoKey}" style="display: none;">
                <input type="text" class="chat-rating-input" id="rating-input-turn-${turnoKey}" placeholder="Deja un comentario o feedback opcional..." />
                <button type="button" class="chat-rating-submit" id="rating-submit-turn-${turnoKey}">Calificar</button>
              </div>
            </div>
          `;
        }

        turnHtml += `
            </div>
          </div>
        `;
      }

      turnBlock.innerHTML = turnHtml;
      threadContainer.appendChild(turnBlock);
    });

    // Configurar listeners de calificación inline para cada turno interactivo
    activeTurnsWithIa.forEach(({ turnoKey, ia }) => {
      if (!ia.calificacionPuntuacion && ia.recomendacionId) {
        this.setupInlineRatingListeners(turnoKey, ia, onCalificar);
      }
    });

    // Auto-scroll al fondo del área de chat
    if (scrollArea) {
      setTimeout(() => {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }, 50);
    }
  },

  // Helper para listeners de calificación inline en cada turno
  setupInlineRatingListeners(turnoKey, ia, onCalificar) {
    const starRow = document.getElementById(`star-row-turn-${turnoKey}`);
    const commentBox = document.getElementById(`comment-box-turn-${turnoKey}`);
    const inputField = document.getElementById(`rating-input-turn-${turnoKey}`);
    const submitBtn = document.getElementById(`rating-submit-turn-${turnoKey}`);
    const ratingContainer = document.getElementById(`chat-rating-turn-${turnoKey}`);

    if (!starRow || !ratingContainer) return;

    let selectedRating = 0;
    const starBtns = starRow.querySelectorAll('.chat-star-btn');

    starBtns.forEach(btn => {
      const r = parseInt(btn.dataset.rating, 10);
      btn.addEventListener('mouseenter', () => {
        starBtns.forEach(s => {
          s.classList.toggle('hovered', parseInt(s.dataset.rating, 10) <= r);
        });
      });
      btn.addEventListener('mouseleave', () => {
        starBtns.forEach(s => {
          s.classList.remove('hovered');
        });
      });
      btn.addEventListener('click', () => {
        selectedRating = r;
        starBtns.forEach(s => {
          s.classList.toggle('selected', parseInt(s.dataset.rating, 10) <= selectedRating);
        });
        if (commentBox) {
          commentBox.style.display = 'flex';
          if (inputField) inputField.focus();
        }
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
          this.showToast('Por favor selecciona entre 1 y 5 estrellas', 'error');
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        const comment = inputField ? inputField.value.trim() : '';
        try {
          if (onCalificar && ia.recomendacionId) {
            await onCalificar(ia.recomendacionId, selectedRating, comment);
          }
          ia.calificacionPuntuacion = selectedRating;
          ia.calificacionComentario = comment;
          ratingContainer.innerHTML = `
            <div class="chat-rating-confirmed">
              <span>✓ Calificado con ${selectedRating} estrellas</span>
              ${comment ? `<span style="color:#64748B; font-weight:normal;">• "${this.escapeHtml(comment)}"</span>` : ''}
            </div>
          `;
          this.showToast('¡Gracias por calificar la recomendación!', 'success');
        } catch (err) {
          this.showToast(err.message || 'Error al guardar la calificación', 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Calificar';
        }
      });
    }
  },

  // Renderizado del Resultado RAG (Estilo Editorial Bento)
  renderResultadoRecomendacion(rec, onCalificar) {
    const resultCard = document.getElementById('result-card');
    const scrollArea = document.getElementById('chat-scroll-area');
    const welcomeState = document.getElementById('chat-welcome-state');
    const threadContainer = document.getElementById('chat-thread-container');
    const loadingBox = document.getElementById('loading-box');

    if (!resultCard) return;

    if (scrollArea) scrollArea.style.display = 'flex';
    if (welcomeState) welcomeState.style.display = 'none';
    if (threadContainer) threadContainer.style.display = 'none';
    if (loadingBox) loadingBox.style.display = 'none';
    resultCard.style.display = 'block';

    // Status Badge
    const statusBadge = document.getElementById('result-status-badge');
    const estadoLimpio = rec.estadoFinal || 'Respondida';
    const estadoClass = estadoLimpio.toLowerCase().includes('sin') ? 'sin-resultados' : 'respondida';
    if (statusBadge) {
      statusBadge.className = `status-pill ${estadoClass}`;
      statusBadge.textContent = estadoLimpio;
    }

    // Consulta original recap
    const queryEl = document.getElementById('result-pregunta');
    if (queryEl) {
      queryEl.textContent = `"${rec.pregunta}"`;
    }

    // Manejo de Caso Sin Resultados vs Con Cursos
    const successView = document.getElementById('course-success-view');
    const fallbackBox = document.getElementById('fallback-box');

    if (estadoLimpio.toLowerCase().includes('sin') || !rec.fuentes || rec.fuentes.length === 0) {
      // Mostrar Fallback Bento Card
      if (successView) successView.style.display = 'none';
      if (fallbackBox) {
        fallbackBox.style.display = 'flex';
        const msgEl = document.getElementById('fallback-message-text');
        if (msgEl) {
          msgEl.textContent = rec.respuesta || 'No se encontraron cursos relacionados con tu búsqueda en nuestro catálogo institucional.';
        }
      }
    } else {
      // Mostrar Vista con Cursos Recomendados
      if (fallbackBox) fallbackBox.style.display = 'none';
      if (successView) successView.style.display = 'block';

      // 1. Curso Destacado (Top 1)
      const topCourse = rec.fuentes[0];
      const featuredContainer = document.getElementById('featured-course-container');
      if (featuredContainer && topCourse) {
        const simPct = (topCourse.similitud * 100).toFixed(1);
        const matchLabel = simPct >= 70 ? 'Alta coincidencia' : simPct >= 45 ? 'Coincidencia media' : 'Coincidencia exploratoria';
        featuredContainer.innerHTML = `
          <div class="featured-course-layout">
            <div class="featured-course-thumb">
              <div class="thumb-window-bar">
                <span class="dot-red"></span>
                <span class="dot-yellow"></span>
                <span class="dot-green"></span>
              </div>
              <div class="thumb-code-lines">
                <div class="line w-80 code-accent"></div>
                <div class="line w-60"></div>
                <div class="line w-90"></div>
                <div class="line w-40 code-subaccent"></div>
              </div>
              <div class="thumb-badge-tag">${topCourse.categoria || 'Curso'}</div>
            </div>

            <div class="featured-course-info">
              <div class="featured-header-row">
                <span class="match-pill-green">${matchLabel}</span>
              </div>
              <h3 class="course-headline-title">${topCourse.nombre}</h3>
              <div class="course-meta-pills">
                <span>Nivel: <strong>${topCourse.nivel}</strong></span>
                <span>Duración: <strong>${topCourse.duracionHoras}h</strong></span>
                <span>Categoría: <strong>${topCourse.categoria}</strong></span>
              </div>
              <p class="course-short-desc">${topCourse.descripcion}</p>
            </div>

            <div class="featured-course-actions">
              <div class="similarity-circle-badge">
                <span class="similarity-circle-val">${simPct}%</span>
                <span class="similarity-circle-txt">Similitud</span>
              </div>
              <button class="btn-course-details" onclick="window.verDetalleCursoModal('${topCourse.nombre.replace(/'/g, "\\'")}')">
                Ver detalles →
              </button>
            </div>
          </div>
        `;
      }

      // 2. Explicación de la IA (Sintetizada por RAG)
      const aiTextEl = document.getElementById('result-ai-text');
      if (aiTextEl) {
        aiTextEl.textContent = rec.respuesta;
      }

      // 3. Fuentes Adicionales
      const sourcesContainer = document.getElementById('sources-container');
      const sourcesCounter = document.getElementById('sources-counter');
      const sourcesSection = document.getElementById('sources-section');

      if (sourcesContainer) {
        sourcesContainer.innerHTML = '';
        if (rec.fuentes && rec.fuentes.length > 0) {
          if (sourcesSection) sourcesSection.style.display = 'block';
          if (sourcesCounter) {
            sourcesCounter.textContent = `${rec.fuentes.length} ${rec.fuentes.length === 1 ? 'curso' : 'cursos'}`;
          }

          rec.fuentes.forEach((f, idx) => {
            const card = document.createElement('div');
            card.className = 'source-item-row';
            const simPct = (f.similitud * 100).toFixed(1);

            card.innerHTML = `
              <div class="source-item-left">
                <div class="source-item-name">${idx + 1}. ${f.nombre}</div>
                <div class="source-item-meta">
                  <span>${f.categoria}</span> • <span>${f.nivel}</span> • 
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin:0 2px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  ${f.duracionHoras} hrs
                </div>
              </div>
              <div class="source-item-right">
                <span class="source-item-sim">${simPct}%</span>
                <button class="source-item-action" onclick="window.verDetalleCursoModal('${f.nombre.replace(/'/g, "\\'")}')" title="Ver plan de estudios">➔</button>
              </div>
            `;
            sourcesContainer.appendChild(card);
          });
        } else {
          if (sourcesSection) sourcesSection.style.display = 'none';
        }
      }
    }

    // Componente de Calificación (RF 17)
    const ratingCard = document.getElementById('rating-section');
    if (rec.idRecomendacion) {
      if (ratingCard) ratingCard.style.display = 'block';
      this.initRatingWidget(rec, onCalificar);
    } else {
      if (ratingCard) ratingCard.style.display = 'none';
    }

    // Desplazar suavemente al inicio del área scrollable
    if (scrollArea) {
      setTimeout(() => {
        scrollArea.scrollTop = 0;
      }, 30);
    }
  },

  // Componente Interactivo de Estrellas para Calificación (Editorial)
  initRatingWidget(rec, onCalificar) {
    const starsContainer = document.getElementById('star-rating');
    const commentInput = document.getElementById('rating-comment');
    const submitBtn = document.getElementById('rating-submit-btn');
    const messageEl = document.getElementById('rating-status-message');

    let currentScore = rec.calificacionPuntuacion || 0;
    const isAlreadyRated = Boolean(rec.calificacionPuntuacion);

    if (starsContainer) {
      starsContainer.innerHTML = '';
      for (let i = 1; i <= 5; i++) {
        const starBtn = document.createElement('button');
        starBtn.type = 'button';
        starBtn.className = `star-btn ${i <= currentScore ? 'selected' : ''}`;
        starBtn.textContent = '★';
        starBtn.dataset.rating = i;

        if (!isAlreadyRated) {
          starBtn.onmouseover = () => {
            document.querySelectorAll('#star-rating .star-btn').forEach(s => {
              s.classList.toggle('hovered', parseInt(s.dataset.rating) <= i);
            });
          };
          starBtn.onmouseout = () => {
            document.querySelectorAll('#star-rating .star-btn').forEach(s => {
              s.classList.remove('hovered');
            });
          };
          starBtn.onclick = () => {
            currentScore = i;
            document.querySelectorAll('#star-rating .star-btn').forEach(s => {
              s.classList.toggle('selected', parseInt(s.dataset.rating) <= currentScore);
            });
          };
        }
        starsContainer.appendChild(starBtn);
      }
    }

    if (isAlreadyRated) {
      if (commentInput) {
        commentInput.value = rec.calificacionComentario || '';
        commentInput.disabled = true;
      }
      if (submitBtn) submitBtn.style.display = 'none';
      if (messageEl) {
        messageEl.textContent = `✓ Calificado con ${currentScore} estrellas.`;
        messageEl.style.color = 'var(--text-main)';
      }
    } else {
      if (commentInput) {
        commentInput.value = '';
        commentInput.disabled = false;
      }
      if (submitBtn) {
        submitBtn.style.display = 'inline-flex';
        submitBtn.disabled = false;
      }
      if (messageEl) messageEl.textContent = '';

      if (submitBtn) {
        submitBtn.onclick = async () => {
          if (currentScore < 1 || currentScore > 5) {
            ui.showToast('Por favor selecciona una puntuación de 1 a 5 estrellas.', 'error');
            return;
          }
          submitBtn.disabled = true;
          try {
            await onCalificar(rec.idRecomendacion, currentScore, commentInput ? commentInput.value : '');
            ui.showToast('¡Gracias por tu calificación!', 'success');
            if (commentInput) commentInput.disabled = true;
            submitBtn.style.display = 'none';
            if (messageEl) {
              messageEl.textContent = `✓ Calificación de ${currentScore} estrellas guardada.`;
            }
          } catch (err) {
            ui.showToast(err.message, 'error');
            submitBtn.disabled = false;
          }
        };
      }
    }
  },

  // Renderizado del Catálogo de Cursos (RF 04)
  renderCatalogo(cursos, usuario = null) {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    grid.innerHTML = '';
    if (!cursos || cursos.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3.5rem; background: var(--bg-card); border-radius: var(--radius-xl); border: 1px dashed var(--border-medium); color: var(--text-muted);">
          No se encontraron cursos que coincidan con los filtros seleccionados.
        </div>
      `;
      return;
    }

    const esAdmin = usuario && usuario.rol === 'ADMINISTRADOR';

    const getCatClass = (cat = '') => {
      const c = (cat || '').toLowerCase();
      if (c.includes('web')) return 'cat-web';
      if (c.includes('java') || c.includes('spring')) return 'cat-java';
      if (c.includes('datos') || c.includes('data')) return 'cat-data';
      if (c.includes('automat') || c.includes('rpa')) return 'cat-rpa';
      if (c.includes('inteligencia') || c.includes('ia')) return 'cat-ai';
      if (c.includes('seguridad') || c.includes('ciber')) return 'cat-sec';
      return 'cat-docker';
    };

    cursos.forEach(curso => {
      const card = document.createElement('div');
      card.className = 'course-editorial-card';
      const catClass = getCatClass(curso.categoria);

      const esEstudiante = state.esEstudiante ? state.esEstudiante() : true;
      const estaInscrito = curso.id && state.estaInscrito ? state.estaInscrito(curso.id) : false;

      let botonInscripcion = '';
      if (esEstudiante) {
        if (estaInscrito) {
          botonInscripcion = `
            <span class="badge-enrolled-mini" title="Ya te encuentras matriculado en este curso">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Inscrito</span>
            </span>
          `;
        } else {
          botonInscripcion = `
            <button type="button" class="btn-enroll-mini" data-curso-id="${curso.id}" title="Inscribirme oficialmente a este curso">
              <span>Inscribirme</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
            </button>
          `;
        }
      }

      const cursoNombre = this.escapeHtml(curso.nombre || '');
      const cursoDesc = this.escapeHtml(curso.descripcion || 'Formación académica especializada.');
      const cursoCat = this.escapeHtml(curso.categoria || 'Tecnología');
      const cursoNivel = this.escapeHtml(curso.nivel || 'Intermedio');
      const cursoHoras = curso.duracionHoras || 40;
      const prerreqs = curso.prerrequisitos ? this.escapeHtml(curso.prerrequisitos) : '';

      card.innerHTML = `
        <div class="course-editorial-header">
          <div class="course-editorial-badges">
            <span class="badge-cat ${catClass}">${cursoCat}</span>
            <span class="badge-level">${cursoNivel}</span>
          </div>
          <h3 class="course-editorial-title" style="cursor: pointer;" title="Ver ficha técnica del curso">${cursoNombre}</h3>
          <p class="course-editorial-desc">${cursoDesc}</p>
          ${prerreqs ? `<div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; background: var(--bg-card-subtle); padding: 0.35rem 0.6rem; border-radius: var(--radius-sm); border-left: 2px solid var(--accent-lime);"><strong>Prerrequisitos:</strong> ${prerreqs}</div>` : ''}
        </div>
        <div class="course-editorial-footer">
          <span class="course-editorial-hours">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${cursoHoras}h
          </span>
          <div class="course-card-actions" style="display: flex; gap: 0.5rem; align-items: center;">
            ${botonInscripcion}
            ${esAdmin ? `
              <div class="course-rating-avg-badge" style="background: rgba(245, 158, 11, 0.15); color: #D97706; padding: 0.4rem 0.75rem; border-radius: 9999px; font-weight: 700; font-size: 0.82rem; border: 1px solid rgba(245, 158, 11, 0.3); display: inline-flex; align-items: center; gap: 0.35rem;" title="Promedio de calificaciones para administradores">
                <span>⭐</span> ${curso.promedioCalificaciones ? curso.promedioCalificaciones.toFixed(1) : 'Sin votos'} ${curso.totalCalificaciones ? `(${curso.totalCalificaciones})` : ''}
              </div>
            ` : `
              <button class="btn-rate-course" onclick="window.abrirModalCalificarCurso(${curso.id}, '${curso.nombre.replace(/'/g, "\\'")}')" style="background: #F59E0B; color: #FFFFFF; border: none; padding: 0.45rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.82rem; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 0.35rem;">
                ⭐ Calificar
              </button>
            `}
            <button type="button" class="btn-ask-course" title="Preguntar al Asesor RAG">
              Orientar →
            </button>
            <button type="button" class="btn-details-icon" title="Ver ficha técnica del curso" aria-label="Ver detalles">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </button>
          </div>
        </div>
      `;

      // Listeners seguros sin strings inline
      const enrollBtn = card.querySelector('.btn-enroll-mini');
      if (enrollBtn) {
        enrollBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.inscribirseACurso) {
            window.inscribirseACurso(curso.id, enrollBtn);
          }
        });
      }

      const askBtn = card.querySelector('.btn-ask-course');
      if (askBtn) {
        askBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.consultarCursoSemantico) {
            window.consultarCursoSemantico(curso.nombre);
          }
        });
      }

      const detailsBtn = card.querySelector('.btn-details-icon');
      if (detailsBtn) {
        detailsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.verDetalleCursoModal) {
            window.verDetalleCursoModal(curso.nombre);
          }
        });
      }

      const titleEl = card.querySelector('.course-editorial-title');
      if (titleEl) {
        titleEl.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.verDetalleCursoModal) {
            window.verDetalleCursoModal(curso.nombre);
          }
        });
      }

      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          if (window.verDetalleCursoModal) {
            window.verDetalleCursoModal(curso.nombre);
          }
        }
      });

      grid.appendChild(card);
    });
  },

  // Modal para Calificar un Curso por Estudiantes
  mostrarModalCalificarCurso(cursoId, nombreCurso, onEnviar) {
    let modal = document.getElementById('modal-calificar-curso');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-calificar-curso';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    let selectedStars = 5;

    modal.innerHTML = `
      <div class="modal-editorial-card" style="max-width: 460px; padding: 2rem; background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-medium); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 class="modal-title" style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0;">⭐ Calificar Curso</h3>
          <button class="modal-close-btn" id="close-rate-course-modal-btn" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">✕</button>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.25rem; line-height: 1.4;">
          Indica tu valoración para el curso <strong style="color: var(--text-primary);">${nombreCurso}</strong>:
        </p>

        <div class="star-rating-container" style="display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1.25rem;">
          ${[1, 2, 3, 4, 5].map(star => `
            <button type="button" class="star-btn active" data-star="${star}" style="font-size: 2.2rem; background: none; border: none; cursor: pointer; transition: transform 0.15s ease; color: #F59E0B;">
              ★
            </button>
          `).join('')}
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label for="rate-course-comment" style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-secondary);">Comentario u opinión (opcional):</label>
          <textarea id="rate-course-comment" rows="3" style="width: 100%; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-medium); background: var(--bg-card-subtle); color: var(--text-primary); font-family: inherit; resize: vertical;" placeholder="Escribe tu opinión sobre el curso..."></textarea>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
          <button type="button" class="btn-secondary-pill" id="cancel-rate-course-btn" style="padding: 0.5rem 1rem; border-radius: 9999px; border: 1px solid var(--border-medium); background: transparent; cursor: pointer; font-weight: 600;">Cancelar</button>
          <button type="button" class="btn-primary-lime" id="submit-rate-course-btn" style="padding: 0.5rem 1.2rem; border-radius: 9999px; border: none; background: #F59E0B; color: white; cursor: pointer; font-weight: 700;">Enviar Calificación</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    const starBtns = modal.querySelectorAll('.star-btn');
    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedStars = parseInt(btn.getAttribute('data-star'));
        starBtns.forEach(sb => {
          const val = parseInt(sb.getAttribute('data-star'));
          if (val <= selectedStars) {
            sb.style.color = '#F59E0B';
            sb.classList.add('active');
          } else {
            sb.style.color = '#D1D5DB';
            sb.classList.remove('active');
          }
        });
      });
    });

    const closeBtn = modal.querySelector('#close-rate-course-modal-btn');
    const cancelBtn = modal.querySelector('#cancel-rate-course-btn');
    const submitBtn = modal.querySelector('#submit-rate-course-btn');

    const cerrar = () => modal.style.display = 'none';
    if (closeBtn) closeBtn.onclick = cerrar;
    if (cancelBtn) cancelBtn.onclick = cerrar;

    if (submitBtn) {
      submitBtn.onclick = async () => {
        const comentario = modal.querySelector('#rate-course-comment').value;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        try {
          if (onEnviar) {
            await onEnviar(cursoId, selectedStars, comentario);
          }
          cerrar();
        } catch (err) {
          alert(err.message || 'Error al guardar la calificación');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar Calificación';
        }
      };
    }
  },

  // Renderizado del Historial Rápido en el Widget Lateral de la Pantalla Principal
  renderHistorialRapido(historial, onVerDetalle) {
    const container = document.getElementById('quick-history-container');
    if (!container) return;

    container.innerHTML = '';
    if (!historial || historial.length === 0) {
      container.innerHTML = `
        <div class="quick-history-empty">Aún no tienes consultas registradas.</div>
      `;
      return;
    }

    const totalConsultas = historial.length;
    const respondidas = historial.filter(h => h.estado && !h.estado.toLowerCase().includes('sin')).length;

    // Header counters
    const countersDiv = document.createElement('div');
    countersDiv.className = 'quick-hist-counters';
    countersDiv.innerHTML = `
      <span class="qchip">${totalConsultas} ${totalConsultas === 1 ? 'consulta' : 'consultas'}</span>
      <span class="qchip green">${respondidas} recomendadas</span>
    `;
    container.appendChild(countersDiv);

    // Mostrar los 3 más recientes
    const recientes = historial.slice(0, 4);
    recientes.forEach(h => {
      const item = document.createElement('div');
      item.className = 'quick-hist-item';
      const isOk = h.estado && !h.estado.toLowerCase().includes('sin');
      const dateStr = new Date(h.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

      item.innerHTML = `
        <div class="quick-hist-top">
          <span class="quick-hist-bullet ${isOk ? 'ok' : 'warn'}"></span>
          <div class="quick-hist-query" title="${h.pregunta}">"${h.pregunta}"</div>
        </div>
        <div class="quick-hist-meta">
          <span class="quick-hist-status ${isOk ? 'ok' : 'warn'}">
            ${isOk ? 'Respondida' : 'Sin resultados'} ${h.puntuacion ? `• ★ ${h.puntuacion}/5` : ''}
          </span>
          <span class="quick-hist-time">${dateStr}</span>
        </div>
      `;
      item.onclick = () => onVerDetalle(h);
      container.appendChild(item);
    });
  },

  // Renderizado del Historial Completo (RF 16)
  renderHistorial(historial, onVerDetalle) {
    const listEl = document.getElementById('history-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    if (historial.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          Este estudiante aún no ha realizado consultas en lenguaje natural.
        </div>
      `;
      return;
    }

    historial.forEach(h => {
      const item = document.createElement('div');
      item.className = 'history-editorial-item';
      const dateStr = new Date(h.fecha).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
      const isOk = h.estado && !h.estado.toLowerCase().includes('sin');
      const estadoClass = isOk ? 'respondida' : 'sin-resultados';

      item.innerHTML = `
        <div class="history-item-info">
          <div class="history-item-query">"${h.pregunta}"</div>
          <div class="history-item-meta">
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-right:3px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              ${dateStr}
            </span>
            <span class="status-pill ${estadoClass}" style="padding: 0.15rem 0.5rem; font-size: 0.72rem;">${h.estado}</span>
            ${h.puntuacion ? `<span style="color: #D97706; font-weight: 600;">★ ${h.puntuacion}/5</span>` : '<span style="color: var(--text-muted);">Sin calificar</span>'}
            ${h.fuentes ? `<span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-right:3px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>${h.fuentes.length} fuentes</span>` : ''}
          </div>
        </div>
        <button class="btn-history-detail">Ver Detalle →</button>
      `;
      item.onclick = () => onVerDetalle(h);
      listEl.appendChild(item);
    });
  },

  // Renderizado de Estadísticas (RF 18)
  renderEstadisticas(stats, usuario = null) {
    if (!stats) return;

    const titleEl = document.getElementById('stats-view-title');
    const subtitleEl = document.getElementById('stats-view-subtitle');
    const totalEl = document.getElementById('stat-total');
    const respEl = document.getElementById('stat-respondidas');
    const sinResEl = document.getElementById('stat-sin-resultados');
    const promEl = document.getElementById('stat-promedio');
    const topEl = document.getElementById('stat-curso-top');

    const isEstudiante = usuario && usuario.rol === 'ESTUDIANTE';
    if (titleEl) {
      titleEl.textContent = isEstudiante ? 'Mis Métricas de Orientación Académica' : 'Métricas de Orientación Académica';
    }
    if (subtitleEl) {
      subtitleEl.textContent = isEstudiante
        ? `Estadísticas personales de tus consultas, recomendaciones y satisfacción vocacional.`
        : 'Estadísticas consolidadas del sistema de recomendación y satisfacción estudiantil.';
    }

    if (totalEl) totalEl.textContent = stats.totalConsultas || 0;
    if (respEl) respEl.textContent = stats.consultasRespondidas || 0;
    if (sinResEl) sinResEl.textContent = stats.consultasSinResultados || 0;
    if (promEl) {
      promEl.textContent = (stats.promedioCalificaciones !== null && stats.promedioCalificaciones !== undefined)
        ? `★ ${Number(stats.promedioCalificaciones).toFixed(1)}`
        : 'N/A';
    }
    if (topEl) {
      if (!stats.totalConsultas || stats.totalConsultas === 0 || !stats.cursoMasRecomendado || stats.cursoMasRecomendado === 'Ninguno aún') {
        topEl.textContent = isEstudiante ? 'Aún no tienes recomendaciones registradas' : 'Sin recomendaciones registradas aún';
      } else {
        topEl.textContent = stats.cursoMasRecomendado;
      }
    }
  },

  // Modal con Detalle Completo del Curso
  mostrarModalDetalleCurso(curso, onInscribir) {
    let modal = document.getElementById('course-details-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'course-details-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    if ((!curso.id || curso.id === 0) && state.cursos && state.cursos.length > 0) {
      const found = state.cursos.find(c => c.nombre && curso.nombre && c.nombre.toLowerCase().trim() === curso.nombre.toLowerCase().trim());
      if (found) {
        curso = { ...found, ...curso, id: found.id };
      }
    }

    const esEstudiante = state.esEstudiante ? state.esEstudiante() : true;
    const estaInscrito = curso.id && state.estaInscrito ? state.estaInscrito(curso.id) : false;

    let enrollmentBtnHtml = '';
    if (esEstudiante) {
      if (estaInscrito) {
        enrollmentBtnHtml = `
          <button type="button" class="btn-enrolled-badge" disabled title="Ya te encuentras matriculado en este curso">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Ya estás inscrito</span>
          </button>
        `;
      } else {
        enrollmentBtnHtml = `
          <button type="button" class="btn-enroll-course" id="modal-enroll-course-btn" onclick="window.inscribirseACurso(${curso.id}, this)" title="Inscribirme oficialmente a este curso">
            <span>Inscribirme al Curso</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><path d="M12 5v14M5 12h14"></path></svg>
          </button>
        `;
      }
    } else {
      enrollmentBtnHtml = `
        <span class="enroll-role-notice" title="Solo los estudiantes pueden inscribirse a los cursos">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px; vertical-align: -2px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span>Solo estudiantes pueden inscribirse</span>
        </span>
      `;
    }

    modal.innerHTML = `
      <div class="modal-editorial-card modal-course-card">
        <div class="modal-header">
          <div class="course-modal-badges">
            <span class="badge-cat">${curso.categoria || 'Tecnología'}</span>
            <span class="badge-level">${curso.nivel || 'Intermedio'}</span>
          </div>
          <button class="modal-close-btn" id="close-course-modal-btn">✕</button>
        </div>
        <h3 class="modal-course-title">${curso.nombre}</h3>
        <p class="modal-course-desc">${curso.descripcion || 'Formación académica especializada con estándares de la industria.'}</p>
        
        <div class="modal-course-specs">
          <div class="spec-box">
            <span class="spec-label">Duración lectiva</span>
            <span class="spec-val">${curso.duracionHoras || 40} Horas</span>
          </div>
          <div class="spec-box">
            <span class="spec-label">Modalidad</span>
            <span class="spec-val">100% Online Asistida</span>
          </div>
          <div class="spec-box">
            <span class="spec-label">Certificación</span>
            <span class="spec-val">Institucional Oficial</span>
          </div>
        </div>

        <div class="modal-course-footer">
          ${enrollmentBtnHtml}
          <button class="btn-primary-lime" id="modal-ask-rag-btn">
            <span>Orientar con Asesor RAG</span>
            <span class="btn-arrow">➔</span>
          </button>
          <button class="btn-secondary-pill" id="modal-close-course-btn">
            Cerrar
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    const closeBtn = document.getElementById('close-course-modal-btn');
    const closeBtn2 = document.getElementById('modal-close-course-btn');
    const askBtn = document.getElementById('modal-ask-rag-btn');
    const enrollBtn = document.getElementById('modal-enroll-course-btn');

    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    if (closeBtn2) closeBtn2.onclick = () => modal.style.display = 'none';
    if (askBtn) {
      askBtn.onclick = () => {
        modal.style.display = 'none';
        window.consultarCursoSemantico(curso.nombre);
      };
    }
    if (enrollBtn) {
      enrollBtn.onclick = (e) => {
        e.stopPropagation();
        if (typeof window.inscribirseACurso === 'function') {
          window.inscribirseACurso(curso.id, enrollBtn);
        } else if (onInscribir) {
          onInscribir(curso, enrollBtn);
        }
      };
    }
  },

  // ==========================================================
  // ROL ADMINISTRADOR (5.2) - TABLA CRUD Y MODAL DE CURSOS
  // ==========================================================
  renderCursosAdmin(cursos, onEditar, onToggleActivo) {
    const tbody = document.getElementById('admin-courses-tbody');
    const totalEl = document.getElementById('admin-count-total');
    const activosEl = document.getElementById('admin-count-activos');
    const inactivosEl = document.getElementById('admin-count-inactivos');

    if (!tbody) return;

    const activos = cursos.filter(c => c.activo !== false);
    const inactivos = cursos.filter(c => c.activo === false);

    if (totalEl) totalEl.textContent = cursos.length;
    if (activosEl) activosEl.textContent = activos.length;
    if (inactivosEl) inactivosEl.textContent = inactivos.length;

    tbody.innerHTML = '';

    if (cursos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No se encontraron cursos que coincidan con el criterio de búsqueda.
          </td>
        </tr>
      `;
      return;
    }

    cursos.forEach(c => {
      const tr = document.createElement('tr');
      const esActivo = c.activo !== false;

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-muted); font-size: 0.8rem;">#${c.id}</td>
        <td>
          <div class="course-table-title" style="font-weight: 800; color: #18191E; font-size: 0.95rem;">${c.nombre}</div>
          <div class="course-table-desc" style="font-size: 0.82rem; color: #4B5563; margin-top: 0.3rem; line-height: 1.45; max-width: 450px; white-space: normal;">${c.descripcion || 'Sin descripción'}</div>
          <div class="course-table-prereq" style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.25rem; font-style: italic;">${c.prerrequisitos ? '📌 Prerrequisitos: ' + c.prerrequisitos : 'Sin prerrequisitos'}</div>
        </td>
        <td><span class="catalog-badge-cat" style="font-size:0.75rem;">${c.categoria}</span></td>
        <td><span style="font-weight: 600;">${c.nivel}</span></td>
        <td style="font-weight: 700;">${c.duracionHoras}h</td>
        <td>
          <span class="status-badge ${esActivo ? 'status-badge-active' : 'status-badge-inactive'}">
            <span class="status-dot"></span>
            ${esActivo ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td>
          <div class="admin-actions-cell">
            <button class="btn-table-action btn-action-edit" data-id="${c.id}" title="Editar curso">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>Editar</span>
            </button>
            <button class="btn-table-action btn-action-toggle ${esActivo ? 'deactivate' : 'activate'}" data-id="${c.id}" data-activo="${esActivo}">
              <span>${esActivo ? 'Desactivar' : 'Activar'}</span>
            </button>
          </div>
        </td>
      `;

      // Eventos de botones
      const editBtn = tr.querySelector('.btn-action-edit');
      const toggleBtn = tr.querySelector('.btn-action-toggle');

      if (editBtn && onEditar) {
        editBtn.addEventListener('click', () => onEditar(c));
      }
      if (toggleBtn && onToggleActivo) {
        toggleBtn.addEventListener('click', () => onToggleActivo(c));
      }

      tbody.appendChild(tr);
    });
  },

  // Modal para Crear o Editar Curso (Admin)
  mostrarModalCursoAdmin(curso = null) {
    const modal = document.getElementById('course-modal');
    if (!modal) return;

    const titleEl = document.getElementById('course-modal-title');
    const subtitleEl = document.getElementById('course-modal-subtitle');
    const idInput = document.getElementById('course-form-id');
    const nombreInput = document.getElementById('course-form-nombre');
    const descInput = document.getElementById('course-form-descripcion');
    const catInput = document.getElementById('course-form-categoria');
    const nivelInput = document.getElementById('course-form-nivel');
    const durInput = document.getElementById('course-form-duracion');
    const prereqInput = document.getElementById('course-form-prerrequisitos');

    if (curso) {
      if (titleEl) titleEl.textContent = 'Actualizar Curso Curricular';
      if (subtitleEl) subtitleEl.textContent = `Modifica la información académica del curso ID #${curso.id}:`;
      if (idInput) idInput.value = curso.id;
      if (nombreInput) nombreInput.value = curso.nombre || '';
      if (descInput) descInput.value = curso.descripcion || '';
      if (catInput) {
        catInput.value = curso.categoria || '';
        catInput.readOnly = false;
      }
      if (nivelInput) nivelInput.value = (curso.nivel === 'Básico' ? 'Principiante' : curso.nivel) || 'Principiante';
      if (durInput) durInput.value = curso.duracionHoras || 40;
      if (prereqInput) prereqInput.value = curso.prerrequisitos || '';
    } else {
      if (titleEl) titleEl.textContent = 'Registrar Nuevo Curso Institucional';
      if (subtitleEl) subtitleEl.textContent = 'Ingresa los datos para incorporar una nueva materia al catálogo académico:';
      if (idInput) idInput.value = '';
      if (nombreInput) nombreInput.value = '';
      if (descInput) descInput.value = '';
      if (catInput) {
        catInput.value = '';
        catInput.readOnly = false;
      }
      if (nivelInput) nivelInput.value = 'Principiante';
      if (durInput) durInput.value = 40;
      if (prereqInput) prereqInput.value = '';
    }

    modal.style.display = 'flex';
  },

  // Modal de Autenticación con pestañas Login / Registro
  mostrarModalAuth(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    const tabLoginBtn = document.getElementById('auth-tab-login');
    const tabRegBtn = document.getElementById('auth-tab-register');
    const contentLogin = document.getElementById('auth-content-login');
    const contentReg = document.getElementById('auth-content-register');

    if (tab === 'register') {
      if (tabLoginBtn) tabLoginBtn.classList.remove('active');
      if (tabRegBtn) tabRegBtn.classList.add('active');
      if (contentLogin) contentLogin.classList.remove('active');
      if (contentReg) contentReg.classList.add('active');
    } else {
      if (tabLoginBtn) tabLoginBtn.classList.add('active');
      if (tabRegBtn) tabRegBtn.classList.remove('active');
      if (contentLogin) contentLogin.classList.add('active');
      if (contentReg) contentReg.classList.remove('active');
    }

    modal.style.display = 'flex';
  },

  // ==========================================================
  // ROL ADMINISTRADOR (5.2) - CONSULTA DE ESTUDIANTES (RF 02)
  // ==========================================================
  renderEstudiantesAdmin(estudiantes, onVerHistorial) {
    const tbody = document.getElementById('admin-students-tbody');
    const totalEl = document.getElementById('admin-students-count-total');
    const princEl = document.getElementById('admin-students-count-principiante');
    const avanEl = document.getElementById('admin-students-count-avanzado');

    if (!tbody) return;

    const principiantes = estudiantes.filter(e => (e.nivelExperiencia || '').toLowerCase() === 'principiante');
    const avanzados = estudiantes.filter(e => (e.nivelExperiencia || '').toLowerCase() !== 'principiante');

    if (totalEl) totalEl.textContent = estudiantes.length;
    if (princEl) princEl.textContent = principiantes.length;
    if (avanEl) avanEl.textContent = avanzados.length;

    tbody.innerHTML = '';

    if (estudiantes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No se encontraron estudiantes que coincidan con la búsqueda.
          </td>
        </tr>
      `;
      return;
    }

    estudiantes.forEach(est => {
      const tr = document.createElement('tr');
      const initials = (est.nombreCompleto || 'E').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      const fecha = est.fechaCreacion ? new Date(est.fechaCreacion).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Registrado';

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-muted); font-size: 0.82rem;">#${est.id}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: #D7F338; color: #18191E; font-weight: 800; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${initials}
            </div>
            <div>
              <div style="font-weight: 700; color: #18191E;">${est.nombreCompleto}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="color: var(--text-secondary); font-size: 0.85rem;">${est.correoElectronico}</span>
        </td>
        <td>
          <span class="status-pill ${est.nivelExperiencia === 'Principiante' ? 'respondida' : 'sin-resultados'}" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;">
            ${est.nivelExperiencia || 'General'}
          </span>
        </td>
        <td>
          <span style="font-weight: 600; font-size: 0.85rem; color: #18191E;">${est.areaInteres || 'Tecnología'}</span>
        </td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${fecha}</td>
        <td style="text-align: right;">
          <button type="button" class="btn-table-action btn-action-inspect" data-id="${est.id}" style="background: #18191E; color: #FFFFFF; padding: 0.4rem 0.85rem; border-radius: 8px; font-weight: 700; font-size: 0.78rem; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Consultar</span>
          </button>
        </td>
      `;

      const inspectBtn = tr.querySelector('.btn-action-inspect');
      if (inspectBtn && onVerHistorial) {
        inspectBtn.addEventListener('click', () => onVerHistorial(est));
      }

      tbody.appendChild(tr);
    });
  },

  renderFichaEstudianteAdmin(estudiante, historial, onCerrar) {
    const container = document.getElementById('admin-student-inspection-result');
    if (!container) return;

    const initials = (estudiante.nombreCompleto || 'E').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const fecha = estudiante.fechaCreacion ? new Date(estudiante.fechaCreacion).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Registrado';

    let historialHtml = '';
    if (!historial || historial.length === 0) {
      historialHtml = `
        <div style="background: #FAF8F2; border-radius: 12px; padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
          Este estudiante aún no ha realizado consultas vocacionales al asistente RAG.
        </div>
      `;
    } else {
      historialHtml = `
        <div class="history-items-list">
          ${historial.map((h, idx) => `
            <div class="admin-history-card">
              <div class="admin-history-header">
                <div class="admin-history-query">
                  <span style="color: #7C3AED; margin-right: 0.4rem;">#${idx + 1}</span> "${h.pregunta}"
                </div>
                <span class="admin-history-date">${h.fecha ? new Date(h.fecha).toLocaleString('es-CO') : ''}</span>
              </div>
              <div class="admin-history-resp">
                ${h.respuesta || 'Sin respuesta detallada registrada.'}
              </div>
              ${h.puntuacion ? `
                <div class="admin-history-rating">
                  <span>★ Calificación del Alumno: ${h.puntuacion}/5</span>
                  ${h.comentario ? `<span>• "${h.comentario}"</span>` : ''}
                </div>
              ` : `
                <span style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Sin calificación registrada aún</span>
              `}
            </div>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="student-inspection-card">
        <div class="inspection-card-top">
          <div class="inspection-student-profile">
            <div class="inspection-avatar">${initials}</div>
            <div>
              <h3 class="inspection-name">
                ${estudiante.nombreCompleto}
                <span class="id-badge">ID #${estudiante.id}</span>
              </h3>
              <div class="inspection-meta-tags">
                <span>📧 ${estudiante.correoElectronico}</span>
                <span>🎓 Nivel: <strong>${estudiante.nivelExperiencia || 'General'}</strong></span>
                <span>🎯 Área: <strong>${estudiante.areaInteres || 'Tecnología'}</strong></span>
                <span>📅 Registro: ${fecha}</span>
              </div>
            </div>
          </div>
          <button type="button" class="btn-close-inspection" id="btn-close-student-inspection">
            ✕ Cerrar Ficha
          </button>
        </div>

        <div class="student-history-section">
          <h4>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Historial de Consultas y Recomendaciones RAG (${historial ? historial.length : 0})</span>
          </h4>
          ${historialHtml}
        </div>
      </div>
    `;

    container.style.display = 'block';

    const closeBtn = document.getElementById('btn-close-student-inspection');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        container.style.display = 'none';
        container.innerHTML = '';
        if (onCerrar) onCerrar();
      });
    }

    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  renderResultadosBusquedaEstudiantesAdmin(query, estudiantes, onVerHistorial) {
    const container = document.getElementById('admin-student-inspection-result');
    if (!container) return;

    if (!estudiantes || estudiantes.length === 0) {
      this.renderErrorEstudianteAdmin(query, 'No se encontraron estudiantes coincidentes');
      return;
    }

    const itemsHtml = estudiantes.map(est => {
      const initials = (est.nombreCompleto || 'E').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      return `
        <div class="search-result-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 0.75rem; transition: all 0.2s ease;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: #D7F338; color: #18191E; font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${initials}
            </div>
            <div>
              <div style="font-weight: 700; color: #18191E; font-size: 1rem;">
                ${est.nombreCompleto}
                <span class="id-badge" style="font-size: 0.72rem; margin-left: 0.35rem;">ID #${est.id}</span>
              </div>
              <div style="color: #4B5563; font-size: 0.88rem; font-weight: 500; margin-top: 0.15rem;">
                📧 <strong>${est.correoElectronico}</strong>
              </div>
              <div style="color: var(--text-muted); font-size: 0.78rem; margin-top: 0.2rem;">
                🎓 ${est.nivelExperiencia || 'General'} | 🎯 ${est.areaInteres || 'Tecnología'}
              </div>
            </div>
          </div>
          <button type="button" class="btn-inspect-single" data-id="${est.id}" style="background: #18191E; color: #FFFFFF; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem;">
            <span>Ver Ficha e Historial</span>
            <span style="color: #D7F338;">➔</span>
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="admin-search-results-card" style="background: #FAF8F2; border: 1px solid #E2E8F0; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h4 style="font-weight: 800; color: #18191E; font-size: 1.05rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>🔍 Coincidencias encontradas para "${query}" (${estudiantes.length})</span>
          </h4>
          <button type="button" class="btn-close-inspection" id="btn-close-results-card" style="background: #E2E8F0; color: #475569; border: none; padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; cursor: pointer;">
            ✕ Cerrar
          </button>
        </div>
        <div class="search-results-list">
          ${itemsHtml}
        </div>
      </div>
    `;

    container.style.display = 'block';

    const closeBtn = document.getElementById('btn-close-results-card');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        container.style.display = 'none';
        container.innerHTML = '';
      });
    }

    container.querySelectorAll('.btn-inspect-single').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const est = estudiantes.find(e => String(e.id) === String(id));
        if (est && onVerHistorial) {
          onVerHistorial(est);
        }
      });
    });

    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  renderErrorEstudianteAdmin(queryConsultada, mensajeError) {
    const container = document.getElementById('admin-student-inspection-result');
    if (!container) return;

    container.innerHTML = `
      <div class="admin-notfound-card">
        <div class="notfound-icon-box">⚠</div>
        <div class="notfound-body" style="flex: 1;">
          <h4>Sin coincidencias de búsqueda</h4>
          <p>
            No existe ningún estudiante registrado que coincida con la consulta: <strong>"${queryConsultada}"</strong>.
          </p>
          <p style="margin-top: 0.35rem; font-size: 0.82rem; opacity: 0.9;">
            Detalle: <em>"${mensajeError || 'Recurso no encontrado'}"</em>. Verifica que el nombre o correo ingresado esté bien escrito o revisa el directorio general.
          </p>
        </div>
        <button type="button" class="btn-close-inspection" id="btn-close-error-card" style="background:#FED7AA; border-color:#FDBA74; color:#7C2D12;">
          ✕ Ocultar
        </button>
      </div>
    `;

    container.style.display = 'block';

    const closeBtn = document.getElementById('btn-close-error-card');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        container.style.display = 'none';
        container.innerHTML = '';
      });
    }

    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  // ==========================================================
  // Renderizado del Panel Docente (Supervisión Curricular e Inscritos)
  // ==========================================================
  renderDocenteCursos(cursos, docente, onVerInscritos) {
    const badgeEl = document.getElementById('docente-badge-area');
    const subtitleEl = document.getElementById('docente-view-subtitle');
    const totalEl = document.getElementById('docente-count-total');
    const activosEl = document.getElementById('docente-count-activos');
    const matriculadosEl = document.getElementById('docente-count-matriculados');
    const tbody = document.getElementById('docente-courses-tbody');

    const area = docente ? (docente.areaEspecialidad || docente.area || 'Programación') : 'Especialidad';
    if (badgeEl) badgeEl.textContent = `Especialidad: ${area}`;
    if (subtitleEl) subtitleEl.textContent = `Supervisa la oferta académica de tu especialidad (${area}) y consulta los estudiantes inscritos en cada materia.`;

    const total = cursos ? cursos.length : 0;
    const activos = cursos ? cursos.filter(c => c.activo).length : 0;
    const totalMatriculados = cursos ? cursos.reduce((acc, c) => acc + (c.totalInscritos || 0), 0) : 0;

    if (totalEl) totalEl.textContent = total;
    if (activosEl) activosEl.textContent = activos;
    if (matriculadosEl) matriculadosEl.textContent = totalMatriculados;

    if (!tbody) return;
    tbody.innerHTML = '';

    if (!cursos || cursos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: #64748B;">
            No hay cursos asignados en tu especialidad (${area}).
          </td>
        </tr>
      `;
      return;
    }

    cursos.forEach(curso => {
      const tr = document.createElement('tr');
      tr.className = 'docente-row-clickable';
      const isActivo = curso.activo !== false;

      // Estado LIMPIO: Solo "Activo" o "Inactivo", sin nada entre paréntesis
      const statusBadge = isActivo
        ? '<span class="status-badge status-badge-active"><span class="status-dot"></span> Activo</span>'
        : '<span class="status-badge status-badge-inactive"><span class="status-dot"></span> Inactivo</span>';

      const prereqBadge = curso.prerrequisitos
        ? `<span class="badge-prereq" title="${curso.prerrequisitos}" style="font-size: 0.8rem; background: #F1F5F9; padding: 3px 8px; border-radius: 6px; border: 1px solid #E2E8F0; color: #334155;">📚 ${curso.prerrequisitos}</span>`
        : '<span class="text-muted" style="font-size: 0.8rem; color: #94A3B8;">Sin prerrequisitos</span>';

      const numInscritos = curso.totalInscritos || 0;

      tr.innerHTML = `
        <td>
          <div class="course-table-title" style="font-weight: 700; color: #0F172A; font-size: 0.95rem;">${curso.nombre}</div>
          <div class="course-table-prereq" style="font-size: 0.82rem; color: #64748B; margin-top: 3px; max-width: 440px; line-height: 1.4;">
            ${curso.descripcion ? curso.descripcion.substring(0, 95) + '...' : ''}
          </div>
        </td>
        <td><span class="badge-level badge-level-${(curso.nivel || 'Intermedio').toLowerCase()}">${curso.nivel || 'Intermedio'}</span></td>
        <td><span style="font-size: 0.88rem; font-weight: 600; color: #1E293B;">${curso.duracionHoras || 40}h</span></td>
        <td>${prereqBadge}</td>
        <td>${statusBadge}</td>
        <td style="text-align: right; white-space: nowrap;">
          <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 0.6rem;">
            <span class="badge-inscritos" title="${numInscritos} ${numInscritos === 1 ? 'inscrito' : 'inscritos'}">
              👥 <strong>${numInscritos}</strong>
            </span>
            <button type="button" class="btn-ver-inscritos btn-docente-ver-inscritos" data-id="${curso.id}" title="Ver lista de inscritos">
              <span>Ver inscritos</span> ➔
            </button>
          </div>
        </td>
      `;

      // Al hacer clic en el botón o en la fila se abre el detalle con inscritos
      const verBtn = tr.querySelector('.btn-docente-ver-inscritos');
      if (verBtn) {
        verBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onVerInscritos) onVerInscritos(curso);
        });
      }

      tr.addEventListener('click', () => {
        if (onVerInscritos) onVerInscritos(curso);
      });

      tbody.appendChild(tr);
    });
  },

  // Modal para visualizar los estudiantes inscritos en una materia
  mostrarModalInscritosDocente(curso, inscritos) {
    let modal = document.getElementById('docente-inscritos-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'docente-inscritos-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const total = (inscritos || []).length;
    let studentsHtml = '';

    if (!inscritos || inscritos.length === 0) {
      studentsHtml = `
        <div style="text-align: center; padding: 2.8rem 1.5rem; background: #F8FAFC; border-radius: 12px; border: 1px dashed #CBD5E1;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">👨‍🎓</div>
          <p style="font-weight: 700; color: #1E293B; font-size: 1rem; margin-bottom: 0.35rem;">Aún no hay estudiantes inscritos en esta materia</p>
          <p style="font-size: 0.85rem; color: #64748B; max-width: 440px; margin: 0 auto;">
            Tan pronto los alumnos seleccionen esta asignatura o reciban su plan vocacional con IA, aparecerán registrados en esta nómina.
          </p>
        </div>
      `;
    } else {
      studentsHtml = `
        <div class="admin-table-container" style="max-height: 380px; overflow-y: auto; border: 1px solid #E2E8F0; border-radius: 12px;">
          <table class="admin-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="background: #F8FAFC;">Estudiante</th>
                <th style="background: #F8FAFC;">Correo Institucional</th>
                <th style="background: #F8FAFC;">Nivel</th>
                <th style="background: #F8FAFC;">Fecha Matrícula</th>
                <th style="background: #F8FAFC; text-align: right;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${inscritos.map(ins => {
                const nombre = ins.estudianteNombre || 'Estudiante';
                const initials = nombre
                  .split(' ')
                  .filter(n => n.length > 0)
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                const fecha = ins.fechaInscripcion
                  ? new Date(ins.fechaInscripcion).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
                  : 'Reciente';
                return `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 0.65rem;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: #E0E7FF; color: #4338CA; font-weight: 700; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                          ${initials}
                        </div>
                        <div>
                          <div style="font-weight: 600; color: #0F172A; font-size: 0.88rem;">${nombre}</div>
                          <div style="font-size: 0.75rem; color: #64748B;">Interés: ${ins.estudianteAreaInteres || 'Tecnología'}</div>
                        </div>
                      </div>
                    </td>
                    <td style="color: #475569; font-size: 0.85rem;">${ins.estudianteCorreo || '-'}</td>
                    <td><span class="badge-level badge-level-${(ins.estudianteNivel || 'Principiante').toLowerCase()}" style="font-size: 0.75rem;">${ins.estudianteNivel || 'Principiante'}</span></td>
                    <td style="color: #64748B; font-size: 0.82rem;">${fecha}</td>
                    <td style="text-align: right;">
                      <span class="status-badge status-badge-active" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;">
                        <span class="status-dot"></span> ${ins.estado || 'Inscrito'}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="modal-editorial-card modal-course-card" style="max-width: 720px; width: 94%;">
        <div class="modal-header" style="margin-bottom: 0.75rem;">
          <div class="course-modal-badges">
            <span class="badge-cat">${curso.categoria || 'Especialidad'}</span>
            <span class="badge-level badge-level-${(curso.nivel || 'Intermedio').toLowerCase()}">${curso.nivel || 'Intermedio'}</span>
            <span class="badge-inscritos" style="background: #E0E7FF; color: #4338CA; border-color: #C7D2FE;">👥 ${total} matriculado${total === 1 ? '' : 's'}</span>
          </div>
          <button class="modal-close-btn" id="close-inscritos-modal-btn">✕</button>
        </div>
        
        <h3 class="modal-course-title" style="font-size: 1.35rem; margin-bottom: 0.35rem; color: #0F172A;">${curso.nombre}</h3>
        <p class="modal-course-desc" style="margin-bottom: 1.25rem; font-size: 0.88rem; color: #64748B;">
          Nómina oficial de estudiantes inscritos en esta materia académica (${curso.duracionHoras || 40} horas lectivas).
        </p>

        ${studentsHtml}

        <div class="modal-course-footer" style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
          <button class="btn-secondary-pill" id="btn-close-inscritos-footer">
            Cerrar Nómina
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    const closeBtn = document.getElementById('close-inscritos-modal-btn');
    const closeBtnFooter = document.getElementById('btn-close-inscritos-footer');
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    if (closeBtnFooter) closeBtnFooter.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = 'none';
    };
  },

  renderDocenteFeedback(feedbackList) {
    const container = document.getElementById('docente-feedback-container');
    if (!container) return;

    if (!feedbackList || feedbackList.length === 0) {
      container.innerHTML = `
        <div class="empty-state-editorial" style="text-align: center; padding: 3rem 1.5rem; background: #FFFFFF; border-radius: 16px; border: 1px dashed #CBD5E1; margin-top: 1rem;">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">💬</div>
          <h4 style="font-size: 1.1rem; color: #1E293B; margin-bottom: 0.25rem;">Aún no hay feedback registrado sobre tus materias</h4>
          <p style="color: #64748B; font-size: 0.9rem; max-width: 480px; margin: 0 auto;">
            Cuando los estudiantes consulten al Asesor Vocacional con IA y se les recomiende un curso de tu especialidad, aquí verás sus preguntas, porcentaje de afinidad y las calificaciones con estrellas que otorguen.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    feedbackList.forEach(item => {
      const card = document.createElement('div');
      card.className = 'docente-feedback-card';
      card.style.cssText = 'background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04);';

      const fechaStr = item.fecha ? new Date(item.fecha).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : 'Reciente';
      const simPercent = item.similitud ? (item.similitud * 100).toFixed(1) + '%' : 'N/A';

      const stars = item.puntuacion
        ? '★'.repeat(item.puntuacion) + '☆'.repeat(5 - item.puntuacion)
        : '<span style="color: #94A3B8; font-size: 0.85rem;">Sin calificar aún</span>';

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; color: #0F172A; font-size: 0.95rem;">${item.estudianteNombre || 'Estudiante'}</span>
              <span class="badge-level" style="font-size: 0.75rem; padding: 2px 8px;">${item.estudianteNivel || 'Estudiante'}</span>
              <span style="font-size: 0.8rem; color: #64748B;">• ${fechaStr}</span>
            </div>
            <div style="margin-top: 6px; font-size: 0.92rem; color: #334155; font-style: italic; background: #F8FAFC; padding: 8px 12px; border-left: 3px solid #D7F338; border-radius: 4px;">
              "${item.pregunta || 'Consulta académica'}"
            </div>
          </div>
          <div style="text-align: right; min-width: 140px;">
            <div style="color: #F59E0B; font-size: 1.1rem; letter-spacing: 2px;">${stars}</div>
            <div style="font-size: 0.78rem; color: #64748B; margin-top: 2px;">Afinidad IA: <strong>${simPercent}</strong></div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: #F1F5F9; border-radius: 8px; padding: 8px 14px; margin-top: 0.6rem;">
          <div style="font-size: 0.85rem; color: #1E293B;">
            📖 Curso sugerido: <strong>${item.cursoNombre || 'Asignatura'}</strong> <span style="color: #64748B;">(${item.cursoCategoria || 'Especialidad'})</span>
          </div>
          ${item.comentario ? `<div style="font-size: 0.85rem; color: #047857; font-weight: 500;">💬 "${item.comentario}"</div>` : ''}
        </div>
      `;

      container.appendChild(card);
    });
  },

  renderDocenteEstadisticas(stats) {
    if (!stats) return;
    const cursosEl = document.getElementById('docente-stat-cursos');
    const consultasEl = document.getElementById('docente-stat-consultas');
    const satisfaccionEl = document.getElementById('docente-stat-satisfaccion');
    const calificacionesEl = document.getElementById('docente-stat-calificaciones');
    const topCursoEl = document.getElementById('docente-stat-top-curso');

    if (cursosEl) cursosEl.textContent = stats.totalCursosEspecialidad || 0;
    if (consultasEl) consultasEl.textContent = stats.totalConsultasRelacionadas || 0;
    if (satisfaccionEl) {
      satisfaccionEl.textContent = (stats.promedioCalificacionCursos !== null && stats.promedioCalificacionCursos !== undefined)
        ? `★ ${Number(stats.promedioCalificacionCursos).toFixed(1)}`
        : 'N/A';
    }
    if (calificacionesEl) calificacionesEl.textContent = stats.totalCalificacionesRecibidas || 0;
    if (topCursoEl) {
      topCursoEl.textContent = (!stats.cursoMasDemandado || stats.cursoMasDemandado === 'Ninguno aún')
        ? 'Sin recomendaciones registradas aún en tu especialidad'
        : stats.cursoMasDemandado;
    }
  },

  renderEstadisticasAdmin(data) {
    if (!data) return;

    // KPI Cards
    const totalEst = document.getElementById('global-stat-total-usuarios');
    const activosEst = document.getElementById('global-stat-usuarios-activos');
    const totalCons = document.getElementById('global-stat-total-consultas');
    const promSat = document.getElementById('global-stat-promedio-calificacion');
    const cursoTop = document.getElementById('global-stat-curso-top');

    if (totalEst) totalEst.textContent = data.totalUsuarios || 0;
    if (activosEst) activosEst.textContent = data.usuariosActivos || 0;
    if (totalCons) totalCons.textContent = data.totalConsultas || 0;
    if (promSat) {
      promSat.textContent = (data.promedioCalificaciones !== null && data.promedioCalificaciones !== undefined)
        ? `★ ${Number(data.promedioCalificaciones).toFixed(1)}`
        : 'N/A';
    }
    if (cursoTop) {
      cursoTop.textContent = data.cursoMasRecomendado && data.cursoMasRecomendado !== 'Ninguno aún'
        ? data.cursoMasRecomendado
        : 'Sin recomendaciones registradas';
    }

    // Acciones por Día
    const daysContainer = document.getElementById('admin-actions-per-day-container');
    if (daysContainer) {
      const dias = data.accionesPorDia || [];
      if (dias.length === 0) {
        daysContainer.innerHTML = `<div style="color:#6B7280; font-size:0.88rem;">Sin registros de actividad por día.</div>`;
      } else {
        const maxVal = Math.max(...dias.map(d => d.totalAcciones || 1), 1);
        daysContainer.innerHTML = dias.map(d => {
          const pct = Math.min(100, Math.round(((d.totalAcciones || 0) / maxVal) * 100));
          return `
            <div style="margin-bottom:0.75rem;">
              <div style="display:flex; justify-content:space-between; font-size:0.82rem; font-weight:700; color:#374151; margin-bottom:0.25rem;">
                <span>📅 ${d.fecha}</span>
                <span>${d.totalAcciones} acción(es)</span>
              </div>
              <div style="background:#F1F5F9; border-radius:6px; height:8px; overflow:hidden;">
                <div style="background:linear-gradient(90deg, #7C3AED, #A855F7); width:${pct}%; height:100%; border-radius:6px;"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Acciones por Usuario
    const userTbody = document.getElementById('admin-user-actions-tbody');
    if (userTbody) {
      const users = data.accionesPorUsuario || [];
      const filterInput = document.getElementById('admin-user-actions-filter');
      const q = filterInput ? filterInput.value.toLowerCase().trim() : '';

      const filteredUsers = users.filter(u => {
        if (!q) return true;
        return (u.nombre && u.nombre.toLowerCase().includes(q)) ||
               (u.email && u.email.toLowerCase().includes(q));
      });

      if (filteredUsers.length === 0) {
        userTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#6B7280; padding:1.5rem;">No hay usuarios coincidentes.</td></tr>`;
      } else {
        userTbody.innerHTML = filteredUsers.map(u => {
          const isAdm = u.rol === 'ADMINISTRADOR';
          const badgeClass = isAdm ? 'background:#FEE2E2; color:#991B1B;' : 'background:#E0E7FF; color:#3730A3;';
          return `
            <tr>
              <td style="font-weight:700; color:#18191E;">
                <span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:#F1F5F9; margin-right:0.5rem; font-size:0.78rem;">
                  ${isAdm ? '🛡️' : '👤'}
                </span>
                ${u.nombre || 'Usuario'}
              </td>
              <td style="color:#4B5563; font-family:monospace; font-size:0.85rem;">${u.email || '-'}</td>
              <td>
                <span style="font-size:0.75rem; font-weight:800; padding:0.25rem 0.6rem; border-radius:12px; ${badgeClass}">
                  ${u.rol || 'ESTUDIANTE'}
                </span>
              </td>
              <td style="text-align:right; font-weight:800; color:#18191E;">
                ${u.totalAcciones}
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Auditoría
    this.renderTablaAuditoria(data.auditoria || []);
  },

  renderTablaAuditoria(list) {
    const tbody = document.getElementById('admin-audit-tbody');
    if (!tbody) return;

    const searchInput = document.getElementById('admin-audit-search');
    const typeSelect = document.getElementById('admin-audit-type-filter');

    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const eventType = typeSelect ? typeSelect.value : 'TODOS';

    const filtered = list.filter(item => {
      if (eventType !== 'TODOS' && item.tipoEvento !== eventType) {
        return false;
      }
      if (q) {
        const text = `${item.usuarioEmail} ${item.usuarioNombre} ${item.detalle} ${item.tipoEvento} ${item.rol}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#6B7280; padding:2rem;">No se encontraron registros de auditoría que coincidan con el filtro.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      const isIngreso = item.tipoEvento === 'INGRESO';
      const badgeEventStyle = isIngreso ? 'background:#DCFCE7; color:#166534;' : 'background:#FEF08A; color:#854D0E;';
      const isAdm = item.rol === 'ADMINISTRADOR';
      const badgeRolStyle = isAdm ? 'background:#FEE2E2; color:#991B1B;' : 'background:#E0E7FF; color:#3730A3;';

      const fechaFmt = item.fecha ? new Date(item.fecha).toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'medium'
      }) : '-';

      return `
        <tr>
          <td style="font-weight:700; color:#64748B;">#${item.id}</td>
          <td style="font-size:0.83rem; color:#334155; white-space:nowrap;">${fechaFmt}</td>
          <td>
            <span style="font-size:0.75rem; font-weight:800; padding:0.25rem 0.65rem; border-radius:12px; ${badgeEventStyle}">
              ${isIngreso ? '🔑 INGRESO' : '📝 REGISTRO'}
            </span>
          </td>
          <td style="font-weight:700; color:#1E293B;">${item.usuarioNombre || 'Usuario'}</td>
          <td style="font-family:monospace; font-size:0.83rem; color:#475569;">${item.usuarioEmail}</td>
          <td>
            <span style="font-size:0.75rem; font-weight:800; padding:0.25rem 0.6rem; border-radius:12px; ${badgeRolStyle}">
              ${item.rol}
            </span>
          </td>
          <td style="font-size:0.85rem; color:#475569;">${item.detalle || '-'}</td>
        </tr>
      `;
    }).join('');
  }
};