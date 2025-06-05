document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación ONAPRE
    const onapreRowsPerPage = 7;
    let onapreCurrentPage = 1;
    let onapreTotalPositions = 0;
    let onapreTotalPages = 1;
    const onapreTableBody = document.querySelector('#onapreTable tbody');
    const onaprePaginationElement = document.getElementById('onaprePagination');

    // Variables para el control de actualización en tiempo real ONAPRE
    let onapreLastUpdateTimestamp = null;
    let onapreUpdateInterval = 2000; // 2 segundo
    let onapreUpdateTimer = null;
    let isOnapreUpdating = false;

    function cleanupModals() {
        // Eliminar todos los backdrops
        document.querySelectorAll('.modal-backdrop').forEach(el => {
            el.classList.add('fade', 'show'); // Asegurar animación de fade out
            setTimeout(() => el.remove(), 300); // Esperar a que termine la animación
        });
        
        // Restaurar el scroll del body
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0';
        
        // Cerrar todos los modales abiertos
        document.querySelectorAll('.modal.show').forEach(modal => {
            const instance = bootstrap.Modal.getInstance(modal);
            if (instance) {
                instance.hide();
                setTimeout(() => {
                    instance.dispose();
                    modal.remove();
                }, 300);
            } else {
                modal.remove();
            }
        });
    }

    // Función para cargar los cargos ONAPRE desde la API
    async function fetchOnaprePositions(page) {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_cargoONAPRE.php?page=${page}&per_page=${onapreRowsPerPage}`);
            const data = await response.json();
            
            if (data.success) {
                onapreTotalPositions = data.total;
                onapreTotalPages = data.total_pages;
                return {
                    positions: data.positions,
                    total: data.total
                };
            } else {
                console.error('Error al cargar cargos ONAPRE:', data.message);
                return {
                    positions: [],
                    total: 0
                };
            }
        } catch (error) {
            console.error('Error en la solicitud ONAPRE:', error);
            return {
                positions: [],
                total: 0
            };
        }
    }

    // Función para mostrar los cargos ONAPRE en la página actual
    async function displayOnaprePositions(page) {
        // Mostrar loader mientras carga
        onapreTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        const {positions, total} = await fetchOnaprePositions(page);
        onapreTotalPositions = total;
        onapreTotalPages = Math.ceil(onapreTotalPositions / onapreRowsPerPage);
        
        onapreTableBody.innerHTML = '';
        
        if (positions.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < onapreRowsPerPage; i++) {
                const row = document.createElement('tr');
                if (i === 0) {
                    row.innerHTML = `
                        <td colspan="3" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron cargos ONAPRE' : '&nbsp;'}
                        </td>
                    `;
                } else {
                    row.innerHTML = '<td colspan="3" class="empty-row">&nbsp;</td>';
                }
                onapreTableBody.appendChild(row);
            }
            
            // Configurar paginación para 0 resultados
            setupOnaprePagination();
            return;
        }

        // Llenar con datos reales
        positions.forEach((position, index) => {
            const rowNumber = (page - 1) * onapreRowsPerPage + index + 1;
            const row = document.createElement('tr');
            
            // Usuario tipo "0" - solo 2 columnas
            if (LOGGED_USER_TYPE === '0') {
                row.innerHTML = `
                    <td>${rowNumber}</td>
                    <td>${position.ona_car}</td>
                `;
            } 
            // Usuario tipo "1" o "2" - 3 columnas (sin eliminar)
            else if (LOGGED_USER_TYPE === '1' || LOGGED_USER_TYPE === '2') {
                row.innerHTML = `
                    <td>${rowNumber}</td>
                    <td>${position.ona_car}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-onapre-btn" href="javascript:void(0);" data-id="${position.ona_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            } 
            // Usuario tipo "3" o "4" - 3 columnas con todas las acciones
            else {
                row.innerHTML = `
                    <td>${rowNumber}</td>
                    <td>${position.ona_car}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-onapre-btn" href="javascript:void(0);" data-id="${position.ona_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                                <a class="dropdown-item delete-onapre-btn" href="javascript:void(0);" data-id="${position.ona_ide}" data-name="${position.ona_car}">
                                    <i class="bx bx-trash me-1"></i> Eliminar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            }
            
            onapreTableBody.appendChild(row);
        });

        // Completar con filas vacías si no llega a onapreRowsPerPage
        if (positions.length < onapreRowsPerPage) {
            const remainingRows = onapreRowsPerPage - positions.length;
            for (let i = 0; i < remainingRows; i++) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="3" class="empty-row">&nbsp;</td>';
                row.style.height = '3.5rem';
                onapreTableBody.appendChild(row);
            }
        }

        // Configurar event listeners solo si el usuario tiene permisos
        if (LOGGED_USER_TYPE !== '0') {
            // Agregar event listeners para los botones de editar
            document.querySelectorAll('.edit-onapre-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const positionId = this.getAttribute('data-id');
                    const positionName = this.closest('tr').querySelector('td:nth-child(2)').textContent;
                    showOnapreEditModal(positionId, positionName);
                });
            });

            // Agregar event listeners para los botones de eliminar (solo para tipos 3 y 4)
            if (LOGGED_USER_TYPE === '3' || LOGGED_USER_TYPE === '4') {
                document.querySelectorAll('.delete-onapre-btn').forEach(btn => {
                    // Limpiar eventos existentes primero
                    const newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                    
                    // Agregar nuevo listener
                    newBtn.addEventListener('click', function() {
                        const positionId = this.getAttribute('data-id');
                        const positionName = this.getAttribute('data-name');
                        showOnapreDeleteConfirmation(positionId, positionName);
                    });
                });
            }
        }

        // Configurar la paginación
        setupOnaprePagination();

        // Agregar event listeners para los botones de editar
        document.querySelectorAll('.edit-onapre-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const positionId = this.getAttribute('data-id');
                const positionName = this.closest('tr').querySelector('td:nth-child(2)').textContent;
                showOnapreEditModal(positionId, positionName);
            });
        });

        // Agregar event listeners para los botones de eliminar
        document.querySelectorAll('.delete-onapre-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const positionId = this.getAttribute('data-id');
                const positionName = this.getAttribute('data-name');
                showOnapreDeleteConfirmation(positionId, positionName);
            });
        });
    }

    // Función para configurar la paginación ONAPRE
    function setupOnaprePagination() {
        onaprePaginationElement.innerHTML = '';
        
        // Botón Primera página
        let li = document.createElement('li');
        li.className = 'page-item first';
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-left"></i></a>`;
        li.addEventListener('click', () => {
            if (onapreCurrentPage !== 1) {
                onapreCurrentPage = 1;
                displayOnaprePositions(onapreCurrentPage);
            }
        });
        onaprePaginationElement.appendChild(li);
        
        // Botón Página anterior
        li = document.createElement('li');
        li.className = 'page-item prev';
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-left"></i></a>`;
        li.addEventListener('click', () => {
            if (onapreCurrentPage > 1) {
                onapreCurrentPage--;
                displayOnaprePositions(onapreCurrentPage);
            }
        });
        onaprePaginationElement.appendChild(li);
        
        // Números de página (mostramos máximo 5 páginas alrededor de la actual)
        const startPage = Math.max(1, onapreCurrentPage - 2);
        const endPage = Math.min(onapreTotalPages, onapreCurrentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            li = document.createElement('li');
            li.className = 'page-item';
            if (i === onapreCurrentPage) li.classList.add('active');
            li.innerHTML = `<a class="page-link" href="javascript:void(0);">${i}</a>`;
            li.addEventListener('click', () => {
                if (onapreCurrentPage !== i) {
                    onapreCurrentPage = i;
                    displayOnaprePositions(onapreCurrentPage);
                }
            });
            onaprePaginationElement.appendChild(li);
        }
        
        // Botón Página siguiente
        li = document.createElement('li');
        li.className = 'page-item next';
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-right"></i></a>`;
        li.addEventListener('click', () => {
            if (onapreCurrentPage < onapreTotalPages) {
                onapreCurrentPage++;
                displayOnaprePositions(onapreCurrentPage);
            }
        });
        onaprePaginationElement.appendChild(li);
        
        // Botón Última página
        li = document.createElement('li');
        li.className = 'page-item last';
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-right"></i></a>`;
        li.addEventListener('click', () => {
            if (onapreCurrentPage !== onapreTotalPages) {
                onapreCurrentPage = onapreTotalPages;
                displayOnaprePositions(onapreCurrentPage);
            }
        });
        onaprePaginationElement.appendChild(li);
        
        // Actualizar estado de los botones de navegación
        updateOnaprePaginationButtons();
    }
    
    // Función para actualizar el estado de los botones de paginación ONAPRE
    function updateOnaprePaginationButtons() {
        const pageItems = onaprePaginationElement.querySelectorAll('.page-item');
        
        // Remover clase active de todos los items
        pageItems.forEach(item => {
            item.classList.remove('active');
            item.classList.remove('disabled');
        });
        
        // Agregar clase active al item correspondiente
        pageItems.forEach(item => {
            const pageLink = item.querySelector('.page-link:not(.tf-icon)');
            if (pageLink && pageLink.textContent === onapreCurrentPage.toString()) {
                item.classList.add('active');
            }
        });
        
        // Actualizar estado de los botones de navegación
        const firstBtn = onaprePaginationElement.querySelector('.first');
        const prevBtn = onaprePaginationElement.querySelector('.prev');
        const nextBtn = onaprePaginationElement.querySelector('.next');
        const lastBtn = onaprePaginationElement.querySelector('.last');
        
        if (onapreCurrentPage === 1) {
            firstBtn.classList.add('disabled');
            prevBtn.classList.add('disabled');
        }
        
        if (onapreCurrentPage === onapreTotalPages) {
            nextBtn.classList.add('disabled');
            lastBtn.classList.add('disabled');
        }
    }

    // Función para mostrar confirmación de eliminación ONAPRE
    let currentDeleteModal = null;

    function showOnapreDeleteConfirmation(positionId, positionName) {
        // Cerrar y limpiar cualquier modal existente
        if (currentDeleteModal) {
            currentDeleteModal.hide();
            const modalElement = document.getElementById(currentDeleteModal.id);
            if (modalElement) {
                modalElement.remove();
            }
            currentDeleteModal = null;
        }
        
        // Limpiar backdrops
        cleanupModals();
        
        // Crear ID único para el modal
        const modalId = `deleteOnapreConfirmationModal_${Date.now()}`;
        
        // Crear HTML del modal
        const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">Confirmar Eliminación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>¿Seguro de eliminar el cargo ONAPRE <strong>${positionName}</strong>?</p>
                        <p class="text-danger">¡Esta acción no se puede deshacer!</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-danger" id="confirmOnapreDeleteBtn">
                            Sí, Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        // Insertar el modal en el DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modalElement = document.getElementById(modalId);
        
        // Crear nueva instancia del modal y guardar referencia
        currentDeleteModal = {
            instance: new bootstrap.Modal(modalElement),
            id: modalId
        };
        
        // Mostrar el modal
        currentDeleteModal.instance.show();
        
        // Configurar evento de confirmación (usando delegación de eventos)
        modalElement.addEventListener('click', function modalClickHandler(e) {
            if (e.target && e.target.id === 'confirmOnapreDeleteBtn') {
                // Eliminar el handler inmediatamente para evitar múltiples ejecuciones
                modalElement.removeEventListener('click', modalClickHandler);
                
                // Ejecutar la eliminación
                deleteOnaprePosition(positionId).finally(() => {
                    if (currentDeleteModal) {
                        currentDeleteModal.instance.hide();
                    }
                });
            }
        });
        
        // Manejar el cierre del modal
        modalElement.addEventListener('hidden.bs.modal', function() {
            // Limpiar referencia
            currentDeleteModal = null;
            
            // Eliminar el modal del DOM
            modalElement.remove();
            
            // Limpiar backdrops
            cleanupModals();
        });
    }

    // Función para eliminar un cargo ONAPRE
    async function deleteOnaprePosition(positionId) {
        try {
            // Mostrar loader
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
            loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
            loadingIndicator.style.zIndex = '1060';
            loadingIndicator.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Cargando...</span></div>';
            document.body.appendChild(loadingIndicator);
            
            // Enviar solicitud de eliminación
            const response = await fetch('../PHP/api/gest-presupuesto/eliminar_cargoONAPRE.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ position_id: positionId })
            });
            
            const result = await response.json();
            
            // Eliminar loader
            loadingIndicator.remove();
            
            if (result.success) {
                // Mostrar mensaje de éxito
                alert('Cargo ONAPRE eliminado correctamente');
                // Recargar la tabla
                displayOnaprePositions(onapreCurrentPage);
            } else {
                throw new Error(result.message || 'Error al eliminar el cargo ONAPRE');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar: ' + error.message);
        }
    }

    // Función para agregar un nuevo cargo ONAPRE
    document.getElementById('addOnaprePositionBtn').addEventListener('click', async function() {
        const positionInput = document.getElementById('newOnaprePosition');
        const positionName = positionInput.value.trim();
        
        // Validación adicional por si el usuario pega texto no válido
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s()]{1,50}$/;
        
        if (!positionName) {
            positionInput.classList.add('is-invalid');
            return;
        } else if (!regex.test(positionName)) {
            positionInput.classList.add('is-invalid');
            return;
        } else {
            positionInput.classList.remove('is-invalid');
        }
        
        try {
            const originalButtonText = this.innerHTML;
            this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
            this.disabled = true;
            
            const response = await fetch('../PHP/api/gest-presupuesto/agregar_cargoONAPRE.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ position_name: positionName })
            });
            
            const result = await response.json();
            
            this.innerHTML = originalButtonText;
            this.disabled = false;
            
            if (result.success) {
                alert('Cargo ONAPRE agregado correctamente');
                document.getElementById('newOnaprePosition').value = '';
                bootstrap.Modal.getInstance(document.getElementById('onapreModal')).hide();
                onapreCurrentPage = 1;
                displayOnaprePositions(onapreCurrentPage);
            } else {
                throw new Error(result.message || 'Error al agregar el cargo ONAPRE');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar: ' + error.message);
            
            const btn = document.getElementById('addOnaprePositionBtn');
            btn.innerHTML = 'Añadir nuevo Cargo';
            btn.disabled = false;
        }
    });

    // Función para mostrar el modal de edición ONAPRE
    function showOnapreEditModal(positionId, positionName) {
        // Obtener el modal
        const editModalElement = document.getElementById('ModalEditIONAPRE');
        
        // Limpiar cualquier modal backdrop existente
        const existingBackdrops = document.querySelectorAll('.modal-backdrop');
        existingBackdrops.forEach(backdrop => backdrop.remove());
        
        // Limpiar cualquier instancia previa del modal
        const existingModal = bootstrap.Modal.getInstance(editModalElement);
        if (existingModal) {
            existingModal.dispose();
        }
        
        // Clonar y reemplazar el botón de guardar para evitar duplicados
        const originalSaveBtn = editModalElement.querySelector('.btn-primary');
        const newSaveBtn = originalSaveBtn.cloneNode(true);
        originalSaveBtn.parentNode.replaceChild(newSaveBtn, originalSaveBtn);
        
        // Configurar los valores en el modal
        const nameInput = editModalElement.querySelector('#nameBasic2');
        nameInput.value = positionName;
        nameInput.classList.remove('is-invalid');
        
        // Configurar el nuevo botón de guardar
        newSaveBtn.onclick = async function() {
            const newName = nameInput.value.trim();
            const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s()]{1,50}$/;
            
            if (!newName || !regex.test(newName)) {
                nameInput.classList.add('is-invalid');
                return;
            }
            
            try {
                // Mostrar spinner en el botón
                const originalText = newSaveBtn.innerHTML;
                newSaveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
                newSaveBtn.disabled = true;
                
                // Enviar solicitud de actualización
                const response = await fetch('../PHP/api/gest-presupuesto/actualizar_cargoONAPRE.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        position_id: positionId,
                        new_name: newName
                    })
                });
                
                const result = await response.json();
                
                // Restaurar botón
                newSaveBtn.innerHTML = originalText;
                newSaveBtn.disabled = false;
                
                if (result.success) {
                    // Cerrar modal y recargar datos
                    const modalInstance = bootstrap.Modal.getInstance(editModalElement);
                    modalInstance.hide();
                    
                    // Actualizar el timestamp
                    onapreLastUpdateTimestamp = result.timestamp || new Date().toISOString();
                    displayOnaprePositions(onapreCurrentPage);
                } else {
                    throw new Error(result.message || 'Error al actualizar el cargo ONAPRE');
                }
            } catch (error) {
                console.error('Error al actualizar:', error);
                alert('Error al actualizar: ' + error.message);
                newSaveBtn.innerHTML = 'Guardar Cambios';
                newSaveBtn.disabled = false;
            }
        };

        // Crear nueva instancia del modal
        const modal = new bootstrap.Modal(editModalElement, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
        
        // Mostrar el modal
        modal.show();
        
        // Manejar el cierre del modal correctamente
        editModalElement.addEventListener('hidden.bs.modal', function() {
            // Limpiar eventos
            newSaveBtn.onclick = null;
            
            // Eliminar el backdrop si persiste
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            
            // Habilitar el scroll del body
            document.body.style.overflow = 'auto';
            document.body.style.paddingRight = '0';
        });
    }

    // Validación en tiempo real para el input de nuevo cargo
    document.getElementById('newOnaprePosition').addEventListener('input', function(e) {
        // Expresión regular que solo permite letras (incluyendo acentos) y espacios
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s()]{1,50}$/;
        
        if (!regex.test(e.target.value)) {
            // Si no cumple con la expresión regular, revertir al último valor válido
            e.target.value = e.target.value.substring(0, e.target.value.length - 1);
        }
    });

    // Validación en tiempo real para el input de edición
    document.addEventListener('shown.bs.modal', function(e) {
        if (e.target.id === 'ModalEditIONAPRE') {
            const editInput = document.getElementById('nameBasic2');
            
            editInput.addEventListener('input', function(e) {
                // Expresión regular que solo permite letras (incluyendo acentos) y espacios
                const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s()]{1,50}$/;
                
                if (!regex.test(e.target.value)) {
                    // Si no cumple con la expresión regular, revertir al último valor válido
                    e.target.value = e.target.value.substring(0, e.target.value.length - 1);
                }
            });
        }
    });

    // Función para verificar cambios en bit_ona
    async function checkOnapreForUpdates() {
        if (isOnapreUpdating) return;
        isOnapreUpdating = true;
        
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/check_onapre_updates.php?last_update=${onapreLastUpdateTimestamp || ''}`);
            const data = await response.json();
            
            if (data.success && data.has_changes) {
                onapreLastUpdateTimestamp = data.last_update;
                
                // Actualizar la tabla con animación suave
                await smoothOnapreUpdateTable();
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones ONAPRE:', error);
        } finally {
            isOnapreUpdating = false;
        }
    }

    // Función para actualizar la tabla ONAPRE con animación suave
    async function smoothOnapreUpdateTable() {
        // Agregar clase de transición a la tabla
        const table = document.getElementById('onapreTable');
        table.classList.add('table-updating');
        
        // Mostrar indicador de actualización
        const updateIndicator = document.createElement('div');
        table.parentNode.insertBefore(updateIndicator, table);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Recargar datos
        await displayOnaprePositions(onapreCurrentPage);
        
        // Ocultar indicador y quitar clase de transición
        updateIndicator.remove();
        table.classList.remove('table-updating');
        
        // Mostrar notificación de actualización
        showOnapreUpdateNotification();
    }

    // Función para mostrar notificación de actualización ONAPRE
    function showOnapreUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification onapre-notification';
        notification.innerHTML = 'Datos de cargos ONAPRE actualizados <i class="bx bx-check"></i>';
        
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

    // Iniciar el sistema de actualización periódica ONAPRE
    function startOnapreUpdateChecker() {
        // Verificar actualizaciones inmediatamente
        checkOnapreForUpdates();
        
        // Configurar intervalo periódico
        onapreUpdateTimer = setInterval(checkOnapreForUpdates, onapreUpdateInterval);
        
        // También verificar cuando la ventana gana foco
        window.addEventListener('focus', checkOnapreForUpdates);
    }

    // Detener el sistema de actualización ONAPRE
    function stopOnapreUpdateChecker() {
        if (onapreUpdateTimer) {
            clearInterval(onapreUpdateTimer);
        }
        window.removeEventListener('focus', checkOnapreForUpdates);
    }

    // Función mejorada para mostrar modales
    function showBootstrapModal(modalElement, options = {}) {
        // Limpiar antes de abrir
        cleanupModals();
        
        // Configuración por defecto
        const defaultOptions = {
            backdrop: true,
            keyboard: true,
            focus: true
        };
        
        // Combinar opciones
        const modalOptions = {...defaultOptions, ...options};
        
        // Crear instancia del modal
        const modal = new bootstrap.Modal(modalElement, modalOptions);
        
        // Mostrar el modal
        modal.show();
        
        // Manejar el cierre
        const handleHide = () => {
            modalElement.removeEventListener('hidden.bs.modal', handleHide);
            cleanupModals();
        };
        
        modalElement.addEventListener('hidden.bs.modal', handleHide);
        
        return modal;
    }

    // Inicializar la tabla ONAPRE
    displayOnaprePositions(onapreCurrentPage);

    // Iniciar el sistema de actualización en tiempo real
    startOnapreUpdateChecker();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', stopOnapreUpdateChecker);

    window.addEventListener('beforeunload', function() {
        stopOnapreUpdateChecker();
        cleanupModals();
        currentDeleteModal = null;
    });
});