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
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <div class="mb-3">
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="bx bx-search"></i></span>
                                            <input type="text" id="filtroUsuarios" class="form-control" placeholder="Buscar por cédula, nombres o apellidos...">
                                        </div>
                                    </div>
                                    <div class="table-responsive">
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

    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="../js/buttons.js"></script>

    <script>
        // Configuración común para los alerts pequeños
        const smallSwal = Swal.mixin({
            width: '400px',
            padding: '1rem',
            customClass: {
            popup: 'small-swal',
            title: 'small-swal-title',
            htmlContainer: 'small-swal-content',
            confirmButton: 'small-swal-confirm'
            }
        });

        // Contador para identificar cada grupo de selects
        let contadorRangos = 0;

        function verificarAntiguedadesUsuario(cedula) {
            fetch(`../PHP/api/usuarios/tomar_antiguedades.php?cedula=${cedula}`)
                .then(res => res.json())
                .then(data => {
                    // Limpiar contenedor existente
                    document.getElementById('antiguedades-container').innerHTML = '';
                    contadorRangos = 0;
                    
                    // Agregar rangos existentes (si hay)
                    if (data.length > 0) {
                        data.forEach(antiguedad => {
                            agregarRangoAntiguedad(
                                antiguedad.ant_ani, 
                                antiguedad.ant_anf, 
                                antiguedad.ant_ide
                            );
                        });
                    }
                    
                    // Siempre agregar un rango vacío para nuevos registros
                    agregarRangoAntiguedad();
                })
                .catch(error => {
                    console.error("Error al obtener antigüedades:", error);
                    smallSwal.fire({
                        icon: 'error',
                        title: 'Error al cargar',
                        text: 'No se pudieron cargar las antigüedades existentes',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'Entendido'
                    });
                    // Asegurarse de que haya al menos un rango vacío
                    document.getElementById('antiguedades-container').innerHTML = '';
                    contadorRangos = 0;
                    agregarRangoAntiguedad();
                });
        }
        
        function agregarRangoAntiguedad(fechaInicial = '', fechaFinal = '', antId = null) {
            contadorRangos++;
            
            // Obtener la fecha actual en formato YYYY-MM-DD
            const today = new Date().toISOString().split('T')[0];
            
            // Crear el elemento contenedor del rango
            const rangoDiv = document.createElement('div');
            rangoDiv.className = 'rango-antiguedad mb-3';
            rangoDiv.id = `rango-${contadorRangos}`;
            
            // Crear la estructura HTML del rango
            rangoDiv.innerHTML = `
                <div class="row g-3 align-items-center">
                    <div class="col-md-5">
                        <label class="form-label">Fecha inicial</label>
                        <input type="date" class="form-control fecha-inicial" 
                            id="fecha-inicial-${contadorRangos}" 
                            value="${fechaInicial}"
                            max="${today}"
                            onchange="validarFechas(this)">
                        <div class="invalid-feedback">La fecha no puede ser futura</div>
                    </div>
                    <div class="col-md-2 text-center">
                        <span class="fs-4">-</span>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label">Fecha final</label>
                        <input type="date" class="form-control fecha-final" 
                            id="fecha-final-${contadorRangos}" 
                            value="${fechaFinal}"
                            max="${today}"
                            onchange="validarFechas(this)">
                        <div class="invalid-feedback">La fecha no puede ser futura</div>
                    </div>
                    <!-- Campo oculto para el ID de antigüedad (si existe) -->
                    <input type="hidden" id="ant-ide-${contadorRangos}" value="${antId || ''}">
                </div>
                <div class="text-end mt-2">
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="eliminarRango('rango-${contadorRangos}')">
                        <i class="bx bx-trash"></i> Eliminar
                    </button>
                </div>
            `;
            
            // Agregar el nuevo rango al contenedor
            document.getElementById('antiguedades-container').appendChild(rangoDiv);
            
            // Validar las fechas si ya tienen valores
            if (fechaInicial) {
                validarFechas(document.getElementById(`fecha-inicial-${contadorRangos}`));
            }
            if (fechaFinal) {
                validarFechas(document.getElementById(`fecha-final-${contadorRangos}`));
            }
        }

        function validarFechas(input) {
            const today = new Date();
            const inputDate = new Date(input.value);
            
            // Resetear estado de validación
            input.classList.remove('is-invalid');
            
            // Validar si la fecha es futura
            if (input.value && inputDate > today) {
                input.classList.add('is-invalid');
                return false;
            }
            
            return true;
        }
        
        function eliminarRango(idRango) {
            smallSwal.fire({
                title: '¿Eliminar rango?',
                text: 'Esta acción no se puede deshacer',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const rango = document.getElementById(idRango);
                    if (rango) {
                        rango.remove();
                        smallSwal.fire({
                            icon: 'success',
                            title: 'Rango eliminado',
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                }
            });
        }

        function validarTodasLasFechas() {
            let todasValidas = true;
            const today = new Date();
            
            // Validar fechas iniciales
            document.querySelectorAll('.fecha-inicial').forEach(input => {
                if (!validarFechas(input)) {
                    todasValidas = false;
                }
            });
            
            // Validar fechas finales
            document.querySelectorAll('.fecha-final').forEach(input => {
                if (!validarFechas(input)) {
                    todasValidas = false;
                }
            });
            
            return todasValidas;
        }
        
        // Agregar un rango inicial al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            agregarRangoAntiguedad();
        });
    </script>

    <script>
        let cedulaSeleccionada = '';

        // Función para filtrar la tabla de usuarios
        function filtrarUsuarios() {
            const filtro = $('#filtroUsuarios').val().toLowerCase();
            let resultados = 0;
            
            $('#tablaUsuarios tbody tr').each(function() {
                const cedula = $(this).find('td:eq(0)').text().toLowerCase();
                const nombres = $(this).find('td:eq(1)').text().toLowerCase();
                const apellidos = $(this).find('td:eq(2)').text().toLowerCase();
                
                const coincide = cedula.includes(filtro) || 
                                nombres.includes(filtro) || 
                                apellidos.includes(filtro);
                
                $(this).toggle(coincide);
                if (coincide) resultados++;
            });
            
            // Mostrar mensaje si no hay resultados
            const mensajeNoResultados = $('#tablaUsuarios').data('no-results');
            if (resultados === 0 && filtro !== '') {
                if (!$('#noResultsRow').length) {
                    $('#tablaUsuarios tbody').append(
                        `<tr id="noResultsRow"><td colspan="3" class="text-center py-4">${mensajeNoResultados || 'No se encontraron coincidencias'}</td></tr>`
                    );
                }
            } else {
                $('#noResultsRow').remove();
            }
        }

        $(document).ready(function() {
            $('#filtroUsuarios').on('input', filtrarUsuarios);
            $('#tablaUsuarios').data('no-results', 'No se encontraron usuarios que coincidan con la búsqueda');

            $('#modalUsuarios').on('show.bs.modal', function () {
                // Limpiar tabla
                $('#tablaUsuarios tbody').empty();
                
                // Mostrar mensaje de carga
                smallSwal.fire({
                    title: 'Cargando usuarios',
                    html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%; height: 100%;"></div></div>',
                    width: 350,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        smallSwal.showLoading();
                    }
                });
                
                // Cargar usuarios
                fetch('../PHP/api/usuarios/tomar_usuarios.php')
                    .then(res => res.json())
                    .then(data => {
                        smallSwal.close();
                        data.forEach(usuario => {
                            const fila = `
                                <tr data-cedula="${usuario.nom_ced}">
                                    <td>${usuario.nom_ced}</td>
                                    <td>${usuario.nom_nom}</td>
                                    <td>${usuario.nom_ape}</td>
                                </tr>`;
                            $('#tablaUsuarios tbody').append(fila);
                        });
                    })
                    .catch(error => {
                        smallSwal.fire({
                            icon: 'error',
                            title: 'Error al cargar',
                            text: 'No se pudieron cargar los usuarios',
                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'Entendido'
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
                
                // Verificar y cargar antigüedades existentes
                verificarAntiguedadesUsuario(cedulaSeleccionada);
            });
        });
    </script>

    <script>
        document.getElementById('formAnt').addEventListener('submit', function (e) {
            e.preventDefault();

            // Validar todas las fechas antes de continuar
            const todasLasFechasValidas = validarTodasLasFechas();
            if (!todasLasFechasValidas) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Fechas inválidas',
                    text: 'Algunas fechas son futuras. Corrígelas antes de continuar.',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            const cedula = document.getElementById('cedulaSeleccionada').value;
            if (!cedula) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Usuario requerido',
                    text: 'Debe seleccionar un usuario antes de continuar',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            const rangos = [];
            const actualizaciones = [];
            const contenedores = document.querySelectorAll('.rango-antiguedad');

            contenedores.forEach((rangoDiv) => {
                const id = rangoDiv.querySelector('input[id^="ant-ide"]')?.value;
                const fechaInicial = rangoDiv.querySelector('input[id^="fecha-inicial"]').value;
                const fechaFinal = rangoDiv.querySelector('input[id^="fecha-final"]').value;

                if (fechaInicial && fechaFinal) {
                    if (id) {
                        // Es un registro existente (posible actualización)
                        actualizaciones.push({
                            ant_ide: id,
                            ant_ani: fechaInicial,
                            ant_anf: fechaFinal
                        });
                    } else {
                        // Es un nuevo registro
                        rangos.push({
                            ant_ani: fechaInicial,
                            ant_anf: fechaFinal
                        });
                    }
                }
            });

            if (rangos.length === 0 && actualizaciones.length === 0) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Rangos requeridos',
                    text: 'Debe ingresar al menos un rango válido de fechas',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            // Mostrar confirmación antes de enviar
            smallSwal.fire({
                title: '¿Registrar antigüedades?',
                text: 'Se guardarán/actualizarán los rangos de antigüedad',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, guardar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Mostrar mensaje de procesamiento
                    smallSwal.fire({
                        title: 'Procesando datos',
                        html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%; height: 100%;"></div></div>',
                        width: 350,
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        didOpen: () => {
                            smallSwal.showLoading();
                        }
                    });

                    // Enviar datos al servidor
                    fetch('../PHP/api/usuarios/registrar_antiguedades.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            cedula,
                            nuevos: rangos,
                            actualizaciones: actualizaciones
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            smallSwal.fire({
                                icon: 'success',
                                title: '¡Guardado exitoso!',
                                text: 'Datos registrados/actualizados correctamente',
                                showConfirmButton: false,
                                timer: 1500
                            }).then(() => {
                                // Recargar las antigüedades para reflejar cambios
                                verificarAntiguedadesUsuario(cedula);
                            });
                        } else {
                            smallSwal.fire({
                                icon: 'error',
                                title: 'Error al guardar',
                                text: data.message || 'Ocurrió un error al procesar los datos',
                                confirmButtonColor: '#3085d6',
                                confirmButtonText: 'Entendido'
                            });
                        }
                    })
                    .catch(error => {
                        smallSwal.fire({
                            icon: 'error',
                            title: 'Error de conexión',
                            text: 'Ocurrió un problema al conectar con el servidor',
                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'Entendido'
                        });
                        console.error(error);
                    });
                }
            });
        });
    </script>

    <script>
        // Función para limpiar todos los campos
        function limpiarCampos() {
            smallSwal.fire({
                title: '¿Limpiar formulario?',
                text: 'Se perderán todos los datos no guardados',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, limpiar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // 1. Limpiar el campo de cédula seleccionada
                    document.getElementById('cedulaSeleccionada').value = '';
                    
                    // 2. Limpiar el contenedor de antigüedades y agregar un rango inicial
                    const container = document.getElementById('antiguedades-container');
                    container.innerHTML = '';
                    contadorRangos = 0;
                    agregarRangoAntiguedad(); // Esto agregará un rango vacío
                    
                    $('#tablaUsuarios tr').removeClass('table-primary');
                    cedulaSeleccionada = '';
                    $('#confirmarSeleccion').prop('disabled', true);
                    
                    smallSwal.fire({
                        icon: 'success',
                        title: 'Formulario limpiado',
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            });
        }

        document.getElementById('btnLimpiar').addEventListener('click', limpiarCampos);
    </script>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const modalUsuarios = document.getElementById('modalUsuarios');

            modalUsuarios.addEventListener('shown.bs.modal', function () {
                const botonConfirmar = document.getElementById('confirmarSeleccion');
                
                if (botonConfirmar) {
                    botonConfirmar.focus();
                }
            });
        });
    </script>

  </body>
</html>
