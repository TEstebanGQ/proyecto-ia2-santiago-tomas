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

    const claudeStudentName = document.getElementById('claude-student-name');
    if (claudeStudentName) {
      const primerNombre = nombre.split(' ')[0] || 'Tomas';
      claudeStudentName.textContent = primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();
    }

    const rol = (estudiante.rol || 'ESTUDIANTE').toUpperCase();
    if (badgeEl) {
      if (rol === 'SUPERADMIN') {
        badgeEl.textContent = 'Superadmin';
        badgeEl.className = 'user-role-badge role-badge-superadmin';
      } else if (rol === 'ADMINISTRADOR') {
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
    const navMetricas = document.getElementById('nav-metricas-item');
    const navAudit = document.getElementById('nav-audit-item');
    const navDocente = document.getElementById('nav-docente-item');
    const rol = usuario ? (usuario.rol || '').toUpperCase() : '';
    const esAdmin = rol === 'ADMINISTRADOR' || rol === 'SUPERADMIN';
    if (navAdmin) {
      navAdmin.style.display = esAdmin ? 'flex' : 'none';
      const label = navAdmin.querySelector('.nav-label');
      if (label) {
        label.textContent = rol === 'SUPERADMIN' ? 'Panel Superadmin' : 'Panel Administrador';
      }
    }
    if (navMetricas) {
      navMetricas.style.display = esAdmin ? 'flex' : 'none';
    }
    if (navAudit) {
      navAudit.style.display = esAdmin ? 'flex' : 'none';
    }
    if (navDocente) {
      navDocente.style.display = rol === 'DOCENTE' ? 'flex' : 'none';
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
      loadingBox.style.display = isLoading ? 'flex' : 'none';
      const titleEl = document.getElementById('loading-title');
      const descEl = document.getElementById('loading-desc');
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;

      const scrollArea = document.getElementById('chat-scroll-area');
      const inputBar = document.getElementById('chat-input-bar');
      if (scrollArea) {
        setTimeout(() => {
          scrollArea.scrollTop = scrollArea.scrollHeight;
          if (inputBar) inputBar.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 40);
        setTimeout(() => {
          scrollArea.scrollTop = scrollArea.scrollHeight;
          if (inputBar) inputBar.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 150);
      }
    }
    if (resultBox && isLoading) {
      resultBox.style.display = 'none';
    }
    if (submitBtn) {
      if (isLoading) {
        submitBtn.disabled = true;
      } else {
        const isFull = state.chatSession && state.chatSession.turnCount >= state.chatSession.maxTurns;
        submitBtn.disabled = isFull;
        submitBtn.classList.toggle('disabled', isFull);
      }
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

  // Helper para formatear Markdown de la IA a HTML seguro (negrilla, listas, cursiva)
  formatMarkdown(str) {
    if (!str) return '';
    let text = String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Separar viñetas inline como ": * **Título:**" o "texto. * **Otro:**" a una nueva línea
    text = text.replace(/([^\n])\s*\*\s+\*\*/g, '$1\n* **');

    // Negrita: **texto** o __texto__
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Cursiva: *texto* o _texto_
    text = text.replace(/(?<![*\w])\*([^*\n]+?)\*(?![*\w])/g, '<em>$1</em>');
    text = text.replace(/(?<![_\w])_([^_\n]+?)_(?![_\w])/g, '<em>$1</em>');

    // Código en línea: `código`
    text = text.replace(/`([^`\n]+)`/g, '<code class="chat-inline-code">$1</code>');

    // Procesar líneas para listas con viñetas y párrafos
    const rawLines = text.split('\n');
    const processed = [];
    let inList = false;

    for (const line of rawLines) {
      const trimmed = line.trim();
      const bulletMatch = trimmed.match(/^[\*\-]\s+(.*)$/);

      if (bulletMatch) {
        if (!inList) {
          processed.push('<ul class="chat-md-list">');
          inList = true;
        }
        processed.push(`<li>${bulletMatch[1]}</li>`);
      } else {
        if (inList) {
          processed.push('</ul>');
          inList = false;
        }
        if (trimmed === '') {
          processed.push('<div class="chat-md-spacer"></div>');
        } else {
          processed.push(`<p class="chat-md-p">${line}</p>`);
        }
      }
    }

    if (inList) {
      processed.push('</ul>');
    }

    return processed.join('');
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
      submitBtn.classList.toggle('disabled', isFull);
    }
  },

  // Renderizar la sesión conversacional completa (Hilo de hasta 5 turnos - natural chat UX)
  renderChatSession(chatSession, onCalificar) {
    this.updateChatSessionBar(chatSession.turnCount, chatSession.maxTurns);

    const chatLayout = document.querySelector('.bento-col-main.chat-layout');
    const welcomeState = document.getElementById('chat-welcome-state');
    const threadContainer = document.getElementById('chat-thread-container');
    const resultCard = document.getElementById('result-card');
    const scrollArea = document.getElementById('chat-scroll-area');

    if (!threadContainer) return;

    if (threadContainer) threadContainer.style.display = 'flex';
    if (resultCard) resultCard.style.display = 'none';

    const inputBar = document.getElementById('chat-input-bar');

    if (!chatSession.mensajes || chatSession.mensajes.length === 0) {
      if (chatLayout) chatLayout.classList.remove('has-conversation');
      if (welcomeState) welcomeState.style.display = 'flex';
      if (inputBar) inputBar.style.display = 'none';
      threadContainer.innerHTML = '';
      return;
    }

    if (chatLayout) chatLayout.classList.add('has-conversation');
    if (welcomeState) welcomeState.style.display = 'none';
    if (inputBar) inputBar.style.display = 'block';
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
        const esSinResultados = estadoLimpio.toLowerCase().includes('sin') || estadoLimpio.toLowerCase().includes('fuera');

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
              <div class="chat-ia-text">${this.formatMarkdown(ia.texto)}</div>
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
        } else if (ia.fuentes && ia.fuentes.length > 0) {
          let topCourse = ia.fuentes[0];
          if (ia.fuentes.length > 1 && ia.texto) {
            const matching = ia.fuentes.find(f => ia.texto.toLowerCase().includes(f.nombre.toLowerCase()));
            if (matching) topCourse = matching;
          }
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
                    <div class="similarity-circle-meter">
                      <span class="similarity-circle-val">${simPct}%</span>
                    </div>
                    <span class="similarity-circle-txt">Compatibilidad</span>
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
                      <span>${this.escapeHtml(f.categoria)}</span> <span class="meta-dot">•</span> <span>${this.escapeHtml(f.nivel)}</span> <span class="meta-dot">•</span> <span>${f.duracionHoras} hrs</span>
                    </div>
                  </div>
                  <div class="source-item-right">
                    <div class="source-item-sim-badge" title="Compatibilidad: ${fSim}%">
                      <span class="source-item-sim-label">Compatibilidad</span>
                      <span class="source-item-sim">${fSim}%</span>
                    </div>
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
                <span class="chat-rating-stars-symbol">${'★'.repeat(ia.calificacionPuntuacion)}</span>
                <span>Calificado con ${ia.calificacionPuntuacion} estrellas</span>
                ${ia.calificacionComentario ? `<span class="rating-user-comment">• "${this.escapeHtml(ia.calificacionComentario)}"</span>` : ''}
              </div>
            </div>
          `;
        } else if (ia.recomendacionId) {
          turnHtml += `
            <div class="chat-inline-rating" id="chat-rating-turn-${turnoKey}">
              <div class="chat-rating-prompt">
                <div class="chat-rating-prompt-left">
                  <span class="chat-rating-label">¿Qué tal te pareció esta recomendación?</span>
                  <div class="chat-star-row" id="star-row-turn-${turnoKey}">
                    <button type="button" class="chat-star-btn" data-rating="1" data-turn="${turnoKey}" title="1 estrella">★</button>
                    <button type="button" class="chat-star-btn" data-rating="2" data-turn="${turnoKey}" title="2 estrellas">★</button>
                    <button type="button" class="chat-star-btn" data-rating="3" data-turn="${turnoKey}" title="3 estrellas">★</button>
                    <button type="button" class="chat-star-btn" data-rating="4" data-turn="${turnoKey}" title="4 estrellas">★</button>
                    <button type="button" class="chat-star-btn" data-rating="5" data-turn="${turnoKey}" title="5 estrellas">★</button>
                  </div>
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

    // Auto-scroll al fondo del área de chat y de la ventana asegurando que llegue hasta abajo
    const scrollDownAll = () => {
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
      const inputBar = document.getElementById('chat-input-bar');
      if (inputBar) {
        inputBar.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };
    scrollDownAll();
    requestAnimationFrame(scrollDownAll);
    setTimeout(scrollDownAll, 60);
    setTimeout(scrollDownAll, 180);
    setTimeout(scrollDownAll, 380);
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
              <span class="chat-rating-stars-symbol">${'★'.repeat(selectedRating)}</span>
              <span>Calificado con ${selectedRating} estrellas</span>
              ${comment ? `<span class="rating-user-comment">• "${this.escapeHtml(comment)}"</span>` : ''}
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
    const chatLayout = document.querySelector('.bento-col-main.chat-layout');
    if (chatLayout) chatLayout.classList.add('has-conversation');

    const resultCard = document.getElementById('result-card');
    const scrollArea = document.getElementById('chat-scroll-area');
    const welcomeState = document.getElementById('chat-welcome-state');
    const threadContainer = document.getElementById('chat-thread-container');
    const loadingBox = document.getElementById('loading-box');
    const inputBar = document.getElementById('chat-input-bar');

    if (!resultCard) return;

    if (inputBar) inputBar.style.display = 'block';

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
          msgEl.innerHTML = this.formatMarkdown(rec.respuesta || 'No se encontraron cursos relacionados con tu búsqueda en nuestro catálogo institucional.');
        }
      }
    } else {
      // Mostrar Vista con Cursos Recomendados
      if (fallbackBox) fallbackBox.style.display = 'none';
      if (successView) successView.style.display = 'block';

      // 1. Curso Destacado (Top 1)
      let topCourse = rec.fuentes[0];
      if (rec.fuentes && rec.fuentes.length > 1 && rec.respuesta) {
        const matching = rec.fuentes.find(f => rec.respuesta.toLowerCase().includes(f.nombre.toLowerCase()));
        if (matching) topCourse = matching;
      }
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
                <div class="similarity-circle-meter">
                  <span class="similarity-circle-val">${simPct}%</span>
                </div>
                <span class="similarity-circle-txt">Compatibilidad</span>
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
        aiTextEl.innerHTML = this.formatMarkdown(rec.respuesta);
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
                <div class="source-item-name">${idx + 1}. ${this.escapeHtml(f.nombre)}</div>
                <div class="source-item-meta">
                  <span>${this.escapeHtml(f.categoria)}</span> <span class="meta-dot">•</span> <span>${this.escapeHtml(f.nivel)}</span> <span class="meta-dot">•</span> 
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin:0 2px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  ${f.duracionHoras} hrs
                </div>
              </div>
              <div class="source-item-right">
                <div class="source-item-sim-badge" title="Compatibilidad: ${simPct}%">
                  <span class="source-item-sim-label">Compatibilidad</span>
                  <span class="source-item-sim">${simPct}%</span>
                </div>
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
        messageEl.textContent = `Calificado con ${currentScore} estrellas`;
        messageEl.style.color = '#15803D';
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
              messageEl.textContent = `Calificado con ${currentScore} estrellas`;
              messageEl.style.color = '#15803D';
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
          <div class="course-footer-meta">
            <span class="course-editorial-hours">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${cursoHoras}h
            </span>
            ${botonInscripcion}
          </div>
          <div class="course-card-actions">
            <div class="course-actions-left">
              ${esAdmin ? `
                <div class="course-rating-avg-badge" style="background: rgba(245, 158, 11, 0.15); color: #D97706; padding: 0.35rem 0.65rem; border-radius: 9999px; font-weight: 700; font-size: 0.78rem; border: 1px solid rgba(245, 158, 11, 0.3); display: inline-flex; align-items: center; gap: 0.3rem;" title="Promedio de calificaciones para administradores">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#D97706" stroke="#D97706" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  <span>${curso.promedioCalificaciones ? curso.promedioCalificaciones.toFixed(1) : 'Sin votos'}</span>
                </div>
              ` : `
                <button type="button" class="btn-rate-course" data-curso-id="${curso.id}" style="background: #F59E0B; color: #FFFFFF; border: none; padding: 0.36rem 0.7rem; border-radius: 9999px; font-weight: 700; font-size: 0.75rem; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 0.3rem;" title="Calificar este curso">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  <span>Calificar</span>
                </button>
              `}
            </div>
            <div class="course-actions-right">
              <button type="button" class="btn-ask-course" title="Preguntar al Asesor RAG">
                Orientar →
              </button>
              <button type="button" class="btn-details-icon" title="Ver ficha técnica del curso" aria-label="Ver detalles">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </button>
            </div>
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

      const rateBtn = card.querySelector('.btn-rate-course');
      if (rateBtn) {
        rateBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.abrirModalCalificarCurso) {
            window.abrirModalCalificarCurso(curso.id, curso.nombre);
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
    const starSvg = `<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

    modal.innerHTML = `
      <div class="modal-editorial-card" style="max-width: 480px; width: 92%; padding: 2rem; background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-medium); box-shadow: 0 25px 35px -5px rgba(0,0,0,0.15), 0 15px 15px -5px rgba(0,0,0,0.06); animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 class="modal-title" style="display: flex; align-items: center; gap: 0.55rem; font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>Calificar Curso</span>
          </h3>
          <button class="modal-close-btn" id="close-rate-course-modal-btn" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted); line-height: 1;">✕</button>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.25rem; line-height: 1.45;">
          Indica tu valoración para el curso <strong style="color: var(--text-primary);">${this.escapeHtml(nombreCurso)}</strong>:
        </p>

        <div class="star-rating-container" style="display: flex; justify-content: center; gap: 0.6rem; margin-bottom: 1.25rem;">
          ${[1, 2, 3, 4, 5].map(star => `
            <button type="button" class="star-btn active" data-star="${star}" style="background: none; border: none; cursor: pointer; transition: transform 0.15s ease; color: #F59E0B; padding: 4px;" title="${star} de 5 estrellas">
              ${starSvg}
            </button>
          `).join('')}
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label for="rate-course-comment" style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-secondary);">Comentario u opinión (opcional):</label>
          <textarea id="rate-course-comment" rows="3" style="width: 100%; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-medium); background: var(--bg-card-subtle, #F8FAFC); color: var(--text-primary); font-family: inherit; resize: vertical;" placeholder="Escribe tu opinión sobre el curso..."></textarea>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
          <button type="button" class="btn-secondary-pill" id="cancel-rate-course-btn" style="padding: 0.55rem 1.1rem; border-radius: 9999px; border: 1px solid var(--border-medium); background: transparent; cursor: pointer; font-weight: 600;">Cancelar</button>
          <button type="button" class="btn-primary-lime" id="submit-rate-course-btn" style="padding: 0.55rem 1.3rem; border-radius: 9999px; border: none; background: #F59E0B; color: white; cursor: pointer; font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>Enviar Calificación</span>
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    const starBtns = modal.querySelectorAll('.star-btn');
    const updateStarDisplay = (count) => {
      starBtns.forEach(sb => {
        const val = parseInt(sb.getAttribute('data-star'), 10);
        if (val <= count) {
          sb.style.color = '#F59E0B';
          sb.style.transform = val === count ? 'scale(1.15)' : 'scale(1)';
        } else {
          sb.style.color = '#CBD5E1';
          sb.style.transform = 'scale(1)';
        }
      });
    };

    starBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        const hoverVal = parseInt(btn.getAttribute('data-star'), 10);
        updateStarDisplay(hoverVal);
      });
      btn.addEventListener('mouseleave', () => {
        updateStarDisplay(selectedStars);
      });
      btn.addEventListener('click', () => {
        selectedStars = parseInt(btn.getAttribute('data-star'), 10);
        updateStarDisplay(selectedStars);
      });
    });

    const closeBtn = modal.querySelector('#close-rate-course-modal-btn');
    const cancelBtn = modal.querySelector('#cancel-rate-course-btn');
    const submitBtn = modal.querySelector('#submit-rate-course-btn');

    const cerrar = () => { modal.style.display = 'none'; };
    if (closeBtn) closeBtn.onclick = cerrar;
    if (cancelBtn) cancelBtn.onclick = cerrar;

    if (submitBtn) {
      submitBtn.onclick = async () => {
        const comentario = modal.querySelector('#rate-course-comment').value.trim();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        try {
          if (onEnviar) {
            await onEnviar(cursoId, selectedStars, comentario);
          }
          cerrar();
        } catch (err) {
          this.showToast(err.message || 'Error al guardar la calificación', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Enviar Calificación</span>`;
        }
      };
    }
  },

  // Modal de Confirmación para Matrícula / Inscripción en Curso
  mostrarModalConfirmacionInscripcion(curso, onConfirmar) {
    let modal = document.getElementById('modal-confirmar-inscripcion');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-confirmar-inscripcion';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const nombreCurso = this.escapeHtml(curso.nombre || 'Curso Académico');
    const categoria = this.escapeHtml(curso.categoria || 'Especialidad');
    const nivel = this.escapeHtml(curso.nivel || 'Intermedio');
    const horas = curso.duracionHoras || 40;

    modal.innerHTML = `
      <div class="modal-editorial-card" style="max-width: 480px; width: 92%; padding: 2rem; background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-medium); box-shadow: 0 25px 35px -5px rgba(0,0,0,0.15), 0 15px 15px -5px rgba(0,0,0,0.06); animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
        <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem;">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: rgba(215, 243, 56, 0.2); border: 1px solid rgba(163, 190, 20, 0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #18191E;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
          </div>
          <div style="flex: 1;">
            <h3 style="margin: 0 0 0.35rem 0; font-size: 1.25rem; font-weight: 800; color: var(--text-primary); line-height: 1.3;">¿Confirmar Matrícula?</h3>
            <p style="margin: 0; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.45;">
              Estás a punto de matricularte oficialmente en el programa académico:
            </p>
          </div>
          <button type="button" id="close-confirm-enroll-btn" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted); line-height: 1;">✕</button>
        </div>

        <div style="background: var(--bg-card-subtle, #F8FAFC); border: 1px solid var(--border-subtle, #E2E8F0); border-radius: 12px; padding: 1rem 1.2rem; margin-bottom: 1.4rem;">
          <div style="font-weight: 800; font-size: 1rem; color: var(--text-primary); margin-bottom: 0.5rem; line-height: 1.35;">
            ${nombreCurso}
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
            <span class="badge-cat" style="font-size: 0.75rem;">${categoria}</span>
            <span class="badge-level" style="font-size: 0.75rem;">${nivel}</span>
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); display: inline-flex; align-items: center; gap: 0.25rem;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${horas}h
            </span>
          </div>
        </div>

        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.4;">
          ℹ️ Esta asignatura se registrará en tu historial de inscripciones y tu progreso estará disponible en la plataforma.
        </p>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
          <button type="button" class="btn-secondary-pill" id="cancel-confirm-enroll-btn" style="padding: 0.55rem 1.1rem; border-radius: 9999px; border: 1px solid var(--border-medium); background: transparent; cursor: pointer; font-weight: 600; font-size: 0.88rem;">
            Cancelar
          </button>
          <button type="button" class="btn-primary-lime" id="accept-confirm-enroll-btn" style="padding: 0.55rem 1.3rem; border-radius: 9999px; border: none; background: #D7F338; color: #18191E; cursor: pointer; font-weight: 800; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Confirmar e Inscribirme</span>
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    const cerrar = () => {
      modal.style.display = 'none';
    };

    const closeBtn = document.getElementById('close-confirm-enroll-btn');
    const cancelBtn = document.getElementById('cancel-confirm-enroll-btn');
    const acceptBtn = document.getElementById('accept-confirm-enroll-btn');

    if (closeBtn) closeBtn.onclick = cerrar;
    if (cancelBtn) cancelBtn.onclick = cerrar;

    if (acceptBtn) {
      acceptBtn.onclick = () => {
        cerrar();
        if (onConfirmar) onConfirmar();
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
      enrollmentBtnHtml = '';
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
          ${enrollmentBtnHtml ? `<div class="modal-footer-left">${enrollmentBtnHtml}</div>` : ''}
          <div class="modal-footer-actions">
            <button type="button" class="btn-secondary-pill" id="modal-rate-course-btn" title="Calificar este curso">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>Calificar</span>
            </button>
            <button class="btn-primary-lime" id="modal-ask-rag-btn">
              <span>Orientar con IA</span>
              <span class="btn-arrow">➔</span>
            </button>
            <button class="btn-secondary-pill" id="modal-close-course-btn">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    const closeBtn = document.getElementById('close-course-modal-btn');
    const closeBtn2 = document.getElementById('modal-close-course-btn');
    const askBtn = document.getElementById('modal-ask-rag-btn');
    const enrollBtn = document.getElementById('modal-enroll-course-btn');
    const rateBtn = document.getElementById('modal-rate-course-btn');

    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    if (closeBtn2) closeBtn2.onclick = () => modal.style.display = 'none';
    if (askBtn) {
      askBtn.onclick = () => {
        modal.style.display = 'none';
        window.consultarCursoSemantico(curso.nombre);
      };
    }
    if (rateBtn) {
      rateBtn.onclick = () => {
        modal.style.display = 'none';
        if (typeof window.abrirModalCalificarCurso === 'function') {
          window.abrirModalCalificarCurso(curso.id, curso.nombre);
        }
      };
    }
    if (enrollBtn) {
      enrollBtn.onclick = (e) => {
        e.stopPropagation();
        modal.style.display = 'none';
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
  renderCursosAdmin(cursos, onEditar, onToggleActivo, docentes = []) {
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
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No se encontraron cursos que coincidan con el criterio de búsqueda.
          </td>
        </tr>
      `;
      return;
    }

    cursos.forEach(c => {
      const tr = document.createElement('tr');
      const esActivo = c.activo !== false;

      const docentesAsignados = (docentes || []).filter(d =>
        d.areaEspecialidad && c.categoria &&
        d.areaEspecialidad.trim().toLowerCase() === c.categoria.trim().toLowerCase()
      );

      let docenteHtml = '';
      if (docentesAsignados.length > 0) {
        docenteHtml = docentesAsignados.map(d => `
          <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.2rem;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #4F46E5; flex-shrink: 0;"></span>
            <span style="font-weight: 600; font-size: 0.82rem; color: #1E293B;">${d.nombre}</span>
          </div>
        `).join('');
      } else {
        docenteHtml = `<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Sin docente asignado</span>`;
      }

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-muted); font-size: 0.8rem;">#${c.id}</td>
        <td>
          <div class="course-table-title" style="font-weight: 800; color: #18191E; font-size: 0.95rem;">${c.nombre}</div>
          <div class="course-table-desc" style="font-size: 0.82rem; color: #4B5563; margin-top: 0.3rem; line-height: 1.45; max-width: 450px; white-space: normal;">${c.descripcion || 'Sin descripción'}</div>
          <div class="course-table-prereq" style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.25rem; font-style: italic;">${c.prerrequisitos ? '📌 Prerrequisitos: ' + c.prerrequisitos : 'Sin prerrequisitos'}</div>
        </td>
        <td><span class="catalog-badge-cat" style="font-size:0.75rem;">${c.categoria}</span></td>
        <td>${docenteHtml}</td>
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
  mostrarModalCursoAdmin(curso = null, docentes = []) {
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
    const docenteGroup = document.getElementById('course-form-docente-group');
    const docenteSelect = document.getElementById('course-form-docente');

    if (docenteGroup) docenteGroup.style.display = 'block';

    if (docenteSelect) {
      docenteSelect.innerHTML = '<option value="">-- Seleccionar Docente / Cátedra --</option>';
      (docentes || []).forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.areaEspecialidad || '';
        opt.dataset.docenteNombre = d.nombre;
        opt.dataset.docenteId = d.id;
        opt.textContent = `${d.nombre} — Cátedra: ${d.areaEspecialidad || 'General'}`;
        if (curso && curso.categoria && d.areaEspecialidad &&
            curso.categoria.trim().toLowerCase() === d.areaEspecialidad.trim().toLowerCase()) {
          opt.selected = true;
        }
        docenteSelect.appendChild(opt);
      });

      docenteSelect.onchange = (e) => {
        if (e.target.value && catInput) {
          catInput.value = e.target.value;
        }
      };
    }

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
                ${this.formatMarkdown(h.respuesta) || 'Sin respuesta detallada registrada.'}
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
                <span style="display:inline-flex; align-items:center; gap:0.35rem;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  ${estudiante.correoElectronico}
                </span>
                <span style="display:inline-flex; align-items:center; gap:0.35rem;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                  Nivel: <strong>${estudiante.nivelExperiencia || 'General'}</strong>
                </span>
                <span style="display:inline-flex; align-items:center; gap:0.35rem;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                  Área: <strong>${estudiante.areaInteres || 'Tecnología'}</strong>
                </span>
                <span style="display:inline-flex; align-items:center; gap:0.35rem;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Registro: ${fecha}
                </span>
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
              <div style="color: #4B5563; font-size: 0.88rem; font-weight: 500; margin-top: 0.15rem; display: flex; align-items: center; gap: 0.35rem;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <strong>${est.correoElectronico}</strong>
              </div>
              <div style="color: var(--text-muted); font-size: 0.78rem; margin-top: 0.2rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="display:inline-flex; align-items:center; gap:0.25rem;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                  ${est.nivelExperiencia || 'General'}
                </span>
                <span>•</span>
                <span style="display:inline-flex; align-items:center; gap:0.25rem;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                  ${est.areaInteres || 'Tecnología'}
                </span>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>Coincidencias encontradas para "${query}" (${estudiantes.length})</span>
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
        <div class="notfound-icon-box" style="display:flex; align-items:center; justify-content:center;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
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
  // Renderizado de Consulta de Estudiantes para el Rol DOCENTE
  // ==========================================================
  renderDocenteEstudiantes(estudiantes, onVerHistorial) {
    const tbody = document.getElementById('docente-students-tbody');
    const totalEl = document.getElementById('docente-students-count-total');
    const princEl = document.getElementById('docente-students-count-principiante');
    const avanEl = document.getElementById('docente-students-count-avanzado');

    if (!tbody) return;

    const lista = estudiantes || [];
    const principiantes = lista.filter(e => (e.nivelExperiencia || '').toLowerCase() === 'principiante');
    const avanzados = lista.filter(e => (e.nivelExperiencia || '').toLowerCase() !== 'principiante');

    if (totalEl) totalEl.textContent = lista.length;
    if (princEl) princEl.textContent = principiantes.length;
    if (avanEl) avanEl.textContent = avanzados.length;

    tbody.innerHTML = '';

    if (lista.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No tienes estudiantes matriculados en tus cursos aún, o no coinciden con el filtro.
          </td>
        </tr>
      `;
      return;
    }

    lista.forEach(est => {
      const tr = document.createElement('tr');
      const initials = (est.nombreCompleto || 'E').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

      let cursosHtml = '';
      if (est.cursosInscritos && est.cursosInscritos.length > 0) {
        cursosHtml = est.cursosInscritos.map(c => `
          <span style="display: inline-block; background: #EEF2FF; color: #3730A3; border: 1px solid #C7D2FE; border-radius: 6px; padding: 0.15rem 0.5rem; font-size: 0.76rem; font-weight: 600; margin-right: 0.3rem; margin-bottom: 0.2rem;">
            ${this.escapeHtml(c)}
          </span>
        `).join('');
      } else {
        cursosHtml = `<span style="color: #64748B; font-size: 0.78rem; font-style: italic;">Matriculado en especialidad</span>`;
      }

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-muted); font-size: 0.82rem;">#${est.id}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: #D7F338; color: #18191E; font-weight: 800; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${initials}
            </div>
            <div>
              <div style="font-weight: 700; color: #18191E;">${this.escapeHtml(est.nombreCompleto)}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="color: var(--text-secondary); font-size: 0.85rem;">${this.escapeHtml(est.correoElectronico)}</span>
        </td>
        <td>
          <div style="display: flex; flex-wrap: wrap; gap: 0.2rem;">
            ${cursosHtml}
          </div>
        </td>
        <td>
          <span class="status-pill ${est.nivelExperiencia === 'Principiante' ? 'respondida' : 'sin-resultados'}" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;">
            ${est.nivelExperiencia || 'General'}
          </span>
        </td>
        <td style="text-align: right;">
          <button type="button" class="btn-table-action btn-action-inspect-docente" data-id="${est.id}" style="background: #18191E; color: #FFFFFF; padding: 0.4rem 0.85rem; border-radius: 8px; font-weight: 700; font-size: 0.78rem; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Consultar</span>
          </button>
        </td>
      `;

      const inspectBtn = tr.querySelector('.btn-action-inspect-docente');
      if (inspectBtn && onVerHistorial) {
        inspectBtn.addEventListener('click', () => onVerHistorial(est));
      }

      tbody.appendChild(tr);
    });
  },

  renderFichaEstudianteDocente(estudiante, historial, onCerrar) {
    const container = document.getElementById('docente-student-inspection-result');
    if (!container) return;

    const initials = (estudiante.nombreCompleto || 'E').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const fecha = estudiante.fechaCreacion ? new Date(estudiante.fechaCreacion).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Registrado';

    let cursosHtml = '';
    if (estudiante.cursosInscritos && estudiante.cursosInscritos.length > 0) {
      cursosHtml = estudiante.cursosInscritos.map(c => `
        <span style="display: inline-flex; align-items: center; gap: 0.3rem; background: #EEF2FF; color: #3730A3; border: 1px solid #C7D2FE; border-radius: 9999px; padding: 0.25rem 0.75rem; font-size: 0.8rem; font-weight: 700;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          ${this.escapeHtml(c)}
        </span>
      `).join('');
    } else {
      cursosHtml = `<span style="color: #64748B; font-size: 0.82rem; font-style: italic;">Matriculado en cursos de tu cátedra</span>`;
    }

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
                  <span style="color: #7C3AED; margin-right: 0.4rem;">#${idx + 1}</span> "${this.escapeHtml(h.pregunta)}"
                </div>
                <span class="admin-history-date">${h.fecha ? new Date(h.fecha).toLocaleString('es-CO') : ''}</span>
              </div>
              <div class="admin-history-resp">
                ${this.formatMarkdown(h.respuesta) || 'Sin respuesta detallada registrada.'}
              </div>
              ${h.puntuacion ? `
                <div class="admin-history-rating">
                  <span>★ Calificación del Alumno: ${h.puntuacion}/5</span>
                  ${h.comentario ? `<span>• "${this.escapeHtml(h.comentario)}"</span>` : ''}
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
                ${this.escapeHtml(estudiante.nombreCompleto)}
                <span class="id-badge">ID #${estudiante.id}</span>
              </h3>
              <div class="inspection-meta-tags">
                <span style="display:inline-flex; align-items:center; gap:0.35rem;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  ${this.escapeHtml(estudiante.correoElectronico)}
                </span>
                <span style="display:inline-flex; align-items:center; gap:0.35rem;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                  Nivel: <strong>${estudiante.nivelExperiencia || 'General'}</strong>
                </span>
                <span style="display:inline-flex; align-items:center; gap:0.35rem;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                  Área: <strong>${estudiante.areaInteres || 'Tecnología'}</strong>
                </span>
                <span style="display:inline-flex; align-items:center; gap:0.35rem;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Registro: ${fecha}
                </span>
              </div>
            </div>
          </div>
          <button type="button" class="btn-close-inspection" id="btn-close-docente-student-inspection">
            ✕ Cerrar Ficha
          </button>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1rem 1.25rem; margin-top: 1rem;">
          <div style="font-size: 0.82rem; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
            Asignaturas de tu Especialidad en las que está Matriculado:
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${cursosHtml}
          </div>
        </div>

        <div class="student-history-section">
          <h4>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Historial Vocacional RAG (${historial ? historial.length : 0})</span>
          </h4>
          ${historialHtml}
        </div>
      </div>
    `;

    container.style.display = 'block';

    const closeBtn = document.getElementById('btn-close-docente-student-inspection');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        container.style.display = 'none';
        container.innerHTML = '';
        if (onCerrar) onCerrar();
      });
    }

    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  renderResultadosBusquedaEstudiantesDocente(query, estudiantes, onVerHistorial) {
    const container = document.getElementById('docente-student-inspection-result');
    if (!container) return;

    if (!estudiantes || estudiantes.length === 0) {
      this.renderErrorEstudianteDocente(query, 'No se encontraron estudiantes matriculados en tus cursos');
      return;
    }

    const itemsHtml = estudiantes.map(est => {
      const initials = (est.nombreCompleto || 'E').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      let cursosHtml = (est.cursosInscritos || []).map(c => `
        <span style="background: #EEF2FF; color: #3730A3; border: 1px solid #C7D2FE; border-radius: 4px; padding: 0.1rem 0.4rem; font-size: 0.74rem;">${this.escapeHtml(c)}</span>
      `).join(' ');

      return `
        <div class="search-result-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: #D7F338; color: #18191E; font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${initials}
            </div>
            <div>
              <div style="font-weight: 700; color: #18191E; font-size: 1rem;">
                ${this.escapeHtml(est.nombreCompleto)}
                <span class="id-badge" style="font-size: 0.72rem; margin-left: 0.35rem;">ID #${est.id}</span>
              </div>
              <div style="color: #4B5563; font-size: 0.88rem; font-weight: 500; margin-top: 0.15rem;">
                <strong>${this.escapeHtml(est.correoElectronico)}</strong>
              </div>
              <div style="margin-top: 0.25rem;">${cursosHtml}</div>
            </div>
          </div>
          <button type="button" class="btn-inspect-single-docente" data-id="${est.id}" style="background: #18191E; color: #FFFFFF; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem;">
            <span>Ver Ficha</span>
            <span style="color: #D7F338;">➔</span>
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="admin-search-results-card" style="background: #FAF8F2; border: 1px solid #E2E8F0; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h4 style="font-weight: 800; color: #18191E; font-size: 1.05rem; display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>Estudiantes encontrados en tu cátedra para "${this.escapeHtml(query)}" (${estudiantes.length})</span>
          </h4>
          <button type="button" class="btn-close-inspection" id="btn-close-docente-results-card" style="background: #E2E8F0; color: #475569; border: none; padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; cursor: pointer;">
            ✕ Cerrar
          </button>
        </div>
        <div class="search-results-list">
          ${itemsHtml}
        </div>
      </div>
    `;

    container.style.display = 'block';

    const closeBtn = document.getElementById('btn-close-docente-results-card');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        container.style.display = 'none';
        container.innerHTML = '';
      });
    }

    container.querySelectorAll('.btn-inspect-single-docente').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const est = estudiantes.find(e => e.id === id);
        if (est && onVerHistorial) onVerHistorial(est);
      });
    });

    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  renderErrorEstudianteDocente(queryConsultada, mensajeError = null) {
    const container = document.getElementById('docente-student-inspection-result');
    if (!container) return;

    container.innerHTML = `
      <div class="student-notfound-card" style="background:#FFF7ED; border-color:#FFEDD5;">
        <div class="notfound-icon" style="background:#FFEDD5; color:#EA580C;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="notfound-body" style="flex: 1;">
          <h4 style="color:#9A3412;">Sin coincidencias en tus asignaturas</h4>
          <p style="color:#C2410C;">
            No se encontró ningún estudiante matriculado en tus cursos con: <strong>"${this.escapeHtml(queryConsultada)}"</strong>.
          </p>
          <p style="margin-top: 0.35rem; font-size: 0.82rem; color:#9A3412; opacity: 0.9;">
            ${mensajeError ? `<em>"${this.escapeHtml(mensajeError)}"</em>. ` : ''}Solo los alumnos inscritos en asignaturas de tu especialidad están disponibles para consulta docente.
          </p>
        </div>
        <button type="button" class="btn-close-inspection" id="btn-close-docente-error-card" style="background:#FED7AA; border-color:#FDBA74; color:#7C2D12;">
          ✕ Ocultar
        </button>
      </div>
    `;

    container.style.display = 'block';

    const closeBtn = document.getElementById('btn-close-docente-error-card');
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
        ? `<span class="badge-prereq" title="${curso.prerrequisitos}" style="font-size: 0.8rem; background: #F1F5F9; padding: 3px 8px; border-radius: 6px; border: 1px solid #E2E8F0; color: #334155; display: inline-flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            ${curso.prerrequisitos}
           </span>`
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
            <span class="badge-inscritos" title="${numInscritos} ${numInscritos === 1 ? 'inscrito' : 'inscritos'}" style="display: inline-flex; align-items: center; gap: 4px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <strong>${numInscritos}</strong>
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
        <div class="docente-roster-empty">
          <div class="docente-roster-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
          </div>
          <h4 style="font-weight: 700; color: #1E293B; font-size: 1.05rem; margin-bottom: 0.35rem;">Aún no hay estudiantes inscritos en esta materia</h4>
          <p style="font-size: 0.88rem; color: #64748B; max-width: 440px; margin: 0 auto; line-height: 1.5;">
            Tan pronto los alumnos seleccionen esta asignatura en el catálogo o reciban su orientación vocacional con IA, aparecerán registrados en esta nómina.
          </p>
        </div>
      `;
    } else {
      studentsHtml = `
        <div class="docente-roster-table-wrapper">
          <div class="docente-roster-scroll">
            <table class="docente-roster-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Correo Institucional</th>
                  <th>Nivel</th>
                  <th>Fecha Matrícula</th>
                  <th style="text-align: right;">Estado</th>
                </tr>
              </thead>
              <tbody>
                ${inscritos.map(ins => {
                  const nombre = ins.estudianteNombre || 'Estudiante';
                  const correo = ins.estudianteCorreo || '-';
                  const area = ins.estudianteAreaInteres || 'Tecnología';
                  const nivel = ins.estudianteNivel || 'Principiante';
                  const fecha = ins.fechaInscripcion
                    ? new Date(ins.fechaInscripcion).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Reciente';
                  const estado = ins.estado || 'Inscrito';

                  return `
                    <tr>
                      <td>
                        <div class="docente-student-info">
                          <span class="docente-student-name">${this.escapeHtml(nombre)}</span>
                          <span class="docente-student-interest">
                            <span>Área:</span> <strong>${this.escapeHtml(area)}</strong>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div class="docente-student-email" title="${this.escapeHtml(correo)}">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                          <span>${this.escapeHtml(correo)}</span>
                        </div>
                      </td>
                      <td>
                        <span class="badge-level badge-level-${nivel.toLowerCase()}">${this.escapeHtml(nivel)}</span>
                      </td>
                      <td>
                        <span class="docente-date-badge">${fecha}</span>
                      </td>
                      <td style="text-align: right;">
                        <span class="status-badge status-badge-active" style="font-size: 0.72rem; padding: 0.2rem 0.65rem; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;">
                          <span class="status-dot"></span> ${this.escapeHtml(estado)}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="modal-editorial-card modal-docente-roster-card">
        <div class="modal-header" style="margin-bottom: 0.75rem;">
          <div class="course-modal-badges">
            <span class="badge-cat">${curso.categoria || 'Especialidad'}</span>
            <span class="badge-level badge-level-${(curso.nivel || 'Intermedio').toLowerCase()}">${curso.nivel || 'Intermedio'}</span>
            <span class="badge-inscritos" style="background: #E0E7FF; color: #4338CA; border-color: #C7D2FE; display: inline-flex; align-items: center; gap: 5px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span>${total} matriculado${total === 1 ? '' : 's'}</span>
            </span>
          </div>
          <button class="modal-close-btn" id="close-inscritos-modal-btn" aria-label="Cerrar modal">✕</button>
        </div>
        
        <h3 class="modal-course-title" style="font-size: 1.4rem; margin-bottom: 0.35rem; color: #0F172A;">${this.escapeHtml(curso.nombre || 'Materia')}</h3>
        <p class="modal-course-desc" style="margin-bottom: 1.25rem; font-size: 0.88rem; color: #64748B;">
          Nómina oficial de estudiantes inscritos en esta materia académica (${curso.duracionHoras || 40} horas lectivas).
        </p>

        ${studentsHtml}

        <div class="modal-course-footer" style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="font-size: 0.84rem; color: #64748B;">
            Total en nómina: <strong style="color: #0F172A;">${total}</strong> estudiante${total === 1 ? '' : 's'}
          </div>
          <button class="btn-secondary-pill" id="btn-close-inscritos-footer" style="padding: 0.55rem 1.4rem; font-weight: 700;">
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
  },

  renderDocenteFeedback(feedbackList) {
    const container = document.getElementById('docente-feedback-container');
    if (!container) return;

    if (!feedbackList || feedbackList.length === 0) {
      container.innerHTML = `
        <div class="empty-state-editorial" style="text-align: center; padding: 3rem 1.5rem; background: #FFFFFF; border-radius: 16px; border: 1px dashed #CBD5E1; margin-top: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #F1F5F9; color: #64748B; margin: 0 auto 0.75rem; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
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
          <div style="font-size: 0.85rem; color: #1E293B; display: flex; align-items: center; gap: 0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span>Curso sugerido: <strong>${item.cursoNombre || 'Asignatura'}</strong> <span style="color: #64748B;">(${item.cursoCategoria || 'Especialidad'})</span></span>
          </div>
          ${item.comentario ? `
            <div style="font-size: 0.85rem; color: #047857; font-weight: 500; display: flex; align-items: center; gap: 0.3rem;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span>"${item.comentario}"</span>
            </div>` : ''}
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
      const topList = (data.topCursosRecomendados && data.topCursosRecomendados.length > 0)
        ? data.topCursosRecomendados
        : (data.cursoMasRecomendado && data.cursoMasRecomendado !== 'Ninguno aún' ? [data.cursoMasRecomendado] : []);

      if (topList.length === 0) {
        cursoTop.innerHTML = `<div style="font-size:0.9rem; font-weight:600; color:#6B7280; padding:0.5rem 0;">Sin recomendaciones registradas aún</div>`;
      } else {
        const medalStyles = [
          { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', label: '1' },
          { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', label: '2' },
          { bg: '#FFEDD5', color: '#C2410C', border: '#FED7AA', label: '3' }
        ];

        cursoTop.innerHTML = topList.slice(0, 3).map((cursoStr, idx) => {
          const medal = medalStyles[idx] || { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB', label: `${idx + 1}` };
          const match = cursoStr.match(/^(.*?)\s*\((\d+)\s*recomendaciones?\)$/);
          const nombre = match ? match[1].trim() : cursoStr;
          const count = match ? match[2] : null;

          return `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.65rem; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 0.65rem 0.85rem; box-shadow: 0 1px 4px rgba(0,0,0,0.02);">
              <div style="display: flex; align-items: center; gap: 0.6rem; min-width: 0; flex: 1;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; font-weight: 800; font-size: 0.78rem; background: ${medal.bg}; color: ${medal.color}; border: 1px solid ${medal.border}; flex-shrink: 0;">
                  ${medal.label}
                </span>
                <span style="font-size: 0.88rem; font-weight: 700; color: #1E293B; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" title="${nombre}">
                  ${nombre}
                </span>
              </div>
              ${count !== null ? `
                <span style="background: rgba(124, 58, 237, 0.08); color: #7C3AED; font-weight: 800; font-size: 0.73rem; padding: 0.2rem 0.5rem; border-radius: 9999px; white-space: nowrap; flex-shrink: 0;">
                  ${count} rec.
                </span>
              ` : ''}
            </div>
          `;
        }).join('');
      }
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
                <span style="display:inline-flex; align-items:center; gap:0.35rem;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  ${d.fecha}
                </span>
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
          const userIconSvg = isAdm
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#991B1B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

          return `
            <tr>
              <td style="font-weight:700; color:#18191E;">
                <span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:#F1F5F9; margin-right:0.5rem; font-size:0.78rem;">
                  ${userIconSvg}
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
    // Actualizar KPIs de la vista de Auditoría Dedicada si existen
    const totalAuditEl = document.getElementById('audit-kpi-total');
    const ingresosAuditEl = document.getElementById('audit-kpi-ingresos');
    const registrosAuditEl = document.getElementById('audit-kpi-registros');
    const usuariosAuditEl = document.getElementById('audit-kpi-usuarios');

    if (totalAuditEl) totalAuditEl.textContent = list.length;
    if (ingresosAuditEl) ingresosAuditEl.textContent = list.filter(i => i.tipoEvento === 'INGRESO').length;
    if (registrosAuditEl) registrosAuditEl.textContent = list.filter(i => i.tipoEvento === 'REGISTRO').length;
    if (usuariosAuditEl) {
      const unicos = new Set(list.map(i => i.usuarioEmail).filter(Boolean));
      usuariosAuditEl.textContent = unicos.size;
    }

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
        const text = `${item.usuarioEmail || ''} ${item.usuarioNombre || ''} ${item.detalle || ''} ${item.tipoEvento || ''} ${item.rol || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#6B7280; padding:2.5rem;">No se encontraron registros de auditoría que coincidan con el filtro.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      const isIngreso = item.tipoEvento === 'INGRESO';
      const badgeEventStyle = isIngreso ? 'background:#DCFCE7; color:#166534; border:1px solid #BBF7D0;' : 'background:#FEF08A; color:#854D0E; border:1px solid #FDE047;';
      const isAdm = item.rol === 'ADMINISTRADOR';
      const badgeRolStyle = isAdm ? 'background:#FEE2E2; color:#991B1B;' : 'background:#E0E7FF; color:#3730A3;';

      const eventIconSvg = isIngreso
        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-right:3px;"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>`
        : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px; margin-right:3px;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>`;

      const fechaFmt = item.fecha ? new Date(item.fecha).toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'medium'
      }) : '-';

      return `
        <tr>
          <td style="font-weight:700; color:#64748B;">#${item.id}</td>
          <td style="font-size:0.83rem; color:#334155; white-space:nowrap;">${fechaFmt}</td>
          <td>
            <span style="font-size:0.75rem; font-weight:800; padding:0.25rem 0.65rem; border-radius:12px; display:inline-flex; align-items:center; ${badgeEventStyle}">
              ${eventIconSvg}
              ${isIngreso ? 'INGRESO' : 'REGISTRO'}
            </span>
          </td>
          <td style="font-weight:700; color:#1E293B;">${item.usuarioNombre || 'Usuario'}</td>
          <td style="font-family:monospace; font-size:0.83rem; color:#475569; word-break:break-all;">${item.usuarioEmail}</td>
          <td>
            <span style="font-size:0.75rem; font-weight:800; padding:0.25rem 0.6rem; border-radius:12px; ${badgeRolStyle}">
              ${item.rol}
            </span>
          </td>
          <td style="font-size:0.85rem; color:#475569; word-break:break-word;">${item.detalle || '-'}</td>
        </tr>
      `;
    }).join('');
  },

  // ==========================================================
  // GESTIÓN DE USUARIOS Y ROLES (SUPERADMIN & ADMINISTRADOR)
  // ==========================================================
  renderUsuariosAdmin(usuarios, onCambiarPassword, currentRole = 'ADMINISTRADOR', cursos = [], onVerCursosDocente = null) {
    const tbody = document.getElementById('admin-users-tbody');
    const totalEl = document.getElementById('users-count-total');
    const superEl = document.getElementById('users-count-superadmin');
    const adminEl = document.getElementById('users-count-admin');
    const docEl = document.getElementById('users-count-docente');
    const estEl = document.getElementById('users-count-estudiante');
    const subtitleEl = document.getElementById('admin-users-subtitle');
    const badgeTagEl = document.getElementById('admin-users-badge-tag');

    // Adaptar métricas y filtros según rol
    const isSuper = currentRole === 'SUPERADMIN';
    const superCard = superEl ? superEl.closest('.admin-summary-card') : null;
    const adminCard = adminEl ? adminEl.closest('.admin-summary-card') : null;

    if (superCard) superCard.style.display = isSuper ? '' : 'none';
    if (adminCard) adminCard.style.display = isSuper ? '' : 'none';

    const roleFilterSelect = document.getElementById('admin-user-role-filter');
    if (roleFilterSelect) {
      const optSuper = roleFilterSelect.querySelector('option[value="SUPERADMIN"]');
      const optAdmin = roleFilterSelect.querySelector('option[value="ADMINISTRADOR"]');
      if (optSuper) optSuper.style.display = isSuper ? '' : 'none';
      if (optAdmin) optAdmin.style.display = isSuper ? '' : 'none';
      if (!isSuper && (roleFilterSelect.value === 'SUPERADMIN' || roleFilterSelect.value === 'ADMINISTRADOR')) {
        roleFilterSelect.value = 'todos';
      }
    }

    if (subtitleEl && badgeTagEl) {
      if (isSuper) {
        badgeTagEl.textContent = 'Permisos Superadmin Totales';
        badgeTagEl.style.background = 'rgba(124, 58, 237, 0.15)';
        badgeTagEl.style.color = '#7C3AED';
        subtitleEl.innerHTML = '<strong>Permisos totales de Superadmin:</strong> Puedes crear Administradores, Docentes y Estudiantes, y configurar las contraseñas de todos los usuarios del sistema.';
      } else {
        badgeTagEl.textContent = 'Gestión Docentes y Estudiantes';
        badgeTagEl.style.background = 'rgba(37, 99, 235, 0.12)';
        badgeTagEl.style.color = '#2563EB';
        subtitleEl.innerHTML = '<strong>Gestión de Usuarios Académicos:</strong> Vista filtrada de Docentes y Estudiantes. Puedes registrar nuevos perfiles académicos y configurar sus contraseñas.';
      }
    }

    // Al Administrador solo se le enlisten usuarios (Estudiantes) y Docentes, nunca Superadmins ni otros Administradores
    const usuariosVisibles = isSuper
      ? usuarios
      : usuarios.filter(u => {
          const r = (u.rol || '').toUpperCase();
          return r === 'DOCENTE' || r === 'ESTUDIANTE';
        });

    if (totalEl) totalEl.textContent = usuariosVisibles.length;
    if (superEl) superEl.textContent = usuarios.filter(u => (u.rol || '').toUpperCase() === 'SUPERADMIN').length;
    if (adminEl) adminEl.textContent = usuarios.filter(u => (u.rol || '').toUpperCase() === 'ADMINISTRADOR').length;
    if (docEl) docEl.textContent = usuariosVisibles.filter(u => (u.rol || '').toUpperCase() === 'DOCENTE').length;
    if (estEl) estEl.textContent = usuariosVisibles.filter(u => (u.rol || '').toUpperCase() === 'ESTUDIANTE').length;

    if (!tbody) return;
    tbody.innerHTML = '';

    if (usuariosVisibles.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No hay usuarios registrados con los criterios seleccionados.
          </td>
        </tr>
      `;
      return;
    }

    usuariosVisibles.forEach(u => {
      const tr = document.createElement('tr');
      const initials = (u.nombreCompleto || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      const fecha = u.fechaCreacion ? new Date(u.fechaCreacion).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Registrado';

      let roleBadgeHtml = '';
      const r = (u.rol || '').toUpperCase();
      if (r === 'SUPERADMIN') {
        roleBadgeHtml = `<span class="user-role-badge role-badge-superadmin">★ Superadmin</span>`;
      } else if (r === 'ADMINISTRADOR') {
        roleBadgeHtml = `<span class="user-role-badge role-badge-admin">Administrador</span>`;
      } else if (r === 'DOCENTE') {
        roleBadgeHtml = `<span class="user-role-badge role-badge-docente">Docente</span>`;
      } else {
        roleBadgeHtml = `<span class="user-role-badge role-badge-student">Estudiante</span>`;
      }

      const areaText = u.areaInteres || u.departamentoFacultad || u.nivelExperiencia || 'General';

      // Calcular cursos asignados para docentes
      const cursosDocente = r === 'DOCENTE'
        ? (cursos || []).filter(c => c.categoria && areaText && c.categoria.trim().toLowerCase() === areaText.trim().toLowerCase())
        : [];

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-muted); font-size: 0.82rem;">#${u.id}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: ${r === 'SUPERADMIN' ? '#7C3AED' : (r === 'ADMINISTRADOR' ? '#2563EB' : (r === 'DOCENTE' ? '#4F46E5' : '#D7F338'))}; color: ${r === 'ESTUDIANTE' ? '#18191E' : '#FFFFFF'}; font-weight: 800; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${initials}
            </div>
            <div>
              <div style="font-weight: 700; color: #18191E;">${u.nombreCompleto}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="font-family: monospace; font-size: 0.84rem; color: #475569;">${u.correoElectronico}</span>
        </td>
        <td>${roleBadgeHtml}</td>
        <td>
          <span style="font-size: 0.84rem; font-weight: 600; color: #334155;">${areaText}</span>
          ${r === 'DOCENTE' ? `
            <div style="margin-top: 0.25rem;">
              <span class="catalog-badge-cat" style="font-size: 0.72rem; background: rgba(79, 70, 229, 0.1); color: #4F46E5; border: 1px solid rgba(79, 70, 229, 0.2); font-weight: 700; padding: 0.12rem 0.45rem; border-radius: 6px;">
                ${cursosDocente.length} ${cursosDocente.length === 1 ? 'curso asignado' : 'cursos asignados'}
              </span>
            </div>
          ` : ''}
        </td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${fecha}</td>
        <td style="text-align: right; white-space: nowrap;">
          ${r === 'DOCENTE' ? `
            <button type="button" class="btn-table-action btn-action-view-docente-courses" data-id="${u.id}" style="background: rgba(79, 70, 229, 0.1); color: #4F46E5; border: 1px solid rgba(79, 70, 229, 0.25); padding: 0.4rem 0.75rem; border-radius: 8px; font-weight: 700; font-size: 0.78rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; margin-right: 0.4rem; transition: all 0.2s;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Ver Cursos</span>
            </button>
          ` : ''}
          <button type="button" class="btn-table-action btn-action-change-pwd" data-id="${u.id}" style="background: #0F172A; color: #FFFFFF; padding: 0.4rem 0.85rem; border-radius: 8px; font-weight: 700; font-size: 0.78rem; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: background 0.2s;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 2l-2 2m-1.5 1.5L14 9l-3 3-4-1-4 4 4 4 1 4 4-4-1-4 3.5-3.5L20 4l2-2z"></path>
            </svg>
            <span>Contraseña</span>
          </button>
        </td>
      `;

      const btnPwd = tr.querySelector('.btn-action-change-pwd');
      if (btnPwd && onCambiarPassword) {
        btnPwd.addEventListener('click', () => onCambiarPassword(u));
      }

      const btnViewCourses = tr.querySelector('.btn-action-view-docente-courses');
      if (btnViewCourses && onVerCursosDocente) {
        btnViewCourses.addEventListener('click', () => onVerCursosDocente(u, cursosDocente));
      }

      tbody.appendChild(tr);
    });
  },

  // Modal para ver cursos asignados al docente
  mostrarModalCursosDocenteAdmin(docente, cursosAsignados = []) {
    const modal = document.getElementById('modal-docente-assigned-courses');
    if (!modal) return;

    const nameEl = document.getElementById('docente-modal-name');
    const emailEl = document.getElementById('docente-modal-email');
    const avatarEl = document.getElementById('docente-modal-avatar');
    const specialtyEl = document.getElementById('docente-modal-specialty');
    const listEl = document.getElementById('docente-assigned-courses-list');
    const closeBtn = document.getElementById('btn-close-docente-courses-modal');
    const closeBtnBottom = document.getElementById('btn-close-docente-courses-modal-bottom');

    const initials = (docente.nombreCompleto || docente.nombre || 'D').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const area = docente.areaInteres || docente.departamentoFacultad || docente.areaEspecialidad || 'General';

    if (nameEl) nameEl.textContent = docente.nombreCompleto || docente.nombre || 'Docente';
    if (emailEl) emailEl.textContent = docente.correoElectronico || docente.email || 'docente@universidad.edu.co';
    if (avatarEl) avatarEl.textContent = initials;
    if (specialtyEl) specialtyEl.textContent = `Cátedra: ${area}`;

    if (listEl) {
      if (cursosAsignados.length === 0) {
        listEl.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1rem; background: var(--bg-surface, #F8FAFC); border: 1px dashed #CBD5E1; border-radius: 12px; color: var(--text-muted, #64748B);">
            <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.3rem; color: #1E293B;">No hay cursos asociados a esta cátedra</div>
            <p style="font-size: 0.85rem; margin: 0;">Puedes registrar o editar cursos asignándolos a la categoría "${area}" para vincularlos a este docente.</p>
          </div>
        `;
      } else {
        listEl.innerHTML = cursosAsignados.map(c => {
          const esActivo = c.activo !== false;
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; border-radius: 10px; border: 1px solid #E2E8F0; background: #FFFFFF; transition: box-shadow 0.2s;">
              <div style="flex: 1; padding-right: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
                  <span style="font-weight: 800; font-size: 0.92rem; color: #0F172A;">${c.nombre}</span>
                  <span class="status-badge ${esActivo ? 'status-badge-active' : 'status-badge-inactive'}" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">
                    <span class="status-dot"></span>
                    ${esActivo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div style="font-size: 0.8rem; color: #475569; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${c.descripcion || 'Sin descripción'}
                </div>
                <div style="display: flex; gap: 0.75rem; margin-top: 0.35rem; font-size: 0.76rem; color: var(--text-muted, #64748B);">
                  <span>⏱ ${c.duracionHoras}h</span>
                  <span>📊 ${c.nivel}</span>
                  ${c.prerrequisitos ? `<span>📌 ${c.prerrequisitos}</span>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    const cerrarModal = () => {
      modal.style.display = 'none';
    };

    if (closeBtn) closeBtn.onclick = cerrarModal;
    if (closeBtnBottom) closeBtnBottom.onclick = cerrarModal;

    modal.style.display = 'flex';
  },

  openModalCrearUsuario(rolesPermitidos = ['DOCENTE', 'ESTUDIANTE']) {
    const modal = document.getElementById('user-create-modal');
    const selectRol = document.getElementById('user-create-rol');
    const form = document.getElementById('user-create-form');
    if (form) form.reset();

    // Resetear visibilidad de contraseña
    const pwdInput = document.getElementById('user-create-password');
    if (pwdInput) pwdInput.type = 'password';

    if (selectRol) {
      selectRol.innerHTML = '';
      const labels = {
        'SUPERADMIN': 'Super Administrador (Control Total Institucional)',
        'ADMINISTRADOR': 'Administrador (Gestión Curricular y Cursos)',
        'DOCENTE': 'Docente (Cátedra y Seguimiento)',
        'ESTUDIANTE': 'Estudiante (Consultas RAG y Matrícula)'
      };
      rolesPermitidos.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = labels[r] || r;
        selectRol.appendChild(opt);
      });

      this.actualizarCamposCrearUsuarioPorRol(selectRol.value);
    }

    if (modal) modal.style.display = 'flex';
    const nameInput = document.getElementById('user-create-name');
    if (nameInput) setTimeout(() => nameInput.focus(), 80);
  },

  actualizarCamposCrearUsuarioPorRol(rol) {
    const r = (rol || '').toUpperCase();
    const labelArea = document.getElementById('label-user-create-area');
    const inputArea = document.getElementById('user-create-area');
    const selectNivel = document.getElementById('user-create-nivel');
    const inputFacultad = document.getElementById('user-create-facultad');

    if (!selectNivel) return;

    if (r === 'DOCENTE') {
      if (labelArea) labelArea.textContent = 'Área de especialidad docente';
      if (inputArea) inputArea.placeholder = 'Ej: Inteligencia Artificial, Cloud, Redes';
      selectNivel.innerHTML = `
        <option value="Docente Titular">Docente Titular</option>
        <option value="Docente Asistente">Docente Asistente</option>
        <option value="Docente Catedrático">Docente Catedrático</option>
      `;
      if (inputFacultad && !inputFacultad.value) inputFacultad.value = 'Facultad de Ingeniería';
    } else if (r === 'ADMINISTRADOR') {
      if (labelArea) labelArea.textContent = 'Área de gestión académica';
      if (inputArea) inputArea.placeholder = 'Ej: Coordinación Curricular, Vicerrectoría';
      selectNivel.innerHTML = `
        <option value="Coordinador">Coordinador Académico</option>
        <option value="Director de Programa">Director de Programa</option>
        <option value="Administrador General">Administrador General</option>
      `;
      if (inputFacultad && !inputFacultad.value) inputFacultad.value = 'Dirección Académica';
    } else if (r === 'SUPERADMIN') {
      if (labelArea) labelArea.textContent = 'Área de gobierno institucional';
      if (inputArea) inputArea.placeholder = 'Ej: Gobierno Institucional y Superadministración';
      selectNivel.innerHTML = `
        <option value="Superadmin">Super Administrador</option>
      `;
      if (inputFacultad) inputFacultad.value = 'Rectoría';
    } else {
      // ESTUDIANTE
      if (labelArea) labelArea.textContent = 'Área de interés académico';
      if (inputArea) inputArea.placeholder = 'Ej: Desarrollo Web, Ciberseguridad, Datos';
      selectNivel.innerHTML = `
        <option value="Principiante">Principiante</option>
        <option value="Intermedio" selected>Intermedio</option>
        <option value="Avanzado">Avanzado</option>
      `;
      if (inputFacultad) inputFacultad.value = 'Pregrado - Ingeniería de Sistemas';
    }
  },

  closeModalCrearUsuario() {
    const modal = document.getElementById('user-create-modal');
    if (modal) modal.style.display = 'none';
  },

  openModalPassword(usuario) {
    const modal = document.getElementById('user-password-modal');
    const form = document.getElementById('user-password-form');
    const inputId = document.getElementById('pwd-modal-user-id');
    const nameEl = document.getElementById('pwd-modal-user-name');
    const emailEl = document.getElementById('pwd-modal-user-email');
    const avatarEl = document.getElementById('pwd-modal-avatar');
    const roleWrap = document.getElementById('pwd-modal-user-role-wrap');
    const hintEl = document.getElementById('pwd-match-hint');

    if (form) form.reset();

    // Restablecer campos password a tipo 'password'
    const newPwd = document.getElementById('pwd-input-new');
    const confPwd = document.getElementById('pwd-input-confirm');
    if (newPwd) newPwd.type = 'password';
    if (confPwd) confPwd.type = 'password';

    if (hintEl) {
      hintEl.className = 'pwd-feedback-hint neutral';
      hintEl.innerHTML = '<span>Ingresa al menos 6 caracteres</span>';
    }

    if (inputId) inputId.value = usuario.id;
    if (nameEl) nameEl.textContent = usuario.nombreCompleto || 'Usuario';
    if (emailEl) emailEl.textContent = usuario.correoElectronico || '';

    // Generar iniciales del avatar
    if (avatarEl) {
      const parts = (usuario.nombreCompleto || 'U').trim().split(/\s+/);
      const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
      avatarEl.textContent = initials;
    }

    if (roleWrap) {
      const r = (usuario.rol || '').toUpperCase();
      if (r === 'SUPERADMIN') {
        roleWrap.innerHTML = `<span class="user-role-badge role-badge-superadmin">★ Superadmin</span>`;
      } else if (r === 'ADMINISTRADOR') {
        roleWrap.innerHTML = `<span class="user-role-badge role-badge-admin">Administrador</span>`;
      } else if (r === 'DOCENTE') {
        roleWrap.innerHTML = `<span class="user-role-badge role-badge-docente">Docente</span>`;
      } else {
        roleWrap.innerHTML = `<span class="user-role-badge role-badge-student">Estudiante</span>`;
      }
    }

    if (modal) modal.style.display = 'flex';
    if (newPwd) setTimeout(() => newPwd.focus(), 80);
  },

  closeModalPassword() {
    const modal = document.getElementById('user-password-modal');
    if (modal) modal.style.display = 'none';
  }
};