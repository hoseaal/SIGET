document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación ONAPRE
    const onapreRowsPerPage = 7;
    let onapreCurrentPage = 1;
    let onapreTotalPositions = 0;
    let onapreTotalPages = 1;
    const onapreTableBody = document.querySelector('#onapreTable tbody');
    const onaprePaginationElement = document.getElementById('onaprePagination');

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
    function showOnapreDeleteConfirmation(positionId, positionName) {
        // Crear modal de confirmación
        const modalHTML = `
        <div class="modal fade" id="deleteOnapreConfirmationModal" tabindex="-1" aria-hidden="true">
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
        
        // Agregar el modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Mostrar el modal
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteOnapreConfirmationModal'));
        deleteModal.show();
        
        // Configurar evento para el botón de confirmación
        document.getElementById('confirmOnapreDeleteBtn').addEventListener('click', async function() {
            await deleteOnaprePosition(positionId);
            deleteModal.hide();
            // Eliminar el modal del DOM después de cerrarse
            document.getElementById('deleteOnapreConfirmationModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        });
        
        // Eliminar el modal del DOM si se cierra sin confirmar
        document.getElementById('deleteOnapreConfirmationModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
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
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s]{1,50}$/;
        
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
        const editModal = document.getElementById('ModalEditIONAPRE');
        
        // Configurar los valores en el modal
        const nameInput = editModal.querySelector('#nameBasic2');
        nameInput.value = positionName;
        
        // Configurar el botón de guardar
        const saveBtn = editModal.querySelector('.btn-primary');
        saveBtn.onclick = async function() {
            const newName = nameInput.value.trim();
            const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s]{1,50}$/;
            
            if (!newName || !regex.test(newName)) {
                nameInput.classList.add('is-invalid');
                return;
            }
            
            try {
                // Mostrar spinner en el botón
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
                saveBtn.disabled = true;
                
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
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
                
                if (result.success) {
                    // Cerrar modal y recargar datos
                    bootstrap.Modal.getInstance(editModal).hide();
                    displayOnaprePositions(onapreCurrentPage);
                } else {
                    throw new Error(result.message || 'Error al actualizar el cargo ONAPRE');
                }
            } catch (error) {
                console.error('Error al actualizar:', error);
                alert('Error al actualizar: ' + error.message);
                saveBtn.innerHTML = 'Guardar Cambios';
                saveBtn.disabled = false;
            }
        };
        
        // Mostrar el modal
        const modal = new bootstrap.Modal(editModal);
        modal.show();
        
        // Limpiar eventos y validación al cerrar
        editModal.addEventListener('hidden.bs.modal', function() {
            nameInput.classList.remove('is-invalid');
            saveBtn.onclick = null;
        });
    }

    // Validación en tiempo real para el input de nuevo cargo
    document.getElementById('newOnaprePosition').addEventListener('input', function(e) {
        // Expresión regular que solo permite letras (incluyendo acentos) y espacios
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s]{0,50}$/;
        
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
                const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s]{0,50}$/;
                
                if (!regex.test(e.target.value)) {
                    // Si no cumple con la expresión regular, revertir al último valor válido
                    e.target.value = e.target.value.substring(0, e.target.value.length - 1);
                }
            });
        }
    });

    // Inicializar la tabla ONAPRE
    displayOnaprePositions(onapreCurrentPage);
});