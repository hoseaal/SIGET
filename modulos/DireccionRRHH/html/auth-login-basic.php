<?php
  // Headers de no-caché extremos
  header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
  header("Cache-Control: post-check=0, pre-check=0", false);
  header("Pragma: no-cache");
  header("Expires: Thu, 01 Jan 1970 00:00:00 GMT");

  // Verificar si hay token válido
  $token = $_COOKIE['token'] ?? null;
  if ($token) {
      require_once '../PHP/api/validar-jwt.php';
      
      if (isset($decoded) && isset($decoded->data->tipo)) {
          if ($decoded->data->tipo == 5) {
              header('Location: index.php');
          } else {
              header('Location: index_usur.php');
          }
          exit;
      }
  }

  // Bloqueo adicional para Firefox
  echo <<<HTML
  <script>
      // Bloqueo persistente del historial
      if (navigator.userAgent.includes('Firefox')) {
          history.replaceState(null, null, location.href);
          setInterval(function() {
              history.replaceState(null, null, location.href);
          }, 1000);
          
          window.addEventListener('popstate', function() {
              history.replaceState(null, null, location.href);
          });
      }
  </script>
  HTML;
?>

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
                  <label for="password" class="form-label">Ingrese su Contraseña</label>
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
      // Estilos personalizados para modales más pequeños
      const smallSwal = Swal.mixin({
        width: '400px',
        padding: '1rem',
        backdrop: `
          rgba(0,0,0,0.4)
          url("/images/nyan-cat.gif")
          left top
          no-repeat
        `,
        customClass: {
          popup: 'small-swal',
          title: 'small-swal-title',
          htmlContainer: 'small-swal-content',
          confirmButton: 'small-swal-confirm'
        }
      });

      document.getElementById('nickname').addEventListener('input', function(e) {
          this.value = this.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
      });

      document.getElementById('formAuthentication').addEventListener('submit', async function(e) {
          e.preventDefault();

          const nickname = document.getElementById('nickname').value;
          const password = document.getElementById('password').value;

          // Validación de nickname
          if (!/^[a-zA-Z0-9]{1,10}$/.test(nickname)) {
              smallSwal.fire({
                  icon: 'error',
                  title: 'Usuario inválido',
                  text: 'Solo letras y números (max 10 caracteres)',
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: 'Entendido'
              });
              return;
          }

          // Validación de password
          if (!/^[a-zA-Z0-9@.]{1,16}$/.test(password)) {
              smallSwal.fire({
                  icon: 'error',
                  title: 'Contraseña inválida',
                  text: 'Solo letras, números, @ y punto (max 16)',
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: 'Entendido'
              });
              return;
          }

          // Mostrar mensaje de "Accediendo..."
          smallSwal.fire({
              title: 'Verificando credenciales',
              html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%; height: 100%;"></div></div>',
              width: 350,
              showConfirmButton: false,
              allowOutsideClick: false,
              allowEscapeKey: false,
              didOpen: () => {
                  smallSwal.showLoading();
              }
          });

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
                      // Cerrar el mensaje de carga
                      smallSwal.close();
                      
                      // Mensaje de éxito
                      smallSwal.fire({
                          icon: 'success',
                          title: 'Acceso concedido',
                          showConfirmButton: false,
                          timer: 1200,
                          timerProgressBar: true,
                          willClose: () => {
                              if (tipo == 5) {
                                  window.location.href = 'index.php';
                              } else {
                                  window.location.href = 'index_usur.php';
                              }
                          }
                      });
                  } else {
                      smallSwal.fire({
                          icon: 'error',
                          title: 'Acceso denegado',
                          text: result.message || 'Credenciales incorrectas',
                          confirmButtonColor: '#3085d6',
                          confirmButtonText: 'Reintentar',
                          width: 380
                      });
                  }
              } catch (parseError) {
                  console.error("Error al parsear JSON:", parseError);
                  smallSwal.fire({
                      icon: 'warning',
                      title: 'Error técnico',
                      text: 'Problema al procesar la respuesta',
                      confirmButtonColor: '#3085d6',
                      width: 380
                  });
              }
          } catch (error) {
              console.error('Error en el login:', error);
              smallSwal.fire({
                  icon: 'error',
                  title: 'Error de conexión',
                  text: 'No se pudo conectar al servidor',
                  confirmButtonColor: '#3085d6',
                  width: 380
              });
          }
      });
    </script>
    <!-- / Page JS -->

    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="../js/buttons.js"></script>
  </body>
</html>
