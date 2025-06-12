<?php
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

  // Exponer la cédula del usuario logueado como variable JavaScript
  echo '<script>const LOGGED_USER_ID = "' . $decoded->data->id . '";</script>';
?>

<!DOCTYPE html>

<html
  lang="es"
  class="light-style layout-menu-fixed"
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

    <title>ADMIN - RRHHH</title>

    <meta name="description" content="" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="../../../home/assets/img/logo-contraloria-home2.png" />

    <!-- Fonts -->
    <link
      href="../fonts/googlefonts1.css"
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
    <link rel="stylesheet" href="../assets/vendor/libs/apex-charts/apex-charts.css" />

    <!-- SweetAlert2 -->
    <link href="../assets/css/sweetalert2.min.css" rel="stylesheet">
    <script src="../assets/js/sweetalert2.all.min.js"></script>

    <!-- Validación de Sesión -->
    <script src="../assets/js/modulos/check_sesion.js"></script>

    <!-- Helpers -->
    <script src="../assets/vendor/js/helpers.js"></script>
    <script src="../assets/js/config.js"></script>
  </head>

  <body>
    <!-- Layout wrapper -->
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        <!-- Menu -->
          <?php require_once __DIR__ . '/../PHP/aside_dashboard.php'; ?>
        <!-- / Menu -->

        <!-- Layout container -->
        <div class="layout-page">
          <!-- Navbar -->
            <?php require_once __DIR__ . '/../PHP/navbar_superior.php'; ?>
          <!-- / Navbar -->

          <!-- Content wrapper -->
          <div class="content-wrapper">
          <!-- Content -->
          <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="fw-bold py-3 mb-4"><span class="text-muted fw-light">Gestión de Presupuesto /</span> Usuarios</h4>
            <div class="row">
              <!-- Tabla de Usuarios dentro del Sistema -->
              <div class="col-md-12">
                <div class="card mb-4">
                  <h5 class="card-header d-flex justify-content-between align-items-center">
                    <span class="fw-semibold">Tabla de Usuarios dentro del Sistema</span>
                    
                    <!-- Buscador a la derecha -->
                    <div class="input-group input-group-merge" style="width: 280px;">
                      <span class="input-group-text"><i class="bx bx-search"></i></span>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="usersSearch" 
                        placeholder="Buscar usuario..." 
                        aria-label="Buscar usuario"
                      >
                    </div>
                  </h5>
                  <div class="card-body">
                    <!-- Tabla de Usuarios -->
                    <div class="table-responsive text-nowrap">
                      <table class="table" id="usersTable">
                        <thead>
                          <tr>
                            <th>N° de empleado</th>
                            <th>Cédula del usuario</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Tipo</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody class="table-border-bottom-0">
                          <!-- Las filas se llenarán dinámicamente con JavaScript -->
                        </tbody>
                      </table>
                    </div>

                    <!-- Paginación -->
                    <div class="demo-inline-spacing mt-4">
                      <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-center" id="paginationUsers">
                          <!-- La paginación se generará dinámicamente con JavaScript -->
                        </ul>
                      </nav>
                    </div>
                    <!-- Fin de Paginación -->

                    <hr class="my-5" />

                    <div id="defaultFormControlHelp" class="form-text">
                      No comparta información privada sin previa autorización.
                    </div>
                  </div>
                </div>
              </div>
            </div> <!-- Cierre de .row -->
          </div>
          <!-- / Content -->
          <div class="content-backdrop fade"></div>
        </div>
          <!-- Content wrapper -->
        </div>
        <!-- / Layout page -->
      </div>

      <!-- Overlay -->
      <div class="layout-overlay layout-menu-toggle"></div>
    </div>
    <!-- / Layout wrapper -->

    <!-- Core JS -->
    <!-- build:js assets/vendor/js/core.js -->
    <script src="../assets/vendor/libs/jquery/jquery.js"></script>
    <script src="../assets/vendor/libs/popper/popper.js"></script>
    <script src="../assets/vendor/js/bootstrap.js"></script>
    <script src="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"></script>

    <script src="../assets/vendor/js/menu.js"></script>
    <!-- endbuild -->

    <!-- Main JS -->
    <script src="../assets/js/main.js"></script>

    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="../js/buttons.js"></script>

    <!-- Funcionamiento de la tabla -->
    <script src="../assets/js/modulos/gest-presupuesto/func-table_user.js"></script>

    <!-- MODALES -->
    <!-- Modal de Editar los Usuarios -->
    <div class="modal fade" id="largeModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel3">Editar Datos del usuario</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="container-fluid">
              <div class="row">
                <!-- Columna izquierda - Datos personales -->
                <div class="col-md-6">
                  <div class="card mb-4">
                    <h5 class="card-header">Datos Personales</h5>
                    <div class="card-body">
                      <!-- Cédula -->
                      <div class="mb-3">
                        <label for="cedula" class="form-label">Cédula</label>
                        <input type="number" class="form-control" id="cedula" name="cedula" required disabled />
                      </div>
                      <!-- Usuario -->
                      <div class="mb-3">
                        <label for="usuario" class="form-label">Nombre de Usuario</label>
                        <input type="text" class="form-control" id="usuario" name="usuario" required disabled/>
                      </div>
                      <!-- Nombres -->
                      <div class="mb-3">
                        <label for="nombre" class="form-label">Nombres</label>
                        <input type="text" class="form-control" id="nombre" name="nombre" required disabled/>
                      </div>
                      <!-- Apellidos -->
                      <div class="mb-3">
                        <label for="apellidos" class="form-label">Apellidos</label>
                        <input type="text" class="form-control" id="apellidos" name="apellidos" required disabled/>
                      </div>
                      <div id="defaultFormControlHelp" class="form-text">
                        No comparta información privada sin previa autorización.
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Columna derecha - Rol del Usuario y Contraseña -->
                <div class="col-md-6">
                  <div class="card mb-4">
                    <h5 class="card-header">Rol y Seguridad</h5>
                    <div class="card-body">
                      <!-- Tipo de Usuario -->
                      <div class="mb-3">
                        <label for="userType" class="form-label">Tipo de Usuario</label>
                        <select id="cargocet" name="cargocet" class="form-select" required>
                          <option value="">Cargando roles...</option>
                          <!-- Las opciones se cargarán dinámicamente con JavaScript -->
                        </select>
                      </div>
                      
                      <!-- Campo de Contraseña -->
                      <div class="mb-3">
                        <label for="password" class="form-label">Contraseña</label>
                        <div class="input-group">
                          <input 
                            type="password" 
                            class="form-control" 
                            id="password" 
                            name="password" 
                            placeholder="******"
                            aria-describedby="togglePassword"
                          >
                          <button 
                            class="btn btn-outline-secondary" 
                            type="button" 
                            id="togglePassword"
                            data-field="password"
                          >
                            <i class="bx bx-show"></i>
                          </button>
                          <button 
                            class="btn btn-outline-primary" 
                            type="button" 
                            id="enablePasswordChange"
                          >
                            Cambiar
                          </button>
                        </div>
                        <div class="form-text">Dejar en blanco para mantener la contraseña actual</div>
                      </div>
                      
                      <!-- Campo de Confirmar Contraseña -->
                      <div class="mb-3" id="confirmPasswordContainer" style="display: none;">
                        <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
                        <div class="input-group">
                          <input 
                            type="password" 
                            class="form-control" 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            placeholder="******"
                            aria-describedby="toggleConfirmPassword"
                          >
                          <button 
                            class="btn btn-outline-secondary" 
                            type="button" 
                            id="toggleConfirmPassword"
                            data-field="confirmPassword"
                          >
                            <i class="bx bx-show"></i>
                          </button>
                        </div>
                        <div class="invalid-feedback" id="passwordMatchError">
                          Las contraseñas no coinciden
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Cerrar
            </button>
            <button type="button" class="btn btn-primary" id="saveChangesBtn">Confirmar Cambios</button>
          </div>
        </div>
      </div>
    </div>

  </body>
</html>
