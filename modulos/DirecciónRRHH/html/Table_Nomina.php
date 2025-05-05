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

    <script>
      document.addEventListener('DOMContentLoaded', function() {
          // Variables para la paginación
          const rowsPerPage = 7;
          let currentPage = 1;
          let totalWorkers = 0;
          let totalPages = 1;
          const tableBody = document.querySelector('#workersTable tbody');
          const paginationElement = document.getElementById('pagination');

          // Función para cargar los trabajadores desde la API
          async function fetchWorkers(page) {
              try {
                  const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_nomina.php?page=${page}&per_page=${rowsPerPage}`);
                  const data = await response.json();
                  
                  if (data.success) {
                      totalWorkers = data.total;
                      totalPages = data.total_pages;
                      return data.workers;
                  } else {
                      console.error('Error al cargar trabajadores:', data.message);
                      return [];
                  }
              } catch (error) {
                  console.error('Error en la solicitud:', error);
                  return [];
              }
          }

          // Función para obtener los datos completos de un trabajador
          async function fetchWorkerDetails(cedula) {
              try {
                  const response = await fetch(`../PHP/api/gest-presupuesto/carga-modal_edit_nomina.php?cedula=${cedula}`);
                  const data = await response.json();
                  
                  if (data.success) {
                      return data.worker;
                  } else {
                      console.error('Error al cargar detalles:', data.message);
                      return null;
                  }
              } catch (error) {
                  console.error('Error en la solicitud:', error);
                  return null;
              }
          }

          // Función para mostrar los trabajadores en la página actual
          async function displayWorkers(page) {
              // Mostrar loader mientras carga
              tableBody.innerHTML = `
                  <tr>
                      <td colspan="6" class="text-center py-4">
                          <div class="spinner-border text-primary" role="status">
                              <span class="visually-hidden">Cargando...</span>
                          </div>
                      </td>
                  </tr>
              `;
              
              const workers = await fetchWorkers(page);
              
              tableBody.innerHTML = '';
              
              if (workers.length === 0) {
                  // Crear filas vacías para mantener la altura
                  for (let i = 0; i < rowsPerPage; i++) {
                      const row = document.createElement('tr');
                      if (i === 0) {
                          // Solo mostrar el mensaje en la primera fila
                          row.innerHTML = `
                              <td colspan="6" class="text-center empty-row">
                                  ${i === 0 ? 'No se encontraron trabajadores' : '&nbsp;'}
                              </td>
                          `;
                      } else {
                          // Filas vacías adicionales
                          row.innerHTML = '<td colspan="6" class="empty-row">&nbsp;</td>';
                      }
                      tableBody.appendChild(row);
                  }
                  return;
              }

              // Llenar con datos reales
              workers.forEach(worker => {
                  const row = document.createElement('tr');
                  row.innerHTML = `
                      <td>${worker.cedula}</td>
                      <td><strong>${worker.nombres}</strong></td>
                      <td>${worker.apellidos}</td>
                      <td>${worker.genero}</td>
                      <td>${worker.departamento}</td>
                      <td>
                          <div class="dropdown">
                              <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                  <i class="bx bx-dots-vertical-rounded"></i>
                              </button>
                              <div class="dropdown-menu">
                                  <a class="dropdown-item edit-worker-btn" href="javascript:void(0);" data-cedula="${worker.cedula}">
                                      <i class="bx bx-edit-alt me-1"></i> Editar
                                  </a>
                                  <a class="dropdown-item delete-worker-btn" href="javascript:void(0);" data-cedula="${worker.cedula}">
                                      <i class="bx bx-trash me-1"></i> Eliminar
                                  </a>
                              </div>
                          </div>
                      </td>
                  `;
                  tableBody.appendChild(row);
              });

              // Completar con filas vacías si no llega a rowsPerPage
              if (workers.length < rowsPerPage) {
                  const remainingRows = rowsPerPage - workers.length;
                  for (let i = 0; i < remainingRows; i++) {
                      const row = document.createElement('tr');
                      row.innerHTML = '<td colspan="6" class="empty-row">&nbsp;</td>';
                      tableBody.appendChild(row);
                  }
              }

              // Agregar event listeners para los botones de editar
              document.querySelectorAll('.edit-worker-btn').forEach(btn => {
                  btn.addEventListener('click', async function() {
                      const cedula = this.getAttribute('data-cedula');
                      const workerData = await fetchWorkerDetails(cedula);
                      if (workerData) {
                          openEditModal(workerData);
                      } else {
                          alert('No se pudieron cargar los datos del trabajador');
                      }
                  });
              });

              // Agregar event listeners para los botones de eliminar
              document.querySelectorAll('.delete-worker-btn').forEach(btn => {
                  btn.addEventListener('click', function() {
                      const cedula = this.getAttribute('data-cedula');
                      const nombreCompleto = this.getAttribute('data-nombre');
                      showDeleteConfirmation(cedula, nombreCompleto);
                  });
              });
          }

          // Función para mostrar confirmación de eliminación
          function showDeleteConfirmation(cedula, nombreCompleto) {
              // Crear modal de confirmación
              const modalHTML = `
              <div class="modal fade" id="deleteConfirmationModal" tabindex="-1" aria-hidden="true">
                  <div class="modal-dialog modal-sm" role="document">
                      <div class="modal-content">
                          <div class="modal-header">
                              <h5 class="modal-title text-danger">Confirmar Eliminación</h5>
                              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div class="modal-body">
                              <p>¿Seguro de eliminar a <strong>${nombreCompleto}</strong> (C.I. ${cedula}) de la nómina?</p>
                              <p class="text-danger">¡Este cambio no se puede deshacer!</p>
                          </div>
                          <div class="modal-footer">
                              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                  Cancelar
                              </button>
                              <button type="button" class="btn btn-danger" id="confirmDeleteBtn">
                                  Sí, Eliminar
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
              `;
              
              // Agregar el modal al DOM
              document.body.insertAdjacentHTML('beforeend', modalHTML);
              
              // Mostrar el modal
              const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
              deleteModal.show();
              
              // Configurar evento para el botón de confirmación
              document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
                  await deleteWorker(cedula);
                  deleteModal.hide();
                  // Eliminar el modal del DOM después de cerrarse
                  document.getElementById('deleteConfirmationModal').addEventListener('hidden.bs.modal', function() {
                      this.remove();
                  });
                  deleteModal.hide();
              });
              
              // Eliminar el modal del DOM si se cierra sin confirmar
              document.getElementById('deleteConfirmationModal').addEventListener('hidden.bs.modal', function() {
                  this.remove();
              });
          }

          // Función para eliminar un trabajador
          async function deleteWorker(cedula) {
              try {
                  // Mostrar loader
                  const loadingIndicator = document.createElement('div');
                  loadingIndicator.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
                  loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
                  loadingIndicator.style.zIndex = '1060';
                  loadingIndicator.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Cargando...</span></div>';
                  document.body.appendChild(loadingIndicator);
                  
                  // Enviar solicitud de eliminación
                  const response = await fetch('../PHP/api/gest-presupuesto/eliminar-user_nomina.php', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ cedula: cedula })
                  });
                  
                  // Verificar si la respuesta es JSON válido
                  let result;
                  try {
                      result = await response.json();
                  } catch (jsonError) {
                      throw new Error('La respuesta del servidor no es JSON válido');
                  }
                  
                  // Verificar el estado HTTP
                  if (!response.ok) {
                      throw new Error(result.message || `Error HTTP: ${response.status}`);
                  }
                  
                  // Eliminar loader
                  loadingIndicator.remove();
                  
                  if (result.success) {
                      // Mostrar mensaje de éxito
                      alert(result.message || 'Trabajador eliminado correctamente');
                      // Recargar la tabla
                      displayWorkers(currentPage);
                  } else {
                      throw new Error(result.message || 'Error al eliminar el trabajador');
                  }
              } catch (error) {
                  console.error('Error al eliminar:', error);
                  
                  // Eliminar loader si aún existe
                  if (loadingIndicator && loadingIndicator.parentNode) {
                      loadingIndicator.remove();
                  }
                  
                  alert('Error al eliminar: ' + error.message);
              }
          }

          // Función para abrir el modal de edición con datos completos
          function openEditModal(worker) {
              const editModal = new bootstrap.Modal(document.getElementById('largeModal'));
              
              // Llenar datos personales
              document.getElementById('cedula').value = worker.cedula || '';
              document.getElementById('nombre').value = worker.nombres || '';
              document.getElementById('apellidos').value = worker.apellidos || '';
              document.getElementById('fechaingreso').value = worker.fecha_ingreso || '';
              document.getElementById('numerohijos').value = worker.num_hijos || 0;
              
              // Establecer género
              if (worker.genero === 'M' || worker.genero === 'Masculino') {
                  document.getElementById('generoMasculino').checked = true;
              } else if (worker.genero === 'F' || worker.genero === 'Femenino') {
                  document.getElementById('generoFemenino').checked = true;
              }
              
              // Llenar datos del área (ajusta según tu estructura de BD)
              if (worker.cargo_cet) {
                  document.getElementById('cargocet').value = worker.cargo_cet;
              }
              if (worker.cargo_onapre) {
                  document.getElementById('cargoonapre').value = worker.cargo_onapre;
              }
              if (worker.dep_ide) {
                  document.getElementById('departamentoasig').value = worker.dep_ide;
              }
              
              // Configurar el botón de guardar
              const saveButton = document.querySelector('#largeModal .btn-primary');
              saveButton.onclick = function() {
                  saveWorkerChanges(worker.cedula);
              };
              
              // Mostrar el modal
              editModal.show();
          }

          // Función para guardar los cambios del trabajador
          async function saveWorkerChanges(originalCedula) {
              const saveButton = document.querySelector('#largeModal .btn-primary');
              const originalText = saveButton.innerHTML;
              
              // Mostrar spinner y deshabilitar botón
              saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
              saveButton.disabled = true;
              
              try {
                  // Obtener los datos del formulario
                  const updatedData = {
                      cedula_original: originalCedula,
                      cedula: document.getElementById('cedula').value,
                      nombres: document.getElementById('nombre').value,
                      apellidos: document.getElementById('apellidos').value,
                      fecha_ingreso: document.getElementById('fechaingreso').value,
                      genero: document.querySelector('input[name="generoEmpleado"]:checked')?.value || '',
                      num_hijos: document.getElementById('numerohijos').value,
                      cargo_cet: document.getElementById('cargocet').value,
                      cargo_onapre: document.getElementById('cargoonapre').value,
                      dep_ide: document.getElementById('departamentoasig').value
                  };
                  
                  // Validación básica
                  if (!updatedData.nombres || !updatedData.apellidos || !updatedData.cedula) {
                      alert('Por favor complete todos los campos requeridos');
                      return;
                  }
                  
                  // Llamada a la API para guardar cambios
                  const response = await fetch('../PHP/api/gest-presupuesto/actualizar-user_nomina.php', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(updatedData)
                  });
                  
                  const result = await response.json();
                  
                  if (result.success) {
                      // Cerrar el modal
                      bootstrap.Modal.getInstance(document.getElementById('largeModal')).hide();
                      
                      // Mostrar mensaje de éxito
                      alert('Cambios guardados exitosamente');
                      
                      // Recargar los datos
                      displayWorkers(currentPage);
                  } else {
                      alert('Error al guardar: ' + (result.message || 'Error desconocido'));
                  }
              } catch (error) {
                  console.error('Error al guardar:', error);
                  alert('Error al conectar con el servidor');
              } finally {
                  // Restaurar el botón
                  saveButton.innerHTML = originalText;
                  saveButton.disabled = false;
              }
          }



          // Función para configurar la paginación
          function setupPagination() {
              paginationElement.innerHTML = '';
              
              // Botón Primera página
              let li = document.createElement('li');
              li.className = 'page-item first';
              li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-left"></i></a>`;
              li.addEventListener('click', () => {
                  if (currentPage !== 1) {
                      currentPage = 1;
                      displayWorkers(currentPage);
                      updatePaginationButtons();
                  }
              });
              paginationElement.appendChild(li);
              
              // Botón Página anterior
              li = document.createElement('li');
              li.className = 'page-item prev';
              li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-left"></i></a>`;
              li.addEventListener('click', () => {
                  if (currentPage > 1) {
                      currentPage--;
                      displayWorkers(currentPage);
                      updatePaginationButtons();
                  }
              });
              paginationElement.appendChild(li);
              
              // Números de página (mostramos máximo 5 páginas alrededor de la actual)
              const startPage = Math.max(1, currentPage - 2);
              const endPage = Math.min(totalPages, currentPage + 2);
              
              for (let i = startPage; i <= endPage; i++) {
                  li = document.createElement('li');
                  li.className = 'page-item';
                  if (i === currentPage) li.classList.add('active');
                  li.innerHTML = `<a class="page-link" href="javascript:void(0);">${i}</a>`;
                  li.addEventListener('click', () => {
                      if (currentPage !== i) {
                          currentPage = i;
                          displayWorkers(currentPage);
                          updatePaginationButtons();
                      }
                  });
                  paginationElement.appendChild(li);
              }
              
              // Botón Página siguiente
              li = document.createElement('li');
              li.className = 'page-item next';
              li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-right"></i></a>`;
              li.addEventListener('click', () => {
                  if (currentPage < totalPages) {
                      currentPage++;
                      displayWorkers(currentPage);
                      updatePaginationButtons();
                  }
              });
              paginationElement.appendChild(li);
              
              // Botón Última página
              li = document.createElement('li');
              li.className = 'page-item last';
              li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-right"></i></a>`;
              li.addEventListener('click', () => {
                  if (currentPage !== totalPages) {
                      currentPage = totalPages;
                      displayWorkers(currentPage);
                      updatePaginationButtons();
                  }
              });
              paginationElement.appendChild(li);
          }
          
          // Función para actualizar el estado de los botones de paginación
          function updatePaginationButtons() {
              const pageItems = paginationElement.querySelectorAll('.page-item');
              
              // Remover clase active de todos los items
              pageItems.forEach(item => {
                  item.classList.remove('active');
              });
              
              // Agregar clase active al item correspondiente
              pageItems.forEach(item => {
                  const pageLink = item.querySelector('.page-link');
                  if (pageLink && pageLink.textContent === currentPage.toString()) {
                      item.classList.add('active');
                  }
              });
              
              // Actualizar estado de los botones de navegación
              const firstBtn = paginationElement.querySelector('.first');
              const prevBtn = paginationElement.querySelector('.prev');
              const nextBtn = paginationElement.querySelector('.next');
              const lastBtn = paginationElement.querySelector('.last');
              
              if (currentPage === 1) {
                  firstBtn.classList.add('disabled');
                  prevBtn.classList.add('disabled');
              } else {
                  firstBtn.classList.remove('disabled');
                  prevBtn.classList.remove('disabled');
              }
              
              if (currentPage === totalPages) {
                  nextBtn.classList.add('disabled');
                  lastBtn.classList.add('disabled');
              } else {
                  nextBtn.classList.remove('disabled');
                  lastBtn.classList.remove('disabled');
              }
          }

          // Inicializar la tabla y paginación
          displayWorkers(currentPage).then(() => {
              setupPagination();
              updatePaginationButtons();
          });
      });
    </script>

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
