document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación
    const rowsPerPage = 8;
    let currentPage = 1;
    let totalDeductions = 0;
    let totalPages = 1;
    const tableBody = document.querySelector('#workersTable tbody');
    const paginationElement = document.getElementById('pagination');
    let allDeductionsData = [];

    // Variables para el control de actualización en tiempo real
    let lastUpdateTimestamp = null;
    let updateInterval = 1000; // 1 segundo
    let updateTimer = null;
    let isUpdating = false;

    // Función para cargar las deducciones desde la API
    async function fetchDeductions(page) {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_deduc.php?page=${page}&per_page=${rowsPerPage}`);
            const data = await response.json();
            
            if (data.success) {
                totalDeductions = data.total;
                totalPages = data.total_pages;
                allDeductionsData = data.deductions;
                return data.deductions;
            } else {
                console.error('Error al cargar deducciones:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return [];
        }
    }

    // Función para obtener los datos completos de una deducción
    async function fetchDeductionDetails(dedId) {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/tomar_deduc.php?ded_id=${dedId}`);
            const data = await response.json();
            
            if (data.success) {
                return data.deduction;
            } else {
                console.error('Error al cargar detalles:', data.message);
                return null;
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return null;
        }
    }

    // Función para mostrar las deducciones en la página actual
    async function displayDeductions(page) {
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
        
        const deductions = await fetchDeductions(page);
        
        tableBody.innerHTML = '';
        
        if (deductions.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < rowsPerPage; i++) {
                const row = document.createElement('tr');
                if (i === 0) {
                    row.innerHTML = `
                        <td colspan="4" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron deducciones' : '&nbsp;'}
                        </td>
                    `;
                } else {
                    row.innerHTML = '<td colspan="4" class="empty-row">&nbsp;</td>';
                }
                tableBody.appendChild(row);
            }
            return;
        }

        // Llenar con datos reales
        deductions.forEach((deduction, index) => {
            const rowNumber = (page - 1) * rowsPerPage + index + 1;
            const row = document.createElement('tr');
            
            // Tipos "0" y "1" - solo 4 columnas (sin acciones)
            if (LOGGED_USER_TYPE === '0' || LOGGED_USER_TYPE === '1') {
                row.innerHTML = `
                    <td>${rowNumber}</td>
                    <td><strong>${deduction.ded_raz}</strong></td>
                    <td>${deduction.ded_por} %</td>
                `;
            } 
            // Tipo "2" - 5 columnas (solo editar)
            else if (LOGGED_USER_TYPE === '2') {
                row.innerHTML = `
                    <td>${rowNumber}</td>
                    <td><strong>${deduction.ded_raz}</strong></td>
                    <td>${deduction.ded_por} %</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-deduction-btn" href="javascript:void(0);" data-id="${deduction.ded_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            } 
            // Tipos "3" y "4" - 5 columnas con todas las acciones
            else {
                row.innerHTML = `
                    <td>${rowNumber}</td>
                    <td><strong>${deduction.ded_raz}</strong></td>
                    <td>${deduction.ded_por} %</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-deduction-btn" href="javascript:void(0);" data-id="${deduction.ded_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                                <a class="dropdown-item delete-deduction-btn" href="javascript:void(0);" 
                                data-id="${deduction.ded_ide}" 
                                data-name="${deduction.ded_raz}">
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
        if (deductions.length < rowsPerPage) {
            const remainingRows = rowsPerPage - deductions.length;
            for (let i = 0; i < remainingRows; i++) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="4" class="empty-row">&nbsp;</td>';
                tableBody.appendChild(row);
            }
        }

        // Agregar event listeners para los botones de editar
        if (LOGGED_USER_TYPE === '2' || LOGGED_USER_TYPE === '3' || LOGGED_USER_TYPE === '4') {
            document.querySelectorAll('.edit-deduction-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const dedId = this.getAttribute('data-id');
                    const deductionData = await fetchDeductionDetails(dedId);
                    if (deductionData) {
                        openEditModal(deductionData);
                    } else {
                        alert('No se pudieron cargar los datos de la deducción');
                    }
                });
            });
        }

        // Agregar event listeners para los botones de eliminar
        if (LOGGED_USER_TYPE === '3' || LOGGED_USER_TYPE === '4') {
            document.querySelectorAll('.delete-deduction-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const dedId = this.getAttribute('data-id');
                    const dedName = this.getAttribute('data-name');
                    showDeleteConfirmation(dedId, dedName);
                });
            });
        }
    }

    // Función para mostrar confirmación de eliminación
    function showDeleteConfirmation(dedId, dedName) {
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
                        <p>¿Seguro de eliminar la deducción <strong>${dedName}</strong>?</p>
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
            await deleteDeduction(dedId);
            deleteModal.hide();
            // Eliminar el modal del DOM después de cerrarse
            document.getElementById('deleteConfirmationModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        });
        
        // Eliminar el modal del DOM si se cierra sin confirmar
        document.getElementById('deleteConfirmationModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Función para eliminar una deducción
    async function deleteDeduction(dedId) {
        try {
            // Mostrar loader
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
            loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
            loadingIndicator.style.zIndex = '1060';
            loadingIndicator.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Cargando...</span></div>';
            document.body.appendChild(loadingIndicator);
            
            // Enviar solicitud de eliminación
            const response = await fetch('../PHP/api/gest-presupuesto/eliminar_deduc.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ded_id: dedId })
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
                alert(result.message || 'Deducción eliminada correctamente');
                // Recargar la tabla
                displayDeductions(currentPage);
            } else {
                throw new Error(result.message || 'Error al eliminar la deducción');
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
                displayDeductions(currentPage);
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
                displayDeductions(currentPage);
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
                    displayDeductions(currentPage);
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
                displayDeductions(currentPage);
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
                displayDeductions(currentPage);
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

    // Función para abrir el modal de edición con datos de la deducción
    function openEditModal(deduction) {
        const editModal = new bootstrap.Modal(document.getElementById('ModalDeducciones'));
        const modalElement = document.getElementById('ModalDeducciones');
        const porcentajeInput = document.getElementById('porcentajeDeduccion');
        
        // Resetear las validaciones cada vez que se abre el modal
        porcentajeInput.classList.remove('is-invalid');
        
        // Resetear el contenido del modal cuando se cierra
        modalElement.addEventListener('hidden.bs.modal', function() {
            porcentajeInput.classList.remove('is-invalid');
        });
        
        // Llenar los campos del modal con los datos de la deducción
        document.getElementById('deductionId').value = deduction.ded_ide;
        document.getElementById('tipoDeduccion').value = deduction.ded_raz || '';
        document.getElementById('porcentajeDeduccion').value = deduction.ded_por || '';
        
        // Configurar el botón de guardar
        document.getElementById('confirmEditDeduction').onclick = function() {
            saveDeductionChanges(deduction.ded_ide);
        };
        
        // Mostrar el modal
        editModal.show();
    }

    // Función para guardar los cambios de la deducción
    async function saveDeductionChanges(dedId) {
        const saveButton = document.getElementById('confirmEditDeduction');
        const originalText = saveButton.innerHTML;
        const porcentajeInput = document.getElementById('porcentajeDeduccion');
        
        // Mostrar spinner y deshabilitar botón
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        saveButton.disabled = true;
        
        try {
            // Validar campos
            const nombre = document.getElementById('tipoDeduccion').value.trim();
            const porcentaje = porcentajeInput.value.trim();
            
            // Validar que el porcentaje no esté vacío
            if (porcentaje === '') {
                porcentajeInput.classList.add('is-invalid');
                throw new Error('Por favor ingrese un porcentaje válido');
            }
            
            // Convertir a número
            const porcentajeNum = parseFloat(porcentaje);
            
            // Validar que sea un número válido
            if (isNaN(porcentajeNum)) {
                porcentajeInput.classList.add('is-invalid');
                throw new Error('Por favor ingrese un número válido');
            }
            
            // Validar que no sea mayor a 100
            if (porcentajeNum > 100) {
                porcentajeInput.classList.add('is-invalid');
                throw new Error('El porcentaje no puede ser mayor a 100');
            }
            
            // Validar que no tenga más de 2 decimales
            const decimalParts = porcentaje.split('.');
            if (decimalParts.length === 2 && decimalParts[1].length > 2) {
                porcentajeInput.classList.add('is-invalid');
                throw new Error('El porcentaje no puede tener más de 2 decimales');
            }
            
            // Obtener los datos del formulario
            const updatedData = {
                ded_id: dedId,
                ded_raz: nombre,
                ded_por: porcentajeNum
            };
            
            // Llamada a la API para guardar cambios
            const response = await fetch('../PHP/api/gest-presupuesto/actualizar_deduc.php', {
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
                bootstrap.Modal.getInstance(document.getElementById('ModalDeducciones')).hide();
                
                // Mostrar mensaje de éxito
                alert(result.message || 'Cambios guardados exitosamente');
                
                // Recargar los datos
                displayDeductions(currentPage);
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

    // Función para verificar cambios en bit_ded
    async function checkForUpdates() {
        if (isUpdating) return;
        isUpdating = true;
        
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/check_deduc_updates.php?last_update=${lastUpdateTimestamp || ''}`);
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
        await displayDeductions(currentPage);
        
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
        notification.innerHTML = 'Datos actualizados <i class="bx bx-check"></i>';
        
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

    // Detener el sistema de actualización
    function stopUpdateChecker() {
        if (updateTimer) {
            clearInterval(updateTimer);
        }
        window.removeEventListener('focus', checkForUpdates);
    }

    // Sistema de actualización
    function startOptimizedUpdateChecker() {
        let retryDelay = 5000; // 5 segundos iniciales
        const maxDelay = 300000; // 5 minutos máximo
        
        const checkWithBackoff = async () => {
            try {
                await checkForUpdates();
                // Si fue exitoso, volver al intervalo normal
                retryDelay = updateInterval;
            } catch (error) {
                // Si falla, aumentar el retraso progresivamente
                retryDelay = Math.min(retryDelay * 2, maxDelay);
                console.warn(`Error en la actualización. Reintentando en ${retryDelay/1000} segundos...`);
            }
            
            // Programar próximo chequeo
            updateTimer = setTimeout(checkWithBackoff, retryDelay);
        };
        
        // Iniciar el ciclo
        checkWithBackoff();
        
        // Ajustar según la visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Cuando la página vuelve a ser visible, verificar inmediatamente
                clearTimeout(updateTimer);
                checkWithBackoff();
            }
        });
    }

    // Inicializar la tabla y paginación
    displayDeductions(currentPage).then(() => {
        setupPagination();
        updatePaginationButtons();
    });

    // Validaciones para los inputs del modal
    document.getElementById('porcentajeDeduccion').addEventListener('input', function(e) {
        // Eliminar cualquier carácter que no sea número o punto
        let value = this.value.replace(/[^\d.]/g, '');
        
        // Eliminar puntos adicionales (solo permitir uno)
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Limitar a 2 decimales
        if (parts.length === 2 && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].substring(0, 2);
        }
        
        // Limitar la longitud total a 10 caracteres
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        // Validar que no empiece con punto
        if (value.startsWith('.')) {
            value = '';
        }
        
        // Validar que no sea mayor a 100
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue > 100) {
            value = '100';
        }
        
        this.value = value;
    });

    // Validación al perder el foco
    document.getElementById('porcentajeDeduccion').addEventListener('blur', function() {
        const value = this.value.trim();
        const numericValue = parseFloat(value);
        
        if (value === '' || isNaN(numericValue)) {
            this.classList.add('is-invalid');
            return;
        }
        
        // Validar formato de decimales
        const decimalParts = value.split('.');
        if (decimalParts.length === 2 && decimalParts[1].length > 2) {
            this.classList.add('is-invalid');
            return;
        }
        
        this.classList.remove('is-invalid');
    });

    // Iniciar el sistema de actualización en tiempo real (versión optimizada)
    startOptimizedUpdateChecker();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', stopUpdateChecker);
});