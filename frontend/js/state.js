/**
 * RutaIA - Manejador de Estado Global
 */

export const state = {
  usuario: null, // { id, nombre, email, rol, nivel, area, token, proveedor }
  estudiantes: [],
  estudianteActivo: null,
  cursos: [],
  cursosAdmin: [],
  ultimaRecomendacion: null,
  historial: [],
  estadisticas: null,

  initUsuario() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('rutaia_user');
        if (saved) {
          this.usuario = JSON.parse(saved);
          if (this.usuario && this.usuario.token) {
            delete this.usuario.token;
            localStorage.setItem('rutaia_user', JSON.stringify(this.usuario));
          }
          return;
        }
      }
      // Por defecto rol Estudiante inicial
      this.usuario = {
        id: 1,
        nombre: 'Santiago Gómez Morales',
        email: 'santiago.gomez@universidad.edu.co',
        rol: 'ESTUDIANTE',
        nivel: 'Intermedio',
        area: 'Desarrollo Web y Cloud'
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('rutaia_user', JSON.stringify(this.usuario));
      }
    } catch (e) {
      console.warn('Error al cargar usuario de localStorage', e);
    }
  },

  setUsuario(user) {
    this.usuario = user;
    if (typeof localStorage !== 'undefined') {
      if (user) {
        const cleanUser = { ...user };
        delete cleanUser.token; // El token se gestiona exclusivamente en Redis y HttpOnly Cookie
        localStorage.setItem('rutaia_user', JSON.stringify(cleanUser));
      } else {
        localStorage.removeItem('rutaia_user');
      }
    }
    if (user && user.rol === 'ESTUDIANTE' && user.id) {
      this.estudianteActivo = {
        id: user.id,
        nombreCompleto: user.nombre,
        correoElectronico: user.email,
        nivelExperiencia: user.nivel || 'Intermedio',
        areaInteres: user.area || 'Tecnología'
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('rutaia_active_student_id', user.id);
      }
    }
  },

  esAdmin() {
    return this.usuario && this.usuario.rol === 'ADMINISTRADOR';
  },

  getRol() {
    return this.usuario ? this.usuario.rol : 'ESTUDIANTE';
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
      const savedId = localStorage.getItem('rutaia_active_student_id');
      const found = lista.find(e => e.id == savedId);
      this.estudianteActivo = found || lista[0];
    }
  },

  setEstudianteActivo(estudiante) {
    this.estudianteActivo = estudiante;
    if (estudiante) {
      localStorage.setItem('rutaia_active_student_id', estudiante.id);
      if (this.usuario && this.usuario.rol === 'ESTUDIANTE') {
        this.usuario.id = estudiante.id;
        this.usuario.nombre = estudiante.nombreCompleto;
        this.usuario.email = estudiante.correoElectronico;
        this.usuario.nivel = estudiante.nivelExperiencia;
        this.usuario.area = estudiante.areaInteres;
        delete this.usuario.token;
        localStorage.setItem('rutaia_user', JSON.stringify(this.usuario));
      }
    }
  },

  setCursos(lista) {
    this.cursos = lista;
  },

  setCursosAdmin(lista) {
    this.cursosAdmin = lista;
  },

  setUltimaRecomendacion(rec) {
    this.ultimaRecomendacion = rec;
  },

  setHistorial(lista) {
    this.historial = lista;
  },

  setEstadisticas(stats) {
    this.estadisticas = stats;
  }
};

// Inicializar usuario al cargar módulo
state.initUsuario();
