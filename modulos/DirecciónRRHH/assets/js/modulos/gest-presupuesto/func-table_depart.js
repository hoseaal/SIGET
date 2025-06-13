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
    let totalDepartamentos = 0;
    let totalPaginas = 1;
    const cuerpoTabla = document.querySelector('#departmentTable tbody');
    const elementoPaginacion = document.getElementById('paginationDepartment');

    // Variable para almacenar todos los departamentos
    let todosDepartamentos = [];
    let buscando = false;
    let terminoBusquedaActual = '';

    // Función para cargar TODOS los departamentos desde la API (para búsqueda)
    async function obtenerTodosDepartamentos() {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_departamentos.php?all=true`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                todosDepartamentos = datos.departments;
                return datos.departments;
            } else {
                console.error('Error al cargar todos los departamentos:', datos.message);
                smallSwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los departamentos',
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

    // Función para cargar los departamentos paginados desde la API
    async function obtenerDepartamentos(pagina) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_departamentos.php?page=${pagina}&per_page=${filasPorPagina}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                totalDepartamentos = datos.total;
                totalPaginas = datos.total_pages;
                return {
                    departamentos: datos.departments,
                    total: datos.total,
                    total_pages: datos.total_pages
                };
            } else {
                console.error('Error al cargar departamentos:', datos.message);
                return {
                    departamentos: [],
                    total: 0,
                    total_pages: 0
                };
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return {
                departamentos: [],
                total: 0,
                total_pages: 0
            };
        }
    }

    // Función para filtrar localmente
    function filtrarDepartamentosLocalmente(departamentos, terminoBusqueda) {
        if (!terminoBusqueda) return departamentos;
        
        const terminoBusquedaMinusculas = terminoBusqueda.toLowerCase();
        return departamentos.filter(departamento => {
            return (
                (departamento.dep_ide && departamento.dep_ide.toString().includes(terminoBusqueda)) ||
                (departamento.dep_nom && departamento.dep_nom.toLowerCase().includes(terminoBusquedaMinusculas)) ||
                (departamento.dep_des && departamento.dep_des.toLowerCase().includes(terminoBusquedaMinusculas))
            );
        });
    }

    // Función para mostrar los departamentos en la página actual
    async function mostrarDepartamentos(pagina, departamentosAMostrar = null) {
        const estaFiltrado = departamentosAMostrar !== null;
        
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
        
        let departamentos = [];
        if (estaFiltrado) {
            departamentos = departamentosAMostrar;
            totalDepartamentos = departamentos.length;
            totalPaginas = Math.ceil(departamentos.length / filasPorPagina);
        } else {
            const resultado = await obtenerDepartamentos(pagina);
            departamentos = resultado.departamentos;
            totalDepartamentos = resultado.total;
            totalPaginas = resultado.total_pages;
        }
        
        // Pequeño retraso para evitar parpadeo con cargas rápidas
        await new Promise(resolver => setTimeout(resolver, 200));
        
        cuerpoTabla.innerHTML = '';
        
        if (departamentos.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < filasPorPagina; i++) {
                const fila = document.createElement('tr');
                if (i === 0) {
                    fila.innerHTML = `
                        <td colspan="4" class="text-center empty-row">
                            ${estaFiltrado ? 'No se encontraron coincidencias' : 'No se encontraron registros'}
                        </td>
                    `;
                } else {
                    fila.innerHTML = '<td colspan="4" class="empty-row">&nbsp;</td>';
                }
                cuerpoTabla.appendChild(fila);
            }
            
            // Actualizar paginación para reflejar que no hay datos
            configurarPaginacion();
            return;
        }

        // Llenar con datos reales
        departamentos.forEach(departamento => {
            const fila = document.createElement('tr');
            
            // Columnas básicas
            if (LOGGED_USER_TYPE === '1' || LOGGED_USER_TYPE === '2') {
                fila.innerHTML = `
                    <td>${departamento.dep_ide}</td>
                    <td>${departamento.dep_nom}</td>
                    <td>${departamento.dep_des || 'Sin descripción'}</td>
                `;
            } 
            // Con acciones de edición
            else if (LOGGED_USER_TYPE === '3') {
                fila.innerHTML = `
                    <td>${departamento.dep_ide}</td>
                    <td>${departamento.dep_nom}</td>
                    <td>${departamento.dep_des || 'Sin descripción'}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-department-btn" href="javascript:void(0);" data-dep_ide="${departamento.dep_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            } 
            // Con todas las acciones (editar y eliminar)
            else {
                fila.innerHTML = `
                    <td>${departamento.dep_ide}</td>
                    <td>${departamento.dep_nom}</td>
                    <td>${departamento.dep_des || 'Sin descripción'}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-department-btn" href="javascript:void(0);" data-dep_ide="${departamento.dep_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                                <a class="dropdown-item delete-department-btn" href="javascript:void(0);" data-dep_ide="${departamento.dep_ide}" data-dep_nom="${departamento.dep_nom}">
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
        if (departamentos.length < filasPorPagina) {
            const filasRestantes = filasPorPagina - departamentos.length;
            for (let i = 0; i < filasRestantes; i++) {
                const fila = document.createElement('tr');
                fila.innerHTML = '<td colspan="4" class="empty-row">&nbsp;</td>';
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
        const entradaBusqueda = document.getElementById('departmentSearch');
        let temporizadorBusqueda;
        
        // Cargar todos los registros al iniciar para búsquedas
        obtenerTodosDepartamentos();
        
        entradaBusqueda.addEventListener('input', function() {
            clearTimeout(temporizadorBusqueda);
            
            const terminoBusqueda = this.value.trim();
            terminoBusquedaActual = terminoBusqueda;
            
            if (terminoBusqueda.length === 0) {
                // Si el buscador está vacío, volver a la paginación normal
                buscando = false;
                paginaActual = 1;
                mostrarDepartamentos(paginaActual);
                elementoPaginacion.style.display = '';
                return;
            }
            
            // Pequeño retraso para no hacer búsquedas con cada tecla
            temporizadorBusqueda = setTimeout(async () => {
                buscando = true;
                
                // Mostrar loader
                cuerpoTabla.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Buscando...</span>
                            </div>
                        </td>
                    </tr>
                `;
                
                // Si no tenemos todos los registros cargados, intentar cargarlos
                if (todosDepartamentos.length === 0) {
                    todosDepartamentos = await obtenerTodosDepartamentos();
                }
                
                // Filtrar localmente con todos los datos
                const filtrados = filtrarDepartamentosLocalmente(todosDepartamentos, terminoBusqueda);
                mostrarDepartamentos(1, filtrados);
                elementoPaginacion.style.display = filtrados.length > filasPorPagina ? '' : 'none';
            }, 300);
        });
        
        // Restaurar paginación si se borra la búsqueda
        entradaBusqueda.addEventListener('keyup', function(e) {
            if (e.key === 'Escape' || this.value.trim() === '') {
                this.value = '';
                buscando = false;
                paginaActual = 1;
                mostrarDepartamentos(paginaActual);
                elementoPaginacion.style.display = '';
            }
        });
    }

    // Función para configurar los event listeners
    function configurarEventos() {
        // Eventos para editar
        if (LOGGED_USER_TYPE === '3' || LOGGED_USER_TYPE === '4' || LOGGED_USER_TYPE === '5') {
            document.querySelectorAll('.edit-department-btn').forEach(boton => {
                boton.addEventListener('click', async function() {
                    const dep_ide = this.getAttribute('data-dep_ide');
                    try {
                        const respuesta = await fetch(`../PHP/api/gest-presupuesto/detalles_departamento.php?dep_ide=${dep_ide}`);
                        const datos = await respuesta.json();
                        
                        if (datos.success) {
                            abrirModalEdicion(datos.department);
                        } else {
                            smallSwal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudieron cargar los datos del departamento',
                                confirmButtonColor: '#3085d6',
                                confirmButtonText: 'Entendido'
                            });
                        }
                    } catch (error) {
                        console.error('Error al cargar detalles:', error);
                        smallSwal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error al cargar los detalles del departamento',
                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'Entendido'
                        });
                    }
                });
            });
        }

        // Eventos para eliminar
        if (LOGGED_USER_TYPE === '4' || LOGGED_USER_TYPE === '5') {
            document.querySelectorAll('.delete-department-btn').forEach(boton => {
                boton.addEventListener('click', function() {
                    const dep_ide = this.getAttribute('data-dep_ide');
                    const dep_nom = this.getAttribute('data-dep_nom');
                    mostrarConfirmacionEliminacion(dep_ide, dep_nom);
                });
            });
        }
    }

    // Función para mostrar confirmación de eliminación
    function mostrarConfirmacionEliminacion(dep_ide, dep_nom) {
        smallSwal.fire({
            title: '¿Eliminar departamento?',
            html: `¿Seguro de eliminar el departamento <strong>${dep_nom}</strong>?<br><br><span class="text-danger">¡Esta acción no se puede deshacer!</span>`,
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
                    title: 'Eliminando registro',
                    html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" style="width: 100%; height: 100%;"></div></div>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        smallSwal.showLoading();
                    }
                });
                
                await eliminarDepartamento(dep_ide);
            }
        });
    }

    // Función para eliminar un departamento
    async function eliminarDepartamento(dep_ide) {
        try {
            const respuesta = await fetch('../PHP/api/gest-presupuesto/eliminar_departamento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dep_ide: dep_ide })
            });
            
            const resultado = await respuesta.json();
            
            if (!respuesta.ok) {
                throw new Error(resultado.message || `Error HTTP: ${respuesta.status}`);
            }
            
            if (resultado.success) {
                // Cerrar cualquier alerta abierta
                smallSwal.close();
                
                // Verificar si debemos cambiar de página
                if (paginaActual > 1 && (totalDepartamentos - 1) <= ((paginaActual - 1) * filasPorPagina)) {
                    paginaActual--;
                }
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: resultado.message || 'Departamento eliminado correctamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar la tabla
                    if (buscando) {
                        todosDepartamentos = await obtenerTodosDepartamentos();
                        const filtrados = filtrarDepartamentosLocalmente(todosDepartamentos, terminoBusquedaActual);
                        mostrarDepartamentos(1, filtrados);
                    } else {
                        await mostrarDepartamentos(paginaActual);
                    }
                });
            } else {
                throw new Error(resultado.message || 'Error al eliminar el departamento');
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
                if (buscando) {
                    const filtrados = filtrarDepartamentosLocalmente(todosDepartamentos, terminoBusquedaActual);
                    mostrarDepartamentos(1, filtrados);
                } else {
                    mostrarDepartamentos(paginaActual);
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
                    const filtrados = filtrarDepartamentosLocalmente(todosDepartamentos, terminoBusquedaActual);
                    mostrarDepartamentos(paginaActual, filtrados);
                } else {
                    mostrarDepartamentos(paginaActual);
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
                        const filtrados = filtrarDepartamentosLocalmente(todosDepartamentos, terminoBusquedaActual);
                        mostrarDepartamentos(paginaActual, filtrados);
                    } else {
                        mostrarDepartamentos(paginaActual);
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
                    const filtrados = filtrarDepartamentosLocalmente(todosDepartamentos, terminoBusquedaActual);
                    mostrarDepartamentos(paginaActual, filtrados);
                } else {
                    mostrarDepartamentos(paginaActual);
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
                    const filtrados = filtrarDepartamentosLocalmente(todosDepartamentos, terminoBusquedaActual);
                    mostrarDepartamentos(paginaActual, filtrados);
                } else {
                    mostrarDepartamentos(paginaActual);
                }
            }
        });
        elementoPaginacion.appendChild(li);
    }

    // Función para abrir el modal de edición con datos
    async function abrirModalEdicion(datosDepartamento) {
        // Limpiar validaciones previas
        limpiarValidacionesModal();

        // Configurar el título del modal
        const modalTitle = document.getElementById('modalDepartmentTitle');
        if (datosDepartamento.dep_ide) {
            modalTitle.textContent = 'Editar Departamento';
            document.getElementById('departmentId').value = datosDepartamento.dep_ide;
        } else {
            modalTitle.textContent = 'Crear Nuevo Departamento';
            document.getElementById('departmentId').value = '';
        }

        // Llenar los campos con los datos del departamento
        document.getElementById('departmentName').value = datosDepartamento.dep_nom || '';
        document.getElementById('departmentDescription').value = datosDepartamento.dep_des || '';
        
        // Agregar event listeners para validación en tiempo real
        document.getElementById('departmentName').addEventListener('input', function() {
            validarInputNombre(this);
        });

        document.getElementById('departmentDescription').addEventListener('input', function() {
            validarInputDescripcion(this);
        });

        // Configurar el botón de guardar
        const botonGuardar = document.getElementById('confirmDepartmentBtn');
        botonGuardar.onclick = async function() {
            if (validarFormulario()) {
                await guardarDepartamento();
            } else {
                // Mostrar todos los mensajes de error
                validarInputNombre(document.getElementById('departmentName'));
                validarInputDescripcion(document.getElementById('departmentDescription'));
            }
        };

        // Mostrar el modal
        const modalEdicion = new bootstrap.Modal(document.getElementById('ModalDepartamento'));
        modalEdicion.show();
    }

    // Función para guardar un departamento (crear o actualizar)
    async function guardarDepartamento() {
        const botonGuardar = document.querySelector('#ModalDepartamento .btn-primary');
        const textoOriginal = botonGuardar.innerHTML;
        
        // Mostrar spinner y deshabilitar botón
        botonGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        botonGuardar.disabled = true;
        
        try {
            // Obtener los datos del formulario
            const datosActualizados = {
                dep_ide: document.getElementById('departmentId').value || null,
                dep_nom: document.getElementById('departmentName').value,
                dep_des: document.getElementById('departmentDescription').value
            };

            // Validación básica
            if (!datosActualizados.dep_nom) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Datos incompletos',
                    text: 'Por favor complete el nombre del departamento',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return;
            }
            
            // Determinar la URL y método según si es creación o actualización
            const url = datosActualizados.dep_ide 
                ? '../PHP/api/gest-presupuesto/actualizar_departamento.php'
                : '../PHP/api/gest-presupuesto/crear_departamento.php';
            
            // Llamada a la API para guardar cambios
            const respuesta = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosActualizados)
            });
            
            const resultado = await respuesta.json();
            
            if (resultado.success) {
                // Cerrar el modal
                bootstrap.Modal.getInstance(document.getElementById('ModalDepartamento')).hide();
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: datosActualizados.dep_ide ? 'Cambios guardados exitosamente' : 'Departamento creado exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar los datos
                    if (buscando) {
                        todosDepartamentos = await obtenerTodosDepartamentos();
                        const filtrados = filtrarDepartamentosLocalmente(todosDepartamentos, terminoBusquedaActual);
                        mostrarDepartamentos(1, filtrados);
                    } else {
                        await mostrarDepartamentos(paginaActual);
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

    // Función para validar el input de Nombre
    function validarInputNombre(input) {
        // Limitar a 255 caracteres
        if (input.value.length > 255) {
            input.value = input.value.substring(0, 255);
        }
        
        // Validar el campo
        if (input.value.trim() === '') {
            input.classList.add('is-invalid');
            return false;
        } else {
            input.classList.remove('is-invalid');
            return true;
        }
    }

    // Función para validar el input de Descripción
    function validarInputDescripcion(textarea) {
        // Limitar a 1000 caracteres
        if (textarea.value.length > 1000) {
            textarea.value = textarea.value.substring(0, 1000);
        }
        
        // Validar el campo (la descripción es opcional)
        textarea.classList.remove('is-invalid');
        return true;
    }

    // Función para validar todo el formulario antes de guardar
    function validarFormulario() {
        const nombreValido = validarInputNombre(document.getElementById('departmentName'));
        const descripcionValida = validarInputDescripcion(document.getElementById('departmentDescription'));
        
        return nombreValido && descripcionValida;
    }

    // Función para limpiar todas las validaciones del modal
    function limpiarValidacionesModal() {
        const inputs = document.querySelectorAll('#ModalDepartamento .form-control, #ModalDepartamento .form-select');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
        });
    }

    // Función para agregar un nuevo departamento
    function agregarNuevoDepartamento() {
        abrirModalEdicion({
            dep_ide: null,
            dep_nom: '',
            dep_des: ''
        });
    }

    // Inicializar la tabla, paginación y buscador
    mostrarDepartamentos(paginaActual).then(() => {
        configurarBusqueda();
    });

    document.getElementById('addNewDepartment')?.addEventListener('click', agregarNuevoDepartamento);
});