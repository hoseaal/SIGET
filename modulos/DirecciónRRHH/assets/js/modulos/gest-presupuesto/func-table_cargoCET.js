document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación
    const rowsPerPage = 7;
    let currentPage = 1;
    let totalPositions = 0;
    let totalPages = 1;
    const tableBody = document.querySelector('#workersTable tbody'); // Cambiado a workersTable
    const paginationElement = document.getElementById('pagination');

    // Función para cargar los cargos desde la API
    async function fetchPositions(page) {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_cargoCET.php?page=${page}&per_page=${rowsPerPage}`);
            const data = await response.json();
            
            if (data.success) {
                totalPositions = data.total;
                totalPages = data.total_pages;
                return {
                    positions: data.positions,
                    total: data.total
                };
            } else {
                console.error('Error al cargar cargos:', data.message);
                return {
                    positions: [],
                    total: 0
                };
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return {
                positions: [],
                total: 0
            };
        }
    }

    // Función para mostrar los cargos en la página actual
    async function displayPositions(page) {
        // Mostrar loader mientras carga
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        const {positions, total} = await fetchPositions(page);
        totalPositions = total;
        totalPages = Math.ceil(totalPositions / rowsPerPage);
        
        tableBody.innerHTML = '';
        
        if (positions.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < rowsPerPage; i++) {
                const row = document.createElement('tr');
                if (i === 0) {
                    row.innerHTML = `
                        <td colspan="3" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron cargos' : '&nbsp;'}
                        </td>
                    `;
                } else {
                    row.innerHTML = '<td colspan="3" class="empty-row">&nbsp;</td>';
                }
                tableBody.appendChild(row);
            }
            
            // Configurar paginación para 0 resultados
            setupPagination();
            return;
        }

        // Llenar con datos reales
        positions.forEach((position, index) => {
            const rowNumber = (page - 1) * rowsPerPage + index + 1;
            const row = document.createElement('tr');
            
            // Usuario tipo "0" - solo 2 columnas
            if (LOGGED_USER_TYPE === '0') {
                row.innerHTML = `
                    <td>${rowNumber}</td>
                    <td>${position.cet_car}</td>
                `;
            } 
            // Usuario tipo "1" o "2" - 3 columnas (sin eliminar)
            else if (LOGGED_USER_TYPE === '1' || LOGGED_USER_TYPE === '2') {
                row.innerHTML = `
                    <td>${rowNumber}</td>
                    <td>${position.cet_car}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-position-btn" href="javascript:void(0);" data-id="${position.cet_ide}">
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
                    <td>${position.cet_car}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-position-btn" href="javascript:void(0);" data-id="${position.cet_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                                <a class="dropdown-item delete-position-btn" href="javascript:void(0);" data-id="${position.cet_ide}" data-name="${position.cet_car}">
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
        if (positions.length < rowsPerPage) {
            const remainingRows = rowsPerPage - positions.length;
            for (let i = 0; i < remainingRows; i++) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="3" class="empty-row">&nbsp;</td>';
                row.style.height = '3.5rem';
                tableBody.appendChild(row);
            }
        }

        // Configurar event listeners solo si el usuario tiene permisos
        if (LOGGED_USER_TYPE !== '0') {
            // Configurar event listeners para editar
            document.querySelectorAll('.edit-position-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const positionId = this.getAttribute('data-id');
                    const positionName = this.closest('tr').querySelector('td:nth-child(2)').textContent;
                    
                    // Cargar datos en el modal de edición
                    const editModal = new bootstrap.Modal(document.getElementById('ModalEditCET'));
                    const modalInput = document.querySelector('#ModalEditCET #nameBasic');
                    const saveBtn = document.querySelector('#ModalEditCET .btn-primary');
                    
                    // Limpiar eventos anteriores para evitar duplicados
                    const newSaveBtn = saveBtn.cloneNode(true);
                    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
                    
                    // Configurar valores del modal
                    modalInput.value = positionName;
                    
                    // Configurar evento para guardar cambios
                    newSaveBtn.addEventListener('click', async function() {
                        const modalInput = document.querySelector('#ModalEditCET #nameBasic');
                        const newName = modalInput.value.trim();
                        
                        // Validaciones
                        if (!isValidCargoName(newName)) {
                            showInputError(modalInput, 'El nombre del cargo debe tener entre 1 y 50 caracteres válidos (solo letras y espacios).');
                            return;
                        }
                        
                        try {
                            // Mostrar loader
                            const originalButtonText = newSaveBtn.innerHTML;
                            newSaveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
                            newSaveBtn.disabled = true;
                            
                            // Enviar solicitud al servidor
                            const response = await fetch('../PHP/api/gest-presupuesto/actualizar_cargoCET.php', {
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
                            newSaveBtn.innerHTML = originalButtonText;
                            newSaveBtn.disabled = false;
                            
                            if (result.success) {
                                // Cerrar el modal
                                editModal.hide();
                                // Recargar la tabla
                                displayPositions(currentPage);
                            } else {
                                throw new Error(result.message || 'Error al actualizar el cargo');
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            alert('Error al actualizar: ' + error.message);
                            newSaveBtn.innerHTML = 'Guardar Cambios';
                            newSaveBtn.disabled = false;
                        }
                    });
                    
                    // Mostrar el modal
                    editModal.show();
                });
            });

            // Agregar event listeners para los botones de eliminar (solo para tipos 3 y 4)
            if (LOGGED_USER_TYPE === '3' || LOGGED_USER_TYPE === '4') {
                document.querySelectorAll('.delete-position-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const positionId = this.getAttribute('data-id');
                        const positionName = this.getAttribute('data-name');
                        showDeleteConfirmation(positionId, positionName);
                    });
                });
            }
        }

        // Configurar la paginación
        setupPagination();
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
                displayPositions(currentPage);
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
                displayPositions(currentPage);
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
                    displayPositions(currentPage);
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
                displayPositions(currentPage);
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
                displayPositions(currentPage);
            }
        });
        paginationElement.appendChild(li);
        
        // Actualizar estado de los botones de navegación
        updatePaginationButtons();
    }
    
    // Función para actualizar el estado de los botones de paginación
    function updatePaginationButtons() {
        const pageItems = paginationElement.querySelectorAll('.page-item');
        
        // Remover clase active de todos los items
        pageItems.forEach(item => {
            item.classList.remove('active');
            item.classList.remove('disabled');
        });
        
        // Agregar clase active al item correspondiente
        pageItems.forEach(item => {
            const pageLink = item.querySelector('.page-link:not(.tf-icon)');
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
        }
        
        if (currentPage === totalPages) {
            nextBtn.classList.add('disabled');
            lastBtn.classList.add('disabled');
        }
    }

    // Función para mostrar confirmación de eliminación
    function showDeleteConfirmation(positionId, positionName) {
        // Crear modal de confirmación
        const modalHTML = `
        <div class="modal fade" id="deletePositionConfirmationModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">Confirmar Eliminación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>¿Seguro de eliminar el cargo <strong>${positionName}</strong>?</p>
                        <p class="text-danger">¡Esta acción no se puede deshacer!</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-danger" id="confirmPositionDeleteBtn">
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
        const deleteModal = new bootstrap.Modal(document.getElementById('deletePositionConfirmationModal'));
        deleteModal.show();
        
        // Configurar evento para el botón de confirmación
        document.getElementById('confirmPositionDeleteBtn').addEventListener('click', async function() {
            await deletePosition(positionId);
            deleteModal.hide();
            // Eliminar el modal del DOM después de cerrarse
            document.getElementById('deletePositionConfirmationModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        });
        
        // Eliminar el modal del DOM si se cierra sin confirmar
        document.getElementById('deletePositionConfirmationModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Función para eliminar un cargo
    async function deletePosition(positionId) {
        try {
            // Mostrar loader
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
            loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
            loadingIndicator.style.zIndex = '1060';
            loadingIndicator.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Cargando...</span></div>';
            document.body.appendChild(loadingIndicator);
            
            // Enviar solicitud de eliminación
            const response = await fetch('../PHP/api/gest-presupuesto/eliminar_cargoCET.php', {
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
                alert('Cargo eliminado correctamente');
                // Recargar la tabla
                displayPositions(currentPage);
            } else {
                throw new Error(result.message || 'Error al eliminar el cargo');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar: ' + error.message);
        }
    }

    // Función para agregar un nuevo cargo
    document.getElementById('addCetPositionBtn').addEventListener('click', async function() {
        const inputElement = document.getElementById('newCargoCET');
        const positionName = inputElement.value.trim();
        
        // Validaciones
        if (!isValidCargoName(positionName)) {
            showInputError(inputElement, 'El nombre del cargo debe tener entre 1 y 50 caracteres válidos (solo letras y espacios).');
            return;
        }
        
        try {
            // Mostrar loader
            const originalButtonText = this.innerHTML;
            this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
            this.disabled = true;
            
            // Enviar solicitud al servidor
            const response = await fetch('../PHP/api/gest-presupuesto/agregar_cargoCET.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ position_name: positionName })
            });
            
            const result = await response.json();
            
            // Restaurar botón
            this.innerHTML = originalButtonText;
            this.disabled = false;
            
            if (result.success) {
                // Mostrar mensaje de éxito
                alert('Cargo agregado correctamente');
                
                // Limpiar el campo de entrada
                document.getElementById('newCargoCET').value = '';
                
                // Cerrar el modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('basicModal'));
                modal.hide();
                
                // Recargar la tabla (mostrando la primera página)
                currentPage = 1;
                displayPositions(currentPage);
            } else {
                throw new Error(result.message || 'Error al agregar el cargo');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar: ' + error.message);
            
            // Restaurar botón en caso de error
            const btn = document.getElementById('addCetPositionBtn');
            btn.innerHTML = 'Añadir nuevo Cargo';
            btn.disabled = false;
        }
    });

    // Función para validar el nombre del cargo
    function isValidCargoChar(char) {
        // Permite letras (mayúsculas y minúsculas), espacios, acentos y caracteres especiales del español
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
        return regex.test(char);
    }

    // Función para manejar la entrada en los campos
    function handleCargoInput(event) {
        const input = event.target;
        let value = input.value;
        let newValue = '';
        
        // Filtrar cada caracter
        for (let i = 0; i < value.length; i++) {
            if (isValidCargoChar(value[i])) {
                newValue += value[i];
            }
        }
        
        // Limitar a 50 caracteres
        if (newValue.length > 50) {
            newValue = newValue.substring(0, 50);
        }
        
        // Actualizar el valor solo si es diferente
        if (value !== newValue) {
            input.value = newValue;
            
            // Mostrar feedback visual
            input.classList.add('invalid-input');
            setTimeout(() => {
                input.classList.remove('invalid-input');
            }, 300);
        }
    }

    // Función para validar el nombre completo del cargo
    function isValidCargoName(name) {
        return name.length > 0 && name.length <= 50;
    }

    document.getElementById('newCargoCET').addEventListener('input', handleCargoInput);
    document.getElementById('nameBasic').addEventListener('input', handleCargoInput);

    // Validación en tiempo real para el input de añadir
    document.getElementById('newCargoCET').addEventListener('input', function() {
        const inputValue = this.value;
        
        // Limpiar error mientras escribe
        if (this.classList.contains('is-invalid')) {
            clearInputError(this);
        }
        
        // Validar longitud máxima
        if (inputValue.length > 50) {
            this.value = inputValue.substring(0, 50);
        }
    });

    // Validación en tiempo real para el input de editar
    document.getElementById('nameBasic').addEventListener('input', function() {
        const inputValue = this.value;
        
        // Limpiar error mientras escribe
        if (this.classList.contains('is-invalid')) {
            clearInputError(this);
        }
        
        // Validar longitud máxima
        if (inputValue.length > 50) {
            this.value = inputValue.substring(0, 50);
        }
    });
    
    // Inicializar la tabla
    displayPositions(currentPage);
});