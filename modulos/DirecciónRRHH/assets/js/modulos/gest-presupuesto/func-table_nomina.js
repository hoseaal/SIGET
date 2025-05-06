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
                showDeleteConfirmation(cedula);
            });
        });
    }

    // Función para mostrar confirmación de eliminación
    function showDeleteConfirmation(cedula) {
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