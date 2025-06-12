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

  echo '<script>const LOGGED_USER_CI = "' . $decoded->data->id . '";</script>';
  echo '<script>const LOGGED_USER_TYPE = "' . $decoded->data->tipo . '";</script>';
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
            <h4 class="fw-bold py-3 mb-4"><span class="text-muted fw-light">Gestión de Presupuesto /</span> Niveles Salariales</h4>
            <div class="row">
              <!-- Tabla de Niveles Salariales -->
              <div class="col-md-12">
                <div class="card mb-4">
                  <h5 class="card-header d-flex justify-content-between align-items-center">
                    <span>Tabla de Niveles Salariales</span>
                    <div class="input-group input-group-merge" style="width: 280px;">
                      <span class="input-group-text"><i class="bx bx-search"></i></span>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="salarySearch" 
                        placeholder="Buscar nivel..." 
                        aria-label="Buscar nivel salarial"
                      >
                    </div>
                  </h5>
                  <div class="card-body">
                    <!-- Tabla de Salarios -->
                    <div class="table-responsive text-nowrap fixed-height">
                      <table class="table" id="salaryTable">
                        <thead>
                          <tr>
                            <th>Nivel salarial</th>
                            <th>Salario</th>
                            <th>CARGO ONAPRE</th>
                            <?php if (isset($decoded->data->tipo) && $decoded->data->tipo != '0' && $decoded->data->tipo != '1') { ?>
                                <th>Acciones</th>
                            <?php } ?>
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
                        <ul class="pagination justify-content-center" id="paginationSalary">
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

    <!-- Funcionamiento de la tabla de Niveles Salariales -->
    <script src="../assets/js/modulos/gest-presupuesto/func-table_NivelesSalariales.js"></script> 

    <!-- Modal de Editar Nivel Salarial-->
    <div class="modal fade" id="ModalNivelSalarial" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel1">Editar Nivel Salarial</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col mb-3">
                <label for="tipoNlvSalarial" class="form-label">Tipo de Nivel Salarial</label>
                <input type="text" id="tipoNlvSalarial" class="form-control" placeholder="Ej. I, II, III" maxlength="5" />
                <div class="invalid-feedback">Solo se permiten letras (máximo 5 caracteres)</div>
              </div>
            </div>
            <div class="row">
              <div class="col mb-3">
                <label for="salarioAsig" class="form-label">Salario Correspondiente</label>
                <input type="text" id="salarioAsig" class="form-control" placeholder="Ej. 150.00" />
                <div class="invalid-feedback">Solo se permiten números con máximo 2 decimales (máximo 10 caracteres)</div>
              </div>
            </div>
            <div class="row">
              <div class="col mb-3">
                <label for="OnapreAsig" class="form-label">Seleccionar cargo ONAPRE correspondiente</label>
                <select id="OnapreAsig" class="form-select" required>
                  <option value="">Seleccione</option>
                  <!-- Las opciones se llenarán dinámicamente -->
                </select>
                <div class="invalid-feedback">Debe seleccionar un cargo ONAPRE</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Cerrar
            </button>
            <button type="button" class="btn btn-primary" id="confirmChangesBtn">Confirmar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  
  </body>
</html>
