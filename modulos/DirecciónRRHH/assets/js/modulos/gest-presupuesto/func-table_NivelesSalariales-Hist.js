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
    })

document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación
    const rowsPerPage = 7;
    let currentPage = 1;
    let totalSalaries = 0;
    let totalPages = 1;
    const tableBody = document.querySelector('#salaryTable tbody');
    const paginationElement = document.getElementById('paginationSalary');

    // Función para cargar los niveles salariales desde la API
    async function fetchSalaries(page) {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_salarios-hist.php?page=${page}&per_page=${rowsPerPage}`);
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
                smallSwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los registros históricos',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return {
                    salaries: [],
                    total: 0,
                    total_pages: 0
                };
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
            return {
                salaries: [],
                total: 0,
                total_pages: 0
            };
        }
    }

    // Función para mostrar los niveles salariales en la página actual
    async function displaySalaries(page) {
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
        
        const result = await fetchSalaries(page);
        const salaries = result.salaries;
        totalSalaries = result.total;
        totalPages = result.total_pages;
        
        tableBody.innerHTML = '';
        
        if (salaries.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < rowsPerPage; i++) {
                const row = document.createElement('tr');
                if (i === 0) {
                    row.innerHTML = `
                        <td colspan="4" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron registros' : '&nbsp;'}
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
            
            // Convertir la fecha de yyyy-mm-dd a dd/mm/yyyy
            let formattedDate = 'Sin fecha asignada';
            if (salary.nvl_fec) {
                const dateParts = salary.nvl_fec.split('-');
                if (dateParts.length === 3) {
                    formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
                }
            }
            
            row.innerHTML = `
                <td>${salary.nvl_ran}</td>
                <td>${salary.nvl_sal.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>${salary.ona_car || 'Sin cargo asignado'}</td>
                <td>${formattedDate}</td>
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

    // Función para configurar los event listeners
    function setupEventListeners() {
        // Agregar event listeners para los botones de editar
        document.querySelectorAll('.edit-salary-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const nvl_ide = this.getAttribute('data-nvl_ide');
                try {
                    const response = await fetch(`../PHP/api/gest-presupuesto/detalles_salarios-hist.php?nvl_ide=${nvl_ide}`);
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

        // Agregar event listeners para los botones de eliminar
        document.querySelectorAll('.delete-salary-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const nvl_ide = this.getAttribute('data-nvl_ide');
                const nvl_ran = this.getAttribute('data-nvl_ran');
                const ona_car = this.getAttribute('data-ona_car');
                showDeleteConfirmation(nvl_ide, nvl_ran, ona_car);
            });
        });
    }

    // Función para mostrar confirmación de eliminación
    function showDeleteConfirmation(nvl_ide, nvl_ran, ona_car) {
        smallSwal.fire({
            title: '¿Eliminar registro histórico?',
            html: `¿Seguro de eliminar el registro histórico del nivel <strong>${nvl_ran}</strong> para el cargo <strong>${ona_car}</strong>?<br><br><span class="text-danger">¡Esta acción no se puede deshacer!</span>`,
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
                    title: 'Eliminando registro histórico',
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
            const response = await fetch('../PHP/api/gest-presupuesto/eliminar_salarios-hist.php', {
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
                    text: result.message || 'Registro histórico eliminado correctamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar la tabla
                    await displaySalaries(currentPage);
                });
            } else {
                throw new Error(result.message || 'Error al eliminar el registro histórico');
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
                displaySalaries(currentPage);
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
                displaySalaries(currentPage);
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
                    displaySalaries(currentPage);
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
                displaySalaries(currentPage);
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
                displaySalaries(currentPage);
            }
        });
        paginationElement.appendChild(li);
    }

    // Función para abrir el modal de edición con datos
    async function openEditModal(salaryData) {
        try {
            // Mostrar loader mientras se cargan los cargos ONAPRE
            smallSwal.fire({
                title: 'Cargando datos...',
                html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%; height: 100%;"></div></div>',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    smallSwal.showLoading();
                }
            });

            // Cargar los cargos ONAPRE primero
            const cargosOnapre = await fetchCargosOnapre();
            
            // Cerrar el loader
            smallSwal.close();

            if (!cargosOnapre) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los cargos ONAPRE',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
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
            
            // Llenar campo de fecha
            document.getElementById('fechamodificacion').value = salaryData.nvl_fec || '';

            // Seleccionar el cargo ONAPRE correspondiente
            if (salaryData.ona_ide) {
                selectOnapre.value = salaryData.ona_ide;
            }

            // Configurar validaciones en los inputs
            setupInputValidations();

            // Configurar el botón de guardar
            const saveButton = document.querySelector('#ModalNivelSalarial .btn-primary');
            saveButton.onclick = async function() {
                if (validateForm()) {
                    await updateSalary(salaryData.nvl_ide);
                }
            };

            // Mostrar el modal
            const editModal = new bootstrap.Modal(document.getElementById('ModalNivelSalarial'));
            editModal.show();

        } catch (error) {
            console.error('Error al abrir modal de edición:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar los datos para edición',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
        }
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
                nvl_fec: document.getElementById('fechamodificacion').value,
                ona_ide: document.getElementById('OnapreAsig').value || null
            };

            // Validación básica
            if (!updatedData.nvl_ran || !updatedData.nvl_sal || !updatedData.nvl_fec) {
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
            const response = await fetch('../PHP/api/gest-presupuesto/actualizar_salarios-hist.php', {
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
                    text: 'Cambios en el registro histórico guardados exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar los datos
                    await displaySalaries(currentPage);
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

    // Función para configurar las validaciones de los inputs
    function setupInputValidations() {
        const tipoNivelInput = document.getElementById('tipoNlvSalarial');
        const salarioInput = document.getElementById('salarioAsig');
        const onapreSelect = document.getElementById('OnapreAsig');
        const fechaInput = document.getElementById('fechamodificacion');

        // Validación para Tipo de Nivel Salarial (solo letras, máximo 5 caracteres)
        tipoNivelInput.addEventListener('input', function(e) {
            // Eliminar cualquier carácter que no sea letra
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g, '');
            
            // Limitar a 5 caracteres
            if (this.value.length > 5) {
                this.value = this.value.substring(0, 5);
            }
        });

        // Validación para Salario Correspondiente (solo números, máximo 10 dígitos, máximo 2 decimales)
        salarioInput.addEventListener('input', function(e) {
            // Eliminar cualquier carácter que no sea número o punto decimal
            this.value = this.value.replace(/[^0-9.]/g, '');
            
            // Limitar a 10 caracteres en total
            if (this.value.length > 10) {
                this.value = this.value.substring(0, 10);
            }
            
            // Manejar decimales
            if ((this.value.match(/\./g) || []).length > 1) {
                // Si hay más de un punto, eliminar el último ingresado
                this.value = this.value.substring(0, this.value.length - 1);
            }
            
            // Limitar a 2 decimales
            const parts = this.value.split('.');
            if (parts.length > 1 && parts[1].length > 2) {
                this.value = parts[0] + '.' + parts[1].substring(0, 2);
            }
        });

        // Validación para evitar que se pegue texto no válido
        tipoNivelInput.addEventListener('paste', function(e) {
            e.preventDefault();
        });

        salarioInput.addEventListener('paste', function(e) {
            e.preventDefault();
        });
    }

    // Función para validar el formulario antes de enviar
    function validateForm() {
        const tipoNivelInput = document.getElementById('tipoNlvSalarial');
        const salarioInput = document.getElementById('salarioAsig');
        const onapreSelect = document.getElementById('OnapreAsig');
        const fechaInput = document.getElementById('fechamodificacion');
        let isValid = true;

        // Validar Tipo de Nivel Salarial
        if (!tipoNivelInput.value.trim()) {
            smallSwal.fire({
                icon: 'error',
                title: 'Campo requerido',
                text: 'Por favor ingrese el Tipo de Nivel Salarial',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            tipoNivelInput.focus();
            return false;
        }

        // Validar Salario Correspondiente
        if (!salarioInput.value.trim()) {
            smallSwal.fire({
                icon: 'error',
                title: 'Campo requerido',
                text: 'Por favor ingrese el Salario Correspondiente',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            salarioInput.focus();
            return false;
        }

        // Validar que el salario sea un número válido
        if (isNaN(parseFloat(salarioInput.value))) {
            smallSwal.fire({
                icon: 'error',
                title: 'Valor inválido',
                text: 'Por favor ingrese un valor numérico válido para el salario',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            salarioInput.focus();
            return false;
        }

        // Validar Cargo ONAPRE
        if (!onapreSelect.value) {
            smallSwal.fire({
                icon: 'error',
                title: 'Selección requerida',
                text: 'Por favor seleccione un Cargo ONAPRE',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            onapreSelect.focus();
            return false;
        }

        // Validar Fecha de Modificación
        if (!fechaInput.value) {
            smallSwal.fire({
                icon: 'error',
                title: 'Fecha requerida',
                text: 'Por favor ingrese la Fecha de Modificación',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            fechaInput.focus();
            return false;
        }

        return true;
    }

    // Inicializar la tabla
    displaySalaries(currentPage);
});