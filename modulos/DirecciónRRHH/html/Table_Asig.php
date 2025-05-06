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
            <h4 class="fw-bold py-3 mb-4"><span class="text-muted fw-light">Gestión de Presupuesto /</span> Asignaciones</h4>
            <div class="row">
              <!-- Tabla de Asignaciones -->
              <div class="col-md-12">
                <div class="card mb-4">
                  <h5 class="card-header">Tabla de Asignaciones</h5>
                  <div class="card-body">
                    <!-- Tabla -->
                    <div class="table-responsive text-nowrap">
                      <table class="table" id="assignmentsTable">
                        <thead>
                          <tr>
                            <th>N°</th>
                            <th>Nombre</th>
                            <th>Monto Bs</th>
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
                        <ul class="pagination justify-content-center" id="paginationAssignments">
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
          const rowsPerPage = 8;
          let currentPage = 1;
          let totalAssignments = 0;
          let totalPages = 1;
          const tableBody = document.querySelector('#assignmentsTable tbody');
          const paginationElement = document.getElementById('paginationAssignments');

          // Función para cargar las asignaciones desde la API
          async function fetchAssignments(page) {
              try {
                  const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_asig.php?page=${page}&per_page=${rowsPerPage}`);
                  const data = await response.json();
                  
                  if (data.success) {
                      totalAssignments = data.total;
                      totalPages = data.total_pages;
                      return data.assignments;
                  } else {
                      console.error('Error al cargar asignaciones:', data.message);
                      return [];
                  }
              } catch (error) {
                  console.error('Error en la solicitud:', error);
                  return [];
              }
          }

          // Función para obtener los datos completos de una asignación
          async function fetchAssignmentDetails(pri_ide) {
              try {
                  const response = await fetch(`../PHP/api/gest-presupuesto/tomar_asig.php?pri_ide=${pri_ide}`);
                  const data = await response.json();
                  
                  if (data.success) {
                      return data.assignment;
                  } else {
                      console.error('Error al cargar detalles:', data.message);
                      return null;
                  }
              } catch (error) {
                  console.error('Error en la solicitud:', error);
                  return null;
              }
          }

          // Función para mostrar las asignaciones en la página actual
          async function displayAssignments(page) {
              // Mostrar loader mientras carga
              tableBody.innerHTML = `
                  <tr>
                      <td colspan="4" class="text-center py-4">
                          <div class="spinner-border text-primary" role="status">
                              <span class="visually-hidden">Cargando...</span>
                          </div>
                      </td>
                  </tr>
              `;
              
              const assignments = await fetchAssignments(page);
              
              tableBody.innerHTML = '';
              
              if (assignments.length === 0) {
                  // Crear filas vacías para mantener la altura
                  for (let i = 0; i < rowsPerPage; i++) {
                      const row = document.createElement('tr');
                      if (i === 0) {
                          // Solo mostrar el mensaje en la primera fila
                          row.innerHTML = `
                              <td colspan="4" class="text-center empty-row">
                                  ${i === 0 ? 'No se encontraron asignaciones' : '&nbsp;'}
                              </td>
                          `;
                      } else {
                          // Filas vacías adicionales
                          row.innerHTML = '<td colspan="4" class="empty-row">&nbsp;</td>';
                      }
                      tableBody.appendChild(row);
                  }
                  return;
              }

              // Llenar con datos reales
              assignments.forEach((assignment, index) => {
                  const rowNumber = (page - 1) * rowsPerPage + index + 1;
                  const row = document.createElement('tr');
                  row.innerHTML = `
                      <td>${rowNumber}</td>
                      <td><strong>${assignment.pri_raz}</strong></td>
                      <td>${assignment.pri_por}</td>
                      <td>
                          <div class="dropdown">
                              <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                  <i class="bx bx-dots-vertical-rounded"></i>
                              </button>
                              <div class="dropdown-menu">
                                  <a class="dropdown-item edit-assignment-btn" href="javascript:void(0);" data-id="${assignment.pri_ide}">
                                      <i class="bx bx-edit-alt me-1"></i> Editar
                                  </a>
                                  <a class="dropdown-item delete-assignment-btn" href="javascript:void(0);" data-id="${assignment.pri_ide}" data-name="${assignment.pri_raz}">
                                      <i class="bx bx-trash me-1"></i> Eliminar
                                  </a>
                              </div>
                          </div>
                      </td>
                  `;
                  tableBody.appendChild(row);
              });

              // Completar con filas vacías si no llega a rowsPerPage
              if (assignments.length < rowsPerPage) {
                  const remainingRows = rowsPerPage - assignments.length;
                  for (let i = 0; i < remainingRows; i++) {
                      const row = document.createElement('tr');
                      row.innerHTML = '<td colspan="4" class="empty-row">&nbsp;</td>';
                      tableBody.appendChild(row);
                  }
              }

              // Dentro de displayAssignments, en el forEach que crea las filas:
              document.querySelectorAll('.edit-assignment-btn').forEach(btn => {
                  btn.addEventListener('click', async function() {
                      const pri_ide = this.getAttribute('data-id');
                      const assignmentData = await fetchAssignmentDetails(pri_ide);
                      if (assignmentData) {
                          openEditModal(assignmentData);
                      } else {
                          alert('No se pudieron cargar los datos de la asignación');
                      }
                  });
              });

              // Agregar event listeners para los botones de eliminar
              document.querySelectorAll('.delete-assignment-btn').forEach(btn => {
                  btn.addEventListener('click', function() {
                      const pri_ide = this.getAttribute('data-id');
                      const assignmentName = this.getAttribute('data-name');
                      showDeleteConfirmation(pri_ide, assignmentName);
                  });
              });
          }

          // Función para mostrar confirmación de eliminación
          function showDeleteConfirmation(pri_ide, assignmentName) {
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
                              <p>¿Seguro de eliminar la asignación <strong>${assignmentName}</strong>?</p>
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
                  await deleteAssignment(pri_ide);
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

          // Función para eliminar una asignación
          async function deleteAssignment(pri_ide) {
              try {
                  // Mostrar loader
                  const loadingIndicator = document.createElement('div');
                  loadingIndicator.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
                  loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
                  loadingIndicator.style.zIndex = '1060';
                  loadingIndicator.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Cargando...</span></div>';
                  document.body.appendChild(loadingIndicator);
                  
                  // Enviar solicitud de eliminación
                  const response = await fetch('../PHP/api/gest-presupuesto/eliminar_asig.php', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ pri_ide: pri_ide })
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
                      alert(result.message || 'Asignación eliminada correctamente');
                      // Recargar la tabla
                      displayAssignments(currentPage);
                  } else {
                      throw new Error(result.message || 'Error al eliminar la asignación');
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
                      displayAssignments(currentPage);
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
                      displayAssignments(currentPage);
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
                          displayAssignments(currentPage);
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
                      displayAssignments(currentPage);
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
                      displayAssignments(currentPage);
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

          // Función para abrir el modal de edición con datos de la asignación
        function openEditModal(assignment) {
            const editModal = new bootstrap.Modal(document.getElementById('ModalAsignaciones'));
            
            // Llenar los campos del modal con los datos de la asignación
            document.getElementById('asignacionId').value = assignment.pri_ide;
            document.getElementById('tipoAsignacion').value = assignment.pri_raz;
            document.getElementById('primaAsignacion').value = assignment.pri_por;
            
            // Configurar el botón de guardar
            const saveButton = document.getElementById('confirmEditAsignacion');
            saveButton.onclick = function() {
                saveAssignmentChanges(assignment.pri_ide);
            };
            
            // Mostrar el modal
            editModal.show();
        }

        // Función para guardar los cambios de la asignación
        async function saveAssignmentChanges(originalId) {
            const saveButton = document.getElementById('confirmEditAsignacion');
            const originalText = saveButton.innerHTML;
            
            // Mostrar spinner y deshabilitar botón
            saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
            saveButton.disabled = true;
            
            try {
                // Obtener los datos del formulario
                const updatedData = {
                    pri_ide: originalId,
                    pri_raz: document.getElementById('tipoAsignacion').value,
                    pri_por: document.getElementById('primaAsignacion').value
                };
                
                // Validación básica
                if (!updatedData.pri_raz || !updatedData.pri_por) {
                    alert('Por favor complete todos los campos requeridos');
                    return;
                }
                
                // Llamada a la API para guardar cambios
                const response = await fetch('../PHP/api/gest-presupuesto/actualizar_asig.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData)
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
                
                if (result.success) {
                    // Cerrar el modal
                    bootstrap.Modal.getInstance(document.getElementById('ModalAsignaciones')).hide();
                    
                    // Mostrar mensaje de éxito
                    alert('Cambios guardados exitosamente');
                    
                    // Recargar los datos
                    displayAssignments(currentPage);
                } else {
                    throw new Error(result.message || 'Error al guardar los cambios');
                }
            } catch (error) {
                console.error('Error al guardar:', error);
                alert('Error al guardar: ' + error.message);
            } finally {
                // Restaurar el botón
                saveButton.innerHTML = originalText;
                saveButton.disabled = false;
            }
        }

          // Inicializar la tabla y paginación
          displayAssignments(currentPage).then(() => {
              setupPagination();
              updatePaginationButtons();
          });
      });
    </script>

    <!-- Modal de Editar Asignaciones -->
    <div class="modal fade" id="ModalAsignaciones" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel1">Editar Asignación</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
            <input type="hidden" id="asignacionId">
            <div class="row">
            <div class="col mb-3">
                <label for="tipoAsignacion" class="form-label">Nombre de la Asignación</label>
                <input type="text" id="tipoAsignacion" class="form-control" placeholder="Prima por..." required />
            </div>
            </div>
            <div class="row">
            <div class="col mb-3">
                <label for="primaAsignacion" class="form-label">Valor de la Asignación</label>
                <input type="number" id="primaAsignacion" class="form-control" placeholder="Ej. 4.00" step="0.01" min="0" max="100" required />
            </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            Cerrar
            </button>
            <button type="button" class="btn btn-primary" id="confirmEditAsignacion">Confirmar Cambios</button>
        </div>
        </div>
    </div>
    </div>

  </body>
</html>
