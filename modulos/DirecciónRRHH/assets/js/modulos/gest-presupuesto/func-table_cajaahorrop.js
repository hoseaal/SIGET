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
    const filasPorPagina = 7;
    let paginaActual = 1;
    let totalRegistros = 0;
    let totalPaginas = 1;
    const cuerpoTabla = document.querySelector('#cajaAhorroTable tbody');
    const elementoPaginacion = document.getElementById('paginationCajaAhorro');

    // Variables para el control de actualización en tiempo real
    let ultimoTimestampActualizacionCaja = null;
    let intervaloActualizacionCaja = 1000; // 1 segundo
    let temporizadorActualizacionCaja = null;
    let estaActualizandoCaja = false;

    // Variables para búsqueda
    let todosTrabajadores = [];
    let estaBuscando = false;
    let terminoBusquedaActual = '';

    // Función para cargar TODOS los trabajadores desde la API (para búsqueda)
    async function obtenerTodosTrabajadores() {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_caja-ahorro.php?all=true`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                todosTrabajadores = datos.trabajadores;
                return datos.trabajadores;
            } else {
                console.error('Error al cargar todos los trabajadores:', datos.message);
                smallSwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los trabajadores',
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

    // Función para cargar los trabajadores paginados desde la API
    async function obtenerTrabajadores(pagina) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_caja-ahorro.php?page=${pagina}&per_page=${filasPorPagina}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                totalRegistros = datos.total;
                totalPaginas = datos.total_pages;
                return {
                    trabajadores: datos.trabajadores,
                    total: datos.total,
                    total_pages: datos.total_pages
                };
            } else {
                console.error('Error al cargar trabajadores:', datos.message);
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
    function filtrarTrabajadoresLocalmente(trabajadores, terminoBusqueda) {
        if (!terminoBusqueda) return trabajadores;
        
        const terminoBusquedaMinusculas = terminoBusqueda.toLowerCase();
        return trabajadores.filter(trabajador => {
            return (
                (trabajador.nom_ced && trabajador.nom_ced.toLowerCase().includes(terminoBusquedaMinusculas)) ||
                (trabajador.nom_nom && trabajador.nom_nom.toLowerCase().includes(terminoBusquedaMinusculas)) ||
                (trabajador.nom_ape && trabajador.nom_ape.toLowerCase().includes(terminoBusquedaMinusculas)) ||
                (trabajador.cep_activa !== undefined && (trabajador.cep_activa ? 'activo' : 'inactivo').includes(terminoBusquedaMinusculas))
            );
        });
    }

    // Función para mostrar los trabajadores en la página actual
    async function mostrarTrabajadores(pagina, trabajadoresAMostrar = null) {
        const estaFiltrado = trabajadoresAMostrar !== null;
        
        // Mostrar loader mientras carga
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        let trabajadores = [];
        if (estaFiltrado) {
            trabajadores = trabajadoresAMostrar;
            totalRegistros = trabajadores.length;
            totalPaginas = Math.ceil(trabajadores.length / filasPorPagina);
        } else {
            const resultado = await obtenerTrabajadores(pagina);
            trabajadores = resultado.trabajadores;
            totalRegistros = resultado.total;
            totalPaginas = resultado.total_pages;
        }
        
        // Pequeño retraso para evitar parpadeo con cargas rápidas
        await new Promise(resolve => setTimeout(resolve, 200));
        
        cuerpoTabla.innerHTML = '';
        
        if (trabajadores.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < filasPorPagina; i++) {
                const fila = document.createElement('tr');
                if (i === 0) {
                    fila.innerHTML = `
                        <td colspan="5" class="text-center empty-row">
                            ${estaFiltrado ? 'No se encontraron coincidencias' : 'No se encontraron registros'}
                        </td>
                    `;
                } else {
                    fila.innerHTML = '<td colspan="5" class="empty-row">&nbsp;</td>';
                }
                cuerpoTabla.appendChild(fila);
            }
            
            // Actualizar paginación para reflejar que no hay datos
            configurarPaginacion();
            return;
        }

        // Llenar con datos reales
        trabajadores.forEach((trabajador, indice) => {
            const fila = document.createElement('tr');
            const numeroItem = (pagina - 1) * filasPorPagina + indice + 1;
            
            fila.innerHTML = `
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
                            <a class="dropdown-item editar-trabajador-btn" href="javascript:void(0);" data-cep_ide="${trabajador.cep_ide}">
                                <i class="bx bx-edit-alt me-1"></i> Editar
                            </a>
                            <a class="dropdown-item eliminar-trabajador-btn" href="javascript:void(0);" 
                            data-cep_ide="${trabajador.cep_ide}" 
                            data-nom_ced="${trabajador.nom_ced}" 
                            data-nombre="${trabajador.nom_nom || 'N/A'} ${trabajador.nom_ape || ''}">
                                <i class="bx bx-trash me-1"></i> Eliminar
                            </a>
                        </div>
                    </div>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });

        // Completar con filas vacías si no llega a filasPorPagina
        if (trabajadores.length < filasPorPagina) {
            const filasRestantes = filasPorPagina - trabajadores.length;
            for (let i = 0; i < filasRestantes; i++) {
                const fila = document.createElement('tr');
                fila.innerHTML = '<td colspan="5" class="empty-row">&nbsp;</td>';
                cuerpoTabla.appendChild(fila);
            }
        }

        // Configurar eventos para los botones
        configurarEventListeners();
        
        // Actualizar paginación
        configurarPaginacion();
    }

    // Función para configurar el buscador
    function configurarBusqueda() {
        const inputBusqueda = document.getElementById('cajaAhorroSearch');
        let temporizadorBusqueda;
        
        // Cargar todos los registros al iniciar para búsquedas
        obtenerTodosTrabajadores();
        
        inputBusqueda.addEventListener('input', function() {
            clearTimeout(temporizadorBusqueda);
            
            const terminoBusqueda = this.value.trim();
            terminoBusquedaActual = terminoBusqueda;
            
            if (terminoBusqueda.length === 0) {
                // Si el buscador está vacío, volver a la paginación normal
                estaBuscando = false;
                paginaActual = 1;
                mostrarTrabajadores(paginaActual);
                elementoPaginacion.style.display = '';
                return;
            }
            
            // Pequeño retraso para no hacer búsquedas con cada tecla
            temporizadorBusqueda = setTimeout(async () => {
                estaBuscando = true;
                
                // Mostrar loader
                cuerpoTabla.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Buscando...</span>
                            </div>
                        </td>
                    </tr>
                `;
                
                // Si no tenemos todos los registros cargados, intentar cargarlos
                if (todosTrabajadores.length === 0) {
                    todosTrabajadores = await obtenerTodosTrabajadores();
                }
                
                // Filtrar localmente con todos los datos
                const filtrados = filtrarTrabajadoresLocalmente(todosTrabajadores, terminoBusqueda);
                mostrarTrabajadores(1, filtrados);
                elementoPaginacion.style.display = filtrados.length > filasPorPagina ? '' : 'none';
            }, 300);
        });
        
        // Restaurar paginación si se borra la búsqueda
        inputBusqueda.addEventListener('keyup', function(e) {
            if (e.key === 'Escape' || this.value.trim() === '') {
                this.value = '';
                estaBuscando = false;
                paginaActual = 1;
                mostrarTrabajadores(paginaActual);
                elementoPaginacion.style.display = '';
            }
        });
    }

    // Función para configurar los event listeners
    function configurarEventListeners() {
        // Agregar event listeners para los botones de editar
        document.querySelectorAll('.editar-trabajador-btn').forEach(boton => {
            boton.addEventListener('click', async function() {
                const cep_ide = this.getAttribute('data-cep_ide');
                try {
                    const respuesta = await fetch(`../PHP/api/gest-presupuesto/detalles_caja-ahorro.php?cep_ide=${cep_ide}`);
                    const datos = await respuesta.json();
                    
                    if (datos.success) {
                        abrirModalEdicion(datos.trabajador);
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
        document.querySelectorAll('.eliminar-trabajador-btn').forEach(boton => {
            boton.addEventListener('click', function() {
                const cep_ide = this.getAttribute('data-cep_ide');
                const nom_ced = this.getAttribute('data-nom_ced');
                const nombre = this.getAttribute('data-nombre');
                mostrarConfirmacionEliminacion(cep_ide, nom_ced, nombre);
            });
        });
    }

    // Función para mostrar confirmación de eliminación
    function mostrarConfirmacionEliminacion(cep_ide, nom_ced, nombre) {
        smallSwal.fire({
            title: '¿Eliminar de Caja de Ahorro?',
            html: `¿Seguro que desea eliminar a <strong>${nombre}</strong> (C.I. ${nom_ced}) de la caja de ahorro?<br><br><span class="text-danger">¡Esta acción no se puede deshacer!</span>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Mostrar loader durante la eliminación
                smallSwal.fire({
                    title: 'Eliminando registro',
                    html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" style="width: 100%; height: 100%;"></div></div>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        smallSwal.showLoading();
                    }
                });
                
                await eliminarTrabajador(cep_ide);
            }
        });
    }

    // Función para eliminar un trabajador de la caja de ahorro
    async function eliminarTrabajador(cep_ide) {
        try {
            const respuesta = await fetch('../PHP/api/gest-presupuesto/eliminar_caja-ahorro.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cep_ide: cep_ide })
            });
            
            const resultado = await respuesta.json();
            
            if (!respuesta.ok) {
                throw new Error(resultado.message || `Error HTTP: ${respuesta.status}`);
            }
            
            if (resultado.success) {
                // Cerrar cualquier alerta abierta
                smallSwal.close();
                
                // Verificar si debemos cambiar de página
                if (paginaActual > 1 && (totalRegistros - 1) <= ((paginaActual - 1) * filasPorPagina)) {
                    paginaActual--;
                }
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: resultado.message || 'Trabajador eliminado correctamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar la tabla
                    if (estaBuscando) {
                        todosTrabajadores = await obtenerTodosTrabajadores();
                        const filtrados = filtrarTrabajadoresLocalmente(todosTrabajadores, terminoBusquedaActual);
                        mostrarTrabajadores(1, filtrados);
                    } else {
                        await mostrarTrabajadores(paginaActual);
                    }
                });
            } else {
                throw new Error(resultado.message || 'Error al eliminar el trabajador');
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
        
        if (totalPaginas <= 1) return;
        
        // Botón Primera página
        let li = document.createElement('li');
        li.className = 'page-item first' + (paginaActual === 1 ? ' disabled' : '');
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-left"></i></a>`;
        li.addEventListener('click', () => {
            if (paginaActual !== 1) {
                paginaActual = 1;
                if (estaBuscando) {
                    const filtrados = filtrarTrabajadoresLocalmente(todosTrabajadores, terminoBusquedaActual);
                    mostrarTrabajadores(1, filtrados);
                } else {
                    mostrarTrabajadores(paginaActual);
                }
            }
        });
        elementoPaginacion.appendChild(li);
        
        // Botón Página anterior
        li = document.createElement('li');
        li.className = 'page-item prev' + (paginaActual === 1 ? ' disabled' : '');
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-left"></i></a>`;
        li.addEventListener('click', () => {
            if (paginaActual > 1) {
                paginaActual--;
                if (estaBuscando) {
                    const filtrados = filtrarTrabajadoresLocalmente(todosTrabajadores, terminoBusquedaActual);
                    mostrarTrabajadores(paginaActual, filtrados);
                } else {
                    mostrarTrabajadores(paginaActual);
                }
            }
        });
        elementoPaginacion.appendChild(li);
        
        // Números de página
        const paginaInicio = Math.max(1, paginaActual - 2);
        const paginaFin = Math.min(totalPaginas, paginaActual + 2);
        
        for (let i = paginaInicio; i <= paginaFin; i++) {
            li = document.createElement('li');
            li.className = 'page-item' + (i === paginaActual ? ' active' : '');
            li.innerHTML = `<a class="page-link" href="javascript:void(0);">${i}</a>`;
            li.addEventListener('click', () => {
                if (paginaActual !== i) {
                    paginaActual = i;
                    if (estaBuscando) {
                        const filtrados = filtrarTrabajadoresLocalmente(todosTrabajadores, terminoBusquedaActual);
                        mostrarTrabajadores(paginaActual, filtrados);
                    } else {
                        mostrarTrabajadores(paginaActual);
                    }
                }
            });
            elementoPaginacion.appendChild(li);
        }
        
        // Botón Página siguiente
        li = document.createElement('li');
        li.className = 'page-item next' + (paginaActual === totalPaginas ? ' disabled' : '');
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-right"></i></a>`;
        li.addEventListener('click', () => {
            if (paginaActual < totalPaginas) {
                paginaActual++;
                if (estaBuscando) {
                    const filtrados = filtrarTrabajadoresLocalmente(todosTrabajadores, terminoBusquedaActual);
                    mostrarTrabajadores(paginaActual, filtrados);
                } else {
                    mostrarTrabajadores(paginaActual);
                }
            }
        });
        elementoPaginacion.appendChild(li);
        
        // Botón Última página
        li = document.createElement('li');
        li.className = 'page-item last' + (paginaActual === totalPaginas ? ' disabled' : '');
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-right"></i></a>`;
        li.addEventListener('click', () => {
            if (paginaActual !== totalPaginas) {
                paginaActual = totalPaginas;
                if (estaBuscando) {
                    const filtrados = filtrarTrabajadoresLocalmente(todosTrabajadores, terminoBusquedaActual);
                    mostrarTrabajadores(paginaActual, filtrados);
                } else {
                    mostrarTrabajadores(paginaActual);
                }
            }
        });
        elementoPaginacion.appendChild(li);
    }

    // Función para abrir el modal de edición con datos
    async function abrirModalEdicion(datosTrabajador) {
        // Cargar los trabajadores disponibles
        try {
            const respuesta = await fetch('../PHP/api/gest-presupuesto/carga-modal_caja-ahorro.php');
            const datos = await respuesta.json();
            
            if (!datos.success) {
                throw new Error('No se pudieron cargar los trabajadores');
            }

            const selectTrabajador = document.getElementById('trabajadorSelect');
            selectTrabajador.innerHTML = '<option value="">Seleccione un trabajador</option>';
            
            // Agregar todos los trabajadores (incluyendo el actual)
            datos.todosLosTrabajadores.forEach(trabajador => {
                const opcion = document.createElement('option');
                opcion.value = trabajador.nom_ced;
                opcion.textContent = `${trabajador.nombre_completo} (${trabajador.nom_ced})`;
                opcion.selected = trabajador.nom_ced === datosTrabajador.nom_ced;
                selectTrabajador.appendChild(opcion);
            });

            // Configurar el estado del switch
            document.getElementById('estadoCajaAhorro').checked = datosTrabajador.cep_activa == 1;

            // Configurar el botón de guardar
            const botonGuardar = document.querySelector('#ModalCajaAhorro .btn-primary');
            botonGuardar.onclick = async function() {
                await actualizarTrabajador(datosTrabajador.cep_ide);
            };

            // Mostrar el modal
            const modalEdicion = new bootstrap.Modal(document.getElementById('ModalCajaAhorro'));
            modalEdicion.show();

        } catch (error) {
            console.error('Error al cargar datos del modal:', error);
            alert('Error al cargar los datos necesarios para editar');
        }
    }

    // Función para actualizar un trabajador en la caja de ahorro
    async function actualizarTrabajador(cep_ide) {
        const botonGuardar = document.querySelector('#ModalCajaAhorro .btn-primary');
        const textoOriginal = botonGuardar.innerHTML;
        
        // Mostrar spinner y deshabilitar botón
        botonGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        botonGuardar.disabled = true;
        
        try {
            // Obtener los datos del formulario
            const datosActualizados = {
                cep_ide: cep_ide,
                nom_ced: document.getElementById('trabajadorSelect').value,
                cep_activa: document.getElementById('estadoCajaAhorro').checked ? 1 : 0
            };

            // Validación básica
            if (!datosActualizados.nom_ced) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Datos incompletos',
                    text: 'Por favor seleccione un trabajador',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return;
            }
            
            // Llamada a la API para guardar cambios
            const respuesta = await fetch('../PHP/api/gest-presupuesto/actualizar_caja-ahorro.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosActualizados)
            });
            
            const resultado = await respuesta.json();
            
            if (resultado.success) {
                // Cerrar el modal
                bootstrap.Modal.getInstance(document.getElementById('ModalCajaAhorro')).hide();
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'Cambios guardados exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar los datos
                    if (estaBuscando) {
                        todosTrabajadores = await obtenerTodosTrabajadores();
                        const filtrados = filtrarTrabajadoresLocalmente(todosTrabajadores, terminoBusquedaActual);
                        mostrarTrabajadores(1, filtrados);
                    } else {
                        await mostrarTrabajadores(paginaActual);
                    }
                });
            } else {
                throw new Error(resultado.message || 'Error desconocido');
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

    // Función para agregar un nuevo trabajador
    async function agregarTrabajador() {
        const botonAgregar = document.getElementById('confirmarAgregarBtn');
        const textoOriginal = botonAgregar.innerHTML;
        
        // Mostrar spinner y deshabilitar botón
        botonAgregar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Agregando...';
        botonAgregar.disabled = true;
        
        try {
            // Obtener el valor seleccionado de Select2
            const nuevoTrabajador = $('#nuevoTrabajadorSelect').val();
            const estado = document.getElementById('nuevoEstadoCajaAhorro').checked ? 1 : 0;

            if (!nuevoTrabajador) {
                throw new Error('Seleccione un trabajador');
            }

            const respuesta = await fetch('../PHP/api/gest-presupuesto/agregar_caja-ahorro.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom_ced: nuevoTrabajador,
                    cep_activa: estado
                })
            });
            
            const resultado = await respuesta.json();
            
            if (resultado.success) {
                // Cerrar el modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalAgregarCajaAhorro'));
                modal.hide();
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Agregado!',
                    text: resultado.message || 'Trabajador agregado correctamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar la tabla (volver a la primera página)
                    paginaActual = 1;
                    if (estaBuscando) {
                        todosTrabajadores = await obtenerTodosTrabajadores();
                        const filtrados = filtrarTrabajadoresLocalmente(todosTrabajadores, terminoBusquedaActual);
                        mostrarTrabajadores(1, filtrados);
                    } else {
                        await mostrarTrabajadores(paginaActual);
                    }
                });
            } else {
                throw new Error(resultado.message || 'Error al agregar el trabajador');
            }
        } catch (error) {
            console.error('Error al agregar:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al agregar: ' + error.message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
        } finally {
            // Restaurar el botón
            botonAgregar.innerHTML = textoOriginal;
            botonAgregar.disabled = false;
        }
    }

    // Función para abrir el modal de agregar nuevo trabajador
    async function abrirModalAgregar() {
        try {
            console.log("Cargando trabajadores disponibles...");
            const respuesta = await fetch('../PHP/api/gest-presupuesto/trabajadores_disponibles.php');
            
            if (!respuesta.ok) {
                throw new Error(`HTTP error! status: ${respuesta.status}`);
            }
            
            const datos = await respuesta.json();
            console.log("Respuesta recibida:", datos);
            
            if (!datos.success) {
                throw new Error(datos.message || 'No se pudieron cargar los trabajadores disponibles');
            }

            const selectTrabajador = document.getElementById('nuevoTrabajadorSelect');
            selectTrabajador.innerHTML = '<option value=""></option>'; // Select2 necesita option vacío
            
            if (!datos.trabajadores || datos.trabajadores.length === 0) {
                console.warn("No hay trabajadores disponibles para agregar");
                const opcion = document.createElement('option');
                opcion.value = "";
                opcion.textContent = "No hay trabajadores disponibles";
                opcion.disabled = true;
                selectTrabajador.appendChild(opcion);
            } else {
                console.log(`Agregando ${datos.trabajadores.length} trabajadores al select`);
                datos.trabajadores.forEach(trabajador => {
                    const opcion = document.createElement('option');
                    opcion.value = trabajador.nom_ced;
                    opcion.textContent = `${trabajador.nombre_completo} (${trabajador.nom_ced})`;
                    selectTrabajador.appendChild(opcion);
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
                    const opcion = selectTrabajador.querySelector(`option[value="${trabajador.id}"]`);
                    return opcion ? opcion.text : trabajador.text;
                },
                templateSelection: function(trabajador) {
                    if (!trabajador.id) return trabajador.text;
                    const opcion = selectTrabajador.querySelector(`option[value="${trabajador.id}"]`);
                    return opcion ? opcion.text : trabajador.text;
                }
            });

            // Configurar el botón de agregar
            document.getElementById('confirmarAgregarBtn').onclick = agregarTrabajador;

            // Mostrar el modal
            const modalAgregar = new bootstrap.Modal(document.getElementById('modalAgregarCajaAhorro'));
            modalAgregar.show();

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
    document.getElementById('agregarCajaAhorro').addEventListener('click', abrirModalAgregar);

    // Función para verificar cambios en bit_cep
    async function verificarActualizacionesCaja() {
        if (estaActualizandoCaja) return;
        estaActualizandoCaja = true;
        
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/check_caja_updates.php?last_update=${ultimoTimestampActualizacionCaja || ''}`);
            const datos = await respuesta.json();
            
            if (datos.success && datos.has_changes) {
                ultimoTimestampActualizacionCaja = datos.last_update;
                
                // Actualizar la tabla con animación suave
                await actualizarTablaSuavementeCaja();
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones de caja:', error);
        } finally {
            estaActualizandoCaja = false;
        }
    }

    // Función para actualizar la tabla con animación suave
    async function actualizarTablaSuavementeCaja() {
        // Agregar clase de transición a la tabla
        const tabla = document.getElementById('cajaAhorroTable');
        tabla.classList.add('table-updating');
        
        // Mostrar indicador de actualización
        const indicadorActualizacion = document.createElement('div');
        tabla.parentNode.insertBefore(indicadorActualizacion, tabla);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Recargar datos
        if (estaBuscando) {
            todosTrabajadores = await obtenerTodosTrabajadores();
            const filtrados = filtrarTrabajadoresLocalmente(todosTrabajadores, terminoBusquedaActual);
            await mostrarTrabajadores(paginaActual, filtrados);
        } else {
            await mostrarTrabajadores(paginaActual);
        }
        
        // Ocultar indicador y quitar clase de transición
        indicadorActualizacion.remove();
        tabla.classList.remove('table-updating');
        
        // Mostrar notificación de actualización
        mostrarNotificacionActualizacionCaja();
    }

    // Función para mostrar notificación de actualización
    function mostrarNotificacionActualizacionCaja() {
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
            title: 'Caja de ahorro actualizada',
            background: '#f8f9fa',
            color: '#333'
        });
    }

    // Iniciar el sistema de actualización periódica
    function iniciarVerificadorActualizacionesCaja() {
        // Verificar actualizaciones inmediatamente
        verificarActualizacionesCaja();
        
        // Configurar intervalo periódico
        temporizadorActualizacionCaja = setInterval(verificarActualizacionesCaja, intervaloActualizacionCaja);
        
        // También verificar cuando la ventana gana foco
        window.addEventListener('focus', verificarActualizacionesCaja);
    }

    // Detener el sistema de actualización
    function detenerVerificadorActualizacionesCaja() {
        if (temporizadorActualizacionCaja) {
            clearInterval(temporizadorActualizacionCaja);
        }
        window.removeEventListener('focus', verificarActualizacionesCaja);
    }

    // Inicializar la tabla y el buscador
    mostrarTrabajadores(paginaActual).then(() => {
        configurarBusqueda();
    });

    // Iniciar el sistema de actualización en tiempo real
    iniciarVerificadorActualizacionesCaja();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', detenerVerificadorActualizacionesCaja);
});