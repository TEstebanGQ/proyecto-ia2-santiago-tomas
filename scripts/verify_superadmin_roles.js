const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function login(correo, password, rol) {
  const res = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { correoElectronico: correo, password: password, rol: rol });
  return res.data ? res.data.token : null;
}

async function runTests() {
  console.log('--- INICIANDO VERIFICACIÓN DE SUPERADMIN Y ADMINISTRADOR ---');

  // 1. Login Superadmin
  const superToken = await login('superadmin@universidad.edu.co', 'password123', 'SUPERADMIN');
  console.log('1. Login Superadmin:', superToken ? 'OK (Token obtenido)' : 'FAIL');
  if (!superToken) process.exit(1);

  // 2. Login Admin
  const adminToken = await login('admin@universidad.edu.co', 'password123', 'ADMINISTRADOR');
  console.log('2. Login Administrador:', adminToken ? 'OK (Token obtenido)' : 'FAIL');
  if (!adminToken) process.exit(1);

  // 3. Roles permitidos Superadmin
  const resSuperRoles = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/usuarios/roles-permitidos',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${superToken}` }
  });
  console.log('3. Roles permitidos para SUPERADMIN:', resSuperRoles.data);

  // 4. Roles permitidos Admin
  const resAdminRoles = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/usuarios/roles-permitidos',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('4. Roles permitidos para ADMINISTRADOR:', resAdminRoles.data);

  // 5. Superadmin crea ADMINISTRADOR
  const rand = Date.now();
  const resCrearAdmin = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/usuarios',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${superToken}`
    }
  }, {
    nombreCompleto: `Sub Admin ${rand}`,
    correoElectronico: `subadmin_${rand}@universidad.edu.co`,
    password: 'password123',
    rol: 'ADMINISTRADOR'
  });
  console.log('5. Superadmin crea ADMINISTRADOR:', resCrearAdmin.status === 201 ? 'OK (201 Created)' : `FAIL (${resCrearAdmin.status})`, resCrearAdmin.data ? resCrearAdmin.data.correoElectronico : '');

  // 6. Admin intenta crear ADMINISTRADOR (debe ser 403 Forbidden)
  const resAdminCreaAdmin = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/usuarios',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    nombreCompleto: `Hacker Admin ${rand}`,
    correoElectronico: `hackeradmin_${rand}@universidad.edu.co`,
    password: 'password123',
    rol: 'ADMINISTRADOR'
  });
  console.log('6. Admin intenta crear ADMINISTRADOR:', resAdminCreaAdmin.status === 403 ? 'OK (403 Forbidden denegado correctamente)' : `FAIL (${resAdminCreaAdmin.status})`, resAdminCreaAdmin.data ? resAdminCreaAdmin.data.mensaje : '');

  // 7. Admin intenta crear SUPERADMIN (debe ser 403 Forbidden)
  const resAdminCreaSuper = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/usuarios',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    nombreCompleto: `Fake Super ${rand}`,
    correoElectronico: `fakesuper_${rand}@universidad.edu.co`,
    password: 'password123',
    rol: 'SUPERADMIN'
  });
  console.log('7. Admin intenta crear SUPERADMIN:', resAdminCreaSuper.status === 403 ? 'OK (403 Forbidden denegado correctamente)' : `FAIL (${resAdminCreaSuper.status})`, resAdminCreaSuper.data ? resAdminCreaSuper.data.mensaje : '');

  // 8. Admin crea DOCENTE y ESTUDIANTE (debe ser 201)
  const resAdminCreaDocente = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/usuarios',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    nombreCompleto: `Profesor Prueba ${rand}`,
    correoElectronico: `profesor_${rand}@universidad.edu.co`,
    password: 'password123',
    rol: 'DOCENTE',
    departamento: 'Ingeniería de Sistemas'
  });
  console.log('8a. Admin crea DOCENTE:', resAdminCreaDocente.status === 201 ? 'OK (201 Created)' : `FAIL (${resAdminCreaDocente.status})`);

  const resAdminCreaEstudiante = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/usuarios',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    nombreCompleto: `Alumno Prueba ${rand}`,
    correoElectronico: `alumno_${rand}@universidad.edu.co`,
    password: 'password123',
    rol: 'ESTUDIANTE',
    programaAcademico: 'Ingeniería de Sistemas',
    semestre: 3
  });
  console.log('8b. Admin crea ESTUDIANTE:', resAdminCreaEstudiante.status === 201 ? 'OK (201 Created)' : `FAIL (${resAdminCreaEstudiante.status})`);

  // 9. Superadmin cambia contraseña de un usuario
  const idDocenteCreado = resAdminCreaDocente.data.id;
  const resSuperPassword = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/usuarios/${idDocenteCreado}/password`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${superToken}`
    }
  }, { nuevaPassword: 'newpassword456' });
  console.log('9. Superadmin cambia contraseña de docente:', resSuperPassword.status === 200 ? 'OK (200 OK)' : `FAIL (${resSuperPassword.status})`);

  // 10. Admin cambia contraseña de estudiante
  const idEstudianteCreado = resAdminCreaEstudiante.data.id;
  const resAdminPasswordEst = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/usuarios/${idEstudianteCreado}/password`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, { nuevaPassword: 'newstudentpassword789' });
  console.log('10. Admin cambia contraseña de estudiante:', resAdminPasswordEst.status === 200 ? 'OK (200 OK)' : `FAIL (${resAdminPasswordEst.status})`);

  // 11. Admin intenta cambiar la contraseña del SUPERADMIN (debe ser 403 Forbidden)
  // Obtenemos el id del superadmin
  const resListUsers = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/usuarios',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${superToken}` }
  });
  const superUser = resListUsers.data.find(u => u.correoElectronico === 'superadmin@universidad.edu.co');
  if (superUser) {
    const resAdminHackSuper = await request({
      hostname: 'localhost',
      port: 8080,
      path: `/api/usuarios/${superUser.id}/password`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      nuevaPassword: 'hackedpassword'
    });
    console.log('11. Admin intenta cambiar contraseña de SUPERADMIN:', resAdminHackSuper.status === 403 ? 'OK (403 Forbidden denegado correctamente)' : `FAIL (${resAdminHackSuper.status})`, resAdminHackSuper.data ? resAdminHackSuper.data.mensaje : '');
  }

  console.log('--- VERIFICACIÓN FINALIZADA CON ÉXITO ---');
}

runTests().catch(err => {
  console.error('Error durante la prueba:', err);
  process.exit(1);
});
