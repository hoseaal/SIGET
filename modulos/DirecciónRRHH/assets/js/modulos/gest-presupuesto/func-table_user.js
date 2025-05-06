document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación
    const rowsPerPage = 7;
    let currentPage = 1;
    let totalUsers = 0;
    let totalPages = 1;
    const tableBody = document.querySelector('#usersTable tbody');
    const paginationElement = document.getElementById('paginationUsers');
    let allUsersData = []; // Almacenará todos los datos de usuarios

    // Función para cargar los usuarios desde la API
    async function fetchUsers(page) {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_users.php?page=${page}&per_page=${rowsPerPage}`);
            const data = await response.json();
            
            if (data.success) {
                totalUsers = data.total;
                totalPages = data.total_pages;
                allUsersData = data.users;
                return data.users;
            } else {
                console.error('Error al cargar usuarios:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return [];
        }
    }

    // Función para obtener los datos completos de un usuario
    async function fetchUserDetails(userId) {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/carga-modal_users.php?user_id=${userId}`);
            const data = await response.json();
            
            if (data.success) {
                return data.user;
            } else {
                console.error('Error al cargar detalles:', data.message);
                return null;
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return null;
        }
    }

    // Función para mostrar los usuarios en la página actual
    async function displayUsers(page) {
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
        
        const users = await fetchUsers(page);
        
        tableBody.innerHTML = '';
        
        if (users.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < rowsPerPage; i++) {
                const row = document.createElement('tr');
                if (i === 0) {
                    row.innerHTML = `
                        <td colspan="6" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron usuarios' : '&nbsp;'}
                        </td>
                    `;
                } else {
                    row.innerHTML = '<td colspan="6" class="empty-row">&nbsp;</td>';
                }
                tableBody.appendChild(row);
            }
            return;
        }

        // Llenar con datos reales
        users.forEach((user, index) => {
            const rowNumber = (page - 1) * rowsPerPage + index + 1;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${rowNumber}</strong></td>
                <td>${user.nom_ced}</td>
                <td>${user.nom_nom}</td>
                <td>${user.nom_ape}</td>
                <td>${getUserTypeText(user.usu_tip)}</td>
                <td>
                    <div class="dropdown">
                        <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                            <i class="bx bx-dots-vertical-rounded"></i>
                        </button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item edit-user-btn" href="javascript:void(0);" data-userid="${user.usu_ide}">
                                <i class="bx bx-edit-alt me-1"></i> Editar
                            </a>
                            <a class="dropdown-item delete-user-btn" href="javascript:void(0);" data-userid="${user.usu_ide}" data-name="${user.nom_nom} ${user.nom_ape}">
                                <i class="bx bx-trash me-1"></i> Eliminar
                            </a>
                        </div>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Completar con filas vacías si no llega a rowsPerPage
        if (users.length < rowsPerPage) {
            const remainingRows = rowsPerPage - users.length;
            for (let i = 0; i < remainingRows; i++) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="6" class="empty-row">&nbsp;</td>';
                tableBody.appendChild(row);
            }
        }

        // Agregar event listeners para los botones de editar
        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const userId = this.getAttribute('data-userid');
                const userData = await fetchUserDetails(userId);
                if (userData) {
                    openEditModal(userData);
                } else {
                    alert('No se pudieron cargar los datos del usuario');
                }
            });
        });

        // Agregar event listeners para los botones de eliminar
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-userid');
                const userName = this.getAttribute('data-name');
                showDeleteConfirmation(userId, userName);
            });
        });
    }

    // Función para convertir el tipo de usuario a texto
    function getUserTypeText(type) {
        const types = {
            1: 'Administrador',
            2: 'Trabajador',
            3: 'Jefe de Área'
        };
        return types[type] || 'Desconocido';
    }

    // Función para mostrar confirmación de eliminación
    function showDeleteConfirmation(userId, userName) {
        const modalHTML = `
        <div class="modal fade" id="deleteUserConfirmationModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">Confirmar Eliminación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>¿Seguro de eliminar al usuario <strong>${userName}</strong>?</p>
                        <p class="text-danger">¡Este cambio no se puede deshacer!</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-danger" id="confirmUserDeleteBtn">
                            Sí, Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteUserConfirmationModal'));
        deleteModal.show();
        
        document.getElementById('confirmUserDeleteBtn').addEventListener('click', async function() {
            await deleteUser(userId);
            deleteModal.hide();
            document.getElementById('deleteUserConfirmationModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        });
        
        document.getElementById('deleteUserConfirmationModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Función para abrir el modal de edición con datos del usuario
    function openEditModal(userData) {
        const editModal = new bootstrap.Modal(document.getElementById('largeModal'));
        
        // datos personales (solo lectura)
        document.getElementById('cedula').value = userData.nom_ced || '';
        document.getElementById('nombre').value = userData.nom_nom || '';
        document.getElementById('apellidos').value = userData.nom_ape || '';
        
        // Llenar tipo de usuario (editable)
        const userTypeSelect = document.getElementById('cargocet');
        if (userTypeSelect) {
            userTypeSelect.value = userData.usu_tip.toString();
            console.log('Valor seleccionado:', userTypeSelect.value);
        }
        
        // Configurar el botón de guardar
        const saveButton = document.querySelector('#largeModal .btn-primary');
        saveButton.onclick = function() {
            saveUserChanges(userData.usu_ide);
        };
        
        // Mostrar el modal
        editModal.show();
    }

    // Función para guardar los cambios del usuario
    async function saveUserChanges(userId) {
        const saveButton = document.querySelector('#largeModal .btn-primary');
        const originalText = saveButton.innerHTML;
        
        // Mostrar spinner y deshabilitar botón
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        saveButton.disabled = true;
        
        try {
            // Obtener los datos del formulario
            const updatedData = {
                user_id: userId,
                user_type: document.getElementById('cargocet').value
            };
            
            // Validación básica
            if (!updatedData.user_type) {
                throw new Error('Por favor seleccione un tipo de usuario');
            }
            
            // Llamada a la API para guardar cambios
            const response = await fetch('../PHP/api/gest-presupuesto/actualizar_users.php', {
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
                displayUsers(currentPage);
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

    // Función para eliminar un usuario
    async function deleteUser(userId) {
        try {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
            loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
            loadingIndicator.style.zIndex = '1060';
            loadingIndicator.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Cargando...</span></div>';
            document.body.appendChild(loadingIndicator);
            
            const response = await fetch('../PHP/api/gest-presupuesto/eliminar_users.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId })
            });
            
            const result = await response.json();
            
            loadingIndicator.remove();
            
            if (result.success) {
                alert('Usuario eliminado correctamente');
                displayUsers(currentPage);
            } else {
                throw new Error(result.message || 'Error al eliminar el usuario');
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
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
                displayUsers(currentPage);
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
                displayUsers(currentPage);
                updatePaginationButtons();
            }
        });
        paginationElement.appendChild(li);
        
        // Números de página
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
                    displayUsers(currentPage);
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
                displayUsers(currentPage);
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
                displayUsers(currentPage);
                updatePaginationButtons();
            }
        });
        paginationElement.appendChild(li);
    }
    
    // Función para actualizar el estado de los botones de paginación
    function updatePaginationButtons() {
        const pageItems = paginationElement.querySelectorAll('.page-item');
        
        pageItems.forEach(item => {
            item.classList.remove('active');
        });
        
        pageItems.forEach(item => {
            const pageLink = item.querySelector('.page-link');
            if (pageLink && pageLink.textContent === currentPage.toString()) {
                item.classList.add('active');
            }
        });
        
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
    displayUsers(currentPage).then(() => {
        setupPagination();
        updatePaginationButtons();
    });
});