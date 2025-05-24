document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación
    const rowsPerPage = 8;
    let currentPage = 1;
    let totalModifications = 0;
    let totalPages = 1;
    const tableBody = document.querySelector('#modificationsTable tbody');
    const paginationElement = document.getElementById('modificationsPagination');
    let allModificationsData = []; // Almacenará todos los datos de modificaciones

    // Función para cargar las modificaciones desde la API
    async function fetchModifications(page) {
        try {
            const response = await fetch(`../PHP/api/privilegios/imprimir_modificaciones.php?page=${page}&per_page=${rowsPerPage}`);
            const data = await response.json();
            
            if (data.success) {
                totalModifications = data.total;
                totalPages = data.total_pages;
                allModificationsData = data.modifications;
                return data.modifications;
            } else {
                console.error('Error al cargar modificaciones:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return [];
        }
    }

    // Función para mostrar las modificaciones en la página actual
    async function displayModifications(page) {
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
        
        const modifications = await fetchModifications(page);
        
        tableBody.innerHTML = '';
        
        if (modifications.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < rowsPerPage; i++) {
                const row = document.createElement('tr');
                if (i === 0) {
                    row.innerHTML = `
                        <td colspan="6" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron modificaciones' : '&nbsp;'}
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
        modifications.forEach((modification, index) => {
            const rowNumber = (page - 1) * rowsPerPage + index + 1;
            const row = document.createElement('tr');
            
            // Formatear la fecha para mostrarla mejor
            const modificationDate = new Date(modification.bit_fecha);
            const formattedDate = modificationDate.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            row.innerHTML = `
                <td>${rowNumber}</td>
                <td><strong>${modification.bit_tabla} (ID: ${modification.affected_id || 'N/A'})</strong></td>
                <td>${modification.bit_operacion}</td>
                <td>${modification.bit_usuario_responsable}</td>
                <td>${formattedDate}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-primary view-details-btn" 
                            data-id="${modification.bit_id}" 
                            data-source="${modification.source_table}">
                        <i class="bx bx-show me-1"></i> Ver Todo
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Completar con filas vacías si no llega a rowsPerPage
        if (modifications.length < rowsPerPage) {
            const remainingRows = rowsPerPage - modifications.length;
            for (let i = 0; i < remainingRows; i++) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="6" class="empty-row">&nbsp;</td>';
                tableBody.appendChild(row);
            }
        }

        // Agregar event listeners para los botones de ver detalles
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const bitId = this.getAttribute('data-id');
                const sourceTable = this.getAttribute('data-source');
                
                // Buscar la modificación correcta
                const modification = allModificationsData.find(mod => 
                    mod.bit_id == bitId && mod.source_table === sourceTable
                );
                
                if (modification) {
                    showModificationDetails(modification);
                } else {
                    console.error('No se encontró la modificación con ID:', bitId, 'y tabla:', sourceTable);
                }
            });
        });
    }

    // Función para mostrar los detalles completos de una modificación
    function showModificationDetails(modification) {
        // Formatear la fecha para mostrarla mejor
        const modificationDate = new Date(modification.bit_fecha);
        const formattedDate = modificationDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Llenar los campos del modal
        document.getElementById('viewTableName').value = modification.bit_tabla;
        document.getElementById('viewOperation').value = modification.bit_operacion;
        document.getElementById('viewRecordId').value = modification.affected_id || 'N/A';
        document.getElementById('viewResponsibleUser').value = modification.bit_usuario_responsable;
        document.getElementById('viewModificationDate').value = formattedDate;
        
        // Mostrar los detalles (JSON) formateados
        try {
            const details = modification.bit_detalles ? JSON.parse(modification.bit_detalles) : {};
            document.getElementById('viewDetails').textContent = JSON.stringify(details, null, 2);
        } catch (e) {
            document.getElementById('viewDetails').textContent = modification.bit_detalles || 'No hay detalles disponibles';
        }
        
        // Mostrar el modal
        const viewModal = new bootstrap.Modal(document.getElementById('viewModificationModal'));
        viewModal.show();
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
                displayModifications(currentPage);
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
                displayModifications(currentPage);
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
                    displayModifications(currentPage);
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
                displayModifications(currentPage);
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
                displayModifications(currentPage);
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
    displayModifications(currentPage).then(() => {
        setupPagination();
        updatePaginationButtons();
    });
});