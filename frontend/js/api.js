/**
 * RutaIA - Cliente de API REST
 * Arquitectura Segura con Redis: El token JWT NUNCA se almacena en localStorage ni en caché del navegador.
 * La sesión se gestiona con HttpOnly Cookies y validación en tiempo real contra el servidor Redis.
 */

const API_BASE_URL = 'http://localhost:8080/api';

function getAuthHeaders(includeContentType = true) {
  const headers = {};
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  // La sesión viaja protegida mediante HttpOnly Cookie automática y validación en Redis.
  return headers;
}

export const api = {
  // Estudiantes
  async getEstudiantes() {
    const res = await fetch(`${API_BASE_URL}/estudiantes`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al listar los estudiantes');
    return await res.json();
  },

  async getEstudiante(id) {
    const res = await fetch(`${API_BASE_URL}/estudiantes/${id}`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) {
      if (res.status === 404) throw new Error(`Estudiante con ID ${id} no encontrado`);
      throw new Error('Error al consultar el estudiante');
    }
    return await res.json();
  },

  async registrarEstudiante(datos) {
    const res = await fetch(`${API_BASE_URL}/estudiantes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
      credentials: 'include'
    });
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = { mensaje: res.statusText || 'Error en la respuesta del servidor' };
    }
    if (!res.ok) {
      throw new Error(data.mensaje || `Error al registrar el estudiante (${res.status})`);
    }
    return data;
  },

  async getHistorial(estudianteId) {
    const res = await fetch(`${API_BASE_URL}/estudiantes/${estudianteId}/historial`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al obtener el historial de consultas');
    return await res.json();
  },

  // Cursos (Catálogo público)
  async getCursos(categoria = '', nivel = '') {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (nivel) params.append('nivel', nivel);

    const url = `${API_BASE_URL}/cursos${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al cargar el catálogo de cursos');
    return await res.json();
  },

  // Consultas RAG
  async solicitarRecomendacion(estudianteId, pregunta, cursosPrevios = [], contextoPrevio = '') {
    const payload = { estudianteId, pregunta };
    if (Array.isArray(cursosPrevios) && cursosPrevios.length > 0) {
      payload.cursosPrevios = cursosPrevios;
    }
    if (contextoPrevio) {
      payload.contextoPrevio = contextoPrevio;
    }
    const res = await fetch(`${API_BASE_URL}/consultas/recomendar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || 'Error al procesar la recomendación');
    }
    return data;
  },

  async getConsulta(id) {
    const res = await fetch(`${API_BASE_URL}/consultas/${id}`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al consultar el detalle');
    return await res.json();
  },

  // Calificaciones
  async calificarRecomendacion(recomendacionId, puntuacion, comentario = '') {
    const res = await fetch(`${API_BASE_URL}/calificaciones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ recomendacionId, puntuacion, comentario }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || 'Error al registrar la calificación');
    }
    return data;
  },

  // Autenticación con JWT firmado y Roles (Estudiante / Administrador)
  async login(email, rol = 'ESTUDIANTE', nombre = '', password = '') {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, rol, nombre, password }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al iniciar sesión');
    return data;
  },

  async loginGoogle(email, nombre = '', rol = 'ESTUDIANTE') {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nombre, rol, proveedor: 'google' }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error en autenticación con Google');
    return data;
  },

  // Cerrar Sesión e Invalidar en Redis Server-Side
  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(false),
        credentials: 'include'
      });
    } catch (e) {
      console.warn('Error contactando endpoint de logout:', e.message);
    } finally {
      localStorage.removeItem('rutaia_user');
      localStorage.removeItem('rutaia_active_student_id');
    }
  },

  // Administración de Cursos (Rol Administrador con sincronización Qdrant)
  async getCursosAdmin() {
    const res = await fetch(`${API_BASE_URL}/cursos/admin`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al obtener la lista completa de cursos para administración');
    return await res.json();
  },

  async crearCurso(cursoData) {
    const res = await fetch(`${API_BASE_URL}/cursos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cursoData),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al registrar el curso');
    return data;
  },

  async actualizarCurso(id, cursoData) {
    const res = await fetch(`${API_BASE_URL}/cursos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(cursoData),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al actualizar el curso');
    return data;
  },

  async desactivarCurso(id) {
    const res = await fetch(`${API_BASE_URL}/cursos/${id}/desactivar`, {
      method: 'PATCH',
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al desactivar el curso');
    return data;
  },

  async activarCurso(id) {
    const res = await fetch(`${API_BASE_URL}/cursos/${id}/activar`, {
      method: 'PATCH',
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al activar el curso');
    return data;
  },

  // Estadísticas
  async getEstadisticas(estudianteId = null) {
    const query = estudianteId ? `?estudianteId=${encodeURIComponent(estudianteId)}` : '';
    const res = await fetch(`${API_BASE_URL}/estadisticas${query}`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al consultar las estadísticas');
    return await res.json();
  },

  // ==========================================================
  // Operaciones del Rol DOCENTE (Gestión de su Especialidad)
  // ==========================================================
  async getDocentePerfil(email = null) {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE_URL}/docentes/perfil${q}`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al consultar el perfil docente');
    return await res.json();
  },

  async getDocenteCursos(email = null) {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE_URL}/docentes/cursos${q}`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al listar cursos de la especialidad docente');
    return await res.json();
  },

  async getDocenteInscritosCurso(id, email = null) {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE_URL}/docentes/cursos/${id}/inscritos${q}`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al consultar estudiantes inscritos en la materia');
    return await res.json();
  },


  async crearDocenteCurso(curso, email = null) {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE_URL}/docentes/cursos${q}`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(curso),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al crear el curso');
    return data;
  },

  async actualizarDocenteCurso(id, curso, email = null) {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE_URL}/docentes/cursos/${id}${q}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(curso),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al actualizar el curso');
    return data;
  },

  async desactivarDocenteCurso(id, email = null) {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE_URL}/docentes/cursos/${id}/desactivar${q}`, {
      method: 'PATCH',
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al desactivar el curso');
    return data;
  },

  async activarDocenteCurso(id, email = null) {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE_URL}/docentes/cursos/${id}/activar${q}`, {
      method: 'PATCH',
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error al activar el curso');
    return data;
  },

  async getDocenteFeedback(email = null) {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE_URL}/docentes/feedback${q}`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al consultar el feedback de estudiantes');
    return await res.json();
  },

  async getDocenteEstadisticas(email = null) {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE_URL}/docentes/estadisticas${q}`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al consultar analíticas docentes');
    return await res.json();
  }
};
