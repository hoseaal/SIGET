<!DOCTYPE html>
<html
  lang="es"
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

    <title>Login - RRHH</title>

    <meta name="description" content="" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="../../../home/src/img/logo-contraloria-home3.png" />

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
          <!-- Register -->
          <div class="card">
            <div class="card-body">
              <!-- Logo -->
              <div class="app-brand justify-content-center">
                <a href="../../../home/index.html" class="app-brand-link gap-2">
                  <span class="app-brand-text demo text-body fw-bolder">SIGET</span>
                </a>
              </div>
              <!-- /Logo -->
              <h4 class="mb-2">Bienvenido a SIGET 👋</h4>
              <p class="mb-4">Por favor, inicia sesión para continuar</p>

              <form id="formAuthentication" class="mb-3" method="POST">
                <div class="mb-3">
                  <label for="nickname" class="form-label">Ingrese su Usuario</label>
                  <input
                      type="text"
                      class="form-control"
                      id="nickname"
                      name="nickname"
                      placeholder="Ejem. Juan123"
                      pattern="[a-zA-Z0-9]{1,10}"
                      maxlength="10"
                      title="Solo letras y números, máximo 10 caracteres"
                      autofocus
                      required
                  />
                </div>
                <div class="mb-3 form-password-toggle">
                  <div class="input-group input-group-merge">
                    <input
                      type="password"
                      id="password"
                      class="form-control"
                      name="password"
                      placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                      pattern="[a-zA-Z0-9@.]{1,16}"
                      maxlength="16"
                      title="Solo letras, números, @ y punto. Máximo 16 caracteres"
                      aria-describedby="password"
                      required
                    />
                    <span class="input-group-text cursor-pointer"><i class="bx bx-hide"></i></span>
                  </div>
                </div>
                <div class="d-flex justify-content-between">
                    <label class="form-label" for="password">¿Problemas con su contraseña?</label>
                    <a href="#">
                      <small>Restablecer</small>
                    </a>
                  </div>
                <div class="mb-3">
                  <button class="btn btn-primary d-grid w-100" type="submit">Iniciar Sesión</button>
                </div>
              </form>
            </div>
          </div>
          <!-- /Register -->
        </div>
      </div>
    </div>
    <!-- / Content -->

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
      document.getElementById('nickname').addEventListener('input', function(e) {
          // Solo permite letras y números
          this.value = this.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
      });

      document.getElementById('formAuthentication').addEventListener('submit', async function(e) {
          e.preventDefault();

          const nickname = document.getElementById('nickname').value;
          const password = document.getElementById('password').value;

          if (!/^[a-zA-Z0-9]{1,10}$/.test(nickname)) {
              alert("El nombre de usuario solo puede contener letras y números (máximo 10 caracteres)");
              return;
          }

          if (!/^[a-zA-Z0-9@.]{1,16}$/.test(password)) {
              alert("La contraseña solo puede contener letras, números, @ y punto (máximo 16 caracteres)");
              return;
          }

          try {
              const response = await fetch('../PHP/api/login.php', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ nickname, password }),
              });

              const text = await response.text();

              try {
                  const result = JSON.parse(text);
                  if (result.success) {
                      const tipo = result.tipo;
                      if (tipo == 3) {
                          window.location.href = 'index.php';
                      } else if (tipo == 2) {
                          window.location.href = 'index_usur.php';
                      } else {
                          window.location.href = 'auth-login-basic.php';
                      }
                  } else {
                      alert(result.message);
                  }
              } catch (parseError) {
                  console.error("Error al parsear JSON:", parseError);
                  console.error("Respuesta cruda del servidor:", text);
                  alert("Ocurrió un error inesperado del servidor.");
              }
          } catch (error) {
              console.error('Error en el login (fetch falló):', error);
              alert('Ocurrió un error al iniciar sesión.');
          }
      });
    </script>
    <!-- / Page JS -->

    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="../js/buttons.js"></script>
  </body>
</html>
