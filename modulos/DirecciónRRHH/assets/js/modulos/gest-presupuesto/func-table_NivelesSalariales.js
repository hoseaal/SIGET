document.addEventListener('DOMContentLoaded', function() {
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

    // Variables para la paginación
    const rowsPerPage = 7;
    let currentPage = 1;
    let totalSalaries = 0;
    let totalPages = 1;
    const tableBody = document.querySelector('#salaryTable tbody');
    const paginationElement = document.getElementById('paginationSalary');

    // Variable para almacenar todos los niveles salariales
    let allSalaries = [];
    let isSearching = false;
    let currentSearchTerm = '';

    // Variables para el control de actualización en tiempo real (agregar al inicio)
    let lastUpdateTimestampSalary = null;
    let updateIntervalSalary = 1000; // 1 segundo
    let updateTimerSalary = null;
    let isUpdatingSalary = false;

    // Función para cargar TODOS los niveles salariales desde la API (para búsqueda)
    async function fetchAllSalaries() {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_salarios.php?all=true`);
            const data = await response.json();
            
            if (data.success) {
                allSalaries = data.salaries;
                return data.salaries;
            } else {
                console.error('Error al cargar todos los niveles salariales:', data.message);
                smallSwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los niveles salariales',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return [];
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar al servidor',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            return [];
        }
    }

    // Función para cargar los niveles salariales paginados desde la API
    async function fetchSalaries(page) {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_salarios.php?page=${page}&per_page=${rowsPerPage}`);
            const data = await response.json();
            
            if (data.success) {
                totalSalaries = data.total;
                totalPages = data.total_pages;
                return {
                    salaries: data.salaries,
                    total: data.total,
                    total_pages: data.total_pages
                };
            } else {
                console.error('Error al cargar niveles salariales:', data.message);
                return {
                    salaries: [],
                    total: 0,
                    total_pages: 0
                };
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return {
                salaries: [],
                total: 0,
                total_pages: 0
            };
        }
    }

    // Función para filtrar localmente
    function filterSalariesLocally(salaries, searchTerm) {
        if (!searchTerm) return salaries;
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        return salaries.filter(salary => {
            return (
                (salary.nvl_ran && salary.nvl_ran.toLowerCase().includes(lowerSearchTerm)) ||
                (salary.nvl_sal && salary.nvl_sal.toString().includes(searchTerm)) ||
                (salary.ona_car && salary.ona_car.toLowerCase().includes(lowerSearchTerm))
            );
        });
    }

    // Función para mostrar los niveles salariales en la página actual
    async function displaySalaries(page, salariesToDisplay = null) {
        const isFiltered = salariesToDisplay !== null;
        
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
        
        let salaries = [];
        if (isFiltered) {
            salaries = salariesToDisplay;
            totalSalaries = salaries.length;
            totalPages = Math.ceil(salaries.length / rowsPerPage);
        } else {
            const result = await fetchSalaries(page);
            salaries = result.salaries;
            totalSalaries = result.total;
            totalPages = result.total_pages;
        }
        
        // Pequeño retraso para evitar parpadeo con cargas rápidas
        await new Promise(resolve => setTimeout(resolve, 200));
        
        tableBody.innerHTML = '';
        
        if (salaries.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < rowsPerPage; i++) {
                const row = document.createElement('tr');
                if (i === 0) {
                    row.innerHTML = `
                        <td colspan="4" class="text-center empty-row">
                            ${isFiltered ? 'No se encontraron coincidencias' : 'No se encontraron registros'}
                        </td>
                    `;
                } else {
                    row.innerHTML = '<td colspan="4" class="empty-row">&nbsp;</td>';
                }
                tableBody.appendChild(row);
            }
            
            // Actualizar paginación para reflejar que no hay datos
            setupPagination();
            return;
        }

        // Llenar con datos reales
        salaries.forEach(salary => {
            const row = document.createElement('tr');
            
            // Tipos "0" y "1" - solo 3 columnas (sin acciones)
            if (LOGGED_USER_TYPE === '0' || LOGGED_USER_TYPE === '1') {
                row.innerHTML = `
                    <td>${salary.nvl_ran}</td>
                    <td>${salary.nvl_sal.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${salary.ona_car || 'Sin cargo asignado'}</td>
                `;
            } 
            // Tipo "2" - 4 columnas (solo editar)
            else if (LOGGED_USER_TYPE === '2') {
                row.innerHTML = `
                    <td>${salary.nvl_ran}</td>
                    <td>${salary.nvl_sal.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${salary.ona_car || 'Sin cargo asignado'}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-salary-btn" href="javascript:void(0);" data-nvl_ide="${salary.nvl_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            } 
            // Tipos "3" y "4" - 4 columnas con todas las acciones
            else {
                row.innerHTML = `
                    <td>${salary.nvl_ran}</td>
                    <td>${salary.nvl_sal.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${salary.ona_car || 'Sin cargo asignado'}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-salary-btn" href="javascript:void(0);" data-nvl_ide="${salary.nvl_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                                <a class="dropdown-item delete-salary-btn" href="javascript:void(0);" data-nvl_ide="${salary.nvl_ide}" data-nvl_ran="${salary.nvl_ran}" data-ona_car="${salary.ona_car || 'Sin cargo asignado'}">
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
        if (salaries.length < rowsPerPage) {
            const remainingRows = rowsPerPage - salaries.length;
            for (let i = 0; i < remainingRows; i++) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="4" class="empty-row">&nbsp;</td>';
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
        const searchInput = document.getElementById('salarySearch');
        let searchTimeout;
        
        // Cargar todos los registros al iniciar para búsquedas
        fetchAllSalaries();
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            
            const searchTerm = this.value.trim();
            currentSearchTerm = searchTerm;
            
            if (searchTerm.length === 0) {
                // Si el buscador está vacío, volver a la paginación normal
                isSearching = false;
                currentPage = 1;
                displaySalaries(currentPage);
                paginationElement.style.display = '';
                return;
            }
            
            // Pequeño retraso para no hacer búsquedas con cada tecla
            searchTimeout = setTimeout(async () => {
                isSearching = true;
                
                // Mostrar loader
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Buscando...</span>
                            </div>
                        </td>
                    </tr>
                `;
                
                // Si no tenemos todos los registros cargados, intentar cargarlos
                if (allSalaries.length === 0) {
                    allSalaries = await fetchAllSalaries();
                }
                
                // Filtrar localmente con todos los datos
                const filtered = filterSalariesLocally(allSalaries, searchTerm);
                displaySalaries(1, filtered);
                paginationElement.style.display = filtered.length > rowsPerPage ? '' : 'none';
            }, 300);
        });
        
        // Restaurar paginación si se borra la búsqueda
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Escape' || this.value.trim() === '') {
                this.value = '';
                isSearching = false;
                currentPage = 1;
                displaySalaries(currentPage);
                paginationElement.style.display = '';
            }
        });
    }

    // Función para configurar los event listeners
    function setupEventListeners() {
        if (LOGGED_USER_TYPE === '2' || LOGGED_USER_TYPE === '3' || LOGGED_USER_TYPE === '4') {
            document.querySelectorAll('.edit-salary-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const nvl_ide = this.getAttribute('data-nvl_ide');
                    try {
                        const response = await fetch(`../PHP/api/gest-presupuesto/detalles_salarios.php?nvl_ide=${nvl_ide}`);
                        const data = await response.json();
                        
                        if (data.success) {
                            openEditModal(data.salary);
                        } else {
                            alert('No se pudieron cargar los datos del nivel salarial');
                        }
                    } catch (error) {
                        console.error('Error al cargar detalles:', error);
                        alert('Error al cargar los detalles del nivel salarial');
                    }
                });
            });
        }

        // Agregar event listeners para los botones de eliminar
        if (LOGGED_USER_TYPE === '3' || LOGGED_USER_TYPE === '4') {
            document.querySelectorAll('.delete-salary-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const nvl_ide = this.getAttribute('data-nvl_ide');
                    const nvl_ran = this.getAttribute('data-nvl_ran');
                    const ona_car = this.getAttribute('data-ona_car');
                    showDeleteConfirmation(nvl_ide, nvl_ran, ona_car);
                });
            });
        }
    }

    // Función para mostrar confirmación de eliminación
    function showDeleteConfirmation(nvl_ide, nvl_ran, ona_car) {
        smallSwal.fire({
            title: '¿Eliminar nivel salarial?',
            html: `¿Seguro de eliminar el nivel <strong>${nvl_ran}</strong> del cargo <strong>${ona_car}</strong>?<br><br><span class="text-danger">¡Esta acción no se puede deshacer!</span>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Mostrar loader durante la eliminación
                smallSwal.fire({
                    title: 'Eliminando registro',
                    html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" style="width: 100%; height: 100%;"></div></div>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        smallSwal.showLoading();
                    }
                });
                
                await deleteSalary(nvl_ide);
            }
        });
    }

    // Función para eliminar un nivel salarial
     async function deleteSalary(nvl_ide) {
        try {
            const response = await fetch('../PHP/api/gest-presupuesto/eliminar_salarios.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nvl_ide: nvl_ide })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `Error HTTP: ${response.status}`);
            }
            
            if (result.success) {
                // Cerrar cualquier alerta abierta
                smallSwal.close();
                
                // Verificar si debemos cambiar de página
                if (currentPage > 1 && (totalSalaries - 1) <= ((currentPage - 1) * rowsPerPage)) {
                    currentPage--;
                }
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: result.message || 'Nivel salarial eliminado correctamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar la tabla
                    if (isSearching) {
                        allSalaries = await fetchAllSalaries();
                        const filtered = filterSalariesLocally(allSalaries, currentSearchTerm);
                        displaySalaries(1, filtered);
                    } else {
                        await displaySalaries(currentPage);
                    }
                });
            } else {
                throw new Error(result.message || 'Error al eliminar el nivel salarial');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al eliminar: ' + error.message,
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
                    // Si estamos buscando, mostrar los primeros resultados filtrados
                    const filtered = filterSalariesLocally(allSalaries, currentSearchTerm);
                    displaySalaries(1, filtered);
                } else {
                    displaySalaries(currentPage);
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
                    const filtered = filterSalariesLocally(allSalaries, currentSearchTerm);
                    displaySalaries(currentPage, filtered);
                } else {
                    displaySalaries(currentPage);
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
                        const filtered = filterSalariesLocally(allSalaries, currentSearchTerm);
                        displaySalaries(currentPage, filtered);
                    } else {
                        displaySalaries(currentPage);
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
                    const filtered = filterSalariesLocally(allSalaries, currentSearchTerm);
                    displaySalaries(currentPage, filtered);
                } else {
                    displaySalaries(currentPage);
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
                    const filtered = filterSalariesLocally(allSalaries, currentSearchTerm);
                    displaySalaries(currentPage, filtered);
                } else {
                    displaySalaries(currentPage);
                }
            }
        });
        paginationElement.appendChild(li);
    }

    // Función para abrir el modal de edición con datos
    async function openEditModal(salaryData) {

        // Limpiar validaciones previas
        cleanModalValidations();

        // Cargar los cargos ONAPRE primero
        const cargosOnapre = await fetchCargosOnapre();
        if (!cargosOnapre) {
            alert('No se pudieron cargar los cargos ONAPRE');
            return;
        }

        // Llenar el select de cargos ONAPRE
        const selectOnapre = document.getElementById('OnapreAsig');
        selectOnapre.innerHTML = '<option value="">Seleccione</option>';
        
        cargosOnapre.forEach(cargo => {
            const option = document.createElement('option');
            option.value = cargo.ona_ide;
            option.textContent = cargo.ona_car;
            selectOnapre.appendChild(option);
        });

        // Llenar los campos con los datos del nivel salarial
        document.getElementById('tipoNlvSalarial').value = salaryData.nvl_ran || '';
        document.getElementById('salarioAsig').value = salaryData.nvl_sal || '';
        
        // Seleccionar el cargo ONAPRE correspondiente
        if (salaryData.ona_ide) {
            selectOnapre.value = salaryData.ona_ide;
        }

        // Agregar event listeners para validación en tiempo real
        document.getElementById('tipoNlvSalarial').addEventListener('input', function() {
            validateTipoNivelInput(this);
        });

        document.getElementById('salarioAsig').addEventListener('input', function() {
            validateSalarioInput(this);
        });

        document.getElementById('OnapreAsig').addEventListener('change', function() {
            validateOnapreSelect(this);
        });

        // Configurar el botón de guardar
        const saveButton = document.getElementById('confirmChangesBtn');
        saveButton.onclick = async function() {
            if (validateForm()) {
                await updateSalary(salaryData.nvl_ide);
            } else {
                // Mostrar todos los mensajes de error
                validateTipoNivelInput(document.getElementById('tipoNlvSalarial'));
                validateSalarioInput(document.getElementById('salarioAsig'));
                validateOnapreSelect(document.getElementById('OnapreAsig'));
            }
        };

        // Mostrar el modal
        const editModal = new bootstrap.Modal(document.getElementById('ModalNivelSalarial'));
        editModal.show();
    }

    // Función para obtener los cargos ONAPRE
    async function fetchCargosOnapre() {
        try {
            const response = await fetch('../PHP/api/gest-presupuesto/carga-modal_salarios.php');
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

    // Función para actualizar un nivel salarial
     async function updateSalary(nvl_ide) {
        const saveButton = document.querySelector('#ModalNivelSalarial .btn-primary');
        const originalText = saveButton.innerHTML;
        
        // Mostrar spinner y deshabilitar botón
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        saveButton.disabled = true;
        
        try {
            // Obtener los datos del formulario
            const updatedData = {
                nvl_ide: nvl_ide,
                nvl_ran: document.getElementById('tipoNlvSalarial').value,
                nvl_sal: document.getElementById('salarioAsig').value,
                ona_ide: document.getElementById('OnapreAsig').value || null
            };

            // Validación básica
            if (!updatedData.nvl_ran || !updatedData.nvl_sal) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Datos incompletos',
                    text: 'Por favor complete todos los campos requeridos',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return;
            }
            
            // Llamada a la API para guardar cambios
            const response = await fetch('../PHP/api/gest-presupuesto/actualizar_salarios.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Cerrar el modal
                bootstrap.Modal.getInstance(document.getElementById('ModalNivelSalarial')).hide();
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'Cambios guardados exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar los datos
                    if (isSearching) {
                        allSalaries = await fetchAllSalaries();
                        const filtered = filterSalariesLocally(allSalaries, currentSearchTerm);
                        displaySalaries(1, filtered);
                    } else {
                        await displaySalaries(currentPage);
                    }
                });
            } else {
                throw new Error(result.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar: ' + error.message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
        } finally {
            // Restaurar el botón
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
        }
    }

    // Función para validar el input de Tipo de Nivel Salarial
    function validateTipoNivelInput(input) {
        // Eliminar cualquier carácter no permitido (solo letras)
        const sanitizedValue = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
        
        // Limitar a 5 caracteres
        if (sanitizedValue.length > 5) {
            input.value = sanitizedValue.substring(0, 5);
        } else {
            input.value = sanitizedValue;
        }
        
        // Validar el campo
        if (input.value.trim() === '') {
            input.classList.add('is-invalid');
            return false;
        } else {
            input.classList.remove('is-invalid');
            return true;
        }
    }

    // Función para validar el input de Salario
    function validateSalarioInput(input) {
        // Obtener el valor actual
        let value = input.value;
        
        // Eliminar cualquier carácter que no sea número o punto
        let sanitizedValue = value.replace(/[^0-9.]/g, '');
        
        // Manejar múltiples puntos decimales
        const parts = sanitizedValue.split('.');
        if (parts.length > 2) {
            // Si hay más de un punto, mantener solo el primero
            sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Limitar decimales a 2
        if (parts.length === 2) {
            parts[1] = parts[1].substring(0, 2);
            sanitizedValue = parts[0] + '.' + parts[1];
        }
        
        // Limitar a 10 caracteres en total
        if (sanitizedValue.length > 10) {
            sanitizedValue = sanitizedValue.substring(0, 10);
        }
        
        // Actualizar el valor del input
        input.value = sanitizedValue;
        
        // Validar el campo
        if (input.value.trim() === '' || isNaN(Number(input.value))) {
            input.classList.add('is-invalid');
            return false;
        } else {
            input.classList.remove('is-invalid');
            return true;
        }
    }

    // Función para validar el select de ONAPRE
    function validateOnapreSelect(select) {
        if (select.value === "") {
            select.classList.add('is-invalid');
            return false;
        } else {
            select.classList.remove('is-invalid');
            return true;
        }
    }

    // Función para validar todo el formulario antes de guardar
    function validateForm() {
        const tipoNivelValid = validateTipoNivelInput(document.getElementById('tipoNlvSalarial'));
        const salarioValid = validateSalarioInput(document.getElementById('salarioAsig'));
        const onapreValid = validateOnapreSelect(document.getElementById('OnapreAsig'));
        
        return tipoNivelValid && salarioValid && onapreValid;
    }

    // Función para limpiar todas las validaciones del modal
    function cleanModalValidations() {
        const inputs = document.querySelectorAll('#ModalNivelSalarial .form-control, #ModalNivelSalarial .form-select');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
        });
    }

    // Función para verificar cambios en bit_nvl (agregar después de las funciones existentes)
    async function checkForSalaryUpdates() {
        if (isUpdatingSalary) return;
        isUpdatingSalary = true;
        
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/check_salary_updates.php?last_update=${lastUpdateTimestampSalary || ''}`);
            const data = await response.json();
            
            if (data.success && data.has_changes) {
                lastUpdateTimestampSalary = data.last_update;
                
                // Actualizar la tabla con animación suave
                await smoothUpdateSalaryTable();
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones de salarios:', error);
        } finally {
            isUpdatingSalary = false;
        }
    }

    // Función para actualizar la tabla de salarios con animación suave
    async function smoothUpdateSalaryTable() {
        const table = document.getElementById('salaryTable');
        const updateIndicator = document.createElement('div');
        
        // Aplicar estilos de transición
        table.classList.add('table-updating');
        
        // Mostrar indicador de actualización
        table.parentNode.insertBefore(updateIndicator, table);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Recargar datos
        if (isSearching) {
            allSalaries = await fetchAllSalaries();
            const filtered = filterSalariesLocally(allSalaries, currentSearchTerm);
            await displaySalaries(currentPage, filtered);
        } else {
            await displaySalaries(currentPage);
        }
        
        // Ocultar indicador y quitar clase de transición
        updateIndicator.remove();
        table.classList.remove('table-updating');
        
        // Mostrar notificación de actualización
        showSalaryUpdateNotification();
    }

    // Función para mostrar notificación de actualización
    function showSalaryUpdateNotification() {
        const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
        
        Toast.fire({
            icon: 'success',
            title: 'Niveles salariales actualizados',
            background: '#f8f9fa',
            color: '#333'
        });
    }

    // Iniciar el sistema de actualización periódica para salarios
    function startSalaryUpdateChecker() {
        // Verificar actualizaciones inmediatamente
        checkForSalaryUpdates();
        
        // Configurar intervalo periódico
        updateTimerSalary = setInterval(checkForSalaryUpdates, updateIntervalSalary);
        
        // También verificar cuando la ventana gana foco
        window.addEventListener('focus', checkForSalaryUpdates);
    }

    // Detener el sistema de actualización
    function stopSalaryUpdateChecker() {
        if (updateTimerSalary) {
            clearInterval(updateTimerSalary);
        }
        window.removeEventListener('focus', checkForSalaryUpdates);
    }

    // Inicializar la tabla, paginación y buscador
    displaySalaries(currentPage).then(() => {
        setupSearch();
    });

    // Iniciar el sistema de actualización en tiempo real
    startSalaryUpdateChecker();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', stopSalaryUpdateChecker);
});