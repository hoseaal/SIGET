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
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
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

    <!-- Page JS -->
    <script src="../assets/js/form-basic-inputs.js"></script>

    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="../js/buttons.js"></script>

    <script>
      $(document).ready(function() {
          // Función para limpiar todos los campos del formulario
          function limpiarFormulario() {
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
          }

          // Evento click para el botón Limpiar Campos
          $('#btnLimpiar').click(function() {
              limpiarFormulario();
          });

          // Código previo para la validación de cargos ONAPRE
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
