<?php
  require_once '../PHP/api/validar-jwt.php';

  if (!isset($decoded) || !isset($decoded->data->tipo)) {
      header('Location: auth-login-basic.php');
      exit;
  }

  // Verificar si el tipo de usuario es 4
  if ($decoded->data->tipo != '4') {
      header('Location: auth-login-basic.php');
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

            <form id="formRoles">
                <div class="row">
                    <!-- Selección de Rol -->
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <h5 class="card-header">Seleccione un rol</h5>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label">Rol</label>
                                    <select id="rolSeleccionado" name="rolSeleccionado" class="form-select">
                                        <option value="" selected disabled>Seleccione un rol</option>
                                        <option value="0">Visualizador</option>
                                        <option value="1">Temporal</option>
                                        <option value="2">Trabajador</option>
                                        <option value="3">Jefe de área</option>
                                        <option value="4">Administrador</option>
                                    </select>
                                </div>
                                <div id="defaultFormControlHelp" class="form-text">
                                    Seleccione un rol para ver sus permisos.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Información del Rol -->
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <h5 class="card-header">Permisos del Rol</h5>
                            <div class="card-body">
                                <div id="permisos-container">
                                    <div class="alert alert-info">
                                        Seleccione un rol para ver sus permisos.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Botones de Acción -->
                    <div class="col-12 d-flex justify-content-center gap-2 mt-2">
                        <button type="button" id="btnLimpiar" class="btn btn-outline-danger px-4">Limpiar Selección</button>
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
        document.addEventListener('DOMContentLoaded', function() {
            // Obtener elementos del DOM
            const rolSelect = document.getElementById('rolSeleccionado');
            const permisosContainer = document.getElementById('permisos-container');
            
            // Mapeo de roles a sus descripciones
            const descripcionesRoles = {
                '0': 'Tiene acceso a páginas no críticas para la visualización de datos',
                '1': 'Tiene acceso a páginas críticas sin capacidad de edición o eliminación',
                '2': 'Tiene acceso básico a las funciones principales del sistema',
                '3': 'Tiene acceso a edición y eliminación de todas las páginas de su área',
                '4': 'Tiene acceso total de las páginas con capacidad de edición y eliminación; además, puede añadir nuevos usuarios al sistema'
            };
            
            // Mapeo de roles a sus nombres completos
            const nombresRoles = {
                '0': 'Visualizador',
                '1': 'Temporal',
                '2': 'Trabajador',
                '3': 'Jefe de área',
                '4': 'Administrador'
            };
            
            // Función para actualizar la visualización de permisos
            function actualizarPermisos() {
                const rolSeleccionado = rolSelect.value;
                
                if (!rolSeleccionado) {
                    permisosContainer.innerHTML = `
                        <div class="alert alert-info">
                            Seleccione un rol para ver sus permisos.
                        </div>
                    `;
                    return;
                }
                
                const descripcion = descripcionesRoles[rolSeleccionado];
                const nombreRol = nombresRoles[rolSeleccionado];
                
                permisosContainer.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${nombreRol}</h5>
                            <p class="card-text">${descripcion}</p>
                            <div class="mt-3">
                                <h6>Detalles adicionales:</h6>
                                <ul class="list-group list-group-flush">
                                    ${generarDetallesAdicionales(rolSeleccionado)}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Función para generar detalles adicionales según el rol
            function generarDetallesAdicionales(rol) {
                let detalles = '';
                
                switch(rol) {
                    case '0': // Visualizador
                        detalles = `
                            <li class="list-group-item">• Solo puede ver información</li>
                            <li class="list-group-item">• No puede realizar cambios</li>
                        `;
                        break;
                    case '1': // Temporal
                        detalles = `
                            <li class="list-group-item">• Acceso temporal usado para usuarios a mediano plazo</li>
                            <li class="list-group-item">• Puede ver información crítica</li>
                            <li class="list-group-item">• No puede modificar datos</li>
                        `;
                        break;
                    case '2': // Trabajador
                        detalles = `
                            <li class="list-group-item">• Acceso completo a funciones básicas</li>
                            <li class="list-group-item">• Puede registrar información</li>
                            <li class="list-group-item">• Acceso a edición de registros</li>
                        `;
                        break;
                    case '3': // Jefe de área
                        detalles = `
                            <li class="list-group-item">• Acceso total a las páginas de su área</li>
                            <li class="list-group-item">• Puede editar cualquier registro</li>
                            <li class="list-group-item">• Puede eliminar cualquier registro</li>
                        `;
                        break;
                    case '4': // Administrador
                        detalles = `
                            <li class="list-group-item">• Acceso completo a todo el sistema</li>
                            <li class="list-group-item">• Gestión de usuarios y roles</li>
                            <li class="list-group-item">• Acceso a tabla de cambios hechos en el sistema</li>
                            <li class="list-group-item">• Acceso a modificación, eliminación y edición de cualquier registro</li>
                        `;
                        break;
                    default:
                        detalles = '<li class="list-group-item">No hay detalles adicionales para este rol.</li>';
                }
                
                return detalles;
            }
            
            // Event listener para cambios en la selección de rol
            rolSelect.addEventListener('change', actualizarPermisos);
            
            // Función para limpiar la selección
            document.getElementById('btnLimpiar').addEventListener('click', function() {
                rolSelect.value = '';
                actualizarPermisos();
            });
        });
    </script>

  </body>
</html>
