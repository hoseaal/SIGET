import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../../components/atoms/Buttons';
import Alert from '../../../components/atoms/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import { useSelectsDependientes } from '../../../hooks/useSelectsDependientes';

const CARGO_REGEX = /OBRERO|ASEADOR|MENSAJERO|VIGILANTE/i;

export const EditarObrero = ({ show, handleClose, onSaveStart, onSaveEnd, empleado_id }) => {
    const [paso, setPaso] = useState(1);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [formData, setFormData] = useState({
        cedula: '', nombres: '', apellidos: '', rif: '',
        fecha_nacimiento: '', lugar_nacimiento: '', genero: '', estado_civil: 'Soltero',
        tipo_sangre: '', direccion_habitacion: '', telefono_fijo: '', celular: '',
        correo_principal: '', correo_secundario: '', fecha_ingreso: '',
        contacto_emergencia_1: '', telefono_emergencia_1: '',
        contacto_emergencia_2: '', telefono_emergencia_2: '',
        deportes: '', actividades_culturales: '',
        estatus_id: 1, cuenta_bancaria: '',
        cargo_cet_id: '', cargo_onapre_id: '', nivel_salarial_id: '',
        direccion_id: '', division_id: '', unidad_id: ''
    });

    const [catalogos, setCatalogos] = useState({
        cargosCET: [], cargosONAPRE: [],
        niveles: [], direcciones: [], divisiones: [], unidades: []
    });

    // Hook de selects dependientes
    const {
        cargosCETFiltrados,
        divisionesFiltradas,
        unidadesFiltradas,
        tieneDivisiones,
        tieneUnidades,
    } = useSelectsDependientes(formData, catalogos);

    // Cargar datos del obrero + catálogos al abrir
    useEffect(() => {
        if (!show || !empleado_id) return;

        const fetchData = async () => {
            setIsLoadingData(true);
            setErrorMessage('');
            try {
                const [cetRes, onaRes, dirRes, divRes, uniRes, obreroRes] = await Promise.all([
                    fetch('/api/cargos-cet'),
                    fetch('/api/cargos-onapre'),
                    fetch('/api/direcciones'),
                    fetch('/api/divisiones'),
                    fetch('/api/unidades'),
                    fetch(`/api/obreros/${empleado_id}`)
                ]);

                if (!obreroRes.ok) throw new Error('Error al obtener datos del obrero');

                const [cargosCETAll, cargosONAPREAll, direcciones, divisiones, unidades, obreroRaw] = await Promise.all([
                    cetRes.json(), onaRes.json(), dirRes.json(), divRes.json(), uniRes.json(), obreroRes.json()
                ]);

                const cargosONAPRE = cargosONAPREAll.filter(c => CARGO_REGEX.test(c.nombre));
                const obrero = obreroRaw.data || obreroRaw.datos_personales || obreroRaw;
                const ona_id = obrero.cargo_onapre_id || '';
                let nivelesFetch = [];

                if (ona_id) {
                    const res = await fetch(`/api/niveles-salariales?cargo_onapre_id=${ona_id}`);
                    const nivelesData = await res.json();
                    const data = nivelesData.success ? nivelesData.data : nivelesData;
                    nivelesFetch = Array.isArray(data) ? data.map(n => ({
                        ...n,
                        campo_completo: n.campo_completo || `${n.nombre}`.trim()
                    })) : [];
                }

                setCatalogos({
                    cargosCET: cargosCETAll, cargosONAPRE,
                    direcciones, divisiones, unidades, niveles: nivelesFetch
                });

                const formatDate = (s) => {
                    if (!s) return '';
                    const d = new Date(s);
                    return isNaN(d) ? '' : d.toISOString().split('T')[0];
                };

                setFormData({
                    cedula: obrero.cedula || '',
                    nombres: obrero.nombres || '',
                    apellidos: obrero.apellidos || '',
                    rif: obrero.rif || '',
                    fecha_nacimiento: formatDate(obrero.fecha_nacimiento),
                    lugar_nacimiento: obrero.lugar_nacimiento || '',
                    genero: obrero.genero || '',
                    estado_civil: obrero.estado_civil || 'Soltero',
                    tipo_sangre: obrero.tipo_sangre || '',
                    direccion_habitacion: obrero.direccion_habitacion || '',
                    telefono_fijo: obrero.telefono_fijo || '',
                    celular: obrero.celular || '',
                    correo_principal: obrero.correo_principal || '',
                    correo_secundario: obrero.correo_secundario || '',
                    fecha_ingreso: formatDate(obrero.fecha_ingreso),
                    contacto_emergencia_1: obrero.contacto_emergencia_1 || '',
                    telefono_emergencia_1: obrero.telefono_emergencia_1 || '',
                    contacto_emergencia_2: obrero.contacto_emergencia_2 || '',
                    telefono_emergencia_2: obrero.telefono_emergencia_2 || '',
                    deportes: obrero.deportes || '',
                    actividades_culturales: obrero.actividades_culturales || '',
                    estatus_id: obrero.estatus_id || 1,
                    cuenta_bancaria: obrero.cuenta_bancaria || '',
                    cargo_cet_id: obrero.cargo_cet_id || '',
                    cargo_onapre_id: obrero.cargo_onapre_id || '',
                    nivel_salarial_id: obrero.nivel_salarial_id || '',
                    direccion_id: obrero.direccion_id || '',
                    division_id: obrero.division_id || '',
                    unidad_id: obrero.unidad_id || ''
                });

            } catch (error) {
                console.error('Error inicializando modal de edición:', error);
                setErrorMessage('Error cargando los datos. Verifique la conexión.');
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
        setPaso(1);
        setMensajeMostrado(false);
        setErrorMessage('');
    }, [show, empleado_id]);

    // Cascada Cargo ONAPRE → Niveles (se mantiene API)
    useEffect(() => {
        if (!formData.cargo_onapre_id || !show || isLoadingData) return;
        const fetch_ = async () => {
            try {
                const res = await fetch(`/api/niveles-salariales?cargo_onapre_id=${formData.cargo_onapre_id}`);
                const nivelesData = await res.json();
                const data = nivelesData.success ? nivelesData.data : nivelesData;
                const nivelesFormateados = Array.isArray(data) ? data.map(n => ({
                    ...n,
                    campo_completo: n.campo_completo || `${n.nombre}`.trim()
                })) : [];
                setCatalogos(prev => ({ ...prev, niveles: nivelesFormateados }));
            } catch (e) { console.error(e); }
        };
        fetch_();
    }, [formData.cargo_onapre_id, isLoadingData]);
    // Nota: Divisiones y Unidades se filtran localmente via useSelectsDependientes

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
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

        if (!formData.direccion_id) {
            setErrorMessage('La Dirección de Adscripción es obligatoria.');
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 3000);
            return;
        }

        if (onSaveStart) onSaveStart();

        try {
            const response = await fetch(`/api/obreros/${empleado_id}`, {   // ← endpoint de obreros
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al actualizar obrero');

            if (onSaveEnd) onSaveEnd(true, 'Obrero actualizado exitosamente.');
        } catch (error) {
            console.error('Error:', error);
            if (onSaveEnd) onSaveEnd(false, error.message);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {paso === 1 ? 'Editar Obrero Fijo — Datos Personales' : 'Editar Obrero Fijo — Datos Laborales'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-light">
                {isLoadingData ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Cargando datos del obrero...</p>
                    </div>
                ) : (
                    <>
                        {mensajeMostrado && <Alert key="danger" type="danger">{errorMessage}</Alert>}

                        <form onSubmit={handleSubmit}>
                            {paso === 1 && (
                                <div className="card shadow-sm border-0 mb-3">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mt-2 text-primary mb-0"><i className="bx bx-user me-2"></i>1. Datos Personales</h6>
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
                                                    <Form.Label>Teléfono Fijo</Form.Label>
                                                    <Form.Control type="text" name="telefono_fijo" value={formData.telefono_fijo} onChange={handleChange} />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-4">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Celular</Form.Label>
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

                                        <div className="row mb-3">
                                            <div className="col-md-12">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Número de Cuenta Bancaria</Form.Label>
                                                    <Form.Control type="text" name="cuenta_bancaria" placeholder="Ej: 01020000000000000000" value={formData.cuenta_bancaria} onChange={handleChange} maxLength="20" />
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
                                                    <Form.Label>Deportes</Form.Label>
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
                                    </div>
                                </div>
                            )}

                            {paso === 2 && (
                                <>
                                    {/* Contactos emergencia */}
                                    <div className="card shadow-sm border-0 mb-4">
                                        <div className="card-body">
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
                                                <h6 className="text-primary mb-0"><i className="bx bx-briefcase me-2"></i>2. Datos Laborales</h6>
                                                <small className="text-muted">* Campos obligatorios</small>
                                            </div>

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
                                {/* Estatus oculto */}
                                            </div>

                                            <div className="row mb-3">
                                                <div className="col-md-4">
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
                                                <div className="col-md-4">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Cargo CET *</Form.Label>
                                                        <Form.Select
                                                            name="cargo_cet_id"
                                                            value={formData.cargo_cet_id}
                                                            onChange={handleChange}
                                                            required
                                                            disabled={!formData.cargo_onapre_id || cargosCETFiltrados.length === 0}
                                                        >
                                                            <option value="">Seleccione cargo CET</option>
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
                                                        <Form.Label>Nivel Salarial</Form.Label>
                                                        <Form.Select name="nivel_salarial_id" value={formData.nivel_salarial_id} onChange={handleChange} disabled={!formData.cargo_onapre_id}>
                                                            <option value="">Seleccione</option>
                                                            {catalogos.niveles.map(n => (
                                                                <option key={n.nivel_salarial_id} value={n.nivel_salarial_id}>{n.nombre} — {n.salario_base} Bs.</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </div>
                                            </div>

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
                                                        <Form.Select name="division_id" value={formData.division_id} onChange={handleChange} disabled={!formData.direccion_id}>
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
                                                        <Form.Select name="unidad_id" value={formData.unidad_id} onChange={handleChange} disabled={!formData.direccion_id}>
                                                            <option value="">{formData.division_id ? '-- Directo a la División --' : '-- Directo a la Dirección --'}</option>
                                                            {unidadesFiltradas.map(u => (
                                                                <option key={u.unidad_id} value={u.unidad_id}>{u.nombre}</option>
                                                            ))}
                                                        </Form.Select>
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
                            <i className="bx bx-left-arrow-alt me-1"></i>Atrás
                        </Button>
                        <Button type='primary' onClick={handleSubmit} disabled={isLoadingData}>
                            <i className="bx bx-save me-1"></i>Guardar Cambios
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};
