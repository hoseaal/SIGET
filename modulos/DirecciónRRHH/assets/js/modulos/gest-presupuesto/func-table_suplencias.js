document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación
    const rowsPerPage = 7;
    let currentPage = 1;
    let totalSupplements = 0;
    let totalPages = 1;
    const tableBody = document.querySelector('#supplementTable tbody');
    const paginationElement = document.getElementById('paginationSupplement');

    // Función para cargar las suplencias desde la API
    async function fetchSupplements(page) {
        try {
            const response = await fetch(`../PHP/api/gest-presupuesto/imprimir_suplencias-hist.php?page=${page}&per_page=${rowsPerPage}`);
            const data = await response.json();
            
            if (data.success) {
                totalSupplements = data.total;
                totalPages = data.total_pages;
                return {
                    supplements: data.supplements,
                    total: data.total,
                    total_pages: data.total_pages
                };
            } else {
                console.error('Error al cargar suplencias:', data.message);
                return {
                    supplements: [],
                    total: 0,
                    total_pages: 0
                };
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return {
                supplements: [],
                total: 0,
                total_pages: 0
            };
        }
    }

    // Función para mostrar las suplencias en la página actual
    async function displaySupplements(page) {
        // Mostrar loader mientras carga
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        const result = await fetchSupplements(page);
        const supplements = result.supplements;
        totalSupplements = result.total;
        totalPages = result.total_pages;
        
        tableBody.innerHTML = '';
        
        if (supplements.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < rowsPerPage; i++) {
                const row = document.createElement('tr');
                if (i === 0) {
                    row.innerHTML = `
                        <td colspan="9" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron registros' : '&nbsp;'}
                        </td>
                    `;
                } else {
                    row.innerHTML = '<td colspan="9" class="empty-row">&nbsp;</td>';
                }
                tableBody.appendChild(row);
            }
            
            // Actualizar paginación para reflejar que no hay datos
            setupPagination();
            return;
        }

        // Llenar con datos reales
        supplements.forEach(supplement => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${supplement.nom_ced}</td>
                <td>${supplement.nom_nom || 'No disponible'}</td>
                <td>${supplement.sup_fec_ini || 'No disponible'}</td>
                <td>${supplement.cet_car || 'No asignado'}</td>
                <td>${supplement.ona_car || 'No asignado'}</td>
                <td>${supplement.nvl_ran || 'No asignado'}</td>
                <td>${supplement.dep_nom || 'No asignado'}</td>
                <td>
                    <span class="badge ${supplement.sup_activa ? 'bg-label-success' : 'bg-label-secondary'}">
                        ${supplement.sup_activa ? 'Activa' : 'Inactiva'}
                    </span>
                </td>
                <td>
                    <div class="dropdown">
                        <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                            <i class="bx bx-dots-vertical-rounded"></i>
                        </button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item edit-supplement-btn" href="javascript:void(0);" data-sup_ide="${supplement.sup_ide}">
                                <i class="bx bx-edit-alt me-1"></i> Editar
                            </a>
                            <a class="dropdown-item delete-supplement-btn" href="javascript:void(0);" data-sup_ide="${supplement.sup_ide}" data-nom_nom="${supplement.nom_nom || 'empleado'}">
                                <i class="bx bx-trash me-1"></i> Eliminar
                            </a>
                        </div>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Completar con filas vacías si no llega a rowsPerPage
        if (supplements.length < rowsPerPage) {
            const remainingRows = rowsPerPage - supplements.length;
            for (let i = 0; i < remainingRows; i++) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="9" class="empty-row">&nbsp;</td>';
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
        document.querySelectorAll('.edit-supplement-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const sup_ide = this.getAttribute('data-sup_ide');
                try {
                    const response = await fetch(`../PHP/api/gest-presupuesto/detalles_suplencias-hist.php?sup_ide=${sup_ide}`);
                    const data = await response.json();
                    
                    if (data.success) {
                        openEditModal(data.supplement);
                    } else {
                        alert('No se pudieron cargar los datos de la suplencia');
                    }
                } catch (error) {
                    console.error('Error al cargar detalles:', error);
                    alert('Error al cargar los detalles de la suplencia');
                }
            });
        });

        // Agregar event listeners para los botones de eliminar
        document.querySelectorAll('.delete-supplement-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const sup_ide = this.getAttribute('data-sup_ide');
                const nom_nom = this.getAttribute('data-nom_nom');
                showDeleteConfirmation(sup_ide, nom_nom);
            });
        });
    }

    // Función para mostrar confirmación de eliminación
    function showDeleteConfirmation(sup_ide, nom_nom) {
        const modalHTML = `
        <div class="modal fade" id="deleteConfirmationModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">Confirmar Eliminación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>¿Seguro de eliminar la suplencia del empleado: "<strong>${nom_nom}</strong>"?</p>
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
            await deleteSupplement(sup_ide);
            deleteModal.hide();
            document.getElementById('deleteConfirmationModal').remove();
        });
        
        document.getElementById('deleteConfirmationModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Función para eliminar una suplencia
    async function deleteSupplement(sup_ide) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
        loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
        loadingIndicator.style.zIndex = '1060';
        loadingIndicator.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Cargando...</span></div>';
        document.body.appendChild(loadingIndicator);
        
        try {
            const response = await fetch('../PHP/api/gest-presupuesto/eliminar_suplencias-hist.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sup_ide: sup_ide })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `Error HTTP: ${response.status}`);
            }
            
            if (result.success) {
                // Verificar si debemos cambiar de página
                if (currentPage > 1 && (totalSupplements - 1) <= ((currentPage - 1) * rowsPerPage)) {
                    currentPage--;
                }
                
                // Recargar la tabla
                await displaySupplements(currentPage);
                alert(result.message || 'Suplencia eliminada correctamente');
            } else {
                throw new Error(result.message || 'Error al eliminar la suplencia');
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
                displaySupplements(currentPage);
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
                displaySupplements(currentPage);
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
                    displaySupplements(currentPage);
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
                displaySupplements(currentPage);
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
                displaySupplements(currentPage);
            }
        });
        paginationElement.appendChild(li);
    }

    // Función para abrir el modal de edición con datos (VERSIÓN FINAL MEJORADA)
    async function openEditModal(supplementData) {
        // Llenar los campos del formulario con los datos de la suplencia
        document.getElementById('empleadoNombre').value = supplementData.nom_nom || '';
        document.getElementById('empleadoCedula').value = supplementData.nom_ced || '';
        document.getElementById('fechaInicio').value = supplementData.sup_fec_ini || '';
        document.getElementById('cargoCet').value = supplementData.cet_car || 'No asignado';
        document.getElementById('cargoOnapre').value = supplementData.ona_car || 'No asignado';
        document.getElementById('nivelSalarial').value = supplementData.nvl_ran || 'No asignado';
        document.getElementById('departamento').value = supplementData.dep_nom || 'No asignado';
        document.getElementById('estadoSuplencia').checked = supplementData.sup_activa == 1;

        // Configurar el botón de guardar con los datos originales
        const saveButton = document.querySelector('#ModalSuplencia .btn-primary');
        saveButton.onclick = async function() {
            await updateSupplement(supplementData.sup_ide, {
                sup_fec_ini: supplementData.sup_fec_ini,
                sup_activa: supplementData.sup_activa
            });
        };

        // Mostrar el modal
        const editModal = new bootstrap.Modal(document.getElementById('ModalSuplencia'));
        editModal.show();
    }

    // Función auxiliar para obtener datos
    async function fetchData(url, dataKey) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.success ? data[dataKey] : null;
        } catch (error) {
            console.error(`Error al cargar datos de ${url}:`, error);
            return null;
        }
    }

    // Función auxiliar para llenar selects
    function fillSelect(selectElement, items, valueField, textField, selectedValue) {
        selectElement.innerHTML = '<option value="">Seleccione</option>';
        
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            if (selectedValue && item[valueField] == selectedValue) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });
    }

    // Función para actualizar una suplencia
    async function updateSupplement(sup_ide, originalData) {
        const saveButton = document.querySelector('#ModalSuplencia .btn-primary');
        const originalText = saveButton.innerHTML;
        
        // Mostrar spinner y deshabilitar botón
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        saveButton.disabled = true;
        
        try {
            // Obtener los datos del formulario
            const newActiveStatus = document.getElementById('estadoSuplencia').checked ? 1 : 0;
            const newFechaInicio = document.getElementById('fechaInicio').value;
            const today = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
            
            // Determinar si el estado cambió
            const estadoCambio = originalData.sup_activa !== newActiveStatus;
            
            const updatedData = {
                sup_ide: sup_ide,
                nom_ced: document.getElementById('empleadoCedula').value,
                sup_fec_ini: newFechaInicio,
                sup_activa: newActiveStatus,
                // Solo enviar sup_fec_fin si el estado cambió de activo a inactivo
                sup_fec_fin: (originalData.sup_activa === 1 && newActiveStatus === 0) ? today : null,
                // Enviar campos originales para comparación
                original_fec_ini: originalData.sup_fec_ini,
                original_activa: originalData.sup_activa
            };

            // Validar si realmente hay cambios (fecha o estado)
            const fechaCambio = originalData.sup_fec_ini !== newFechaInicio;
            if (!estadoCambio && !fechaCambio) {
                alert('No se detectaron cambios en los campos editables');
                return;
            }

            // Validación básica
            if (!updatedData.nom_ced || !updatedData.sup_fec_ini) {
                alert('Por favor complete todos los campos requeridos');
                return;
            }
            
            // Llamada a la API para guardar cambios
            const response = await fetch('../PHP/api/gest-presupuesto/actualizar_suplencias-hist.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Cerrar el modal
                bootstrap.Modal.getInstance(document.getElementById('ModalSuplencia')).hide();
                
                // Mostrar mensaje de éxito
                alert('Cambios guardados exitosamente');
                
                // Recargar los datos
                displaySupplements(currentPage);
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

    // Función para abrir el modal de nueva suplencia
    async function openNewSupplementModal() {
        // Cargar los datos necesarios para el formulario
        const [empleados, cargosCet, cargosOnapre, departamentos] = await Promise.all([
            fetchData('../PHP/api/gest-presupuesto/carga_empleados.php', 'empleados'),
            fetchData('../PHP/api/gest-presupuesto/carga_cargos_cet.php', 'cargos'),
            fetchData('../PHP/api/gest-presupuesto/carga_cargos_onapre.php', 'cargos'),
            fetchData('../PHP/api/gest-presupuesto/carga_departamentos.php', 'departamentos')
        ]);

        if (!empleados || !cargosCet || !cargosOnapre || !departamentos) {
            alert('No se pudieron cargar los datos necesarios para el formulario');
            return;
        }

        // Llenar los selects del formulario
        fillSelect(document.getElementById('nuevoEmpleadoSelect'), empleados, 'nom_ced', 'nom_nom');
        fillSelect(document.getElementById('nuevoCargoCetSelect'), cargosCet, 'cet_ide', 'cet_car');
        fillSelect(document.getElementById('nuevoCargoOnapreSelect'), cargosOnapre, 'ona_ide', 'ona_car');
        fillSelect(document.getElementById('nuevoDepartamentoSelect'), departamentos, 'dep_ide', 'dep_nom');

        // Configurar la lógica de niveles salariales
        setupSalaryLevelLogic();

        // Establecer fecha actual como fecha de inicio por defecto
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('nuevaFechaInicio').value = today;

        // Configurar el botón de guardar
        document.getElementById('confirmarNuevaSuplencia').onclick = createNewSupplement;

        // Mostrar el modal
        const newModal = new bootstrap.Modal(document.getElementById('ModalNuevaSuplencia'));
        newModal.show();
    }

    // Función para crear una nueva suplencia
    async function createNewSupplement() {
        const saveButton = document.getElementById('confirmarNuevaSuplencia');
        const originalText = saveButton.innerHTML;
        
        // Mostrar spinner y deshabilitar botón
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        saveButton.disabled = true;
        
        try {
            // Obtener los datos del formulario
            const newData = {
                nom_ced: document.getElementById('nuevoEmpleadoSelect').value,
                sup_fec_ini: document.getElementById('nuevaFechaInicio').value,
                cet_ide: document.getElementById('nuevoCargoCetSelect').value || null,
                ona_ide: document.getElementById('nuevoCargoOnapreSelect').value || null,
                nvl_ran: document.getElementById('nuevoNivelSalarial').value || null, // Ahora es un select
                dep_ide: document.getElementById('nuevoDepartamentoSelect').value || null,
                sup_activa: document.getElementById('nuevoEstadoSuplencia').checked ? 1 : 0
            };

            // Validación básica
            if (!newData.nom_ced || !newData.sup_fec_ini || !newData.nvl_ran) {
                alert('Por favor complete todos los campos requeridos');
                return;
            }
            
            // Llamada a la API para crear nueva suplencia
            const response = await fetch('../PHP/api/gest-presupuesto/agregar_suplencia.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Cerrar el modal
                bootstrap.Modal.getInstance(document.getElementById('ModalNuevaSuplencia')).hide();
                
                // Mostrar mensaje de éxito
                alert('Suplencia creada correctamente');
                
                // Recargar los datos (volver a la primera página)
                currentPage = 1;
                displaySupplements(currentPage);
            } else {
                alert('Error al crear: ' + (result.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error al crear:', error);
            alert('Error al conectar con el servidor');
        } finally {
            // Restaurar el botón
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
        }
    }

    // Función para configurar la lógica de niveles salariales
    function setupSalaryLevelLogic() {
        // Definir los cargos especiales que solo permiten nivel I
        const cargosEspeciales = [
            "COORDINADOR(A) DE ÁREA",
            "DIRECTOR DE LINEA",
            "DIRECTOR GENERAL",
            "JEFE DE DIVISIÓN",
            "JEFE DE DIVISIÓN (COORDINADOR DE ÁREA)",
            "JEFE DE DIVISIÓN DE REMUNERACIONES",
            "JEFE DE DIVISIÓN GENERAL",
            "CONTRALOR(A) DEL ESTADO"
        ];

        // Escuchar cambios en el select de Cargo ONAPRE
        document.getElementById('nuevoCargoOnapreSelect').addEventListener('change', function() {
            const cargoSeleccionado = this.options[this.selectedIndex].text.trim();
            const nivelSalarialSelect = document.getElementById('nuevoNivelSalarial');
            
            if (cargosEspeciales.includes(cargoSeleccionado)) {
                // Si es un cargo especial, mostrar solo opción I
                nivelSalarialSelect.innerHTML = '<option value="I">I</option>';
            } else {
                // Si no es un cargo especial, mostrar todas las opciones
                nivelSalarialSelect.innerHTML = `
                    <option value="">Seleccione</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                    <option value="V">V</option>
                    <option value="VI">VI</option>
                    <option value="VII">VII</option>
                `;
            }
        });

        // También validar al cargar la página si ya hay un valor seleccionado
        if (document.getElementById('nuevoCargoOnapreSelect').value) {
            document.getElementById('nuevoCargoOnapreSelect').dispatchEvent(new Event('change'));
        }
    }

    // Event listener para el botón de nueva suplencia
    document.getElementById('ModalnuevaSuplencia').addEventListener('click', openNewSupplementModal);

    // Inicializar la tabla
    displaySupplements(currentPage);
});