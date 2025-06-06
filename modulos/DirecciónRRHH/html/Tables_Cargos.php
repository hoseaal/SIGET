<?php
  require_once '../PHP/api/validar-jwt.php';

  if (!isset($decoded) || !isset($decoded->data->tipo)) {
      header('Location: auth-login-basic.php');
      exit;
  }

  // Lista de tipos de usuario permitidos (0, 1, 2, 3, 4)
  $tiposPermitidos = ['0', '1', '2', '3', '4'];

  // Redirige al login
  if (!in_array($decoded->data->tipo, $tiposPermitidos)) {
      header('Location: auth-login-basic.php');
      exit;
  }

  // Exponer la cédula del usuario logueado como variable JavaScript
  echo '<script>const LOGGED_USER_CI = "' . $decoded->data->cedula . '";</script>';
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
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

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
            <h4 class="fw-bold py-3 mb-4"><span class="text-muted fw-light">Gestión de Presupuesto /</span> Cargos</h4>
            <div class="row">
              <!-- Cargos CET -->
              <div class="col-md-6 d-flex flex-column">
                <div class="card mb-4 h-100">
                  <h5 class="card-header">Cargos CET</h5>
                  <div class="card-body">
                    <!-- Tabla de Cargos CET -->
                    <div class="table-responsive text-nowrap">
                      <?php if (isset($decoded->data->tipo) && $decoded->data->tipo != '0') { ?>
                          <button
                              type="button"
                              class="btn btn-primary mb-3"
                              data-bs-toggle="modal"
                              data-bs-target="#basicModal"
                          >
                              Añadir
                          </button>
                      <?php } ?>
                      <!-- Modal -->
                      <div class="modal fade" id="basicModal" tabindex="-1" aria-hidden="true">
                          <div class="modal-dialog" role="document">
                              <div class="modal-content">
                                  <div class="modal-header">
                                      <h5 class="modal-title" id="exampleModalLabel1">Ingresar un nuevo Cargo CET</h5>
                                      <button
                                          type="button"
                                          class="btn-close"
                                          data-bs-dismiss="modal"
                                          aria-label="Close"
                                      ></button>
                                  </div>
                                  <div class="modal-body">
                                      <div class="row g-2">
                                          <div class="col-12 mb-3">
                                              <label for="newCargoCET" class="form-label">Nombre del nuevo cargo CET</label>
                                              <input
                                                  type="text"
                                                  class="form-control"
                                                  id="newCargoCET"
                                                  placeholder="Ej: ANALISTA PIII"
                                                  maxlength="50"
                                                  required
                                              >
                                              <div class="invalid-feedback">
                                                  Por favor ingrese el nombre del cargo.
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                                  <div class="modal-footer">
                                      <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                          Cerrar
                                      </button>
                                      <button type="button" class="btn btn-primary" id="addCetPositionBtn">Añadir nuevo Cargo</button>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <!-- / Modal -->
                      <table class="table" id="cetTable">
                        <thead>
                          <tr>
                            <th>N°</th>
                            <th>Nombre</th>
                            <?php if (isset($decoded->data->tipo) && $decoded->data->tipo != '0') { ?>
                                <th>Acción</th>
                            <?php } ?>
                          </tr>
                        </thead>
                        <tbody class="table-border-bottom-0" id="cetTableBody">
                          <!-- Las filas se llenarán dinámicamente con JavaScript -->
                        </tbody>
                      </table>
                    </div>

                    <!-- Paginación -->
                    <div class="demo-inline-spacing mt-4">
                      <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-center" id="cetPagination">
                          <!-- La paginación se generará dinámicamente con JavaScript -->
                        </ul>
                      </nav>
                    </div>
                    <!-- Fin de Paginación -->
                    <div id="defaultFormControlHelp" class="form-text">
                      No comparta información privada sin previa autorización.
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cargo ONAPRE -->
              <div class="col-md-6 d-flex flex-column">
                <div class="card mb-4 h-100">
                  <h5 class="card-header">Cargos ONAPRE</h5>
                  <div class="card-body">
                    <!-- Tabla de Cargos ONAPRE -->
                    <div class="table-responsive text-nowrap">
                      <?php if (isset($decoded->data->tipo) && $decoded->data->tipo != '0') { ?>
                          <button
                              type="button"
                              class="btn btn-primary mb-3"
                              data-bs-toggle="modal"
                              data-bs-target="#onapreModal"
                          >
                              Añadir
                          </button>
                      <?php } ?>
                      
                      <!-- Modal ONAPRE -->
                      <div class="modal fade" id="onapreModal" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                          <div class="modal-content">
                            <div class="modal-header">
                              <h5 class="modal-title" id="onapreModalLabel">Ingresar un nuevo Cargo ONAPRE</h5>
                              <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              ></button>
                            </div>
                            <div class="modal-body">
                              <div class="row g-2">
                                <div class="col-12 mb-3">
                                  <label for="newOnaprePosition" class="form-label">Nombre del nuevo cargo ONAPRE</label>
                                  <input
                                      type="text"
                                      class="form-control"
                                      id="newOnaprePosition"
                                      name="newOnaprePosition"
                                      placeholder="Ej: PROFESIONAL IV (PIV)"
                                      pattern="[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s]{1,50}"
                                      title="Solo letras (mayúsculas o minúsculas) y espacios, máximo 50 caracteres"
                                      required
                                  >
                                  <div class="invalid-feedback">
                                      Solo se permiten letras (mayúsculas o minúsculas) y espacios, sin números ni caracteres especiales. Máximo 50 caracteres.
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div class="modal-footer">
                              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                Cerrar
                              </button>
                              <button type="button" class="btn btn-primary" id="addOnaprePositionBtn">Añadir nuevo Cargo</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- / Modal ONAPRE -->
                      
                      <table class="table" id="onapreTable">
                        <thead>
                          <tr>
                            <th>N°</th>
                            <th>Nombre</th>
                            <?php if (isset($decoded->data->tipo) && $decoded->data->tipo != '0') { ?>
                                <th>Acción</th>
                            <?php } ?>
                          </tr>
                        </thead>
                        <tbody class="table-border-bottom-0" id="onapreTableBody">
                          <!-- Las filas se llenarán dinámicamente con JavaScript -->
                        </tbody>
                      </table>
                    </div>

                    <!-- Paginación ONAPRE -->
                    <div class="demo-inline-spacing mt-4">
                      <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-center" id="onaprePagination">
                          <!-- La paginación se generará dinámicamente con JavaScript -->
                        </ul>
                      </nav>
                    </div>
                    <!-- Fin de Paginación -->
                    
                    <div class="form-text">
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

    <!-- Main JS -->
    <script src="../assets/js/main.js"></script>

    <!-- Page JS -->
    <script src="../assets/js/form-basic-inputs.js"></script>

    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="../js/buttons.js"></script>

    <!-- Funcionamiento de la tabla CET -->
    <script src="../assets/js/modulos/gest-presupuesto/func-table_cargoCET.js"></script> 

    <!-- Funcionamiento de la tabla ONAPRE -->
    <script src="../assets/js/modulos/gest-presupuesto/func-table_cargoONAPRE.js"></script>

    <!-- MODALES -->
      <!-- MODAL CET -->
        <div class="modal fade" id="ModalEditCET" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel1">Editar Cargo</h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Cerrar"
                ></button>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col mb-3">
                    <label for="nameBasic" class="form-label">Nombre del Cargo</label>
                    <input 
                        type="text" 
                        id="nameBasic" 
                        class="form-control" 
                        placeholder="Ingrese el nombre"
                        maxlength="50"
                        required
                    >
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                  Cerrar
                </button>
                <button type="button" class="btn btn-primary">Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
      <!-- MODAL ONAPRE -->
        <div class="modal fade" id="ModalEditIONAPRE" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel2">Editar Cargo ONAPRE</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col mb-3">
                                <label for="nameBasic2" class="form-label">Nombre del Cargo</label>
                                <input 
                                    type="text" 
                                    id="nameBasic2" 
                                    class="form-control" 
                                    placeholder="Ingrese el nombre" 
                                    pattern="[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s]{1,50}"
                                    title="Solo letras (mayúsculas o minúsculas) y espacios, máximo 50 caracteres"
                                    required
                                >
                                <div class="invalid-feedback">
                                    Solo se permiten letras (mayúsculas o minúsculas) y espacios, sin números ni caracteres especiales. Máximo 50 caracteres.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                            Cerrar
                        </button>
                        <button type="button" class="btn btn-primary">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
  </body>
</html>
