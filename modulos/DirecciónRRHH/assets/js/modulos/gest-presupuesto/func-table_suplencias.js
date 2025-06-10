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
    let totalSuplencias = 0;
    let totalPaginas = 1;
    const cuerpoTabla = document.querySelector('#supplementTable tbody');
    const elementoPaginacion = document.getElementById('paginationSupplement');

    // Variables para el control de actualización en tiempo real
    let ultimoTimestampActualizacionSupl = null;
    let intervaloActualizacionSupl = 1000; // 1 segundo
    let temporizadorActualizacionSupl = null;
    let actualizandoSupl = false;

    // Función para cargar las suplencias desde la API
    async function obtenerSuplencias(pagina) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_suplencias-hist.php?page=${pagina}&per_page=${filasPorPagina}`);
            const datos = await respuesta.json();
            
            if (datos.success) {
                totalSuplencias = datos.total;
                totalPaginas = datos.total_pages;
                return {
                    suplencias: datos.supplements,
                    total: datos.total,
                    total_pages: datos.total_pages
                };
            } else {
                console.error('Error al cargar suplencias:', datos.message);
                smallSwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar las suplencias',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return {
                    suplencias: [],
                    total: 0,
                    total_pages: 0
                };
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
            return {
                suplencias: [],
                total: 0,
                total_pages: 0
            };
        }
    }

    // Función para mostrar las suplencias en la página actual
    async function mostrarSuplencias(pagina) {
        // Mostrar loader mientras carga
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        const resultado = await obtenerSuplencias(pagina);
        const suplencias = resultado.suplencias;
        totalSuplencias = resultado.total;
        totalPaginas = resultado.total_pages;
        
        cuerpoTabla.innerHTML = '';
        
        if (suplencias.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < filasPorPagina; i++) {
                const fila = document.createElement('tr');
                if (i === 0) {
                    fila.innerHTML = `
                        <td colspan="9" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron registros' : '&nbsp;'}
                        </td>
                    `;
                } else {
                    fila.innerHTML = '<td colspan="9" class="empty-row">&nbsp;</td>';
                }
                cuerpoTabla.appendChild(fila);
            }
            
            // Actualizar paginación para reflejar que no hay datos
            configurarPaginacion();
            return;
        }

        // Llenar con datos reales
        suplencias.forEach(suplencia => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${suplencia.nom_ced}</td>
                <td>${suplencia.nom_nom || 'No disponible'}</td>
                <td>${suplencia.sup_fec_ini || 'No disponible'}</td>
                <td>${suplencia.cet_car || 'No asignado'}</td>
                <td>${suplencia.ona_car || 'No asignado'}</td>
                <td>${suplencia.nvl_ran || 'No asignado'}</td>
                <td>${suplencia.dep_nom || 'No asignado'}</td>
                <td>
                    <span class="badge ${suplencia.sup_activa ? 'bg-label-success' : 'bg-label-secondary'}">
                        ${suplencia.sup_activa ? 'Activa' : 'Inactiva'}
                    </span>
                </td>
                <td>
                    <div class="dropdown">
                        <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                            <i class="bx bx-dots-vertical-rounded"></i>
                        </button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item edit-supplement-btn" href="javascript:void(0);" data-sup_ide="${suplencia.sup_ide}">
                                <i class="bx bx-edit-alt me-1"></i> Editar
                            </a>
                            <a class="dropdown-item delete-supplement-btn" href="javascript:void(0);" data-sup_ide="${suplencia.sup_ide}" data-nom_nom="${suplencia.nom_nom || 'empleado'}">
                                <i class="bx bx-trash me-1"></i> Eliminar
                            </a>
                        </div>
                    </div>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });

        // Completar con filas vacías si no llega a filasPorPagina
        if (suplencias.length < filasPorPagina) {
            const filasRestantes = filasPorPagina - suplencias.length;
            for (let i = 0; i < filasRestantes; i++) {
                const fila = document.createElement('tr');
                fila.innerHTML = '<td colspan="9" class="empty-row">&nbsp;</td>';
                cuerpoTabla.appendChild(fila);
            }
        }

        // Configurar eventos para los botones
        configurarEventos();
        
        // Actualizar paginación
        configurarPaginacion();
    }

    // Función para configurar los event listeners
    function configurarEventos() {
        // Agregar event listeners para los botones de editar
        document.querySelectorAll('.edit-supplement-btn').forEach(boton => {
            boton.addEventListener('click', async function() {
                const sup_ide = this.getAttribute('data-sup_ide');
                try {
                    const respuesta = await fetch(`../PHP/api/gest-presupuesto/detalles_suplencias-hist.php?sup_ide=${sup_ide}`);
                    const datos = await respuesta.json();
                    
                    if (datos.success) {
                        abrirModalEdicion(datos.supplement);
                    } else {
                        alert('No se pudieron cargar los datos de la suplencia');
                    }
                } catch (error) {
                    console.error('Error al cargar detalles:', error);
                    alert('Error al cargar los detalles de la suplencia');
                }
            });
        });

        // Agregar event listeners para los botones de eliminar
        document.querySelectorAll('.delete-supplement-btn').forEach(boton => {
            boton.addEventListener('click', function() {
                const sup_ide = this.getAttribute('data-sup_ide');
                const nom_nom = this.getAttribute('data-nom_nom');
                mostrarConfirmacionEliminacion(sup_ide, nom_nom);
            });
        });
    }

    // Función para mostrar confirmación de eliminación
    function mostrarConfirmacionEliminacion(sup_ide, nom_nom) {
        smallSwal.fire({
            title: '¿Eliminar suplencia?',
            html: `¿Seguro de eliminar la suplencia del empleado <strong>${nom_nom}</strong>?<br><br><span class="text-danger">¡Esta acción no se puede deshacer!</span>`,
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
                    title: 'Eliminando suplencia',
                    html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" style="width: 100%; height: 100%;"></div></div>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        smallSwal.showLoading();
                    }
                });
                
                await eliminarSuplencia(sup_ide);
            }
        });
    }

    // Función para eliminar una suplencia
    async function eliminarSuplencia(sup_ide) {
        try {
            const respuesta = await fetch('../PHP/api/gest-presupuesto/eliminar_suplencias-hist.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sup_ide: sup_ide })
            });
            
            const resultado = await respuesta.json();
            
            if (!respuesta.ok) {
                throw new Error(resultado.message || `Error HTTP: ${respuesta.status}`);
            }
            
            if (resultado.success) {
                // Cerrar cualquier alerta abierta
                smallSwal.close();
                
                // Verificar si debemos cambiar de página
                if (paginaActual > 1 && (totalSuplencias - 1) <= ((paginaActual - 1) * filasPorPagina)) {
                    paginaActual--;
                }
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Eliminada!',
                    text: resultado.message || 'Suplencia eliminada correctamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar la tabla
                    await mostrarSuplencias(paginaActual);
                });
            } else {
                throw new Error(resultado.message || 'Error al eliminar la suplencia');
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
                mostrarSuplencias(paginaActual);
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
                mostrarSuplencias(paginaActual);
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
                    mostrarSuplencias(paginaActual);
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
                mostrarSuplencias(paginaActual);
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
                mostrarSuplencias(paginaActual);
            }
        });
        elementoPaginacion.appendChild(li);
    }

    // Función para abrir el modal de edición con datos (VERSIÓN FINAL MEJORADA)
    async function abrirModalEdicion(datosSuplencia) {
        // Llenar los campos del formulario con los datos de la suplencia
        document.getElementById('empleadoNombre').value = datosSuplencia.nom_nom || '';
        document.getElementById('empleadoCedula').value = datosSuplencia.nom_ced || '';
        document.getElementById('fechaInicio').value = datosSuplencia.sup_fec_ini || '';
        document.getElementById('cargoCet').value = datosSuplencia.cet_car || 'No asignado';
        document.getElementById('cargoOnapre').value = datosSuplencia.ona_car || 'No asignado';
        document.getElementById('nivelSalarial').value = datosSuplencia.nvl_ran || 'No asignado';
        document.getElementById('departamento').value = datosSuplencia.dep_nom || 'No asignado';
        document.getElementById('estadoSuplencia').checked = datosSuplencia.sup_activa == 1;

        // Configurar el botón de guardar con los datos originales
        const botonGuardar = document.querySelector('#ModalSuplencia .btn-primary');
        botonGuardar.onclick = async function() {
            await actualizarSuplencia(datosSuplencia.sup_ide, {
                sup_fec_ini: datosSuplencia.sup_fec_ini,
                sup_activa: datosSuplencia.sup_activa
            });
        };

        // Mostrar el modal
        const modalEdicion = new bootstrap.Modal(document.getElementById('ModalSuplencia'));
        modalEdicion.show();
    }

    // Función auxiliar para obtener datos
    async function obtenerDatos(url, claveDatos) {
        try {
            const respuesta = await fetch(url);
            const datos = await respuesta.json();
            return datos.success ? datos[claveDatos] : null;
        } catch (error) {
            console.error(`Error al cargar datos de ${url}:`, error);
            return null;
        }
    }

    // Función auxiliar para llenar selects
    function llenarSelect(elementoSelect, items, campoValor, campoTexto, valorSeleccionado) {
        elementoSelect.innerHTML = '<option value=""></option>';
        
        items.forEach(item => {
            const opcion = document.createElement('option');
            opcion.value = item[campoValor];
            opcion.textContent = `${item[campoTexto]} - ${item[campoValor]}`;
            if (valorSeleccionado && item[campoValor] == valorSeleccionado) {
                opcion.selected = true;
            }
            elementoSelect.appendChild(opcion);
        });
    }

    // Función para actualizar una suplencia
    async function actualizarSuplencia(sup_ide, datosOriginales) {
        // Validar antes de proceder
        if (!validarFormularioEdicionSuplencia()) {
            return;
        }

        const botonGuardar = document.querySelector('#ModalSuplencia .btn-primary');
        const textoOriginal = botonGuardar.innerHTML;
        
        botonGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        botonGuardar.disabled = true;
        
        try {
            const nuevoEstadoActivo = document.getElementById('estadoSuplencia').checked ? 1 : 0;
            const nuevaFechaInicio = document.getElementById('fechaInicio').value;
            const hoy = new Date().toISOString().split('T')[0];
            
            const estadoCambio = datosOriginales.sup_activa !== nuevoEstadoActivo;
            
            const datosActualizados = {
                sup_ide: sup_ide,
                nom_ced: document.getElementById('empleadoCedula').value,
                sup_fec_ini: nuevaFechaInicio,
                sup_activa: nuevoEstadoActivo,
                sup_fec_fin: (datosOriginales.sup_activa === 1 && nuevoEstadoActivo === 0) ? hoy : null,
                original_fec_ini: datosOriginales.sup_fec_ini,
                original_activa: datosOriginales.sup_activa
            };

            const fechaCambio = datosOriginales.sup_fec_ini !== nuevaFechaInicio;
            if (!estadoCambio && !fechaCambio) {
                smallSwal.fire({
                    icon: 'info',
                    title: 'Sin cambios',
                    text: 'No se detectaron cambios en los campos editables',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            const respuesta = await fetch('../PHP/api/gest-presupuesto/actualizar_suplencias-hist.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosActualizados)
            });
            
            const resultado = await respuesta.json();
            
            if (resultado.success) {
                bootstrap.Modal.getInstance(document.getElementById('ModalSuplencia')).hide();
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'Cambios guardados exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar la tabla
                    await mostrarSuplencias(paginaActual);
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
            botonGuardar.innerHTML = textoOriginal;
            botonGuardar.disabled = false;
        }
    }

    // Función para abrir el modal de nueva suplencia
    async function abrirModalNuevaSuplencia() {
        // Cargar los datos necesarios para el formulario
        const [empleados, cargosCet, cargosOnapre, departamentos] = await Promise.all([
            obtenerDatos('../PHP/api/gest-presupuesto/carga_empleados.php', 'empleados'),
            obtenerDatos('../PHP/api/gest-presupuesto/carga_cargos_cet.php', 'cargos'),
            obtenerDatos('../PHP/api/gest-presupuesto/carga_cargos_onapre.php', 'cargos'),
            obtenerDatos('../PHP/api/gest-presupuesto/carga_departamentos.php', 'departamentos')
        ]);

        if (!empleados || !cargosCet || !cargosOnapre || !departamentos) {
            alert('No se pudieron cargar los datos necesarios para el formulario');
            return;
        }

        // Llenar el select de empleados
        llenarSelect(document.getElementById('nuevoEmpleadoSelect'), empleados, 'nom_ced', 'nom_nom');

        // Inicializar Select2 para el select de empleados
        $('#nuevoEmpleadoSelect').select2({
            theme: 'bootstrap-5',
            placeholder: 'Buscar empleado...',
            allowClear: true,
            width: '100%',
            dropdownParent: $('#ModalNuevaSuplencia'),
            language: {
                noResults: function() {
                    return "No se encontraron empleados";
                }
            },
            templateResult: function(empleado) {
                // Si es el placeholder
                if (!empleado.id) return empleado.text;
                
                // Buscar el empleado en los datos cargados
                const emp = empleados.find(e => e.nom_ced === empleado.id);
                if (!emp) return empleado.text;
                
                // Mostrar nombre y cédula
                return $('<span>').text(`${emp.nom_nom} - ${emp.nom_ced}`);
            },
            templateSelection: function(empleado) {
                // Cómo se muestra el elemento seleccionado
                if (!empleado.id) return empleado.text;
                
                const emp = empleados.find(e => e.nom_ced === empleado.id);
                if (!emp) return empleado.text;
                
                return $('<span>').text(`${emp.nom_nom} - ${emp.nom_ced}`);
            }
        });

        // Configurar el resto del formulario
        llenarSelect(document.getElementById('nuevoCargoCetSelect'), cargosCet, 'cet_ide', 'cet_car');
        llenarSelect(document.getElementById('nuevoCargoOnapreSelect'), cargosOnapre, 'ona_ide', 'ona_car');
        llenarSelect(document.getElementById('nuevoDepartamentoSelect'), departamentos, 'dep_ide', 'dep_nom');

        configurarLogicaNivelSalarial();

        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('nuevaFechaInicio').value = hoy;

        document.getElementById('confirmarNuevaSuplencia').onclick = crearNuevaSuplencia;

        const nuevoModal = new bootstrap.Modal(document.getElementById('ModalNuevaSuplencia'));
        nuevoModal.show();

        // Manejar el cierre del modal
        $('#ModalNuevaSuplencia').on('hidden.bs.modal', function () {
            $('#nuevoEmpleadoSelect').select2('destroy');
        });
    }

    // Función para crear una nueva suplencia
    async function crearNuevaSuplencia() {
        // Validar antes de proceder
        if (!validarFormularioNuevaSuplencia()) {
            return;
        }

        const botonGuardar = document.getElementById('confirmarNuevaSuplencia');
        const textoOriginal = botonGuardar.innerHTML;
        
        botonGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        botonGuardar.disabled = true;
        
        try {
            const nuevosDatos = {
                nom_ced: document.getElementById('nuevoEmpleadoSelect').value,
                sup_fec_ini: document.getElementById('nuevaFechaInicio').value,
                cet_ide: document.getElementById('nuevoCargoCetSelect').value || null,
                ona_ide: document.getElementById('nuevoCargoOnapreSelect').value || null,
                nvl_ran: document.getElementById('nuevoNivelSalarial').value || null,
                dep_ide: document.getElementById('nuevoDepartamentoSelect').value || null,
                sup_activa: document.getElementById('nuevoEstadoSuplencia').checked ? 1 : 0
            };

            const respuesta = await fetch('../PHP/api/gest-presupuesto/agregar_suplencia.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevosDatos)
            });
            
            const textoRespuesta = await respuesta.text();
            let resultado;
            try {
                resultado = JSON.parse(textoRespuesta);
            } catch (e) {
                console.error('Respuesta no es JSON válido:', textoRespuesta);
                throw new Error('Respuesta inesperada del servidor');
            }
            
            if (resultado.success) {
                bootstrap.Modal.getInstance(document.getElementById('ModalNuevaSuplencia')).hide();
                
                // Mostrar mensaje de éxito
                smallSwal.fire({
                    icon: 'success',
                    title: '¡Creada!',
                    text: 'Suplencia creada correctamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    paginaActual = 1;
                    await mostrarSuplencias(paginaActual);
                });
            } else {
                throw new Error(resultado.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error completo:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al crear: ' + error.message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
        } finally {
            botonGuardar.innerHTML = textoOriginal;
            botonGuardar.disabled = false;
        }
    }

    // Función para configurar la lógica de niveles salariales
    function configurarLogicaNivelSalarial() {
        // Definir los cargos especiales que solo permiten nivel I
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

        // Escuchar cambios en el select de Cargo ONAPRE
        document.getElementById('nuevoCargoOnapreSelect').addEventListener('change', function() {
            const cargoSeleccionado = this.options[this.selectedIndex].text.trim();
            const selectNivelSalarial = document.getElementById('nuevoNivelSalarial');
            
            if (cargosEspeciales.includes(cargoSeleccionado)) {
                // Si es un cargo especial, mostrar solo opción I
                selectNivelSalarial.innerHTML = '<option value="I">I</option>';
            } else {
                // Si no es un cargo especial, mostrar todas las opciones
                selectNivelSalarial.innerHTML = `
                    <option value="">Seleccione</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                    <option value="V">V</option>
                    <option value="VI">VI</option>
                    <option value="VII">VII</option>
                `;
            }
        });

        // También validar al cargar la página si ya hay un valor seleccionado
        if (document.getElementById('nuevoCargoOnapreSelect').value) {
            document.getElementById('nuevoCargoOnapreSelect').dispatchEvent(new Event('change'));
        }
    }

    // Función para validar los campos del modal de nueva suplencia
    function validarFormularioNuevaSuplencia() {
        const empleado = document.getElementById('nuevoEmpleadoSelect').value;
        const fechaInicio = document.getElementById('nuevaFechaInicio').value;
        const cargoCet = document.getElementById('nuevoCargoCetSelect').value;
        const cargoOnapre = document.getElementById('nuevoCargoOnapreSelect').value;
        const nivelSalarial = document.getElementById('nuevoNivelSalarial').value;
        const departamento = document.getElementById('nuevoDepartamentoSelect').value;
        const estadoSuplencia = document.getElementById('nuevoEstadoSuplencia').checked;

        // Validar campos obligatorios
        if (!empleado) {
            mostrarErrorValidacion('nuevoEmpleadoSelect', 'Debe seleccionar un empleado');
            return false;
        }
        
        if (!fechaInicio) {
            mostrarErrorValidacion('nuevaFechaInicio', 'Debe seleccionar una fecha de inicio');
            return false;
        }
        
        if (!cargoCet) {
            mostrarErrorValidacion('nuevoCargoCetSelect', 'Debe seleccionar un cargo CET');
            return false;
        }
        
        if (!cargoOnapre) {
            mostrarErrorValidacion('nuevoCargoOnapreSelect', 'Debe seleccionar un cargo ONAPRE');
            return false;
        }
        
        if (!nivelSalarial) {
            mostrarErrorValidacion('nuevoNivelSalarial', 'Debe seleccionar un nivel salarial');
            return false;
        }
        
        if (!departamento) {
            mostrarErrorValidacion('nuevoDepartamentoSelect', 'Debe seleccionar un departamento');
            return false;
        }

        // Validar fecha no sea futura (opcional)
        const hoy = new Date();
        const fechaSeleccionada = new Date(fechaInicio);
        if (fechaSeleccionada > hoy) {
            mostrarErrorValidacion('nuevaFechaInicio', 'La fecha no puede ser futura');
            return false;
        }

        return true;
    }

    // Función para validar los campos del modal de edición
    function validarFormularioEdicionSuplencia() {
        const fechaInicio = document.getElementById('fechaInicio').value;
        const estadoSuplencia = document.getElementById('estadoSuplencia').checked;

        if (!fechaInicio) {
            mostrarErrorValidacion('fechaInicio', 'Debe seleccionar una fecha de inicio');
            return false;
        }

        // Validar fecha no sea futura (opcional)
        const hoy = new Date();
        const fechaSeleccionada = new Date(fechaInicio);
        if (fechaSeleccionada > hoy) {
            mostrarErrorValidacion('fechaInicio', 'La fecha no puede ser futura');
            return false;
        }

        return true;
    }

    // Función para mostrar errores de validación
    function mostrarErrorValidacion(idElemento, mensaje) {
        const elemento = document.getElementById(idElemento);
        const idFeedback = `${idElemento}-feedback`;
        
        // Remover feedback existente si lo hay
        const feedbackExistente = document.getElementById(idFeedback);
        if (feedbackExistente) {
            feedbackExistente.remove();
        }
        
        // Agregar clase de error al input
        elemento.classList.add('is-invalid');
        
        // Crear elemento de feedback
        const feedback = document.createElement('div');
        feedback.id = idFeedback;
        feedback.className = 'invalid-feedback';
        feedback.textContent = mensaje;
        
        // Insertar después del elemento
        elemento.parentNode.appendChild(feedback);
        
        // Hacer scroll al primer error
        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
        elemento.focus();
    }

    // Función para limpiar validaciones
    function limpiarValidaciones() {
        // Para el modal de nueva suplencia
        const elementosModalNuevo = [
            'nuevoEmpleadoSelect', 'nuevaFechaInicio', 'nuevoCargoCetSelect',
            'nuevoCargoOnapreSelect', 'nuevoNivelSalarial', 'nuevoDepartamentoSelect'
        ];
        
        elementosModalNuevo.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.classList.remove('is-invalid');
                const feedback = document.getElementById(`${id}-feedback`);
                if (feedback) feedback.remove();
            }
        });
        
        // Para el modal de edición
        const elementosModalEdicion = ['fechaInicio'];
        elementosModalEdicion.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.classList.remove('is-invalid');
                const feedback = document.getElementById(`${id}-feedback`);
                if (feedback) feedback.remove();
            }
        });
    }

    document.getElementById('ModalNuevaSuplencia').addEventListener('hidden.bs.modal', limpiarValidaciones);
    document.getElementById('ModalSuplencia').addEventListener('hidden.bs.modal', limpiarValidaciones);

    document.getElementById('nuevoEmpleadoSelect')?.addEventListener('change', function() {
        if (this.value) {
            this.classList.remove('is-invalid');
            const feedback = document.getElementById(`${this.id}-feedback`);
            if (feedback) feedback.remove();
        }
    });

    document.getElementById('nuevaFechaInicio')?.addEventListener('change', function() {
        if (this.value) {
            this.classList.remove('is-invalid');
            const feedback = document.getElementById(`${this.id}-feedback`);
            if (feedback) feedback.remove();
        }
    });

    // Función para verificar cambios en bit_sup
    async function verificarActualizacionesSupl() {
        if (actualizandoSupl) return;
        actualizandoSupl = true;
        
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/check_suplencias_updates.php?last_update=${ultimoTimestampActualizacionSupl || ''}`);
            const datos = await respuesta.json();
            
            if (datos.success && datos.has_changes) {
                ultimoTimestampActualizacionSupl = datos.last_update;
                
                // Actualizar la tabla con animación suave
                await actualizarTablaSuplenciasSuavemente();
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones de suplencias:', error);
        } finally {
            actualizandoSupl = false;
        }
    }

    // Función para actualizar la tabla con animación suave
    async function actualizarTablaSuplenciasSuavemente() {
        // Agregar clase de transición a la tabla
        const tabla = document.getElementById('supplementTable');
        tabla.classList.add('table-updating');
        
        // Mostrar indicador de actualización
        const indicadorActualizacion = document.createElement('div');
        tabla.parentNode.insertBefore(indicadorActualizacion, tabla);
        
        // Pequeño retraso para que se vea el indicador
        await new Promise(resolver => setTimeout(resolver, 300));
        
        // Recargar datos
        await mostrarSuplencias(paginaActual);
        
        // Ocultar indicador y quitar clase de transición
        indicadorActualizacion.remove();
        tabla.classList.remove('table-updating');
        
        // Mostrar notificación de actualización
        mostrarNotificacionActualizacionSupl();
    }

    // Función para mostrar notificación de actualización
    function mostrarNotificacionActualizacionSupl() {
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
            title: 'Suplencias actualizadas',
            background: '#f8f9fa',
            color: '#333'
        });
    }

    // Iniciar el sistema de actualización periódica
    function iniciarVerificadorActualizacionesSupl() {
        // Verificar actualizaciones inmediatamente
        verificarActualizacionesSupl();
        
        // Configurar intervalo periódico
        temporizadorActualizacionSupl = setInterval(verificarActualizacionesSupl, intervaloActualizacionSupl);
        
        // También verificar cuando la ventana gana foco
        window.addEventListener('focus', verificarActualizacionesSupl);
    }

    // Detener el sistema de actualización
    function detenerVerificadorActualizacionesSupl() {
        if (temporizadorActualizacionSupl) {
            clearInterval(temporizadorActualizacionSupl);
        }
        window.removeEventListener('focus', verificarActualizacionesSupl);
    }

    // Event listener para el botón de nueva suplencia
    document.getElementById('ModalnuevaSuplencia').addEventListener('click', abrirModalNuevaSuplencia);

    // Inicializar la tabla
    mostrarSuplencias(paginaActual);

    // Iniciar el sistema de actualización en tiempo real
    iniciarVerificadorActualizacionesSupl();
    
    // Detener el checker cuando la página se cierra/recarga
    window.addEventListener('beforeunload', detenerVerificadorActualizacionesSupl);
});