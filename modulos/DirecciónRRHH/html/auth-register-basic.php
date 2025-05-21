<?php
  require_once '../PHP/api/validar-jwt.php';
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
                  <select id="tip" name="tip" required>
                    <option value="">-- Selecciona una opción --</option>
                    <option value="3">Jefe de área</option>
                    <option value="2">Trabajador</option>
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

          const formData = new FormData(this);

          fetch('../PHP/api/register.php', {
            method: 'POST',
            body: formData
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              alert(data.message); // Puedes quitar esto si no quieres el alert
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
      </script>


    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="../js/buttons.js"></script>
  </body>
</html>
