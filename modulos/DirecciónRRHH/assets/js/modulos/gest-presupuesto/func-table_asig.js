document.addEventListener('DOMContentLoaded', function() {
    // Configuración común para los alerts pequeños
    const smallSwal = Swal.mixin({
        width: '400px',
        padding: '1rem',
        customClass: {
            popup: 'small-swal',
            title: 'small-swal-title',
            htmlContainer: 'small-swal-content',
            confirmButton: 'small-swal-confirm'
        }
    });

    // Variables para la paginación
    const filasPorPagina = 8;
    let paginaActual = 1;
    let totalAsignaciones = 0;
    let totalPaginas = 1;
    const cuerpoTabla = document.querySelector('#assignmentsTable tbody');
    const elementoPaginacion = document.getElementById('paginationAssignments');

    // Variables para el control de actualización en tiempo real
    let ultimoTimestampActualizacionAsignaciones = null;
    let intervaloActualizacionAsignaciones = 1000; // 1 segundo
    let temporizadorActualizacionAsignaciones = null;
    let actualizandoAsignaciones = false;

    // Función para cargar las asignaciones desde la API
    async function obtenerAsignaciones(pagina) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_asig.php?page=${pagina}&per_page=${filasPorPagina}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                totalAsignaciones = datos.total;
                totalPaginas = datos.total_pages;
                return datos.assignments;
            } else {
                console.error('Error al cargar asignaciones:', datos.message);
                smallSwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar las asignaciones',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return [];
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar al servidor',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            return [];
        }
    }

    // Función para obtener los datos completos de una asignación
    async function obtenerDetallesAsignacion(pri_ide) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/tomar_asig.php?pri_ide=${pri_ide}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                return datos.assignment;
            } else {
                console.error('Error al cargar detalles:', datos.message);
                return null;
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return null;
        }
    }

    // Función para mostrar las asignaciones en la página actual
    async function mostrarAsignaciones(pagina) {
        // Mostrar loader mientras carga
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        const asignaciones = await obtenerAsignaciones(pagina);
        
        cuerpoTabla.innerHTML = '';
        
        if (asignaciones.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < filasPorPagina; i++) {
                const fila = document.createElement('tr');
                if (i === 0) {
                    // Solo mostrar el mensaje en la primera fila
                    fila.innerHTML = `
                        <td colspan="4" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron asignaciones' : '&nbsp;'}
                        </td>
                    `;
                } else {
                    // Filas vacías adicionales
                    fila.innerHTML = '<td colspan="4" class="empty-row">&nbsp;</td>';
                }
                cuerpoTabla.appendChild(fila);
            }
            return;
        }

        // Llenar con datos reales
        asignaciones.forEach((asignacion, indice) => {
            const numeroFila = (pagina - 1) * filasPorPagina + indice + 1;
            const fila = document.createElement('tr');
            
            // (sin acciones)
            if (LOGGED_USER_TYPE === '1' || LOGGED_USER_TYPE === '2') {
                fila.innerHTML = `
                    <td>${numeroFila}</td>
                    <td><strong>${asignacion.pri_raz}</strong></td>
                    <td>${asignacion.pri_por}</td>
                `;
            } 
            // (solo editar)
            else if (LOGGED_USER_TYPE === '3') {
                fila.innerHTML = `
                    <td>${numeroFila}</td>
                    <td><strong>${asignacion.pri_raz}</strong></td>
                    <td>${asignacion.pri_por}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-assignment-btn" href="javascript:void(0);" data-id="${asignacion.pri_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            } 
            // todas las acciones
            else {
                fila.innerHTML = `
                    <td>${numeroFila}</td>
                    <td><strong>${asignacion.pri_raz}</strong></td>
                    <td>${asignacion.pri_por}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-assignment-btn" href="javascript:void(0);" data-id="${asignacion.pri_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                                <a class="dropdown-item delete-assignment-btn" href="javascript:void(0);" data-id="${asignacion.pri_ide}" data-name="${asignacion.pri_raz}">
                                    <i class="bx bx-trash me-1"></i> Eliminar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            }
            
            cuerpoTabla.appendChild(fila);
        });

        // Completar con filas vacías si no llega a filasPorPagina
        if (asignaciones.length < filasPorPagina) {
            const filasRestantes = filasPorPagina - asignaciones.length;
            for (let i = 0; i < filasRestantes; i++) {
                const fila = document.createElement('tr');
                fila.innerHTML = '<td colspan="4" class="empty-row">&nbsp;</td>';
                cuerpoTabla.appendChild(fila);
            }
        }

        if (LOGGED_USER_TYPE === '3' || LOGGED_USER_TYPE === '4' || LOGGED_USER_TYPE === '5') {
            document.querySelectorAll('.edit-assignment-btn').forEach(boton => {
                boton.addEventListener('click', async function() {
                    const pri_ide = this.getAttribute('data-id');
                    const datosAsignacion = await obtenerDetallesAsignacion(pri_ide);
                    if (datosAsignacion) {
                        abrirModalEdicion(datosAsignacion);
                    } else {
                        alert('No se pudieron cargar los datos de la asignación');
                    }
                });
            });
        }

        // Agregar event listeners para los botones de eliminar (solo tipo 4)
        if (LOGGED_USER_TYPE === '5') {
            document.querySelectorAll('.delete-assignment-btn').forEach(boton => {
                boton.addEventListener('click', function() {
                    const pri_ide = this.getAttribute('data-id');
                    const nombreAsignacion = this.getAttribute('data-name');
                    mostrarConfirmacionEliminacion(pri_ide, nombreAsignacion);
                });
            });
        }
    }

    // Función para mostrar confirmación de eliminación
    function mostrarConfirmacionEliminacion(pri_ide, nombreAsignacion) {
        smallSwal.fire({
            title: '¿Eliminar asignación?',
            html: `¿Seguro de eliminar la asignación <strong>${nombreAsignacion}</strong>?<br><br><span class="text-danger">¡Esta acción no se puede deshacer!</span>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (resultado) => {
            if (resultado.isConfirmed) {
                // Mostrar loader durante la eliminación
                smallSwal.fire({
                    title: 'Eliminando asignación',
                    html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" style="width: 100%; height: 100%;"></div></div>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        smallSwal.showLoading();
                    }
                });
                
                await eliminarAsignacion(pri_ide);
            }
        });
    }

    // Función para eliminar una asignación
    async function eliminarAsignacion(pri_ide) {
        try {
            const respuesta = await fetch('../PHP/api/gest-presupuesto/eliminar_asig.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pri_ide: pri_ide })
            });
            
            const resultado = await respuesta.json();
            
            if (!respuesta.ok) {
                throw new Error(resultado.message || `Error HTTP: ${respuesta.status}`);
            }
            
            if (resultado.success) {
                smallSwal.close();
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: resultado.message || 'Asignación eliminada correctamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar la tabla
                    await mostrarAsignaciones(paginaActual);
                });
            } else {
                throw new Error(resultado.message || 'Error al eliminar la asignación');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al eliminar: ' + error.message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
        }
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
                mostrarAsignaciones(paginaActual);
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
                mostrarAsignaciones(paginaActual);
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
                    mostrarAsignaciones(paginaActual);
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
                mostrarAsignaciones(paginaActual);
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
                mostrarAsignaciones(paginaActual);
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

    // Función para abrir el modal de edición con datos de la asignación
    function abrirModalEdicion(asignacion) {
        const modalEdicion = new bootstrap.Modal(document.getElementById('ModalAsignaciones'));

        // Llenar los campos del modal con los datos de la asignación
        document.getElementById('asignacionId').value = asignacion.pri_ide;
        document.getElementById('tipoAsignacion').value = asignacion.pri_raz;
        document.getElementById('primaAsignacion').value = asignacion.pri_por;

        // Configurar el botón de guardar
        const botonGuardar = document.getElementById('confirmEditAsignacion');
        botonGuardar.onclick = function() {
            guardarCambiosAsignacion(asignacion.pri_ide);
        };

        // Mostrar el modal
        modalEdicion.show();
    }

    // Función para guardar los cambios de la asignación
    async function guardarCambiosAsignacion(idOriginal) {
        const botonGuardar = document.getElementById('confirmEditAsignacion');
        const textoOriginal = botonGuardar.innerHTML;
        const inputPrima = document.getElementById('primaAsignacion');
        
        // Validar el formato del valor
        if (!/^\d*\.?\d*$/.test(inputPrima.value)) {
            inputPrima.classList.add('is-invalid');
            inputPrima.focus();
            
            smallSwal.fire({
                icon: 'error',
                title: 'Formato inválido',
                text: 'Por favor ingrese un valor numérico válido',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            return;
        } else {
            inputPrima.classList.remove('is-invalid');
        }

        // Mostrar spinner y deshabilitar botón
        botonGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        botonGuardar.disabled = true;

        try {
            // Obtener los datos del formulario
            const datosActualizados = {
                pri_ide: idOriginal,
                pri_raz: document.getElementById('tipoAsignacion').value,
                pri_por: document.getElementById('primaAsignacion').value
            };
            
            // Validación básica
            if (!datosActualizados.pri_raz || !datosActualizados.pri_por) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Datos incompletos',
                    text: 'Por favor complete todos los campos requeridos',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return;
            }
            
            // Llamada a la API para guardar cambios
            const respuesta = await fetch('../PHP/api/gest-presupuesto/actualizar_asig.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosActualizados)
            });
            
            const resultado = await respuesta.json();
            
            if (!respuesta.ok) {
                throw new Error(resultado.message || `Error HTTP: ${respuesta.status}`);
            }
            
            if (resultado.success) {
                // Cerrar el modal
                bootstrap.Modal.getInstance(document.getElementById('ModalAsignaciones')).hide();
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'Cambios guardados exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar los datos
                    await mostrarAsignaciones(paginaActual);
                });
            } else {
                throw new Error(resultado.message || 'Error al guardar los cambios');
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar: ' + error.message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
        } finally {
            // Restaurar el botón
            botonGuardar.innerHTML = textoOriginal;
            botonGuardar.disabled = false;
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

    // Función para verificar cambios en bit_pri
    async function verificarActualizacionesAsignaciones() {
        if (actualizandoAsignaciones) return;
        actualizandoAsignaciones = true;
        
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/check_asig_updates.php?last_update=${ultimoTimestampActualizacionAsignaciones || ''}`);
            const datos = await respuesta.json();
            
            if (datos.success && datos.has_changes) {
                ultimoTimestampActualizacionAsignaciones = datos.last_update;
                
                // Actualizar la tabla con animación suave
                await actualizarTablaAsignacionesSuavemente();
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones de asignaciones:', error);
        } finally {
            actualizandoAsignaciones = false;
        }
    }

    // Función para actualizar la tabla de asignaciones con animación suave
    async function actualizarTablaAsignacionesSuavemente() {
        const tabla = document.getElementById('assignmentsTable');
        const paginacion = document.getElementById('paginationAssignments');
        
        // Agregar clase de transición
        tabla.classList.add('table-updating');
        paginacion.classList.add('pagination-updating');
        
        // Mostrar indicador de actualización
        const indicadorActualizacion = document.createElement('div');
        tabla.parentNode.insertBefore(indicadorActualizacion, tabla);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolver => setTimeout(resolver, 300));
        
        // Recargar datos manteniendo la página actual
        await mostrarAsignaciones(paginaActual);
        
        // Ocultar indicador y quitar clases de transición
        indicadorActualizacion.remove();
        tabla.classList.remove('table-updating');
        paginacion.classList.remove('pagination-updating');
        
        // Mostrar notificación de actualización
        mostrarNotificacionActualizacion('Asignaciones actualizadas');
    }

    // Función para mostrar notificación de actualización
    function mostrarNotificacionActualizacion(mensaje) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
        
        Toast.fire({
            icon: 'success',
            title: mensaje,
            background: '#f8f9fa',
            color: '#333'
        });
    }

    // Iniciar el sistema de actualización periódica para asignaciones
    function iniciarVerificadorActualizacionesAsignaciones() {
        // Verificar actualizaciones inmediatamente
        verificarActualizacionesAsignaciones();
        
        // Configurar intervalo periódico
        temporizadorActualizacionAsignaciones = setInterval(verificarActualizacionesAsignaciones, intervaloActualizacionAsignaciones);
        
        // También verificar cuando la ventana gana foco
        window.addEventListener('focus', verificarActualizacionesAsignaciones);
    }

    // Detener el sistema de actualización
    function detenerVerificadorActualizacionesAsignaciones() {
        if (temporizadorActualizacionAsignaciones) {
            clearInterval(temporizadorActualizacionAsignaciones);
        }
        window.removeEventListener('focus', verificarActualizacionesAsignaciones);
    }

    // Inicializar la tabla y paginación
    mostrarAsignaciones(paginaActual).then(() => {
        configurarPaginacion();
        actualizarBotonesPaginacion();
    });

    // Iniciar el sistema de actualización en tiempo real
    iniciarVerificadorActualizacionesAsignaciones();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', detenerVerificadorActualizacionesAsignaciones);
});