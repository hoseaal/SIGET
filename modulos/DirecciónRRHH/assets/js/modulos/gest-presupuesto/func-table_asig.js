 document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación
    const rowsPerPage = 8;
    let currentPage = 1;
    let totalAssignments = 0;
    let totalPages = 1;
    const tableBody = document.querySelector('#assignmentsTable tbody');
    const paginationElement = document.getElementById('paginationAssignments');

    // Variables para el control de actualización en tiempo real (agregar al inicio)
    let lastUpdateTimestampAssignments = null;
    let updateIntervalAssignments = 1000; // 1 segundo
    let updateTimerAssignments = null;
    let isUpdatingAssignments = false;

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
            
            // Tipos "0" y "1" - solo 3 columnas (sin acciones)
            if (LOGGED_USER_TYPE === '0' || LOGGED_USER_TYPE === '1') {
                row.innerHTML = `
                    <td>${rowNumber}</td>
                    <td><strong>${assignment.pri_raz}</strong></td>
                    <td>${assignment.pri_por}</td>
                `;
            } 
            // Tipo "2" - 4 columnas (solo editar)
            else if (LOGGED_USER_TYPE === '2') {
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
                            </div>
                        </div>
                    </td>
                `;
            } 
            // Tipos "3" y "4" - 4 columnas con todas las acciones
            else {
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
            }
            
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

        if (LOGGED_USER_TYPE === '2' || LOGGED_USER_TYPE === '3' || LOGGED_USER_TYPE === '4') {
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
        }

        // Agregar event listeners para los botones de eliminar (solo tipos 3 y 4)
        if (LOGGED_USER_TYPE === '3' || LOGGED_USER_TYPE === '4') {
            document.querySelectorAll('.delete-assignment-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const pri_ide = this.getAttribute('data-id');
                    const assignmentName = this.getAttribute('data-name');
                    showDeleteConfirmation(pri_ide, assignmentName);
                });
            });
        }
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
        const primaInput = document.getElementById('primaAsignacion');
        
        // Validar el formato del valor
        if (!/^\d*\.?\d*$/.test(primaInput.value)) {
            primaInput.classList.add('is-invalid');
            primaInput.focus();
            return;
        } else {
            primaInput.classList.remove('is-invalid');
        }

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

    // Validación en tiempo real para el input de valor de asignación
    document.getElementById('primaAsignacion')?.addEventListener('input', function(e) {
        // Eliminar cualquier caracter que no sea número o punto
        this.value = this.value.replace(/[^0-9.]/g, '');
        
        // Validar que no haya más de un punto
        if ((this.value.match(/\./g) || []).length > 1) {
            this.value = this.value.substring(0, this.value.length - 1);
        }
        
        // Limitar a 10 caracteres
        if (this.value.length > 10) {
            this.value = this.value.substring(0, 10);
        }
    });

    // Función para verificar cambios en bit_pri (agregar después de las funciones existentes)
    async function checkForAssignmentsUpdates() {
        if (isUpdatingAssignments) return;
        isUpdatingAssignments = true;
        
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/check_asig_updates.php?last_update=${lastUpdateTimestampAssignments || ''}`);
            const data = await response.json();
            
            if (data.success && data.has_changes) {
                lastUpdateTimestampAssignments = data.last_update;
                
                // Actualizar la tabla con animación suave
                await smoothUpdateAssignmentsTable();
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones de asignaciones:', error);
        } finally {
            isUpdatingAssignments = false;
        }
    }

    // Función para actualizar la tabla de asignaciones con animación suave
    async function smoothUpdateAssignmentsTable() {
        const table = document.getElementById('assignmentsTable');
        const pagination = document.getElementById('paginationAssignments');
        
        // Agregar clase de transición
        table.classList.add('table-updating');
        pagination.classList.add('pagination-updating');
        
        // Mostrar indicador de actualización
        const updateIndicator = document.createElement('div');
        table.parentNode.insertBefore(updateIndicator, table);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Recargar datos manteniendo la página actual
        await displayAssignments(currentPage);
        
        // Ocultar indicador y quitar clases de transición
        updateIndicator.remove();
        table.classList.remove('table-updating');
        pagination.classList.remove('pagination-updating');
        
        // Mostrar notificación de actualización
        showUpdateNotification('Asignaciones actualizadas');
    }

    // Función para mostrar notificación de actualización (adaptada)
    function showUpdateNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `${message} <i class="bx bx-check"></i>`;
        
        document.body.appendChild(notification);
        
        // Animación de aparición y desaparición
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

    // Iniciar el sistema de actualización periódica para asignaciones
    function startAssignmentsUpdateChecker() {
        // Verificar actualizaciones inmediatamente
        checkForAssignmentsUpdates();
        
        // Configurar intervalo periódico
        updateTimerAssignments = setInterval(checkForAssignmentsUpdates, updateIntervalAssignments);
        
        // También verificar cuando la ventana gana foco
        window.addEventListener('focus', checkForAssignmentsUpdates);
    }

    // Detener el sistema de actualización
    function stopAssignmentsUpdateChecker() {
        if (updateTimerAssignments) {
            clearInterval(updateTimerAssignments);
        }
        window.removeEventListener('focus', checkForAssignmentsUpdates);
    }

    // Inicializar la tabla y paginación
    displayAssignments(currentPage).then(() => {
        setupPagination();
        updatePaginationButtons();
    });

    // Iniciar el sistema de actualización en tiempo real
    startAssignmentsUpdateChecker();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', stopAssignmentsUpdateChecker);
});