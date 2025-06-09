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
    let totalDeducciones = 0;
    let totalPaginas = 1;
    const cuerpoTabla = document.querySelector('#workersTable tbody');
    const elementoPaginacion = document.getElementById('pagination');
    let todosDatosDeducciones = [];

    // Variables para el control de actualización en tiempo real
    let ultimoTimestampActualizacion = null;
    let intervaloActualizacion = 1000; // 1 segundo
    let temporizadorActualizacion = null;
    let actualizando = false;

    // Función para cargar las deducciones desde la API
    async function obtenerDeducciones(pagina) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_deduc.php?page=${pagina}&per_page=${filasPorPagina}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                totalDeducciones = datos.total;
                totalPaginas = datos.total_pages;
                todosDatosDeducciones = datos.deductions;
                return datos.deductions;
            } else {
                console.error('Error al cargar deducciones:', datos.message);
                smallSwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar las deducciones',
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

    // Función para obtener los datos completos de una deducción
    async function obtenerDetallesDeduccion(dedId) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/tomar_deduc.php?ded_id=${dedId}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                return datos.deduction;
            } else {
                console.error('Error al cargar detalles:', datos.message);
                return null;
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return null;
        }
    }

    // Función para mostrar las deducciones en la página actual
    async function mostrarDeducciones(pagina) {
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
        
        const deducciones = await obtenerDeducciones(pagina);
        
        cuerpoTabla.innerHTML = '';
        
        if (deducciones.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < filasPorPagina; i++) {
                const fila = document.createElement('tr');
                if (i === 0) {
                    fila.innerHTML = `
                        <td colspan="4" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron deducciones' : '&nbsp;'}
                        </td>
                    `;
                } else {
                    fila.innerHTML = '<td colspan="4" class="empty-row">&nbsp;</td>';
                }
                cuerpoTabla.appendChild(fila);
            }
            return;
        }

        // Llenar con datos reales
        deducciones.forEach((deduccion, indice) => {
            const numeroFila = (pagina - 1) * filasPorPagina + indice + 1;
            const fila = document.createElement('tr');
            
            // Tipos "0" y "1" - solo 4 columnas (sin acciones)
            if (LOGGED_USER_TYPE === '0' || LOGGED_USER_TYPE === '1') {
                fila.innerHTML = `
                    <td>${numeroFila}</td>
                    <td><strong>${deduccion.ded_raz}</strong></td>
                    <td>${deduccion.ded_por} %</td>
                `;
            } 
            // Tipo "2" - 5 columnas (solo editar)
            else if (LOGGED_USER_TYPE === '2') {
                fila.innerHTML = `
                    <td>${numeroFila}</td>
                    <td><strong>${deduccion.ded_raz}</strong></td>
                    <td>${deduccion.ded_por} %</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-deduction-btn" href="javascript:void(0);" data-id="${deduccion.ded_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            } 
            // Tipos "3" y "4" - 5 columnas con todas las acciones
            else {
                fila.innerHTML = `
                    <td>${numeroFila}</td>
                    <td><strong>${deduccion.ded_raz}</strong></td>
                    <td>${deduccion.ded_por} %</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-deduction-btn" href="javascript:void(0);" data-id="${deduccion.ded_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                                <a class="dropdown-item delete-deduction-btn" href="javascript:void(0);" 
                                data-id="${deduccion.ded_ide}" 
                                data-name="${deduccion.ded_raz}">
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
        if (deducciones.length < filasPorPagina) {
            const filasRestantes = filasPorPagina - deducciones.length;
            for (let i = 0; i < filasRestantes; i++) {
                const fila = document.createElement('tr');
                fila.innerHTML = '<td colspan="4" class="empty-row">&nbsp;</td>';
                cuerpoTabla.appendChild(fila);
            }
        }

        // Agregar event listeners para los botones de editar
        if (LOGGED_USER_TYPE === '2' || LOGGED_USER_TYPE === '3' || LOGGED_USER_TYPE === '4') {
            document.querySelectorAll('.edit-deduction-btn').forEach(boton => {
                boton.addEventListener('click', async function() {
                    const dedId = this.getAttribute('data-id');
                    const datosDeduccion = await obtenerDetallesDeduccion(dedId);
                    if (datosDeduccion) {
                        abrirModalEdicion(datosDeduccion);
                    } else {
                        alert('No se pudieron cargar los datos de la deducción');
                    }
                });
            });
        }

        // Agregar event listeners para los botones de eliminar
        if (LOGGED_USER_TYPE === '3' || LOGGED_USER_TYPE === '4') {
            document.querySelectorAll('.delete-deduction-btn').forEach(boton => {
                boton.addEventListener('click', function() {
                    const dedId = this.getAttribute('data-id');
                    const nombreDeduccion = this.getAttribute('data-name');
                    mostrarConfirmacionEliminacion(dedId, nombreDeduccion);
                });
            });
        }
    }

    // Función para mostrar confirmación de eliminación
    function mostrarConfirmacionEliminacion(dedId, nombreDeduccion) {
        smallSwal.fire({
            title: '¿Eliminar deducción?',
            html: `¿Seguro de eliminar la deducción <strong>${nombreDeduccion}</strong>?<br><br><span class="text-danger">¡Esta acción no se puede deshacer!</span>`,
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
                    title: 'Eliminando deducción',
                    html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" style="width: 100%; height: 100%;"></div></div>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        smallSwal.showLoading();
                    }
                });
                
                await eliminarDeduccion(dedId);
            }
        });
    }

    // Función para eliminar una deducción
    async function eliminarDeduccion(dedId) {
        try {
            const respuesta = await fetch('../PHP/api/gest-presupuesto/eliminar_deduc.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ded_id: dedId })
            });
            
            const resultado = await respuesta.json();
            
            if (!respuesta.ok) {
                throw new Error(resultado.message || `Error HTTP: ${respuesta.status}`);
            }
            
            if (resultado.success) {
                // Cerrar cualquier alerta abierta
                smallSwal.close();
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Eliminada!',
                    text: resultado.message || 'Deducción eliminada correctamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar la tabla
                    await mostrarDeducciones(paginaActual);
                });
            } else {
                throw new Error(resultado.message || 'Error al eliminar la deducción');
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
                mostrarDeducciones(paginaActual);
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
                mostrarDeducciones(paginaActual);
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
                    mostrarDeducciones(paginaActual);
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
                mostrarDeducciones(paginaActual);
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
                mostrarDeducciones(paginaActual);
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

    // Función para abrir el modal de edición con datos de la deducción
    function abrirModalEdicion(deduccion) {
        const modalEdicion = new bootstrap.Modal(document.getElementById('ModalDeducciones'));
        const elementoModal = document.getElementById('ModalDeducciones');
        const inputPorcentaje = document.getElementById('porcentajeDeduccion');
        
        // Resetear las validaciones cada vez que se abre el modal
        inputPorcentaje.classList.remove('is-invalid');
        
        // Resetear el contenido del modal cuando se cierra
        elementoModal.addEventListener('hidden.bs.modal', function() {
            inputPorcentaje.classList.remove('is-invalid');
        });
        
        // Llenar los campos del modal con los datos de la deducción
        document.getElementById('deductionId').value = deduccion.ded_ide;
        document.getElementById('tipoDeduccion').value = deduccion.ded_raz || '';
        document.getElementById('porcentajeDeduccion').value = deduccion.ded_por || '';
        
        // Configurar el botón de guardar
        document.getElementById('confirmEditDeduction').onclick = function() {
            guardarCambiosDeduccion(deduccion.ded_ide);
        };
        
        // Mostrar el modal
        modalEdicion.show();
    }

    // Función para guardar los cambios de la deducción
    async function guardarCambiosDeduccion(dedId) {
        const botonGuardar = document.getElementById('confirmEditDeduction');
        const textoOriginal = botonGuardar.innerHTML;
        const inputPorcentaje = document.getElementById('porcentajeDeduccion');
        
        // Mostrar spinner y deshabilitar botón
        botonGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        botonGuardar.disabled = true;
        
        try {
            // Validar campos
            const nombre = document.getElementById('tipoDeduccion').value.trim();
            const porcentaje = inputPorcentaje.value.trim();
            
            // Validar que el porcentaje no esté vacío
            if (porcentaje === '') {
                inputPorcentaje.classList.add('is-invalid');
                throw new Error('Por favor ingrese un porcentaje válido');
            }
            
            // Convertir a número
            const porcentajeNum = parseFloat(porcentaje);
            
            // Validar que sea un número válido
            if (isNaN(porcentajeNum)) {
                inputPorcentaje.classList.add('is-invalid');
                throw new Error('Por favor ingrese un número válido');
            }
            
            // Validar que no sea mayor a 100
            if (porcentajeNum > 100) {
                inputPorcentaje.classList.add('is-invalid');
                throw new Error('El porcentaje no puede ser mayor a 100');
            }
            
            // Validar que no tenga más de 2 decimales
            const partesDecimales = porcentaje.split('.');
            if (partesDecimales.length === 2 && partesDecimales[1].length > 2) {
                inputPorcentaje.classList.add('is-invalid');
                throw new Error('El porcentaje no puede tener más de 2 decimales');
            }
            
            // Obtener los datos del formulario
            const datosActualizados = {
                ded_id: dedId,
                ded_raz: nombre,
                ded_por: porcentajeNum
            };
            
            // Llamada a la API para guardar cambios
            const respuesta = await fetch('../PHP/api/gest-presupuesto/actualizar_deduc.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosActualizados)
            });
            
            const resultado = await respuesta.json();
            
            if (resultado.success) {
                // Cerrar el modal
                bootstrap.Modal.getInstance(document.getElementById('ModalDeducciones')).hide();
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'Cambios guardados exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar los datos
                    await mostrarDeducciones(paginaActual);
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

    // Función para verificar cambios en bit_ded
    async function verificarActualizaciones() {
        if (actualizando) return;
        actualizando = true;
        
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/check_deduc_updates.php?last_update=${ultimoTimestampActualizacion || ''}`);
            const datos = await respuesta.json();
            
            if (datos.success && datos.has_changes) {
                ultimoTimestampActualizacion = datos.last_update;
                
                // Actualizar la tabla con animación suave
                await actualizarTablaSuavemente();
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones:', error);
        } finally {
            actualizando = false;
        }
    }

    // Función para actualizar la tabla con animación suave
    async function actualizarTablaSuavemente() {
        // Agregar clase de transición a la tabla
        const tabla = document.getElementById('workersTable');
        tabla.classList.add('table-updating');
        
        // Mostrar indicador de actualización
        const indicadorActualizacion = document.createElement('div');
        tabla.parentNode.insertBefore(indicadorActualizacion, tabla);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolver => setTimeout(resolver, 300));
        
        // Recargar datos
        await mostrarDeducciones(paginaActual);
        
        // Ocultar indicador y quitar clase de transición
        indicadorActualizacion.remove();
        tabla.classList.remove('table-updating');
        
        // Mostrar notificación de actualización
        mostrarNotificacionActualizacion();
    }

    // Función para mostrar notificación de actualización
    function mostrarNotificacionActualizacion() {
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
            title: 'Deducciones actualizadas',
            background: '#f8f9fa',
            color: '#333'
        });
    }

    // Iniciar el sistema de actualización periódica
    function iniciarVerificadorActualizaciones() {
        // Verificar actualizaciones inmediatamente
        verificarActualizaciones();
        
        // Configurar intervalo periódico
        temporizadorActualizacion = setInterval(verificarActualizaciones, intervaloActualizacion);
        
        // También verificar cuando la ventana gana foco
        window.addEventListener('focus', verificarActualizaciones);
    }

    // Detener el sistema de actualización
    function detenerVerificadorActualizaciones() {
        if (temporizadorActualizacion) {
            clearInterval(temporizadorActualizacion);
        }
        window.removeEventListener('focus', verificarActualizaciones);
    }

    // Sistema de actualización optimizado
    function iniciarVerificadorActualizacionesOptimizado() {
        let retrasoReintento = 5000; // 5 segundos iniciales
        const retrasoMaximo = 300000; // 5 minutos máximo
        
        const verificarConReintento = async () => {
            try {
                await verificarActualizaciones();
                // Si fue exitoso, volver al intervalo normal
                retrasoReintento = intervaloActualizacion;
            } catch (error) {
                // Si falla, aumentar el retraso progresivamente
                retrasoReintento = Math.min(retrasoReintento * 2, retrasoMaximo);
                console.warn(`Error en la actualización. Reintentando en ${retrasoReintento/1000} segundos...`);
            }
            
            // Programar próximo chequeo
            temporizadorActualizacion = setTimeout(verificarConReintento, retrasoReintento);
        };
        
        // Iniciar el ciclo
        verificarConReintento();
        
        // Ajustar según la visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Cuando la página vuelve a ser visible, verificar inmediatamente
                clearTimeout(temporizadorActualizacion);
                verificarConReintento();
            }
        });
    }

    // Inicializar la tabla y paginación
    mostrarDeducciones(paginaActual).then(() => {
        configurarPaginacion();
        actualizarBotonesPaginacion();
    });

    // Validaciones para los inputs del modal
    document.getElementById('porcentajeDeduccion').addEventListener('input', function(e) {
        // Eliminar cualquier carácter que no sea número o punto
        let valor = this.value.replace(/[^\d.]/g, '');
        
        // Eliminar puntos adicionales (solo permitir uno)
        const partes = valor.split('.');
        if (partes.length > 2) {
            valor = partes[0] + '.' + partes.slice(1).join('');
        }
        
        // Limitar a 2 decimales
        if (partes.length === 2 && partes[1].length > 2) {
            valor = partes[0] + '.' + partes[1].substring(0, 2);
        }
        
        // Limitar la longitud total a 10 caracteres
        if (valor.length > 10) {
            valor = valor.substring(0, 10);
        }
        
        // Validar que no empiece con punto
        if (valor.startsWith('.')) {
            valor = '';
        }
        
        // Validar que no sea mayor a 100
        const valorNumerico = parseFloat(valor);
        if (!isNaN(valorNumerico) && valorNumerico > 100) {
            valor = '100';
        }
        
        this.value = valor;
    });

    // Validación al perder el foco
    document.getElementById('porcentajeDeduccion').addEventListener('blur', function() {
        const valor = this.value.trim();
        const valorNumerico = parseFloat(valor);
        
        if (valor === '' || isNaN(valorNumerico)) {
            this.classList.add('is-invalid');
            return;
        }
        
        // Validar formato de decimales
        const partesDecimales = valor.split('.');
        if (partesDecimales.length === 2 && partesDecimales[1].length > 2) {
            this.classList.add('is-invalid');
            return;
        }
        
        this.classList.remove('is-invalid');
    });

    // Iniciar el sistema de actualización en tiempo real (versión optimizada)
    iniciarVerificadorActualizacionesOptimizado();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', detenerVerificadorActualizaciones);
});