/**
 * RutaIA - Manejador de Estado Global
 */

import { api } from './api.js';

export const state = {
  usuario: null, // { id, nombre, email, rol, nivel, area, token, proveedor }
  estudiantes: [],
  estudianteActivo: null,
  cursos: [],
  cursosAdmin: [],
  ultimaRecomendacion: null,
  historial: [],
  estadisticas: null,
  docentePerfil: null,
  cursosDocente: [],
  docenteFeedback: [],
  docenteEstadisticas: null,
  estudiantesDocente: [],
  docentes: [],
  inscripcionesCursoIds: new Set(),

  initUsuario() {
    // La sesión reside ÚNICAMENTE en el servidor Redis y viaja con HttpOnly Cookie.
    // NUNCA se almacena en localStorage.
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('rutaia_user');
        localStorage.removeItem('rutaia_active_student_id');
      }
    } catch (e) {}
  },

  setUsuario(user) {
    this.usuario = user;
    // Asegurar que localStorage esté completamente libre de datos del usuario
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('rutaia_user');
        localStorage.removeItem('rutaia_active_student_id');
      }
    } catch (e) {}

    if (user && user.rol === 'ESTUDIANTE' && user.id) {
      this.estudianteActivo = {
        id: user.id,
        nombreCompleto: user.nombre,
        correoElectronico: user.email,
        nivelExperiencia: user.nivel || user.nivelExperiencia || 'Intermedio',
        areaInteres: user.area || user.areaInteres || 'Tecnología'
      };
    }
  },

  esSuperAdmin() {
    const r = (this.getRol() || '').toUpperCase();
    return r === 'SUPERADMIN' || r === 'ROLE_SUPERADMIN';
  },

  esAdmin() {
    const r = (this.getRol() || '').toUpperCase();
    return r === 'ADMINISTRADOR' || r === 'ADMIN' || r === 'ROLE_ADMINISTRADOR' || this.esSuperAdmin();
  },

  esDocente() {
    const r = (this.getRol() || '').toUpperCase();
    return r === 'DOCENTE' || r === 'ROLE_DOCENTE' || r === 'PROFESOR';
  },

  getRol() {
    return this.usuario ? (this.usuario.rol || 'ESTUDIANTE') : 'ESTUDIANTE';
  },

  esEstudiante() {
    if (this.esAdmin() || this.esDocente() || this.esSuperAdmin()) return false;
    return true;
  },

  setInscripciones(lista) {
    this.inscripcionesCursoIds = new Set(
      (lista || []).map(ins => ins.cursoId || ins.idCurso || (ins.curso ? ins.curso.id : null) || ins).filter(Boolean)
    );
  },

  estaInscrito(cursoId) {
    if (!cursoId) return false;
    return this.inscripcionesCursoIds.has(Number(cursoId)) || this.inscripcionesCursoIds.has(String(cursoId));
  },

  agregarInscripcion(cursoId) {
    if (cursoId) {
      this.inscripcionesCursoIds.add(Number(cursoId));
    }
  },

  setEstudiantes(lista) {
    this.estudiantes = lista;
    if (this.usuario && this.usuario.rol === 'ESTUDIANTE' && this.usuario.id) {
      const found = lista.find(e => e.id == this.usuario.id);
      if (found) {
        this.estudianteActivo = found;
        return;
      }
    }
    if (!this.estudianteActivo && lista.length > 0) {
      const savedId = this.usuario?.activeStudentId;
      const found = lista.find(e => e.id == savedId);
      this.estudianteActivo = found || lista[0];
    }
  },

  setEstudianteActivo(estudiante) {
    this.estudianteActivo = estudiante;
    if (estudiante) {
      if (this.usuario) {
        this.usuario.activeStudentId = estudiante.id;
        if (this.usuario.rol === 'ESTUDIANTE') {
          this.usuario.id = estudiante.id;
          this.usuario.nombre = estudiante.nombreCompleto;
          this.usuario.email = estudiante.correoElectronico;
          this.usuario.nivel = estudiante.nivelExperiencia;
          this.usuario.area = estudiante.areaInteres;
        }
      }
      this.initChatSession();
      // Persistir estudiante activo en la sesión de Redis en el servidor
      api.updateActiveStudent(estudiante.id);
    }
  },

  setCursos(lista) {
    this.cursos = lista;
  },

  setCursosAdmin(lista) {
    this.cursosAdmin = lista;
  },

  setDocentes(lista) {
    this.docentes = lista || [];
  },

  setUltimaRecomendacion(rec) {
    this.ultimaRecomendacion = rec;
  },

  setHistorial(lista) {
    this.historial = lista;
  },

  setEstadisticas(stats) {
    this.estadisticas = stats;
  },

  // Gestión de Sesión de Chat Conversacional (Máximo 5 consultas por sesión)
  chatSession: {
    turnCount: 0,
    maxTurns: 5,
    mensajes: [],
    cursosMencionados: []
  },

  initChatSession() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const studentKey = this.estudianteActivo ? this.estudianteActivo.id : 'default';
        const saved = sessionStorage.getItem(`rutaia_chat_session_${studentKey}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.chatSession = {
            turnCount: parsed.turnCount || 0,
            maxTurns: 5,
            mensajes: Array.isArray(parsed.mensajes) ? parsed.mensajes : [],
            cursosMencionados: Array.isArray(parsed.cursosMencionados) ? parsed.cursosMencionados : []
          };
          return;
        }
      }
    } catch (e) {
      console.warn('Error al cargar chatSession de sessionStorage', e);
    }
    this.chatSession = {
      turnCount: 0,
      maxTurns: 5,
      mensajes: [],
      cursosMencionados: []
    };
  },

  saveChatSession() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const studentKey = this.estudianteActivo ? this.estudianteActivo.id : 'default';
        sessionStorage.setItem(`rutaia_chat_session_${studentKey}`, JSON.stringify(this.chatSession));
      }
    } catch (e) {
      console.warn('Error al guardar chatSession en sessionStorage', e);
    }
  },

  puedeEnviarMensaje() {
    return this.chatSession.turnCount < this.chatSession.maxTurns;
  },

  agregarMensajeUsuario(pregunta) {
    if (!this.puedeEnviarMensaje()) {
      return false;
    }
    this.chatSession.turnCount++;
    const msg = {
      id: 'usr_' + Date.now(),
      remitente: 'usuario',
      texto: pregunta,
      turno: this.chatSession.turnCount,
      timestamp: new Date().toISOString()
    };
    this.chatSession.mensajes.push(msg);
    this.saveChatSession();
    return msg;
  },

  agregarRespuestaIA(resultado) {
    const cursosNuevos = [];
    if (resultado.fuentes && Array.isArray(resultado.fuentes)) {
      resultado.fuentes.forEach(f => {
        if (f.nombre && !this.chatSession.cursosMencionados.includes(f.nombre)) {
          this.chatSession.cursosMencionados.push(f.nombre);
          cursosNuevos.push(f.nombre);
        }
      });
    }

    const msg = {
      id: 'ia_' + Date.now(),
      remitente: 'ia',
      texto: resultado.respuesta || 'Orientación generada.',
      estadoFinal: resultado.estadoFinal || 'Respondida',
      idConsulta: resultado.idConsulta,
      recomendacionId: resultado.idRecomendacion || resultado.idConsulta,
      fuentes: resultado.fuentes || [],
      calificacionPuntuacion: resultado.calificacionPuntuacion || null,
      calificacionComentario: resultado.calificacionComentario || null,
      turno: this.chatSession.turnCount,
      timestamp: new Date().toISOString()
    };
    this.chatSession.mensajes.push(msg);
    this.saveChatSession();
    return msg;
  },

  guardarCalificacionEnMensaje(recId, puntuacion, comentario) {
    const msg = this.chatSession.mensajes.find(m => m.remitente === 'ia' && (m.recomendacionId == recId || m.idConsulta == recId));
    if (msg) {
      msg.calificacionPuntuacion = puntuacion;
      msg.calificacionComentario = comentario;
      this.saveChatSession();
    }
  },

  reiniciarChat() {
    this.chatSession = {
      turnCount: 0,
      maxTurns: 5,
      mensajes: [],
      cursosMencionados: []
    };
    try {
      if (typeof sessionStorage !== 'undefined') {
        const studentKey = this.estudianteActivo ? this.estudianteActivo.id : 'default';
        sessionStorage.removeItem(`rutaia_chat_session_${studentKey}`);
      }
    } catch (e) {
      console.warn('Error al limpiar chatSession', e);
    }
  },

  obtenerContextoCompacto() {
    return {
      cursosPrevios: [...this.chatSession.cursosMencionados],
      contextoPrevio: this.chatSession.cursosMencionados.length > 0 
        ? `Cursos explorados previamente en esta sesión: ${this.chatSession.cursosMencionados.slice(-4).join(', ')}`
        : ''
    };
  },

  setDocentePerfil(perfil) {
    this.docentePerfil = perfil;
  },

  setCursosDocente(cursos) {
    this.cursosDocente = cursos;
  },

  setDocenteFeedback(feedback) {
    this.docenteFeedback = feedback;
  },

  setDocenteEstadisticas(stats) {
    this.docenteEstadisticas = stats;
  },

  setEstudiantesDocente(estudiantes) {
    this.estudiantesDocente = estudiantes || [];
  }
};

// Inicializar usuario al cargar módulo
state.initUsuario();
state.initChatSession();
if (typeof window !== 'undefined') {
  window.state = state;
}

