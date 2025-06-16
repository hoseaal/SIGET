<?php
  header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
  header("Cache-Control: post-check=0, pre-check=0", false);
  header("Pragma: no-cache"); 
  
  require_once '../PHP/api/validar-jwt.php';

  // Verificar si el token es válido y está presente
  if (!isset($decoded) || !isset($decoded->data->tipo)) {
      header('Location: auth-login-basic.php');
      exit;
  }

  // Verificar si el tipo de usuario
  if ($decoded->data->tipo != '5') {
      header('Location: auth-login-basic.php');
      exit;
  }

  if (empty($_COOKIE['token'])) {
      header("Location: /SIGET/modulos/DireccionRRHH/html/auth-login-basic.php?nocache=".time());
      exit;
  }

  // Script anti-retroceso
  echo '<script>
      if (window.history && window.history.pushState) {
          window.history.pushState(null, null, document.URL);
          window.addEventListener("popstate", function() {
              window.location.href = "/SIGET/modulos/DireccionRRHH/html/auth-login-basic.php?force=" + Date.now();
          });
      }
  </script>';

  // Cédula del usuario logueado como variable JavaScript
  echo '<script>const LOGGED_USER_CI = "' . $decoded->data->cedula . '";</script>';
?>

<!DOCTYPE html>
<html
  lang="en"
  class="light-style customizer-hide"
  dir="ltr"
  data-theme="theme-default"
  data-assets-path="../assets/"
  data-template="vertical-menu-template-free"
>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"
    />

    <title>Registro - RRHH</title>

    <meta name="description" content="" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="../../../home/assets/img/logo-contraloria-home2.png" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
      rel="stylesheet"
    />

    <!-- Icons. Uncomment required icon fonts -->
    <link rel="stylesheet" href="../assets/vendor/fonts/boxicons.css" />

    <!-- Core CSS -->
    <link rel="stylesheet" href="../assets/vendor/css/core.css" class="template-customizer-core-css" />
    <link rel="stylesheet" href="../assets/vendor/css/theme-default.css" class="template-customizer-theme-css" />
    <link rel="stylesheet" href="../assets/css/demo.css" />

    <!-- Vendors CSS -->
    <link rel="stylesheet" href="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />

    <!-- SweetAlert2 -->
    <link href="../assets/css/sweetalert2.min.css" rel="stylesheet">
    <script src="../assets/js/sweetalert2.all.min.js"></script>

    <!-- Validación de Sesión -->
    <script src="../assets/js/modulos/check_sesion.js"></script>

    <!-- Page -->
    <link rel="stylesheet" href="../assets/vendor/css/pages/page-auth.css" />
    
    <!-- Helpers -->
    <script src="../assets/vendor/js/helpers.js"></script>
    <script src="../assets/js/config.js"></script>
  </head>

  <body>
    <!-- Content -->
    <div class="container-xxl">
      <div class="authentication-wrapper authentication-basic container-p-y">
        <div class="authentication-inner" style="max-width: 800px;">
          <!-- Register Card -->
          <div class="card p-4">
            <div class="card-body p-2">
              <!-- Logo -->
              <div class="app-brand justify-content-center mb-4">
                <a href="<?php echo ($GLOBALS['decoded']->data->tipo == '5') ? 'index.php' : 'index_usur.php'; ?>" class="app-brand-link gap-2">
                  <span class="app-brand-text demo text-body fw-bolder">SIGET</span>
                </a>
              </div>
              <!-- /Logo -->
              <h4 class="mb-3 text-center">Registra un nuevo usuario</h4>
              <p class="mb-4 text-center text-muted">Permite acceso a usuarios al sistema SIGET</p>

              <form id="formAuthentication" class="mb-3" action="../PHP/api/register.php" method="POST">
                <div class="row g-4">
                  <!-- Columna Izquierda -->
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="Cedula" class="form-label">Cédula</label>
                      <input
                        type="text"
                        class="form-control"
                        id="Cedula"
                        name="Cedula"
                        placeholder="Ej: 30297698"
                        required
                      />
                    </div>

                    <div class="mb-3">
                      <label for="nombre" class="form-label">Nombres</label>
                      <input type="text" class="form-control" id="nombre" name="nombre" required/>
                    </div> 

                    <div class="mb-3">
                      <label for="apellidos" class="form-label">Apellidos</label>
                      <input type="text" class="form-control" id="apellidos" name="apellidos" required />
                    </div>

                    <div class="mb-3">
                      <label for="moduloaccess" class="form-label">Módulos</label>
                      <select id="moduloaccess" name="moduloaccess" class="form-select" required>
                        <option value="">-- Selecciona --</option>
                      </select>
                    </div>
                  </div>
                  
                  <!-- Columna Derecha -->
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="username" class="form-label">Nombre de Usuario</label>
                      <input type="text" class="form-control" id="username" name="username" required />
                    </div>

                    <div class="mb-3 form-password-toggle">
                      <label class="form-label" for="password">Contraseña</label>
                      <div class="input-group input-group-merge">
                        <input
                          type="password"
                          id="password"
                          class="form-control"
                          name="password"
                          placeholder="············"
                          aria-describedby="password"
                          required
                        />
                        <span class="input-group-text cursor-pointer"><i class="bx bx-hide"></i></span>
                      </div>
                    </div>

                    <div class="mb-3 form-password-toggle">
                      <label class="form-label" for="confirm_password">Confirmar Contraseña</label>
                      <div class="input-group input-group-merge">
                        <input
                          type="password"
                          id="confirm_password"
                          class="form-control"
                          name="confirm_password"
                          placeholder="············"
                          aria-describedby="confirm_password"
                          required
                        />
                        <span class="input-group-text cursor-pointer"><i class="bx bx-hide"></i></span>
                      </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="tip" class="form-label">Rol del usuario</label>
                        <select id="tip" name="tip" class="form-select" required>
                            <option value="">-- Selecciona un rol --</option>
                        </select>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-center mt-4">
                  <button class="btn btn-primary px-5" type="submit">
                    <span class="fw-semibold">Registrar usuario</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
          <!-- Register Card -->
        </div>
      </div>
    </div>
    <!--/ Content -->

    <!-- Core JS -->
    <!-- build:js assets/vendor/js/core.js -->
    <script src="../assets/vendor/libs/jquery/jquery.js"></script>
    <script src="../assets/vendor/libs/popper/popper.js"></script>
    <script src="../assets/vendor/js/bootstrap.js"></script>
    <script src="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"></script>
    <script src="../assets/vendor/js/menu.js"></script>

    <!-- Main JS -->
    <script src="../assets/js/main.js"></script>

    <!-- Page JS -->
    <script>
      // Configuración común para los alerts pequeños
      const smallSwal = Swal.mixin({
        width: '400px',
        padding: '1rem',
        customClass: {
          popup: 'small-swal',
          title: 'small-swal-title',
          htmlContainer: 'small-swal-content',
          confirmButton: 'small-swal-confirm'
        }
      });

      // Validación en tiempo real para la cédula (solo números)
      document.getElementById('Cedula').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^\d]/g, '');
        if (this.value.length > 10) {
          this.value = this.value.slice(0, 10);
        }
      });

      // Validación en tiempo real para nombres (solo letras y espacios)
      document.getElementById('nombre').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
        if (this.value.length > 50) {
          this.value = this.value.slice(0, 50);
        }
      });

      // Validación en tiempo real para apellidos (solo letras y espacios)
      document.getElementById('apellidos').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
        if (this.value.length > 50) {
          this.value = this.value.slice(0, 50);
        }
      });

      // Validación en tiempo real para nombre de usuario (letras, números y espacios)
      document.getElementById('username').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]/g, '');
        if (this.value.length > 50) {
          this.value = this.value.slice(0, 50);
        }
      });

      // Validación en tiempo real para contraseña (solo letras y números)
      document.getElementById('password').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
        if (this.value.length > 16) {
          this.value = this.value.slice(0, 16);
        }
      });

      // Validación en tiempo real para confirmar contraseña (solo letras y números)
      document.getElementById('confirm_password').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
        if (this.value.length > 16) {
          this.value = this.value.slice(0, 16);
        }
      });

      document.getElementById('formAuthentication').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener referencias a los inputs
        const cedulaInput = document.getElementById('Cedula');
        const nombreInput = document.getElementById('nombre');
        const apellidosInput = document.getElementById('apellidos');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const confirmPasswordValue = document.getElementById('confirm_password').value;
        const moduloInput = document.getElementById('moduloaccess');
        const tipoInput = document.getElementById('tip');
        
        // Validar cédula
        const cedulaValue = cedulaInput.value.trim();
        if (!/^\d{1,10}$/.test(cedulaValue)) {
          smallSwal.fire({
            icon: 'error',
            title: 'Cédula inválida',
            text: 'Debe contener solo números (máximo 10 dígitos)',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
          });
          cedulaInput.focus();
          return;
        }
        
        // Validar nombres
        const nombreValue = nombreInput.value.trim();
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{1,50}$/.test(nombreValue)) {
          smallSwal.fire({
            icon: 'error',
            title: 'Nombres inválidos',
            text: 'Deben contener solo letras (incluyendo acentos) y no superar los 50 caracteres',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
          });
          nombreInput.focus();
          return;
        }
        
        // Validar apellidos
        const apellidosValue = apellidosInput.value.trim();
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{1,50}$/.test(apellidosValue)) {
          smallSwal.fire({
            icon: 'error',
            title: 'Apellidos inválidos',
            text: 'Deben contener solo letras (incluyendo acentos) y no superar los 50 caracteres',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
          });
          apellidosInput.focus();
          return;
        }
        
        // Validar nombre de usuario
        const usernameValue = usernameInput.value.trim();
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]{1,50}$/.test(usernameValue)) {
          smallSwal.fire({
            icon: 'error',
            title: 'Usuario inválido',
            text: 'Debe contener solo letras (incluyendo acentos) y números, sin caracteres especiales, y no superar los 50 caracteres',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
          });
          usernameInput.focus();
          return;
        }
        
        // Validar contraseña
        const passwordValue = passwordInput.value;
        if (!/^[a-zA-Z0-9]{8,16}$/.test(passwordValue)) {
          smallSwal.fire({
            icon: 'error',
            title: 'Contraseña inválida',
            html: 'Debe contener:<br>- Solo letras y números<br>- Mínimo 8 caracteres<br>- Máximo 16 caracteres',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
          });
          passwordInput.focus();
          return;
        }

        if (passwordValue !== confirmPasswordValue) {
          smallSwal.fire({
            icon: 'error',
            title: 'Contraseñas no coinciden',
            text: 'Las contraseñas ingresadas no son iguales',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
          });
          document.getElementById('confirm_password').focus();
          return;
        }
        
        // Validar módulo de acceso seleccionado
        if (!moduloInput.value) {
          smallSwal.fire({
            icon: 'error',
            title: 'Módulo requerido',
            text: 'Por favor seleccione un módulo de acceso válido',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
          });
          moduloInput.focus();
          return;
        }

        // Validar tipo de usuario seleccionado
        if (!tipoInput.value) {
          smallSwal.fire({
            icon: 'error',
            title: 'Rol requerido',
            text: 'Por favor seleccione un rol de usuario válido',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
          });
          tipoInput.focus();
          return;
        }

        // Mostrar confirmación antes de enviar
        smallSwal.fire({
          title: '¿Registrar nuevo usuario?',
          text: 'Revise que los datos sean correctos antes de continuar',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, registrar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // Mostrar mensaje de procesamiento
            smallSwal.fire({
              title: 'Registrando usuario',
              html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%; height: 100%;"></div></div>',
              width: 350,
              showConfirmButton: false,
              allowOutsideClick: false,
              allowEscapeKey: false,
              didOpen: () => {
                smallSwal.showLoading();
              }
            });

            // Enviar formulario
            const formData = new FormData(document.getElementById('formAuthentication'));

            fetch('../PHP/api/register.php', {
              method: 'POST',
              body: formData
            })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                smallSwal.fire({
                  icon: 'success',
                  title: '¡Registro exitoso!',
                  text: data.message,
                  showConfirmButton: false,
                  timer: 1500
                }).then(() => {
                  window.location.href = data.redirect;
                });
              } else {
                smallSwal.fire({
                  icon: 'error',
                  title: 'Error en el registro',
                  text: data.message,
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: 'Entendido'
                });
              }
            })
            .catch(err => {
              smallSwal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'Hubo un problema al conectar con el servidor',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
              });
              console.error(err);
            });
          }
        });
      });

      // Función para cargar los roles desde la base de datos
      function cargarRoles() {
          fetch('../PHP/api/usuarios/get_roles.php')
              .then(response => response.json())
              .then(data => {
                  if (data.success) {
                      const select = document.getElementById('tip');
                      
                      // Limpiar opciones existentes (excepto la primera)
                      while (select.options.length > 1) {
                          select.remove(1);
                      }
                      
                      // Agregar nuevas opciones
                      data.roles.forEach(rol => {
                          const option = document.createElement('option');
                          option.value = rol.usu_tip;
                          option.textContent = rol.tip_nom;
                          select.appendChild(option);
                      });
                  } else {
                      console.error('Error al cargar roles:', data.message);
                      smallSwal.fire({
                          icon: 'warning',
                          title: 'Advertencia',
                          text: 'No se pudieron cargar los roles. Recargue la página.',
                          confirmButtonColor: '#3085d6',
                          confirmButtonText: 'Entendido'
                      });
                  }
              })
              .catch(error => {
                  console.error('Error de conexión:', error);
                  smallSwal.fire({
                      icon: 'error',
                      title: 'Error de conexión',
                      text: 'No se pudo conectar al servidor para obtener los roles',
                      confirmButtonColor: '#3085d6',
                      confirmButtonText: 'Entendido'
                  });
              });
      }

      // Función para cargar los ripos de accesos
      function cargarAccesos() {
          fetch('../PHP/api/usuarios/get_accesos.php')
              .then(response => response.json())
              .then(data => {
                  if (data.success) {
                      const select2 = document.getElementById('moduloaccess');
                      
                      // Limpiar opciones existentes (excepto la primera)
                      while (select2.options.length > 1) {
                          select2.remove(1);
                      }
                      
                      // Agregar nuevas opciones
                      data.access.forEach(access => {
                          const option = document.createElement('option');
                          option.value = access.usu_mod;
                          option.textContent = access.acc_nom;
                          select2.appendChild(option);
                      });
                  } else {
                      console.error('Error al cargar accesos:', data.message);
                      smallSwal.fire({
                          icon: 'warning',
                          title: 'Advertencia',
                          text: 'No se pudieron cargar los accesos. Recargue la página.',
                          confirmButtonColor: '#3085d6',
                          confirmButtonText: 'Entendido'
                      });
                  }
              })
              .catch(error => {
                  console.error('Error de conexión:', error);
                  smallSwal.fire({
                      icon: 'error',
                      title: 'Error de conexión',
                      text: 'No se pudo conectar al servidor para obtener los accesos',
                      confirmButtonColor: '#3085d6',
                      confirmButtonText: 'Entendido'
                  });
              });
      }

      // Cargar los roles cuando la página se cargue
      document.addEventListener('DOMContentLoaded', cargarRoles);
      document.addEventListener('DOMContentLoaded', cargarAccesos);
    </script>


    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="../js/buttons.js"></script>
  </body>
</html>