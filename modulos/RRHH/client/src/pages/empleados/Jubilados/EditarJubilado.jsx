import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../components/atoms/Buttons';
import Alert from '../../components/atoms/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';

export const EditarJubilado = ({ show, handleClose, onSaveStart, onSaveEnd, jubilado_id }) => {
    const [paso, setPaso] = useState(1);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [formData, setFormData] = useState({
        // ── Datos Personales ──
        cedula: '', nombres: '', apellidos: '', rif: '',
        fecha_nacimiento: '', genero: '', estado_civil: 'Soltero',
        direccion_habitacion: '', telefono_fijo: '', celular: '',
        correo_principal: '', correo_secundario: '', cuenta_bancaria: '',
        contacto_emergencia_1: '', telefono_emergencia_1: '',
        contacto_emergencia_2: '', telefono_emergencia_2: '',
        profesion_id: '',

        // ── Datos Laborales ──
        fecha_ingreso: '',
        cargo_cet_id: '', cargo_onapre_id: '', condicion_laboral_id: '',
        nivel_salarial_id: '', direccion_id: '', division_id: '', unidad_id: '',

        // ── Datos Jubilación ──
        porcentaje_jubilacion: '', fecha_efectiva: '',
    });

    const [catalogos, setCatalogos] = useState({
        profesiones: [], cargosCET: [],
        condicionesLaborales: [], niveles: [],
        direcciones: [], divisiones: [], unidades: [],
    });

    // Cargar datos del jubilado + catálogos al abrir
    useEffect(() => {
        if (!show || !jubilado_id) return;

        const fetchData = async () => {
            setIsLoadingData(true);
            setErrorMessage('');
            try {
                // Hay 6 catálogos necesarios + la data del jubilado (7 fetches total)
                const [proRes, cetRes, onaRes, dirRes, condRes, jubRes] = await Promise.all([
                    fetch('/api/profesiones'),
                    fetch('/api/cargos-cet'),
                    fetch('/api/cargos-onapre'),
                    fetch('/api/direcciones'),
                    fetch('/api/condiciones-laborales'),
                    fetch(`/api/jubilados/${jubilado_id}`),
                ]);

                if (!jubRes.ok) throw new Error('Error al obtener datos del jubilado');

                const [profesiones, cargosCET, cargosONAPRE, direcciones, condicionesLaborales, jub] = await Promise.all([
                    proRes.json(), cetRes.json(), onaRes.json(),
                    dirRes.json(), condRes.json(), jubRes.json(),
                ]);

                const dir_id = jub.direccion_id || '';
                const div_id = jub.division_id || '';
                const ona_id = jub.cargo_onapre_id || '';

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

                setCatalogos({
                    profesiones, cargosCET, cargosONAPRE, condicionesLaborales, direcciones,
                    divisiones: divisionesFetch, unidades: unidadesFetch, niveles: nivelesFetch,
                });

                const fmt = (s) => {
                    if (!s) return '';
                    const d = new Date(s);
                    return isNaN(d) ? '' : d.toISOString().split('T')[0];
                };

                setFormData({
                    cedula: jub.cedula || '',
                    nombres: jub.nombres || '',
                    apellidos: jub.apellidos || '',
                    rif: jub.rif || '',
                    fecha_nacimiento: fmt(jub.fecha_nacimiento),
                    lugar_nacimiento: jub.lugar_nacimiento || '',
                    genero: jub.genero || '',
                    estado_civil: jub.estado_civil || 'Soltero',
                    tipo_sangre: jub.tipo_sangre || '',
                    direccion_habitacion: jub.direccion_habitacion || '',
                    telefono_fijo: jub.telefono_fijo || '',
                    celular: jub.celular || '',
                    correo_principal: jub.correo_principal || '',
                    correo_secundario: jub.correo_secundario || '',
                    cuenta_bancaria: jub.cuenta_bancaria || '',
                    contacto_emergencia_1: jub.contacto_emergencia_1 || '',
                    telefono_emergencia_1: jub.telefono_emergencia_1 || '',
                    contacto_emergencia_2: jub.contacto_emergencia_2 || '',
                    telefono_emergencia_2: jub.telefono_emergencia_2 || '',
                    profesion_id: jub.profesion_id || '',
                    fecha_ingreso: fmt(jub.fecha_ingreso),
                    cargo_cet_id: jub.cargo_cet_id || '',
                    cargo_onapre_id: jub.cargo_onapre_id || '',
                    condicion_laboral_id: jub.condicion_laboral_id || '',
                    nivel_salarial_id: jub.nivel_salarial_id || '',
                    direccion_id: jub.direccion_id || '',
                    division_id: jub.division_id || '',
                    unidad_id: jub.unidad_id || '',
                    porcentaje_jubilacion: jub.porcentaje_jubilacion || '',
                    fecha_efectiva: fmt(jub.fecha_efectiva),
                });

            } catch (error) {
                console.error('Error al cargar datos del jubilado:', error);
                setErrorMessage('Error cargando los datos. Verifique la conexión.');
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
        setPaso(1);
        setMensajeMostrado(false);
        setErrorMessage('');
    }, [show, jubilado_id]);

    // Cascadas
    useEffect(() => {
        if (!formData.direccion_id || !show || isLoadingData) return;
        fetch(`/api/divisiones?direccion_id=${formData.direccion_id}`)
            .then(r => r.json())
            .then(data => setCatalogos(prev => ({ ...prev, divisiones: data })))
            .catch(console.error);
    }, [formData.direccion_id]);

    useEffect(() => {
        if (!formData.division_id || !show || isLoadingData) return;
        fetch(`/api/unidades?division_id=${formData.division_id}`)
            .then(r => r.json())
            .then(data => setCatalogos(prev => ({ ...prev, unidades: data })))
            .catch(console.error);
    }, [formData.division_id]);

    useEffect(() => {
        if (!formData.cargo_onapre_id || !show || isLoadingData) return;
        fetch(`/api/niveles-salariales?cargo_onapre_id=${formData.cargo_onapre_id}`)
            .then(r => r.json())
            .then(data => setCatalogos(prev => ({ ...prev, niveles: data })))
            .catch(console.error);
    }, [formData.cargo_onapre_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'direccion_id') { newData.division_id = ''; newData.unidad_id = ''; setCatalogos(c => ({ ...c, unidades: [] })); }
            else if (name === 'division_id') { newData.unidad_id = ''; }
            else if (name === 'cargo_onapre_id') { newData.nivel_salarial_id = ''; }
            return newData;
        });
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

        if (formData.porcentaje_jubilacion) {
            const pct = Number(formData.porcentaje_jubilacion);
            if (isNaN(pct) || pct < 1 || pct > 100) {
                setErrorMessage('El porcentaje de jubilación debe estar entre 1 y 100.');
                setMensajeMostrado(true);
                setTimeout(() => setMensajeMostrado(false), 3000);
                return;
            }
        }

        if (onSaveStart) onSaveStart();

        try {
            const response = await fetch(`/api/jubilados/${jubilado_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al actualizar jubilado');

            if (onSaveEnd) onSaveEnd(true, 'Jubilado actualizado exitosamente.');
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
                        ? 'Editar Jubilado — Datos Personales'
                        : 'Editar Jubilado — Datos Laborales y Jubilación'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-light">
                {isLoadingData ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Cargando datos del jubilado...</p>
                    </div>
                ) : (
                    <>
                        {mensajeMostrado && <Alert key="danger" type="danger">{errorMessage}</Alert>}

                        <form onSubmit={handleSubmit}>

                            {/* ══════════ PASO 1: DATOS PERSONALES ══════════ */}
                            {paso === 1 && (
                                <div className="card shadow-sm border-0 mb-3">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mt-2 text-primary mb-0">
                                                <i className="bx bx-user me-2"></i>1. Datos Personales
                                            </h6>
                                            <small className="text-muted">* Campos obligatorios</small>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Cédula *</Form.Label>
                                                    <Form.Control type="text" name="cedula" value={formData.cedula} onChange={handleChange} required />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>RIF</Form.Label>
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



                                        <div className="row mb-3">
                                            <div className="col-md-4">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Tipo de Sangre</Form.Label>
                                                    <Form.Control type="text" name="tipo_sangre" value={formData.tipo_sangre} onChange={handleChange} />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-4">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Teléfono Residencial</Form.Label>
                                                    <Form.Control type="text" name="telefono_fijo" value={formData.telefono_fijo} onChange={handleChange} />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-4">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Teléfono Celular</Form.Label>
                                                    <Form.Control type="text" name="celular" value={formData.celular} onChange={handleChange} />
                                                </Form.Group>
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Correo Principal</Form.Label>
                                                    <Form.Control type="email" name="correo_principal" value={formData.correo_principal} onChange={handleChange} />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Correo Secundario</Form.Label>
                                                    <Form.Control type="email" name="correo_secundario" value={formData.correo_secundario} onChange={handleChange} />
                                                </Form.Group>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Dirección de Habitación</Form.Label>
                                                <Form.Control as="textarea" rows={2} name="direccion_habitacion" value={formData.direccion_habitacion} onChange={handleChange} />
                                            </Form.Group>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-4">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Nro. Cuenta Bancaria</Form.Label>
                                                    <Form.Control type="text" name="cuenta_bancaria" maxLength={20} value={formData.cuenta_bancaria} onChange={handleChange} />
                                                </Form.Group>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ══════════ PASO 2: DATOS LABORALES Y JUBILACIÓN ══════════ */}
                            {paso === 2 && (
                                <>
                                    {/* Contactos emergencia */}
                                    <div className="card shadow-sm border-0 mb-4">
                                        <div className="card-body">
                                            <h6 className="mt-2 text-primary mb-3">
                                                <i className="bx bx-first-aid me-2"></i>Contactos de Emergencia
                                            </h6>
                                            <div className="row mb-3">
                                                <div className="col-md-6">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>1. Nombres y Apellidos</Form.Label>
                                                        <Form.Control type="text" name="contacto_emergencia_1" value={formData.contacto_emergencia_1} onChange={handleChange} />
                                                    </Form.Group>
                                                </div>
                                                <div className="col-md-6">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>1. Teléfono</Form.Label>
                                                        <Form.Control type="text" name="telefono_emergencia_1" value={formData.telefono_emergencia_1} onChange={handleChange} />
                                                    </Form.Group>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>2. Nombres y Apellidos</Form.Label>
                                                        <Form.Control type="text" name="contacto_emergencia_2" value={formData.contacto_emergencia_2} onChange={handleChange} />
                                                    </Form.Group>
                                                </div>
                                                <div className="col-md-6">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>2. Teléfono</Form.Label>
                                                        <Form.Control type="text" name="telefono_emergencia_2" value={formData.telefono_emergencia_2} onChange={handleChange} />
                                                    </Form.Group>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Datos laborales */}
                                    <div className="card shadow-sm border-0 mb-3">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center mb-3 mt-2">
                                                <h6 className="text-primary mb-0">
                                                    <i className="bx bx-briefcase me-2"></i>2. Datos Laborales
                                                </h6>
                                            </div>

                                            <div className="row mb-3">
                                                <div className="col-md-4">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Fecha de Ingreso</Form.Label>
                                                        <Form.Control type="date" name="fecha_ingreso" value={formData.fecha_ingreso} onChange={handleChange} />
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
                                                            <option value="">Seleccione</option>
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
                                                            {catalogos.niveles.map(n => (
                                                                <option key={n.nivel_salarial_id} value={n.nivel_salarial_id}>
                                                                    {n.nombre} — {n.salario_base} Bs.
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </div>
                                            </div>

                                            <h6 className="mt-4 mb-3 text-secondary border-bottom pb-2">Ubicación Organizacional</h6>
                                            <div className="row mb-2">
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
                                        </div>
                                    </div>

                                    {/* Datos de Jubilación */}
                                    <div className="card shadow-sm border-0 mb-3">
                                        <div className="card-body">
                                            <h6 className="mt-2 text-primary mb-3">
                                                <i className="bx bx-medal me-2"></i>3. Datos de Jubilación
                                            </h6>
                                            <div className="row mb-3">
                                                <div className="col-md-6">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Porcentaje de Jubilación (1–100)</Form.Label>
                                                        <Form.Control type="number" name="porcentaje_jubilacion"
                                                            min="1" max="100" value={formData.porcentaje_jubilacion} onChange={handleChange} />
                                                    </Form.Group>
                                                </div>
                                                <div className="col-md-6">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Fecha Efectiva de Jubilación</Form.Label>
                                                        <Form.Control type="date" name="fecha_efectiva" value={formData.fecha_efectiva} onChange={handleChange} />
                                                    </Form.Group>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </form>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-white border-top">
                <Button type='secondary' onClick={handleClose} disabled={isLoadingData}>Cancelar</Button>
                {paso === 1 && (
                    <Button type='primary' onClick={handleSiguiente} disabled={isLoadingData}>
                        Siguiente <i className="bx bx-right-arrow-alt ms-1"></i>
                    </Button>
                )}
                {paso === 2 && (
                    <>
                        <Button type='secondary' className="me-2" onClick={handleAtras} disabled={isLoadingData}>
                            <i className="bx bx-left-arrow-alt me-1"></i> Atrás
                        </Button>
                        <Button type='primary' onClick={handleSubmit} disabled={isLoadingData}>
                            <i className="bx bx-save me-1"></i> Guardar Cambios
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};
