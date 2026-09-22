/**
 * RutaIA - Controlador de Interfaz de Usuario (UI) y Renderizado del DOM
 * Concepto: Editorial Learning Lab
 */

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
    if (nameEl) nameEl.textContent = nombre;

    const esAdmin = estudiante.rol === 'ADMINISTRADOR';
    if (badgeEl) {
      badgeEl.textContent = esAdmin ? 'Administrador' : 'Estudiante';
      badgeEl.className = `user-role-badge ${esAdmin ? 'role-badge-admin' : 'role-badge-student'}`;
    }
    
    // Widgets del perfil en barra lateral / Bento
    if (widgetLevelEl) widgetLevelEl.textContent = estudiante.nivelExperiencia || estudiante.nivel || 'Principiante';
    if (widgetAreaEl) widgetAreaEl.textContent = estudiante.areaInteres || estudiante.area || 'Tecnología';
  },

  renderUsuarioHeader(usuario) {
    this.renderEstudianteActivo(usuario);
    // Ajustar visibilidad o estilo de botones de navegación si es Administrador
    const navAdmin = document.getElementById('nav-admin-item');
    if (navAdmin) {
      if (usuario && usuario.rol === 'ADMINISTRADOR') {
        navAdmin.style.display = 'flex';
      } else {
        navAdmin.style.display = 'none';
      }
    }
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

  // Indicador de Carga
  setLoading(isLoading, title = 'Consultando Asesor Vocacional con RAG...', desc = 'Generando embeddings semánticos, recuperando cursos de Qdrant y sintetizando orientación...') {
    const loadingBox = document.getElementById('loading-box');
    const resultBox = document.getElementById('result-card');
    const submitBtn = document.getElementById('submit-query-btn');

    if (loadingBox) {
      loadingBox.style.display = isLoading ? 'flex' : 'none';
      if (isLoading) {
        document.getElementById('loading-title').textContent = title;
        document.getElementById('loading-desc').textContent = desc;
      }
    }
    if (resultBox && isLoading) {
      resultBox.style.display = 'none';
    }
    if (submitBtn) {
      submitBtn.disabled = isLoading;
    }
  },

  // Renderizado del Resultado RAG (Estilo Editorial Bento)
  renderResultadoRecomendacion(rec, onCalificar) {
    const resultCard = document.getElementById('result-card');
    if (!resultCard) return;

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

    // Desplazar suavemente a la tarjeta de resultados
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  renderCatalogo(cursos) {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    grid.innerHTML = '';
    if (cursos.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3.5rem; background: var(--bg-card); border-radius: var(--radius-xl); border: 1px dashed var(--border-medium); color: var(--text-muted);">
          No se encontraron cursos que coincidan con los filtros seleccionados.
        </div>
      `;
      return;
    }

    const getCatClass = (cat = '') => {
      const c = cat.toLowerCase();
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

      card.innerHTML = `
        <div class="course-editorial-header">
          <div class="course-editorial-badges">
            <span class="badge-cat ${catClass}">${curso.categoria}</span>
            <span class="badge-level">${curso.nivel}</span>
          </div>
          <h3 class="course-editorial-title">${curso.nombre}</h3>
          <p class="course-editorial-desc">${curso.descripcion}</p>
        </div>
        <div class="course-editorial-footer">
          <span class="course-editorial-hours">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${curso.duracionHoras} Horas
          </span>
          <button class="btn-ask-course" onclick="window.consultarCursoSemantico('${curso.nombre.replace(/'/g, "\\'")}')">
            Orientar sobre este curso →
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
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
  renderEstadisticas(stats) {
    if (!stats) return;

    const totalEl = document.getElementById('stat-total');
    const respEl = document.getElementById('stat-respondidas');
    const sinResEl = document.getElementById('stat-sin-resultados');
    const promEl = document.getElementById('stat-promedio');
    const topEl = document.getElementById('stat-curso-top');

    if (totalEl) totalEl.textContent = stats.totalConsultas || 0;
    if (respEl) respEl.textContent = stats.consultasRespondidas || 0;
    if (sinResEl) sinResEl.textContent = stats.consultasSinResultados || 0;
    if (promEl) promEl.textContent = stats.promedioCalificaciones ? `★ ${stats.promedioCalificaciones.toFixed(1)}` : 'N/A';
    if (topEl) topEl.textContent = stats.cursoMasRecomendado || 'Sin recomendaciones registradas aún';
  },

  // Modal con Detalle Completo del Curso
  mostrarModalDetalleCurso(curso) {
    let modal = document.getElementById('course-details-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'course-details-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
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

    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    if (closeBtn2) closeBtn2.onclick = () => modal.style.display = 'none';
    if (askBtn) {
      askBtn.onclick = () => {
        modal.style.display = 'none';
        window.consultarCursoSemantico(curso.nombre);
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
          <div class="course-table-title">${c.nombre}</div>
          <div class="course-table-prereq">${c.prerrequisitos ? 'Prerreq: ' + c.prerrequisitos : 'Sin prerrequisitos'}</div>
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
      if (catInput) catInput.value = curso.categoria || '';
      if (nivelInput) nivelInput.value = curso.nivel || 'Principiante';
      if (durInput) durInput.value = curso.duracionHoras || 40;
      if (prereqInput) prereqInput.value = curso.prerrequisitos || '';
    } else {
      if (titleEl) titleEl.textContent = 'Registrar Nuevo Curso Institucional';
      if (subtitleEl) subtitleEl.textContent = 'Ingresa los datos para incorporar una nueva materia al catálogo académico:';
      if (idInput) idInput.value = '';
      if (nombreInput) nombreInput.value = '';
      if (descInput) descInput.value = '';
      if (catInput) catInput.value = '';
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

  renderErrorEstudianteAdmin(idConsultado, mensajeError) {
    const container = document.getElementById('admin-student-inspection-result');
    if (!container) return;

    container.innerHTML = `
      <div class="admin-notfound-card">
        <div class="notfound-icon-box">⚠</div>
        <div class="notfound-body" style="flex: 1;">
          <h4>Estudiante No Encontrado (HTTP 404)</h4>
          <p>
            No existe ningún estudiante registrado con el identificador <strong>#${idConsultado}</strong> en la base de datos institucional.
          </p>
          <p style="margin-top: 0.35rem; font-size: 0.82rem; opacity: 0.9;">
            Mensaje del servidor: <em>"${mensajeError || 'Recurso no encontrado'}"</em>. Verifica que el identificador sea correcto o consulta la lista general inferior.
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
  }
};
