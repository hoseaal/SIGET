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
// import { hasPermission, ACTIONS } from '../../../data/dataPermissions' // Descomentar si usas permisos

const FECHA_HOY = new Date().toISOString().split('T')[0];

const FORMULARIO_INICIAL = {
    // Datos Personales
    cedula: '',
    nombres: '',
    apellidos: '',
    rif: '',
    fecha_nacimiento: '',
    lugar_nacimiento: '',
    genero: '',
    estado_civil: 'Soltero', // Valor por defecto
    tipo_sangre: '',
    direccion_habitacion: '',
    telefono_fijo: '',
    celular: '',
    correo_principal: '',
    correo_secundario: '',
    cuenta_bancaria: '',
    fecha_ingreso: FECHA_HOY, // Fecha actual por defecto
    contacto_emergencia_1: '',
    telefono_emergencia_1: '',
    contacto_emergencia_2: '',
    telefono_emergencia_2: '',
    deportes: '',
    actividades_culturales: '',

    // Tablas Maestras Personales
    profesion_id: '',
    prima_profesional_id: '',
    estatus_id: 1, // Por defecto Activo (asumiendo ID 1)

    // Datos Contractuales (Opcionales pero recomendados)
    cargo_cet_id: '',
    cargo_onapre_id: '',
    nivel_salarial_id: '',
    condicion_laboral_id: '',
    direccion_id: '', // Nivel 1
    division_id: '', // Nivel 2
    unidad_id: ''  // Nivel 3
};

const REGLAS_CAMPOS_SERVIDOR = [
    { patron: /c[eé]dula/i, campo: 'cedula' },
    { patron: /nombres?/i, campo: 'nombres' },
    { patron: /apellidos?/i, campo: 'apellidos' },
    { patron: /\brif\b/i, campo: 'rif' },
    { patron: /fecha.*nacimiento/i, campo: 'fecha_nacimiento' },
    { patron: /fecha.*ingreso/i, campo: 'fecha_ingreso' },
    { patron: /direcci[oó]n/i, campo: 'direccion_id' },
    { patron: /divisi[oó]n/i, campo: 'division_id' },
    { patron: /unidad/i, campo: 'unidad_id' },
    { patron: /cargo.*cet|cet.*cargo/i, campo: 'cargo_cet_id' },
    { patron: /onapre/i, campo: 'cargo_onapre_id' },
    { patron: /nivel.*salarial|salarial/i, campo: 'nivel_salarial_id' },
    { patron: /condici[oó]n.*laboral/i, campo: 'condicion_laboral_id' },
    { patron: /profesi[oó]n/i, campo: 'profesion_id' },
    { patron: /cuenta.*bancaria/i, campo: 'cuenta_bancaria' },
    { patron: /correo/i, campo: 'correo_principal' },
    { patron: /tel[eé]fono.*emergencia.*1/i, campo: 'telefono_emergencia_1' },
    { patron: /tel[eé]fono.*emergencia.*2/i, campo: 'telefono_emergencia_2' },
    { patron: /tel[eé]fono|celular/i, campo: 'celular' }
];

const PASO_POR_CAMPO = {
    cedula: 1, nombres: 1, apellidos: 1, rif: 1, fecha_nacimiento: 1,
    lugar_nacimiento: 1, genero: 1, estado_civil: 1, tipo_sangre: 1,
    direccion_habitacion: 1, telefono_fijo: 1, celular: 1,
    correo_principal: 1, correo_secundario: 1, cuenta_bancaria: 1,
    nro_cuenta_bancaria: 1, deportes: 1, actividades_culturales: 1,
    fecha_ingreso: 2, profesion_id: 2, prima_profesional_id: 2,
    cargo_onapre_id: 2, cargo_cet_id: 2, nivel_salarial_id: 2,
    condicion_laboral_id: 2, direccion_id: 2, division_id: 2, unidad_id: 2,
    contacto_emergencia_1: 2, telefono_emergencia_1: 2,
    contacto_emergencia_2: 2, telefono_emergencia_2: 2
};

export const RegistrarFuncionario = ({ show, handleClose, onSaveStart, onSaveEnd }) => {
    const [paso, setPaso] = useState(1);
    const [guardando, setGuardando] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [erroresCampos, setErroresCampos] = useState({});
    const bodyRef = useRef(null);

    // Estado del Formulario (Coincide con el endpoint POST /api/rrhh/funcionarios)
    const [formData, setFormData] = useState(() => ({ ...FORMULARIO_INICIAL }));

    // Estados para los Selectores (Catalogos)
    const [catalogos, setCatalogos] = useState({
        profesiones: [],
        primasProfesionales: [],
        cargosCET: [],
        cargosONAPRE: [],
        niveles: [],
        condiciones: [],
        direcciones: [],
        divisiones: [],
        unidades: []
    });

    // Hook de selects dependientes: filtra CET, divisiones y unidades localmente
    const {
        cargosCETFiltrados,
        divisionesFiltradas,
        unidadesFiltradas,
        tieneDivisiones,
        tieneUnidades,
        tieneUnidadesDirectas
    } = useSelectsDependientes(formData, catalogos);

    // Cargar catalogos al montar el componente
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const [proRes, primasProfRes, cetRes, onaRes, colRes, dirRes, divRes, uniRes] = await Promise.all([
                    fetch('/api/rrhh/profesiones'),
                    fetch('/api/rrhh/primas-profesionalizacion'),
                    fetch('/api/rrhh/cargos-cet'),
                    fetch('/api/rrhh/cargos-onapre'),
                    fetch('/api/rrhh/condiciones-laborales'),
                    fetch('/api/rrhh/direcciones'),
                    fetch('/api/rrhh/divisiones'),
                    fetch('/api/rrhh/unidades')
                ]);

                setCatalogos({
                    profesiones: await proRes.json(),
                    primasProfesionales: await primasProfRes.json(),
                    cargosCET: await cetRes.json(),
                    cargosONAPRE: await onaRes.json(),
                    condiciones: await colRes.json(),
                    direcciones: await dirRes.json(),
                    divisiones: await divRes.json(),
                    unidades: await uniRes.json(),
                    niveles: [] // Se cargan dinámicamente según ONAPRE
                });

            } catch (error) {
                console.error("Error cargando catálogos:", error);
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
    }, []);

    // Limpia los errores de un intento anterior al reabrir el modal.
    useEffect(() => {
        if (!show) return;
        setErroresCampos({});
        setFeedback(prev => (prev?.type === 'warning' ? prev : null));
        setGuardando(false);
    }, [show]);

    // Efecto: Cargar Niveles cuando cambia el Cargo ONAPRE (cargo_onapre_id)
    useEffect(() => {
        const fetchNiveles = async () => {
            if (!formData.cargo_onapre_id) {
                setCatalogos(prev => ({ ...prev, niveles: [] }));
                return;
            }
            try {
                // Asumiendo un endpoint que filtre niveles por cargo ONAPRE
                const res = await fetch(`/api/rrhh/niveles-salariales?cargo_onapre_id=${formData.cargo_onapre_id}`);
                const data = await res.json();
                setCatalogos(prev => ({ ...prev, niveles: Array.isArray(data) ? data : [] }));
            } catch (error) {
                console.error("Error cargando niveles:", error);
            }
        };
        fetchNiveles();
    }, [formData.cargo_onapre_id]);

    const desplazarAlInicio = () => {
        window.requestAnimationFrame(() => {
            if (bodyRef.current) bodyRef.current.scrollTop = 0;
        });
    };

    const mostrarErrores = (errores, mensaje, titulo = 'Revise los datos del formulario', sugerencia) => {
        setErroresCampos(errores);
        setFeedback(crearFeedbackDeError({ titulo, mensaje, errores, sugerencia }));

        // Si el error está en el otro paso, llevamos al usuario hasta ese paso.
        const pasos = Object.keys(errores).map(campo => PASO_POR_CAMPO[campo]).filter(Boolean);
        if (pasos.length > 0) setPaso(Math.min(...pasos));

        desplazarAlInicio();
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
        if (formData.correo_principal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo_principal)) {
            errores.correo_principal = 'Ingrese un correo electrónico válido (ejemplo: nombre@dominio.com).';
        }
        if (formData.correo_secundario && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo_secundario)) {
            errores.correo_secundario = 'Ingrese un correo electrónico válido (ejemplo: nombre@dominio.com).';
        }

        return errores;
    };

    const validarFormulario = () => {
        const errores = validarPaso1();

        if (!formData.fecha_ingreso) {
            errores.fecha_ingreso = 'La fecha de ingreso es obligatoria.';
        }
        if (!formData.direccion_id) {
            errores.direccion_id = 'Seleccione la dirección de adscripción.';
        }

        return errores;
    };

    const mostrarErrorServidor = (mensaje) => {
        const errorBD = detectarErrorDeBD(mensaje);
        const errores = {};

        if (errorBD?.campo) {
            errores[errorBD.campo] = errorBD.mensaje;
        }

        obtenerCamposAfectados(mensaje, REGLAS_CAMPOS_SERVIDOR).forEach(campo => {
            if (!errores[campo]) errores[campo] = mensajeParaCampo(mensaje);
        });

        const mensajeVisible = errorBD?.mensaje || mensaje;

        mostrarErrores(
            errores,
            mensajeVisible,
            'No se pudo registrar el funcionario',
            Object.keys(errores).length > 0
                ? 'Corrija los campos señalados. Los datos que ya ingresó se conservan y puede modificarlos antes de volver a guardar.'
                : 'Verifique los datos e intente nuevamente. Si el problema persiste, comparta este mensaje con el administrador del sistema.'
        );
    };

    // Manejador de cambios en inputs
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Lógica de limpieza en cascada
            if (name === 'direccion_id') {
                newData.division_id = '';
                newData.unidad_id = '';
            } else if (name === 'division_id') {
                newData.unidad_id = '';
            } else if (name === 'cargo_onapre_id') {
                newData.cargo_cet_id = '';
                newData.nivel_salarial_id = '';
            }

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
        const errores = validarPaso1();
        if (Object.keys(errores).length > 0) {
            mostrarErrores(
                errores,
                'Complete o corrija los datos personales antes de continuar.',
                'Revise los datos personales'
            );
            return;
        }

        setErroresCampos({});
        setFeedback(null);
        setPaso(2);
        desplazarAlInicio();
    };

    const handleAtras = () => {
        setErroresCampos({});
        setFeedback(null);
        setPaso(1);
        desplazarAlInicio();
    };

    const cerrarModal = () => {
        if (!guardando) handleClose();
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (guardando) return;

        // Validaciones básicas antes de enviar
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
            const response = await fetch('/api/rrhh/funcionarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await leerRespuestaJson(response);

            if (!response.ok) {
                const mensaje = obtenerMensajeError(result, 'No se pudo registrar el funcionario.');
                mostrarErrorServidor(mensaje);
                if (onSaveEnd) onSaveEnd(false, mensaje);
                return;
            }

            // Éxito
            limpiarFormulario();
            if (onSaveEnd) onSaveEnd(true, result.message || 'Funcionario registrado exitosamente.');
            handleClose();

        } catch (error) {
            console.error('Error:', error);
            const mensaje = obtenerMensajeDeExcepcion(error, 'No se pudo registrar el funcionario.');
            mostrarErrorServidor(mensaje);
            if (onSaveEnd) onSaveEnd(false, mensaje);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal show={show} onHide={cerrarModal} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {paso === 1 ? 'Registrar Funcionario - Datos Personales' : 'Registrar Funcionario - Datos Laborales'}
                </Modal.Title>
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
                    if (paso === 1) handleSiguiente();
                    else handleSubmit(e);
                }}>
                    {paso === 1 && (
                        <>
                            {/* SECCIÓN 1: DATOS PERSONALES */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mt-2 text-primary mb-0">1. Datos Personales</h6>
                                <small className="text-muted">* Campos obligatorios</small>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cédula de Identidad *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="cedula"
                                            placeholder="Ej: V-12345678"
                                            value={formData.cedula}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>RIF (Opcional)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="rif"
                                            placeholder="Ej: V123456789"
                                            value={formData.rif}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombres *</Form.Label>
                                        <Form.Control type="text" name="nombres" value={formData.nombres} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Apellidos *</Form.Label>
                                        <Form.Control type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Nacimiento</Form.Label>
                                        <Form.Control type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Género</Form.Label>
                                        <Form.Select name="genero" value={formData.genero} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Estado Civil</Form.Label>
                                        <Form.Select name="estado_civil" value={formData.estado_civil} onChange={handleChange}>
                                            <option value="Soltero">Soltero(a)</option>
                                            <option value="Casado">Casado(a)</option>
                                            <option value="Divorciado">Divorciado(a)</option>
                                            <option value="Viudo">Viudo(a)</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="mb-3">
                                <Form.Group>
                                    <Form.Label>Lugar de Nacimiento</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="lugar_nacimiento" value={formData.lugar_nacimiento} onChange={handleChange} />
                                </Form.Group>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tipo de Sangre</Form.Label>
                                        <Form.Select name="tipo_sangre" value={formData.tipo_sangre} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Numero de Telefono Residencial</Form.Label>
                                        <Form.Control type="text" name="telefono_fijo" placeholder="0276-0000000" value={formData.telefono_fijo} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Numero de Celular</Form.Label>
                                        <Form.Control type="text" name="celular" placeholder="0426-0000000" value={formData.celular} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Correo Electrónico</Form.Label>
                                        <Form.Control type="email" name="correo_principal" value={formData.correo_principal} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Correo Electrónico Secundario</Form.Label>
                                        <Form.Control type="email" name="correo_secundario" value={formData.correo_secundario} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Número de Cuenta Bancaria</Form.Label>
                                        <Form.Control type="text" name="cuenta_bancaria" maxLength={20} placeholder="Ej: 01020000000000000000" value={formData.cuenta_bancaria} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Actividades Culturales</Form.Label>
                                        <Form.Control type="text" name="actividades_culturales" value={formData.actividades_culturales} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Deportes que practica</Form.Label>
                                        <Form.Control type="text" name="deportes" value={formData.deportes} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="mb-3">
                                <Form.Group>
                                    <Form.Label>Dirección de Habitación</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="direccion_habitacion" value={formData.direccion_habitacion} onChange={handleChange} />
                                </Form.Group>
                            </div>
                        </>
                    )}

                    {paso === 2 && (
                        <>
                            <div className="row mb-3">
                                <h6 className="mt-2 mb-3 text-primary">En caso de emergencia avisar a:</h6>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>1. Nombres Y Apellidos</Form.Label>
                                        <Form.Control type="text" name="contacto_emergencia_1" value={formData.contacto_emergencia_1} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>1. Teléfono de Emergencia</Form.Label>
                                        <Form.Control type="text" name="telefono_emergencia_1" value={formData.telefono_emergencia_1} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>2. Nombres Y Apellidos</Form.Label>
                                        <Form.Control type="text" name="contacto_emergencia_2" value={formData.contacto_emergencia_2} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>2. Teléfono de Emergencia</Form.Label>
                                        <Form.Control type="text" name="telefono_emergencia_2" value={formData.telefono_emergencia_2} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>

                            {/* SECCIÓN 2: DATOS CONTRACTUALES */}
                            <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                                <h6 className="text-primary mb-0">2. Datos Laborales y Contractuales</h6>
                                <small className="text-muted">* Campos obligatorios</small>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Ingreso</Form.Label>
                                        <Form.Control type="date" name="fecha_ingreso" value={formData.fecha_ingreso} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                                {/* Estatus oculto por defecto a Activo (1) */}
                                <div className="col-md-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Profesión</Form.Label>
                                        <Form.Select name="profesion_id" value={formData.profesion_id} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            {catalogos.profesiones.map(p => (
                                                <option key={p.profesion_id} value={p.profesion_id}>{p.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Escala de Profesionalización</Form.Label>
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
                                        <Form.Label>Clasificación ONAPRE</Form.Label>
                                        <Form.Select name="cargo_onapre_id" value={formData.cargo_onapre_id} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            {catalogos.cargosONAPRE.map(o => (
                                                <option key={o.cargo_onapre_id} value={o.cargo_onapre_id}>{o.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cargo CET (Interno)</Form.Label>
                                        <Form.Select
                                            name="cargo_cet_id"
                                            value={formData.cargo_cet_id}
                                            onChange={handleChange}
                                            disabled={!formData.cargo_onapre_id || cargosCETFiltrados.length === 0}
                                        >
                                            <option value="">Seleccione</option>
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
                                        <Form.Label>Condición Laboral</Form.Label>
                                        <Form.Select name="condicion_laboral_id" value={formData.condicion_laboral_id} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            {catalogos.condiciones.map(c => (
                                                <option key={c.condicion_laboral_id} value={c.condicion_laboral_id}>{c.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nivel Salarial</Form.Label>
                                        <Form.Select name="nivel_salarial_id" value={formData.nivel_salarial_id} onChange={handleChange} disabled={!formData.cargo_onapre_id}>
                                            <option value="">Seleccione</option>
                                            {catalogos.niveles.map(n => (
                                                <option key={n.nivel_salarial_id} value={n.nivel_salarial_id}>{n.nombre} — {n.salario_base} Bs.</option>
                                            ))}
                                        </Form.Select>
                                        {catalogos.niveles.length === 0 && formData.cargo_onapre_id && (
                                            <Form.Text className="text-muted">No hay niveles para este cargo.</Form.Text>
                                        )}
                                    </Form.Group>
                                </div>
                            </div>

                            {/* SECCIÓN: UBICACIÓN ORGANIZACIONAL */}
                            <h6 className="mt-4 mb-3 text-primary">Ubicación Organizacional</h6>
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <Form.Group>
                                        <Form.Label>Dirección *</Form.Label>
                                        <Form.Select name="direccion_id" value={formData.direccion_id} onChange={handleChange} required>
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
                                        <Form.Select
                                            name="division_id"
                                            value={formData.division_id}
                                            onChange={handleChange}
                                            disabled={!formData.direccion_id || !tieneDivisiones}
                                        >
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
                                        <Form.Select
                                            name="unidad_id"
                                            value={formData.unidad_id}
                                            onChange={handleChange}
                                            disabled={!formData.direccion_id || !tieneUnidades}
                                        >
                                            <option value="">{formData.division_id ? '-- Directo a la División --' : '-- Directo a la Dirección --'}</option>
                                            {unidadesFiltradas.map(u => (
                                                <option key={u.unidad_id} value={u.unidad_id}>{u.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-12 mt-2">
                                    <Form.Text className="text-muted">
                                        <i className="bx bx-info-circle me-1"></i>
                                        Seleccione el nivel más profundo al que pertenece el funcionario. Si no pertenece a ninguna Unidad o División específica, deje la opción en "-- Directo a la... --".
                                    </Form.Text>
                                </div>
                            </div>
                        </>
                    )}
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button type='secondary' onClick={cerrarModal} disabled={guardando}>Cancelar</Button>
                {paso === 1 && (
                    <Button type='primary' onClick={handleSiguiente} disabled={guardando}>Siguiente</Button>
                )}
                {paso === 2 && (
                    <>
                        <Button type='secondary' className="me-2" onClick={handleAtras} disabled={guardando}>Atrás</Button>
                        <Button type='secondary' className="me-2" onClick={limpiarFormulario} disabled={guardando}>Limpiar</Button>
                        <Button type='primary' onClick={handleSubmit} disabled={guardando}>
                            {guardando ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Guardando...
                                </>
                            ) : 'Registrar Funcionario'}
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};