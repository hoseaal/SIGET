document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación
    const rowsPerPage = 7;
    let currentPage = 1;
    let totalRegistros = 0;
    let totalPages = 1;
    const tableBody = document.querySelector('#cajaAhorroTable tbody');
    const paginationElement = document.getElementById('paginationCajaAhorro');

    // Variables para el control de actualización en tiempo real
    let lastUpdateTimestampCaja = null;
    let updateIntervalCaja = 1000; // 1 segundo
    let updateTimerCaja = null;
    let isUpdatingCaja = false;

    // Variables para búsqueda
    let allTrabajadores = [];
    let isSearching = false;
    let currentSearchTerm = '';

    // Función para cargar TODOS los trabajadores desde la API (para búsqueda)
    async function fetchAllTrabajadores() {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_caja-ahorro.php?all=true`);
            const data = await response.json();
            
            if (data.success) {
                allTrabajadores = data.trabajadores;
                return data.trabajadores;
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
    async function fetchTrabajadores(page) {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_caja-ahorro.php?page=${page}&per_page=${rowsPerPage}`);
            const data = await response.json();
            
            if (data.success) {
                totalRegistros = data.total;
                totalPages = data.total_pages;
                return {
                    trabajadores: data.trabajadores,
                    total: data.total,
                    total_pages: data.total_pages
                };
            } else {
                console.error('Error al cargar trabajadores:', data.message);
                return {
                    trabajadores: [],
                    total: 0,
                    total_pages: 0
                };
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return {
                trabajadores: [],
                total: 0,
                total_pages: 0
            };
        }
    }

    // Función para filtrar localmente
    function filterTrabajadoresLocally(trabajadores, searchTerm) {
        if (!searchTerm) return trabajadores;
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        return trabajadores.filter(trabajador => {
            return (
                (trabajador.nom_ced && trabajador.nom_ced.toLowerCase().includes(lowerSearchTerm)) ||
                (trabajador.nom_nom && trabajador.nom_nom.toLowerCase().includes(lowerSearchTerm)) ||
                (trabajador.nom_ape && trabajador.nom_ape.toLowerCase().includes(lowerSearchTerm)) ||
                (trabajador.cep_activa !== undefined && (trabajador.cep_activa ? 'activo' : 'inactivo').includes(lowerSearchTerm))
            );
        });
    }

    // Función para mostrar los trabajadores en la página actual
    async function displayTrabajadores(page, trabajadoresToDisplay = null) {
        const isFiltered = trabajadoresToDisplay !== null;
        
        // Mostrar loader mientras carga
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        let trabajadores = [];
        if (isFiltered) {
            trabajadores = trabajadoresToDisplay;
            totalRegistros = trabajadores.length;
            totalPages = Math.ceil(trabajadores.length / rowsPerPage);
        } else {
            const result = await fetchTrabajadores(page);
            trabajadores = result.trabajadores;
            totalRegistros = result.total;
            totalPages = result.total_pages;
        }
        
        // Pequeño retraso para evitar parpadeo con cargas rápidas
        await new Promise(resolve => setTimeout(resolve, 200));
        
        tableBody.innerHTML = '';
        
        if (trabajadores.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < rowsPerPage; i++) {
                const row = document.createElement('tr');
                if (i === 0) {
                    row.innerHTML = `
                        <td colspan="5" class="text-center empty-row">
                            ${isFiltered ? 'No se encontraron coincidencias' : 'No se encontraron registros'}
                        </td>
                    `;
                } else {
                    row.innerHTML = '<td colspan="5" class="empty-row">&nbsp;</td>';
                }
                tableBody.appendChild(row);
            }
            
            // Actualizar paginación para reflejar que no hay datos
            setupPagination();
            return;
        }

        // Llenar con datos reales
        trabajadores.forEach((trabajador, index) => {
            const row = document.createElement('tr');
            const numeroItem = (page - 1) * rowsPerPage + index + 1;
            
            row.innerHTML = `
                <td>${numeroItem}</td>
                <td>${trabajador.nom_ced}</td>
                <td>${trabajador.nom_nom || 'N/A'} ${trabajador.nom_ape || ''}</td>
                <td>
                    <span class="badge ${trabajador.cep_activa ? 'bg-label-primary' : 'bg-label-secondary'}">
                        ${trabajador.cep_activa ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="dropdown">
                        <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                            <i class="bx bx-dots-vertical-rounded"></i>
                        </button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item edit-trabajador-btn" href="javascript:void(0);" data-cep_ide="${trabajador.cep_ide}">
                                <i class="bx bx-edit-alt me-1"></i> Editar
                            </a>
                            <a class="dropdown-item delete-trabajador-btn" href="javascript:void(0);" 
                            data-cep_ide="${trabajador.cep_ide}" 
                            data-nom_ced="${trabajador.nom_ced}" 
                            data-nombre="${trabajador.nom_nom || 'N/A'} ${trabajador.nom_ape || ''}">
                                <i class="bx bx-trash me-1"></i> Eliminar
                            </a>
                        </div>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Completar con filas vacías si no llega a rowsPerPage
        if (trabajadores.length < rowsPerPage) {
            const remainingRows = rowsPerPage - trabajadores.length;
            for (let i = 0; i < remainingRows; i++) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="5" class="empty-row">&nbsp;</td>';
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
        const searchInput = document.getElementById('cajaAhorroSearch');
        let searchTimeout;
        
        // Cargar todos los registros al iniciar para búsquedas
        fetchAllTrabajadores();
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            
            const searchTerm = this.value.trim();
            currentSearchTerm = searchTerm;
            
            if (searchTerm.length === 0) {
                // Si el buscador está vacío, volver a la paginación normal
                isSearching = false;
                currentPage = 1;
                displayTrabajadores(currentPage);
                paginationElement.style.display = '';
                return;
            }
            
            // Pequeño retraso para no hacer búsquedas con cada tecla
            searchTimeout = setTimeout(async () => {
                isSearching = true;
                
                // Mostrar loader
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Buscando...</span>
                            </div>
                        </td>
                    </tr>
                `;
                
                // Si no tenemos todos los registros cargados, intentar cargarlos
                if (allTrabajadores.length === 0) {
                    allTrabajadores = await fetchAllTrabajadores();
                }
                
                // Filtrar localmente con todos los datos
                const filtered = filterTrabajadoresLocally(allTrabajadores, searchTerm);
                displayTrabajadores(1, filtered);
                paginationElement.style.display = filtered.length > rowsPerPage ? '' : 'none';
            }, 300);
        });
        
        // Restaurar paginación si se borra la búsqueda
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Escape' || this.value.trim() === '') {
                this.value = '';
                isSearching = false;
                currentPage = 1;
                displayTrabajadores(currentPage);
                paginationElement.style.display = '';
            }
        });
    }

    // Función para configurar los event listeners
    function setupEventListeners() {
        // Agregar event listeners para los botones de editar
        document.querySelectorAll('.edit-trabajador-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const cep_ide = this.getAttribute('data-cep_ide');
                try {
                    const response = await fetch(`../PHP/api/gest-presupuesto/detalles_caja-ahorro.php?cep_ide=${cep_ide}`);
                    const data = await response.json();
                    
                    if (data.success) {
                        openEditModal(data.trabajador);
                    } else {
                        alert('No se pudieron cargar los datos del trabajador');
                    }
                } catch (error) {
                    console.error('Error al cargar detalles:', error);
                    alert('Error al cargar los detalles del trabajador');
                }
            });
        });

        // Agregar event listeners para los botones de eliminar
        document.querySelectorAll('.delete-trabajador-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const cep_ide = this.getAttribute('data-cep_ide');
                const nom_ced = this.getAttribute('data-nom_ced');
                const nombre = this.getAttribute('data-nombre');
                showDeleteConfirmation(cep_ide, nom_ced, nombre);
            });
        });
    }

    // Función para mostrar confirmación de eliminación
    function showDeleteConfirmation(cep_ide, nom_ced, nombre) {
        const modalHTML = `
        <div class="modal fade" id="deleteConfirmationModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">Confirmar Eliminación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>¿Seguro de eliminar al trabajador: "<strong>${nombre}</strong>" con cédula: "<strong>${nom_ced}</strong>" de la caja de ahorro?</p>
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
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
        deleteModal.show();
        
        document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
            await deleteTrabajador(cep_ide);
            deleteModal.hide();
            document.getElementById('deleteConfirmationModal').remove();
        });
        
        document.getElementById('deleteConfirmationModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Función para eliminar un trabajador de la caja de ahorro
    async function deleteTrabajador(cep_ide) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
        loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
        loadingIndicator.style.zIndex = '1060';
        loadingIndicator.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Cargando...</span></div>';
        document.body.appendChild(loadingIndicator);
        
        try {
            const response = await fetch('../PHP/api/gest-presupuesto/eliminar_caja-ahorro.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cep_ide: cep_ide })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `Error HTTP: ${response.status}`);
            }
            
            if (result.success) {
                // Verificar si debemos cambiar de página
                if (currentPage > 1 && (totalRegistros - 1) <= ((currentPage - 1) * rowsPerPage)) {
                    currentPage--;
                }
                
                // Recargar la tabla
                if (isSearching) {
                    // Si estamos en modo búsqueda, recargar todos los datos y volver a filtrar
                    allTrabajadores = await fetchAllTrabajadores();
                    const filtered = filterTrabajadoresLocally(allTrabajadores, currentSearchTerm);
                    displayTrabajadores(1, filtered);
                } else {
                    // Si no, recargar la página actual normalmente
                    await displayTrabajadores(currentPage);
                }
                alert(result.message || 'Trabajador eliminado de la caja de ahorro correctamente');
            } else {
                throw new Error(result.message || 'Error al eliminar el trabajador');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar: ' + error.message);
        } finally {
            loadingIndicator.remove();
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
                    const filtered = filterTrabajadoresLocally(allTrabajadores, currentSearchTerm);
                    displayTrabajadores(1, filtered);
                } else {
                    displayTrabajadores(currentPage);
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
                    const filtered = filterTrabajadoresLocally(allTrabajadores, currentSearchTerm);
                    displayTrabajadores(currentPage, filtered);
                } else {
                    displayTrabajadores(currentPage);
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
                        const filtered = filterTrabajadoresLocally(allTrabajadores, currentSearchTerm);
                        displayTrabajadores(currentPage, filtered);
                    } else {
                        displayTrabajadores(currentPage);
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
                    const filtered = filterTrabajadoresLocally(allTrabajadores, currentSearchTerm);
                    displayTrabajadores(currentPage, filtered);
                } else {
                    displayTrabajadores(currentPage);
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
                    const filtered = filterTrabajadoresLocally(allTrabajadores, currentSearchTerm);
                    displayTrabajadores(currentPage, filtered);
                } else {
                    displayTrabajadores(currentPage);
                }
            }
        });
        paginationElement.appendChild(li);
    }

    // Función para abrir el modal de edición con datos
    async function openEditModal(trabajadorData) {
        // Cargar los trabajadores disponibles
        try {
            const response = await fetch('../PHP/api/gest-presupuesto/carga-modal_caja-ahorro.php');
            const data = await response.json();
            
            if (!data.success) {
                throw new Error('No se pudieron cargar los trabajadores');
            }

            const selectTrabajador = document.getElementById('trabajadorSelect');
            selectTrabajador.innerHTML = '<option value="">Seleccione un trabajador</option>';
            
            // Agregar todos los trabajadores (incluyendo el actual)
            data.todosLosTrabajadores.forEach(trabajador => {
                const option = document.createElement('option');
                option.value = trabajador.nom_ced;
                option.textContent = `${trabajador.nombre_completo} (${trabajador.nom_ced})`;
                option.selected = trabajador.nom_ced === trabajadorData.nom_ced;
                selectTrabajador.appendChild(option);
            });

            // Configurar el estado del switch
            document.getElementById('estadoCajaAhorro').checked = trabajadorData.cep_activa == 1;

            // Configurar el botón de guardar
            const saveButton = document.querySelector('#ModalCajaAhorro .btn-primary');
            saveButton.onclick = async function() {
                await updateTrabajador(trabajadorData.cep_ide);
            };

            // Mostrar el modal
            const editModal = new bootstrap.Modal(document.getElementById('ModalCajaAhorro'));
            editModal.show();

        } catch (error) {
            console.error('Error al cargar datos del modal:', error);
            alert('Error al cargar los datos necesarios para editar');
        }
    }

    // Función para actualizar un trabajador en la caja de ahorro
    async function updateTrabajador(cep_ide) {
        const saveButton = document.querySelector('#ModalCajaAhorro .btn-primary');
        const originalText = saveButton.innerHTML;
        
        // Mostrar spinner y deshabilitar botón
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        saveButton.disabled = true;
        
        try {
            // Obtener los datos del formulario
            const updatedData = {
                cep_ide: cep_ide,
                nom_ced: document.getElementById('trabajadorSelect').value,
                cep_activa: document.getElementById('estadoCajaAhorro').checked ? 1 : 0
            };

            // Validación básica
            if (!updatedData.nom_ced) {
                throw new Error('Seleccione un trabajador');
            }
            
            // Llamada a la API para guardar cambios
            const response = await fetch('../PHP/api/gest-presupuesto/actualizar_caja-ahorro.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Error en la respuesta del servidor');
            }
            
            if (result.success) {
                // Cerrar el modal
                bootstrap.Modal.getInstance(document.getElementById('ModalCajaAhorro')).hide();
                
                // Mostrar mensaje de éxito
                alert('Cambios guardados exitosamente');
                
                // Recargar los datos
                if (isSearching) {
                    allTrabajadores = await fetchAllTrabajadores();
                    const filtered = filterTrabajadoresLocally(allTrabajadores, currentSearchTerm);
                    displayTrabajadores(1, filtered);
                } else {
                    await displayTrabajadores(currentPage);
                }
            } else {
                throw new Error(result.message || 'Error al guardar los cambios');
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error: ' + error.message);
        } finally {
            // Restaurar el botón
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
        }
    }

    // Función para agregar un nuevo trabajador
    async function agregarTrabajador() {
        const agregarBtn = document.getElementById('confirmarAgregarBtn');
        const originalText = agregarBtn.innerHTML;
        
        // Mostrar spinner y deshabilitar botón
        agregarBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Agregando...';
        agregarBtn.disabled = true;
        
        try {
            // Obtener el valor seleccionado de Select2
            const nuevoTrabajador = $('#nuevoTrabajadorSelect').val();
            const estado = document.getElementById('nuevoEstadoCajaAhorro').checked ? 1 : 0;

            if (!nuevoTrabajador) {
                throw new Error('Seleccione un trabajador');
            }

            const response = await fetch('../PHP/api/gest-presupuesto/agregar_caja-ahorro.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom_ced: nuevoTrabajador,
                    cep_activa: estado
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Error en la respuesta del servidor');
            }
            
            if (result.success) {
                // Cerrar el modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalAgregarCajaAhorro'));
                modal.hide();
                
                // Mostrar mensaje de éxito
                alert(result.message || 'Trabajador agregado correctamente');
                
                // Recargar la tabla (volver a la primera página)
                currentPage = 1;
                if (isSearching) {
                    allTrabajadores = await fetchAllTrabajadores();
                    const filtered = filterTrabajadoresLocally(allTrabajadores, currentSearchTerm);
                    displayTrabajadores(1, filtered);
                } else {
                    await displayTrabajadores(currentPage);
                }
            } else {
                throw new Error(result.message || 'Error al agregar el trabajador');
            }
        } catch (error) {
            console.error('Error al agregar:', error);
            alert('Por favor: ' + error.message);
        } finally {
            // Restaurar el botón
            agregarBtn.innerHTML = originalText;
            agregarBtn.disabled = false;
        }
    }

    // Función para abrir el modal de agregar nuevo trabajador
    async function openAddModal() {
        try {
            console.log("Cargando trabajadores disponibles...");
            const response = await fetch('../PHP/api/gest-presupuesto/trabajadores_disponibles.php');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Respuesta recibida:", data);
            
            if (!data.success) {
                throw new Error(data.message || 'No se pudieron cargar los trabajadores disponibles');
            }

            const selectTrabajador = document.getElementById('nuevoTrabajadorSelect');
            selectTrabajador.innerHTML = '<option value=""></option>'; // Select2 necesita option vacío
            
            if (!data.trabajadores || data.trabajadores.length === 0) {
                console.warn("No hay trabajadores disponibles para agregar");
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "No hay trabajadores disponibles";
                option.disabled = true;
                selectTrabajador.appendChild(option);
            } else {
                console.log(`Agregando ${data.trabajadores.length} trabajadores al select`);
                data.trabajadores.forEach(trabajador => {
                    const option = document.createElement('option');
                    option.value = trabajador.nom_ced;
                    option.textContent = `${trabajador.nombre_completo} (${trabajador.nom_ced})`;
                    selectTrabajador.appendChild(option);
                });
            }

            // Inicializar Select2 para el select de trabajadores
            $('#nuevoTrabajadorSelect').select2({
                theme: 'bootstrap-5',
                placeholder: 'Buscar trabajador...',
                allowClear: true,
                width: '100%',
                dropdownParent: $('#modalAgregarCajaAhorro'), // IMPORTANTE para que funcione en modal
                language: {
                    noResults: function() {
                        return "No se encontraron trabajadores";
                    }
                },
                templateResult: function(trabajador) {
                    if (!trabajador.id) return trabajador.text;
                    const option = selectTrabajador.querySelector(`option[value="${trabajador.id}"]`);
                    return option ? option.text : trabajador.text;
                },
                templateSelection: function(trabajador) {
                    if (!trabajador.id) return trabajador.text;
                    const option = selectTrabajador.querySelector(`option[value="${trabajador.id}"]`);
                    return option ? option.text : trabajador.text;
                }
            });

            // Configurar el botón de agregar
            document.getElementById('confirmarAgregarBtn').onclick = agregarTrabajador;

            // Mostrar el modal
            const addModal = new bootstrap.Modal(document.getElementById('modalAgregarCajaAhorro'));
            addModal.show();

            // Manejar el cierre del modal
            $('#modalAgregarCajaAhorro').on('hidden.bs.modal', function () {
                $('#nuevoTrabajadorSelect').select2('destroy');
            });

        } catch (error) {
            console.error('Error al abrir modal de agregar:', error);
            alert('Error al cargar trabajadores disponibles: ' + error.message);
            
            // Mostrar mensaje en el select si hay error
            const selectTrabajador = document.getElementById('nuevoTrabajadorSelect');
            selectTrabajador.innerHTML = '<option value="">Error al cargar trabajadores</option>';
        }
    }

    // Event listener para el botón de agregar
    document.getElementById('agregarCajaAhorro').addEventListener('click', openAddModal);

    // Función para verificar cambios en bit_cep
    async function checkForUpdatesCaja() {
        if (isUpdatingCaja) return;
        isUpdatingCaja = true;
        
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/check_caja_updates.php?last_update=${lastUpdateTimestampCaja || ''}`);
            const data = await response.json();
            
            if (data.success && data.has_changes) {
                lastUpdateTimestampCaja = data.last_update;
                
                // Actualizar la tabla con animación suave
                await smoothUpdateTableCaja();
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones de caja:', error);
        } finally {
            isUpdatingCaja = false;
        }
    }

    // Función para actualizar la tabla con animación suave
    async function smoothUpdateTableCaja() {
        // Agregar clase de transición a la tabla
        const table = document.getElementById('cajaAhorroTable');
        table.classList.add('table-updating');
        
        // Mostrar indicador de actualización
        const updateIndicator = document.createElement('div');
        table.parentNode.insertBefore(updateIndicator, table);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Recargar datos
        if (isSearching) {
            allTrabajadores = await fetchAllTrabajadores();
            const filtered = filterTrabajadoresLocally(allTrabajadores, currentSearchTerm);
            await displayTrabajadores(currentPage, filtered);
        } else {
            await displayTrabajadores(currentPage);
        }
        
        // Ocultar indicador y quitar clase de transición
        updateIndicator.remove();
        table.classList.remove('table-updating');
        
        // Mostrar notificación de actualización
        showUpdateNotificationCaja();
    }

    // Función para mostrar notificación de actualización
    function showUpdateNotificationCaja() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = 'Datos de Caja de Ahorro actualizados <i class="bx bx-check"></i>';
        
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
    function startUpdateCheckerCaja() {
        // Verificar actualizaciones inmediatamente
        checkForUpdatesCaja();
        
        // Configurar intervalo periódico
        updateTimerCaja = setInterval(checkForUpdatesCaja, updateIntervalCaja);
        
        // También verificar cuando la ventana gana foco
        window.addEventListener('focus', checkForUpdatesCaja);
    }

    // Detener el sistema de actualización
    function stopUpdateCheckerCaja() {
        if (updateTimerCaja) {
            clearInterval(updateTimerCaja);
        }
        window.removeEventListener('focus', checkForUpdatesCaja);
    }

    // Inicializar la tabla y el buscador
    displayTrabajadores(currentPage).then(() => {
        setupSearch();
    });

    // Iniciar el sistema de actualización en tiempo real
    startUpdateCheckerCaja();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', stopUpdateCheckerCaja);
});