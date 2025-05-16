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
            <h4 class="fw-bold py-3 mb-4"><span class="text-muted fw-light">Gestión de Presupuesto /</span>Histórico de Suplencias</h4>
            <div class="row">
              <!-- Tabla de Suplencias -->
              <div class="col-md-12">
                <div class="card mb-4">
                  <h5 class="card-header">Tabla de Suplencias (Histórico)</h5>
                  <div class="card-body">
                    <!-- Tabla de Suplencias -->
                    <div class="table-responsive text-nowrap fixed-height">
                      <table class="table" id="suplenciasTable">
                        <thead>
                          <tr>
                            <th>Cédula</th>
                            <th>Nombre</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Cargo CET</th>
                            <th>Cargo ONAPRE</th>
                            <th>Nivel Salarial</th>
                            <th>Departamento</th>
                            <th>Estado</th>
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
                        <ul class="pagination justify-content-center" id="paginationSuplencias">
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

    <!-- Funcionamiento de la tabla de Niveles Salariales -->
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // Variables para la paginación
        const rowsPerPage = 7;
        let currentPage = 1;
        let totalSuplencias = 0;
        let totalPages = 1;
        const tableBody = document.querySelector('#suplenciasTable tbody');
        const paginationElement = document.getElementById('paginationSuplencias');

        // Función para cargar las suplencias desde la API
        async function fetchSuplencias(page) {
            try {
                const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_suplencias-hist.php?page=${page}&per_page=${rowsPerPage}`);
                const data = await response.json();
                
                if (data.success) {
                    totalSuplencias = data.total;
                    totalPages = data.total_pages;
                    return {
                        suplencias: data.suplencias,
                        total: data.total,
                        total_pages: data.total_pages
                    };
                } else {
                    console.error('Error al cargar suplencias:', data.message);
                    return {
                        suplencias: [],
                        total: 0,
                        total_pages: 0
                    };
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                return {
                    suplencias: [],
                    total: 0,
                    total_pages: 0
                };
            }
        }

        // Función para mostrar las suplencias en la página actual
        async function displaySuplencias(page) {
            // Mostrar loader mientras carga
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </td>
                </tr>
            `;
            
            const result = await fetchSuplencias(page);
            const suplencias = result.suplencias;
            totalSuplencias = result.total;
            totalPages = result.total_pages;
            
            tableBody.innerHTML = '';
            
            if (suplencias.length === 0) {
                // Crear filas vacías para mantener la altura
                for (let i = 0; i < rowsPerPage; i++) {
                    const row = document.createElement('tr');
                    if (i === 0) {
                        row.innerHTML = `
                            <td colspan="10" class="text-center empty-row">
                                ${i === 0 ? 'No se encontraron registros' : '&nbsp;'}
                            </td>
                        `;
                    } else {
                        row.innerHTML = '<td colspan="10" class="empty-row">&nbsp;</td>';
                    }
                    tableBody.appendChild(row);
                }
                
                // Actualizar paginación para reflejar que no hay datos
                setupPagination();
                return;
            }

            // Llenar con datos reales
            suplencias.forEach(suplencia => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${suplencia.nom_ced}</td>
                    <td>${suplencia.nom_nom || 'No disponible'}</td>
                    <td>${formatDate(suplencia.sup_fec_ini)}</td>
                    <td>${suplencia.sup_fec_fin ? formatDate(suplencia.sup_fec_fin) : 'Activa'}</td>
                    <td>${suplencia.cet_car || 'No aplica'}</td>
                    <td>${suplencia.ona_car || 'No aplica'}</td>
                    <td>${suplencia.nvl_ran || 'No asignado'}</td>
                    <td>${suplencia.dep_nom || 'No asignado'}</td>
                    <td>
                        <span class="badge ${suplencia.sup_activa ? 'bg-label-success' : 'bg-label-secondary'}">
                            ${suplencia.sup_activa ? 'Activa' : 'Inactiva'}
                        </span>
                    </td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-suplencia-btn" href="javascript:void(0);" data-sup_ide="${suplencia.sup_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                                <a class="dropdown-item delete-suplencia-btn" href="javascript:void(0);" data-sup_ide="${suplencia.sup_ide}" 
                                  data-nom_nom="${suplencia.nom_nom || 'empleado'}" data-cargo="${suplencia.cet_car || suplencia.ona_car || 'cargo'}">
                                    <i class="bx bx-trash me-1"></i> Eliminar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Completar con filas vacías si no llega a rowsPerPage
            if (suplencias.length < rowsPerPage) {
                const remainingRows = rowsPerPage - suplencias.length;
                for (let i = 0; i < remainingRows; i++) {
                    const row = document.createElement('tr');
                    row.innerHTML = '<td colspan="10" class="empty-row">&nbsp;</td>';
                    tableBody.appendChild(row);
                }
            }

            // Configurar eventos para los botones
            setupEventListeners();
            
            // Actualizar paginación
            setupPagination();
        }

        // Función para formatear fechas
        function formatDate(dateString) {
            if (!dateString) return 'No definido';
            const date = new Date(dateString);
            return date.toLocaleDateString('es-VE');
        }

        // Función para configurar los event listeners
        function setupEventListeners() {
            // Agregar event listeners para los botones de editar
            document.querySelectorAll('.edit-suplencia-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const sup_ide = this.getAttribute('data-sup_ide');
                    try {
                        const response = await fetch(`../PHP/api/gest-presupuesto/detalles_suplencias-hist.php?sup_ide=${sup_ide}`);
                        const data = await response.json();
                        
                        if (data.success) {
                            openEditModal(data.suplencia);
                        } else {
                            alert('No se pudieron cargar los datos de la suplencia');
                        }
                    } catch (error) {
                        console.error('Error al cargar detalles:', error);
                        alert('Error al cargar los detalles de la suplencia');
                    }
                });
            });

            // Agregar event listeners para los botones de eliminar
            document.querySelectorAll('.delete-suplencia-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const sup_ide = this.getAttribute('data-sup_ide');
                    const nom_nom = this.getAttribute('data-nom_nom');
                    const cargo = this.getAttribute('data-cargo');
                    showDeleteConfirmation(sup_ide, nom_nom, cargo);
                });
            });
        }

        // Función para mostrar confirmación de eliminación
        function showDeleteConfirmation(sup_ide, nom_nom, cargo) {
            const modalHTML = `
            <div class="modal fade" id="deleteConfirmationModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-sm" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title text-danger">Confirmar Eliminación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>¿Seguro de eliminar la suplencia de <strong>${nom_nom}</strong> en el cargo <strong>${cargo}</strong>?</p>
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
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
            deleteModal.show();
            
            document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
                await deleteSuplencia(sup_ide);
                deleteModal.hide();
                document.getElementById('deleteConfirmationModal').remove();
            });
            
            document.getElementById('deleteConfirmationModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        }

        // Función para eliminar una suplencia
        async function deleteSuplencia(sup_ide) {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
            loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
            loadingIndicator.style.zIndex = '1060';
            loadingIndicator.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Cargando...</span></div>';
            document.body.appendChild(loadingIndicator);
            
            try {
                const response = await fetch('../PHP/api/gest-presupuesto/eliminar_suplencias-hist.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sup_ide: sup_ide })
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.message || `Error HTTP: ${response.status}`);
                }
                
                if (result.success) {
                    // Verificar si debemos cambiar de página
                    if (currentPage > 1 && (totalSuplencias - 1) <= ((currentPage - 1) * rowsPerPage)) {
                        currentPage--;
                    }
                    
                    // Recargar la tabla
                    await displaySuplencias(currentPage);
                    alert(result.message || 'Suplencia eliminada correctamente');
                } else {
                    throw new Error(result.message || 'Error al eliminar la suplencia');
                }
            } catch (error) {
                console.error('Error al eliminar:', error);
                alert('Error al eliminar: ' + error.message);
            } finally {
                loadingIndicator.remove();
            }
        }

        // Función para configurar la paginación
        function setupPagination() {
            paginationElement.innerHTML = '';
            
            if (totalPages <= 1) return;
            
            // Botón Primera página
            let li = document.createElement('li');
            li.className = 'page-item first' + (currentPage === 1 ? ' disabled' : '');
            li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-left"></i></a>`;
            li.addEventListener('click', () => {
                if (currentPage !== 1) {
                    currentPage = 1;
                    displaySuplencias(currentPage);
                }
            });
            paginationElement.appendChild(li);
            
            // Botón Página anterior
            li = document.createElement('li');
            li.className = 'page-item prev' + (currentPage === 1 ? ' disabled' : '');
            li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-left"></i></a>`;
            li.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displaySuplencias(currentPage);
                }
            });
            paginationElement.appendChild(li);
            
            // Números de página
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);
            
            for (let i = startPage; i <= endPage; i++) {
                li = document.createElement('li');
                li.className = 'page-item' + (i === currentPage ? ' active' : '');
                li.innerHTML = `<a class="page-link" href="javascript:void(0);">${i}</a>`;
                li.addEventListener('click', () => {
                    if (currentPage !== i) {
                        currentPage = i;
                        displaySuplencias(currentPage);
                    }
                });
                paginationElement.appendChild(li);
            }
            
            // Botón Página siguiente
            li = document.createElement('li');
            li.className = 'page-item next' + (currentPage === totalPages ? ' disabled' : '');
            li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-right"></i></a>`;
            li.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displaySuplencias(currentPage);
                }
            });
            paginationElement.appendChild(li);
            
            // Botón Última página
            li = document.createElement('li');
            li.className = 'page-item last' + (currentPage === totalPages ? ' disabled' : '');
            li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-right"></i></a>`;
            li.addEventListener('click', () => {
                if (currentPage !== totalPages) {
                    currentPage = totalPages;
                    displaySuplencias(currentPage);
                }
            });
            paginationElement.appendChild(li);
        }

        // Función para abrir el modal de edición con datos
        async function openEditModal(suplenciaData) {
            // Cargar los datos necesarios para el formulario
            const [empleados, cargosCET, cargosONAPRE, departamentos] = await Promise.all([
                fetchEmpleados(),
                fetchCargosCET(),
                fetchCargosONAPRE(),
                fetchDepartamentos()
            ]);

            if (!empleados || !cargosCET || !cargosONAPRE || !departamentos) {
                alert('No se pudieron cargar los datos necesarios para el formulario');
                return;
            }

            // Llenar los selects del formulario
            fillSelect(document.getElementById('empleadoSelect'), empleados, 'nom_ced', 'nom_nom', suplenciaData.nom_ced);
            fillSelect(document.getElementById('cargoCETSelect'), cargosCET, 'cet_ide', 'cet_car', suplenciaData.cet_ide);
            fillSelect(document.getElementById('cargoONAPRESelect'), cargosONAPRE, 'ona_ide', 'ona_car', suplenciaData.ona_ide);
            fillSelect(document.getElementById('departamentoSelect'), departamentos, 'dep_ide', 'dep_nom', suplenciaData.dep_ide);
            fillSelect(document.getElementById('nivelSalarialSelect'), [
                {value: 'I', text: 'I'}, 
                {value: 'II', text: 'II'}, 
                {value: 'III', text: 'III'}, 
                {value: 'IV', text: 'IV'}, 
                {value: 'V', text: 'V'}
            ], 'value', 'text', suplenciaData.nvl_ran);

            // Llenar los campos con los datos de la suplencia
            document.getElementById('fechaInicio').value = suplenciaData.sup_fec_ini || '';
            document.getElementById('fechaFin').value = suplenciaData.sup_fec_fin || '';
            document.getElementById('suplenciaActiva').checked = suplenciaData.sup_activa || false;

            // Configurar el botón de guardar
            const saveButton = document.querySelector('#ModalSuplencia .btn-primary');
            saveButton.onclick = async function() {
                await updateSuplencia(suplenciaData.sup_ide);
            };

            // Mostrar el modal
            const editModal = new bootstrap.Modal(document.getElementById('ModalSuplencia'));
            editModal.show();
        }

        // Función auxiliar para llenar selects
        function fillSelect(selectElement, items, valueField, textField, selectedValue) {
            selectElement.innerHTML = '<option value="">Seleccione</option>';
            
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = item[textField];
                if (selectedValue && item[valueField] == selectedValue) {
                    option.selected = true;
                }
                selectElement.appendChild(option);
            });
        }

        // Función para obtener los empleados
        async function fetchEmpleados() {
            try {
                const response = await fetch('../PHP/api/gest-presupuesto/carga_empleados.php');
                const data = await response.json();
                
                if (data.success) {
                    return data.empleados;
                } else {
                    console.error('Error al cargar empleados:', data.message);
                    return null;
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                return null;
            }
        }

        // Función para obtener los cargos CET
        async function fetchCargosCET() {
            try {
                const response = await fetch('../PHP/api/gest-presupuesto/carga_cargos_cet.php');
                const data = await response.json();
                
                if (data.success) {
                    return data.cargos;
                } else {
                    console.error('Error al cargar cargos CET:', data.message);
                    return null;
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                return null;
            }
        }

        // Función para obtener los cargos ONAPRE
        async function fetchCargosONAPRE() {
            try {
                const response = await fetch('../PHP/api/gest-presupuesto/carga_cargos_onapre.php');
                const data = await response.json();
                
                if (data.success) {
                    return data.cargos;
                } else {
                    console.error('Error al cargar cargos ONAPRE:', data.message);
                    return null;
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                return null;
            }
        }

        // Función para obtener los departamentos
        async function fetchDepartamentos() {
            try {
                const response = await fetch('../PHP/api/gest-presupuesto/carga_departamentos.php');
                const data = await response.json();
                
                if (data.success) {
                    return data.departamentos;
                } else {
                    console.error('Error al cargar departamentos:', data.message);
                    return null;
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                return null;
            }
        }

        // Función para actualizar una suplencia
        async function updateSuplencia(sup_ide) {
            const saveButton = document.querySelector('#ModalSuplencia .btn-primary');
            const originalText = saveButton.innerHTML;
            
            // Mostrar spinner y deshabilitar botón
            saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
            saveButton.disabled = true;
            
            try {
                // Obtener los datos del formulario
                const updatedData = {
                    sup_ide: sup_ide,
                    nom_ced: document.getElementById('empleadoSelect').value,
                    sup_fec_ini: document.getElementById('fechaInicio').value,
                    sup_fec_fin: document.getElementById('fechaFin').value || null,
                    cet_ide: document.getElementById('cargoCETSelect').value || null,
                    ona_ide: document.getElementById('cargoONAPRESelect').value || null,
                    nvl_ran: document.getElementById('nivelSalarialSelect').value || null,
                    dep_ide: document.getElementById('departamentoSelect').value || null,
                    sup_activa: document.getElementById('suplenciaActiva').checked ? 1 : 0
                };

                // Validación básica
                if (!updatedData.nom_ced || !updatedData.sup_fec_ini) {
                    alert('Por favor complete todos los campos requeridos');
                    return;
                }
                
                // Llamada a la API para guardar cambios
                const response = await fetch('../PHP/api/gest-presupuesto/actualizar_suplencias-hist.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Cerrar el modal
                    bootstrap.Modal.getInstance(document.getElementById('ModalSuplencia')).hide();
                    
                    // Mostrar mensaje de éxito
                    alert('Cambios guardados exitosamente');
                    
                    // Recargar los datos
                    displaySuplencias(currentPage);
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

        // Inicializar la tabla
        displaySuplencias(currentPage);
    });
    </script> 

    <!-- Modal de Editar Nivel Salarial-->
    <div class="modal fade" id="ModalNivelSalarial" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel1">Editar Nivel Salarial</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col mb-3">
                <label for="tipoNlvSalarial" class="form-label">Tipo de Nivel Salarial</label>
                <input type="text" id="tipoNlvSalarial" class="form-control" placeholder="Ej. I, II, III" />
              </div>
            </div>
            <div class="row">
              <div class="col mb-3">
                <label for="salarioAsig" class="form-label">Salario Correspondiente</label>
                <input type="number" id="salarioAsig" class="form-control" placeholder="Ej. 150.00" step="0.01" min="0" />
              </div>
            </div>
            <div class="row">
              <div class="col mb-3">
                <label for="OnapreAsig" class="form-label">Seleccionar cargo ONAPRE correspondiente</label>
                <select id="OnapreAsig" class="form-select">
                  <option value="">Seleccione</option>
                  <!-- Las opciones se llenarán dinámicamente -->
                </select>
              </div>
            </div>
            <!-- Fecha de Modificación -->
            <div class="mb-3">
              <label for="fechamodificacion" class="form-label">Fecha de Modificación</label>
              <input type="date" class="form-control" id="fechamodificacion" name="fechamodificacion" disabled required />
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
