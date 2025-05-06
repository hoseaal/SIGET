<?php
  require_once '../PHP/api/validar-jwt.php';

  if ($decoded->data->tipo == '2') {
      http_response_code(403);
      echo 'Acceso denegado.';
      exit;
  }
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
    <link rel="icon" type="image/x-icon" href="../../../home/src/img/logo-contraloria-home3.png" />

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

    <!-- Page CSS -->

    <!-- Helpers -->
    <script src="../assets/vendor/js/helpers.js"></script>

    <script src="../assets/js/config.js"></script>
    <?php require_once '../PHP/api/usuarios/carga_select.php'; ?>

    <style>
      /* Estilo para mantener altura fija de la tabla */
      .table-responsive.fixed-height {
          height: 450px; 
          overflow-y: auto;
      }

      /* Estilo para filas vacías que mantienen la altura */
      .empty-row {
          height: 57px;
          border-bottom: 1px solid #e0e0e0;
      }
    </style>
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
            <h4 class="fw-bold py-3 mb-4"><span class="text-muted fw-light">Gestión de Presupuesto /</span> Nómina</h4>
            <div class="row">
              <!-- Tabla de Trabajadores dentro del Sistema -->
              <div class="col-md-12">
                <div class="card mb-4">
                  <h5 class="card-header">Tabla de Trabajadores dentro del Sistema</h5>
                  <div class="card-body">
                    <!-- Tabla de trabajadores -->
                    <div class="table-responsive text-nowrap fixed-height">
                      <table class="table" id="workersTable">
                        <thead>
                          <tr>
                            <th>Cédula</th>
                            <th>Nombres</th>
                            <th>Apellidos</th>
                            <th>Género</th>
                            <th>Departamento</th>
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
                        <ul class="pagination justify-content-center" id="pagination">
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

    <!-- Page JS -->
    <script src="../assets/js/form-basic-inputs.js"></script>

    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="../js/buttons.js"></script>

    <!-- Funcionamiento de la tabla -->
    <script src="../assets/js/modulos/gest-presupuesto/func-table_nomina.js"></script>

    <!-- MODALES -->
    <!-- Modal de Editar los Usuarios -->
    <div class="modal fade" id="largeModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel3">Editar Datos del Trabajador</h5>
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
                        <input type="number" class="form-control" id="cedula" name="cedula" required />
                      </div>
                      <!-- Nombres -->
                      <div class="mb-3">
                        <label for="nombre" class="form-label">Nombres</label>
                        <input type="text" class="form-control" id="nombre" name="nombre" required/>
                      </div>
                      <!-- Apellidos -->
                      <div class="mb-3">
                        <label for="apellidos" class="form-label">Apellidos</label>
                        <input type="text" class="form-control" id="apellidos" name="apellidos" required />
                      </div>
                      <!-- Fecha de Ingreso -->
                      <div class="mb-3">
                        <label for="fechaingreso" class="form-label">Fecha de ingreso</label>
                        <input type="date" class="form-control" id="fechaingreso" name="fechaingreso" disabled required />
                      </div>
                      <!-- Género del Empleado -->
                      <div class="mb-3">
                        <div class="mb-2">
                          <label class="form-label">Género del Empleado</label>
                        </div>
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="generoEmpleado" id="generoMasculino" value="M" />
                          <label class="form-check-label" for="generoMasculino">Masculino (M)</label>
                        </div>
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="generoEmpleado" id="generoFemenino" value="F" />
                          <label class="form-check-label" for="generoFemenino">Femenino (F)</label>
                        </div>
                      </div>
                      <!-- Número de Hijos -->
                      <div class="mb-3">
                        <label for="numerohijos" class="form-label">Número de Hijos</label>
                        <input type="number" class="form-control" id="numerohijos" name="numeroHijos" required/>
                      </div>
                      <div id="defaultFormControlHelp" class="form-text">
                        No comparta información privada sin previa autorización.
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Columna derecha - Datos del Área -->
                <div class="col-md-6">
                  <div class="card mb-4">
                    <h5 class="card-header">Datos del Área</h5>
                    <div class="card-body">
                      <!-- Cargo CET -->
                      <div class="mb-3">
                        <label for="cargocet" class="form-label">Cargo CET</label>
                        <select id="cargocet" name="cargocet" class="form-select" required>
                          <option value="">Seleccione</option>
                          <?php foreach ($cargosCet as $cargo): ?>
                            <option value="<?= $cargo['cet_ide'] ?>"><?= htmlspecialchars($cargo['cet_car']) ?></option>
                          <?php endforeach; ?>
                        </select>
                      </div>
                      <!-- Cargo ONAPRE -->
                      <div class="mb-3">
                        <label for="cargoonapre" class="form-label">Cargo ONAPRE</label>
                        <select id="cargoonapre" name="cargoonapre" class="form-select" required>
                          <option value="">Seleccione</option>
                          <?php foreach ($cargosOnapre as $cargo): ?>
                            <option value="<?= $cargo['ona_ide'] ?>"><?= htmlspecialchars($cargo['ona_car']) ?></option>
                          <?php endforeach; ?>
                        </select>
                      </div>
                      <!-- Departamento -->
                      <div class="mb-3">
                        <label for="departamentoasig" class="form-label">Departamento Asignado</label>
                        <select id="departamentoasig" name="departamentoasig" class="form-select" required>
                          <option value="">Seleccione</option>
                          <?php foreach ($departamentos as $dep): ?>
                            <option value="<?= $dep['dep_ide'] ?>"><?= htmlspecialchars($dep['dep_nom']) ?></option>
                          <?php endforeach; ?>
                        </select>
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
            <button type="button" class="btn btn-primary">Confirmar Cambios</button>
          </div>
        </div>
      </div>
    </div>

  </body>
</html>
