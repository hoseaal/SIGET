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
    let totalSalarios = 0;
    let totalPaginas = 1;
    const cuerpoTabla = document.querySelector('#salaryTable tbody');
    const elementoPaginacion = document.getElementById('paginationSalary');

    // Variable para almacenar todos los niveles salariales
    let todosSalarios = [];
    let buscando = false;
    let terminoBusquedaActual = '';

    // Variables para el control de actualización en tiempo real
    let ultimoTimestampActualizacionSalario = null;
    let intervaloActualizacionSalario = 1000; // 1 segundo
    let temporizadorActualizacionSalario = null;
    let actualizandoSalario = false;

    // Función para cargar TODOS los niveles salariales desde la API (para búsqueda)
    async function obtenerTodosSalarios() {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_salarios.php?all=true`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                todosSalarios = datos.salaries;
                return datos.salaries;
            } else {
                console.error('Error al cargar todos los niveles salariales:', datos.message);
                smallSwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los niveles salariales',
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

    // Función para cargar los niveles salariales paginados desde la API
    async function obtenerSalarios(pagina) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_salarios.php?page=${pagina}&per_page=${filasPorPagina}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                totalSalarios = datos.total;
                totalPaginas = datos.total_pages;
                return {
                    salarios: datos.salaries,
                    total: datos.total,
                    total_pages: datos.total_pages
                };
            } else {
                console.error('Error al cargar niveles salariales:', datos.message);
                return {
                    salarios: [],
                    total: 0,
                    total_pages: 0
                };
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return {
                salarios: [],
                total: 0,
                total_pages: 0
            };
        }
    }

    // Función para filtrar localmente
    function filtrarSalariosLocalmente(salarios, terminoBusqueda) {
        if (!terminoBusqueda) return salarios;
        
        const terminoBusquedaMinusculas = terminoBusqueda.toLowerCase();
        return salarios.filter(salario => {
            return (
                (salario.nvl_ran && salario.nvl_ran.toLowerCase().includes(terminoBusquedaMinusculas)) ||
                (salario.nvl_sal && salario.nvl_sal.toString().includes(terminoBusqueda)) ||
                (salario.ona_car && salario.ona_car.toLowerCase().includes(terminoBusquedaMinusculas))
            );
        });
    }

    // Función para mostrar los niveles salariales en la página actual
    async function mostrarSalarios(pagina, salariosAMostrar = null) {
        const estaFiltrado = salariosAMostrar !== null;
        
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
        
        let salarios = [];
        if (estaFiltrado) {
            salarios = salariosAMostrar;
            totalSalarios = salarios.length;
            totalPaginas = Math.ceil(salarios.length / filasPorPagina);
        } else {
            const resultado = await obtenerSalarios(pagina);
            salarios = resultado.salarios;
            totalSalarios = resultado.total;
            totalPaginas = resultado.total_pages;
        }
        
        // Pequeño retraso para evitar parpadeo con cargas rápidas
        await new Promise(resolver => setTimeout(resolver, 200));
        
        cuerpoTabla.innerHTML = '';
        
        if (salarios.length === 0) {
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
        salarios.forEach(salario => {
            const fila = document.createElement('tr');
            
            // solo 3 columnas (sin acciones)
            if (LOGGED_USER_TYPE === '1' || LOGGED_USER_TYPE === '2') {
                fila.innerHTML = `
                    <td>${salario.nvl_ran}</td>
                    <td>${salario.nvl_sal.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${salario.ona_car || 'Sin cargo asignado'}</td>
                `;
            } 
            // columnas (solo editar)
            else if (LOGGED_USER_TYPE === '3') {
                fila.innerHTML = `
                    <td>${salario.nvl_ran}</td>
                    <td>${salario.nvl_sal.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${salario.ona_car || 'Sin cargo asignado'}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-salary-btn" href="javascript:void(0);" data-nvl_ide="${salario.nvl_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            } 
            // Tipos "4" y "5"
            else {
                fila.innerHTML = `
                    <td>${salario.nvl_ran}</td>
                    <td>${salario.nvl_sal.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${salario.ona_car || 'Sin cargo asignado'}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-salary-btn" href="javascript:void(0);" data-nvl_ide="${salario.nvl_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            }
            
            cuerpoTabla.appendChild(fila);
        });

        // Completar con filas vacías si no llega a filasPorPagina
        if (salarios.length < filasPorPagina) {
            const filasRestantes = filasPorPagina - salarios.length;
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
        const entradaBusqueda = document.getElementById('salarySearch');
        let temporizadorBusqueda;
        
        // Cargar todos los registros al iniciar para búsquedas
        obtenerTodosSalarios();
        
        entradaBusqueda.addEventListener('input', function() {
            clearTimeout(temporizadorBusqueda);
            
            const terminoBusqueda = this.value.trim();
            terminoBusquedaActual = terminoBusqueda;
            
            if (terminoBusqueda.length === 0) {
                // Si el buscador está vacío, volver a la paginación normal
                buscando = false;
                paginaActual = 1;
                mostrarSalarios(paginaActual);
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
                if (todosSalarios.length === 0) {
                    todosSalarios = await obtenerTodosSalarios();
                }
                
                // Filtrar localmente con todos los datos
                const filtrados = filtrarSalariosLocalmente(todosSalarios, terminoBusqueda);
                mostrarSalarios(1, filtrados);
                elementoPaginacion.style.display = filtrados.length > filasPorPagina ? '' : 'none';
            }, 300);
        });
        
        // Restaurar paginación si se borra la búsqueda
        entradaBusqueda.addEventListener('keyup', function(e) {
            if (e.key === 'Escape' || this.value.trim() === '') {
                this.value = '';
                buscando = false;
                paginaActual = 1;
                mostrarSalarios(paginaActual);
                elementoPaginacion.style.display = '';
            }
        });
    }

    // Función para configurar los event listeners
    function configurarEventos() {
        // Configurar solo los botones de edición para todos los tipos de usuario permitidos
        document.querySelectorAll('.edit-salary-btn').forEach(boton => {
            boton.addEventListener('click', async function() {
                const nvl_ide = this.getAttribute('data-nvl_ide');
                try {
                    const respuesta = await fetch(`../PHP/api/gest-presupuesto/detalles_salarios.php?nvl_ide=${nvl_ide}`);
                    const datos = await respuesta.json();
                    
                    if (datos.success) {
                        abrirModalEdicion(datos.salary);
                    } else {
                        alert('No se pudieron cargar los datos del nivel salarial');
                    }
                } catch (error) {
                    console.error('Error al cargar detalles:', error);
                    alert('Error al cargar los detalles del nivel salarial');
                }
            });
        });
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
                    // Si estamos buscando, mostrar los primeros resultados filtrados
                    const filtrados = filtrarSalariosLocalmente(todosSalarios, terminoBusquedaActual);
                    mostrarSalarios(1, filtrados);
                } else {
                    mostrarSalarios(paginaActual);
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
                    const filtrados = filtrarSalariosLocalmente(todosSalarios, terminoBusquedaActual);
                    mostrarSalarios(paginaActual, filtrados);
                } else {
                    mostrarSalarios(paginaActual);
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
                        const filtrados = filtrarSalariosLocalmente(todosSalarios, terminoBusquedaActual);
                        mostrarSalarios(paginaActual, filtrados);
                    } else {
                        mostrarSalarios(paginaActual);
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
                    const filtrados = filtrarSalariosLocalmente(todosSalarios, terminoBusquedaActual);
                    mostrarSalarios(paginaActual, filtrados);
                } else {
                    mostrarSalarios(paginaActual);
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
                    const filtrados = filtrarSalariosLocalmente(todosSalarios, terminoBusquedaActual);
                    mostrarSalarios(paginaActual, filtrados);
                } else {
                    mostrarSalarios(paginaActual);
                }
            }
        });
        elementoPaginacion.appendChild(li);
    }

    // Función para abrir el modal de edición con datos
    async function abrirModalEdicion(datosSalario) {
        // Limpiar validaciones previas
        limpiarValidacionesModal();

        // Cargar los cargos ONAPRE primero
        const cargosOnapre = await obtenerCargosOnapre();
        if (!cargosOnapre) {
            alert('No se pudieron cargar los cargos ONAPRE');
            return;
        }

        // Llenar el select de cargos ONAPRE
        const selectOnapre = document.getElementById('OnapreAsig');
        selectOnapre.innerHTML = '<option value="">Seleccione</option>';
        
        cargosOnapre.forEach(cargo => {
            const opcion = document.createElement('option');
            opcion.value = cargo.ona_ide;
            opcion.textContent = cargo.ona_car;
            selectOnapre.appendChild(opcion);
        });

        // Llenar los campos con los datos del nivel salarial
        document.getElementById('tipoNlvSalarial').value = datosSalario.nvl_ran || '';
        document.getElementById('salarioAsig').value = datosSalario.nvl_sal || '';
        
        // Seleccionar el cargo ONAPRE correspondiente
        if (datosSalario.ona_ide) {
            selectOnapre.value = datosSalario.ona_ide;
        }

        // event listeners para validación en tiempo real
        document.getElementById('tipoNlvSalarial').addEventListener('input', function() {
            validarInputTipoNivel(this);
        });

        document.getElementById('salarioAsig').addEventListener('input', function() {
            validarInputSalario(this);
        });

        document.getElementById('OnapreAsig').addEventListener('change', function() {
            validarSelectOnapre(this);
        });

        // Configurar el botón de guardar
        const botonGuardar = document.getElementById('confirmChangesBtn');
        botonGuardar.onclick = async function() {
            if (validarFormulario()) {
                await actualizarSalario(datosSalario.nvl_ide);
            } else {
                // Mostrar todos los mensajes de error
                validarInputTipoNivel(document.getElementById('tipoNlvSalarial'));
                validarInputSalario(document.getElementById('salarioAsig'));
                validarSelectOnapre(document.getElementById('OnapreAsig'));
            }
        };

        // Mostrar el modal
        const modalEdicion = new bootstrap.Modal(document.getElementById('ModalNivelSalarial'));
        modalEdicion.show();
    }

    // Función para obtener los cargos ONAPRE
    async function obtenerCargosOnapre() {
        try {
            const respuesta = await fetch('../PHP/api/gest-presupuesto/carga-modal_salarios.php');
            const datos = await respuesta.json();
            
            if (datos.success) {
                return datos.cargos;
            } else {
                console.error('Error al cargar cargos ONAPRE:', datos.message);
                return null;
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return null;
        }
    }

    // Función para actualizar un nivel salarial
    async function actualizarSalario(nvl_ide) {
        const botonGuardar = document.querySelector('#ModalNivelSalarial .btn-primary');
        const textoOriginal = botonGuardar.innerHTML;
        
        // Mostrar spinner y deshabilitar botón
        botonGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        botonGuardar.disabled = true;
        
        try {
            // Obtener los datos del formulario
            const datosActualizados = {
                nvl_ide: nvl_ide,
                nvl_ran: document.getElementById('tipoNlvSalarial').value,
                nvl_sal: document.getElementById('salarioAsig').value,
                ona_ide: document.getElementById('OnapreAsig').value || null
            };

            // Validación básica
            if (!datosActualizados.nvl_ran || !datosActualizados.nvl_sal) {
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
            const respuesta = await fetch('../PHP/api/gest-presupuesto/actualizar_salarios.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosActualizados)
            });
            
            const resultado = await respuesta.json();
            
            if (resultado.success) {
                // Cerrar el modal
                bootstrap.Modal.getInstance(document.getElementById('ModalNivelSalarial')).hide();
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'Cambios guardados exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar los datos
                    if (buscando) {
                        todosSalarios = await obtenerTodosSalarios();
                        const filtrados = filtrarSalariosLocalmente(todosSalarios, terminoBusquedaActual);
                        mostrarSalarios(1, filtrados);
                    } else {
                        await mostrarSalarios(paginaActual);
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

    // Función para validar el input de Tipo de Nivel Salarial
    function validarInputTipoNivel(input) {
        // Eliminar cualquier carácter no permitido (solo letras)
        const valorSanitizado = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
        
        // Limitar a 5 caracteres
        if (valorSanitizado.length > 5) {
            input.value = valorSanitizado.substring(0, 5);
        } else {
            input.value = valorSanitizado;
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

    // Función para validar el input de Salario
    function validarInputSalario(input) {
        // Obtener el valor actual
        let valor = input.value;
        
        // Eliminar cualquier carácter que no sea número o punto
        let valorSanitizado = valor.replace(/[^0-9.]/g, '');
        
        // Manejar múltiples puntos decimales
        const partes = valorSanitizado.split('.');
        if (partes.length > 2) {
            // Si hay más de un punto, mantener solo el primero
            valorSanitizado = partes[0] + '.' + partes.slice(1).join('');
        }
        
        // Limitar decimales a 2
        if (partes.length === 2) {
            partes[1] = partes[1].substring(0, 2);
            valorSanitizado = partes[0] + '.' + partes[1];
        }
        
        // Limitar a 10 caracteres en total
        if (valorSanitizado.length > 10) {
            valorSanitizado = valorSanitizado.substring(0, 10);
        }
        
        // Actualizar el valor del input
        input.value = valorSanitizado;
        
        // Validar el campo
        if (input.value.trim() === '' || isNaN(Number(input.value))) {
            input.classList.add('is-invalid');
            return false;
        } else {
            input.classList.remove('is-invalid');
            return true;
        }
    }

    // Función para validar el select de ONAPRE
    function validarSelectOnapre(select) {
        if (select.value === "") {
            select.classList.add('is-invalid');
            return false;
        } else {
            select.classList.remove('is-invalid');
            return true;
        }
    }

    // Función para validar todo el formulario antes de guardar
    function validarFormulario() {
        const tipoNivelValido = validarInputTipoNivel(document.getElementById('tipoNlvSalarial'));
        const salarioValido = validarInputSalario(document.getElementById('salarioAsig'));
        const onapreValido = validarSelectOnapre(document.getElementById('OnapreAsig'));
        
        return tipoNivelValido && salarioValido && onapreValido;
    }

    // Función para limpiar todas las validaciones del modal
    function limpiarValidacionesModal() {
        const inputs = document.querySelectorAll('#ModalNivelSalarial .form-control, #ModalNivelSalarial .form-select');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
        });
    }

    // Función para verificar cambios en bit_nvl
    async function verificarActualizacionesSalarios() {
        if (actualizandoSalario) return;
        actualizandoSalario = true;
        
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/check_salary_updates.php?last_update=${ultimoTimestampActualizacionSalario || ''}`);
            const datos = await respuesta.json();
            
            if (datos.success && datos.has_changes) {
                ultimoTimestampActualizacionSalario = datos.last_update;
                
                // Actualizar la tabla con animación suave
                await actualizarTablaSalariosSuavemente();
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones de salarios:', error);
        } finally {
            actualizandoSalario = false;
        }
    }

    // Función para actualizar la tabla de salarios con animación suave
    async function actualizarTablaSalariosSuavemente() {
        const tabla = document.getElementById('salaryTable');
        const indicadorActualizacion = document.createElement('div');
        
        // Aplicar estilos de transición
        tabla.classList.add('table-updating');
        
        // Mostrar indicador de actualización
        tabla.parentNode.insertBefore(indicadorActualizacion, tabla);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolver => setTimeout(resolver, 300));
        
        // Recargar datos
        if (buscando) {
            todosSalarios = await obtenerTodosSalarios();
            const filtrados = filtrarSalariosLocalmente(todosSalarios, terminoBusquedaActual);
            await mostrarSalarios(paginaActual, filtrados);
        } else {
            await mostrarSalarios(paginaActual);
        }
        
        // Ocultar indicador y quitar clase de transición
        indicadorActualizacion.remove();
        tabla.classList.remove('table-updating');
        
        // Mostrar notificación de actualización
        mostrarNotificacionActualizacionSalarios();
    }

    // Función para mostrar notificación de actualización
    function mostrarNotificacionActualizacionSalarios() {
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
            title: 'Niveles salariales actualizados',
            background: '#f8f9fa',
            color: '#333'
        });
    }

    // Iniciar el sistema de actualización periódica para salarios
    function iniciarVerificadorActualizacionesSalarios() {
        // Verificar actualizaciones inmediatamente
        verificarActualizacionesSalarios();
        
        // Configurar intervalo periódico
        temporizadorActualizacionSalario = setInterval(verificarActualizacionesSalarios, intervaloActualizacionSalario);
        
        // También verificar cuando la ventana gana foco
        window.addEventListener('focus', verificarActualizacionesSalarios);
    }

    // Detener el sistema de actualización
    function detenerVerificadorActualizacionesSalarios() {
        if (temporizadorActualizacionSalario) {
            clearInterval(temporizadorActualizacionSalario);
        }
        window.removeEventListener('focus', verificarActualizacionesSalarios);
    }

    // Inicializar la tabla, paginación y buscador
    mostrarSalarios(paginaActual).then(() => {
        configurarBusqueda();
    });

    // Iniciar el sistema de actualización en tiempo real
    iniciarVerificadorActualizacionesSalarios();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', detenerVerificadorActualizacionesSalarios);
});