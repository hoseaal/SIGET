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
            <h4 class="fw-bold py-3 mb-4"><span class="text-muted fw-light">Agregar /</span> Registro de Antigüedades</h4>

            <form id="formAnt" action="#" method="POST">
              <div class="row">
                <!-- Datos Personales -->
                <div class="col-md-6">
                  <div class="card mb-4">
                      <h5 class="card-header">Seleccione un usuario</h5>
                      <div class="card-body">
                          <button
                              type="button"
                              class="btn btn-primary mb-3"
                              data-bs-toggle="modal"
                              data-bs-target="#basicModal"
                          >
                              Añadir
                          </button>
                          
                          <!-- Campo para mostrar la cédula seleccionada -->
                          <div class="mb-3">
                              <label class="form-label">Usuario seleccionado</label>
                              <div class="input-group">
                                  <input 
                                      type="text" 
                                      class="form-control" 
                                      id="cedulaSeleccionada" 
                                      placeholder="Ningún usuario seleccionado" 
                                      readonly
                                  >
                                  <button class="btn btn-outline-secondary" type="button" onclick="limpiarSeleccion()">
                                      <i class="bx bx-x"></i>
                                  </button>
                              </div>
                          </div>

                          <!-- Modal -->
                          <div class="modal fade" id="basicModal" tabindex="-1" aria-hidden="true">
                              <div class="modal-dialog" role="document">
                                  <div class="modal-content">
                                      <div class="modal-header">
                                          <h5 class="modal-title" id="exampleModalLabel1">Por favor, seleccione un usuario.</h5>
                                          <button
                                              type="button"
                                              class="btn-close"
                                              data-bs-dismiss="modal"
                                              aria-label="Close"
                                          ></button>
                                      </div>
                                      <div class="modal-body">
                                          <div class="row">
                                              <div class="col mb-3">
                                                  <div class="input-group input-group-merge">
                                                      <span class="input-group-text" id="basic-addon-search31"><i class="bx bx-search"></i></span>
                                                      <input
                                                          type="text"
                                                          class="form-control"
                                                          placeholder="Buscar..."
                                                          aria-label="Buscar..."
                                                          aria-describedby="basic-addon-search31"
                                                      />
                                                  </div>
                                              </div>
                                          </div>
                                          <div class="row g-2">
                                              <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                                                  <table class="table table-hover table-striped table-bordered" id="usuariosTable">
                                                      <thead class="sticky-top" style="background-color: #f8f9fa;">
                                                          <tr>
                                                              <th style="width: 30%; background-color: #f1f1f1;" class="py-3">Cédula</th>
                                                              <th style="width: 35%; background-color: #f1f1f1;" class="py-3">Nombre</th>
                                                              <th style="width: 35%; background-color: #f1f1f1;" class="py-3">Apellido</th>
                                                          </tr>
                                                      </thead>
                                                      <tbody>
                                                          <tr class="align-middle" onclick="selectRow(this, '12345678')">
                                                              <td class="py-2">12345678</td>
                                                              <td class="py-2">María</td>
                                                              <td class="py-2">González</td>
                                                          </tr>
                                                          <tr class="align-middle" onclick="selectRow(this, '23456789')">
                                                              <td class="py-2">23456789</td>
                                                              <td class="py-2">Juan</td>
                                                              <td class="py-2">Pérez</td>
                                                          </tr>
                                                          <tr class="align-middle" onclick="selectRow(this, '34567890')">
                                                              <td class="py-2">34567890</td>
                                                              <td class="py-2">Carlos</td>
                                                              <td class="py-2">Rodríguez</td>
                                                          </tr>
                                                          <tr class="align-middle" onclick="selectRow(this, '45678901')">
                                                              <td class="py-2">45678901</td>
                                                              <td class="py-2">Ana</td>
                                                              <td class="py-2">Martínez</td>
                                                          </tr>
                                                          <tr class="align-middle" onclick="selectRow(this, '56789012')">
                                                              <td class="py-2">56789012</td>
                                                              <td class="py-2">Luis</td>
                                                              <td class="py-2">Gómez</td>
                                                          </tr>
                                                          <tr class="align-middle" onclick="selectRow(this, '67890123')">
                                                              <td class="py-2">67890123</td>
                                                              <td class="py-2">Laura</td>
                                                              <td class="py-2">Fernández</td>
                                                          </tr>
                                                          <tr class="align-middle" onclick="selectRow(this, '78901234')">
                                                              <td class="py-2">78901234</td>
                                                              <td class="py-2">Pedro</td>
                                                              <td class="py-2">Sánchez</td>
                                                          </tr>
                                                          <tr class="align-middle" onclick="selectRow(this, '89012345')">
                                                              <td class="py-2">89012345</td>
                                                              <td class="py-2">Sofía</td>
                                                              <td class="py-2">López</td>
                                                          </tr>
                                                          <tr class="align-middle" onclick="selectRow(this, '90123456')">
                                                              <td class="py-2">90123456</td>
                                                              <td class="py-2">Miguel</td>
                                                              <td class="py-2">Díaz</td>
                                                          </tr>
                                                          <tr class="align-middle" onclick="selectRow(this, '01234567')">
                                                              <td class="py-2">01234567</td>
                                                              <td class="py-2">Elena</td>
                                                              <td class="py-2">Hernández</td>
                                                          </tr>
                                                      </tbody>
                                                  </table>
                                              </div>
                                          </div>
                                      </div>
                                      <div class="modal-footer">
                                          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                              Cerrar
                                          </button>
                                          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Confirmar selección</button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div id="defaultFormControlHelp" class="form-text">
                              No comparta información privada sin previa autorización.
                          </div>
                      </div>
                  </div>
                </div>

                <!-- Datos del Área -->
                <div class="col-md-6">
                    <div class="card mb-4">
                        <h5 class="card-header">Seleccionar Antigüedades</h5>
                        <div class="card-body">
                            <div id="antiguedades-container">
                                <!-- Contenedor donde se agregarán los grupos de selects -->
                            </div>
                            
                            <button type="button" class="btn btn-primary mt-3" onclick="agregarRangoAntiguedad()">
                                <i class="bx bx-plus"></i> Agregar rango
                            </button>
                        </div>
                    </div>
                </div>
                <!-- Botones de Acción -->
                <div class="col-12 d-flex justify-content-center gap-2 mt-2">
                  <button type="submit" name="registrar" class="btn btn-outline-primary px-4">Registrar</button>
                  <button type="button" id="btnLimpiar" class="btn btn-outline-danger px-4">Limpiar Campos</button>
                </div>
              </div> <!-- Cierre de .row -->
            </form>
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

    <script>
        // Función para limpiar todos los campos del formulario
        function limpiarFormulario() {
            if (!confirm('¿Está seguro que desea limpiar todos los campos?')) {
                return;
            }
            // Limpiar selección de usuario
            limpiarSeleccion();
            
            // Limpiar campo de búsqueda en el modal
            document.querySelector('#basicModal input[type="text"]').value = '';
            
            // Limpiar todos los rangos de antigüedad
            const container = document.getElementById('antiguedades-container');
            container.innerHTML = '';
            
            // Agregar un nuevo rango vacío (como estado inicial)
            agregarRangoAntiguedad();
            
            // Deseleccionar cualquier fila en la tabla
            const filas = document.querySelectorAll('#usuariosTable tbody tr');
            filas.forEach(fila => fila.classList.remove('table-primary', 'selected'));
        }
        
        // Asignar la función al botón "Limpiar Campos"
        document.getElementById('btnLimpiar').addEventListener('click', limpiarFormulario);
        
        // Funciones existentes (se mantienen igual)
        function selectRow(row, cedula) {
            const rows = document.querySelectorAll('#usuariosTable tbody tr');
            rows.forEach(r => r.classList.remove('table-primary', 'selected'));
            row.classList.add('table-primary', 'selected');
            document.getElementById('cedulaSeleccionada').value = cedula;
        }
        
        function limpiarSeleccion() {
            const rows = document.querySelectorAll('#usuariosTable tbody tr');
            rows.forEach(r => r.classList.remove('table-primary', 'selected'));
            document.getElementById('cedulaSeleccionada').value = '';
        }
        
        let contadorRangos = 0;
        
        function agregarRangoAntiguedad() {
            contadorRangos++;
            const rangoDiv = document.createElement('div');
            rangoDiv.className = 'rango-antiguedad mb-3';
            rangoDiv.id = `rango-${contadorRangos}`;
            
            rangoDiv.innerHTML = `
                <div class="row g-3 align-items-center">
                    <div class="col-md-5">
                        <label class="form-label">Fecha inicial</label>
                        <input type="date" class="form-control" id="fecha-inicial-${contadorRangos}">
                    </div>
                    <div class="col-md-2 text-center">
                        <span class="fs-4">-</span>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label">Fecha final</label>
                        <input type="date" class="form-control" id="fecha-final-${contadorRangos}">
                    </div>
                </div>
                <div class="text-end mt-2">
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="eliminarRango('rango-${contadorRangos}')">
                        <i class="bx bx-trash"></i> Eliminar
                    </button>
                </div>
            `;
            
            document.getElementById('antiguedades-container').appendChild(rangoDiv);
        }
        
        function eliminarRango(idRango) {
            const rango = document.getElementById(idRango);
            if (rango) {
                rango.remove();
            }
        }
        
        // Agregar un rango inicial al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            agregarRangoAntiguedad();
        });
    </script>

    <script>
        function selectRow(row, cedula) {
            // Remover la clase 'selected' de todas las filas
            const rows = document.querySelectorAll('#usuariosTable tbody tr');
            rows.forEach(r => r.classList.remove('table-primary', 'selected'));
            
            // Añadir la clase 'selected' a la fila clickeada
            row.classList.add('table-primary', 'selected');
            
            // Actualizar el campo de cédula seleccionada
            document.getElementById('cedulaSeleccionada').value = cedula;
        }
        
        function limpiarSeleccion() {
            // Limpiar selección
            const rows = document.querySelectorAll('#usuariosTable tbody tr');
            rows.forEach(r => r.classList.remove('table-primary', 'selected'));
            
            // Limpiar campo de cédula
            document.getElementById('cedulaSeleccionada').value = '';
        }
    </script>

    <script>
        // Contador para identificar cada grupo de selects
        let contadorRangos = 0;
        
        function agregarRangoAntiguedad() {
            contadorRangos++;
            
            // Crear el elemento contenedor del rango
            const rangoDiv = document.createElement('div');
            rangoDiv.className = 'rango-antiguedad mb-3';
            rangoDiv.id = `rango-${contadorRangos}`;
            
            // Crear la estructura HTML del rango
            rangoDiv.innerHTML = `
                <div class="row g-3 align-items-center">
                    <div class="col-md-5">
                        <label class="form-label">Fecha inicial</label>
                        <input type="date" class="form-control" id="fecha-inicial-${contadorRangos}">
                    </div>
                    <div class="col-md-2 text-center">
                        <span class="fs-4">-</span>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label">Fecha final</label>
                        <input type="date" class="form-control" id="fecha-final-${contadorRangos}">
                    </div>
                </div>
                <div class="text-end mt-2">
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="eliminarRango('rango-${contadorRangos}')">
                        <i class="bx bx-trash"></i> Eliminar
                    </button>
                </div>
            `;
            
            // Agregar el nuevo rango al contenedor
            document.getElementById('antiguedades-container').appendChild(rangoDiv);
        }
        
        function eliminarRango(idRango) {
            const rango = document.getElementById(idRango);
            if (rango) {
                rango.remove();
            }
        }
        
        // Agregar un rango inicial al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            agregarRangoAntiguedad();
        });
    </script>

  </body>
</html>
