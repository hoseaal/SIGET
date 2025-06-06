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

    // Funcionamiento de estilos
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
            smallSwal.fire({
                icon: 'warning',
                title: 'Acción no permitida',
                html: 'No puede eliminarse a sí mismo del sistema.<br><small class="text-muted">Por razones de seguridad, esta acción está restringida.</small>',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            return;
        }
        
        // Si no es auto-eliminación, mostrar el modal de confirmación
        smallSwal.fire({
            title: 'Confirmar Eliminación',
            html: `¿Seguro de eliminar al usuario con <strong>C.I. ${cedula}</strong> de la nómina?<br><small class="text-danger">¡Este cambio no se puede deshacer!</small>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, Eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteWorker(cedula);
            }
        });
    }

    // Función para eliminar un trabajador
    async function deleteWorker(cedula) {
        // Mostrar loader
        smallSwal.fire({
            title: 'Eliminando trabajador',
            html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%; height: 100%;"></div></div>',
            width: 350,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                smallSwal.showLoading();
            }
        });

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
                    allWorkers = await fetchAllWorkers();
                    const filtered = filterWorkersLocally(allWorkers, currentSearchTerm);
                    displayWorkers(1, filtered);
                } else {
                    await displayWorkers(currentPage);
                }
                
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: result.message || 'Trabajador eliminado correctamente',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                throw new Error(result.message || 'Error al eliminar el trabajador');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error al eliminar',
                text: error.message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
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
        // Mostrar loader
        smallSwal.fire({
            title: 'Guardando cambios',
            html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%; height: 100%;"></div></div>',
            width: 350,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                smallSwal.showLoading();
            }
        });

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
                smallSwal.fire({
                    icon: 'error',
                    title: 'Campos requeridos',
                    text: 'Por favor complete todos los campos requeridos',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
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
                
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'Cambios guardados exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar los datos
                    if (isSearching) {
                        allWorkers = await fetchAllWorkers();
                        const filtered = filterWorkersLocally(allWorkers, currentSearchTerm);
                        displayWorkers(1, filtered);
                    } else {
                        displayWorkers(currentPage);
                    }
                });
            } else {
                throw new Error(result.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: error.message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
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
        // Validar cédula (requerida y exactamente entre 6 y 10 dígitos)
        const cedula = $('#cedula').val();
        if (!cedula || cedula.length < 6 || cedula.length > 10) {
            smallSwal.fire({
                icon: 'error',
                title: 'Cédula inválida',
                text: 'La cédula debe tener entre 6 y 10 dígitos',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            $('#cedula').focus();
            return false;
        }
        
        // Validar nombres (requerido)
        if (!$('#nombre').val()) {
            smallSwal.fire({
                icon: 'error',
                title: 'Nombres requeridos',
                text: 'Por favor ingrese los nombres del trabajador',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            $('#nombre').focus();
            return false;
        }
        
        // Validar apellidos (requerido)
        if (!$('#apellidos').val()) {
            smallSwal.fire({
                icon: 'error',
                title: 'Apellidos requeridos',
                text: 'Por favor ingrese los apellidos del trabajador',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            $('#apellidos').focus();
            return false;
        }
        
        // Validar género
        if (!$('input[name="generoEmpleado"]:checked').val()) {
            smallSwal.fire({
                icon: 'error',
                title: 'Género requerido',
                text: 'Por favor seleccione el género del empleado',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            return false;
        }
        
        // Validar selects (que no sea la opción por defecto)
        const selects = ['#cargocet', '#cargoonapre', '#nivelsalarial', '#nivelprof', '#departamentoasig'];
        for (const select of selects) {
            if (!$(select).val()) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Selección requerida',
                    text: `Por favor seleccione una opción válida para ${$(select).prev('label').text()}`,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                $(select).focus();
                return false;
            }
        }
        
        return true;
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
        smallSwal.fire({
            position: 'bottom-end',
            icon: 'success',
            title: 'Datos actualizados',
            text: 'Trabajadores en Nómina actualizados',
            showConfirmButton: false,
            timer: 2000,
            toast: true
        });
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