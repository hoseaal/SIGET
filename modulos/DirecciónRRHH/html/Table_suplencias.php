<?php
  require_once '../PHP/api/validar-jwt.php';

  if (!isset($decoded) || !isset($decoded->data->tipo)) {
      header('Location: auth-login-basic.php');
      exit;
  }

  // Lista de tipos de usuario permitidos
  $tiposPermitidos = ['1', '2', '3', '4', '5'];

  // Redirige al login
  if (!in_array($decoded->data->tipo, $tiposPermitidos)) {
      header('Location: auth-login-basic.php');
      exit;
  }

  // Exponer la cédula del usuario logueado como variable JavaScript
  echo '<script>const LOGGED_USER_CI = "' . $decoded->data->cedula . '";</script>';
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

    <!-- SweetAlert2 -->
    <link href="../assets/css/sweetalert2.min.css" rel="stylesheet">
    <script src="../assets/js/sweetalert2.all.min.js"></script>

    <!-- Validación de Sesión -->
    <script src="../assets/js/modulos/check_sesion.js"></script>
    
    <!-- Select2 JS -->
    <script src="../assets/js/select2.min.js"></script>

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
                    <h4 class="fw-bold py-3 mb-0"><span class="text-muted fw-light">Gestión de Presupuesto /</span> Suplencias de Trabajadores</h4>
                    <button id="ModalnuevaSuplencia" class="btn btn-primary">
                        <i class="bx bx-plus"></i> Añadir nueva Suplencia
                    </button>
                </div>
            <div class="row">
                <!-- Tabla de Suplencias -->
                <div class="col-md-12">
                <div class="card mb-4">
                    <h5 class="card-header">Tabla de Suplencias</h5>
                    <div class="card-body">
                    <!-- Tabla de Suplencias -->
                    <div class="table-responsive text-nowrap fixed-height">
                        <table class="table" id="supplementTable">
                        <thead>
                            <tr>
                            <th>Cédula</th>
                            <th>Nombre</th>
                            <th>Fecha Inicio</th>
                            <th>Cargo CET</th>
                            <th>Cargo ONAPRE</th>
                            <th>Nivel Salarial</th>
                            <th>Departamento</th>
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
                        <ul class="pagination justify-content-center" id="paginationSupplement">
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
    <script src="../assets/js/modulos/gest-presupuesto/func-table_suplencias.js"></script>

    <!-- Modal de Editar Suplencias -->
    <div class="modal fade" id="ModalSuplencia" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel1">Editar Suplencia</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
            <div class="row">
            <div class="col mb-3">
                <label for="empleadoNombre" class="form-label">Nombre del Empleado</label>
                <input type="text" id="empleadoNombre" class="form-control" disabled />
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label for="empleadoCedula" class="form-label">Cédula del Empleado</label>
                <input type="text" id="empleadoCedula" class="form-control" disabled />
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
                <input type="date" id="fechaInicio" class="form-control" required />
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label for="cargoCet" class="form-label">Cargo CET</label>
                <input type="text" id="cargoCet" class="form-control" disabled />
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label for="cargoOnapre" class="form-label">Cargo ONAPRE</label>
                <input type="text" id="cargoOnapre" class="form-control" disabled />
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label for="nivelSalarial" class="form-label">Nivel Salarial</label>
                <input type="text" id="nivelSalarial" class="form-control" disabled />
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label for="departamento" class="form-label">Departamento</label>
                <input type="text" id="departamento" class="form-control" disabled />
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label class="form-label">Estado de la Suplencia</label>
                <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="estadoSuplencia" role="switch">
                <label class="form-check-label" for="estadoSuplencia">
                    <span class="switch-label-active">Activa</span>
                    <span class="switch-label-inactive">Inactiva</span>
                </label>
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

    <!-- Modal para Nueva Suplencia -->
    <div class="modal fade" id="ModalNuevaSuplencia" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel1">Nueva Suplencia</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
            <div class="row">
            <div class="col mb-3">
                <label for="nuevoEmpleadoSelect" class="form-label">Seleccionar Empleado</label>
                <select id="nuevoEmpleadoSelect" class="form-select">
                    <option value=""></option>
                    <!-- Las opciones se llenarán dinámicamente -->
                </select>
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label for="nuevaFechaInicio" class="form-label">Fecha de Inicio</label>
                <input type="date" id="nuevaFechaInicio" class="form-control" required />
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label for="nuevoCargoCetSelect" class="form-label">Cargo CET</label>
                <select id="nuevoCargoCetSelect" class="form-select">
                <option value="">Seleccione</option>
                <!-- Las opciones se llenarán dinámicamente -->
                </select>
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label for="nuevoCargoOnapreSelect" class="form-label">Cargo ONAPRE</label>
                <select id="nuevoCargoOnapreSelect" class="form-select">
                <option value="">Seleccione</option>
                <!-- Las opciones se llenarán dinámicamente -->
                </select>
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label for="nuevoNivelSalarial" class="form-label">Nivel Salarial</label>
                <select id="nuevoNivelSalarial" class="form-select">
                    <option value="">Seleccione</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                    <option value="V">V</option>
                    <option value="VI">VI</option>
                    <option value="VII">VII</option>
                </select>
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label for="nuevoDepartamentoSelect" class="form-label">Departamento</label>
                <select id="nuevoDepartamentoSelect" class="form-select">
                <option value="">Seleccione</option>
                <!-- Las opciones se llenarán dinámicamente -->
                </select>
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label class="form-label">Estado de la Suplencia</label>
                <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="nuevoEstadoSuplencia" checked>
                <label class="form-check-label" for="nuevoEstadoSuplencia">
                    <span class="switch-label-active">Activa</span>
                    <span class="switch-label-inactive">Inactiva</span>
                </label>
                </div>
            </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            Cancelar
            </button>
            <button type="button" class="btn btn-primary" id="confirmarNuevaSuplencia">Guardar</button>
        </div>
        </div>
    </div>
    </div>
  
  </body>
</html>
