document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación
    const rowsPerPage = 7;
    let currentPage = 1;
    let totalWorkers = 0;
    let totalPages = 1;
    const tableBody = document.querySelector('#workersTable tbody');
    const paginationElement = document.getElementById('pagination');

    // Variables para búsqueda global
    let allWorkers = [];
    let isSearching = false;
    let currentSearchTerm = '';

    // Variables para el control de actualización en tiempo real
    let lastUpdateTimestamp = null;
    let updateInterval = 1000; // 1 segundos
    let updateTimer = null;
    let isUpdating = false;

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

    // Función para cargar TODOS los trabajadores desde la API (para búsqueda)
    async function fetchAllWorkers() {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_nomina.php?all=true`);
            const data = await response.json();
            
            if (data.success) {
                allWorkers = data.workers;
                return data.workers;
            } else {
                console.error('Error al cargar todos los trabajadores:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return [];
        }
    }

    // Función para cargar los trabajadores paginados desde la API
    async function fetchWorkers(page) {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_nomina.php?page=${page}&per_page=${rowsPerPage}`);
            const data = await response.json();
            
            if (data.success) {
                totalWorkers = data.total;
                totalPages = data.total_pages;
                return {
                    workers: data.workers,
                    total: data.total,
                    total_pages: data.total_pages
                };
            } else {
                console.error('Error al cargar trabajadores:', data.message);
                return {
                    workers: [],
                    total: 0,
                    total_pages: 0
                };
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return {
                workers: [],
                total: 0,
                total_pages: 0
            };
        }
    }

    // Función para filtrar trabajadores localmente
    function filterWorkersLocally(workers, searchTerm) {
        if (!searchTerm) return workers;
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        return workers.filter(worker => {
            return (
                (worker.cedula && worker.cedula.toLowerCase().includes(lowerSearchTerm)) ||
                (worker.nombres && worker.nombres.toLowerCase().includes(lowerSearchTerm)) ||
                (worker.apellidos && worker.apellidos.toLowerCase().includes(lowerSearchTerm)) ||
                (worker.genero && worker.genero.toLowerCase().includes(lowerSearchTerm)) ||
                (worker.departamento && worker.departamento.toLowerCase().includes(lowerSearchTerm))
            );
        });
    }

    // Función para mostrar los trabajadores en la página actual
    async function displayWorkers(page, workersToDisplay = null) {
        const isFiltered = workersToDisplay !== null;

        const actionsHeader = document.querySelector('#actionsColumnHeader');
        if (LOGGED_USER_TYPE === '0' || LOGGED_USER_TYPE === '1') {
            actionsHeader.style.display = 'none';
        } else {
            actionsHeader.style.display = '';
        }

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
        
        let workers = [];
        if (isFiltered) {
            workers = workersToDisplay;
            totalWorkers = workers.length;
            totalPages = Math.ceil(workers.length / rowsPerPage);
        } else {
            const result = await fetchWorkers(page);
            workers = result.workers;
            totalWorkers = result.total;
            totalPages = result.total_pages;
        }
        
        // Pequeño retraso para evitar parpadeo con cargas rápidas
        await new Promise(resolve => setTimeout(resolve, 200));
        
        tableBody.innerHTML = '';
        
        if (workers.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < rowsPerPage; i++) {
                const row = document.createElement('tr');
                if (i === 0) {
                    row.innerHTML = `
                        <td colspan="6" class="text-center empty-row">
                            ${isFiltered ? 'No se encontraron coincidencias' : 'No se encontraron trabajadores'}
                        </td>
                    `;
                } else {
                    row.innerHTML = '<td colspan="6" class="empty-row">&nbsp;</td>';
                }
                tableBody.appendChild(row);
            }
            
            // Actualizar paginación para reflejar que no hay datos
            setupPagination();
            return;
        }

        // Llenar con datos reales
        workers.forEach(worker => {
            const row = document.createElement('tr');
            
            // Determinar qué mostrar en la columna de acciones según el tipo de usuario
            let actionsHtml = '';
            
            if (LOGGED_USER_TYPE === '0' || LOGGED_USER_TYPE === '1') {
                // Caso 1: No mostrar columna de acciones
                row.innerHTML = `
                    <td><strong>${worker.cedula}</strong></td>
                    <td>${worker.nombres}</td>
                    <td>${worker.apellidos}</td>
                    <td>${worker.genero}</td>
                    <td>${worker.departamento}</td>
                    <td></td> <!-- Columna vacía -->
                `;
            } else if (LOGGED_USER_TYPE === '2') {
                // Caso 2: Mostrar solo editar
                row.innerHTML = `
                    <td><strong>${worker.cedula}</strong></td>
                    <td>${worker.nombres}</td>
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
                            </div>
                        </div>
                    </td>
                `;
            } else {
                // Caso 3: Mostrar todo (tipos 3 y 4)
                row.innerHTML = `
                    <td><strong>${worker.cedula}</strong></td>
                    <td>${worker.nombres}</td>
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
            }
            
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

        // Configurar eventos para los botones
        setupEventListeners();
        
        // Actualizar paginación
        setupPagination();
    }

    // Función para configurar el buscador
    function setupSearch() {
        const searchInput = document.getElementById('workersSearch');
        let searchTimeout;
        
        // Cargar todos los registros al iniciar para búsquedas
        fetchAllWorkers();
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            
            const searchTerm = this.value.trim();
            currentSearchTerm = searchTerm;
            
            if (searchTerm.length === 0) {
                // Si el buscador está vacío, volver a la paginación normal
                isSearching = false;
                currentPage = 1;
                displayWorkers(currentPage);
                paginationElement.style.display = '';
                return;
            }
            
            // Pequeño retraso para no hacer búsquedas con cada tecla
            searchTimeout = setTimeout(async () => {
                isSearching = true;
                
                // Mostrar loader
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Buscando...</span>
                            </div>
                        </td>
                    </tr>
                `;
                
                // Si no tenemos todos los registros cargados, intentar cargarlos
                if (allWorkers.length === 0) {
                    allWorkers = await fetchAllWorkers();
                }
                
                // Filtrar localmente con todos los datos
                const filtered = filterWorkersLocally(allWorkers, searchTerm);
                displayWorkers(1, filtered);
                paginationElement.style.display = filtered.length > rowsPerPage ? '' : 'none';
            }, 300);
        });
        
        // Restaurar paginación si se borra la búsqueda
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Escape' || this.value.trim() === '') {
                this.value = '';
                isSearching = false;
                currentPage = 1;
                displayWorkers(currentPage);
                paginationElement.style.display = '';
            }
        });
    }

    // Función para configurar los event listeners
    function setupEventListeners() {
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
                showDeleteConfirmation(cedula);
            });
        });
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

    // Función para mostrar confirmación de eliminación
    function showDeleteConfirmation(cedula) {
        // Verificar si el usuario está intentando eliminarse a sí mismo
        if (typeof LOGGED_USER_CI !== 'undefined' && cedula === LOGGED_USER_CI) {
            const selfDeleteModalHTML = `
            <div class="modal fade" id="selfDeleteModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-sm" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-warning">
                            <h5 class="modal-title text-white">Acción no permitida</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-3">
                                <i class="bx bx-error-circle text-warning" style="font-size: 3rem;"></i>
                            </div>
                            <p class="text-center">No puede eliminarse a sí mismo del sistema.</p>
                            <p class="text-center text-muted">Por razones de seguridad, esta acción está restringida.</p>
                        </div>
                        <div class="modal-footer justify-content-center">
                            <button type="button" class="btn btn-warning text-white" data-bs-dismiss="modal">
                                <i class="bx bx-check-circle me-1"></i> Entendido
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', selfDeleteModalHTML);
            
            const selfDeleteModal = new bootstrap.Modal(document.getElementById('selfDeleteModal'));
            selfDeleteModal.show();
            
            document.getElementById('selfDeleteModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
            
            return;
        }
        
        // Si no es auto-eliminación, mostrar el modal normal de confirmación
        const modalHTML = `
        <div class="modal fade" id="deleteConfirmationModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">Confirmar Eliminación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>¿Seguro de eliminar al usuario con (C.I. ${cedula}) de la nómina?</p>
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
            await deleteWorker(cedula);
            deleteModal.hide();
            document.getElementById('deleteConfirmationModal').remove();
        });
        
        document.getElementById('deleteConfirmationModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Función para eliminar un trabajador
    async function deleteWorker(cedula) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
        loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
        loadingIndicator.style.zIndex = '1060';
        loadingIndicator.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Cargando...</span></div>';
        document.body.appendChild(loadingIndicator);
        
        try {
            const response = await fetch('../PHP/api/gest-presupuesto/eliminar-user_nomina.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cedula: cedula })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `Error HTTP: ${response.status}`);
            }
            
            if (result.success) {
                // Verificar si debemos cambiar de página
                if (currentPage > 1 && (totalWorkers - 1) <= ((currentPage - 1) * rowsPerPage)) {
                    currentPage--;
                }
                
                // Recargar la tabla
                if (isSearching) {
                    // Si estamos en modo búsqueda, recargar todos los datos y volver a filtrar
                    allWorkers = await fetchAllWorkers();
                    const filtered = filterWorkersLocally(allWorkers, currentSearchTerm);
                    displayWorkers(1, filtered);
                } else {
                    // Si no, recargar la página actual normalmente
                    await displayWorkers(currentPage);
                }
                alert(result.message || 'Trabajador eliminado correctamente');
            } else {
                throw new Error(result.message || 'Error al eliminar el trabajador');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar: ' + error.message);
        } finally {
            loadingIndicator.remove();
        }
    }

    // Función para abrir el modal de edición con datos completos
    function openEditModal(worker) {
        const editModal = new bootstrap.Modal(document.getElementById('largeModal'));
        
        // Limpiar validaciones previas
        $('#largeModal input').off('input keypress');
        $('#largeModal select').off('change');
        
        // Configurar campos con los datos del trabajador
        document.getElementById('cedula').value = worker.cedula || '';
        document.getElementById('nombre').value = worker.nombres || '';
        document.getElementById('apellidos').value = worker.apellidos || '';
        document.getElementById('fechaingreso').value = worker.fecha_ingreso || '';
        document.getElementById('numerohijos').value = worker.num_hijos || 0;
        
        if (worker.genero === 'M' || worker.genero === 'Masculino') {
            document.getElementById('generoMasculino').checked = true;
        } else if (worker.genero === 'F' || worker.genero === 'Femenino') {
            document.getElementById('generoFemenino').checked = true;
        }
        
        if (worker.cargo_cet) {
            document.getElementById('cargocet').value = worker.cargo_cet;
        }
        if (worker.cargo_onapre) {
            document.getElementById('cargoonapre').value = worker.cargo_onapre;
        }
        if (worker.nvl_ran) {
            document.getElementById('nivelsalarial').value = worker.nvl_ran;
        }
        if (worker.nom_pro) {
            document.getElementById('nivelprof').value = worker.nom_pro;
        }
        if (worker.dep_ide) {
            document.getElementById('departamentoasig').value = worker.dep_ide;
        }
        
        // Configurar validaciones
        // Validación para la cédula (solo números, máximo 10 caracteres)
        $('#cedula').on('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
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
                alert('La fecha de ingreso no puede ser mayor a la fecha actual');
                this.value = worker.fecha_ingreso || ''; // Restaurar valor anterior
            }
        });

        // Configurar el botón de guardar
        const saveButton = document.querySelector('#largeModal .btn-primary');
        saveButton.onclick = function() {
            if (validateForm()) {
                saveWorkerChanges(worker.cedula);
            }
        };
        
        editModal.show();
    }

    // Función para guardar los cambios del trabajador
    async function saveWorkerChanges(originalCedula) {
        const saveButton = document.querySelector('#largeModal .btn-primary');
        const originalText = saveButton.innerHTML;
        
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        saveButton.disabled = true;
        
        try {
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
                nvl_ran: document.getElementById('nivelsalarial').value,
                nom_pro: document.getElementById('nivelprof').value,
                dep_ide: document.getElementById('departamentoasig').value
            };
            
            // Validación adicional por si acaso
            if (!updatedData.nombres || !updatedData.apellidos || !updatedData.cedula) {
                alert('Por favor complete todos los campos requeridos');
                return;
            }
            
            const response = await fetch('../PHP/api/gest-presupuesto/actualizar-user_nomina.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                bootstrap.Modal.getInstance(document.getElementById('largeModal')).hide();
                alert('Cambios guardados exitosamente');
                
                // Recargar los datos
                if (isSearching) {
                    allWorkers = await fetchAllWorkers();
                    const filtered = filterWorkersLocally(allWorkers, currentSearchTerm);
                    displayWorkers(1, filtered);
                } else {
                    await displayWorkers(currentPage);
                }
            } else {
                alert('Error al guardar: ' + (result.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al conectar con el servidor: ' + error.message);
        } finally {
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
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
                if (isSearching) {
                    const filtered = filterWorkersLocally(allWorkers, currentSearchTerm);
                    displayWorkers(1, filtered);
                } else {
                    displayWorkers(currentPage);
                }
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
                if (isSearching) {
                    const filtered = filterWorkersLocally(allWorkers, currentSearchTerm);
                    displayWorkers(currentPage, filtered);
                } else {
                    displayWorkers(currentPage);
                }
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
                    if (isSearching) {
                        const filtered = filterWorkersLocally(allWorkers, currentSearchTerm);
                        displayWorkers(currentPage, filtered);
                    } else {
                        displayWorkers(currentPage);
                    }
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
                if (isSearching) {
                    const filtered = filterWorkersLocally(allWorkers, currentSearchTerm);
                    displayWorkers(currentPage, filtered);
                } else {
                    displayWorkers(currentPage);
                }
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
                if (isSearching) {
                    const filtered = filterWorkersLocally(allWorkers, currentSearchTerm);
                    displayWorkers(currentPage, filtered);
                } else {
                    displayWorkers(currentPage);
                }
            }
        });
        paginationElement.appendChild(li);
    }

    // Función para validar el formulario completo
    function validateForm() {
        let isValid = true;
        
        // Validar cédula (requerida y exactamente entre 6 y 10 dígitos)
        const cedula = $('#cedula').val();
        if (!cedula || cedula.length < 6 || cedula.length > 10) {
            alert('La cédula debe tener entre 6 y 10 dígitos');
            $('#cedula').focus();
            return false;
        }
        
        // Validar nombres (requerido)
        if (!$('#nombre').val()) {
            alert('Por favor ingrese los nombres del trabajador');
            $('#nombre').focus();
            return false;
        }
        
        // Validar apellidos (requerido)
        if (!$('#apellidos').val()) {
            alert('Por favor ingrese los apellidos del trabajador');
            $('#apellidos').focus();
            return false;
        }
        
        // Validar género
        if (!$('input[name="generoEmpleado"]:checked').val()) {
            alert('Por favor seleccione el género del empleado');
            return false;
        }
        
        // Validar selects (que no sea la opción por defecto)
        const selects = ['#cargocet', '#cargoonapre', '#nivelsalarial', '#nivelprof', '#departamentoasig'];
        for (const select of selects) {
            if (!$(select).val()) {
                alert(`Por favor seleccione una opción válida para ${$(select).prev('label').text()}`);
                $(select).focus();
                return false;
            }
        }
        
        return isValid;
    }

    // Función para verificar cambios en bit_nom
    async function checkForUpdates() {
        if (isUpdating) return;
        isUpdating = true;
        
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/check_nomina_updates.php?last_update=${lastUpdateTimestamp || ''}`);
            const data = await response.json();
            
            if (data.success && data.has_changes) {
                lastUpdateTimestamp = data.last_update;
                
                // Actualizar la tabla con animación suave
                await smoothUpdateTable();
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones:', error);
        } finally {
            isUpdating = false;
        }
    }

    // Función para actualizar la tabla con animación suave
    async function smoothUpdateTable() {
        // Agregar clase de transición a la tabla
        const table = document.getElementById('workersTable');
        table.classList.add('table-updating');
        
        // Mostrar indicador de actualización
        const updateIndicator = document.createElement('div');
        table.parentNode.insertBefore(updateIndicator, table);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Recargar datos
        if (isSearching) {
            allWorkers = await fetchAllWorkers();
            const filtered = filterWorkersLocally(allWorkers, currentSearchTerm);
            await displayWorkers(currentPage, filtered);
        } else {
            await displayWorkers(currentPage);
        }
        
        // Ocultar indicador y quitar clase de transición
        updateIndicator.remove();
        table.classList.remove('table-updating');
        
        // Mostrar notificación de actualización
        showUpdateNotification();
    }

    // Función para mostrar notificación de actualización
    function showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = 'Trabajadores en Nómina actualizados <i class="bx bx-check"></i>';
        
        document.body.appendChild(notification);
        
        // Mostrar y luego desaparecer
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }, 100);
    }

    // Iniciar el sistema de actualización periódica
    function startUpdateChecker() {
        // Verificar actualizaciones inmediatamente
        checkForUpdates();
        
        // Configurar intervalo periódico
        updateTimer = setInterval(checkForUpdates, updateInterval);
        
        // También verificar cuando la ventana gana foco
        window.addEventListener('focus', checkForUpdates);
    }

    // Detener el sistema de actualización (para cuando se cierra la página, etc.)
    function stopUpdateChecker() {
        if (updateTimer) {
            clearInterval(updateTimer);
        }
        window.removeEventListener('focus', checkForUpdates);
    }

    // Inicializar la tabla, paginación y buscador
    displayWorkers(currentPage).then(() => {
        setupSearch();
    });

    // Iniciar el sistema de actualización en tiempo real
    startUpdateChecker();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', stopUpdateChecker);
});