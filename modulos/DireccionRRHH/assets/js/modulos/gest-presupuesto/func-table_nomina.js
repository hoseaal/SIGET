document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación
    const filasPorPagina = 7;
    let paginaActual = 1;
    let totalTrabajadores = 0;
    let totalPaginas = 1;
    const cuerpoTabla = document.querySelector('#workersTable tbody');
    const elementoPaginacion = document.getElementById('pagination');

    // Variables para búsqueda global
    let todosTrabajadores = [];
    let buscando = false;
    let terminoBusquedaActual = '';

    // Variables para el control de actualización en tiempo real
    let ultimoTimestampActualizacion = null;
    let intervaloActualizacion = 1000; // 1 segundos
    let temporizadorActualizacion = null;
    let actualizando = false;

    // Funcionamiento de estilos
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

    // Función para validar solo números (sin caracteres especiales)
    function validarSoloNumeros(evento) {
        const codigoCaracter = evento.which ? evento.which : evento.keyCode;
        if (codigoCaracter > 31 && (codigoCaracter < 48 || codigoCaracter > 57)) {
            evento.preventDefault();
            return false;
        }
        return true;
    }

    // Función para validar solo letras (con acentos)
    function validarSoloLetras(evento) {
        const codigoCaracter = evento.which ? evento.which : evento.keyCode;
        // Permitir teclas de control (backspace, delete, etc.)
        if (codigoCaracter <= 32 || (codigoCaracter >= 65 && codigoCaracter <= 90) || (codigoCaracter >= 97 && codigoCaracter <= 122)) {
            return true;
        }
        // Permitir letras con acentos (á, é, í, ó, ú, ñ, etc.)
        if (codigoCaracter >= 192 && codigoCaracter <= 255) {
            return true;
        }
        evento.preventDefault();
        return false;
    }

    // Función para cargar TODOS los trabajadores desde la API (para búsqueda)
    async function obtenerTodosTrabajadores() {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_nomina.php?all=true`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                todosTrabajadores = datos.workers;
                return datos.workers;
            } else {
                console.error('Error al cargar todos los trabajadores:', datos.message);
                return [];
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return [];
        }
    }

    // Función para cargar los trabajadores paginados desde la API
    async function obtenerTrabajadores(pagina) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_nomina.php?page=${pagina}&per_page=${filasPorPagina}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                totalTrabajadores = datos.total;
                totalPaginas = datos.total_pages;
                return {
                    trabajadores: datos.workers,
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

    // Función para filtrar trabajadores localmente
    function filtrarTrabajadoresLocalmente(trabajadores, terminoBusqueda) {
        if (!terminoBusqueda) return trabajadores;
        
        const terminoBusquedaMinusculas = terminoBusqueda.toLowerCase();
        return trabajadores.filter(trabajador => {
            return (
                (trabajador.cedula && trabajador.cedula.toLowerCase().includes(terminoBusquedaMinusculas)) ||
                (trabajador.nombres && trabajador.nombres.toLowerCase().includes(terminoBusquedaMinusculas)) ||
                (trabajador.apellidos && trabajador.apellidos.toLowerCase().includes(terminoBusquedaMinusculas)) ||
                (trabajador.genero && trabajador.genero.toLowerCase().includes(terminoBusquedaMinusculas)) ||
                (trabajador.departamento && trabajador.departamento.toLowerCase().includes(terminoBusquedaMinusculas))
            );
        });
    }

    // Función para mostrar los trabajadores en la página actual
    async function mostrarTrabajadores(pagina, trabajadoresAMostrar = null) {
        const estaFiltrado = trabajadoresAMostrar !== null;

        const encabezadoAcciones = document.querySelector('#actionsColumnHeader');
        if (LOGGED_USER_TYPE === '1' || LOGGED_USER_TYPE === '2') {
            encabezadoAcciones.style.display = 'none';
        } else {
            encabezadoAcciones.style.display = '';
        }

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
        
        let trabajadores = [];
        if (estaFiltrado) {
            trabajadores = trabajadoresAMostrar;
            totalTrabajadores = trabajadores.length;
            totalPaginas = Math.ceil(trabajadores.length / filasPorPagina);
        } else {
            const resultado = await obtenerTrabajadores(pagina);
            trabajadores = resultado.trabajadores;
            totalTrabajadores = resultado.total;
            totalPaginas = resultado.total_pages;
        }
        
        // Pequeño retraso para evitar parpadeo con cargas rápidas
        await new Promise(resolver => setTimeout(resolver, 200));
        
        cuerpoTabla.innerHTML = '';
        
        if (trabajadores.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < filasPorPagina; i++) {
                const fila = document.createElement('tr');
                if (i === 0) {
                    fila.innerHTML = `
                        <td colspan="6" class="text-center empty-row">
                            ${estaFiltrado ? 'No se encontraron coincidencias' : 'No se encontraron trabajadores'}
                        </td>
                    `;
                } else {
                    fila.innerHTML = '<td colspan="6" class="empty-row">&nbsp;</td>';
                }
                cuerpoTabla.appendChild(fila);
            }
            
            // Actualizar paginación para reflejar que no hay datos
            configurarPaginacion();
            return;
        }

        // Llenar con datos reales
        trabajadores.forEach(trabajador => {
            const fila = document.createElement('tr');
            
            // Determinar qué mostrar en la columna de acciones según el tipo de usuario
            let accionesHtml = '';
            
            if (LOGGED_USER_TYPE === '1' || LOGGED_USER_TYPE === '2') {
                // Caso 1: No mostrar columna de acciones
                fila.innerHTML = `
                    <td><strong>${trabajador.cedula}</strong></td>
                    <td>${trabajador.nombres}</td>
                    <td>${trabajador.apellidos}</td>
                    <td>${trabajador.genero}</td>
                    <td>${trabajador.departamento}</td>
                    <td></td> <!-- Columna vacía -->
                `;
            } else if (LOGGED_USER_TYPE === '3') {
                // Caso 2: Mostrar solo editar
                fila.innerHTML = `
                    <td><strong>${trabajador.cedula}</strong></td>
                    <td>${trabajador.nombres}</td>
                    <td>${trabajador.apellidos}</td>
                    <td>${trabajador.genero}</td>
                    <td>${trabajador.departamento}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-worker-btn" href="javascript:void(0);" data-cedula="${trabajador.cedula}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            } else {
                // Caso 3: Mostrar todo (tipos 3 y 4)
                fila.innerHTML = `
                    <td><strong>${trabajador.cedula}</strong></td>
                    <td>${trabajador.nombres}</td>
                    <td>${trabajador.apellidos}</td>
                    <td>${trabajador.genero}</td>
                    <td>${trabajador.departamento}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-worker-btn" href="javascript:void(0);" data-cedula="${trabajador.cedula}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                                <a class="dropdown-item delete-worker-btn" href="javascript:void(0);" data-cedula="${trabajador.cedula}">
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
        if (trabajadores.length < filasPorPagina) {
            const filasRestantes = filasPorPagina - trabajadores.length;
            for (let i = 0; i < filasRestantes; i++) {
                const fila = document.createElement('tr');
                fila.innerHTML = '<td colspan="6" class="empty-row">&nbsp;</td>';
                cuerpoTabla.appendChild(fila);
            }
        }

        // Configurar eventos para los botones
        configurarEventos();
        
        // Actualizar paginación
        configurarPaginacion();
    }

    // Función para configurar el buscador
    function configurarBusqueda() {
        const entradaBusqueda = document.getElementById('workersSearch');
        let temporizadorBusqueda;
        
        // Cargar todos los registros al iniciar para búsquedas
        obtenerTodosTrabajadores();
        
        entradaBusqueda.addEventListener('input', function() {
            clearTimeout(temporizadorBusqueda);
            
            const terminoBusqueda = this.value.trim();
            terminoBusquedaActual = terminoBusqueda;
            
            if (terminoBusqueda.length === 0) {
                // Si el buscador está vacío, volver a la paginación normal
                buscando = false;
                paginaActual = 1;
                mostrarTrabajadores(paginaActual);
                elementoPaginacion.style.display = '';
                return;
            }
            
            // Pequeño retraso para no hacer búsquedas con cada tecla
            temporizadorBusqueda = setTimeout(async () => {
                buscando = true;
                
                // Mostrar loader
                cuerpoTabla.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-4">
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
        entradaBusqueda.addEventListener('keyup', function(e) {
            if (e.key === 'Escape' || this.value.trim() === '') {
                this.value = '';
                buscando = false;
                paginaActual = 1;
                mostrarTrabajadores(paginaActual);
                elementoPaginacion.style.display = '';
            }
        });
    }

    // Función para configurar los event listeners
    function configurarEventos() {
        // event listeners para los botones de editar
        document.querySelectorAll('.edit-worker-btn').forEach(boton => {
            boton.addEventListener('click', async function() {
                const cedula = this.getAttribute('data-cedula');
                const datosTrabajador = await obtenerDetallesTrabajador(cedula);
                if (datosTrabajador) {
                    abrirModalEdicion(datosTrabajador);
                } else {
                    alert('No se pudieron cargar los datos del trabajador');
                }
            });
        });

        // event listeners para los botones de eliminar
        document.querySelectorAll('.delete-worker-btn').forEach(boton => {
            boton.addEventListener('click', function() {
                const cedula = this.getAttribute('data-cedula');
                mostrarConfirmacionEliminacion(cedula);
            });
        });
    }

    // Función para obtener los datos completos de un trabajador
    async function obtenerDetallesTrabajador(cedula) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/carga-modal_edit_nomina.php?cedula=${cedula}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                return datos.worker;
            } else {
                console.error('Error al cargar detalles:', datos.message);
                return null;
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return null;
        }
    }

    // Función para mostrar confirmación de eliminación
    function mostrarConfirmacionEliminacion(cedula) {
        // Verificar si el usuario está intentando eliminarse a sí mismo
        if (typeof LOGGED_USER_CI !== 'undefined' && cedula === LOGGED_USER_CI) {
            smallSwal.fire({
                icon: 'warning',
                title: 'Acción no permitida',
                html: 'No puede eliminarse a sí mismo del sistema.<br><small class="text-muted">Por razones de seguridad, esta acción está restringida.</small>',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            return;
        }
        
        // Si no es auto-eliminación, mostrar el modal de confirmación
        smallSwal.fire({
            title: 'Confirmar Eliminación',
            html: `¿Seguro de eliminar al usuario con <strong>C.I. ${cedula}</strong> de la nómina?<br><small class="text-danger">¡Este cambio no se puede deshacer!</small>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, Eliminar',
            cancelButtonText: 'Cancelar'
        }).then((resultado) => {
            if (resultado.isConfirmed) {
                eliminarTrabajador(cedula);
            }
        });
    }

    // Función para eliminar un trabajador
    async function eliminarTrabajador(cedula) {
        // Mostrar loader
        smallSwal.fire({
            title: 'Eliminando trabajador',
            html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%; height: 100%;"></div></div>',
            width: 350,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                smallSwal.showLoading();
            }
        });

        try {
            const respuesta = await fetch('../PHP/api/gest-presupuesto/eliminar-user_nomina.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cedula: cedula })
            });
            
            const resultado = await respuesta.json();
            
            if (!respuesta.ok) {
                throw new Error(resultado.message || `Error HTTP: ${respuesta.status}`);
            }
            
            if (resultado.success) {
                // Verificar si debemos cambiar de página
                if (paginaActual > 1 && (totalTrabajadores - 1) <= ((paginaActual - 1) * filasPorPagina)) {
                    paginaActual--;
                }
                
                // Recargar la tabla
                if (buscando) {
                    todosTrabajadores = await obtenerTodosTrabajadores();
                    const filtrados = filtrarTrabajadoresLocalmente(todosTrabajadores, terminoBusquedaActual);
                    mostrarTrabajadores(1, filtrados);
                } else {
                    await mostrarTrabajadores(paginaActual);
                }
                
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: resultado.message || 'Trabajador eliminado correctamente',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                throw new Error(resultado.message || 'Error al eliminar el trabajador');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error al eliminar',
                text: error.message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
        }
    }

    // Función para abrir el modal de edición con datos completos
    function abrirModalEdicion(trabajador) {
        
        const modalEdicion = new bootstrap.Modal(document.getElementById('largeModal'));
        
        // Limpiar validaciones previas
        $('#largeModal input').off('input keypress');
        $('#largeModal select').off('change');
        
        // Configurar campos con los datos del trabajador
        document.getElementById('cedula').value = trabajador.cedula || '';
        document.getElementById('nombre').value = trabajador.nombres || '';
        document.getElementById('apellidos').value = trabajador.apellidos || '';
        document.getElementById('fechaingreso').value = trabajador.fecha_ingreso || '';
        document.getElementById('numerohijos').value = trabajador.num_hijos || 0;
        
        if (trabajador.genero === 'M' || trabajador.genero === 'Masculino') {
            document.getElementById('generoMasculino').checked = true;
        } else if (trabajador.genero === 'F' || trabajador.genero === 'Femenino') {
            document.getElementById('generoFemenino').checked = true;
        }
        
        if (trabajador.cargo_cet) {
            document.getElementById('cargocet').value = trabajador.cargo_cet;
        }
        if (trabajador.cargo_onapre) {
            document.getElementById('cargoonapre').value = trabajador.cargo_onapre;
        }
        if (trabajador.nvl_ran) {
            document.getElementById('nivelsalarial').value = trabajador.nvl_ran;
        }
        if (trabajador.nom_pro) {
            document.getElementById('nivelprof').value = trabajador.nom_pro;
        }
        if (trabajador.dep_ide) {
            document.getElementById('departamentoasig').value = trabajador.dep_ide;
        }
        
        // Configurar validaciones
        // Validación para la cédula (solo números, máximo 10 caracteres)
        $('#cedula').on('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
        }).on('keypress', validarSoloNumeros);

        // Validación para nombres (solo letras y acentos, máximo 50 caracteres)
        $('#nombre').on('input', function() {
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            if (this.value.length > 50) {
                this.value = this.value.slice(0, 50);
            }
        }).on('keypress', validarSoloLetras);

        // Validación para apellidos (solo letras y acentos, máximo 50 caracteres)
        $('#apellidos').on('input', function() {
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            if (this.value.length > 50) {
                this.value = this.value.slice(0, 50);
            }
        }).on('keypress', validarSoloLetras);

        // Validación para fecha de ingreso (no mayor a hoy)
        $('#fechaingreso').on('change', function() {
            const fechaSeleccionada = new Date(this.value);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            if (fechaSeleccionada > hoy) {
                alert('La fecha de ingreso no puede ser mayor a la fecha actual');
                this.value = trabajador.fecha_ingreso || ''; // Restaurar valor anterior
            }
        });

        // Configurar el botón de guardar
        const botonGuardar = document.querySelector('#largeModal .btn-primary');
        botonGuardar.onclick = function() {
            if (validarFormulario()) {
                guardarCambiosTrabajador(trabajador.cedula);
            }
        };
        
        modalEdicion.show();
    }

    // Función para guardar los cambios del trabajador
    async function guardarCambiosTrabajador(cedulaOriginal) {
        // Mostrar loader
        smallSwal.fire({
            title: 'Guardando cambios',
            html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%; height: 100%;"></div></div>',
            width: 350,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                smallSwal.showLoading();
            }
        });

        try {
            const datosActualizados = {
                cedula_original: cedulaOriginal,
                cedula: document.getElementById('cedula').value,
                nombres: document.getElementById('nombre').value,
                apellidos: document.getElementById('apellidos').value,
                fecha_ingreso: document.getElementById('fechaingreso').value,
                genero: document.querySelector('input[name="generoEmpleado"]:checked')?.value || '',
                num_hijos: document.getElementById('numerohijos').value,
                cargo_cet: document.getElementById('cargocet').value,
                cargo_onapre: document.getElementById('cargoonapre').value,
                nvl_ran: document.getElementById('nivelsalarial').value,
                nom_pro: document.getElementById('nivelprof').value,
                dep_ide: document.getElementById('departamentoasig').value
            };
            
            // Validación adicional por si acaso
            if (!datosActualizados.nombres || !datosActualizados.apellidos || !datosActualizados.cedula) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Campos requeridos',
                    text: 'Por favor complete todos los campos requeridos',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return;
            }
            
            const respuesta = await fetch('../PHP/api/gest-presupuesto/actualizar-user_nomina.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosActualizados)
            });
            
            const resultado = await respuesta.json();
            
            if (resultado.success) {
                bootstrap.Modal.getInstance(document.getElementById('largeModal')).hide();
                
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'Cambios guardados exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar los datos
                    if (buscando) {
                        todosTrabajadores = await obtenerTodosTrabajadores();
                        const filtrados = filtrarTrabajadoresLocalmente(todosTrabajadores, terminoBusquedaActual);
                        mostrarTrabajadores(1, filtrados);
                    } else {
                        mostrarTrabajadores(paginaActual);
                    }
                });
            } else {
                throw new Error(resultado.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: error.message,
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
                if (buscando) {
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
                if (buscando) {
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
                    if (buscando) {
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
                if (buscando) {
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
                if (buscando) {
                    const filtrados = filtrarTrabajadoresLocalmente(todosTrabajadores, terminoBusquedaActual);
                    mostrarTrabajadores(paginaActual, filtrados);
                } else {
                    mostrarTrabajadores(paginaActual);
                }
            }
        });
        elementoPaginacion.appendChild(li);
    }

    // Función para validar el formulario completo
    function validarFormulario() {
        // Validar cédula (requerida y exactamente entre 6 y 10 dígitos)
        const cedula = $('#cedula').val();
        if (!cedula || cedula.length < 6 || cedula.length > 10) {
            smallSwal.fire({
                icon: 'error',
                title: 'Cédula inválida',
                text: 'La cédula debe tener entre 6 y 10 dígitos',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            $('#cedula').focus();
            return false;
        }
        
        // Validar nombres (requerido)
        if (!$('#nombre').val()) {
            smallSwal.fire({
                icon: 'error',
                title: 'Nombres requeridos',
                text: 'Por favor ingrese los nombres del trabajador',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            $('#nombre').focus();
            return false;
        }
        
        // Validar apellidos (requerido)
        if (!$('#apellidos').val()) {
            smallSwal.fire({
                icon: 'error',
                title: 'Apellidos requeridos',
                text: 'Por favor ingrese los apellidos del trabajador',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            $('#apellidos').focus();
            return false;
        }
        
        // Validar género
        if (!$('input[name="generoEmpleado"]:checked').val()) {
            smallSwal.fire({
                icon: 'error',
                title: 'Género requerido',
                text: 'Por favor seleccione el género del empleado',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            return false;
        }
        
        // Validar selects (que no sea la opción por defecto)
        const selects = ['#cargocet', '#cargoonapre', '#nivelsalarial', '#nivelprof', '#departamentoasig'];
        for (const select of selects) {
            if (!$(select).val()) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Selección requerida',
                    text: `Por favor seleccione una opción válida para ${$(select).prev('label').text()}`,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                $(select).focus();
                return false;
            }
        }
        
        return true;
    }

    // Función para verificar cambios en bit_nom
    async function verificarActualizaciones() {
        if (actualizando) return;
        actualizando = true;
        
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/check_nomina_updates.php?last_update=${ultimoTimestampActualizacion || ''}`);
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
        // clase de transición a la tabla
        const tabla = document.getElementById('workersTable');
        tabla.classList.add('table-updating');
        
        // Mostrar indicador de actualización
        const indicadorActualizacion = document.createElement('div');
        tabla.parentNode.insertBefore(indicadorActualizacion, tabla);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolver => setTimeout(resolver, 300));
        
        // Recargar datos
        if (buscando) {
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
        mostrarNotificacionActualizacion();
    }

    // Función para mostrar notificación de actualización
    function mostrarNotificacionActualizacion() {
        smallSwal.fire({
            position: 'bottom-end',
            icon: 'success',
            title: 'Datos actualizados',
            text: 'Trabajadores en Nómina actualizados',
            showConfirmButton: false,
            timer: 2000,
            toast: true
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

    // Detener el sistema de actualización (para cuando se cierra la página, etc.)
    function detenerVerificadorActualizaciones() {
        if (temporizadorActualizacion) {
            clearInterval(temporizadorActualizacion);
        }
        window.removeEventListener('focus', verificarActualizaciones);
    }

        // Función para configurar el comportamiento del modal de edición
    function configurarModalEdicion() {
        // Lista de cargos ONAPRE que deben mostrar solo nivel I
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

        // Función para actualizar el select de nivel salarial
        function actualizarNivelSalarial(selectedOptionText, mantenerValorActual = false) {
            const nivelSalarialSelect = $('#nivelsalarial');
            const valorActual = nivelSalarialSelect.val();
            
            if (cargosEspeciales.includes(selectedOptionText)) {
                // Si es un cargo especial, mostrar solo opción I
                nivelSalarialSelect.html(`
                    <option value="">Seleccione</option>
                    <option value="I" selected>I</option>
                `);
            } else {
                // Si no es un cargo especial, mostrar todas las opciones
                let opciones = `
                    <option value="">Seleccione</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                    <option value="V">V</option>
                    <option value="VI">VI</option>
                    <option value="VII">VII</option>
                `;
                
                nivelSalarialSelect.html(opciones);
                
                // Restaurar el valor anterior si es válido
                if (mantenerValorActual && valorActual && ['I','II','III','IV','V','VI','VII'].includes(valorActual)) {
                    nivelSalarialSelect.val(valorActual);
                }
            }
        }

        // Configurar evento change para el select de Cargo ONAPRE
        $(document).on('change', '#cargoonapre', function() {
            const selectedOptionText = $(this).find('option:selected').text().trim();
            actualizarNivelSalarial(selectedOptionText, true);
        });

        // Configurar evento cuando se muestra el modal
        $(document).on('show.bs.modal', '#largeModal', function() {
            const selectedOptionText = $('#cargoonapre').find('option:selected').text().trim();
            actualizarNivelSalarial(selectedOptionText);
        });
    }

    // Inicializar la configuración del modal
    configurarModalEdicion();

    // Inicializar la tabla, paginación y buscador
    mostrarTrabajadores(paginaActual).then(() => {
        configurarBusqueda();
    });

    // Iniciar el sistema de actualización en tiempo real
    iniciarVerificadorActualizaciones();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', detenerVerificadorActualizaciones);
});