import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../components/atoms/Buttons';
import Alert from '../../components/atoms/Alert';
import Modal from 'react-bootstrap/Modal';

export const RegistrarJubilado = ({ show, handleClose, onSaveStart, onSaveEnd }) => {
    const [paso, setPaso] = useState(1);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        // ── Datos Personales (tabla empleados) ──
        cedula: '',
        nombres: '',
        apellidos: '',
        rif: '',
        fecha_nacimiento: '',
        genero: '',
        estado_civil: 'Soltero',
        telefono_fijo: '',
        celular: '',
        correo_principal: '',
        correo_secundario: '',
        cuenta_bancaria: '',
        contacto_emergencia_1: '',
        telefono_emergencia_1: '',
        contacto_emergencia_2: '',
        telefono_emergencia_2: '',
        profesion_id: '',

        // ── Datos Laborales (tabla datos_laborales + empleados) ──
        fecha_ingreso: '',
        cargo_cet_id: '',
        cargo_onapre_id: '',
        condicion_laboral_id: '',
        nivel_salarial_id: '',
        direccion_id: '',
        division_id: '',
        unidad_id: '',

        // ── Datos de Jubilación (tabla jubilados) ──
        porcentaje_jubilacion: '',
        fecha_efectiva: new Date().toISOString().split('T')[0],
    });

    const [catalogos, setCatalogos] = useState({
        profesiones: [],
        cargosCET: [],
        cargosONAPRE: [],
        condicionesLaborales: [],
        niveles: [],
        direcciones: [],
        divisiones: [],
        unidades: [],
    });

    // Cargar catálogos al abrir el modal
    useEffect(() => {
        if (!show) return;

        const fetchCatalogos = async () => {
            try {
                const [proRes, cetRes, onaRes, dirRes, condRes] = await Promise.all([
                    fetch('/api/profesiones'),
                    fetch('/api/cargos-cet'),
                    fetch('/api/cargos-onapre'),
                    fetch('/api/direcciones'),
                    fetch('/api/condiciones-laborales'),
                ]);

                const [profesiones, cargosCET, cargosONAPRE, direcciones, condicionesLaborales] = await Promise.all([
                    proRes.json(), cetRes.json(), onaRes.json(), dirRes.json(), condRes.json(),
                ]);

                setCatalogos(prev => ({
                    ...prev,
                    profesiones,
                    cargosCET,
                    cargosONAPRE,
                    condicionesLaborales,
                    direcciones,
                    niveles: [],
                    divisiones: [],
                    unidades: [],
                }));
            } catch (error) {
                console.error('Error cargando catálogos:', error);
                setErrorMessage('Error cargando listas desplegables.');
            }
        };

        fetchCatalogos();
    }, [show]);

    // Cascada: Divisiones según Dirección
    useEffect(() => {
        const fetch_ = async () => {
            if (!formData.direccion_id) {
                setCatalogos(prev => ({ ...prev, divisiones: [], unidades: [] }));
                return;
            }
            try {
                const res = await fetch(`/api/divisiones?direccion_id=${formData.direccion_id}`);
                const divisiones = await res.json();
                setCatalogos(prev => ({ ...prev, divisiones, unidades: [] }));
            } catch (e) { console.error('Error divisiones:', e); }
        };
        fetch_();
    }, [formData.direccion_id]);

    // Cascada: Unidades según División
    useEffect(() => {
        const fetch_ = async () => {
            if (!formData.division_id) {
                setCatalogos(prev => ({ ...prev, unidades: [] }));
                return;
            }
            try {
                const res = await fetch(`/api/unidades?division_id=${formData.division_id}`);
                const unidades = await res.json();
                setCatalogos(prev => ({ ...prev, unidades }));
            } catch (e) { console.error('Error unidades:', e); }
        };
        fetch_();
    }, [formData.division_id]);

    // Cascada: Niveles salariales según Cargo ONAPRE
    useEffect(() => {
        const fetch_ = async () => {
            if (!formData.cargo_onapre_id) {
                setCatalogos(prev => ({ ...prev, niveles: [] }));
                return;
            }
            try {
                const res = await fetch(`/api/niveles-salariales?cargo_onapre_id=${formData.cargo_onapre_id}`);
                const niveles = await res.json();
                setCatalogos(prev => ({ ...prev, niveles }));
            } catch (e) { console.error('Error niveles:', e); }
        };
        fetch_();
    }, [formData.cargo_onapre_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'direccion_id') { newData.division_id = ''; newData.unidad_id = ''; }
            else if (name === 'division_id') { newData.unidad_id = ''; }
            else if (name === 'cargo_onapre_id') { newData.nivel_salarial_id = ''; }
            return newData;
        });
    };

    const limpiarFormulario = () => {
        setFormData({
            cedula: '', nombres: '', apellidos: '', rif: '',
            fecha_nacimiento: '', lugar_nacimiento: '', genero: '', estado_civil: 'Soltero',
            tipo_sangre: '', direccion_habitacion: '', telefono_fijo: '', celular: '',
            correo_principal: '', correo_secundario: '', cuenta_bancaria: '',
            contacto_emergencia_1: '', telefono_emergencia_1: '',
            contacto_emergencia_2: '', telefono_emergencia_2: '',
            profesion_id: '',
            fecha_ingreso: '', cargo_cet_id: '', cargo_onapre_id: '',
            condicion_laboral_id: '', nivel_salarial_id: '',
            direccion_id: '', division_id: '', unidad_id: '',
            porcentaje_jubilacion: '',
            fecha_efectiva: new Date().toISOString().split('T')[0],
        });
        setErrorMessage('');
        setMensajeMostrado(false);
        setPaso(1);
    };

    const handleSiguiente = () => {
        if (!formData.cedula || !formData.nombres || !formData.apellidos) {
            setErrorMessage('Por favor complete Cédula, Nombres y Apellidos.');
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

        if (!formData.porcentaje_jubilacion || !formData.fecha_efectiva) {
            setErrorMessage('El porcentaje de jubilación y la fecha efectiva son obligatorios.');
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 4000);
            return;
        }
        const pct = Number(formData.porcentaje_jubilacion);
        if (isNaN(pct) || pct < 1 || pct > 100) {
            setErrorMessage('El porcentaje de jubilación debe ser un número entre 1 y 100.');
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 4000);
            return;
        }

        if (onSaveStart) onSaveStart();

        try {
            const response = await fetch('/api/jubilados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al registrar jubilado');

            limpiarFormulario();
            if (onSaveEnd) onSaveEnd(true, 'Jubilado registrado exitosamente.');
        } catch (error) {
            console.error('Error:', error);
            if (onSaveEnd) onSaveEnd(false, error.message);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {paso === 1
                        ? 'Registrar Jubilado — Datos Personales'
                        : 'Registrar Jubilado — Datos Laborales y Jubilación'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {mensajeMostrado && <Alert key="danger" type="danger">{errorMessage}</Alert>}

                <form onSubmit={handleSubmit}>

                    {/* ══════════ PASO 1: DATOS PERSONALES ══════════ */}
                    {paso === 1 && (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mt-2 text-primary mb-0">
                                    <i className="bx bx-user me-1"></i> 1. Datos Personales
                                </h6>
                                <small className="text-muted">* Campos obligatorios</small>
                            </div>

                            {/* Cédula y RIF */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cédula de Identidad *</Form.Label>
                                        <Form.Control type="text" name="cedula" placeholder="Ej: V-12345678"
                                            value={formData.cedula} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>RIF</Form.Label>
                                        <Form.Control type="text" name="rif" placeholder="Ej: V123456789"
                                            value={formData.rif} onChange={handleChange} />
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

                            {/* Nacimiento, Género, Estado Civil */}
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Nacimiento</Form.Label>
                                        <Form.Control type="date" name="fecha_nacimiento"
                                            value={formData.fecha_nacimiento} onChange={handleChange} />
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


                            {/* Correos */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Correo Principal</Form.Label>
                                        <Form.Control type="email" name="correo_principal"
                                            value={formData.correo_principal} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Correo Secundario</Form.Label>
                                        <Form.Control type="email" name="correo_secundario"
                                            value={formData.correo_secundario} onChange={handleChange} />
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

                            {/* Cuenta y Actividades */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nro. Cuenta Bancaria</Form.Label>
                                        <Form.Control type="text" name="cuenta_bancaria" maxLength={20}
                                            value={formData.cuenta_bancaria} onChange={handleChange} />
                                    </Form.Group>
                                </div>

                            </div>
                        </>
                    )}

                    {/* ══════════ PASO 2: DATOS LABORALES + JUBILACIÓN ══════════ */}
                    {paso === 2 && (
                        <>
                            {/* Contactos de emergencia */}
                            <h6 className="mt-2 mb-3 text-primary">
                                <i className="bx bx-first-aid me-1"></i> Contactos de Emergencia
                            </h6>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>1. Nombres y Apellidos</Form.Label>
                                        <Form.Control type="text" name="contacto_emergencia_1"
                                            value={formData.contacto_emergencia_1} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>1. Teléfono</Form.Label>
                                        <Form.Control type="text" name="telefono_emergencia_1"
                                            value={formData.telefono_emergencia_1} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>2. Nombres y Apellidos</Form.Label>
                                        <Form.Control type="text" name="contacto_emergencia_2"
                                            value={formData.contacto_emergencia_2} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>2. Teléfono</Form.Label>
                                        <Form.Control type="text" name="telefono_emergencia_2"
                                            value={formData.telefono_emergencia_2} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>

                            {/* Datos Laborales */}
                            <div className="d-flex justify-content-between align-items-center mb-3 mt-2">
                                <h6 className="text-primary mb-0">
                                    <i className="bx bx-briefcase me-1"></i> 2. Datos Laborales
                                </h6>
                                <small className="text-muted">* Campos obligatorios</small>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Ingreso</Form.Label>
                                        <Form.Control type="date" name="fecha_ingreso"
                                            value={formData.fecha_ingreso} onChange={handleChange} />
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
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Condición Laboral</Form.Label>
                                        <Form.Select name="condicion_laboral_id" value={formData.condicion_laboral_id} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            {catalogos.condicionesLaborales.map(c => (
                                                <option key={c.condicion_laboral_id} value={c.condicion_laboral_id}>{c.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cargo Interno (CET)</Form.Label>
                                        <Form.Select name="cargo_cet_id" value={formData.cargo_cet_id} onChange={handleChange}>
                                            <option value="">Seleccione cargo</option>
                                            {catalogos.cargosCET.map(c => (
                                                <option key={c.cargo_cet_id} value={c.cargo_cet_id}>{c.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Clasificación ONAPRE</Form.Label>
                                        <Form.Select name="cargo_onapre_id" value={formData.cargo_onapre_id} onChange={handleChange}>
                                            <option value="">Seleccione clasificación</option>
                                            {catalogos.cargosONAPRE && catalogos.cargosONAPRE.map(c => (
                                                <option key={c.cargo_onapre_id} value={c.cargo_onapre_id}>{c.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nivel Salarial (Salario)</Form.Label>
                                        <Form.Select name="nivel_salarial_id" value={formData.nivel_salarial_id} onChange={handleChange}
                                            disabled={!formData.cargo_onapre_id}>
                                            <option value="">Seleccione</option>
                                            {catalogos.niveles && catalogos.niveles.map(n => (
                                                <option key={n.nivel_salarial_id} value={n.nivel_salarial_id}>
                                                    {n.nombre} — {n.salario_base} Bs.
                                                </option>
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
                                        <Form.Label>Dirección</Form.Label>
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
                                            disabled={!formData.direccion_id || catalogos.divisiones?.length === 0}>
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
                                        <Form.Select name="unidad_id" value={formData.unidad_id} onChange={handleChange}
                                            disabled={!formData.division_id || catalogos.unidades?.length === 0}>
                                            <option value="">-- Directo a la División --</option>
                                            {catalogos.unidades?.map(u => (
                                                <option key={u.unidad_id} value={u.unidad_id}>{u.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            {/* Datos de Jubilación */}
                            <div className="d-flex justify-content-between align-items-center mb-3 mt-2">
                                <h6 className="text-primary mb-0">
                                    <i className="bx bx-medal me-1"></i> 3. Datos de Jubilación *
                                </h6>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Porcentaje de Jubilación * (1–100)</Form.Label>
                                        <Form.Control type="number" name="porcentaje_jubilacion" min="1" max="100"
                                            placeholder="Ej: 75" value={formData.porcentaje_jubilacion} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha Efectiva de Jubilación *</Form.Label>
                                        <Form.Control type="date" name="fecha_efectiva"
                                            value={formData.fecha_efectiva} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                            </div>
                        </>
                    )}
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button type='secondary' onClick={handleClose}>Cancelar</Button>
                {paso === 1 && (
                    <Button type='primary' onClick={handleSiguiente}>
                        Siguiente <i className="bx bx-right-arrow-alt ms-1"></i>
                    </Button>
                )}
                {paso === 2 && (
                    <>
                        <Button type='secondary' className="me-2" onClick={handleAtras}>
                            <i className="bx bx-left-arrow-alt me-1"></i> Atrás
                        </Button>
                        <Button type='secondary' className="me-2" onClick={limpiarFormulario}>
                            Limpiar
                        </Button>
                        <Button type='primary' onClick={handleSubmit}>
                            <i className="bx bx-save me-1"></i> Registrar Jubilado
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};