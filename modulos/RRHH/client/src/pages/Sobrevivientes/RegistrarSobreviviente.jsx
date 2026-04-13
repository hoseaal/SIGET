import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../components/atoms/Buttons';
import Alert from '../../components/atoms/Alert';
import Modal from 'react-bootstrap/Modal';

// Componente para registrar nuevos sobrevivientes
const RegistrarSobreviviente = ({ show, handleClose, onSaveStart, onSaveEnd }) => {
    const [paso, setPaso] = useState(1);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        // ── Datos Personales (tabla empleados) ──
        cedula: '',
        nombres: '',
        apellidos: '',
        direccion_habitacion: '',
        profesion_id: '',

        // ── Datos Laborales ──
        fecha_ingreso: '',
        cargo_cet_id: '',
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
    });

    const [catalogos, setCatalogos] = useState({
        profesiones: [],
        cargosCET: [],
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
                const [proRes, cetRes, dirRes, condRes] = await Promise.all([
                    fetch('/api/profesiones'),
                    fetch('/api/cargos-cet'),
                    fetch('/api/direcciones'),
                    fetch('/api/condiciones-laborales'),
                ]);

                const [profesiones, cargosCET, direcciones, condicionesLaborales] = await Promise.all([
                    proRes.json(), cetRes.json(), dirRes.json(), condRes.json(),
                ]);

                setCatalogos(prev => ({
                    ...prev,
                    profesiones,
                    cargosCET,
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'direccion_id') { newData.division_id = ''; newData.unidad_id = ''; }
            else if (name === 'division_id') { newData.unidad_id = ''; }
            return newData;
        });
    };

    const limpiarFormulario = () => {
        setFormData({
            cedula: '', nombres: '', apellidos: '',
            direccion_habitacion: '',
            profesion_id: '',
            fecha_ingreso: '', cargo_cet_id: '',
            condicion_laboral_id: '', nivel_salarial_id: '',
            direccion_id: '', division_id: '', unidad_id: '',
            familiar_nombres: '', familiar_apellidos: '',
            familiar_fecha_nacimiento: '', familiar_parentesco: '',
            familiar_direccion: '', familiar_telefono: '', familiar_cuenta_bancaria: '',
        });
        setErrorMessage('');
        setMensajeMostrado(false);
        setPaso(1);
    };

    const handleSiguiente = () => {
        if (paso === 1) {
            if (!formData.cedula || !formData.nombres || !formData.apellidos) {
                setErrorMessage('Por favor complete Cédula, Nombres y Apellidos.');
                setMensajeMostrado(true);
                setTimeout(() => setMensajeMostrado(false), 3000);
                return;
            }
        }
        setErrorMessage('');
        setMensajeMostrado(false);
        setPaso(prev => prev + 1);
    };

    const handleAtras = () => {
        setErrorMessage('');
        setMensajeMostrado(false);
        setPaso(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.familiar_nombres || !formData.familiar_apellidos || !formData.familiar_fecha_nacimiento) {
            setErrorMessage('Por favor complete los nombres, apellidos y fecha de nacimiento del familiar sobreviviente.');
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 3000);
            return;
        }

        const birthDate = new Date(formData.familiar_fecha_nacimiento);
        const current = new Date();
        let age = current.getFullYear() - birthDate.getFullYear();
        const m = current.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && current.getDate() < birthDate.getDate())) {
            age--;
        }
        
        if (age < 18) {
            setErrorMessage('El familiar debe ser mayor o igual a 18 años.');
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 3000);
            return;
        }

        if (onSaveStart) onSaveStart();

        try {
            const response = await fetch('/api/sobrevivientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al registrar sobreviviente');

            limpiarFormulario();
            if (onSaveEnd) onSaveEnd(true, 'Sobreviviente registrado exitosamente.');
        } catch (error) {
            console.error('Error:', error);
            if (onSaveEnd) onSaveEnd(false, error.message);
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
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{getTituloPaso()}</Modal.Title>
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
                                            <option value="padre">Padre</option>
                                            <option value="madre">Madre</option>
                                            <option value="hermano">Hermano(a)</option>
                                            <option value="otro">Otro</option>
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
                        </>
                    )}
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button type='secondary' onClick={handleClose}>Cancelar</Button>
                {paso > 1 && (
                    <Button type='secondary' className="me-2" onClick={handleAtras}>
                        <i className="bx bx-left-arrow-alt me-1"></i> Atrás
                    </Button>
                )}
                {paso < 3 && (
                    <Button type='primary' onClick={handleSiguiente}>
                        Siguiente <i className="bx bx-right-arrow-alt ms-1"></i>
                    </Button>
                )}
                {paso === 3 && (
                    <>
                        <Button type='secondary' className="me-2" onClick={limpiarFormulario}>
                            Limpiar
                        </Button>
                        <Button type='primary' onClick={handleSubmit}>
                            <i className="bx bx-save me-1"></i> Registrar Sobreviviente
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default RegistrarSobreviviente;
