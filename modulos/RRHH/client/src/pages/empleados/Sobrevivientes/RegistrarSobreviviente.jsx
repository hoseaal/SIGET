import React, { useState, useEffect, useRef } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../../components/atoms/Buttons';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import FormFeedback from '../../../components/atoms/FormFeedback';
import { useSelectsDependientes } from '../../../hooks/useSelectsDependientes';
import {
    crearFeedbackDeError,
    detectarErrorDeBD,
    leerRespuestaJson,
    mensajeParaCampo,
    obtenerCamposAfectados,
    obtenerMensajeDeExcepcion,
    obtenerMensajeError
} from '../../../utils/formErrors';

const FECHA_HOY = new Date().toISOString().split('T')[0];

const FORMULARIO_INICIAL = {
    // ── Datos Personales (tabla empleados) ──
    cedula: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    genero: '',
    direccion_habitacion: '',
    profesion_id: '',
    prima_profesional_id: '',

    // ── Datos Laborales ──
    fecha_ingreso: '',
    cargo_cet_id: '',
    cargo_onapre_id: '',
    condicion_laboral_id: '',
    nivel_salarial_id: '',
    direccion_id: '',
    division_id: '',
    unidad_id: '',

    // ── Datos del Familiar Sobreviviente ──
    familiar_cedula: '',
    familiar_nombres: '',
    familiar_apellidos: '',
    familiar_fecha_nacimiento: '',
    familiar_parentesco: '',
    familiar_direccion: '',
    familiar_telefono: '',
    familiar_cuenta_bancaria: '',
    familiar_fecha_ingreso_beneficio: '',
    familiar_observacion: '',
};

const REGLAS_CAMPOS_SERVIDOR = [
    { patron: /familiar.*c[eé]dula|c[eé]dula.*familiar/i, campo: 'familiar_cedula' },
    { patron: /familiar.*nombres?|nombres?.*familiar/i, campo: 'familiar_nombres' },
    { patron: /familiar.*apellidos?|apellidos?.*familiar/i, campo: 'familiar_apellidos' },
    { patron: /familiar.*fecha.*nacimiento|fecha.*nacimiento.*familiar|mayor.*18|mayor[ií]a.*edad/i, campo: 'familiar_fecha_nacimiento' },
    { patron: /cuenta.*bancaria/i, campo: 'familiar_cuenta_bancaria' },
    { patron: /c[eé]dula/i, campo: 'cedula' },
    { patron: /nombres?/i, campo: 'nombres' },
    { patron: /apellidos?/i, campo: 'apellidos' },
    { patron: /fecha.*nacimiento/i, campo: 'fecha_nacimiento' },
    { patron: /profesi[oó]n/i, campo: 'profesion_id' },
    { patron: /direcci[oó]n/i, campo: 'direccion_habitacion' }
];

const PASO_POR_CAMPO = {
    cedula: 1, nombres: 1, apellidos: 1, fecha_nacimiento: 1,
    genero: 1, direccion_habitacion: 1,
    profesion_id: 2, prima_profesional_id: 2, fecha_ingreso: 2,
    cargo_cet_id: 2, cargo_onapre_id: 2, condicion_laboral_id: 2,
    nivel_salarial_id: 2, direccion_id: 2, division_id: 2, unidad_id: 2,
    familiar_cedula: 3, familiar_nombres: 3, familiar_apellidos: 3,
    familiar_fecha_nacimiento: 3, familiar_parentesco: 3,
    familiar_direccion: 3, familiar_telefono: 3,
    familiar_cuenta_bancaria: 3, familiar_fecha_ingreso_beneficio: 3,
    familiar_observacion: 3, cuenta_bancaria: 3
};

// Componente para registrar nuevos sobrevivientes
const RegistrarSobreviviente = ({ show, handleClose, onSaveStart, onSaveEnd }) => {
    const [paso, setPaso] = useState(1);
    const [guardando, setGuardando] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [erroresCampos, setErroresCampos] = useState({});
    const bodyRef = useRef(null);

    const [formData, setFormData] = useState(() => ({ ...FORMULARIO_INICIAL }));

    const [catalogos, setCatalogos] = useState({
        profesiones: [],
        primasProfesionales: [],
        cargosCET: [],
        cargosONAPRE: [],
        condicionesLaborales: [],
        niveles: [],
        direcciones: [],
        divisiones: [],
        unidades: [],
    });

    // Hook de selects dependientes
    const {
        cargosCETFiltrados,
        divisionesFiltradas,
        unidadesFiltradas,
        tieneDivisiones,
        tieneUnidades,
    } = useSelectsDependientes(formData, catalogos);

    // Cargar catálogos al abrir el modal
    useEffect(() => {
        if (!show) return;

        const fetchCatalogos = async () => {
            try {
                const [proRes, primasProfRes, cetRes, onaRes, dirRes, condRes, divRes, uniRes] = await Promise.all([
                    fetch('/api/rrhh/profesiones'),
                    fetch('/api/rrhh/primas-profesionalizacion'),
                    fetch('/api/rrhh/cargos-cet'),
                    fetch('/api/rrhh/cargos-onapre'),
                    fetch('/api/rrhh/direcciones'),
                    fetch('/api/rrhh/condiciones-laborales'),
                    fetch('/api/rrhh/divisiones'),
                    fetch('/api/rrhh/unidades'),
                ]);

                const [profesiones, primasProfesionales, cargosCET, cargosONAPRE, direcciones, condicionesLaborales, divisiones, unidades] = await Promise.all([
                    proRes.json(), primasProfRes.json(), cetRes.json(), onaRes.json(), dirRes.json(), condRes.json(), divRes.json(), uniRes.json(),
                ]);

                setCatalogos(prev => ({
                    ...prev,
                    profesiones,
                    primasProfesionales,
                    cargosCET,
                    cargosONAPRE,
                    condicionesLaborales,
                    direcciones,
                    divisiones,
                    unidades,
                    niveles: [],
                }));
            } catch (error) {
                console.error('Error cargando catálogos:', error);
                setFeedback({
                    type: 'warning',
                    title: 'No se pudieron cargar las listas desplegables',
                    message: 'Algunos campos no tendrán opciones disponibles. Cierre el modal y vuelva a abrirlo; si el problema persiste, recargue la página.',
                    items: [],
                    hint: 'Mientras tanto puede completar los datos que no dependan de esas listas.'
                });
            }
        };

        fetchCatalogos();
    }, [show]);

    // Limpia los errores de un intento anterior al reabrir el modal.
    useEffect(() => {
        if (!show) return;
        setErroresCampos({});
        setFeedback(prev => (prev?.type === 'warning' ? prev : null));
        setGuardando(false);
    }, [show]);

    // Cascada: Niveles Salariales según Cargo ONAPRE (se mantiene API)
    useEffect(() => {
        const fetch_ = async () => {
            if (!formData.cargo_onapre_id) {
                setCatalogos(prev => ({ ...prev, niveles: [] }));
                return;
            }
            try {
                const res = await fetch(`/api/rrhh/niveles-salariales?cargo_onapre_id=${formData.cargo_onapre_id}`);
                const nivelesData = await res.json();
                const data = nivelesData.success ? nivelesData.data : nivelesData;
                const nivelesFormateados = Array.isArray(data) ? data.map(n => ({
                    ...n,
                    campo_completo: n.campo_completo || `${n.nombre}`.trim()
                })) : [];
                setCatalogos(prev => ({ ...prev, niveles: nivelesFormateados }));
            } catch (e) { console.error('Error niveles:', e); }
        };
        fetch_();
    }, [formData.cargo_onapre_id]);
    // Nota: Divisiones y Unidades se filtran localmente via useSelectsDependientes

    const desplazarAlInicio = () => {
        window.requestAnimationFrame(() => {
            if (bodyRef.current) bodyRef.current.scrollTop = 0;
        });
    };

    const mostrarErrores = (errores, mensaje, titulo = 'Revise los datos del formulario', sugerencia) => {
        setErroresCampos(errores);
        setFeedback(crearFeedbackDeError({ titulo, mensaje, errores, sugerencia }));

        // Si el error está en otro paso, llevamos al usuario hasta ese paso.
        const pasos = Object.keys(errores).map(campo => PASO_POR_CAMPO[campo]).filter(Boolean);
        if (pasos.length > 0) setPaso(Math.min(...pasos));

        desplazarAlInicio();
    };

    const calcularEdad = (fecha) => {
        const birthDate = new Date(`${fecha}T00:00:00`);
        const current = new Date();
        let age = current.getFullYear() - birthDate.getFullYear();
        const m = current.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && current.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const validarPaso1 = () => {
        const errores = {};

        if (!formData.cedula.trim()) {
            errores.cedula = 'La cédula de identidad es obligatoria.';
        }
        if (!formData.nombres.trim()) {
            errores.nombres = 'Los nombres son obligatorios.';
        }
        if (!formData.apellidos.trim()) {
            errores.apellidos = 'Los apellidos son obligatorios.';
        }
        if (formData.fecha_nacimiento && formData.fecha_nacimiento > FECHA_HOY) {
            errores.fecha_nacimiento = 'La fecha de nacimiento no puede ser posterior a la fecha actual.';
        }

        return errores;
    };

    const validarFamiliar = () => {
        const errores = {};

        if (!formData.familiar_nombres.trim()) {
            errores.familiar_nombres = 'Los nombres del familiar son obligatorios.';
        }
        if (!formData.familiar_apellidos.trim()) {
            errores.familiar_apellidos = 'Los apellidos del familiar son obligatorios.';
        }
        if (!formData.familiar_fecha_nacimiento) {
            errores.familiar_fecha_nacimiento = 'La fecha de nacimiento del familiar es obligatoria para verificar su mayoría de edad.';
        } else if (formData.familiar_fecha_nacimiento > FECHA_HOY) {
            errores.familiar_fecha_nacimiento = 'La fecha de nacimiento del familiar no puede ser posterior a la fecha actual.';
        } else if (calcularEdad(formData.familiar_fecha_nacimiento) < 18) {
            errores.familiar_fecha_nacimiento = 'El familiar debe tener al menos 18 años.';
        }
        if (!formData.familiar_cuenta_bancaria.trim()) {
            errores.familiar_cuenta_bancaria = 'La cuenta bancaria del familiar es obligatoria.';
        }

        return errores;
    };

    const validarFormulario = () => ({
        ...validarPaso1(),
        ...validarFamiliar()
    });

    const mostrarErrorServidor = (mensaje) => {
        const errorBD = detectarErrorDeBD(mensaje);
        const errores = {};

        if (errorBD?.campo) {
            const campo = errorBD.campo === 'cuenta_bancaria' ? 'familiar_cuenta_bancaria' : errorBD.campo;
            errores[campo] = errorBD.mensaje;
        }

        const campos = obtenerCamposAfectados(mensaje, REGLAS_CAMPOS_SERVIDOR);
        const tieneCamposFamiliar = campos.some(campo => campo.startsWith('familiar_'));
        campos.forEach(campo => {
            // Evita marcar los datos del empleado cuando el mensaje se refiere al familiar.
            if (tieneCamposFamiliar && ['cedula', 'nombres', 'apellidos', 'fecha_nacimiento'].includes(campo)) return;
            if (!errores[campo]) errores[campo] = mensajeParaCampo(mensaje);
        });

        const mensajeVisible = errorBD?.mensaje || mensaje;

        mostrarErrores(
            errores,
            mensajeVisible,
            'No se pudo registrar el sobreviviente',
            Object.keys(errores).length > 0
                ? 'Corrija los campos señalados. Los datos que ya ingresó se conservan y puede modificarlos antes de volver a guardar.'
                : 'Verifique los datos e intente nuevamente. Si el problema persiste, comparta este mensaje con el administrador del sistema.'
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'direccion_id') { newData.division_id = ''; newData.unidad_id = ''; }
            else if (name === 'division_id') { newData.unidad_id = ''; }
            else if (name === 'cargo_onapre_id') { newData.cargo_cet_id = ''; newData.nivel_salarial_id = ''; }
            return newData;
        });

        // Al corregir un campo, quitamos su marca de error.
        const camposAfectados = name === 'direccion_id'
            ? [name, 'division_id', 'unidad_id']
            : name === 'division_id'
                ? [name, 'unidad_id']
                : name === 'cargo_onapre_id'
                    ? [name, 'cargo_cet_id', 'nivel_salarial_id']
                    : [name];

        if (camposAfectados.some(campo => erroresCampos[campo])) {
            const restantes = { ...erroresCampos };
            camposAfectados.forEach(campo => delete restantes[campo]);
            setErroresCampos(restantes);
            if (Object.keys(restantes).length === 0) setFeedback(null);
        }
    };

    const limpiarFormulario = () => {
        setFormData({ ...FORMULARIO_INICIAL });
        setErroresCampos({});
        setFeedback(null);
        setPaso(1);
    };

    const handleSiguiente = () => {
        if (paso === 1) {
            const errores = validarPaso1();
            if (Object.keys(errores).length > 0) {
                mostrarErrores(
                    errores,
                    'Complete o corrija los datos personales antes de continuar.',
                    'Revise los datos personales'
                );
                return;
            }
        }

        setErroresCampos({});
        setFeedback(null);
        setPaso(prev => Math.min(prev + 1, 3));
        desplazarAlInicio();
    };

    const handleAtras = () => {
        setErroresCampos({});
        setFeedback(null);
        setPaso(prev => Math.max(prev - 1, 1));
        desplazarAlInicio();
    };

    const cerrarModal = () => {
        if (!guardando) handleClose();
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (guardando) return;

        // Validaciones antes de enviar
        const errores = validarFormulario();
        if (Object.keys(errores).length > 0) {
            mostrarErrores(
                errores,
                'Faltan datos obligatorios o hay valores inválidos. Revise los campos señalados antes de guardar.',
                'Revise los datos del formulario'
            );
            return;
        }

        setGuardando(true);
        setFeedback(null);
        setErroresCampos({});

        if (onSaveStart) onSaveStart();

        try {
            const response = await fetch('/api/rrhh/sobrevivientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await leerRespuestaJson(response);

            if (!response.ok) {
                const mensaje = obtenerMensajeError(result, 'No se pudo registrar el sobreviviente.');
                mostrarErrorServidor(mensaje);
                if (onSaveEnd) onSaveEnd(false, mensaje);
                return;
            }

            // Éxito
            limpiarFormulario();
            if (onSaveEnd) onSaveEnd(true, result.message || 'Sobreviviente registrado exitosamente.');
            handleClose();
        } catch (error) {
            console.error('Error:', error);
            const mensaje = obtenerMensajeDeExcepcion(error, 'No se pudo registrar el sobreviviente.');
            mostrarErrorServidor(mensaje);
            if (onSaveEnd) onSaveEnd(false, mensaje);
        } finally {
            setGuardando(false);
        }
    };

    const getTituloPaso = () => {
        switch (paso) {
            case 1: return 'Registrar Sobreviviente — Datos Personales';
            case 2: return 'Registrar Sobreviviente — Datos Laborales';
            case 3: return 'Registrar Sobreviviente — Familiar Sobreviviente';
            default: return '';
        }
    };

    return (
        <Modal show={show} onHide={cerrarModal} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{getTituloPaso()}</Modal.Title>
            </Modal.Header>
            <Modal.Body ref={bodyRef}>
                {/* ERRORES DE VALIDACIÓN Y DEL SERVIDOR */}
                <FormFeedback
                    {...(feedback || {})}
                    onClose={feedback ? () => {
                        setFeedback(null);
                        setErroresCampos({});
                    } : undefined}
                />

                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (paso < 3) handleSiguiente();
                    else handleSubmit(e);
                }}>

                    {/* ══════════ PASO 1: DATOS PERSONALES ══════════ */}
                    {paso === 1 && (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mt-2 text-primary mb-0">
                                    <i className="bx bx-user me-1"></i> 1. Datos Personales
                                </h6>
                                <small className="text-muted">* Campos obligatorios</small>
                            </div>

                            {/* Cédula */}
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cédula de Identidad *</Form.Label>
                                        <Form.Control type="text" name="cedula" placeholder="Ej: V-12345678"
                                            value={formData.cedula} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                            </div>

                            {/* Nombres y Apellidos */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombres *</Form.Label>
                                        <Form.Control type="text" name="nombres"
                                            value={formData.nombres} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Apellidos *</Form.Label>
                                        <Form.Control type="text" name="apellidos"
                                            value={formData.apellidos} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                            </div>

                            {/* Nacimiento, Género */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Nacimiento</Form.Label>
                                        <Form.Control type="date" name="fecha_nacimiento"
                                            value={formData.fecha_nacimiento} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Género</Form.Label>
                                        <Form.Select name="genero" value={formData.genero} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>



                            {/* Dirección */}
                            <div className="mb-3">
                                <Form.Group>
                                    <Form.Label>Dirección de Habitación</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="direccion_habitacion"
                                        value={formData.direccion_habitacion} onChange={handleChange} />
                                </Form.Group>
                            </div>
                        </>
                    )}
                    {/* ══════════ PASO 2: DATOS LABORALES ══════════ */}
                    {paso === 2 && (
                        <>
                            {/* Datos Laborales */}
                            <div className="d-flex justify-content-between align-items-center mb-3 mt-0">
                                <h6 className="text-primary mb-0">
                                    <i className="bx bx-briefcase me-1"></i> 2. Datos Laborales
                                </h6>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Ingreso (Opcional)</Form.Label>
                                        <Form.Control type="date" name="fecha_ingreso"
                                            value={formData.fecha_ingreso} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Profesión (Opcional)</Form.Label>
                                        <Form.Select name="profesion_id" value={formData.profesion_id} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            {catalogos.profesiones.map(p => (
                                                <option key={p.profesion_id} value={p.profesion_id}>{p.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Escala de Profesionalización (Opcional)</Form.Label>
                                        <Form.Select name="prima_profesional_id" value={formData.prima_profesional_id} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            {catalogos.primasProfesionales.map(p => (
                                                <option key={p.prima_profesional_id} value={p.prima_profesional_id}>{p.descripcion}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Clasificación ONAPRE (Opcional)</Form.Label>
                                        <Form.Select name="cargo_onapre_id" value={formData.cargo_onapre_id} onChange={handleChange}>
                                            <option value="">Seleccione clasificación</option>
                                            {catalogos.cargosONAPRE.map(c => (
                                                <option key={c.cargo_onapre_id} value={c.cargo_onapre_id}>{c.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cargo Interno (CET) (Opcional)</Form.Label>
                                        <Form.Select name="cargo_cet_id" value={formData.cargo_cet_id} onChange={handleChange}
                                            disabled={!formData.cargo_onapre_id || cargosCETFiltrados.length === 0}>
                                            <option value="">Seleccione cargo</option>
                                            {cargosCETFiltrados.map(c => (
                                                <option key={c.cargo_cet_id} value={c.cargo_cet_id}>{c.nombre}</option>
                                            ))}
                                        </Form.Select>
                                        {formData.cargo_onapre_id && cargosCETFiltrados.length === 0 && (
                                            <Form.Text className="text-muted">No hay cargos CET para esta clasificación.</Form.Text>
                                        )}
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Condición Laboral (Opcional)</Form.Label>
                                        <Form.Select name="condicion_laboral_id" value={formData.condicion_laboral_id} onChange={handleChange}>
                                            <option value="">Seleccione condicion</option>
                                            {catalogos.condicionesLaborales.map(c => (
                                                <option key={c.condicion_laboral_id} value={c.condicion_laboral_id}>{c.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nivel Salarial (Opcional)</Form.Label>
                                        <Form.Select
                                            name="nivel_salarial_id"
                                            value={formData.nivel_salarial_id}
                                            onChange={handleChange}
                                            disabled={!formData.cargo_onapre_id}
                                        >
                                            <option value="">Seleccione nivel</option>
                                            {catalogos.niveles.map(n => (
                                                <option key={n.nivel_salarial_id} value={n.nivel_salarial_id}>{n.campo_completo || n.nombre} — {n.salario_base} Bs.</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            {/* Ubicación Organizacional */}
                            <h6 className="mt-3 mb-3 text-secondary border-bottom pb-2">Ubicación Organizacional</h6>
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <Form.Group>
                                        <Form.Label>Dirección (Opcional)</Form.Label>
                                        <Form.Select name="direccion_id" value={formData.direccion_id} onChange={handleChange}>
                                            <option value="">Seleccione la Dirección</option>
                                            {catalogos.direcciones.map(d => (
                                                <option key={d.direccion_id} value={d.direccion_id}>{d.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group>
                                        <Form.Label>División (Opcional)</Form.Label>
                                        <Form.Select name="division_id" value={formData.division_id} onChange={handleChange}
                                            disabled={!formData.direccion_id}>
                                            <option value="">-- Directo a la Dirección --</option>
                                            {divisionesFiltradas.map(d => (
                                                <option key={d.division_id} value={d.division_id}>{d.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group>
                                        <Form.Label>Unidad (Opcional)</Form.Label>
                                        <Form.Select name="unidad_id" value={formData.unidad_id} onChange={handleChange}
                                            disabled={!formData.direccion_id}>
                                            <option value="">{formData.division_id ? '-- Directo a la División --' : '-- Directo a la Dirección --'}</option>
                                            {unidadesFiltradas.map(u => (
                                                <option key={u.unidad_id} value={u.unidad_id}>{u.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ══════════ PASO 3: FAMILIAR SOBREVIVIENTE ══════════ */}
                    {paso === 3 && (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mt-2 text-primary mb-0">
                                    <i className="bx bx-group me-1"></i> 3. Datos del Familiar Sobreviviente
                                </h6>
                                <small className="text-muted">* Campos obligatorios</small>
                            </div>

                            <div className="alert alert-info mb-3">
                                <i className="bx bx-info-circle me-1"></i>
                                Registre los datos del familiar que tiene derecho como sobreviviente.
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Ingreso al Beneficio</Form.Label>
                                        <Form.Control type="date" name="familiar_fecha_ingreso_beneficio"
                                            value={formData.familiar_fecha_ingreso_beneficio} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cédula del Familiar *</Form.Label>
                                        <Form.Control type="text" name="familiar_cedula"
                                            value={formData.familiar_cedula} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombres del Familiar *</Form.Label>
                                        <Form.Control type="text" name="familiar_nombres"
                                            value={formData.familiar_nombres} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Apellidos del Familiar *</Form.Label>
                                        <Form.Control type="text" name="familiar_apellidos"
                                            value={formData.familiar_apellidos} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Nacimiento</Form.Label>
                                        <Form.Control type="date" name="familiar_fecha_nacimiento"
                                            value={formData.familiar_fecha_nacimiento} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Parentesco</Form.Label>
                                        <Form.Select name="familiar_parentesco" value={formData.familiar_parentesco} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            <option value="hijo">Hijo(a)</option>
                                            <option value="conyuge">Cónyuge</option>
                                            <option value="esposo">Esposo</option>

                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Teléfono del Familiar</Form.Label>
                                        <Form.Control type="text" name="familiar_telefono"
                                            value={formData.familiar_telefono} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cuenta Bancaria del Familiar (20 dígitos)</Form.Label>
                                        <Form.Control type="text" name="familiar_cuenta_bancaria" maxLength={20}
                                            value={formData.familiar_cuenta_bancaria} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="mb-3">
                                <Form.Group>
                                    <Form.Label>Dirección del Familiar</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="familiar_direccion"
                                        value={formData.familiar_direccion} onChange={handleChange} />
                                </Form.Group>
                            </div>

                            <div className="mb-3">
                                <Form.Group>
                                    <Form.Label>Observaciones (Opcional)</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="familiar_observacion"
                                        placeholder="Ingrese alguna observación..."
                                        value={formData.familiar_observacion} onChange={handleChange} />
                                </Form.Group>
                            </div>
                        </>
                    )}
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button type='secondary' onClick={cerrarModal} disabled={guardando}>Cancelar</Button>
                {paso > 1 && (
                    <Button type='secondary' className="me-2" onClick={handleAtras} disabled={guardando}>
                        <i className="bx bx-left-arrow-alt me-1"></i> Atrás
                    </Button>
                )}
                {paso < 3 && (
                    <Button type='primary' onClick={handleSiguiente} disabled={guardando}>
                        Siguiente <i className="bx bx-right-arrow-alt ms-1"></i>
                    </Button>
                )}
                {paso === 3 && (
                    <>
                        <Button type='secondary' className="me-2" onClick={limpiarFormulario} disabled={guardando}>
                            Limpiar
                        </Button>
                        <Button type='primary' onClick={handleSubmit} disabled={guardando}>
                            {guardando ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <i className="bx bx-save me-1"></i> Registrar Sobreviviente
                                </>
                            )}
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default RegistrarSobreviviente;
