import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../components/atoms/Buttons';
import Alert from '../../components/atoms/Alert';
import Modal from 'react-bootstrap/Modal';

const CARGO_REGEX = /OBRERO|ASEADOR|MENSAJERO|VIGILANTE/i;

export const RegistrarObrero = ({ show, handleClose, onSaveStart, onSaveEnd }) => {
    const [paso, setPaso] = useState(1);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        // Datos Personales
        cedula: '',
        nombres: '',
        apellidos: '',
        rif: '',
        fecha_nacimiento: '',
        lugar_nacimiento: '',
        genero: '',
        estado_civil: 'Soltero',
        tipo_sangre: '',
        direccion_habitacion: '',
        telefono_fijo: '',
        celular: '',
        correo_principal: '',
        correo_secundario: '',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        contacto_emergencia_1: '',
        telefono_emergencia_1: '',
        contacto_emergencia_2: '',
        telefono_emergencia_2: '',
        deportes: '',
        actividades_culturales: '',
        profesion_id: '',
        estatus_id: 1,
        nro_cuenta_bancaria: '',

        // Datos Contractuales (condicion_laboral_id siempre = 1, lo maneja el backend)
        cargo_cet_id: '',
        cargo_onapre_id: '',
        nivel_salarial_id: '',
        direccion_id: '',
        division_id: '',
        unidad_id: ''
    });

    const [catalogos, setCatalogos] = useState({
        profesiones: [],
        estatus: [],
        cargosCET: [],       // filtrados: solo Obrero/Aseador/Mensajero/Vigilante
        cargosONAPRE: [],    // filtrados
        niveles: [],
        direcciones: [],
        divisiones: [],
        unidades: []
    });

    // Cargar catálogos al abrir el modal
    useEffect(() => {
        if (!show) return;

        const fetchCatalogos = async () => {
            try {
                const [proRes, estRes, cetRes, onaRes, dirRes] = await Promise.all([
                    fetch('/api/profesiones'),
                    fetch('/api/estatus'),
                    fetch('/api/cargos-cet'),
                    fetch('/api/cargos-onapre'),
                    fetch('/api/direcciones')
                ]);

                const [profesiones, estatus, cargosCETAll, cargosONAPREAll, direcciones] = await Promise.all([
                    proRes.json(), estRes.json(), cetRes.json(), onaRes.json(), dirRes.json()
                ]);

                // Filtrar solo los cargos válidos para obreros
                const cargosCET = cargosCETAll.filter(c => CARGO_REGEX.test(c.nombre));
                const cargosONAPRE = cargosONAPREAll.filter(c => CARGO_REGEX.test(c.nombre));

                setCatalogos(prev => ({
                    ...prev, profesiones, estatus, cargosCET, cargosONAPRE, direcciones,
                    niveles: [], divisiones: [], unidades: []
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
        const fetchDivisiones = async () => {
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
        fetchDivisiones();
    }, [formData.direccion_id]);

    // Cascada: Unidades según División
    useEffect(() => {
        const fetchUnidades = async () => {
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
        fetchUnidades();
    }, [formData.division_id]);

    // Cascada: Niveles salariales según Cargo ONAPRE
    useEffect(() => {
        const fetchNiveles = async () => {
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
        fetchNiveles();
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
            correo_principal: '', correo_secundario: '',
            fecha_ingreso: new Date().toISOString().split('T')[0],
            contacto_emergencia_1: '', telefono_emergencia_1: '',
            contacto_emergencia_2: '', telefono_emergencia_2: '',
            deportes: '', actividades_culturales: '', profesion_id: '', estatus_id: 1,
            nro_cuenta_bancaria: '', cargo_cet_id: '', cargo_onapre_id: '', nivel_salarial_id: '',
            direccion_id: '', division_id: '', unidad_id: ''
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

        if (!formData.cargo_cet_id || !formData.cargo_onapre_id) {
            setErrorMessage('Cargo CET y Clasificación ONAPRE son obligatorios para un Obrero Fijo.');
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 4000);
            return;
        }
        if (!formData.direccion_id) {
            setErrorMessage('La Dirección de Adscripción es obligatoria.');
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 3000);
            return;
        }

        if (onSaveStart) onSaveStart();

        try {
            // condicion_laboral_id=1 (Fijo) lo añade el backend automáticamente
            const response = await fetch('/api/obreros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al registrar obrero');

            limpiarFormulario();
            if (onSaveEnd) onSaveEnd(true, 'Obrero registrado exitosamente.');
        } catch (error) {
            console.error('Error:', error);
            if (onSaveEnd) onSaveEnd(false, error.message);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {paso === 1 ? 'Registrar Obrero Fijo — Datos Personales' : 'Registrar Obrero Fijo — Datos Laborales'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {mensajeMostrado && <Alert key="danger" type="danger">{errorMessage}</Alert>}

                <form onSubmit={handleSubmit}>
                    {paso === 1 && (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mt-2 text-primary mb-0">1. Datos Personales</h6>
                                <small className="text-muted">* Campos obligatorios</small>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cédula de Identidad *</Form.Label>
                                        <Form.Control type="text" name="cedula" placeholder="Ej: V-12345678" value={formData.cedula} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>RIF (Opcional)</Form.Label>
                                        <Form.Control type="text" name="rif" placeholder="Ej: V123456789" value={formData.rif} onChange={handleChange} />
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
                                        <Form.Label>Teléfono Fijo</Form.Label>
                                        <Form.Control type="text" name="telefono_fijo" placeholder="0276-0000000" value={formData.telefono_fijo} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Celular</Form.Label>
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
                                        <Form.Label>Correo Secundario</Form.Label>
                                        <Form.Control type="email" name="correo_secundario" value={formData.correo_secundario} onChange={handleChange} />
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
                            {/* Contactos de emergencia */}
                            <h6 className="mt-2 mb-3 text-primary">En caso de emergencia avisar a:</h6>
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
                            <div className="row mb-4">
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

                            {/* Datos Laborales */}
                            <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                                <h6 className="text-primary mb-0">2. Datos Laborales</h6>
                                <small className="text-muted">* Campos obligatorios</small>
                            </div>

                            {/* Nota informativa */}
                            <div className="alert alert-info py-2 mb-3">
                                <i className="bx bx-info-circle me-1"></i>
                                <strong>Condición Laboral:</strong> Fijo (asignado automáticamente)
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
                                        <Form.Label>Cargo CET *</Form.Label>
                                        <Form.Select name="cargo_cet_id" value={formData.cargo_cet_id} onChange={handleChange} required>
                                            <option value="">Seleccione cargo CET</option>
                                            {catalogos.cargosCET.map(c => (
                                                <option key={c.cargo_cet_id} value={c.cargo_cet_id}>{c.nombre}</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Text className="text-muted">Solo cargos: Obrero, Aseador, Mensajero, Vigilante</Form.Text>
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Clasificación ONAPRE *</Form.Label>
                                        <Form.Select name="cargo_onapre_id" value={formData.cargo_onapre_id} onChange={handleChange} required>
                                            <option value="">Seleccione clasificación ONAPRE</option>
                                            {catalogos.cargosONAPRE.map(o => (
                                                <option key={o.cargo_onapre_id} value={o.cargo_onapre_id}>{o.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nivel Salarial</Form.Label>
                                        <Form.Select name="nivel_salarial_id" value={formData.nivel_salarial_id} onChange={handleChange} disabled={!formData.cargo_onapre_id}>
                                            <option value="">Seleccione</option>
                                            {catalogos.niveles.map(n => (
                                                <option key={n.nivel_salarial_id} value={n.nivel_salarial_id}>{n.niv_nom} — {n.salario_base} Bs.</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nro. Cuenta Bancaria</Form.Label>
                                        <Form.Control type="text" name="nro_cuenta_bancaria" value={formData.nro_cuenta_bancaria} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>

                            {/* Ubicación Organizacional */}
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
                                        <Form.Select name="division_id" value={formData.division_id} onChange={handleChange} disabled={!formData.direccion_id || catalogos.divisiones?.length === 0}>
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
                                        <Form.Select name="unidad_id" value={formData.unidad_id} onChange={handleChange} disabled={!formData.division_id || catalogos.unidades?.length === 0}>
                                            <option value="">-- Directo a la División --</option>
                                            {catalogos.unidades?.map(u => (
                                                <option key={u.unidad_id} value={u.unidad_id}>{u.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-12 mt-2">
                                    <Form.Text className="text-muted">
                                        <i className="bx bx-info-circle me-1"></i>
                                        Seleccione el nivel más profundo al que pertenece el obrero.
                                    </Form.Text>
                                </div>
                            </div>
                        </>
                    )}
                </form>
            </Modal.Body>
            <Modal.Footer>
                {paso === 1 && <Button type='primary' onClick={handleSiguiente}>Siguiente</Button>}
                {paso === 2 && (
                    <>
                        <Button type='secondary' className="me-2" onClick={handleAtras}>Atrás</Button>
                        <Button type='secondary' className="me-2" onClick={limpiarFormulario}>Limpiar</Button>
                        <Button type='primary' onClick={handleSubmit}>Registrar Obrero</Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};