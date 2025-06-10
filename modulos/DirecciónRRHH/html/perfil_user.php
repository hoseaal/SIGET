<?php
  require_once '../PHP/api/validar-jwt.php';

  if (!isset($decoded) || !isset($decoded->data->tipo)) {
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
              <div class="d-flex justify-content-between align-items-center mb-4">
                  <h4 class="fw-bold py-3 mb-0">
                    <span class="text-muted fw-light">Mi Perfil /</span> Información de Usuario
                  </h4>
                  <button id="vistaEmpleado" class="btn btn-primary" style="display: none;">
                      <i class="bx bx-add-to-queue"></i> Información como Trabajador
                  </button>
              </div>
              <form id="formPerfil">
                  <div class="row">
                      <!-- Datos Personales -->
                      <div class="col-md-6">
                          <div class="card mb-4">
                              <h5 class="card-header">Datos Personales</h5>
                              <div class="card-body">
                                  <!-- Cédula -->
                                  <div class="mb-3">
                                      <label for="cedula" class="form-label">Cédula</label>
                                      <input type="text" class="form-control" id="cedula" name="cedula" disabled />
                                  </div>
                                  <!-- Usuario -->
                                  <div class="mb-3">
                                      <label for="usuario" class="form-label">Usuario</label>
                                      <input type="text" class="form-control" id="usuario" name="usuario" disabled />
                                  </div>
                                  <!-- Nombres -->
                                  <div class="mb-3">
                                      <label for="nombre" class="form-label">Nombres</label>
                                      <input type="text" class="form-control" id="nombre" name="nombre" disabled />
                                  </div>
                                  <!-- Apellidos -->
                                  <div class="mb-3">
                                      <label for="apellidos" class="form-label">Apellidos</label>
                                      <input type="text" class="form-control" id="apellidos" name="apellidos" disabled />
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Datos de Acceso -->
                      <div class="col-md-6">
                          <div class="card mb-4">
                              <h5 class="card-header">Datos de Acceso</h5>
                              <div class="card-body">
                                  <!-- Tipo de Usuario -->
                                  <div class="mb-3">
                                      <label for="tipoUsuario" class="form-label">Tipo de Usuario</label>
                                      <input type="text" class="form-control" id="tipoUsuario" disabled />
                                  </div>
                                  <!-- Cambiar Contraseña -->
                                  <div class="mb-3">
                                      <label class="form-label">Cambiar Contraseña</label>
                                      <div class="input-group">
                                          <input type="password" class="form-control" placeholder="**********" disabled />
                                          <button class="btn btn-outline-secondary" type="button" id="btnAbrirCambioPassword">
                                              Cambiar
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
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
      document.addEventListener('DOMContentLoaded', function() {
          // 1. Cargar datos del perfil y verificar nómina
          fetch('../PHP/api/usuarios/obtener_perfil.php')
              .then(response => {
                  if (!response.ok) throw new Error('Error al obtener los datos');
                  return response.json();
              })
              .then(data => {
                  // Llenar campos del formulario principal
                  document.getElementById('cedula').value = data.nom_ced || '';
                  document.getElementById('usuario').value = data.usu_usu || '';
                  document.getElementById('nombre').value = data.usu_nom || '';
                  document.getElementById('apellidos').value = data.usu_ape || '';
                  
                  // Convertir tipo de usuario a texto
                  const tipoUsuario = {
                      0: 'Visualizador',
                      1: 'Temporal',
                      2: 'Trabajador',
                      3: 'Jefe de Área',
                      4: 'Administrador'
                  }[data.usu_tip] || 'Desconocido';
                  
                  document.getElementById('tipoUsuario').value = tipoUsuario;

                  // Verificar si está en nómina
                  return fetch('../PHP/api/usuarios/verificar_nomina.php');
              })
              .then(response => {
                  if (!response.ok) throw new Error('Error al verificar nómina');
                  return response.json();
              })
              .then(data => {
                  const botonTrabajador = document.getElementById('vistaEmpleado');
                  if (botonTrabajador) {
                      botonTrabajador.style.display = data.enNomina ? 'block' : 'none';
                  }
              })
              .catch(error => {
                  console.error('Error:', error);
                  const botonTrabajador = document.getElementById('vistaEmpleado');
                  if (botonTrabajador) botonTrabajador.style.display = 'none';
              });

          // 2. Configurar botón de información como trabajador
          const vistaEmpleadoBtn = document.getElementById('vistaEmpleado');
          if (vistaEmpleadoBtn) {
              vistaEmpleadoBtn.addEventListener('click', cargarDatosTrabajador);
          }

          // 3. Configurar modal de cambio de contraseña
          const btnAbrirCambioPassword = document.getElementById('btnAbrirCambioPassword');
          if (btnAbrirCambioPassword) {
              btnAbrirCambioPassword.addEventListener('click', abrirModalPassword);
          }

          const btnConfirmarCambio = document.getElementById('btnConfirmarCambio');
          if (btnConfirmarCambio) {
              btnConfirmarCambio.addEventListener('click', confirmarCambioPassword);
          }

          const confirmarPasswordInput = document.getElementById('confirmarPassword');
          if (confirmarPasswordInput) {
              confirmarPasswordInput.addEventListener('input', validarPassword);
          }

          document.querySelectorAll('.toggle-password').forEach(icon => {
                icon.addEventListener('click', function() {
                    const input = this.closest('.input-group').querySelector('input');
                    const icon = this.querySelector('i');
                    
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.classList.replace('bx-hide', 'bx-show');
                    } else {
                        input.type = 'password';
                        icon.classList.replace('bx-show', 'bx-hide');
                    }
                });
            });

            document.getElementById('nuevaPassword')?.addEventListener('keypress', function(e) {
                // Solo permitir caracteres alfanuméricos
                const allowedChars = /[a-zA-Z0-9]/;
                if (!allowedChars.test(e.key)) {
                    e.preventDefault();
                }
            });

            document.getElementById('confirmarPassword')?.addEventListener('keypress', function(e) {
                // Solo permitir caracteres alfanuméricos
                const allowedChars = /[a-zA-Z0-9]/;
                if (!allowedChars.test(e.key)) {
                    e.preventDefault();
                }
            });

            document.getElementById('nuevaPassword')?.addEventListener('paste', function(e) {
                const clipboardData = e.clipboardData || window.clipboardData;
                const pastedText = clipboardData.getData('text');
                
                if (!/^[a-zA-Z0-9]+$/.test(pastedText)) {
                    e.preventDefault();
                    mostrarAlerta('warning', 'Advertencia', 'No puedes pegar texto con caracteres especiales');
                }
            });

            document.getElementById('confirmarPassword')?.addEventListener('paste', function(e) {
                const clipboardData = e.clipboardData || window.clipboardData;
                const pastedText = clipboardData.getData('text');
                
                if (!/^[a-zA-Z0-9]+$/.test(pastedText)) {
                    e.preventDefault();
                    mostrarAlerta('warning', 'Advertencia', 'No puedes pegar texto con caracteres especiales');
                }
            });

            document.getElementById('nuevaPassword')?.addEventListener('input', function() {
                validarPassword();
            });

            document.getElementById('confirmarPassword')?.addEventListener('input', function() {
                validarPassword();
            });
      });

      // Funciones separadas para mejor organización

      function cargarDatosTrabajador() {
          const modal = new bootstrap.Modal(document.getElementById('modalTrabajador'));
          const modalBody = document.querySelector('#modalTrabajador .modal-body');
          const formContainer = document.getElementById('formContainer');
          
          // Guardar el contenido original
          const originalContent = formContainer.innerHTML;
          
          // Mostrar spinner de carga
          formContainer.innerHTML = `
              <div class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Cargando...</span>
                  </div>
                  <p class="mt-2">Cargando información laboral...</p>
              </div>
          `;
          
          modal.show();
          
          // Obtener datos del trabajador
          fetch('../PHP/api/usuarios/obtener_trabajador.php')
              .then(response => {
                  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                  return response.json();
              })
              .then(data => {
                  // Restaurar el formulario original
                  formContainer.innerHTML = originalContent;
                  
                  // Llenar los campos del modal
                  setValueIfExists('trab_cedula', data.nom_ced || 'N/A');
                  setValueIfExists('trab_nombres', data.nom_nom || 'N/A');
                  setValueIfExists('trab_apellidos', data.nom_ape || 'N/A');
                  setValueIfExists('trab_fecha_ingreso', data.nom_fec || 'N/A');
                  setValueIfExists('trab_genero', data.nom_gen === 'M' ? 'Masculino' : 'Femenino');
                  setValueIfExists('trab_num_hijos', data.nom_nhi ?? '0');
                  setValueIfExists('trab_cargo_cet', data.cargo_cet || 'N/A');
                  setValueIfExists('trab_cargo_onapre', data.cargo_onapre || 'N/A');
                  setValueIfExists('trab_nivel_prof', getNivelProfesionalizacion(data.nom_pro));
                  setValueIfExists('trab_departamento', data.departamento || 'N/A');
                  setValueIfExists('trab_caja_ahorro', data.tiene_caja_ahorro ? 'Activa' : 'Inactiva o no existe');
              })
              .catch(error => {
                  console.error('Error al cargar datos:', error);
                  formContainer.innerHTML = `
                      <div class="alert alert-danger">
                          <h5>Error al cargar la información</h5>
                          <p>${error.message}</p>
                          <button class="btn btn-sm btn-secondary" onclick="window.location.reload()">Reintentar</button>
                      </div>
                  `;
              });
      }

      function abrirModalPassword() {
            const modal = new bootstrap.Modal(document.getElementById('modalCambiarPassword'));
            const form = document.getElementById('formCambiarPassword');
            
            // Resetear completamente el formulario
            form?.reset();
            form?.classList.remove('was-validated');
            
            // Limpiar estados de invalidación
            document.getElementById('nuevaPassword')?.classList.remove('is-invalid');
            document.getElementById('confirmarPassword')?.classList.remove('is-invalid');
            
            // Limpiar mensajes de validación personalizados
            document.getElementById('nuevaPassword')?.setCustomValidity('');
            document.getElementById('confirmarPassword')?.setCustomValidity('');
            
            modal.show();
        }

      function validarPassword() {
            const nuevaPassword = document.getElementById('nuevaPassword');
            const confirmarPassword = document.getElementById('confirmarPassword');
            
            // Validar caracteres permitidos (esto debería ser redundante gracias a la prevención en keypress)
            const regex = /^[a-zA-Z0-9]*$/;
            
            // Validar nueva contraseña
            if (nuevaPassword.value.length < 8 || nuevaPassword.value.length > 16 || !regex.test(nuevaPassword.value)) {
                nuevaPassword.classList.add('is-invalid');
                nuevaPassword.setCustomValidity('La contraseña debe tener 8-16 caracteres alfanuméricos');
            } else {
                nuevaPassword.classList.remove('is-invalid');
                nuevaPassword.setCustomValidity('');
            }
            
            // Validar confirmación
            if (confirmarPassword.value !== nuevaPassword.value) {
                confirmarPassword.classList.add('is-invalid');
                confirmarPassword.setCustomValidity('Las contraseñas no coinciden');
            } else if (confirmarPassword.value.length < 8 || confirmarPassword.value.length > 16 || !regex.test(confirmarPassword.value)) {
                confirmarPassword.classList.add('is-invalid');
                confirmarPassword.setCustomValidity('La contraseña debe tener 8-16 caracteres alfanuméricos');
            } else {
                confirmarPassword.classList.remove('is-invalid');
                confirmarPassword.setCustomValidity('');
            }
        }

      function confirmarCambioPassword() {
            const form = document.getElementById('formCambiarPassword');
            const nuevaPassword = document.getElementById('nuevaPassword');
            const confirmarPassword = document.getElementById('confirmarPassword');
            
            // Forzar validación actualizada
            validarPassword();
            
            // Verificar si hay errores de validación
            if (nuevaPassword.classList.contains('is-invalid') || confirmarPassword.classList.contains('is-invalid')) {
                // Mostrar todos los errores
                form.classList.add('was-validated');
                return;
            }
            
            // Si todo está correcto, proceder con el cambio
            cambiarPassword(nuevaPassword.value);
        }

      function cambiarPassword(nuevaPassword) {
            const btnConfirmar = document.getElementById('btnConfirmarCambio');
            const originalText = btnConfirmar.innerHTML;
            
            btnConfirmar.disabled = true;
            btnConfirmar.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Procesando...
            `;
            
            const requestData = {
                nuevaPassword: nuevaPassword
            };
            
            fetch('../PHP/api/usuarios/cambiar_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            })
            .then(response => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Mostrar mensaje de éxito con SweetAlert2 y cerrar modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalCambiarPassword'));
                    modal.hide();
                    
                    Swal.fire({
                        title: 'Contraseña cambiada',
                        text: 'Tu contraseña ha sido actualizada correctamente.',
                        icon: 'success',
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                } else {
                    throw new Error(data.message || 'Error al cambiar la contraseña');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'Ocurrió un error al cambiar la contraseña',
                    icon: 'error',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            })
            .finally(() => {
                btnConfirmar.disabled = false;
                btnConfirmar.innerHTML = originalText;
            });
        }

      // Funciones auxiliares
      function setValueIfExists(id, value) {
          const element = document.getElementById(id);
          if (element) element.value = value;
      }

      function getNivelProfesionalizacion(nivel) {
          const niveles = {
              1: 'T.S.U',
              2: 'Profesional',
              3: 'Especialista',
              4: 'Maestría',
              5: 'Doctor'
          };
          return niveles[nivel] || 'No especificado';
      }

      function mostrarAlerta(type, title, message) {
          const alertDiv = document.createElement('div');
          alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
          alertDiv.role = 'alert';
          alertDiv.innerHTML = `
              <strong>${title}</strong> ${message}
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          `;
          
          const container = document.querySelector('.container-xxl');
          if (container) {
              container.prepend(alertDiv);
              
              setTimeout(() => {
                  alertDiv.classList.add('fade');
                  setTimeout(() => alertDiv.remove(), 150);
              }, 5000);
          }
      }
    </script>

    <!-- Modal Información como Trabajador -->
    <div class="modal fade" id="modalTrabajador" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Información como Trabajador</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <!-- Contenedor del formulario (no el formulario mismo) -->
                    <div id="formContainer">
                        <form id="formTrabajador">
                            <div class="row">
                                <!-- Datos Personales -->
                                <div class="col-md-6">
                                    <div class="card mb-4">
                                        <h5 class="card-header">Datos Personales</h5>
                                        <div class="card-body">
                                            <!-- Cédula -->
                                            <div class="mb-3">
                                                <label class="form-label">Cédula</label>
                                                <input type="text" class="form-control" id="trab_cedula" disabled>
                                            </div>
                                            <!-- Nombres -->
                                            <div class="mb-3">
                                                <label class="form-label">Nombres</label>
                                                <input type="text" class="form-control" id="trab_nombres" disabled>
                                            </div>
                                            <!-- Apellidos -->
                                            <div class="mb-3">
                                                <label class="form-label">Apellidos</label>
                                                <input type="text" class="form-control" id="trab_apellidos" disabled>
                                            </div>
                                            <!-- Fecha de Ingreso -->
                                            <div class="mb-3">
                                                <label class="form-label">Fecha de ingreso</label>
                                                <input type="text" class="form-control" id="trab_fecha_ingreso" disabled>
                                            </div>
                                            <!-- Género -->
                                            <div class="mb-3">
                                                <label class="form-label">Género</label>
                                                <input type="text" class="form-control" id="trab_genero" disabled>
                                            </div>
                                            <!-- Número de Hijos -->
                                            <div class="mb-3">
                                                <label class="form-label">Número de Hijos</label>
                                                <input type="text" class="form-control" id="trab_num_hijos" disabled>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Datos Laborales -->
                                <div class="col-md-6">
                                    <div class="card mb-4">
                                        <h5 class="card-header">Datos Laborales</h5>
                                        <div class="card-body">
                                            <!-- Cargo CET -->
                                            <div class="mb-3">
                                                <label class="form-label">Cargo CET</label>
                                                <input type="text" class="form-control" id="trab_cargo_cet" disabled>
                                            </div>
                                            <!-- Cargo ONAPRE -->
                                            <div class="mb-3">
                                                <label class="form-label">Cargo ONAPRE</label>
                                                <input type="text" class="form-control" id="trab_cargo_onapre" disabled>
                                            </div>
                                            <!-- Nivel de Profesionalización -->
                                            <div class="mb-3">
                                                <label class="form-label">Nivel de Profesionalización</label>
                                                <input type="text" class="form-control" id="trab_nivel_prof" disabled>
                                            </div>
                                            <!-- Departamento -->
                                            <div class="mb-3">
                                                <label class="form-label">Departamento</label>
                                                <input type="text" class="form-control" id="trab_departamento" disabled>
                                            </div>
                                            <!-- Caja de Ahorro -->
                                            <div class="mb-3">
                                                <label class="form-label">Caja de Ahorro</label>
                                                <input type="text" class="form-control" id="trab_caja_ahorro" disabled>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Cambiar Contraseña -->
    <div class="modal fade" id="modalCambiarPassword" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Cambiar Contraseña</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="formCambiarPassword" novalidate>
                        <div class="mb-3">
                            <label for="nuevaPassword" class="form-label">Nueva Contraseña</label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="nuevaPassword" 
                                    pattern="[a-zA-Z0-9]{8,16}" 
                                    minlength="8" maxlength="16" 
                                    title="La contraseña debe tener entre 8 y 16 caracteres alfanuméricos" 
                                    required>
                                <span class="input-group-text cursor-pointer toggle-password">
                                    <i class="bx bx-hide"></i>
                                </span>
                                <div class="invalid-feedback">
                                    La contraseña debe tener entre 8 y 16 caracteres alfanuméricos (sin caracteres especiales)
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="confirmarPassword" class="form-label">Confirmar Contraseña</label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="confirmarPassword" 
                                    pattern="[a-zA-Z0-9]{8,16}" 
                                    minlength="8" maxlength="16" 
                                    title="La contraseña debe tener entre 8 y 16 caracteres alfanuméricos" 
                                    required>
                                <span class="input-group-text cursor-pointer toggle-password">
                                    <i class="bx bx-hide"></i>
                                </span>
                                <div class="invalid-feedback">
                                    Las contraseñas deben coincidir y cumplir con los requisitos
                                </div>
                            </div>
                        </div>
                        <div class="alert alert-primary mt-3">
                            <i class="bx bx-info-circle"></i> La contraseña debe tener entre 8 y 16 caracteres alfanuméricos (letras y números).
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="btnConfirmarCambio">Cambiar Contraseña</button>
                </div>
            </div>
        </div>
    </div>

  </body>
</html>