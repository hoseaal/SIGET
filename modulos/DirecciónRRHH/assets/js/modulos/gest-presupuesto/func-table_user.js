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
    let totalUsuarios = 0;
    let totalPaginas = 1;
    const cuerpoTabla = document.querySelector('#usersTable tbody');
    const elementoPaginacion = document.getElementById('paginationUsers');

    // Variables para el control de actualización en tiempo real
    let ultimoTimestampActualizacionUsuario = null;
    let intervaloActualizacionUsuario = 1000; // 1 segundo
    let temporizadorActualizacionUsuario = null;
    let actualizandoUsuario = false;

    // Variables para búsqueda global
    let todosUsuarios = [];
    let buscando = false;
    let terminoBusquedaActual = '';

    // Función para cargar TODOS los usuarios desde la API (para búsqueda)
    async function obtenerTodosUsuarios() {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_users.php?all=true`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                todosUsuarios = datos.users;
                return datos.users;
            } else {
                console.error('Error al cargar todos los usuarios:', datos.message);
                return [];
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return [];
        }
    }

    // Función para cargar los usuarios paginados desde la API
    async function obtenerUsuarios(pagina, terminoBusqueda = '') {
        try {
            let url = `../PHP/api/gest-presupuesto/imprimir_users.php?page=${pagina}&per_page=${filasPorPagina}`;
            if (terminoBusqueda) {
                url += `&search=${encodeURIComponent(terminoBusqueda)}`;
            }
            
            const respuesta = await fetch(url);
            const datos = await respuesta.json();
            
            if (datos.success) {
                totalUsuarios = datos.total;
                totalPaginas = datos.total_pages;
                return {
                    usuarios: datos.users,
                    total: datos.total,
                    total_pages: datos.total_pages
                };
            } else {
                console.error('Error al cargar usuarios:', datos.message);
                return {
                    usuarios: [],
                    total: 0,
                    total_pages: 0
                };
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return {
                usuarios: [],
                total: 0,
                total_pages: 0
            };
        }
    }

    // Función para filtrar usuarios localmente
    function filtrarUsuariosLocalmente(usuarios, terminoBusqueda) {
        if (!terminoBusqueda) return usuarios;
        
        const terminoBusquedaMinusculas = terminoBusqueda.toLowerCase();
        return usuarios.filter(usuario => {
            return (
                (usuario.nom_ced && usuario.nom_ced.toLowerCase().includes(terminoBusquedaMinusculas)) ||
                (usuario.usu_nom && usuario.usu_nom.toLowerCase().includes(terminoBusquedaMinusculas)) ||
                (usuario.usu_ape && usuario.usu_ape.toLowerCase().includes(terminoBusquedaMinusculas)) ||
                (obtenerTextoTipoUsuario(usuario.usu_tip) && obtenerTextoTipoUsuario(usuario.usu_tip).toLowerCase().includes(terminoBusquedaMinusculas))
            );
        });
    }

    // Función para obtener los datos completos de un usuario
    async function obtenerDetallesUsuario(idUsuario) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/carga-modal_users.php?user_id=${idUsuario}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                return datos.user;
            } else {
                console.error('Error al cargar detalles:', datos.message);
                return null;
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return null;
        }
    }

    // Función para convertir el tipo de usuario a texto
    function obtenerTextoTipoUsuario(tipo) {
        const tipos = {
            5: 'Administrador',
            4: 'Jefe de Área',
            3: 'Trabajador',
            2: 'Temporal',
            1: 'Visualizador'
        };
        return tipos[tipo] || 'Desconocido';
    }

    // Función para mostrar los usuarios en la página actual
    async function mostrarUsuarios(pagina, usuariosAMostrar = null) {
        const estaFiltrado = usuariosAMostrar !== null;
        const resultado = estaFiltrado ? { usuarios: usuariosAMostrar } : await obtenerUsuarios(pagina);
        const usuarios = resultado.usuarios;
        totalUsuarios = estaFiltrado ? usuarios.length : resultado.total;
        totalPaginas = estaFiltrado ? Math.ceil(usuarios.length / filasPorPagina) : resultado.total_pages;
        
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
        
        // Pequeño retraso para evitar parpadeo con cargas rápidas
        await new Promise(resolver => setTimeout(resolver, 200));
        
        cuerpoTabla.innerHTML = '';
        
        if (usuarios.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < filasPorPagina; i++) {
                const fila = document.createElement('tr');
                if (i === 0) {
                    fila.innerHTML = `
                        <td colspan="6" class="text-center empty-row">
                            ${estaFiltrado ? 'No se encontraron coincidencias' : 'No se encontraron usuarios'}
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
        usuarios.forEach((usuario, indice) => {
            const numeroFila = (pagina - 1) * filasPorPagina + indice + 1;
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><strong>${numeroFila}</strong></td>
                <td>${usuario.nom_ced}</td>
                <td>${usuario.usu_nom}</td>
                <td>${usuario.usu_ape}</td>
                <td>${obtenerTextoTipoUsuario(usuario.usu_tip)}</td>
                <td>
                    <div class="dropdown">
                        <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                            <i class="bx bx-dots-vertical-rounded"></i>
                        </button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item edit-user-btn" href="javascript:void(0);" data-userid="${usuario.usu_ide}">
                                <i class="bx bx-edit-alt me-1"></i> Editar
                            </a>
                            <a class="dropdown-item delete-user-btn" href="javascript:void(0);" data-userid="${usuario.usu_ide}" data-name="${usuario.usu_nom} ${usuario.usu_ape}">
                                <i class="bx bx-trash me-1"></i> Eliminar
                            </a>
                        </div>
                    </div>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });

        // Completar con filas vacías si no llega a filasPorPagina
        if (usuarios.length < filasPorPagina) {
            const filasRestantes = filasPorPagina - usuarios.length;
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
        const entradaBusqueda = document.getElementById('usersSearch');
        let temporizadorBusqueda;
        
        // Cargar todos los registros al iniciar para búsquedas
        obtenerTodosUsuarios();
        
        entradaBusqueda.addEventListener('input', function() {
            clearTimeout(temporizadorBusqueda);
            
            const terminoBusqueda = this.value.trim();
            terminoBusquedaActual = terminoBusqueda;
            
            if (terminoBusqueda.length === 0) {
                // Si el buscador está vacío, volver a la paginación normal
                buscando = false;
                paginaActual = 1;
                mostrarUsuarios(paginaActual);
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
                if (todosUsuarios.length === 0) {
                    todosUsuarios = await obtenerTodosUsuarios();
                }
                
                // Filtrar localmente con todos los datos
                const filtrados = filtrarUsuariosLocalmente(todosUsuarios, terminoBusqueda);
                mostrarUsuarios(1, filtrados);
                elementoPaginacion.style.display = filtrados.length > filasPorPagina ? '' : 'none';
            }, 300);
        });
        
        // Restaurar paginación si se borra la búsqueda
        entradaBusqueda.addEventListener('keyup', function(e) {
            if (e.key === 'Escape' || this.value.trim() === '') {
                this.value = '';
                buscando = false;
                paginaActual = 1;
                mostrarUsuarios(paginaActual);
                elementoPaginacion.style.display = '';
            }
        });
    }

    // Función para configurar los event listeners
    function configurarEventos() {
        // Agregar event listeners para los botones de editar
        document.querySelectorAll('.edit-user-btn').forEach(boton => {
            boton.addEventListener('click', async function() {
                const idUsuario = this.getAttribute('data-userid');
                const datosUsuario = await obtenerDetallesUsuario(idUsuario);
                if (datosUsuario) {
                    abrirModalEdicion(datosUsuario);
                } else {
                    alert('No se pudieron cargar los datos del usuario');
                }
            });
        });

        // Agregar event listeners para los botones de eliminar
        document.querySelectorAll('.delete-user-btn').forEach(boton => {
            boton.addEventListener('click', function() {
                const idUsuario = this.getAttribute('data-userid');
                const nombreUsuario = this.getAttribute('data-name');
                mostrarConfirmacionEliminacion(idUsuario, nombreUsuario);
            });
        });
    }

    // Función para mostrar confirmación de eliminación
    function mostrarConfirmacionEliminacion(idUsuario, nombreUsuario) {
        // Verificar si el usuario está intentando eliminarse a sí mismo
        if (typeof LOGGED_USER_ID !== 'undefined' && idUsuario === LOGGED_USER_ID) {
            smallSwal.fire({
                icon: 'error',
                title: 'Acción no permitida',
                html: '<div class="text-center mb-3"><i class="bx bx-error-circle text-warning" style="font-size: 3rem;"></i></div>' +
                      '<p class="text-center">No puede eliminarse a sí mismo del sistema.</p>' +
                      '<p class="text-center text-muted">Por razones de seguridad, esta acción está restringida.</p>',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            return;
        }
        
        // Si no es auto-eliminación, mostrar el modal normal de confirmación
        smallSwal.fire({
            title: 'Confirmar Eliminación',
            html: `<p>¿Seguro de eliminar al usuario <strong>${nombreUsuario}</strong>?</p>
                  <p class="text-danger">¡Este cambio no se puede deshacer!</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, Eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (resultado) => {
            if (resultado.isConfirmed) {
                await eliminarUsuario(idUsuario);
            }
        });
    }

    // Función para eliminar un usuario
    async function eliminarUsuario(idUsuario) {
        smallSwal.fire({
            title: 'Eliminando usuario',
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
            const respuesta = await fetch('../PHP/api/gest-presupuesto/eliminar_users.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: idUsuario })
            });
            
            const resultado = await respuesta.json();
            
            if (!respuesta.ok) {
                throw new Error(resultado.message || `Error HTTP: ${respuesta.status}`);
            }
            
            if (resultado.success) {
                // Verificar si debemos cambiar de página
                if (paginaActual > 1 && (totalUsuarios - 1) <= ((paginaActual - 1) * filasPorPagina)) {
                    paginaActual--;
                }
                
                // Recargar la tabla
                if (buscando) {
                    todosUsuarios = await obtenerTodosUsuarios();
                    const filtrados = filtrarUsuariosLocalmente(todosUsuarios, terminoBusquedaActual);
                    mostrarUsuarios(1, filtrados);
                } else {
                    await mostrarUsuarios(paginaActual);
                }
                
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: resultado.message || 'Usuario eliminado correctamente',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                throw new Error(resultado.message || 'Error al eliminar el usuario');
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
                    const filtrados = filtrarUsuariosLocalmente(todosUsuarios, terminoBusquedaActual);
                    mostrarUsuarios(1, filtrados);
                } else {
                    mostrarUsuarios(paginaActual);
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
                    const filtrados = filtrarUsuariosLocalmente(todosUsuarios, terminoBusquedaActual);
                    mostrarUsuarios(paginaActual, filtrados);
                } else {
                    mostrarUsuarios(paginaActual);
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
                        const filtrados = filtrarUsuariosLocalmente(todosUsuarios, terminoBusquedaActual);
                        mostrarUsuarios(paginaActual, filtrados);
                    } else {
                        mostrarUsuarios(paginaActual);
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
                    const filtrados = filtrarUsuariosLocalmente(todosUsuarios, terminoBusquedaActual);
                    mostrarUsuarios(paginaActual, filtrados);
                } else {
                    mostrarUsuarios(paginaActual);
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
                    const filtrados = filtrarUsuariosLocalmente(todosUsuarios, terminoBusquedaActual);
                    mostrarUsuarios(paginaActual, filtrados);
                } else {
                    mostrarUsuarios(paginaActual);
                }
            }
        });
        elementoPaginacion.appendChild(li);
    }

    // Función para abrir el modal de edición con datos del usuario
    async function abrirModalEdicion(datosUsuario) {
        const modalEdicion = new bootstrap.Modal(document.getElementById('largeModal'));

        // Resetear campos de contraseña
        cancelarCambioContrasena();

        // Configurar event listeners para los botones de contraseña
        document.getElementById('togglePassword').addEventListener('click', function() {
            alternarVisibilidadContrasena('password');
        });
        
        document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
            alternarVisibilidadContrasena('confirmPassword');
        });
        
        document.getElementById('enablePasswordChange').addEventListener('click', habilitarCambioContrasena);
        
        // datos personales (solo lectura)
        document.getElementById('cedula').value = datosUsuario.nom_ced || '';
        document.getElementById('usuario').value = datosUsuario.usu_usu || '';
        document.getElementById('nombre').value = datosUsuario.usu_nom || '';
        document.getElementById('apellidos').value = datosUsuario.usu_ape || '';
        
        // Cargar tipos de usuario dinámicamente y seleccionar el actual
        await cargarRolesEnModal(datosUsuario.usu_tip);
        
        // Configurar el botón de guardar
        const botonGuardar = document.querySelector('#largeModal .btn-primary');
        botonGuardar.onclick = function() {
            guardarCambiosUsuario(datosUsuario.usu_ide);
        };
        
        // Mostrar el modal
        modalEdicion.show();
    }

    async function cargarRolesEnModal(usu_tip_actual) {
        const selectorTipoUsuario = document.getElementById('cargocet');
        
        try {
            // Mostrar estado de carga
            selectorTipoUsuario.innerHTML = '<option value="">Cargando roles...</option>';
            
            const respuesta = await fetch('../PHP/api/usuarios/get_roles.php');
            const datos = await respuesta.json();
            
            if (datos.success && datos.roles.length > 0) {
                // Limpiar y llenar el select
                selectorTipoUsuario.innerHTML = '<option value="">-- Seleccione un rol --</option>';
                
                datos.roles.forEach(rol => {
                    const option = document.createElement('option');
                    option.value = rol.usu_tip;
                    option.textContent = rol.tip_nom;
                    
                    // Seleccionar el rol actual del usuario
                    if (rol.usu_tip == usu_tip_actual) {
                        option.selected = true;
                    }
                    
                    selectorTipoUsuario.appendChild(option);
                });
            } else {
                selectorTipoUsuario.innerHTML = '<option value="">Error al cargar roles</option>';
                console.error('Error al cargar roles:', datos.message);
            }
        } catch (error) {
            selectorTipoUsuario.innerHTML = '<option value="">Error de conexión</option>';
            console.error('Error al cargar roles:', error);
            
            // Opcional: Mostrar alerta al usuario
            smallSwal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'No se pudieron cargar los roles. Recargue la página.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
        }
    }

    // Función para guardar los cambios del usuario
    async function guardarCambiosUsuario(idUsuario) {
        const botonGuardar = document.querySelector('#largeModal .btn-primary');
        const textoOriginal = botonGuardar.innerHTML;

        // Validar contraseñas primero
        if (!validarContrasenas()) {
            return;
        }
        
        // Mostrar spinner y deshabilitar botón
        botonGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        botonGuardar.disabled = true;
        
        try {
            // Obtener los datos del formulario
            const datosActualizados = {
                user_id: idUsuario,
                user_type: document.getElementById('cargocet').value
            };

            // Si se está cambiando la contraseña, incluirla en los datos
            const contrasena = document.getElementById('password').value;
            const contenedorConfirmacion = document.getElementById('confirmPasswordContainer');
            
            if (contenedorConfirmacion.style.display !== 'none' && contrasena) {
                datosActualizados.password = contrasena;
            }
            
            // Validación básica
            if (!datosActualizados.user_type) {
                throw new Error('Seleccione un tipo de usuario');
            }
            
            // Llamada a la API para guardar cambios
            const respuesta = await fetch('../PHP/api/gest-presupuesto/actualizar_users.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosActualizados)
            });
            
            const resultado = await respuesta.json();
            
            if (resultado.success) {
                // Cerrar el modal
                bootstrap.Modal.getInstance(document.getElementById('largeModal')).hide();
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Cambios guardados!',
                    text: 'Los cambios se han guardado exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar los datos
                    if (buscando) {
                        todosUsuarios = await obtenerTodosUsuarios();
                        const filtrados = filtrarUsuariosLocalmente(todosUsuarios, terminoBusquedaActual);
                        mostrarUsuarios(1, filtrados);
                    } else {
                        mostrarUsuarios(paginaActual);
                    }
                });
            } else {
                throw new Error(resultado.message || 'Error al guardar los cambios');
            }
        } catch (error) {
            console.error('Error:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
        } finally {
            // Restaurar el botón
            botonGuardar.innerHTML = textoOriginal;
            botonGuardar.disabled = false;
        }
    }

    // Función para alternar la visibilidad de la contraseña
    function alternarVisibilidadContrasena(idCampo) {
        const campo = document.getElementById(idCampo);
        const botonAlternar = document.querySelector(`#toggle${idCampo.charAt(0).toUpperCase() + idCampo.slice(1)}`);
        
        if (campo.type === 'password') {
            campo.type = 'text';
            botonAlternar.innerHTML = '<i class="bx bx-hide"></i>';
        } else {
            campo.type = 'password';
            botonAlternar.innerHTML = '<i class="bx bx-show"></i>';
        }
    }

    function habilitarCambioContrasena() {
        const campoContrasena = document.getElementById('password');
        const contenedorConfirmacion = document.getElementById('confirmPasswordContainer');
        
        campoContrasena.removeAttribute('readonly');
        campoContrasena.value = '';
        campoContrasena.focus();
        
        contenedorConfirmacion.style.display = 'block';
        
        const botonCambio = document.getElementById('enablePasswordChange');
        botonCambio.innerHTML = '<i class="bx bx-x"></i> Cancelar';
        botonCambio.classList.remove('btn-outline-primary');
        botonCambio.classList.add('btn-outline-danger');
        botonCambio.removeEventListener('click', habilitarCambioContrasena);
        botonCambio.addEventListener('click', cancelarCambioContrasena);
    }

    function cancelarCambioContrasena() {
        const campoContrasena = document.getElementById('password');
        const contenedorConfirmacion = document.getElementById('confirmPasswordContainer');
        const campoConfirmacion = document.getElementById('confirmPassword');
        
        campoContrasena.value = '';
        campoContrasena.setAttribute('readonly', 'true');
        campoContrasena.type = 'password';
        campoConfirmacion.value = '';
        contenedorConfirmacion.style.display = 'none';
        
        const botonCambio = document.getElementById('enablePasswordChange');
        botonCambio.innerHTML = 'Cambiar';
        botonCambio.classList.remove('btn-outline-danger');
        botonCambio.classList.add('btn-outline-primary');
        botonCambio.removeEventListener('click', cancelarCambioContrasena);
        botonCambio.addEventListener('click', habilitarCambioContrasena);
        
        campoContrasena.classList.remove('is-invalid');
        campoConfirmacion.classList.remove('is-invalid');
        document.getElementById('passwordMatchError').style.display = 'none';
    }

    function validarContrasenas() {
        const contrasena = document.getElementById('password').value;
        const confirmacionContrasena = document.getElementById('confirmPassword').value;
        const campoContrasena = document.getElementById('password');
        const campoConfirmacion = document.getElementById('confirmPassword');
        const elementoError = document.getElementById('passwordMatchError');
        
        if (document.getElementById('confirmPasswordContainer').style.display === 'none') {
            return true;
        }
        
        if (contrasena !== confirmacionContrasena) {
            campoContrasena.classList.add('is-invalid');
            campoConfirmacion.classList.add('is-invalid');
            elementoError.style.display = 'block';
            return false;
        }
        
        if (contrasena.length > 0 && contrasena.length < 8) {
            elementoError.textContent = 'La contraseña debe tener al menos 8 caracteres';
            elementoError.style.display = 'block';
            campoContrasena.classList.add('is-invalid');
            campoConfirmacion.classList.add('is-invalid');
            return false;
        }
        
        campoContrasena.classList.remove('is-invalid');
        campoConfirmacion.classList.remove('is-invalid');
        elementoError.style.display = 'none';
        return true;
    }

    // Función para verificar cambios en bit_usu
    async function verificarActualizacionesUsuarios() {
        if (actualizandoUsuario) return;
        actualizandoUsuario = true;
        
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/check_user_updates.php?last_update=${ultimoTimestampActualizacionUsuario || ''}`);
            const datos = await respuesta.json();
            
            if (datos.success && datos.has_changes) {
                ultimoTimestampActualizacionUsuario = datos.last_update;
                
                // Actualizar la tabla con animación suave
                await actualizarTablaUsuariosSuavemente();
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones de usuarios:', error);
        } finally {
            actualizandoUsuario = false;
        }
    }

    // Función para actualizar la tabla de usuarios con animación suave
    async function actualizarTablaUsuariosSuavemente() {
        // Agregar clase de transición a la tabla
        const tabla = document.getElementById('usersTable');
        tabla.classList.add('table-updating');
        
        // Mostrar indicador de actualización
        const indicadorActualizacion = document.createElement('div');
        tabla.parentNode.insertBefore(indicadorActualizacion, tabla);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolver => setTimeout(resolver, 300));
        
        // Recargar datos
        if (buscando) {
            todosUsuarios = await obtenerTodosUsuarios();
            const filtrados = filtrarUsuariosLocalmente(todosUsuarios, terminoBusquedaActual);
            await mostrarUsuarios(paginaActual, filtrados);
        } else {
            await mostrarUsuarios(paginaActual);
        }
        
        // Ocultar indicador y quitar clase de transición
        indicadorActualizacion.remove();
        tabla.classList.remove('table-updating');
        
        // Mostrar notificación de actualización
        mostrarNotificacionActualizacionUsuarios();
    }

    // Función para mostrar notificación de actualización de usuarios
    function mostrarNotificacionActualizacionUsuarios() {
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
            title: 'Datos de usuarios actualizados'
        });
    }

    // Iniciar el sistema de actualización periódica para usuarios
    function iniciarVerificadorActualizacionesUsuarios() {
        // Verificar actualizaciones inmediatamente
        verificarActualizacionesUsuarios();
        
        // Configurar intervalo periódico
        temporizadorActualizacionUsuario = setInterval(verificarActualizacionesUsuarios, intervaloActualizacionUsuario);
        
        // También verificar cuando la ventana gana foco
        window.addEventListener('focus', verificarActualizacionesUsuarios);
    }

    // Detener el sistema de actualización
    function detenerVerificadorActualizacionesUsuarios() {
        if (temporizadorActualizacionUsuario) {
            clearInterval(temporizadorActualizacionUsuario);
        }
        window.removeEventListener('focus', verificarActualizacionesUsuarios);
    }

    // Inicializar la tabla, paginación y buscador
    mostrarUsuarios(paginaActual).then(() => {
        configurarBusqueda();
    });

    // Iniciar el sistema de actualización en tiempo real
    iniciarVerificadorActualizacionesUsuarios();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', detenerVerificadorActualizacionesUsuarios);
});