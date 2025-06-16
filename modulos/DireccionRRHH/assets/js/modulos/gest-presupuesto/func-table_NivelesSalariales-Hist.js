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
})

document.addEventListener('DOMContentLoaded', function() {
    // Variables para la paginación
    const filasPorPagina = 7;
    let paginaActual = 1;
    let totalSalarios = 0;
    let totalPaginas = 1;
    const cuerpoTabla = document.querySelector('#salaryTable tbody');
    const elementoPaginacion = document.getElementById('paginationSalary');

    // Función para cargar los niveles salariales desde la API
    async function obtenerSalarios(pagina) {
        try {
            const respuesta = await fetch(`../PHP/api/gest-presupuesto/imprimir_salarios-hist.php?page=${pagina}&per_page=${filasPorPagina}`);
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
                smallSwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los registros históricos',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return {
                    salarios: [],
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
                salarios: [],
                total: 0,
                total_pages: 0
            };
        }
    }

    // Función para mostrar los niveles salariales en la página actual
    async function mostrarSalarios(pagina) {
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
        
        const resultado = await obtenerSalarios(pagina);
        const salarios = resultado.salarios;
        totalSalarios = resultado.total;
        totalPaginas = resultado.total_pages;
        
        cuerpoTabla.innerHTML = '';
        
        if (salarios.length === 0) {
            // Crear filas vacías para mantener la altura
            for (let i = 0; i < filasPorPagina; i++) {
                const fila = document.createElement('tr');
                if (i === 0) {
                    fila.innerHTML = `
                        <td colspan="4" class="text-center empty-row">
                            ${i === 0 ? 'No se encontraron registros' : '&nbsp;'}
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
            
            // Convertir la fecha de yyyy-mm-dd a dd/mm/yyyy
            let fechaFormateada = 'Sin fecha asignada';
            if (salario.nvl_fec) {
                const partesFecha = salario.nvl_fec.split('-');
                if (partesFecha.length === 3) {
                    fechaFormateada = `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`;
                }
            }
            
            fila.innerHTML = `
                <td>${salario.nvl_ran}</td>
                <td>${salario.nvl_sal.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>${salario.ona_car || 'Sin cargo asignado'}</td>
                <td>${fechaFormateada}</td>
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

    // Función para configurar los event listeners
    function configurarEventos() {
        // event listeners para los botones de editar
        document.querySelectorAll('.edit-salary-btn').forEach(boton => {
            boton.addEventListener('click', async function() {
                const nvl_ide = this.getAttribute('data-nvl_ide');
                try {
                    const respuesta = await fetch(`../PHP/api/gest-presupuesto/detalles_salarios-hist.php?nvl_ide=${nvl_ide}`);
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
                mostrarSalarios(paginaActual);
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
                mostrarSalarios(paginaActual);
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
                    mostrarSalarios(paginaActual);
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
                mostrarSalarios(paginaActual);
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
                mostrarSalarios(paginaActual);
            }
        });
        elementoPaginacion.appendChild(li);
    }

    // Función para abrir el modal de edición con datos
    async function abrirModalEdicion(datosSalario) {
        try {
            // Mostrar loader mientras se cargan los cargos ONAPRE
            smallSwal.fire({
                title: 'Cargando datos...',
                html: '<div class="progress" style="height: 4px; background: #e0e0e0; margin-top: 10px;"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%; height: 100%;"></div></div>',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    smallSwal.showLoading();
                }
            });

            // Cargar los cargos ONAPRE primero
            const cargosOnapre = await obtenerCargosOnapre();
            
            // Cerrar el loader
            smallSwal.close();

            if (!cargosOnapre) {
                smallSwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los cargos ONAPRE',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            // Llenar el select de cargos ONAPRE
            const selectOnapre = document.getElementById('OnapreAsig');
            selectOnapre.innerHTML = '<option value="">Seleccione</option>';
            
            cargosOnapre.forEach(cargo => {
                const option = document.createElement('option');
                option.value = cargo.ona_ide;
                option.textContent = cargo.ona_car;
                selectOnapre.appendChild(option);
            });

            // Llenar los campos con los datos del nivel salarial
            document.getElementById('tipoNlvSalarial').value = datosSalario.nvl_ran || '';
            document.getElementById('salarioAsig').value = datosSalario.nvl_sal || '';
            
            // Llenar campo de fecha
            document.getElementById('fechamodificacion').value = datosSalario.nvl_fec || '';

            // Seleccionar el cargo ONAPRE correspondiente
            if (datosSalario.ona_ide) {
                selectOnapre.value = datosSalario.ona_ide;
            }

            // Configurar validaciones en los inputs
            configurarValidacionesInputs();

            // Configurar el botón de guardar
            const botonGuardar = document.querySelector('#ModalNivelSalarial .btn-primary');
            botonGuardar.onclick = async function() {
                if (validarFormulario()) {
                    await actualizarSalario(datosSalario.nvl_ide);
                }
            };

            // Mostrar el modal
            const modalEdicion = new bootstrap.Modal(document.getElementById('ModalNivelSalarial'));
            modalEdicion.show();

        } catch (error) {
            console.error('Error al abrir modal de edición:', error);
            smallSwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar los datos para edición',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
        }
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
                nvl_fec: document.getElementById('fechamodificacion').value,
                ona_ide: document.getElementById('OnapreAsig').value || null
            };

            // Validación básica
            if (!datosActualizados.nvl_ran || !datosActualizados.nvl_sal || !datosActualizados.nvl_fec) {
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
            const respuesta = await fetch('../PHP/api/gest-presupuesto/actualizar_salarios-hist.php', {
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
                    text: 'Cambios en el registro histórico guardados exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                }).then(async () => {
                    // Recargar los datos
                    await mostrarSalarios(paginaActual);
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

    // Función para configurar las validaciones de los inputs
    function configurarValidacionesInputs() {
        const inputTipoNivel = document.getElementById('tipoNlvSalarial');
        const inputSalario = document.getElementById('salarioAsig');
        const selectOnapre = document.getElementById('OnapreAsig');
        const inputFecha = document.getElementById('fechamodificacion');

        // Validación para Tipo de Nivel Salarial (solo letras, máximo 5 caracteres)
        inputTipoNivel.addEventListener('input', function(e) {
            // Eliminar cualquier carácter que no sea letra
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g, '');
            
            // Limitar a 5 caracteres
            if (this.value.length > 5) {
                this.value = this.value.substring(0, 5);
            }
        });

        // Validación para Salario Correspondiente (solo números, máximo 10 dígitos, máximo 2 decimales)
        inputSalario.addEventListener('input', function(e) {
            // Eliminar cualquier carácter que no sea número o punto decimal
            this.value = this.value.replace(/[^0-9.]/g, '');
            
            // Limitar a 10 caracteres en total
            if (this.value.length > 10) {
                this.value = this.value.substring(0, 10);
            }
            
            // Manejar decimales
            if ((this.value.match(/\./g) || []).length > 1) {
                // Si hay más de un punto, eliminar el último ingresado
                this.value = this.value.substring(0, this.value.length - 1);
            }
            
            // Limitar a 2 decimales
            const partes = this.value.split('.');
            if (partes.length > 1 && partes[1].length > 2) {
                this.value = partes[0] + '.' + partes[1].substring(0, 2);
            }
        });

        // Validación para evitar que se pegue texto no válido
        inputTipoNivel.addEventListener('paste', function(e) {
            e.preventDefault();
        });

        inputSalario.addEventListener('paste', function(e) {
            e.preventDefault();
        });
    }

    // Función para validar el formulario antes de enviar
    function validarFormulario() {
        const inputTipoNivel = document.getElementById('tipoNlvSalarial');
        const inputSalario = document.getElementById('salarioAsig');
        const selectOnapre = document.getElementById('OnapreAsig');
        const inputFecha = document.getElementById('fechamodificacion');
        let esValido = true;

        // Validar Tipo de Nivel Salarial
        if (!inputTipoNivel.value.trim()) {
            smallSwal.fire({
                icon: 'error',
                title: 'Campo requerido',
                text: 'Por favor ingrese el Tipo de Nivel Salarial',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            inputTipoNivel.focus();
            return false;
        }

        // Validar Salario Correspondiente
        if (!inputSalario.value.trim()) {
            smallSwal.fire({
                icon: 'error',
                title: 'Campo requerido',
                text: 'Por favor ingrese el Salario Correspondiente',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            inputSalario.focus();
            return false;
        }

        // Validar que el salario sea un número válido
        if (isNaN(parseFloat(inputSalario.value))) {
            smallSwal.fire({
                icon: 'error',
                title: 'Valor inválido',
                text: 'Por favor ingrese un valor numérico válido para el salario',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            inputSalario.focus();
            return false;
        }

        // Validar Cargo ONAPRE
        if (!selectOnapre.value) {
            smallSwal.fire({
                icon: 'error',
                title: 'Selección requerida',
                text: 'Por favor seleccione un Cargo ONAPRE',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            selectOnapre.focus();
            return false;
        }

        // Validar Fecha de Modificación
        if (!inputFecha.value) {
            smallSwal.fire({
                icon: 'error',
                title: 'Fecha requerida',
                text: 'Por favor ingrese la Fecha de Modificación',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            inputFecha.focus();
            return false;
        }

        return true;
    }

    // Inicializar la tabla
    mostrarSalarios(paginaActual);
});