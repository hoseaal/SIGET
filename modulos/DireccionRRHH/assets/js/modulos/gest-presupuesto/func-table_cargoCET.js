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

document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación
    const filasPorPagina = 7;
    let paginaActual = 1;
    let totalCargos = 0;
    let totalPaginas = 1;
    const cuerpoTabla = document.querySelector('#cetTableBody');
    const elementoPaginacion = document.getElementById('cetPagination');

    // Variables para el control de actualización en tiempo real
    let ultimoTimestampActualizacion = null;
    let intervaloActualizacion = 1000; // 1 segundo
    let temporizadorActualizacion = null;
    let actualizando = false;

    // Función para cargar los cargos desde la API
    async function obtenerCargos(pagina) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_cargoCET.php?page=${pagina}&per_page=${filasPorPagina}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                totalCargos = datos.total;
                totalPaginas = datos.total_pages;
                return {
                    cargos: datos.positions,
                    total: datos.total
                };
            } else {
                console.error('Error al cargar cargos:', datos.message);
                return {
                    cargos: [],
                    total: 0
                };
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return {
                cargos: [],
                total: 0
            };
        }
    }

    // Función para mostrar los cargos en la página actual
    async function mostrarCargos(pagina) {
        // Mostrar loader mientras carga
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        const {cargos, total} = await obtenerCargos(pagina);
        totalCargos = total;
        totalPaginas = Math.ceil(totalCargos / filasPorPagina);
        
        cuerpoTabla.innerHTML = '';
        
        if (cargos.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < filasPorPagina; i++) {
                const fila = document.createElement('tr');
                if (i === 0) {
                    fila.innerHTML = `
                        <td colspan="3" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron cargos' : '&nbsp;'}
                        </td>
                    `;
                } else {
                    fila.innerHTML = '<td colspan="3" class="empty-row">&nbsp;</td>';
                }
                cuerpoTabla.appendChild(fila);
            }
            
            // Configurar paginación para 0 resultados
            configurarPaginacion();
            return;
        }

        // Llenar con datos reales
        cargos.forEach((cargo, indice) => {
            const numeroFila = (pagina - 1) * filasPorPagina + indice + 1;
            const fila = document.createElement('tr');
            
            // solo 2 columnas
            if (LOGGED_USER_TYPE === '1') {
                fila.innerHTML = `
                    <td>${numeroFila}</td>
                    <td>${cargo.cet_car}</td>
                `;
            } 
            // 3 columnas (sin eliminar)
            else if (LOGGED_USER_TYPE === '2' || LOGGED_USER_TYPE === '3') {
                fila.innerHTML = `
                    <td>${numeroFila}</td>
                    <td>${cargo.cet_car}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-position-btn" href="javascript:void(0);" data-id="${cargo.cet_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            } 
            // columnas con todas las acciones
            else {
                fila.innerHTML = `
                    <td>${numeroFila}</td>
                    <td>${cargo.cet_car}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item edit-position-btn" href="javascript:void(0);" data-id="${cargo.cet_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                                <a class="dropdown-item delete-position-btn" href="javascript:void(0);" data-id="${cargo.cet_ide}" data-name="${cargo.cet_car}">
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
        if (cargos.length < filasPorPagina) {
            const filasRestantes = filasPorPagina - cargos.length;
            for (let i = 0; i < filasRestantes; i++) {
                const fila = document.createElement('tr');
                fila.innerHTML = '<td colspan="3" class="empty-row">&nbsp;</td>';
                fila.style.height = '3.5rem';
                cuerpoTabla.appendChild(fila);
            }
        }

        // Configurar event listeners solo si el usuario tiene permisos
        if (LOGGED_USER_TYPE !== '1') {
            // Configurar event listeners para editar
            document.querySelectorAll('.edit-position-btn').forEach(boton => {
                boton.addEventListener('click', function() {
                    const cargoId = this.getAttribute('data-id');
                    const nombreCargo = this.closest('tr').querySelector('td:nth-child(2)').textContent;
                    
                    // Cargar datos en el modal de edición
                    const modalEdicion = new bootstrap.Modal(document.getElementById('ModalEditCET'));
                    const inputModal = document.querySelector('#ModalEditCET #nameBasic');
                    const botonGuardar = document.querySelector('#ModalEditCET .btn-primary');
                    
                    // Limpiar eventos anteriores para evitar duplicados
                    const nuevoBotonGuardar = botonGuardar.cloneNode(true);
                    botonGuardar.parentNode.replaceChild(nuevoBotonGuardar, botonGuardar);
                    
                    // Configurar valores del modal
                    inputModal.value = nombreCargo;
                    
                    // Configurar evento para guardar cambios
                    nuevoBotonGuardar.addEventListener('click', async function() {
                        const inputModal = document.querySelector('#ModalEditCET #nameBasic');
                        const nuevoNombre = inputModal.value.trim();
                        
                        // Validaciones
                        if (!esNombreCargoValido(nuevoNombre)) {
                            mostrarErrorInput(inputModal, 'El nombre del cargo debe tener entre 1 y 50 caracteres válidos (solo letras y espacios).');
                            return;
                        }
                        
                        try {
                            // Mostrar loader
                            const textoOriginalBoton = nuevoBotonGuardar.innerHTML;
                            nuevoBotonGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
                            nuevoBotonGuardar.disabled = true;
                            
                            // Enviar solicitud al servidor
                            const respuesta = await fetch('../PHP/api/gest-presupuesto/actualizar_cargoCET.php', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ 
                                    position_id: cargoId,
                                    new_name: nuevoNombre
                                })
                            });
                            
                            const resultado = await respuesta.json();
                            
                            // Restaurar botón
                            nuevoBotonGuardar.innerHTML = textoOriginalBoton;
                            nuevoBotonGuardar.disabled = false;
                            
                            if (resultado.success) {
                                // Cerrar el modal
                                modalEdicion.hide();
                                // Recargar la tabla
                                mostrarCargos(paginaActual);
                            } else {
                                throw new Error(resultado.message || 'Error al actualizar el cargo');
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            alert('Error al actualizar: ' + error.message);
                            nuevoBotonGuardar.innerHTML = 'Guardar Cambios';
                            nuevoBotonGuardar.disabled = false;
                        }
                    });
                    
                    // Mostrar el modal
                    modalEdicion.show();
                });
            });

            // event listeners para los botones de eliminar 
            if (LOGGED_USER_TYPE === '4' || LOGGED_USER_TYPE === '5') {
                document.querySelectorAll('.delete-position-btn').forEach(boton => {
                    boton.addEventListener('click', function() {
                        const cargoId = this.getAttribute('data-id');
                        const nombreCargo = this.getAttribute('data-name');
                        mostrarConfirmacionEliminacion(cargoId, nombreCargo);
                    });
                });
            }
        }

        // Configurar la paginación
        configurarPaginacion();
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
                mostrarCargos(paginaActual);
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
                mostrarCargos(paginaActual);
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
                    mostrarCargos(paginaActual);
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
                mostrarCargos(paginaActual);
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
                mostrarCargos(paginaActual);
            }
        });
        elementoPaginacion.appendChild(li);
        
        // Actualizar estado de los botones de navegación
        actualizarBotonesPaginacion();
    }
    
    // Función para actualizar el estado de los botones de paginación
    function actualizarBotonesPaginacion() {
        const itemsPagina = elementoPaginacion.querySelectorAll('.page-item');
        
        // Remover clase active de todos los items
        itemsPagina.forEach(item => {
            item.classList.remove('active');
            item.classList.remove('disabled');
        });
        
        // clase active al item correspondiente
        itemsPagina.forEach(item => {
            const enlacePagina = item.querySelector('.page-link:not(.tf-icon)');
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
        }
        
        if (paginaActual === totalPaginas) {
            botonSiguiente.classList.add('disabled');
            botonUltimo.classList.add('disabled');
        }
    }

    // Función para mostrar confirmación de eliminación
    function mostrarConfirmacionEliminacion(cargoId, nombreCargo) {
        smallSwal.fire({
        title: '¿Eliminar cargo?',
        html: `¿Seguro que desea eliminar el cargo <strong>${nombreCargo}</strong>?<br><span class="text-danger">¡Esta acción no se puede deshacer!</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
        }).then((resultado) => {
        if (resultado.isConfirmed) {
            eliminarCargo(cargoId);
        }
        });
    }

    // Función para eliminar un cargo
    async function eliminarCargo(cargoId) {
        try {
        // Mostrar loader
        smallSwal.fire({
            title: 'Eliminando cargo',
            html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%; height: 100%;"></div></div>',
            width: 350,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
            smallSwal.showLoading();
            }
        });

        // Enviar solicitud de eliminación
        const respuesta = await fetch('../PHP/api/gest-presupuesto/eliminar_cargoCET.php', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ position_id: cargoId })
        });
        
        const resultado = await respuesta.json();
        
        // Cerrar loader
        smallSwal.close();

        if (resultado.success) {
            smallSwal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'El cargo ha sido eliminado correctamente',
            showConfirmButton: false,
            timer: 1500
            }).then(() => {
            mostrarCargos(paginaActual);
            });
        } else {
            throw new Error(resultado.message || 'Error al eliminar el cargo');
        }
        } catch (error) {
        console.error('Error al eliminar:', error);
        smallSwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al eliminar: ' + error.message,
            confirmButtonColor: '#3085d6'
        });
        }
    }

    // Función para agregar un nuevo cargo
    document.getElementById('addCetPositionBtn').addEventListener('click', async function() {
        const inputElement = document.getElementById('newCargoCET');
        const nombreCargo = inputElement.value.trim();
        
        // Validaciones
        if (!esNombreCargoValido(nombreCargo)) {
        mostrarErrorInput(inputElement, 'El nombre del cargo debe tener entre 1 y 50 caracteres válidos (solo letras y espacios).');
        return;
        }
        
        try {
        // Mostrar loader
        smallSwal.fire({
            title: 'Agregando cargo',
            html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%; height: 100%;"></div></div>',
            width: 350,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
            smallSwal.showLoading();
            }
        });

        // Enviar solicitud al servidor
        const respuesta = await fetch('../PHP/api/gest-presupuesto/agregar_cargoCET.php', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ position_name: nombreCargo })
        });
        
        const resultado = await respuesta.json();
        
        // Cerrar loader
        smallSwal.close();

        if (resultado.success) {
            smallSwal.fire({
            icon: 'success',
            title: '¡Agregado!',
            text: 'El cargo ha sido agregado correctamente',
            showConfirmButton: false,
            timer: 1500
            }).then(() => {
            // Limpiar el campo de entrada
            inputElement.value = '';
            
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('basicModal'));
            modal.hide();
            
            // Recargar la tabla
            paginaActual = 1;
            mostrarCargos(paginaActual);
            });
        } else {
            throw new Error(resultado.message || 'Error al agregar el cargo');
        }
        } catch (error) {
        console.error('Error:', error);
        smallSwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al agregar: ' + error.message,
            confirmButtonColor: '#3085d6'
        });
        }
    });

    // Función para validar el nombre del cargo
    function esCaracterCargoValido(caracter) {
        // Permite letras (mayúsculas y minúsculas), espacios, acentos y caracteres especiales del español
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
        return regex.test(caracter);
    }

    // Función para manejar la entrada en los campos
    function manejarInputCargo(evento) {
        const input = evento.target;
        let valor = input.value;
        let nuevoValor = '';
        
        // Filtrar cada caracter
        for (let i = 0; i < valor.length; i++) {
            if (esCaracterCargoValido(valor[i])) {
                nuevoValor += valor[i];
            }
        }
        
        // Limitar a 50 caracteres
        if (nuevoValor.length > 50) {
            nuevoValor = nuevoValor.substring(0, 50);
        }
        
        // Actualizar el valor solo si es diferente
        if (valor !== nuevoValor) {
            input.value = nuevoValor;
            
            // Mostrar feedback visual
            input.classList.add('invalid-input');
            setTimeout(() => {
                input.classList.remove('invalid-input');
            }, 300);
        }
    }

    // Función para validar el nombre completo del cargo
    function esNombreCargoValido(nombre) {
        return nombre.length > 0 && nombre.length <= 50;
    }

    document.getElementById('newCargoCET').addEventListener('input', manejarInputCargo);
    document.getElementById('nameBasic').addEventListener('input', manejarInputCargo);

    // Validación en tiempo real para el input de añadir
    document.getElementById('newCargoCET').addEventListener('input', function() {
        const valorInput = this.value;
        
        // Limpiar error mientras escribe
        if (this.classList.contains('is-invalid')) {
            limpiarErrorInput(this);
        }
        
        // Validar longitud máxima
        if (valorInput.length > 50) {
            this.value = valorInput.substring(0, 50);
        }
    });

    // Validación en tiempo real para el input de editar
    document.getElementById('nameBasic').addEventListener('input', function() {
        const valorInput = this.value;
        
        // Limpiar error mientras escribe
        if (this.classList.contains('is-invalid')) {
            limpiarErrorInput(this);
        }
        
        // Validar longitud máxima
        if (valorInput.length > 50) {
            this.value = valorInput.substring(0, 50);
        }
    });

    // Función para verificar cambios en bit_cet
    async function verificarActualizaciones() {
        if (actualizando) return;
        actualizando = true;
        
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/check_cet_updates.php?last_update=${ultimoTimestampActualizacion || ''}`);
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
        const tabla = document.getElementById('cetTable');
        tabla.classList.add('table-updating');
        
        // Mostrar indicador de actualización
        const indicadorActualizacion = document.createElement('div');
        tabla.parentNode.insertBefore(indicadorActualizacion, tabla);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolver => setTimeout(resolver, 300));
        
        // Recargar datos
        await mostrarCargos(paginaActual);
        
        // Ocultar indicador y quitar clase de transición
        indicadorActualizacion.remove();
        tabla.classList.remove('table-updating');
        
        // Mostrar notificación de actualización
        mostrarNotificacionActualizacion();
    }

    // Función para mostrar notificación de actualización
    function mostrarNotificacionActualizacion() {
        const notificacion = document.createElement('div');
        notificacion.className = 'update-notification cet-notification';
        notificacion.innerHTML = 'Cargos CET actualizados <i class="bx bx-check"></i>';
        
        document.body.appendChild(notificacion);
        
        // Mostrar y luego desaparecer
        setTimeout(() => {
            notificacion.classList.add('show');
            setTimeout(() => {
                notificacion.classList.remove('show');
                setTimeout(() => {
                    notificacion.remove();
                }, 300);
            }, 3000);
        }, 100);
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
    
    // Inicializar la tabla
    mostrarCargos(paginaActual);

    // Iniciar el sistema de actualización en tiempo real
    iniciarVerificadorActualizaciones();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', detenerVerificadorActualizaciones);
});