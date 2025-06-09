document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación ONAPRE
    const filasPorPaginaONAPRE = 7;
    let paginaActualONAPRE = 1;
    let totalCargosONAPRE = 0;
    let totalPaginasONAPRE = 1;
    const cuerpoTablaONAPRE = document.querySelector('#onapreTable tbody');
    const elementoPaginacionONAPRE = document.getElementById('onaprePagination');

    // Variables para el control de actualización en tiempo real ONAPRE
    let ultimoTimestampActualizacionONAPRE = null;
    let intervaloActualizacionONAPRE = 2000; // 2 segundos
    let temporizadorActualizacionONAPRE = null;
    let actualizandoONAPRE = false;

    function limpiarModales() {
        // Eliminar todos los backdrops
        document.querySelectorAll('.modal-backdrop').forEach(elemento => {
            elemento.classList.add('fade', 'show'); // Asegurar animación de fade out
            setTimeout(() => elemento.remove(), 300); // Esperar a que termine la animación
        });
        
        // Restaurar el scroll del body
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0';
        
        // Cerrar todos los modales abiertos
        document.querySelectorAll('.modal.show').forEach(modal => {
            const instancia = bootstrap.Modal.getInstance(modal);
            if (instancia) {
                instancia.hide();
                setTimeout(() => {
                    instancia.dispose();
                    modal.remove();
                }, 300);
            } else {
                modal.remove();
            }
        });
    }

    // Función para cargar los cargos ONAPRE desde la API
    async function obtenerCargosONAPRE(pagina) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_cargoONAPRE.php?page=${pagina}&per_page=${filasPorPaginaONAPRE}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                totalCargosONAPRE = datos.total;
                totalPaginasONAPRE = datos.total_pages;
                return {
                    cargos: datos.positions,
                    total: datos.total
                };
            } else {
                console.error('Error al cargar cargos ONAPRE:', datos.message);
                return {
                    cargos: [],
                    total: 0
                };
            }
        } catch (error) {
            console.error('Error en la solicitud ONAPRE:', error);
            return {
                cargos: [],
                total: 0
            };
        }
    }

    // Función para mostrar los cargos ONAPRE en la página actual
    async function mostrarCargosONAPRE(pagina) {
        // Mostrar loader mientras carga
        cuerpoTablaONAPRE.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        const {cargos, total} = await obtenerCargosONAPRE(pagina);
        totalCargosONAPRE = total;
        totalPaginasONAPRE = Math.ceil(totalCargosONAPRE / filasPorPaginaONAPRE);
        
        cuerpoTablaONAPRE.innerHTML = '';
        
        if (cargos.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < filasPorPaginaONAPRE; i++) {
                const fila = document.createElement('tr');
                if (i === 0) {
                    fila.innerHTML = `
                        <td colspan="3" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron cargos ONAPRE' : '&nbsp;'}
                        </td>
                    `;
                } else {
                    fila.innerHTML = '<td colspan="3" class="empty-row">&nbsp;</td>';
                }
                cuerpoTablaONAPRE.appendChild(fila);
            }
            
            // Configurar paginación para 0 resultados
            configurarPaginacionONAPRE();
            return;
        }

        // Llenar con datos reales
        cargos.forEach((cargo, indice) => {
            const numeroFila = (pagina - 1) * filasPorPaginaONAPRE + indice + 1;
            const fila = document.createElement('tr');
            
            // Usuario tipo "0" - solo 2 columnas
            if (LOGGED_USER_TYPE === '0') {
                fila.innerHTML = `
                    <td>${numeroFila}</td>
                    <td>${cargo.ona_car}</td>
                `;
            } 
            // Usuario tipo "1" o "2" - 3 columnas (sin eliminar)
            else if (LOGGED_USER_TYPE === '1' || LOGGED_USER_TYPE === '2') {
                fila.innerHTML = `
                    <td>${numeroFila}</td>
                    <td>${cargo.ona_car}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item editar-cargo-btn" href="javascript:void(0);" data-id="${cargo.ona_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            } 
            // Usuario tipo "3" o "4" - 3 columnas con todas las acciones
            else {
                fila.innerHTML = `
                    <td>${numeroFila}</td>
                    <td>${cargo.ona_car}</td>
                    <td>
                        <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item editar-cargo-btn" href="javascript:void(0);" data-id="${cargo.ona_ide}">
                                    <i class="bx bx-edit-alt me-1"></i> Editar
                                </a>
                                <a class="dropdown-item eliminar-cargo-btn" href="javascript:void(0);" data-id="${cargo.ona_ide}" data-name="${cargo.ona_car}">
                                    <i class="bx bx-trash me-1"></i> Eliminar
                                </a>
                            </div>
                        </div>
                    </td>
                `;
            }
            
            cuerpoTablaONAPRE.appendChild(fila);
        });

        // Completar con filas vacías si no llega a filasPorPaginaONAPRE
        if (cargos.length < filasPorPaginaONAPRE) {
            const filasRestantes = filasPorPaginaONAPRE - cargos.length;
            for (let i = 0; i < filasRestantes; i++) {
                const fila = document.createElement('tr');
                fila.innerHTML = '<td colspan="3" class="empty-row">&nbsp;</td>';
                fila.style.height = '3.5rem';
                cuerpoTablaONAPRE.appendChild(fila);
            }
        }

        // Configurar event listeners solo si el usuario tiene permisos
        if (LOGGED_USER_TYPE !== '0') {
            // Agregar event listeners para los botones de editar
            document.querySelectorAll('.editar-cargo-btn').forEach(boton => {
                boton.addEventListener('click', function() {
                    const idCargo = this.getAttribute('data-id');
                    const nombreCargo = this.closest('tr').querySelector('td:nth-child(2)').textContent;
                    mostrarModalEdicionONAPRE(idCargo, nombreCargo);
                });
            });

            // Agregar event listeners para los botones de eliminar (solo para tipos 3 y 4)
            if (LOGGED_USER_TYPE === '3' || LOGGED_USER_TYPE === '4') {
                document.querySelectorAll('.eliminar-cargo-btn').forEach(boton => {
                    // Limpiar eventos existentes primero
                    const nuevoBoton = boton.cloneNode(true);
                    boton.parentNode.replaceChild(nuevoBoton, boton);
                    
                    // Agregar nuevo listener
                    nuevoBoton.addEventListener('click', function() {
                        const idCargo = this.getAttribute('data-id');
                        const nombreCargo = this.getAttribute('data-name');
                        mostrarConfirmacionEliminacionONAPRE(idCargo, nombreCargo);
                    });
                });
            }
        }

        // Configurar la paginación
        configurarPaginacionONAPRE();
    }

    // Función para configurar la paginación ONAPRE
    function configurarPaginacionONAPRE() {
        elementoPaginacionONAPRE.innerHTML = '';
        
        // Botón Primera página
        let li = document.createElement('li');
        li.className = 'page-item first';
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-left"></i></a>`;
        li.addEventListener('click', () => {
            if (paginaActualONAPRE !== 1) {
                paginaActualONAPRE = 1;
                mostrarCargosONAPRE(paginaActualONAPRE);
            }
        });
        elementoPaginacionONAPRE.appendChild(li);
        
        // Botón Página anterior
        li = document.createElement('li');
        li.className = 'page-item prev';
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-left"></i></a>`;
        li.addEventListener('click', () => {
            if (paginaActualONAPRE > 1) {
                paginaActualONAPRE--;
                mostrarCargosONAPRE(paginaActualONAPRE);
            }
        });
        elementoPaginacionONAPRE.appendChild(li);
        
        // Números de página (mostramos máximo 5 páginas alrededor de la actual)
        const paginaInicio = Math.max(1, paginaActualONAPRE - 2);
        const paginaFin = Math.min(totalPaginasONAPRE, paginaActualONAPRE + 2);
        
        for (let i = paginaInicio; i <= paginaFin; i++) {
            li = document.createElement('li');
            li.className = 'page-item';
            if (i === paginaActualONAPRE) li.classList.add('active');
            li.innerHTML = `<a class="page-link" href="javascript:void(0);">${i}</a>`;
            li.addEventListener('click', () => {
                if (paginaActualONAPRE !== i) {
                    paginaActualONAPRE = i;
                    mostrarCargosONAPRE(paginaActualONAPRE);
                }
            });
            elementoPaginacionONAPRE.appendChild(li);
        }
        
        // Botón Página siguiente
        li = document.createElement('li');
        li.className = 'page-item next';
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-right"></i></a>`;
        li.addEventListener('click', () => {
            if (paginaActualONAPRE < totalPaginasONAPRE) {
                paginaActualONAPRE++;
                mostrarCargosONAPRE(paginaActualONAPRE);
            }
        });
        elementoPaginacionONAPRE.appendChild(li);
        
        // Botón Última página
        li = document.createElement('li');
        li.className = 'page-item last';
        li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-right"></i></a>`;
        li.addEventListener('click', () => {
            if (paginaActualONAPRE !== totalPaginasONAPRE) {
                paginaActualONAPRE = totalPaginasONAPRE;
                mostrarCargosONAPRE(paginaActualONAPRE);
            }
        });
        elementoPaginacionONAPRE.appendChild(li);
        
        // Actualizar estado de los botones de navegación
        actualizarBotonesPaginacionONAPRE();
    }
    
    // Función para actualizar el estado de los botones de paginación ONAPRE
    function actualizarBotonesPaginacionONAPRE() {
        const itemsPagina = elementoPaginacionONAPRE.querySelectorAll('.page-item');
        
        // Remover clase active de todos los items
        itemsPagina.forEach(item => {
            item.classList.remove('active');
            item.classList.remove('disabled');
        });
        
        // Agregar clase active al item correspondiente
        itemsPagina.forEach(item => {
            const enlacePagina = item.querySelector('.page-link:not(.tf-icon)');
            if (enlacePagina && enlacePagina.textContent === paginaActualONAPRE.toString()) {
                item.classList.add('active');
            }
        });
        
        // Actualizar estado de los botones de navegación
        const botonPrimero = elementoPaginacionONAPRE.querySelector('.first');
        const botonAnterior = elementoPaginacionONAPRE.querySelector('.prev');
        const botonSiguiente = elementoPaginacionONAPRE.querySelector('.next');
        const botonUltimo = elementoPaginacionONAPRE.querySelector('.last');
        
        if (paginaActualONAPRE === 1) {
            botonPrimero.classList.add('disabled');
            botonAnterior.classList.add('disabled');
        }
        
        if (paginaActualONAPRE === totalPaginasONAPRE) {
            botonSiguiente.classList.add('disabled');
            botonUltimo.classList.add('disabled');
        }
    }

    // Función para mostrar confirmación de eliminación ONAPRE
    let modalEliminacionActual = null;

    function mostrarConfirmacionEliminacionONAPRE(idCargo, nombreCargo) {
        smallSwal.fire({
        title: '¿Eliminar cargo ONAPRE?',
        html: `¿Seguro que desea eliminar el cargo <strong>${nombreCargo}</strong>?<br><span class="text-danger">¡Esta acción no se puede deshacer!</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
        }).then((resultado) => {
        if (resultado.isConfirmed) {
            eliminarCargoONAPRE(idCargo);
        }
        });
    }

    // Función para eliminar un cargo ONAPRE
    async function eliminarCargoONAPRE(idCargo) {
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
        const respuesta = await fetch('../PHP/api/gest-presupuesto/eliminar_cargoONAPRE.php', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ position_id: idCargo })
        });
        
        const resultado = await respuesta.json();
        
        // Cerrar loader
        smallSwal.close();

        if (resultado.success) {
            smallSwal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'El cargo ONAPRE ha sido eliminado correctamente',
            showConfirmButton: false,
            timer: 1500
            }).then(() => {
            mostrarCargosONAPRE(paginaActualONAPRE);
            });
        } else {
            throw new Error(resultado.message || 'Error al eliminar el cargo ONAPRE');
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

    // Función para agregar un nuevo cargo ONAPRE
    document.getElementById('addOnaprePositionBtn').addEventListener('click', async function() {
        const inputCargo = document.getElementById('newOnaprePosition');
        const nombreCargo = inputCargo.value.trim();
        
        // Validación adicional por si el usuario pega texto no válido
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s()]{1,50}$/;
        
        if (!nombreCargo) {
        inputCargo.classList.add('is-invalid');
        smallSwal.fire({
            icon: 'error',
            title: 'Nombre requerido',
            text: 'Por favor ingrese un nombre para el cargo',
            confirmButtonColor: '#3085d6'
        });
        return;
        } else if (!regex.test(nombreCargo)) {
        inputCargo.classList.add('is-invalid');
        smallSwal.fire({
            icon: 'error',
            title: 'Nombre inválido',
            text: 'Solo se permiten letras, espacios y paréntesis',
            confirmButtonColor: '#3085d6'
        });
        return;
        } else {
        inputCargo.classList.remove('is-invalid');
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
        const respuesta = await fetch('../PHP/api/gest-presupuesto/agregar_cargoONAPRE.php', {
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
            text: 'El cargo ONAPRE ha sido agregado correctamente',
            showConfirmButton: false,
            timer: 1500
            }).then(() => {
            // Limpiar el campo de entrada
            inputCargo.value = '';
            
            // Cerrar el modal
            bootstrap.Modal.getInstance(document.getElementById('onapreModal')).hide();
            
            // Recargar la tabla
            paginaActualONAPRE = 1;
            mostrarCargosONAPRE(paginaActualONAPRE);
            });
        } else {
            throw new Error(resultado.message || 'Error al agregar el cargo ONAPRE');
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

    // Función para mostrar el modal de edición ONAPRE
    function mostrarModalEdicionONAPRE(idCargo, nombreCargo) {
        // Obtener el modal
        const modalEdicion = document.getElementById('ModalEditIONAPRE');
        
        // Limpiar cualquier modal backdrop existente
        const backdropsExistentes = document.querySelectorAll('.modal-backdrop');
        backdropsExistentes.forEach(backdrop => backdrop.remove());
        
        // Limpiar cualquier instancia previa del modal
        const modalExistente = bootstrap.Modal.getInstance(modalEdicion);
        if (modalExistente) {
            modalExistente.dispose();
        }
        
        // Clonar y reemplazar el botón de guardar para evitar duplicados
        const botonGuardarOriginal = modalEdicion.querySelector('.btn-primary');
        const nuevoBotonGuardar = botonGuardarOriginal.cloneNode(true);
        botonGuardarOriginal.parentNode.replaceChild(nuevoBotonGuardar, botonGuardarOriginal);
        
        // Configurar los valores en el modal
        const inputNombre = modalEdicion.querySelector('#nameBasic2');
        inputNombre.value = nombreCargo;
        inputNombre.classList.remove('is-invalid');
        
        // Configurar el nuevo botón de guardar
        nuevoBotonGuardar.onclick = async function() {
            const nuevoNombre = inputNombre.value.trim();
            const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s()]{1,50}$/;
            
            if (!nuevoNombre || !regex.test(nuevoNombre)) {
                inputNombre.classList.add('is-invalid');
                return;
            }
            
            try {
                // Mostrar spinner en el botón
                const textoOriginal = nuevoBotonGuardar.innerHTML;
                nuevoBotonGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
                nuevoBotonGuardar.disabled = true;
                
                // Enviar solicitud de actualización
                const respuesta = await fetch('../PHP/api/gest-presupuesto/actualizar_cargoONAPRE.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        position_id: idCargo,
                        new_name: nuevoNombre
                    })
                });
                
                const resultado = await respuesta.json();
                
                // Restaurar botón
                nuevoBotonGuardar.innerHTML = textoOriginal;
                nuevoBotonGuardar.disabled = false;
                
                if (resultado.success) {
                    // Cerrar modal y recargar datos
                    const instanciaModal = bootstrap.Modal.getInstance(modalEdicion);
                    instanciaModal.hide();
                    
                    // Actualizar el timestamp
                    ultimoTimestampActualizacionONAPRE = resultado.timestamp || new Date().toISOString();
                    mostrarCargosONAPRE(paginaActualONAPRE);
                } else {
                    throw new Error(resultado.message || 'Error al actualizar el cargo ONAPRE');
                }
            } catch (error) {
                console.error('Error al actualizar:', error);
                alert('Error al actualizar: ' + error.message);
                nuevoBotonGuardar.innerHTML = 'Guardar Cambios';
                nuevoBotonGuardar.disabled = false;
            }
        };

        // Crear nueva instancia del modal
        const modal = new bootstrap.Modal(modalEdicion, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
        
        // Mostrar el modal
        modal.show();
        
        // Manejar el cierre del modal correctamente
        modalEdicion.addEventListener('hidden.bs.modal', function() {
            // Limpiar eventos
            nuevoBotonGuardar.onclick = null;
            
            // Eliminar el backdrop si persiste
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            
            // Habilitar el scroll del body
            document.body.style.overflow = 'auto';
            document.body.style.paddingRight = '0';
        });
    }

    // Validación en tiempo real para el input de nuevo cargo
    document.getElementById('newOnaprePosition').addEventListener('input', function(e) {
        // Expresión regular que solo permite letras (incluyendo acentos) y espacios
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s()]{1,50}$/;
        
        if (!regex.test(e.target.value)) {
            // Si no cumple con la expresión regular, revertir al último valor válido
            e.target.value = e.target.value.substring(0, e.target.value.length - 1);
        }
    });

    // Validación en tiempo real para el input de edición
    document.addEventListener('shown.bs.modal', function(e) {
        if (e.target.id === 'ModalEditIONAPRE') {
            const inputEdicion = document.getElementById('nameBasic2');
            
            inputEdicion.addEventListener('input', function(e) {
                // Expresión regular que solo permite letras (incluyendo acentos) y espacios
                const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s()]{1,50}$/;
                
                if (!regex.test(e.target.value)) {
                    // Si no cumple con la expresión regular, revertir al último valor válido
                    e.target.value = e.target.value.substring(0, e.target.value.length - 1);
                }
            });
        }
    });

    // Función para verificar cambios en bit_ona
    async function verificarActualizacionesONAPRE() {
        if (actualizandoONAPRE) return;
        actualizandoONAPRE = true;
        
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/check_onapre_updates.php?last_update=${ultimoTimestampActualizacionONAPRE || ''}`);
            const datos = await respuesta.json();
            
            if (datos.success && datos.has_changes) {
                ultimoTimestampActualizacionONAPRE = datos.last_update;
                
                // Actualizar la tabla con animación suave
                await actualizarTablaONAPRESuavemente();
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones ONAPRE:', error);
        } finally {
            actualizandoONAPRE = false;
        }
    }

    // Función para actualizar la tabla ONAPRE con animación suave
    async function actualizarTablaONAPRESuavemente() {
        // Agregar clase de transición a la tabla
        const tabla = document.getElementById('onapreTable');
        tabla.classList.add('table-updating');
        
        // Mostrar indicador de actualización
        const indicadorActualizacion = document.createElement('div');
        tabla.parentNode.insertBefore(indicadorActualizacion, tabla);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolver => setTimeout(resolver, 300));
        
        // Recargar datos
        await mostrarCargosONAPRE(paginaActualONAPRE);
        
        // Ocultar indicador y quitar clase de transición
        indicadorActualizacion.remove();
        tabla.classList.remove('table-updating');
        
        // Mostrar notificación de actualización
        mostrarNotificacionActualizacionONAPRE();
    }

    // Función para mostrar notificación de actualización ONAPRE
    function mostrarNotificacionActualizacionONAPRE() {
        const notificacion = document.createElement('div');
        notificacion.className = 'update-notification onapre-notification';
        notificacion.innerHTML = 'Datos de cargos ONAPRE actualizados <i class="bx bx-check"></i>';
        
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

    // Iniciar el sistema de actualización periódica ONAPRE
    function iniciarVerificadorActualizacionesONAPRE() {
        // Verificar actualizaciones inmediatamente
        verificarActualizacionesONAPRE();
        
        // Configurar intervalo periódico
        temporizadorActualizacionONAPRE = setInterval(verificarActualizacionesONAPRE, intervaloActualizacionONAPRE);
        
        // También verificar cuando la ventana gana foco
        window.addEventListener('focus', verificarActualizacionesONAPRE);
    }

    // Detener el sistema de actualización ONAPRE
    function detenerVerificadorActualizacionesONAPRE() {
        if (temporizadorActualizacionONAPRE) {
            clearInterval(temporizadorActualizacionONAPRE);
        }
        window.removeEventListener('focus', verificarActualizacionesONAPRE);
    }

    // Función mejorada para mostrar modales
    function mostrarModalBootstrap(elementoModal, opciones = {}) {
        // Limpiar antes de abrir
        limpiarModales();
        
        // Configuración por defecto
        const opcionesPorDefecto = {
            backdrop: true,
            keyboard: true,
            focus: true
        };
        
        // Combinar opciones
        const opcionesModal = {...opcionesPorDefecto, ...opciones};
        
        // Crear instancia del modal
        const modal = new bootstrap.Modal(elementoModal, opcionesModal);
        
        // Mostrar el modal
        modal.show();
        
        // Manejar el cierre
        const manejarCierre = () => {
            elementoModal.removeEventListener('hidden.bs.modal', manejarCierre);
            limpiarModales();
        };
        
        elementoModal.addEventListener('hidden.bs.modal', manejarCierre);
        
        return modal;
    }

    // Inicializar la tabla ONAPRE
    mostrarCargosONAPRE(paginaActualONAPRE);

    // Iniciar el sistema de actualización en tiempo real
    iniciarVerificadorActualizacionesONAPRE();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', detenerVerificadorActualizacionesONAPRE);

    window.addEventListener('beforeunload', function() {
        detenerVerificadorActualizacionesONAPRE();
        limpiarModales();
        modalEliminacionActual = null;
    });
});