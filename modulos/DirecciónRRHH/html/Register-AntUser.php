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

            <form id="formAnt">
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
                              data-bs-target="#modalUsuarios"
                          >
                              Añadir
                          </button>
                          
                          <!-- Campo para mostrar la cédula seleccionada -->
                            <div class="mb-3">
                              <label class="form-label">Usuario seleccionado</label>
                              <div class="input-group">
                              <input type="text" id="cedulaSeleccionada" name="cedulaSeleccionada" class="form-control" readonly>
                            </div>
                          </div>

                          <!-- Modal -->
                            <div class="modal fade" id="modalUsuarios" tabindex="-1" role="dialog" aria-labelledby="modalUsuariosLabel" aria-hidden="true">
                            <div class="modal-dialog modal-lg" role="document">
                                <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Seleccionar Usuario</h5>
                                    <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <table class="table table-hover" id="tablaUsuarios">
                                    <thead>
                                        <tr>
                                        <th>Cédula</th>
                                        <th>Nombres</th>
                                        <th>Apellidos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Aquí se insertarán los usuarios vía JavaScript -->
                                    </tbody>
                                    </table>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                        Cerrar      
                                    </button>
                                    <button type="button" id="confirmarSeleccion" class="btn btn-primary" disabled>Confirmar Selección</button>
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

    <script>
        let cedulaSeleccionada = '';

        $(document).ready(function() {
            $('#modalUsuarios').on('show.bs.modal', function () {
                // Limpiar tabla
                $('#tablaUsuarios tbody').empty();
                
                // Cargar usuarios
                fetch('../PHP/api/usuarios/get_usuarios.php')
                    .then(res => res.json())
                    .then(data => {
                        data.forEach(usuario => {
                            const fila = `
                                <tr data-cedula="${usuario.nom_ced}">
                                    <td>${usuario.nom_ced}</td>
                                    <td>${usuario.nom_nom}</td>
                                    <td>${usuario.nom_ape}</td>
                                </tr>`;
                            $('#tablaUsuarios tbody').append(fila);
                        });
                    });
            });

            // Seleccionar fila
            $('#tablaUsuarios tbody').on('click', 'tr', function() {
                $('#tablaUsuarios tr').removeClass('table-primary');
                $(this).addClass('table-primary');
                cedulaSeleccionada = $(this).data('cedula');
                $('#confirmarSeleccion').prop('disabled', false);
            });

            // Confirmar selección
            $('#confirmarSeleccion').on('click', function() {
                $('#cedulaSeleccionada').val(cedulaSeleccionada);
                $('#modalUsuarios').modal('hide');
            });
        });
    </script>

    <script>
        document.getElementById('formAnt').addEventListener('submit', function (e) {
            e.preventDefault(); 

            const cedula = document.getElementById('cedulaSeleccionada').value;
            if (!cedula) {
                alert("Debe seleccionar un usuario.");
                return;
            }

            const rangos = [];
            const contenedores = document.querySelectorAll('.rango-antiguedad');

            contenedores.forEach((rangoDiv) => {
                const fechaInicial = rangoDiv.querySelector('input[id^="fecha-inicial"]').value;
                const fechaFinal = rangoDiv.querySelector('input[id^="fecha-final"]').value;

                if (fechaInicial && fechaFinal) {
                    rangos.push({
                        ant_ani: fechaInicial,
                        ant_anf: fechaFinal
                    });
                }
            });

            if (rangos.length === 0) {
                alert("Debe ingresar al menos un rango válido de fechas.");
                return;
            }

            fetch('../PHP/api/usuarios/registrar_antiguedades.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cedula, rangos })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert("Datos registrados correctamente.");
                    document.getElementById('formAnt').reset();
                    document.getElementById('antiguedades-container').innerHTML = '';
                    agregarRangoAntiguedad();
                } else {
                    alert("Error al registrar: " + data.message);
                }
            })
            .catch(error => {
                alert("Ocurrió un error en la solicitud.");
                console.error(error);
            });
        });
    </script>

    <script>
        // Función para limpiar todos los campos
        function limpiarCampos() {
            // 1. Limpiar el campo de cédula seleccionada
            document.getElementById('cedulaSeleccionada').value = '';
            
            // 2. Limpiar el contenedor de antigüedades y agregar un rango inicial
            const container = document.getElementById('antiguedades-container');
            container.innerHTML = '';
            contadorRangos = 0;
            agregarRangoAntiguedad();
            
            $('#tablaUsuarios tr').removeClass('table-primary');
            cedulaSeleccionada = '';
            $('#confirmarSeleccion').prop('disabled', true);
        }

        document.getElementById('btnLimpiar').addEventListener('click', limpiarCampos);
    </script>

  </body>
</html>
