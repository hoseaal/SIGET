<?php
  header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
  header("Cache-Control: post-check=0, pre-check=0", false);
  header("Pragma: no-cache"); 
  
  require_once '../PHP/api/validar-jwt.php';

  if (!isset($decoded) || !isset($decoded->data->tipo)) {
      header('Location: auth-login-basic.php');
      exit;
  }

  // Lista de tipos de usuario permitidos
  $tiposPermitidos = ['2', '3', '4', '5'];

  // Redirige al login
  if (!in_array($decoded->data->tipo, $tiposPermitidos)) {
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

  echo '<script>const LOGGED_USER_CI = "' . $decoded->data->id . '";</script>';
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

    <!-- jQuery (requerido por Select2) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <!-- Select2 CSS -->
    <link href="../assets/css/select2.min.css" rel="stylesheet" />
    <link href="../assets/css/select2-bootstrap-5-theme.min.css" rel="stylesheet" />

    <!-- Select2 JS -->
    <script src="../assets/js/select2.min.js"></script>

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
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h4 class="fw-bold py-3 mb-0"><span class="text-muted fw-light">Gestión de Presupuesto /</span> Caja de Ahorro Patronal</h4>
              <button id="agregarCajaAhorro" class="btn btn-primary">
                <i class="bx bx-plus"></i> Agregar a Caja de Ahorro
              </button>
            </div>
            <div class="row">
              <!-- Tabla de Caja de Ahorro -->
              <div class="col-md-12">
                <div class="card mb-4">
                  <h5 class="card-header d-flex justify-content-between align-items-center">
                    <span>Trabajadores en Caja de Ahorro:</span>
                    <div class="input-group input-group-merge" style="width: 280px;">
                      <span class="input-group-text"><i class="bx bx-search"></i></span>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="cajaAhorroSearch" 
                        placeholder="Buscar trabajador..." 
                        aria-label="Buscar trabajador"
                      >
                    </div>
                  </h5>
                  <div class="card-body">
                    <!-- Tabla de Caja de ahorro -->
                    <div class="table-responsive text-nowrap fixed-height">
                      <table class="table" id="cajaAhorroTable">
                        <thead>
                          <tr>
                            <th>N-</th>
                            <th>Cédula</th>
                            <th>Nombres</th>
                            <th>Apellidos</th>
                            <th>Estado</th>
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
                        <ul class="pagination justify-content-center" id="paginationCajaAhorro">
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
    <script src="../assets/vendor/libs/popper/popper.js"></script>
    <script src="../assets/vendor/js/bootstrap.js"></script>
    <script src="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"></script>

    <script src="../assets/vendor/js/menu.js"></script>
    <!-- endbuild -->

    <!-- Main JS -->
    <script src="../assets/js/main.js"></script>

    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="../js/buttons.js"></script>

    <!-- Funcionamiento de la tabla de Niveles Salariales -->
    <script src="../assets/js/modulos/gest-presupuesto/func-table_cajaahorrop.js"></script> 

    <!-- Modal de Editar Caja de Ahorro Patronal -->
    <div class="modal fade" id="ModalCajaAhorro" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel1">Editar Trabajador en Caja de Ahorro</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col mb-3">
                <label for="trabajadorSelect" class="form-label">Trabajador Seleccionado</label>
                <select id="trabajadorSelect" class="form-select" disabled>
                  <option value="">Seleccione un trabajador</option>
                  <!-- Las opciones se llenarán dinámicamente -->
                </select>
              </div>
            </div>
            <div class="row">
              <div class="col mb-3">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="estadoCajaAhorro">
                  <label class="form-check-label" for="estadoCajaAhorro">Estado Activo</label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Cerrar
            </button>
            <button type="button" class="btn btn-primary">Confirmar Cambios</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para Agregar a Caja de Ahorro -->
    <div class="modal fade" id="modalAgregarCajaAhorro" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Trabajador a Caja de Ahorro</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col mb-3">
                <label for="nuevoTrabajadorSelect" class="form-label">Seleccionar Trabajador</label>
                <select id="nuevoTrabajadorSelect" class="form-select select2-trabajadores">
                  <option value=""></option> <!-- Select2 necesita un option vacío -->
                  <!-- Las opciones se llenarán dinámicamente -->
                </select>
              </div>
            </div>
            <div class="row">
              <div class="col mb-3">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="nuevoEstadoCajaAhorro" checked>
                  <label class="form-check-label" for="nuevoEstadoCajaAhorro">Estado Activo</label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button type="button" class="btn btn-primary" id="confirmarAgregarBtn">Agregar</button>
          </div>
        </div>
      </div>
    </div>
  
  </body>
</html>
