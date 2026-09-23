/**
 * RutaIA - Controlador de la Página Profesional de Login e Inscripción
 * Layout: Split-Screen Enterprise Editorial
 */

import { api } from './api.js';

let rolSeleccionado = 'ESTUDIANTE';

document.addEventListener('DOMContentLoaded', () => {
  initModeToggle();
  initRoleSegments();
  initPasswordToggles();
  initEmailValidators();
  initPasswordValidators();
  initAreaChips();
  initGoogleLogin();
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

// 2. Selector Segmentado de Roles (Estudiante / Docente / Administrador)
function initRoleSegments() {
  const segStudent = document.getElementById('seg-role-student');
  const segDocente = document.getElementById('seg-role-docente');
  const segAdmin = document.getElementById('seg-role-admin');
  const emailInput = document.getElementById('login-email');
  const pwdInput = document.getElementById('login-password');

  const setRole = (rol, activeBtn, defaultEmail) => {
    rolSeleccionado = rol;
    [segStudent, segDocente, segAdmin].forEach(b => {
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

// 7. Autenticación con Google Sign-In
function initGoogleLogin() {
  const btn = document.getElementById('login-google-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Verificando credenciales de Google...</span>';

    try {
      const authData = await api.loginGoogle('estudiante.google@universidad.edu.co', 'Estudiante Google Demo', 'ESTUDIANTE');
      guardarSesionYRedirigir(authData, `¡Bienvenido(a) con Google, ${authData.nombre}!`);
    } catch (err) {
      mostrarToast('Error en autenticación con Google: ' + err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
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
      guardarSesionYRedirigir(authData, `Bienvenido(a) a RutaIA. Rol: ${authData.rol}`);
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

// 10. Guardar Sesión y Redirigir al Dashboard Principal
function guardarSesionYRedirigir(authData, mensajeBienvenida) {
  try {
    // Seguridad con Redis: El token JWT viaja en HttpOnly Cookie y se valida en Redis.
    // NUNCA se persiste el token en localStorage ni en la caché del cliente.
    const userDisplay = { ...authData };
    delete userDisplay.token;
    localStorage.setItem('rutaia_user', JSON.stringify(userDisplay));
    if (authData.id) {
      localStorage.setItem('rutaia_active_student_id', authData.id);
    }
  } catch (e) {
    console.error('Error guardando en localStorage', e);
  }

  mostrarToast(mensajeBienvenida, 'success');

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 650);
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
