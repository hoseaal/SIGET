import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../../components/atoms/Buttons';
import Alert from '../../../components/atoms/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import { useSelectsDependientes } from '../../../hooks/useSelectsDependientes';
import { useNotifications } from '../../../hooks/NotificationContext';

export const EditarPensionado = ({ show, handleClose, onSaveStart, onSaveEnd, pensionado_id }) => {
    const { refreshNotifications } = useNotifications();
    const [paso, setPaso] = useState(1);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [formData, setFormData] = useState({
        // ── Datos Personales ──
        cedula: '', nombres: '', apellidos: '', rif: '',
        fecha_nacimiento: '', lugar_nacimiento: '', genero: '', estado_civil: 'Soltero',
        tipo_sangre: '', direccion_habitacion: '', telefono_fijo: '', celular: '',
        correo_principal: '', correo_secundario: '', cuenta_bancaria: '',
        contacto_emergencia_1: '', telefono_emergencia_1: '',
        contacto_emergencia_2: '', telefono_emergencia_2: '',
        profesion_id: '', prima_profesional_id: '',

        // ── Datos Laborales ──
        fecha_ingreso: '',
        cargo_cet_id: '', cargo_onapre_id: '', condicion_laboral_id: '',
        nivel_salarial_id: '', direccion_id: '', division_id: '', unidad_id: '',

        // ── Datos Pensión ──
        fecha_ingreso_pension: '',
        motivo_pension: '',
        observacion: '',
    });

    const [catalogos, setCatalogos] = useState({
        profesiones: [], primasProfesionales: [], cargosCET: [], cargosONAPRE: [],
        condicionesLaborales: [], niveles: [],
        direcciones: [], divisiones: [], unidades: [],
    });

    const {
        cargosCETFiltrados,
        divisionesFiltradas,
        unidadesFiltradas,
        tieneDivisiones,
        tieneUnidades,
    } = useSelectsDependientes(formData, catalogos);

    // Cargar datos del pensionado + catálogos al abrir
    useEffect(() => {
        if (!show || !pensionado_id) return;

        const fetchData = async () => {
            setIsLoadingData(true);
            setErrorMessage('');
            try {
                const [proRes, primasProfRes, cetRes, onaRes, dirRes, condRes, divRes, uniRes, jubRes] = await Promise.all([
                    fetch('/api/rrhh/profesiones'),
                    fetch('/api/rrhh/primas-profesionalizacion'),
                    fetch('/api/rrhh/cargos-cet'),
                    fetch('/api/rrhh/cargos-onapre'),
                    fetch('/api/rrhh/direcciones'),
                    fetch('/api/rrhh/condiciones-laborales'),
                    fetch('/api/rrhh/divisiones'),
                    fetch('/api/rrhh/unidades'),
                    fetch(`/api/rrhh/pensionados/${pensionado_id}`),
                ]);

                if (!jubRes.ok) throw new Error('Error al obtener datos del pensionado');

                const [profesiones, primasProfesionales, cargosCET, cargosONAPRE, direcciones, condicionesLaborales, divisiones, unidades, jubResData] = await Promise.all([
                    proRes.json(), primasProfRes.json(), cetRes.json(), onaRes.json(),
                    dirRes.json(), condRes.json(), divRes.json(), uniRes.json(), jubRes.json(),
                ]);

                const jub = jubResData.data || jubResData;
                const ona_id = jub.cargo_onapre_id || '';
                let nivelesFetch = [];

                if (ona_id) {
                    const res = await fetch(`/api/rrhh/niveles-salariales?cargo_onapre_id=${ona_id}`);
                    const nivelesData = await res.json();
                    const data = nivelesData.success ? nivelesData.data : nivelesData;
                    nivelesFetch = Array.isArray(data) ? data.map(n => ({
                        ...n, campo_completo: n.campo_completo || `${n.nombre}`.trim()
                    })) : [];
                }

                setCatalogos({
                    profesiones, primasProfesionales, cargosCET, cargosONAPRE, condicionesLaborales, direcciones,
                    divisiones, unidades, niveles: nivelesFetch,
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
                    prima_profesional_id: jub.prima_profesional_id || '',
                    fecha_ingreso: fmt(jub.fecha_ingreso),
                    cargo_cet_id: jub.cargo_cet_id || '',
                    cargo_onapre_id: jub.cargo_onapre_id || '',
                    condicion_laboral_id: jub.condicion_laboral_id || '',
                    nivel_salarial_id: jub.nivel_salarial_id || '',
                    direccion_id: jub.direccion_id || '',
                    division_id: jub.division_id || '',
                    unidad_id: jub.unidad_id || '',
                    fecha_ingreso_pension: fmt(jub.fecha_ingreso_pension),
                    motivo_pension: jub.motivo_pension || '',
                    observacion: jub.observacion || '',
                });

            } catch (error) {
                console.error('Error al cargar datos del pensionado:', error);
                setErrorMessage('Error cargando los datos. Verifique la conexión.');
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
        setPaso(1);
        setMensajeMostrado(false);
        setErrorMessage('');
    }, [show, pensionado_id]);

    // Cascada Cargo ONAPRE → Niveles (se mantiene API)
    useEffect(() => {
        if (!formData.cargo_onapre_id || !show || isLoadingData) return;
        fetch(`/api/rrhh/niveles-salariales?cargo_onapre_id=${formData.cargo_onapre_id}`)
            .then(r => r.json())
            .then(data => {
                const arr = data.success ? data.data : data;
                const nivelesFormateados = Array.isArray(arr) ? arr.map(n => ({
                    ...n, campo_completo: n.campo_completo || `${n.nombre}`.trim()
                })) : [];
                setCatalogos(prev => ({ ...prev, niveles: nivelesFormateados }));
            })
            .catch(console.error);
    }, [formData.cargo_onapre_id, isLoadingData]);



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'direccion_id') { newData.division_id = ''; newData.unidad_id = ''; }
            else if (name === 'division_id') { newData.unidad_id = ''; }
            else if (name === 'cargo_onapre_id') { newData.cargo_cet_id = ''; newData.nivel_salarial_id = ''; }
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

        setErrorMessage('');
        setMensajeMostrado(false);

        if (onSaveStart) onSaveStart();

        try {
            const response = await fetch(`/api/rrhh/pensionados/${pensionado_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al actualizar pensionado');

            refreshNotifications();
            if (onSaveEnd) onSaveEnd(true, 'pensionado actualizado exitosamente.');
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
                        ? 'Editar Pensionado — Datos Personales'
                        : 'Editar Pensionado — Datos Laborales y Pensión'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-light">
                {isLoadingData ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Cargando datos del pensionado...</p>
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
                                            <div className="col-md-6">
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
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Teléfono Residencial</Form.Label>
                                                    <Form.Control type="text" name="telefono_fijo" value={formData.telefono_fijo} onChange={handleChange} />
                                                </Form.Group>
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Celular</Form.Label>
                                                    <Form.Control type="text" name="celular"
                                                        value={formData.celular} onChange={handleChange} />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Nro. Cuenta Bancaria</Form.Label>
                                                    <Form.Control type="text" name="cuenta_bancaria" maxLength={20}
                                                        value={formData.cuenta_bancaria} onChange={handleChange} />
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

                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ══════════ PASO 2: DATOS LABORALES Y PENSIÓN ══════════ */}
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
                                                            {catalogos.cargosONAPRE.map(c => (
                                                                <option key={c.cargo_onapre_id} value={c.cargo_onapre_id}>{c.nombre}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </div>
                                                <div className="col-md-4">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Cargo Interno (CET)</Form.Label>
                                                        <Form.Select name="cargo_cet_id" value={formData.cargo_cet_id} onChange={handleChange}
                                                            disabled={!formData.cargo_onapre_id || cargosCETFiltrados.length === 0}>
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
                                                        <Form.Label>Nivel Salarial</Form.Label>
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
                                                            disabled={!formData.direccion_id || !tieneDivisiones}>
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
                                        </div>
                                    </div>

                                    {/* Datos de Pensión */}
                                    <div className="d-flex justify-content-between align-items-center mb-3 mt-2">
                                        <h6 className="text-primary mb-0">
                                            <i className="bx bx-calendar-star me-1"></i> 3. Datos de pensión *
                                        </h6>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3">
                                                <Form.Label>Fecha de Ingreso a Pensión</Form.Label>
                                                <Form.Control type="date" name="fecha_ingreso_pension"
                                                    value={formData.fecha_ingreso_pension} onChange={handleChange} />
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3">
                                                <Form.Label>Motivo de Pensión</Form.Label>
                                                <Form.Control type="text" name="motivo_pension"
                                                    value={formData.motivo_pension} onChange={handleChange} />
                                            </Form.Group>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-12">
                                            <Form.Group className="mb-3">
                                                <Form.Label>Observaciones (Opcional)</Form.Label>
                                                <Form.Control as="textarea" rows={2} name="observacion"
                                                    placeholder="Ingrese alguna observación..."
                                                    value={formData.observacion} onChange={handleChange} />
                                            </Form.Group>
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
