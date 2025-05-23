<?php
  require_once '../PHP/api/validar-jwt.php';

  // Exponer la cédula del usuario logueado como variable JavaScript
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

    <!-- Page CSS -->
    <!-- Page -->
    <link rel="stylesheet" href="../assets/vendor/css/pages/page-auth.css" />
    <!-- Helpers -->
    <script src="../assets/vendor/js/helpers.js"></script>

    <!--! Template customizer & Theme config files MUST be included after core stylesheets and helpers.js in the <head> section -->
    <!--? Config:  Mandatory theme config file contain global vars & default theme options, Set your preferred theme option in this file.  -->
    <script src="../assets/js/config.js"></script>
  </head>

  <body>
    <!-- Content -->
    <div class="container-xxl">
      <div class="authentication-wrapper authentication-basic container-p-y">
        <div class="authentication-inner">
          <!-- Register Card -->
          <div class="card">
            <div class="card-body">
              <!-- Logo -->
              <div class="app-brand justify-content-center">
                <a href="#" class="app-brand-link gap-2">
                  <span class="app-brand-text demo text-body fw-bolder">SIGET</span>
                </a>
              </div>
              <!-- /Logo -->
              <h4 class="mb-2">Registra un nuevo usuario en el Sistema</h4>
              <p class="mb-4">Permite acceso a usuarios en nómina para RRHH</p>

              <form id="formAuthentication" class="mb-3" action="../PHP/api/register.php" method="POST">
                <div class="mb-3">
                  <label for="Cedula" class="form-label">Ingrese la Cédula</label>
                  <input
                    type="text"
                    class="form-control"
                    id="Cedula"
                    name="Cedula"
                    placeholder="Ejem. 30297698"
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
                      placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                      aria-describedby="password"
                      required
                    />
                    <span class="input-group-text cursor-pointer"><i class="bx bx-hide"></i></span>
                  </div>
                </div>

                <div class="mb-3 form-password-toggle">
                  <label for="tip">Selecciona el rol:</label>
                  <select id="tip" name="tip" class="form-select" required>
                    <option value="">-- Selecciona una opción --</option>
                    <option value="4">Administrador</option>
                    <option value="3">Jefe de área</option>
                    <option value="2">Trabajador</option>
                    <option value="1">Temporal</option>
                    <option value="0">Solo Vistas</option>
                  </select>
                </div>

                <div class="mb-3 form-password-toggle">
                  <label for="moduloaccess">Selecciona módulos de acceso:</label>
                  <select id="moduloaccess" name="moduloaccess" class="form-select" required>
                    <option value="">-- Selecciona una opción --</option>
                    <option value="2">Departamento de Bienes</option>
                    <option value="1">Departamento de RRHH</option>
                    <option value="0">Todos</option>
                  </select>
                </div>

                <button class="btn btn-primary d-grid w-100" type="submit">Registrar</button>
              </form>
                  <div class="d-flex justify-content-between">
                    <label class="form-label" for="password">¿Problemas con contraseña?</label>
                    <a href="#">
                      <small>Restablecer</small>
                    </a>
                  </div>
              <p class="text-center">
                <span>¿Ya agregó el usuario?</span>
                <a href="auth-login-basic.php">
                  <span>Inicia Sesión desde aquí</span>
                </a>
              </p>
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
    <!-- endbuild -->

    <!-- Vendors JS -->

    <!-- Main JS -->
    <script src="../assets/js/main.js"></script>

    <!-- Page JS -->
    <script>
      document.getElementById('formAuthentication').addEventListener('submit', function (e) {
        e.preventDefault();
        
        // Validar cédula
        const cedulaInput = document.getElementById('Cedula');
        const cedulaValue = cedulaInput.value.trim();
        
        if (!/^\d{1,10}$/.test(cedulaValue)) {
          alert('La cédula debe contener solo números (máximo 10 dígitos)');
          cedulaInput.focus();
          return;
        }
        
        // Validar nombres
        const nombreInput = document.getElementById('nombre');
        const nombreValue = nombreInput.value.trim();
        
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{1,50}$/.test(nombreValue)) {
          alert('Los nombres deben contener solo letras (incluyendo acentos) y no superar los 50 caracteres');
          nombreInput.focus();
          return;
        }
        
        // Validar apellidos
        const apellidosInput = document.getElementById('apellidos');
        const apellidosValue = apellidosInput.value.trim();
        
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{1,50}$/.test(apellidosValue)) {
          alert('Los apellidos deben contener solo letras (incluyendo acentos) y no superar los 50 caracteres');
          apellidosInput.focus();
          return;
        }
        
        // Validar nombre de usuario
        const usernameInput = document.getElementById('username');
        const usernameValue = usernameInput.value.trim();
        
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]{1,50}$/.test(usernameValue)) {
          alert('El nombre de usuario debe contener solo letras (incluyendo acentos) y números, sin caracteres especiales, y no superar los 50 caracteres');
          usernameInput.focus();
          return;
        }
        
        // Validar contraseña
        const passwordInput = document.getElementById('password');
        const passwordValue = passwordInput.value;
        
        if (!/^[a-zA-Z0-9.@]{1,16}$/.test(passwordValue)) {
          alert('La contraseña debe contener:\n- Letras y números\n- Solo puntos (.) y arrobas (@) como caracteres especiales\n- Máximo 16 caracteres');
          passwordInput.focus();
          return;
        }
        
        // Validar rol seleccionado
        const rolInput = document.getElementById('tip');
        if (!rolInput.value) {
          alert('Por favor seleccione un rol válido');
          rolInput.focus();
          return;
        }
        
        // Validar módulo de acceso seleccionado
        const moduloInput = document.getElementById('moduloaccess');
        if (!moduloInput.value) {
          alert('Por favor seleccione un módulo de acceso válido');
          moduloInput.focus();
          return;
        }
        
        // Si todas las validaciones pasan, proceder con el envío
        const formData = new FormData(this);

        fetch('../PHP/api/register.php', {
          method: 'POST',
          body: formData
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert(data.message);
            window.location.href = data.redirect;
          } else {
            alert(data.message);
          }
        })
        .catch(err => {
          alert('Hubo un error en el registro.');
          console.error(err);
        });
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

      // Validación en tiempo real para la contraseña (solo letras, números, . y @)
      document.getElementById('password').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^a-zA-Z0-9.@]/g, '');
        if (this.value.length > 16) {
          this.value = this.value.slice(0, 16);
        }
      });
    </script>


    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="../js/buttons.js"></script>
  </body>
</html>
