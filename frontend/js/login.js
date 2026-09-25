/**
 * RutaIA - Controlador de la Página Profesional de Login e Inscripción
 * Layout: Split-Screen Enterprise Editorial
 */

import { api } from './api.js?v=8.3';

let rolSeleccionado = 'ESTUDIANTE';

document.addEventListener('DOMContentLoaded', () => {
  initModeToggle();
  initRoleSegments();
  initPasswordToggles();
  initEmailValidators();
  initPasswordValidators();
  initAreaChips();
  initGoogleIdentityLogin();
  initLoginForm();
  initRegisterForm();
});

// 1. Alternar entre Iniciar Sesión y Registrarse Gratis
function initModeToggle() {
  const toggleBtn = document.getElementById('btn-toggle-mode');
  const promptLabel = document.getElementById('switch-prompt');
  const panelLogin = document.getElementById('pro-panel-login');
  const panelRegister = document.getElementById('pro-panel-register');

  if (!toggleBtn || !panelLogin || !panelRegister) return;

  const setMode = (mode) => {
    if (mode === 'register') {
      panelLogin.classList.remove('active');
      panelRegister.classList.add('active');
      toggleBtn.textContent = 'Iniciar sesión';
      if (promptLabel) promptLabel.textContent = '¿Ya tienes una cuenta?';
    } else {
      panelRegister.classList.remove('active');
      panelLogin.classList.add('active');
      toggleBtn.textContent = 'Registrarse gratis';
      if (promptLabel) promptLabel.textContent = '¿No tienes cuenta aún?';
    }
  };

  toggleBtn.addEventListener('click', () => {
    const isLoginActive = panelLogin.classList.contains('active');
    setMode(isLoginActive ? 'register' : 'login');
  });

  // Parámetro de URL ?tab=register
  const params = new URLSearchParams(window.location.search);
  if (params.get('tab') === 'register') {
    setMode('register');
  }
}

// 2. Selector Segmentado de Roles (Estudiante / Docente / Administrador / Superadmin)
function initRoleSegments() {
  const segStudent = document.getElementById('seg-role-student');
  const segDocente = document.getElementById('seg-role-docente');
  const segAdmin = document.getElementById('seg-role-admin');
  const segSuperAdmin = document.getElementById('seg-role-superadmin');
  const emailInput = document.getElementById('login-email');
  const pwdInput = document.getElementById('login-password');

  const setRole = (rol, activeBtn, defaultEmail) => {
    rolSeleccionado = rol;
    [segStudent, segDocente, segAdmin, segSuperAdmin].forEach(b => {
      if (b) b.classList.toggle('active', b === activeBtn);
    });
    if (emailInput && (!emailInput.value || emailInput.value.includes('universidad.edu.co'))) {
      emailInput.value = defaultEmail;
    }
    if (pwdInput && !pwdInput.value) {
      pwdInput.value = 'password123';
    }
  };

  if (segStudent) {
    segStudent.addEventListener('click', () => {
      setRole('ESTUDIANTE', segStudent, 'santiago.gomez@universidad.edu.co');
    });
  }

  if (segDocente) {
    segDocente.addEventListener('click', () => {
      setRole('DOCENTE', segDocente, 'profesor.programacion@universidad.edu.co');
    });
  }

  if (segAdmin) {
    segAdmin.addEventListener('click', () => {
      setRole('ADMINISTRADOR', segAdmin, 'admin@universidad.edu.co');
    });
  }

  if (segSuperAdmin) {
    segSuperAdmin.addEventListener('click', () => {
      setRole('SUPERADMIN', segSuperAdmin, 'superadmin@universidad.edu.co');
    });
  }

  // Default password for convenience on initial load
  if (pwdInput && !pwdInput.value) {
    pwdInput.value = 'password123';
  }
}

// 3. Mostrar / Ocultar Contraseña con botón de ojo
function initPasswordToggles() {
  document.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      btn.title = isPwd ? 'Ocultar contraseña' : 'Ver contraseña';
      btn.classList.toggle('active', isPwd);
    });
  });
}

// 4. Validador Inteligente de Correo Electrónico (Gmail, Dominios y Corrección de Typos)
function validarEmailInteligente(email) {
  if (!email || email.trim().length === 0) {
    return { valido: false, mensaje: 'El correo electrónico es obligatorio.' };
  }

  const limpio = email.trim().toLowerCase();

  if (limpio.includes(' ')) {
    return { valido: false, mensaje: 'El correo electrónico no debe contener espacios.' };
  }

  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regexEmail.test(limpio)) {
    return { valido: false, mensaje: 'Por favor ingresa un correo con formato válido (ej: usuario@gmail.com).' };
  }

  const partes = limpio.split('@');
  const dominio = partes[1];

  // Detección de errores comunes al tipear Gmail
  const typosGmail = ['gmial.com', 'gmai.com', 'gmaill.com', 'gamil.com', 'gimal.com', 'gmail.co', 'gma.com'];
  if (typosGmail.includes(dominio)) {
    return { 
      valido: false, 
      sugerencia: `${partes[0]}@gmail.com`,
      mensaje: `¿Quisiste escribir @gmail.com? Hay un error en "${dominio}".` 
    };
  }

  // Detección de errores en Hotmail
  const typosHotmail = ['hotmial.com', 'hotmal.com', 'hotmai.com', 'hormail.com'];
  if (typosHotmail.includes(dominio)) {
    return { 
      valido: false, 
      sugerencia: `${partes[0]}@hotmail.com`,
      mensaje: `¿Quisiste escribir @hotmail.com? Hay un error en "${dominio}".` 
    };
  }

  // Detección de errores en Outlook
  const typosOutlook = ['outlok.com', 'outloo.com', 'outloock.com'];
  if (typosOutlook.includes(dominio)) {
    return { 
      valido: false, 
      sugerencia: `${partes[0]}@outlook.com`,
      mensaje: `¿Quisiste escribir @outlook.com? Hay un error en "${dominio}".` 
    };
  }

  return { valido: true, email: limpio, mensaje: 'Correo con formato válido ✓' };
}

function initEmailValidators() {
  const regEmail = document.getElementById('reg-email');
  const regEmailMsg = document.getElementById('reg-email-msg');

  if (regEmail && regEmailMsg) {
    regEmail.addEventListener('input', () => {
      const val = regEmail.value.trim();
      if (!val) {
        regEmailMsg.textContent = '';
        regEmailMsg.className = 'input-validation-msg';
        return;
      }
      const res = validarEmailInteligente(val);
      if (res.valido) {
        regEmailMsg.textContent = res.mensaje;
        regEmailMsg.className = 'input-validation-msg valid';
      } else {
        if (res.sugerencia) {
          regEmailMsg.innerHTML = `${res.mensaje} <button type="button" class="btn-apply-suggestion" data-suggest="${res.sugerencia}">Corregir a ${res.sugerencia}</button>`;
          const btn = regEmailMsg.querySelector('.btn-apply-suggestion');
          if (btn) {
            btn.onclick = () => {
              regEmail.value = res.sugerencia;
              regEmail.dispatchEvent(new Event('input'));
            };
          }
        } else {
          regEmailMsg.textContent = res.mensaje;
        }
        regEmailMsg.className = 'input-validation-msg error';
      }
    });
  }

  // Validación de Nombre en Registro
  const regName = document.getElementById('reg-name');
  const regNameMsg = document.getElementById('reg-name-msg');
  if (regName && regNameMsg) {
    regName.addEventListener('input', () => {
      const val = regName.value.trim();
      if (!val) {
        regNameMsg.textContent = '';
        regNameMsg.className = 'input-validation-msg';
      } else if (val.length < 3) {
        regNameMsg.textContent = 'El nombre debe tener al menos 3 caracteres.';
        regNameMsg.className = 'input-validation-msg error';
      } else {
        regNameMsg.textContent = 'Nombre válido ✓';
        regNameMsg.className = 'input-validation-msg valid';
      }
    });
  }
}

// 5. Validación de Contraseñas en Registro
function initPasswordValidators() {
  const regPwd = document.getElementById('reg-password');
  const regPwdMsg = document.getElementById('reg-password-msg');
  const regConfirm = document.getElementById('reg-password-confirm');
  const regConfirmMsg = document.getElementById('reg-password-confirm-msg');

  if (regPwd && regPwdMsg) {
    regPwd.addEventListener('input', () => {
      const val = regPwd.value;
      if (!val) {
        regPwdMsg.textContent = '';
        regPwdMsg.className = 'input-validation-msg';
      } else if (val.length < 6) {
        regPwdMsg.textContent = `La contraseña debe tener al menos 6 caracteres (${val.length}/6).`;
        regPwdMsg.className = 'input-validation-msg error';
      } else {
        regPwdMsg.textContent = 'Contraseña segura ✓';
        regPwdMsg.className = 'input-validation-msg valid';
      }

      // Revalidar confirmación si ya tiene texto
      if (regConfirm && regConfirm.value) {
        regConfirm.dispatchEvent(new Event('input'));
      }
    });
  }

  if (regConfirm && regConfirmMsg) {
    regConfirm.addEventListener('input', () => {
      const val = regConfirm.value;
      const pwdVal = regPwd ? regPwd.value : '';

      if (!val) {
        regConfirmMsg.textContent = '';
        regConfirmMsg.className = 'input-validation-msg';
      } else if (val !== pwdVal) {
        regConfirmMsg.textContent = 'Las contraseñas no coinciden.';
        regConfirmMsg.className = 'input-validation-msg error';
      } else {
        regConfirmMsg.textContent = 'Las contraseñas coinciden ✓';
        regConfirmMsg.className = 'input-validation-msg valid';
      }
    });
  }
}

// 6. Chips de Área de Interés Rápida
function initAreaChips() {
  const chips = document.querySelectorAll('.pro-mini-chip');
  const inputArea = document.getElementById('reg-area');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (inputArea) {
        inputArea.value = chip.dataset.val;
        inputArea.focus();
        inputArea.dispatchEvent(new Event('input'));
      }
    });
  });
}

// 7. Autenticación con Google Sign-In & Onboarding Obligatorio
function initGoogleLogin() {
  const btnOpen = document.getElementById('login-google-btn');
  const modal = document.getElementById('modal-google-auth');
  const btnClose = document.getElementById('btn-close-google-modal');
  const stepSelect = document.getElementById('google-step-select');
  const stepProfile = document.getElementById('google-step-profile');
  const accountItems = document.querySelectorAll('.google-account-item');
  const btnToggleCustom = document.getElementById('btn-toggle-custom-google');
  const customForm = document.getElementById('google-custom-account-form');
  const profileForm = document.getElementById('google-complete-profile-form');
  const btnBack = document.getElementById('btn-back-to-google-accounts');

  // Datos temporales de la cuenta de Google seleccionada
  let activeGoogleAccount = {
    email: '',
    nombre: '',
    rol: 'ESTUDIANTE'
  };

  if (!btnOpen || !modal) return;

  // Abrir modal de Google
  btnOpen.addEventListener('click', () => {
    modal.style.display = 'flex';
    mostrarPasoGoogle('select');
  });

  // Cerrar modal de Google
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Cerrar al dar click fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Alternar formulario de cuenta personalizada
  if (btnToggleCustom && customForm) {
    btnToggleCustom.addEventListener('click', () => {
      const isHidden = customForm.style.display === 'none';
      customForm.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        document.getElementById('google-custom-email')?.focus();
      }
    });
  }

  // Manejar selección de cuenta rápida existente
  accountItems.forEach(item => {
    item.addEventListener('click', async () => {
      const email = item.dataset.email;
      const nombre = item.dataset.name;
      await procesarCuentaGoogle(email, nombre);
    });
  });

  // Manejar envío de cuenta personalizada
  if (customForm) {
    customForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('google-custom-email');
      const nameInput = document.getElementById('google-custom-name');

      const email = emailInput ? emailInput.value.trim() : '';
      const nombre = nameInput ? nameInput.value.trim() : '';

      if (!email || !nombre) {
        mostrarToast('Por favor ingresa tu correo y nombre completo de Google.', 'error');
        return;
      }

      await procesarCuentaGoogle(email, nombre);
    });
  }

  // Función principal para verificar y procesar la cuenta de Google
  async function procesarCuentaGoogle(email, nombre) {
    activeGoogleAccount.email = email;
    activeGoogleAccount.nombre = nombre;

    mostrarToast('Verificando cuenta de Google...', 'info');

    try {
      const check = await api.checkGoogleUser(email);

      // Si es Superadmin, Administrador o Estudiante con perfil completo -> Login directo
      if (check.existe && check.perfilCompleto && !check.requiereCompletarPerfil) {
        const authData = await api.loginGoogle({
          email,
          nombre: check.nombre || nombre,
          rol: check.rol || 'ESTUDIANTE'
        });

        guardarSesionYRedirigir(authData, `¡Bienvenido(a) con Google, ${authData.nombre}!`);
        return;
      }

      // Si no existe o tiene datos incompletos -> Obligatorio completar perfil académico
      abrirPasoCompletarPerfil(email, check.nombre || nombre, check.rol || 'ESTUDIANTE', check);
    } catch (err) {
      console.warn('Error verificando cuenta Google, solicitando datos obligatorios:', err);
      abrirPasoCompletarPerfil(email, nombre, 'ESTUDIANTE', {});
    }
  }

  // Abrir Paso 2: Formulario Obligatorio de Información Académica
  function abrirPasoCompletarPerfil(email, nombre, rolSugerido, checkData) {
    mostrarPasoGoogle('profile');

    const nameEl = document.getElementById('google-profile-name');
    const emailEl = document.getElementById('google-profile-email');
    const avatarEl = document.getElementById('google-profile-avatar');

    if (nameEl) nameEl.textContent = nombre;
    if (emailEl) emailEl.textContent = email;
    if (avatarEl) {
      const initials = (nombre || 'G').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      avatarEl.textContent = initials;
    }

    // Configurar roles en Paso 2
    const segStudent = document.getElementById('google-role-student');
    const segDocente = document.getElementById('google-role-docente');
    const facultyReqLabel = document.getElementById('google-faculty-req-label');

    let rolActual = rolSugerido === 'DOCENTE' ? 'DOCENTE' : 'ESTUDIANTE';
    activeGoogleAccount.rol = rolActual;

    const actualizarVisualRol = (rol) => {
      activeGoogleAccount.rol = rol;
      if (segStudent) segStudent.classList.toggle('active', rol === 'ESTUDIANTE');
      if (segDocente) segDocente.classList.toggle('active', rol === 'DOCENTE');
      if (facultyReqLabel) {
        facultyReqLabel.innerHTML = rol === 'DOCENTE'
          ? '<strong style="color: #DC2626;">(Obligatorio para docentes)</strong>'
          : '(Opcional para estudiantes)';
      }
    };

    if (segStudent) segStudent.onclick = () => actualizarVisualRol('ESTUDIANTE');
    if (segDocente) segDocente.onclick = () => actualizarVisualRol('DOCENTE');
    actualizarVisualRol(rolActual);

    // Precargar si había datos parciales
    const levelInput = document.getElementById('google-input-level');
    const areaInput = document.getElementById('google-input-area');
    const facultyInput = document.getElementById('google-input-faculty');

    if (levelInput) levelInput.value = checkData.nivelExperiencia || '';
    if (areaInput) areaInput.value = checkData.areaInteres || '';
    if (facultyInput && checkData.departamentoFacultad) facultyInput.value = checkData.departamentoFacultad;

    // Limpiar errores visuales previos
    limpiarErroresGoogle();
  }

  // Chips interactivos de área de interés
  const chips = document.querySelectorAll('.google-chip');
  const areaInput = document.getElementById('google-input-area');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (areaInput) {
        areaInput.value = chip.dataset.val;
        areaInput.classList.remove('input-invalid');
        const msg = document.getElementById('google-area-msg');
        if (msg) msg.textContent = '';
      }
    });
  });

  // Botón para volver al selector de cuentas
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      mostrarPasoGoogle('select');
    });
  }

  // Envío del Formulario Obligatorio de Información de Perfil
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const levelInput = document.getElementById('google-input-level');
      const levelMsg = document.getElementById('google-level-msg');
      const areaInput = document.getElementById('google-input-area');
      const areaMsg = document.getElementById('google-area-msg');
      const facultyInput = document.getElementById('google-input-faculty');
      const facultyMsg = document.getElementById('google-faculty-msg');
      const submitBtn = document.getElementById('btn-submit-google-profile');

      limpiarErroresGoogle();

      let valido = true;

      // 1. Validar Nivel de Experiencia OBLIGATORIO
      const nivel = levelInput ? levelInput.value.trim() : '';
      if (!nivel) {
        valido = false;
        if (levelInput) levelInput.classList.add('input-invalid');
        if (levelMsg) {
          levelMsg.textContent = 'Debes seleccionar obligatoriamente tu nivel de experiencia.';
          levelMsg.className = 'input-validation-msg error';
        }
      }

      // 2. Validar Área de Interés OBLIGATORIA
      const area = areaInput ? areaInput.value.trim() : '';
      if (!area || area.length < 3) {
        valido = false;
        if (areaInput) areaInput.classList.add('input-invalid');
        if (areaMsg) {
          areaMsg.textContent = 'Debes indicar obligatoriamente tu área de interés vocacional (mínimo 3 caracteres).';
          areaMsg.className = 'input-validation-msg error';
        }
      }

      // 3. Validar Facultad si es Docente
      const facultad = facultyInput ? facultyInput.value.trim() : '';
      if (activeGoogleAccount.rol === 'DOCENTE' && !facultad) {
        valido = false;
        if (facultyInput) facultyInput.classList.add('input-invalid');
        if (facultyMsg) {
          facultyMsg.textContent = 'Para el rol de Docente, la facultad o departamento es obligatoria.';
          facultyMsg.className = 'input-validation-msg error';
        }
      }

      if (!valido) {
        mostrarToast('Por favor completa todos los campos académicos obligatorios.', 'error');
        return;
      }

      // Proceder con el registro / completado en el backend
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Completando vinculación con Google...</span>';
      }

      try {
        const authData = await api.loginGoogle({
          email: activeGoogleAccount.email,
          nombre: activeGoogleAccount.nombre,
          rol: activeGoogleAccount.rol,
          nivelExperiencia: nivel,
          areaInteres: area,
          departamentoFacultad: facultad || 'Google Pregrado'
        });

        if (authData.requiereCompletarPerfil) {
          mostrarToast(authData.mensaje || 'Información requerida pendiente.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Completar Registro e Ingresar</span><span class="pro-btn-arrow">➔</span>';
          }
          return;
        }

        modal.style.display = 'none';
        guardarSesionYRedirigir(authData, `¡Registro con Google exitoso! Bienvenido(a), ${authData.nombre}`);
      } catch (err) {
        mostrarToast('Error al vincular cuenta de Google: ' + err.message, 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Completar Registro e Ingresar</span><span class="pro-btn-arrow">➔</span>';
        }
      }
    });
  }

  function mostrarPasoGoogle(paso) {
    if (stepSelect) stepSelect.style.display = paso === 'select' ? 'block' : 'none';
    if (stepProfile) stepProfile.style.display = paso === 'profile' ? 'block' : 'none';
  }

  function limpiarErroresGoogle() {
    ['google-input-level', 'google-input-area', 'google-input-faculty'].forEach(id => {
      document.getElementById(id)?.classList.remove('input-invalid');
    });
    ['google-level-msg', 'google-area-msg', 'google-faculty-msg'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = '';
        el.className = 'input-validation-msg';
      }
    });
  }
}

// 8. Formulario de Inicio de Sesión
function initLoginForm() {
  const form = document.getElementById('pro-form-login');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const emailMsg = document.getElementById('login-email-msg');
    const pwdInput = document.getElementById('login-password');
    const pwdMsg = document.getElementById('login-password-msg');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = pwdInput ? pwdInput.value : '';

    const resEmail = validarEmailInteligente(email);
    if (!resEmail.valido) {
      if (emailMsg) {
        emailMsg.textContent = resEmail.mensaje;
        emailMsg.className = 'input-validation-msg error';
      }
      if (emailInput) emailInput.focus();
      return;
    }

    if (!password || password.length < 4) {
      if (pwdMsg) {
        pwdMsg.textContent = 'Por favor ingresa una contraseña válida (mínimo 4 caracteres).';
        pwdMsg.className = 'input-validation-msg error';
      }
      if (pwdInput) pwdInput.focus();
      return;
    }

    const submitBtn = document.getElementById('btn-submit-login');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Verificando credenciales...</span>';

    try {
      const authData = await api.login(email, rolSeleccionado, '', password);
      if (authData.debeCambiarPassword) {
        mostrarCambioPasswordInicial(authData);
      } else {
        guardarSesionYRedirigir(authData, `Bienvenido(a) a RutaIA. Rol: ${authData.rol}`);
      }
    } catch (err) {
      mostrarToast('Error al ingresar: ' + err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Ingresar a la Plataforma</span><span class="pro-btn-arrow">➔</span>';
    }
  });
}

// 9. Formulario de Auto-Inscripción de Estudiante ("Registrarse gratis")
function initRegisterForm() {
  const form = document.getElementById('pro-form-register');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const pwdInput = document.getElementById('reg-password');
    const pwdConfirmInput = document.getElementById('reg-password-confirm');
    const levelSelect = document.getElementById('reg-level');
    const areaInput = document.getElementById('reg-area');

    const nombreCompleto = nameInput.value.trim();
    const correoElectronico = emailInput.value.trim();
    const password = pwdInput ? pwdInput.value : '';
    const passwordConfirm = pwdConfirmInput ? pwdConfirmInput.value : '';
    const nivelExperiencia = levelSelect.value;
    const areaInteres = areaInput.value.trim();

    if (nombreCompleto.length < 3) {
      mostrarToast('El nombre completo debe tener al menos 3 caracteres.', 'error');
      nameInput.focus();
      return;
    }

    const resEmail = validarEmailInteligente(correoElectronico);
    if (!resEmail.valido) {
      mostrarToast(resEmail.mensaje, 'error');
      emailInput.focus();
      return;
    }

    if (!password || password.length < 6) {
      mostrarToast('La contraseña debe tener al menos 6 caracteres.', 'error');
      if (pwdInput) pwdInput.focus();
      return;
    }

    if (password !== passwordConfirm) {
      mostrarToast('Las contraseñas no coinciden. Por favor verifícalas.', 'error');
      if (pwdConfirmInput) pwdConfirmInput.focus();
      return;
    }

    if (!nivelExperiencia) {
      mostrarToast('Por favor selecciona tu nivel de experiencia.', 'error');
      levelSelect.focus();
      return;
    }

    if (!areaInteres) {
      mostrarToast('Por favor indica tu área de interés vocacional.', 'error');
      areaInput.focus();
      return;
    }

    const submitBtn = document.getElementById('btn-submit-register');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Registrando e inscribiendo estudiante...</span>';

    try {
      // 1. Guardar en backend (RF 01) con password
      const nuevoEstudiante = await api.registrarEstudiante({
        nombreCompleto,
        correoElectronico: resEmail.email,
        nivelExperiencia,
        areaInteres,
        password
      });

      // 2. Iniciar sesión automática con rol ESTUDIANTE y contraseña
      const authData = await api.login(resEmail.email, 'ESTUDIANTE', nombreCompleto, password);
      authData.id = nuevoEstudiante.id;
      authData.nombre = nuevoEstudiante.nombreCompleto;
      authData.email = nuevoEstudiante.correoElectronico;
      authData.nivel = nuevoEstudiante.nivelExperiencia;
      authData.area = nuevoEstudiante.areaInteres;

      guardarSesionYRedirigir(authData, `¡Inscripción exitosa! Bienvenido(a) ${authData.nombre}`);
    } catch (err) {
      mostrarToast('Error en la inscripción: ' + err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Crear Cuenta de Estudiante e Ingresar</span><span class="pro-btn-arrow">➔</span>';
    }
  });
}

// 10. Confirmar Sesión en Redis y Redirigir al Dashboard Principal
function mostrarCambioPasswordInicial(authData) {
  const modal = document.getElementById('initial-password-modal');
  const form = document.getElementById('initial-password-form');
  const user = document.getElementById('initial-password-user');
  if (!modal || !form) return;

  if (user) user.textContent = authData.nombre || authData.email || 'Cuenta institucional';
  modal.style.display = 'flex';
  document.getElementById('initial-password-current')?.focus();

  form.onsubmit = async event => {
    event.preventDefault();
    const actual = document.getElementById('initial-password-current')?.value || '';
    const nueva = document.getElementById('initial-password-new')?.value || '';
    const confirmacion = document.getElementById('initial-password-confirm')?.value || '';
    const submit = document.getElementById('btn-submit-initial-password');

    if (!actual || nueva.length < 6) {
      mostrarToast('La nueva contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    if (nueva !== confirmacion) {
      mostrarToast('La confirmación no coincide con la nueva contraseña.', 'error');
      return;
    }
    if (actual === nueva) {
      mostrarToast('La nueva contraseña debe ser diferente a la inicial.', 'error');
      return;
    }

    submit.disabled = true;
    submit.innerHTML = '<span>Actualizando contraseña...</span>';
    try {
      await api.cambiarPasswordInicial(actual, nueva);
      modal.style.display = 'none';
      guardarSesionYRedirigir(authData, 'Contraseña actualizada. Bienvenido(a) a RutaIA.');
    } catch (error) {
      mostrarToast(error.message, 'error');
      submit.disabled = false;
      submit.innerHTML = '<span>Guardar nueva contraseña e ingresar</span><span class="pro-btn-arrow">→</span>';
    }
  };
}

function guardarSesionYRedirigir(authData, mensajeBienvenida) {
  try {
    // Seguridad Estricta con Redis: Toda la información de sesión se almacena exclusivamente en Redis
    // y viaja vinculada a la HttpOnly Cookie. NUNCA se guarda en localStorage.
    localStorage.removeItem('rutaia_user');
    localStorage.removeItem('rutaia_active_student_id');
  } catch (e) {
    console.error('Error limpiando almacenamiento local', e);
  }

  mostrarToast(mensajeBienvenida, 'success');

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 650);
}

// Inicio de sesión real con Google Identity Services. Google presenta las
// cuentas abiertas del navegador y entrega una credencial firmada al callback.
function initGoogleIdentityLogin() {
  const openButton = document.getElementById('login-google-btn');
  const realGoogleButton = document.getElementById('google-signin-real');
  const modal = document.getElementById('modal-google-identity');
  const profileStep = document.getElementById('google-step-profile');
  const selectStep = document.getElementById('google-step-select');
  const closeButton = document.getElementById('btn-close-google-modal');
  const backButton = document.getElementById('btn-back-to-google-accounts');
  const form = document.getElementById('google-complete-profile-form');
  const clientId = window.RUTAIA_GOOGLE_CLIENT_ID;
  let account = null;
  let initialized = false;

  if (!openButton || !modal || !form) return;

  const showProfile = async (credential) => {
    const payloadPart = credential.split('.')[1];
    try {
      const payload = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')));
      account = {
        credential,
        email: payload.email || '',
        nombre: payload.name || 'Estudiante Google'
      };
    } catch (error) {
      mostrarToast('Google no entregó los datos de la cuenta. Intenta nuevamente.', 'error');
      return;
    }

    // Si el correo ya está registrado y su perfil está completo, el backend
    // inicia su sesión inmediatamente. Solo cuentas nuevas/incompletas ven el formulario.
    try {
      const authData = await api.loginGoogle({ credential });
      if (!authData.requiereCompletarPerfil) {
        guardarSesionYRedirigir(authData, `¡Bienvenido(a) de nuevo, ${authData.nombre}!`);
        return;
      }
    } catch (error) {
      if (error.message.includes('403')) {
        mostrarToast('Esta cuenta no está habilitada para el acceso estudiantil con Google.', 'error');
        return;
      }
      // Una cuenta nueva continúa al registro; el token definitivo se valida en el backend al guardarlo.
    }

    document.getElementById('google-profile-name').textContent = account.nombre;
    document.getElementById('google-profile-email').textContent = account.email;
    document.getElementById('google-profile-avatar').textContent = account.nombre
      .split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();
    if (selectStep) selectStep.style.display = 'none';
    if (profileStep) profileStep.style.display = 'block';
    modal.style.display = 'flex';
    document.getElementById('google-input-level')?.focus();
  };

  const initialize = () => {
    if (initialized) return true;
    if (!clientId || !window.google?.accounts?.id) return false;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: response => showProfile(response.credential),
      auto_select: false,
      cancel_on_tap_outside: true
    });
    initialized = true;
    if (realGoogleButton) {
      window.google.accounts.id.renderButton(realGoogleButton, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        locale: 'es',
        width: Math.min(390, Math.max(280, openButton?.offsetWidth || 390))
      });
      realGoogleButton.style.display = 'flex';
      if (openButton) openButton.style.display = 'none';
    }
    return true;
  };

  // La librería se carga de forma asíncrona. Al estar lista se sustituye el
  // botón decorativo por el botón oficial que abre el selector de cuentas real.
  const waitForGoogle = window.setInterval(() => {
    if (initialize()) window.clearInterval(waitForGoogle);
  }, 150);

  openButton.addEventListener('click', () => {
    if (!initialize()) {
      mostrarToast('Google aún está cargando. Intenta de nuevo en unos segundos.', 'info');
      return;
    }
    // Solo se usa como respaldo mientras la librería termina de renderizar el botón oficial.
    window.google.accounts.id.prompt();
  });

  closeButton?.addEventListener('click', () => { modal.style.display = 'none'; });
  backButton?.addEventListener('click', () => {
    modal.style.display = 'none';
    account = null;
    window.google?.accounts?.id?.prompt();
  });
  modal.addEventListener('click', event => {
    if (event.target === modal) modal.style.display = 'none';
  });

  document.querySelectorAll('.google-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const area = document.getElementById('google-input-area');
      if (area) area.value = chip.dataset.val || '';
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const nivel = document.getElementById('google-input-level')?.value.trim();
    const area = document.getElementById('google-input-area')?.value.trim();
    const facultad = document.getElementById('google-input-faculty')?.value.trim();
    const password = document.getElementById('google-input-password')?.value || '';
    const passwordConfirm = document.getElementById('google-input-password-confirm')?.value || '';
    const submit = document.getElementById('btn-submit-google-profile');

    if (!account?.credential) {
      mostrarToast('Selecciona una cuenta real de Google para continuar.', 'error');
      return;
    }
    if (!nivel || !area || area.length < 3) {
      mostrarToast('Completa tu nivel y área de interés para continuar.', 'error');
      return;
    }
    if (password.length < 6) {
      mostrarToast('Crea una contraseña de al menos 6 caracteres para RutaIA.', 'error');
      return;
    }
    if (password !== passwordConfirm) {
      mostrarToast('La confirmación de contraseña no coincide.', 'error');
      return;
    }

    submit.disabled = true;
    submit.innerHTML = '<span>Validando cuenta e ingresando...</span>';
    try {
      const authData = await api.loginGoogle({
        credential: account.credential,
        rol: 'ESTUDIANTE',
        password,
        nivelExperiencia: nivel,
        areaInteres: area,
        departamentoFacultad: facultad || 'Google Pregrado'
      });
      modal.style.display = 'none';
      guardarSesionYRedirigir(authData, `¡Bienvenido(a), ${authData.nombre}!`);
    } catch (error) {
      mostrarToast('No fue posible iniciar con Google: ' + error.message, 'error');
      submit.disabled = false;
      submit.innerHTML = '<span>Completar Registro e Ingresar</span><span class="pro-btn-arrow">→</span>';
    }
  });
}

function mostrarToast(mensaje, tipo = 'info') {
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
  }, 4000);
}
