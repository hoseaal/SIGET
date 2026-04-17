import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../../components/atoms/Buttons';
import Alert from "../../../components/atoms/Alert";
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';

export const EditarFuncionario = ({ show, handleClose, onSaveStart, onSaveEnd, empleado_id }) => {
    const [paso, setPaso] = useState(1);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Estado del Formulario
    const [formData, setFormData] = useState({
        cedula: '', nombres: '', apellidos: '', rif: '',
        fecha_nacimiento: '', lugar_nacimiento: '', genero: '', estado_civil: 'Soltero',
        tipo_sangre: '', direccion_habitacion: '', telefono_fijo: '', celular: '',
        correo_principal: '', correo_secundario: '', cuenta_bancaria: '', fecha_ingreso: '',
        contacto_emergencia_1: '', telefono_emergencia_1: '',
        contacto_emergencia_2: '', telefono_emergencia_2: '',
        deportes: '', actividades_culturales: '',
        profesion_id: '', estatus_id: 1,
        cargo_cet_id: '', cargo_onapre_id: '', nivel_salarial_id: '',
        condicion_laboral_id: '', direccion_id: '', division_id: '', unidad_id: ''
    });

    // Estados para los Selectores
    const [catalogos, setCatalogos] = useState({
        profesiones: [], estatus: [], cargosCET: [], cargosONAPRE: [],
        niveles: [], condiciones: [], direcciones: [], divisiones: [], unidades: []
    });

    // Cargar Catálogos Maestros y Datos del Funcionario
    useEffect(() => {
        if (!show || !empleado_id) return;

        const fetchData = async () => {
            setIsLoadingData(true);
            setErrorMessage('');
            try {
                // 1. Cargar bases estáticas
                const [proRes, estRes, cetRes, onaRes, colRes, dirRes, funRes] = await Promise.all([
                    fetch('/api/profesiones'),
                    fetch('/api/estatus'),
                    fetch('/api/cargos-cet'),
                    fetch('/api/cargos-onapre'),
                    fetch('/api/condiciones-laborales'),
                    fetch('/api/direcciones'),
                    fetch(`/api/funcionarios/${empleado_id}`)
                ]);

                if (!funRes.ok) throw new Error('Error al obtener datos del funcionario');

                const profesiones = await proRes.json();
                const estatus = await estRes.json();
                const cargosCET = await cetRes.json();
                const cargosONAPRE = await onaRes.json();
                const condiciones = await colRes.json();
                const direcciones = await dirRes.json();
                const empleadoRaw = await funRes.json();
                // El servicio backend puede enviar el objeto de diversas formas según el type
                const empleado = empleadoRaw.data || empleadoRaw.datos_personales || empleadoRaw;

                // 2. Extraer dependencias dinámicas del empleado
                const dir_id = empleado.direccion_id || '';
                const div_id = empleado.division_id || '';
                const ona_id = empleado.cargo_onapre_id || '';

                let divisionesFetch = [];
                let unidadesFetch = [];
                let nivelesFetch = [];

                if (dir_id) {
                    const res = await fetch(`/api/divisiones?direccion_id=${dir_id}`);
                    divisionesFetch = await res.json();
                }
                if (div_id) {
                    const res = await fetch(`/api/unidades?division_id=${div_id}`);
                    unidadesFetch = await res.json();
                }
                if (ona_id) {
                    const res = await fetch(`/api/niveles-salariales?cargo_onapre_id=${ona_id}`);
                    nivelesFetch = await res.json();
                }

                // 3. Establecer catalogos
                setCatalogos({
                    profesiones, estatus, cargosCET, cargosONAPRE,
                    condiciones, direcciones, divisiones: divisionesFetch,
                    unidades: unidadesFetch, niveles: nivelesFetch
                });

                // 4. Formatear Fechas para el input 'date' (YYYY-MM-DD)
                const formatDateStr = (dateString) => {
                    if (!dateString) return '';
                    const d = new Date(dateString);
                    if (isNaN(d)) return '';
                    return d.toISOString().split('T')[0];
                };

                setFormData({
                    cedula: empleado.cedula || '',
                    nombres: empleado.nombres || '',
                    apellidos: empleado.apellidos || '',
                    rif: empleado.rif || '',
                    fecha_nacimiento: formatDateStr(empleado.fecha_nacimiento),
                    lugar_nacimiento: empleado.lugar_nacimiento || '',
                    genero: empleado.genero || '',
                    estado_civil: empleado.estado_civil || 'Soltero',
                    tipo_sangre: empleado.tipo_sangre || '',
                    direccion_habitacion: empleado.direccion_habitacion || '',
                    telefono_fijo: empleado.telefono_fijo || '',
                    celular: empleado.celular || '',
                    correo_principal: empleado.correo_principal || '',
                    correo_secundario: empleado.correo_secundario || '',
                    cuenta_bancaria: empleado.cuenta_bancaria || '',
                    fecha_ingreso: formatDateStr(empleado.fecha_ingreso),
                    contacto_emergencia_1: empleado.contacto_emergencia_1 || '',
                    telefono_emergencia_1: empleado.telefono_emergencia_1 || '',
                    contacto_emergencia_2: empleado.contacto_emergencia_2 || '',
                    telefono_emergencia_2: empleado.telefono_emergencia_2 || '',
                    deportes: empleado.deportes || '',
                    actividades_culturales: empleado.actividades_culturales || '',
                    profesion_id: empleado.profesion_id || '',
                    estatus_id: empleado.estatus_id || 1,
                    cargo_cet_id: empleado.cargo_cet_id || '',
                    cargo_onapre_id: empleado.cargo_onapre_id || '',
                    nivel_salarial_id: empleado.nivel_salarial_id || '',
                    condicion_laboral_id: empleado.condicion_laboral_id || '',
                    direccion_id: empleado.direccion_id || '',
                    division_id: empleado.division_id || '',
                    unidad_id: empleado.unidad_id || ''
                });

            } catch (error) {
                console.error("Error inicializando modal de edición:", error);
                setErrorMessage("Error cargando los datos. Verifique conexión.");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
        // Limpiamos los estados base
        setPaso(1);
        setMensajeMostrado(false);
        setErrorMessage('');
    }, [show, empleado_id]);

    // Cascada: Cuando el usuario cambia la Dirección manualmente
    useEffect(() => {
        const fetchDivisiones = async () => {
            if (!formData.direccion_id || !show || isLoadingData) return;
            try {
                const res = await fetch(`/api/divisiones?direccion_id=${formData.direccion_id}`);
                const data = await res.json();
                setCatalogos(prev => ({ ...prev, divisiones: data }));
            } catch (error) {
                console.error("Error cargando divisiones:", error);
            }
        };
        fetchDivisiones();
    }, [formData.direccion_id]);

    // Cascada: Cuando el usuario cambia la División manualmente
    useEffect(() => {
        const fetchUnidades = async () => {
            if (!formData.division_id || !show || isLoadingData) return;
            try {
                const res = await fetch(`/api/unidades?division_id=${formData.division_id}`);
                const data = await res.json();
                setCatalogos(prev => ({ ...prev, unidades: data }));
            } catch (error) {
                console.error("Error cargando unidades:", error);
            }
        };
        fetchUnidades();
    }, [formData.division_id]);

    // Cascada: Cuando el usuario cambia Cargo ONAPRE manualmente
    useEffect(() => {
        const fetchNiveles = async () => {
            if (!formData.cargo_onapre_id || !show || isLoadingData) return;
            try {
                const res = await fetch(`/api/niveles-salariales?cargo_onapre_id=${formData.cargo_onapre_id}`);
                const data = await res.json();
                setCatalogos(prev => ({ ...prev, niveles: data }));
            } catch (error) {
                console.error("Error cargando niveles:", error);
            }
        };
        fetchNiveles();
    }, [formData.cargo_onapre_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'direccion_id') {
                newData.division_id = '';
                newData.unidad_id = '';
                setCatalogos(cat => ({ ...cat, unidades: [] }));
            } else if (name === 'division_id') {
                newData.unidad_id = '';
            } else if (name === 'cargo_onapre_id') {
                newData.nivel_salarial_id = '';
            }
            return newData;
        });
    };

    const handleSiguiente = () => {
        if (!formData.cedula || !formData.nombres || !formData.apellidos) {
            setErrorMessage('Por favor complete Cédula, Nombres, y Apellidos requeridos.');
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 3000);
            return;
        }
        setErrorMessage('');
        setMensajeMostrado(false);
        setPaso(2);
    };

    const handleAtras = () => {
        setErrorMessage('');
        setMensajeMostrado(false);
        setPaso(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.direccion_id) {
            setErrorMessage('Por favor complete la Dirección de Adscripción.');
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 3000);
            return;
        }

        if (onSaveStart) onSaveStart();

        try {
            const response = await fetch(`/api/funcionarios/${empleado_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al actualizar funcionario');
            }

            if (onSaveEnd) onSaveEnd(true, 'Funcionario actualizado exitosamente.');
        } catch (error) {
            console.error('Error:', error);
            if (onSaveEnd) onSaveEnd(false, error.message);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {paso === 1 ? 'Editar Funcionario - Datos Personales' : 'Editar Funcionario - Datos Laborales'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-light">
                {isLoadingData ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Alistando datos del empleado...</p>
                    </div>
                ) : (
                    <>
                        {/* MENSAJES DE ALERTA DE VALIDACIÓN */}
                        {mensajeMostrado &&
                            <Alert key="danger" type="danger">
                                {errorMessage}
                            </Alert>
                        }

                        <form onSubmit={handleSubmit}>
                            {paso === 1 && (
                                <div className="card shadow-sm border-0 mb-3"><div className="card-body">
                                    {/* SECCIÓN 1: DATOS PERSONALES */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mt-2 text-primary mb-0"><i className="bx bx-user me-2"></i>1. Datos Personales Básicos</h6>
                                        <small className="text-muted">* Campos obligatorios</small>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3">
                                                <Form.Label>Cédula de Identidad *</Form.Label>
                                                <Form.Control type="text" name="cedula" value={formData.cedula} onChange={handleChange} required />
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3">
                                                <Form.Label>RIF (Opcional)</Form.Label>
                                                <Form.Control type="text" name="rif" value={formData.rif} onChange={handleChange} />
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
                                                <Form.Control type="text" name="tipo_sangre" value={formData.tipo_sangre} onChange={handleChange} />
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-4">
                                            <Form.Group className="mb-3">
                                                <Form.Label>Numero de Telefono Fijo</Form.Label>
                                                <Form.Control type="text" name="telefono_fijo" value={formData.telefono_fijo} onChange={handleChange} />
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-4">
                                            <Form.Group className="mb-3">
                                                <Form.Label>Numero de Celular</Form.Label>
                                                <Form.Control type="text" name="celular" value={formData.celular} onChange={handleChange} />
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
                                </div></div>
                            )}

                            {paso === 2 && (
                                <>
                                    <div className="card shadow-sm border-0 mb-4"><div className="card-body">
                                        <h6 className="mt-2 text-primary mb-3"><i className="bx bx-first-aid me-2"></i>Contactos de Emergencia</h6>
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>1. Nombres y Apellidos</Form.Label>
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
                                        <div className="row mb-1">
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>2. Nombres y Apellidos</Form.Label>
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
                                    </div></div>

                                    <div className="card shadow-sm border-0 mb-3"><div className="card-body">
                                        {/* SECCIÓN 2: DATOS CONTRACTUALES */}
                                        <div className="d-flex justify-content-between align-items-center mb-3 mt-2">
                                            <h6 className="text-primary mb-0"><i className="bx bx-briefcase me-2"></i>2. Datos Laborales y Contractuales</h6>
                                            <small className="text-muted">* Campos obligatorios</small>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-4">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Fecha de Ingreso</Form.Label>
                                                    <Form.Control type="date" name="fecha_ingreso" value={formData.fecha_ingreso} onChange={handleChange} required />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-4">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Estatus</Form.Label>
                                                    <Form.Select name="estatus_id" value={formData.estatus_id} onChange={handleChange}>
                                                        <option value="">Seleccione</option>
                                                        {catalogos.estatus.map(e => (
                                                            <option key={e.estatus_id} value={e.estatus_id}>{e.nombre}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-4">
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
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Cargo CET (Interno)</Form.Label>
                                                    <Form.Select name="cargo_cet_id" value={formData.cargo_cet_id} onChange={handleChange}>
                                                        <option value="">Seleccione</option>
                                                        {catalogos.cargosCET.map(c => (
                                                            <option key={c.cargo_cet_id} value={c.cargo_cet_id}>{c.nombre}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
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
                                            <div className="col-md-6">
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
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Nivel Salarial</Form.Label>
                                                    <Form.Select name="nivel_salarial_id" value={formData.nivel_salarial_id} onChange={handleChange} disabled={!formData.cargo_onapre_id}>
                                                        <option value="">Seleccione</option>
                                                        {catalogos.niveles.map(n => (
                                                            <option key={n.nivel_salarial_id} value={n.nivel_salarial_id}>{n.nombre} - {n.salario_base} Bs.</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </div>
                                        </div>

                                        {/* SECCIÓN: UBICACIÓN ORGANIZACIONAL */}
                                        <h6 className="mt-4 mb-3 text-secondary border-bottom pb-2">Ubicación Organizacional</h6>
                                        <div className="row mb-2">
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
                                                        disabled={!formData.direccion_id || catalogos.divisiones?.length === 0}
                                                    >
                                                        <option value="">-- Directo a la Dirección --</option>
                                                        {catalogos.divisiones?.map(d => (
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
                                                        disabled={!formData.division_id || catalogos.unidades?.length === 0}
                                                    >
                                                        <option value="">-- Directo a la División --</option>
                                                        {catalogos.unidades?.map(u => (
                                                            <option key={u.unidad_id} value={u.unidad_id}>{u.nombre}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </div>
                                        </div>
                                    </div></div>
                                </>
                            )}
                        </form>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-white border-top">
                <Button type='secondary' onClick={handleClose} disabled={isLoadingData}>Cancelar</Button>
                {paso === 1 && (
                    <Button type='primary' onClick={handleSiguiente} disabled={isLoadingData}>Siguiente <i className="bx bx-right-arrow-alt ms-1"></i></Button>
                )}
                {paso === 2 && (
                    <>
                        <Button type='secondary' className="me-2" onClick={handleAtras} disabled={isLoadingData}><i className="bx bx-left-arrow-alt me-1"></i>Atrás</Button>
                        <Button type='primary' onClick={handleSubmit} disabled={isLoadingData}><i className="bx bx-save me-1"></i>Guardar Cambios</Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};
