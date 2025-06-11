document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación
    const filasPorPagina = 8;
    let paginaActual = 1;
    let totalModificaciones = 0;
    let totalPaginas = 1;
    const cuerpoTabla = document.querySelector('#modificationsTable tbody');
    const elementoPaginacion = document.getElementById('modificationsPagination');
    let todosDatosModificaciones = []; // Almacenará todos los datos de modificaciones

    // Función para cargar las modificaciones desde la API
    async function obtenerModificaciones(pagina) {
        try {
            const respuesta = await fetch(`../PHP/api/privilegios/imprimir_modificaciones.php?page=${pagina}&per_page=${filasPorPagina}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                totalModificaciones = datos.total;
                totalPaginas = datos.total_pages;
                todosDatosModificaciones = datos.modifications;
                return datos.modifications;
            } else {
                console.error('Error al cargar modificaciones:', datos.message);
                return [];
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return [];
        }
    }

    // Función para mostrar las modificaciones en la página actual
    async function mostrarModificaciones(pagina) {
        // Mostrar loader mientras carga
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        const modificaciones = await obtenerModificaciones(pagina);
        
        cuerpoTabla.innerHTML = '';
        
        if (modificaciones.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < filasPorPagina; i++) {
                const fila = document.createElement('tr');
                if (i === 0) {
                    fila.innerHTML = `
                        <td colspan="6" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron modificaciones' : '&nbsp;'}
                        </td>
                    `;
                } else {
                    fila.innerHTML = '<td colspan="6" class="empty-row">&nbsp;</td>';
                }
                cuerpoTabla.appendChild(fila);
            }
            return;
        }

        // Llenar con datos reales
        modificaciones.forEach((modificacion, indice) => {
            const numeroFila = (pagina - 1) * filasPorPagina + indice + 1;
            const fila = document.createElement('tr');
            
            // Formatear la fecha para mostrarla mejor
            const fechaModificacion = new Date(modificacion.bit_fecha);
            const fechaFormateada = fechaModificacion.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Mapear las operaciones a sus equivalentes en español
            const mapeoOperaciones = {
                'update': 'Actualización',
                'delete': 'Eliminación',
                'insert': 'Inserción'
            };
            
            // Obtener la operación traducida o usar la original si no está en el mapa
            const operacionTraducida = mapeoOperaciones[modificacion.bit_operacion.toLowerCase()] || modificacion.bit_operacion;
            
            fila.innerHTML = `
                <td>${numeroFila}</td>
                <td><strong>${modificacion.bit_tabla} (${modificacion.display_affected_id || 'N/A'})</strong></td>
                <td>${operacionTraducida}</td>
                <td>${modificacion.bit_usuario_responsable}</td>
                <td>${fechaFormateada}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-primary view-details-btn" 
                            data-id="${modificacion.bit_id}" 
                            data-source="${modificacion.source_table}">
                        <i class="bx bx-show me-1"></i> Ver Todo
                    </button>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });

        // Completar con filas vacías si no llega a filasPorPagina
        if (modificaciones.length < filasPorPagina) {
            const filasRestantes = filasPorPagina - modificaciones.length;
            for (let i = 0; i < filasRestantes; i++) {
                const fila = document.createElement('tr');
                fila.innerHTML = '<td colspan="6" class="empty-row">&nbsp;</td>';
                cuerpoTabla.appendChild(fila);
            }
        }

        // Agregar event listeners para los botones de ver detalles
        document.querySelectorAll('.view-details-btn').forEach(boton => {
            boton.addEventListener('click', function() {
                const bitId = this.getAttribute('data-id');
                const tablaOrigen = this.getAttribute('data-source');
                
                // Buscar la modificación correcta
                const modificacion = todosDatosModificaciones.find(mod => 
                    mod.bit_id == bitId && mod.source_table === tablaOrigen
                );
                
                if (modificacion) {
                    mostrarDetallesModificacion(modificacion);
                } else {
                    console.error('No se encontró la modificación con ID:', bitId, 'y tabla:', tablaOrigen);
                }
            });
        });
    }

    // Función para mostrar los detalles completos de una modificación
    function mostrarDetallesModificacion(modificacion) {
        // Formatear la fecha para mostrarla mejor
        const fechaModificacion = new Date(modificacion.bit_fecha);
        const fechaFormateada = fechaModificacion.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Llenar los campos del modal
        document.getElementById('viewTableName').value = modificacion.bit_tabla;
        document.getElementById('viewOperation').value = modificacion.bit_operacion;
        document.getElementById('viewRecordId').value = modificacion.display_affected_id || 'N/A';
        document.getElementById('viewResponsibleUser').value = modificacion.bit_usuario_responsable;
        document.getElementById('viewModificationDate').value = fechaFormateada;
        
        // Mostrar los detalles (JSON) formateados
        try {
            const detalles = modificacion.bit_detalles ? JSON.parse(modificacion.bit_detalles) : {};
            document.getElementById('viewDetails').textContent = JSON.stringify(detalles, null, 2);
        } catch (e) {
            document.getElementById('viewDetails').textContent = modificacion.bit_detalles || 'No hay detalles disponibles';
        }
        
        // Mostrar el modal
        const modalVer = new bootstrap.Modal(document.getElementById('viewModificationModal'));
        modalVer.show();
    }

    // Función para configurar la paginación
    function configurarPaginacion() {
        elementoPaginacion.innerHTML = '';
        
        // Botón Primera página
        let li = document.createElement('li');
        li.className = 'page-item first';
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-left"></i></a>`;
        li.addEventListener('click', () => {
            if (paginaActual !== 1) {
                paginaActual = 1;
                mostrarModificaciones(paginaActual);
                actualizarBotonesPaginacion();
            }
        });
        elementoPaginacion.appendChild(li);
        
        // Botón Página anterior
        li = document.createElement('li');
        li.className = 'page-item prev';
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-left"></i></a>`;
        li.addEventListener('click', () => {
            if (paginaActual > 1) {
                paginaActual--;
                mostrarModificaciones(paginaActual);
                actualizarBotonesPaginacion();
            }
        });
        elementoPaginacion.appendChild(li);
        
        // Números de página (mostramos máximo 5 páginas alrededor de la actual)
        const paginaInicio = Math.max(1, paginaActual - 2);
        const paginaFin = Math.min(totalPaginas, paginaActual + 2);
        
        for (let i = paginaInicio; i <= paginaFin; i++) {
            li = document.createElement('li');
            li.className = 'page-item';
            if (i === paginaActual) li.classList.add('active');
            li.innerHTML = `<a class="page-link" href="javascript:void(0);">${i}</a>`;
            li.addEventListener('click', () => {
                if (paginaActual !== i) {
                    paginaActual = i;
                    mostrarModificaciones(paginaActual);
                    actualizarBotonesPaginacion();
                }
            });
            elementoPaginacion.appendChild(li);
        }
        
        // Botón Página siguiente
        li = document.createElement('li');
        li.className = 'page-item next';
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-right"></i></a>`;
        li.addEventListener('click', () => {
            if (paginaActual < totalPaginas) {
                paginaActual++;
                mostrarModificaciones(paginaActual);
                actualizarBotonesPaginacion();
            }
        });
        elementoPaginacion.appendChild(li);
        
        // Botón Última página
        li = document.createElement('li');
        li.className = 'page-item last';
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-right"></i></a>`;
        li.addEventListener('click', () => {
            if (paginaActual !== totalPaginas) {
                paginaActual = totalPaginas;
                mostrarModificaciones(paginaActual);
                actualizarBotonesPaginacion();
            }
        });
        elementoPaginacion.appendChild(li);
    }
    
    // Función para actualizar el estado de los botones de paginación
    function actualizarBotonesPaginacion() {
        const itemsPagina = elementoPaginacion.querySelectorAll('.page-item');
        
        // Remover clase active de todos los items
        itemsPagina.forEach(item => {
            item.classList.remove('active');
        });
        
        // Agregar clase active al item correspondiente
        itemsPagina.forEach(item => {
            const enlacePagina = item.querySelector('.page-link');
            if (enlacePagina && enlacePagina.textContent === paginaActual.toString()) {
                item.classList.add('active');
            }
        });
        
        // Actualizar estado de los botones de navegación
        const botonPrimero = elementoPaginacion.querySelector('.first');
        const botonAnterior = elementoPaginacion.querySelector('.prev');
        const botonSiguiente = elementoPaginacion.querySelector('.next');
        const botonUltimo = elementoPaginacion.querySelector('.last');
        
        if (paginaActual === 1) {
            botonPrimero.classList.add('disabled');
            botonAnterior.classList.add('disabled');
        } else {
            botonPrimero.classList.remove('disabled');
            botonAnterior.classList.remove('disabled');
        }
        
        if (paginaActual === totalPaginas) {
            botonSiguiente.classList.add('disabled');
            botonUltimo.classList.add('disabled');
        } else {
            botonSiguiente.classList.remove('disabled');
            botonUltimo.classList.remove('disabled');
        }
    }

    // Inicializar la tabla y paginación
    mostrarModificaciones(paginaActual).then(() => {
        configurarPaginacion();
        actualizarBotonesPaginacion();
    });
});