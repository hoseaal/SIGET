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

    <!-- Validación de Sesión -->
    <script src="../assets/js/modulos/check_sesion.js"></script>

    <!-- Helpers -->
    <script src="../assets/vendor/js/helpers.js"></script>
    <script src="../assets/js/config.js"></script>

    <?php require_once '../PHP/api/usuarios/carga_select.php'; ?>
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
            <h4 class="fw-bold py-3 mb-4"><span class="text-muted fw-light">Agregar /</span> Nuevo Trabajador</h4>
            <form id="formRegistro" action="../PHP/api/usuarios/procesar_registro.php" method="POST">
              <div class="row">
                <!-- Datos Personales -->
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
                          <input type="date" class="form-control" id="fechaingreso" name="fechaingreso" required />
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

                <!-- Datos del Área -->
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
                      <!-- Nivel Salarial -->
                      <div class="mb-3">
                        <label for="nivelsalarial" class="form-label">Nivel Salarial</label>
                        <select id="nivelsalarial" name="nivelsalarial" class="form-select" required>
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
                      <!-- Nivel De Profesionalización -->
                      <div class="mb-3">
                        <label for="nivelprof" class="form-label">Nivel de Profesionalzación</label>
                        <select id="nivelprof" name="nivelprof" class="form-select" required>
                          <option value="">Seleccione</option>
                            <option value="1">1 - T.S.U</option>
                            <option value="2">2 - Profesional</option>
                            <option value="3">3 - Especialista</option>
                            <option value="4">4 - Maestria</option>
                            <option value="5">5 - Doctor</option>
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

      $(document).ready(function() {
        // Función para validar solo números (sin caracteres especiales)
        function validarSoloNumeros(event) {
            const charCode = event.which ? event.which : event.keyCode;
            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                event.preventDefault();
                return false;
            }
            return true;
        }

        // Función para validar solo letras (con acentos)
        function validarSoloLetras(event) {
            const charCode = event.which ? event.which : event.keyCode;
            // Permitir teclas de control (backspace, delete, etc.)
            if (charCode <= 32 || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) {
                return true;
            }
            // Permitir letras con acentos (á, é, í, ó, ú, ñ, etc.)
            if (charCode >= 192 && charCode <= 255) {
                return true;
            }
            event.preventDefault();
            return false;
        }

        // Validación para la cédula (solo números, máximo 10 caracteres)
        $('#cedula').on('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
        }).on('keypress', validarSoloNumeros);

        // Validación para la numero de hijos (solo números, máximo 2 caracteres)
        $('#numerohijos').on('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 2) {
                this.value = this.value.slice(0, 2);
            }
        }).on('keypress', validarSoloNumeros);

        // Validación para nombres (solo letras y acentos, máximo 50 caracteres)
        $('#nombre').on('input', function() {
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            if (this.value.length > 50) {
                this.value = this.value.slice(0, 50);
            }
        }).on('keypress', validarSoloLetras);

        // Validación para apellidos (solo letras y acentos, máximo 50 caracteres)
        $('#apellidos').on('input', function() {
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            if (this.value.length > 50) {
                this.value = this.value.slice(0, 50);
            }
        }).on('keypress', validarSoloLetras);

        // Validación para fecha de ingreso (no mayor a hoy)
        $('#fechaingreso').on('change', function() {
            const fechaSeleccionada = new Date(this.value);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            if (fechaSeleccionada > hoy) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Fecha inválida',
                    text: 'La fecha de ingreso no puede ser mayor a la fecha actual',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                this.value = '';
            }
        });

        // Validación del formulario al enviar
        $('#formRegistro').on('submit', function(e) {
            e.preventDefault();
            let isValid = true;
            let errorMessage = '';
            
            // Validar género
            if (!$('input[name="generoEmpleado"]:checked').val()) {
                errorMessage = 'Por favor seleccione el género del empleado';
                isValid = false;
            }
            
            // Validar selects (que no sea la opción por defecto)
            const selects = ['#cargocet', '#cargoonapre', '#nivelsalarial', '#nivelprof', '#departamentoasig'];
            selects.forEach(select => {
                if (!$(select).val() && isValid) {
                    errorMessage = `Por favor seleccione una opción válida para ${$(select).prev('label').text()}`;
                    isValid = false;
                }
            });
            
            if (!isValid) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Datos incompletos',
                    text: errorMessage,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return false;
            }

            // Mostrar mensaje de confirmación antes de enviar
            smallSwal.fire({
                title: '¿Registrar nuevo trabajador?',
                text: 'Revise que los datos sean correctos antes de continuar',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, registrar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Mostrar mensaje de procesamiento
                    smallSwal.fire({
                        title: 'Procesando registro',
                        html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%; height: 100%;"></div></div>',
                        width: 350,
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        didOpen: () => {
                            smallSwal.showLoading();
                        }
                    });

                    // Enviar formulario manualmente
                    const formData = $(this).serialize();
                    $.ajax({
                        url: $(this).attr('action'),
                        type: 'POST',
                        data: formData,
                        success: function(response) {
                            // Redirigir con mensaje de éxito
                            window.location.href = '../html/index.php?status=success';
                        },
                        error: function(xhr, status, error) {
                            smallSwal.fire({
                                icon: 'error',
                                title: 'Error en el registro',
                                text: 'Ocurrió un error al registrar el trabajador: ' + xhr.responseText,
                                confirmButtonColor: '#3085d6',
                                confirmButtonText: 'Entendido'
                            });
                        }
                    });
                }
            });
        });

        // Función para limpiar todos los campos del formulario
        function limpiarFormulario() {
            // Mostrar confirmación antes de limpiar
            smallSwal.fire({
                title: '¿Limpiar formulario?',
                text: 'Se perderán todos los datos ingresados',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, limpiar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Resetear el formulario (esto limpia inputs básicos)
                    $('#formRegistro')[0].reset();
                    
                    // Resetear selects personalizados (asegurando que muestren "Seleccione")
                    $('#cargocet, #cargoonapre, #nivelsalarial, #departamentoasig').val('');
                    
                    // Resetear radios (ninguno seleccionado)
                    $('input[name="generoEmpleado"]').prop('checked', false);
                    
                    // Restablecer todas las opciones del nivel salarial (por si se había modificado)
                    $('#nivelsalarial').html(`
                        <option value="">Seleccione</option>
                        <option value="I">I</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                        <option value="V">V</option>
                        <option value="VI">VI</option>
                        <option value="VII">VII</option>
                    `);
                    
                    smallSwal.fire({
                        icon: 'success',
                        title: 'Formulario limpiado',
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            });
        }

        // Evento click para el botón Limpiar Campos
        $('#btnLimpiar').click(function() {
            limpiarFormulario();
        });

        // Código para la validación de cargos ONAPRE
        const cargosEspeciales = [
            "COORDINADOR(A) DE ÁREA",
            "DIRECTOR DE LINEA",
            "DIRECTOR GENERAL",
            "JEFE DE DIVISIÓN",
            "JEFE DE DIVISIÓN (COORDINADOR DE ÁREA)",
            "JEFE DE DIVISIÓN DE REMUNERACIONES",
            "JEFE DE DIVISIÓN GENERAL",
            "CONTRALOR(A) DEL ESTADO"
        ];

        $('#cargoonapre').change(function() {
            const cargoSeleccionado = $(this).find('option:selected').text().trim();
            
            if (cargosEspeciales.includes(cargoSeleccionado)) {
                $('#nivelsalarial').html('<option value="I">I</option>');
                smallSwal.fire({
                    icon: 'info',
                    title: 'Nivel salarial asignado',
                    text: 'Este cargo solo permite nivel salarial I',
                    showConfirmButton: false,
                    timer: 2000
                });
            } else {
                $('#nivelsalarial').html(`
                    <option value="">Seleccione</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                    <option value="V">V</option>
                    <option value="VI">VI</option>
                    <option value="VII">VII</option>
                `);
            }
        });

        if ($('#cargoonapre').val()) {
            $('#cargoonapre').trigger('change');
        }
      });
    </script>

    <!-- Validación de Selección para nivel de salario -->
    <script>
      $(document).ready(function() {
          // Definir los cargos especiales que solo permiten nivel I
          const cargosEspeciales = [
              "COORDINADOR(A) DE ÁREA",
              "DIRECTOR DE LINEA",
              "DIRECTOR GENERAL",
              "JEFE DE DIVISIÓN",
              "JEFE DE DIVISIÓN (COORDINADOR DE ÁREA)",
              "JEFE DE DIVISIÓN DE REMUNERACIONES",
              "JEFE DE DIVISIÓN GENERAL",
              "CONTRALOR(A) DEL ESTADO"
          ];

          // Escuchar cambios en el select de Cargo ONAPRE
          $('#cargoonapre').change(function() {
              const cargoSeleccionado = $(this).find('option:selected').text().trim();
              
              if (cargosEspeciales.includes(cargoSeleccionado)) {
                  // Si es un cargo especial, mostrar solo opción I
                  $('#nivelsalarial').html('<option value="I">I</option>');
              } else {
                  // Si no es un cargo especial, mostrar todas las opciones
                  $('#nivelsalarial').html(`
                      <option value="">Seleccione</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="V">V</option>
                      <option value="VI">VI</option>
                      <option value="VII">VII</option>
                  `);
              }
          });

          // También validar al cargar la página si ya hay un valor seleccionado
          if ($('#cargoonapre').val()) {
              $('#cargoonapre').trigger('change');
          }
      });
    </script>

  </body>
</html>