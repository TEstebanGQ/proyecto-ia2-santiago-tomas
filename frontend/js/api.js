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

  // ==========================================================
  // Estudiantes
  // ==========================================================

  async getEstudiantes() {
    const res = await fetch(`${API_BASE_URL}/estudiantes`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('Error al listar los estudiantes');
    }

    return await res.json();
  },

  async buscarEstudiantes(query) {
    const res = await fetch(
      `${API_BASE_URL}/estudiantes/buscar?query=${encodeURIComponent(query)}`,
      {
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    if (!res.ok) {
      throw new Error('Error al buscar estudiantes por nombre');
    }

    return await res.json();
  },

  async getEstudiante(id) {
    const res = await fetch(`${API_BASE_URL}/estudiantes/${id}`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Estudiante con ID ${id} no encontrado`);
      }

      throw new Error('Error al consultar el estudiante');
    }

    return await res.json();
  },

  async registrarEstudiante(datos) {
    const res = await fetch(`${API_BASE_URL}/estudiantes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos),
      credentials: 'include'
    });

    let data = null;

    try {
      data = await res.json();
    } catch (e) {
      data = {
        mensaje: res.statusText || 'Error en la respuesta del servidor'
      };
    }

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        `Error al registrar el estudiante (${res.status})`
      );
    }

    return data;
  },

  async getHistorial(estudianteId) {
    const res = await fetch(
      `${API_BASE_URL}/estudiantes/${estudianteId}/historial`,
      {
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    if (!res.ok) {
      throw new Error('Error al obtener el historial de consultas');
    }

    return await res.json();
  },

  async inscribirCurso(estudianteId, cursoId) {
    const res = await fetch(
      `${API_BASE_URL}/estudiantes/${estudianteId}/inscribir/${cursoId}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      }
    );

    let data = null;

    try {
      data = await res.json();
    } catch (e) {
      data = {
        mensaje: res.statusText || 'Error en la respuesta'
      };
    }

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        `Error al inscribirse en el curso (${res.status})`
      );
    }

    return data;
  },

  async getInscripcionesEstudiante(estudianteId) {
    const res = await fetch(
      `${API_BASE_URL}/estudiantes/${estudianteId}/inscripciones`,
      {
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    if (!res.ok) {
      return [];
    }

    try {
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  // ==========================================================
  // Cursos - Catálogo público
  // ==========================================================

  async getCursos(categoria = '', nivel = '') {
    const params = new URLSearchParams();

    if (categoria) {
      params.append('categoria', categoria);
    }

    if (nivel) {
      params.append('nivel', nivel);
    }

    const url =
      `${API_BASE_URL}/cursos` +
      `${params.toString() ? '?' + params.toString() : ''}`;

    const res = await fetch(url, {
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('Error al cargar el catálogo de cursos');
    }

    return await res.json();
  },

  // ==========================================================
  // Consultas RAG
  // ==========================================================

  async solicitarRecomendacion(
    estudianteId,
    pregunta,
    cursosPrevios = [],
    contextoPrevio = ''
  ) {
    const payload = {
      estudianteId,
      pregunta
    };

    if (
      Array.isArray(cursosPrevios) &&
      cursosPrevios.length > 0
    ) {
      payload.cursosPrevios = cursosPrevios;
    }

    if (contextoPrevio) {
      payload.contextoPrevio = contextoPrevio;
    }

    const res = await fetch(
      `${API_BASE_URL}/consultas/recomendar`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error al procesar la recomendación'
      );
    }

    return data;
  },

  async getConsulta(id) {
    const res = await fetch(
      `${API_BASE_URL}/consultas/${id}`,
      {
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    if (!res.ok) {
      throw new Error('Error al consultar el detalle');
    }

    return await res.json();
  },

  // ==========================================================
  // Calificaciones
  // ==========================================================

  async calificarRecomendacion(
    recomendacionId,
    puntuacion,
    comentario = ''
  ) {
    const res = await fetch(
      `${API_BASE_URL}/calificaciones`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          recomendacionId,
          puntuacion,
          comentario
        }),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error al registrar la calificación'
      );
    }

    return data;
  },

  async calificarCurso(
    cursoId,
    puntuacion,
    comentario = '',
    estudianteId = null
  ) {
    const res = await fetch(
      `${API_BASE_URL}/cursos/${cursoId}/calificaciones`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          cursoId,
          puntuacion,
          comentario,
          estudianteId
        }),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error al registrar la calificación del curso'
      );
    }

    return data;
  },

  // ==========================================================
  // Autenticación
  // ==========================================================

  async login(
    email,
    rol = 'ESTUDIANTE',
    nombre = '',
    password = ''
  ) {
    const res = await fetch(
      `${API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          rol,
          nombre,
          password
        }),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error al iniciar sesión'
      );
    }

    return data;
  },

  async loginGoogle(
    email,
    nombre = '',
    rol = 'ESTUDIANTE'
  ) {
    const res = await fetch(
      `${API_BASE_URL}/auth/google`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          nombre,
          rol,
          proveedor: 'google'
        }),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error en autenticación con Google'
      );
    }

    return data;
  },

  // ==========================================================
  // Sesión de Usuario en Redis (NUNCA en localStorage)
  // ==========================================================

  async getSesion() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(false),
        credentials: 'include'
      });

      if (!res.ok) {
        return null;
      }

      return await res.json();
    } catch (e) {
      console.warn('Error al consultar sesión activa en Redis:', e.message);
      return null;
    }
  },

  async updateActiveStudent(studentId) {
    try {
      await fetch(`${API_BASE_URL}/auth/me/active-student/${studentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(false),
        credentials: 'include'
      });
    } catch (e) {
      console.warn('Error actualizando estudiante activo en sesión Redis:', e.message);
    }
  },

  // ==========================================================
  // Cerrar sesión
  // ==========================================================

  async logout() {
    try {
      await fetch(
        `${API_BASE_URL}/auth/logout`,
        {
          method: 'POST',
          headers: getAuthHeaders(false),
          credentials: 'include'
        }
      );
    } catch (e) {
      console.warn(
        'Error contactando endpoint de logout:',
        e.message
      );
    } finally {
      try {
        localStorage.removeItem('rutaia_user');
        localStorage.removeItem('rutaia_active_student_id');
      } catch (e) {}
    }
  },

  // ==========================================================
  // Administración de Cursos
  // ==========================================================

  async getCursosAdmin() {
    const res = await fetch(
      `${API_BASE_URL}/cursos/admin`,
      {
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    if (!res.ok) {
      throw new Error(
        'Error al obtener la lista completa de cursos para administración'
      );
    }

    return await res.json();
  },

  async crearCurso(cursoData) {
    const res = await fetch(
      `${API_BASE_URL}/cursos`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cursoData),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error al registrar el curso'
      );
    }

    return data;
  },

  async actualizarCurso(id, cursoData) {
    const res = await fetch(
      `${API_BASE_URL}/cursos/${id}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(cursoData),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error al actualizar el curso'
      );
    }

    return data;
  },

  async desactivarCurso(id) {
    const res = await fetch(
      `${API_BASE_URL}/cursos/${id}/desactivar`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error al desactivar el curso'
      );
    }

    return data;
  },

  async activarCurso(id) {
    const res = await fetch(
      `${API_BASE_URL}/cursos/${id}/activar`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error al activar el curso'
      );
    }

    return data;
  },

  // ==========================================================
  // Estadísticas
  // ==========================================================

  async getEstadisticas(estudianteId = null) {
    const query = estudianteId
      ? `?estudianteId=${encodeURIComponent(estudianteId)}`
      : '';

    const res = await fetch(
      `${API_BASE_URL}/estadisticas${query}`,
      {
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    if (!res.ok) {
      throw new Error(
        'Error al consultar las estadísticas'
      );
    }

    return await res.json();
  },

  // ==========================================================
  // Estadísticas de Administración
  // ==========================================================

  async getEstadisticasAdmin() {
    try {
      const res = await fetch(
        `${API_BASE_URL}/estadisticas/admin`,
        {
          headers: getAuthHeaders(false),
          credentials: 'include'
        }
      );

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn(
        'Endpoint /estadisticas/admin no disponible, ejecutando fallback:',
        e
      );
    }

    // Fallback elegante al endpoint base de estadísticas
    try {
      const baseStats = await this.getEstadisticas(null);

      return {
        totalUsuarios: 1,
        usuariosActivos: 1,
        totalConsultas: baseStats.totalConsultas || 0,
        consultasRespondidas:
          baseStats.consultasRespondidas || 0,
        consultasSinResultados:
          baseStats.consultasSinResultados || 0,
        consultasError:
          baseStats.consultasError || 0,
        promedioCalificaciones:
          baseStats.promedioCalificaciones || null,
        cursoMasRecomendado:
          baseStats.cursoMasRecomendado ||
          'Sin recomendaciones registradas',
        accionesPorUsuario: [],
        accionesPorDia: [],
        auditoria: []
      };
    } catch (err) {
      return {
        totalUsuarios: 1,
        usuariosActivos: 1,
        totalConsultas: 0,
        consultasRespondidas: 0,
        consultasSinResultados: 0,
        consultasError: 0,
        promedioCalificaciones: null,
        cursoMasRecomendado:
          'Sin recomendaciones',
        accionesPorUsuario: [],
        accionesPorDia: [],
        auditoria: []
      };
    }
  },

  // ==========================================================
  // Configuración de Umbral RAG
  // ==========================================================

  async getUmbral() {
    const res = await fetch(
      `${API_BASE_URL}/configuracion/umbral`,
      {
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    if (!res.ok) {
      throw new Error(
        'Error al obtener la configuración del umbral'
      );
    }

    return await res.json();
  },

  async actualizarUmbral(porcentaje) {
    const res = await fetch(
      `${API_BASE_URL}/configuracion/umbral?porcentaje=${encodeURIComponent(porcentaje)}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error al actualizar el umbral RAG'
      );
    }

    return data;
  },

  // ==========================================================
  // Operaciones del Rol DOCENTE
  // Gestión de su Especialidad
  // ==========================================================

  async getDocentePerfil(email = null) {
    const q = email
      ? `?email=${encodeURIComponent(email)}`
      : '';

    const res = await fetch(
      `${API_BASE_URL}/docentes/perfil${q}`,
      {
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    if (!res.ok) {
      throw new Error(
        'Error al consultar el perfil docente'
      );
    }

    return await res.json();
  },

  async getDocenteCursos(email = null) {
    const q = email
      ? `?email=${encodeURIComponent(email)}`
      : '';

    const res = await fetch(
      `${API_BASE_URL}/docentes/cursos${q}`,
      {
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    if (!res.ok) {
      throw new Error(
        'Error al listar cursos de la especialidad docente'
      );
    }

    return await res.json();
  },

  async getDocenteInscritosCurso(id, email = null) {
    const q = email
      ? `?email=${encodeURIComponent(email)}`
      : '';

    const res = await fetch(
      `${API_BASE_URL}/docentes/cursos/${id}/inscritos${q}`,
      {
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    if (!res.ok) {
      throw new Error(
        'Error al consultar estudiantes inscritos en la materia'
      );
    }

    return await res.json();
  },

  async crearDocenteCurso(curso, email = null) {
    const q = email
      ? `?email=${encodeURIComponent(email)}`
      : '';

    const res = await fetch(
      `${API_BASE_URL}/docentes/cursos${q}`,
      {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(curso),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error al crear el curso'
      );
    }

    return data;
  },

  async actualizarDocenteCurso(
    id,
    curso,
    email = null
  ) {
    const q = email
      ? `?email=${encodeURIComponent(email)}`
      : '';

    const res = await fetch(
      `${API_BASE_URL}/docentes/cursos/${id}${q}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify(curso),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error al actualizar el curso'
      );
    }

    return data;
  },

  async desactivarDocenteCurso(
    id,
    email = null
  ) {
    const q = email
      ? `?email=${encodeURIComponent(email)}`
      : '';

    const res = await fetch(
      `${API_BASE_URL}/docentes/cursos/${id}/desactivar${q}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error al desactivar el curso'
      );
    }

    return data;
  },

  async activarDocenteCurso(
    id,
    email = null
  ) {
    const q = email
      ? `?email=${encodeURIComponent(email)}`
      : '';

    const res = await fetch(
      `${API_BASE_URL}/docentes/cursos/${id}/activar${q}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.mensaje ||
        'Error al activar el curso'
      );
    }

    return data;
  },

  async getDocenteFeedback(email = null) {
    const q = email
      ? `?email=${encodeURIComponent(email)}`
      : '';

    const res = await fetch(
      `${API_BASE_URL}/docentes/feedback${q}`,
      {
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    if (!res.ok) {
      throw new Error(
        'Error al consultar el feedback de estudiantes'
      );
    }

    return await res.json();
  },

  async getDocenteEstadisticas(email = null) {
    const q = email
      ? `?email=${encodeURIComponent(email)}`
      : '';

    const res = await fetch(
      `${API_BASE_URL}/docentes/estadisticas${q}`,
      {
        headers: getAuthHeaders(false),
        credentials: 'include'
      }
    );

    if (!res.ok) {
      throw new Error(
        'Error al consultar analíticas docentes'
      );
    }

    return await res.json();
  },

  async getDocenteEstudiantes(email = null) {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE_URL}/docentes/estudiantes${q}`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Error al consultar los estudiantes de tu especialidad');
    }
    return await res.json();
  },

  async buscarDocenteEstudiantes(query, email = null) {
    let url = `${API_BASE_URL}/docentes/estudiantes/buscar?query=${encodeURIComponent(query)}`;
    if (email) {
      url += `&email=${encodeURIComponent(email)}`;
    }
    const res = await fetch(url, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Error al buscar estudiantes en tu cátedra');
    }
    return await res.json();
  },

  async getDocenteEstudiante(id, email = null) {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE_URL}/docentes/estudiantes/${id}${q}`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error(`Estudiante #${id} no encontrado en tu cátedra`);
    }
    return await res.json();
  },

  async getDocenteEstudianteHistorial(id, email = null) {
    const q = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE_URL}/docentes/estudiantes/${id}/historial${q}`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error(`Historial no disponible para el estudiante #${id}`);
    }
    return await res.json();
  },

  async getDocentes() {
    const res = await fetch(`${API_BASE_URL}/docentes`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Error al listar los docentes del sistema');
    }
    return await res.json();
  },

  // -------------------------------------------------------------------------
  // GESTIÓN DE USUARIOS Y CONTROL DE ACCESO (SUPERADMIN & ADMINISTRADOR)
  // -------------------------------------------------------------------------
  async getUsuarios() {
    const res = await fetch(`${API_BASE_URL}/usuarios`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al obtener la lista de usuarios');
    }
    return await res.json();
  },

  async getUsuario(id) {
    const res = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error(`Usuario #${id} no encontrado`);
    }
    return await res.json();
  },

  async crearUsuario(datos) {
    const res = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      credentials: 'include',
      body: JSON.stringify(datos)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al registrar el nuevo usuario');
    }
    return await res.json();
  },

  async cambiarPasswordUsuario(id, nuevaPassword) {
    const res = await fetch(`${API_BASE_URL}/usuarios/${id}/password`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      credentials: 'include',
      body: JSON.stringify({ nuevaPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al configurar la nueva contraseña');
    }
    return await res.json();
  },

  async getRolesPermitidos() {
    const res = await fetch(`${API_BASE_URL}/usuarios/roles-permitidos`, {
      headers: getAuthHeaders(false),
      credentials: 'include'
    });
    if (!res.ok) {
      return ['DOCENTE', 'ESTUDIANTE'];
    }
    return await res.json();
  }
};