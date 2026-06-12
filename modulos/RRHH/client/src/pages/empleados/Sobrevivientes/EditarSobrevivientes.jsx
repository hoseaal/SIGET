import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../../components/atoms/Buttons';
import Alert from '../../../components/atoms/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import { useSelectsDependientes } from '../../../hooks/useSelectsDependientes';

const EditarSobrevivientes = ({ show, handleClose, onSaveStart, onSaveEnd, sobreviviente_id, fromStatusChange }) => {
    const [paso, setPaso] = useState(1);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Datos del empleado sobreviviente
    const [formData, setFormData] = useState({
        cedula: '', nombres: '', apellidos: '',
        fecha_nacimiento: '', genero: '',
        direccion_habitacion: '',
        profesion_id: '', prima_profesional_id: '',
        fecha_ingreso: '',
        cargo_cet_id: '', cargo_onapre_id: '', condicion_laboral_id: '',
        nivel_salarial_id: '', direccion_id: '', division_id: '', unidad_id: '',
    });

    // Familiares vinculados
    const [familiares, setFamiliares] = useState([]);
    const [loadingFamiliares, setLoadingFamiliares] = useState(false);

    // Formulario para agregar/editar familiar
    const [showFamiliarForm, setShowFamiliarForm] = useState(false);
    const [editingFamiliar, setEditingFamiliar] = useState(null);
    const [familiarForm, setFamiliarForm] = useState({
        cedula: '', nombres: '', apellidos: '', fecha_nacimiento: '', parentesco: '',
        direccion: '', telefono: '', cuenta_bancaria: '', fecha_ingreso_beneficio: '', observacion: ''
    });
    const [savingFamiliar, setSavingFamiliar] = useState(false);

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

    const loadFamiliares = async () => {
        if (!sobreviviente_id) return;
        setLoadingFamiliares(true);
        try {
            const res = await fetch(`/api/sobrevivientes/${sobreviviente_id}/familiares`);
            const result = await res.json();
            if (result.success) {
                setFamiliares(result.data || []);
            } else {
                setFamiliares([]);
            }
        } catch (error) {
            console.error('Error cargando familiares:', error);
            setFamiliares([]);
        } finally {
            setLoadingFamiliares(false);
        }
    };

    // Cargar datos del sobreviviente + catálogos al abrir
    useEffect(() => {
        if (!show || !sobreviviente_id) return;

        const fetchData = async () => {
            setIsLoadingData(true);
            setErrorMessage('');
            try {
                const [proRes, primasProfRes, cetRes, onaRes, dirRes, condRes, divRes, uniRes, sobRes] = await Promise.all([
                    fetch('/api/profesiones'),
                    fetch('/api/primas-profesionalizacion'),
                    fetch('/api/cargos-cet'),
                    fetch('/api/cargos-onapre'),
                    fetch('/api/direcciones'),
                    fetch('/api/condiciones-laborales'),
                    fetch('/api/divisiones'),
                    fetch('/api/unidades'),
                    fetch(`/api/sobrevivientes/${sobreviviente_id}`),
                ]);

                if (!sobRes.ok) throw new Error('Error al obtener datos del sobreviviente');

                const [profesiones, primasProfesionales, cargosCET, cargosONAPRE, direcciones, condicionesLaborales, divisiones, unidades, sobResData] = await Promise.all([
                    proRes.json(), primasProfRes.json(), cetRes.json(), onaRes.json(),
                    dirRes.json(), condRes.json(), divRes.json(), uniRes.json(), sobRes.json(),
                ]);

                const sob = sobResData.data || sobResData;
                const ona_id = sob.cargo_onapre_id || '';
                let nivelesFetch = [];

                if (ona_id) {
                    const res = await fetch(`/api/niveles-salariales?cargo_onapre_id=${ona_id}`);
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
                    cedula: sob.cedula || '',
                    nombres: sob.nombres || '',
                    apellidos: sob.apellidos || '',
                    fecha_nacimiento: fmt(sob.fecha_nacimiento),
                    genero: sob.genero || '',
                    direccion_habitacion: sob.direccion_habitacion || '',
                    profesion_id: sob.profesion_id || '',
                    prima_profesional_id: sob.prima_profesional_id || '',
                    fecha_ingreso: fmt(sob.fecha_ingreso),
                    cargo_cet_id: sob.cargo_cet_id || '',
                    cargo_onapre_id: sob.cargo_onapre_id || '',
                    condicion_laboral_id: sob.condicion_laboral_id || '',
                    nivel_salarial_id: sob.nivel_salarial_id || '',
                    direccion_id: sob.direccion_id || '',
                    division_id: sob.division_id || '',
                    unidad_id: sob.unidad_id || '',
                });

                // Cargar familiares
                await loadFamiliares();

                // Si viene del cambio de estatus, ir directo al paso de familiares
                if (fromStatusChange) {
                    setPaso(3);
                    setShowFamiliarForm(true);
                } else {
                    setPaso(1);
                }

            } catch (error) {
                console.error('Error al cargar datos del sobreviviente:', error);
                setErrorMessage('Error cargando los datos. Verifique la conexión.');
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
        setMensajeMostrado(false);
        setErrorMessage('');
    }, [show, sobreviviente_id]);

    // Cascada: Niveles Salariales según Clasificación ONAPRE (se mantiene API)
    useEffect(() => {
        if (!formData.cargo_onapre_id || !show || isLoadingData) return;
        fetch(`/api/niveles-salariales?cargo_onapre_id=${formData.cargo_onapre_id}`)
            .then(r => r.json())
            .then(nivelesData => {
                const data = nivelesData.success ? nivelesData.data : nivelesData;
                const nivelesFormateados = Array.isArray(data) ? data.map(n => ({
                    ...n, campo_completo: n.campo_completo || `${n.nombre}`.trim()
                })) : [];
                setCatalogos(prev => ({ ...prev, niveles: nivelesFormateados }));
            })
            .catch(console.error);
    }, [formData.cargo_onapre_id, show, isLoadingData]);

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

    // Guardar datos del empleado
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (onSaveStart) onSaveStart();

        try {
            const response = await fetch(`/api/sobrevivientes/${sobreviviente_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al actualizar sobreviviente');

            if (onSaveEnd) onSaveEnd(true, 'Sobreviviente actualizado exitosamente.');
        } catch (error) {
            console.error('Error:', error);
            if (onSaveEnd) onSaveEnd(false, error.message);
        }
    };

    // --- CRUD de Familiares ---
    const handleFamiliarChange = (e) => {
        const { name, value } = e.target;
        setFamiliarForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddFamiliar = () => {
        setEditingFamiliar(null);
        setFamiliarForm({ 
            cedula: '', nombres: '', apellidos: '', fecha_nacimiento: '', parentesco: '', 
            direccion: '', telefono: '', cuenta_bancaria: '', fecha_ingreso_beneficio: '', observacion: '' 
        });
        setShowFamiliarForm(true);
    };

    const handleEditFamiliar = (fam) => {
        setEditingFamiliar(fam.familiar_id);
        const fmt = (s) => {
            if (!s) return '';
            const d = new Date(s);
            return isNaN(d) ? '' : d.toISOString().split('T')[0];
        };
        setFamiliarForm({
            cedula: fam.cedula || '',
            nombres: fam.nombres || '',
            apellidos: fam.apellidos || '',
            fecha_nacimiento: fmt(fam.fecha_nacimiento),
            parentesco: fam.parentesco || '',
            direccion: fam.direccion || '',
            telefono: fam.telefono || '',
            cuenta_bancaria: fam.cuenta_bancaria || '',
            fecha_ingreso_beneficio: fmt(fam.fecha_ingreso_beneficio),
            observacion: fam.observacion || '',
        });
        setShowFamiliarForm(true);
    };

    const handleSaveFamiliar = async () => {
        if (!familiarForm.nombres || !familiarForm.apellidos || !familiarForm.fecha_nacimiento) {
            setErrorMessage('Nombres, Apellidos y Fecha de Nacimiento del familiar son obligatorios.');
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 3000);
            return;
        }

        const birthDate = new Date(familiarForm.fecha_nacimiento);
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

        setSavingFamiliar(true);
        try {
            let response;
            if (editingFamiliar) {
                // Actualizar familiar existente
                response = await fetch(`/api/sobrevivientes/familiares/${editingFamiliar}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(familiarForm),
                });
            } else {
                // Agregar nuevo familiar
                response = await fetch(`/api/sobrevivientes/${sobreviviente_id}/familiares`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(familiarForm),
                });
            }

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al guardar familiar');

            setShowFamiliarForm(false);
            setEditingFamiliar(null);
            setFamiliarForm({ 
                cedula: '', nombres: '', apellidos: '', fecha_nacimiento: '', parentesco: '', 
                direccion: '', telefono: '', cuenta_bancaria: '', fecha_ingreso_beneficio: '', observacion: '' 
            });
            await loadFamiliares();
            setErrorMessage('');

        } catch (error) {
            console.error('Error guardando familiar:', error);
            setErrorMessage(error.message);
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 3000);
        } finally {
            setSavingFamiliar(false);
        }
    };

    const handleDeleteFamiliar = async (familiarId) => {
        if (!window.confirm('¿Está seguro de eliminar este familiar?')) return;

        try {
            const response = await fetch(`/api/sobrevivientes/familiares/${familiarId}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al eliminar familiar');

            await loadFamiliares();
        } catch (error) {
            console.error('Error eliminando familiar:', error);
            setErrorMessage(error.message);
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 3000);
        }
    };

    const getTituloPaso = () => {
        switch (paso) {
            case 1: return 'Editar Sobreviviente — Datos Personales';
            case 2: return 'Editar Sobreviviente — Datos Laborales';
            case 3: return 'Editar Sobreviviente — Familiares Sobrevivientes';
            default: return '';
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{getTituloPaso()}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-light">
                {isLoadingData ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Cargando datos del sobreviviente...</p>
                    </div>
                ) : (
                    <>
                        {mensajeMostrado && <Alert key="danger" type="danger">{errorMessage}</Alert>}

                        {/* Banner si viene del cambio de estatus */}
                        {fromStatusChange && paso === 3 && (
                            <div className="alert alert-warning d-flex align-items-center mb-4" style={{
                                borderLeft: '4px solid #ff9800',
                                backgroundColor: '#fff8e1'
                            }}>
                                <i className="bx bx-info-circle me-2 fs-5"></i>
                                <div>
                                    <strong>Empleado: {formData.nombres} {formData.apellidos}</strong> — CI: {formData.cedula}<br />
                                    <small>Registre los datos del familiar sobreviviente para completar el proceso.</small>
                                </div>
                            </div>
                        )}

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
                                            <div className="col-md-12">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Cédula de Identidad *</Form.Label>
                                                    <Form.Control type="text" name="cedula" value={formData.cedula} onChange={handleChange} required />
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



                                        <div className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Dirección de Habitación</Form.Label>
                                                <Form.Control as="textarea" rows={2} name="direccion_habitacion" value={formData.direccion_habitacion} onChange={handleChange} />
                                            </Form.Group>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ══════════ PASO 2: DATOS LABORALES ══════════ */}
                            {paso === 2 && (
                                <>
                                    {/* Datos laborales */}
                                    <div className="card shadow-sm border-0 mb-3 mt-0">
                                        <div className="card-body">
                                            <h6 className="text-primary mb-3">
                                                <i className="bx bx-briefcase me-2"></i>2. Datos Laborales
                                            </h6>

                                            <div className="row mb-3">
                                                <div className="col-md-4">
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Clasificación ONAPRE (Opcional)</Form.Label>
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
                                                        <Form.Label>Cargo Interno (CET) (Opcional)</Form.Label>
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
                                                        <Form.Label>Condición Laboral (Opcional)</Form.Label>
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
                                                <div className="col-md-4">
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

                                            <h6 className="mt-4 mb-3 text-secondary border-bottom pb-2">Ubicación Organizacional</h6>
                                            <div className="row mb-2">
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
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ══════════ PASO 3: FAMILIARES SOBREVIVIENTES ══════════ */}
                            {paso === 3 && (
                                <div className="card shadow-sm border-0 mb-3">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mt-2 text-primary mb-0">
                                                <i className="bx bx-group me-2"></i>3. Familiares Sobrevivientes
                                            </h6>
                                            {familiares.length === 0 && (
                                                <button type="button" className="btn btn-sm btn-success" onClick={handleAddFamiliar}>
                                                    <i className="bx bx-plus me-1"></i> Agregar Familiar
                                                </button>
                                            )}
                                        </div>

                                        {/* Tabla de familiares */}
                                        {loadingFamiliares ? (
                                            <div className="text-center py-3">
                                                <Spinner animation="border" size="sm" /> Cargando familiares...
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-bordered table-sm">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Cédula</th>
                                                            <th>Nombres</th>
                                                            <th>Apellidos</th>
                                                            <th>Fecha Nac.</th>
                                                            <th>Edad</th>
                                                            <th>Parentesco</th>
                                                            <th>Teléfono</th>
                                                            <th>Estado</th>
                                                            <th>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {familiares.length > 0 ? (
                                                            familiares.map(fam => (
                                                                <tr key={fam.familiar_id}>
                                                                    <td>{fam.cedula || '—'}</td>
                                                                    <td>{fam.nombres}</td>
                                                                    <td>{fam.apellidos}</td>
                                                                    <td>{fam.fecha_nacimiento ? new Date(fam.fecha_nacimiento).toLocaleDateString('es-VE') : '—'}</td>
                                                                    <td>{fam.edad} años</td>
                                                                    <td>
                                                                        <span className="badge bg-label-primary">{fam.parentesco || '—'}</span>
                                                                    </td>
                                                                    <td>{fam.telefono || '—'}</td>
                                                                    <td>
                                                                        <span className={`badge ${fam.estatus ? 'bg-label-success' : 'bg-label-danger'}`}>
                                                                            {fam.estatus ? 'Activo' : 'Inactivo'}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <button type="button" className="btn btn-sm btn-outline-primary me-1"
                                                                            onClick={() => handleEditFamiliar(fam)}>
                                                                            <i className="bx bx-edit-alt"></i>
                                                                        </button>
                                                                        <button type="button" className="btn btn-sm btn-outline-danger"
                                                                            onClick={() => handleDeleteFamiliar(fam.familiar_id)}>
                                                                            <i className="bx bx-trash"></i>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="9" className="text-center text-muted py-3">
                                                                    No hay familiares registrados. Haga clic en "Agregar Familiar".
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Formulario inline para agregar/editar familiar */}
                                        {showFamiliarForm && (
                                            <div className="card border-primary mt-3">
                                                <div className="card-header bg-primary text-white py-2">
                                                    <strong>
                                                        {editingFamiliar ? 'Editar Familiar' : 'Nuevo Familiar Sobreviviente'}
                                                    </strong>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row mb-3">
                                                        <div className="col-md-12">
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Fecha de Ingreso al Beneficio</Form.Label>
                                                                <Form.Control type="date" name="fecha_ingreso_beneficio"
                                                                    value={familiarForm.fecha_ingreso_beneficio} onChange={handleFamiliarChange} />
                                                            </Form.Group>
                                                        </div>
                                                    </div>
                                                    <div className="row mb-3">
                                                        <div className="col-md-4">
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Cédula *</Form.Label>
                                                                <Form.Control type="text" name="cedula"
                                                                    value={familiarForm.cedula} onChange={handleFamiliarChange} required />
                                                            </Form.Group>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Nombres *</Form.Label>
                                                                <Form.Control type="text" name="nombres"
                                                                    value={familiarForm.nombres} onChange={handleFamiliarChange} required />
                                                            </Form.Group>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Apellidos *</Form.Label>
                                                                <Form.Control type="text" name="apellidos"
                                                                    value={familiarForm.apellidos} onChange={handleFamiliarChange} required />
                                                            </Form.Group>
                                                        </div>
                                                    </div>
                                                    <div className="row mb-3">
                                                        <div className="col-md-6">
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Fecha de Nacimiento</Form.Label>
                                                                <Form.Control type="date" name="fecha_nacimiento"
                                                                    value={familiarForm.fecha_nacimiento} onChange={handleFamiliarChange} />
                                                            </Form.Group>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Parentesco</Form.Label>
                                                                <Form.Select name="parentesco" value={familiarForm.parentesco} onChange={handleFamiliarChange}>
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
                                                                <Form.Label>Teléfono *</Form.Label>
                                                                <Form.Control type="text" name="telefono"
                                                                    value={familiarForm.telefono} onChange={handleFamiliarChange} required />
                                                            </Form.Group>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Cuenta Bancaria (20 dígitos)</Form.Label>
                                                                <Form.Control type="text" name="cuenta_bancaria" maxLength={20}
                                                                    value={familiarForm.cuenta_bancaria} onChange={handleFamiliarChange} />
                                                            </Form.Group>
                                                        </div>
                                                    </div>
                                                    <div className="row mb-3">
                                                        <div className="col-md-12">
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Dirección</Form.Label>
                                                                <Form.Control as="textarea" rows={2} name="direccion"
                                                                    value={familiarForm.direccion} onChange={handleFamiliarChange} />
                                                            </Form.Group>
                                                        </div>
                                                    </div>
                                                    <div className="row mb-3">
                                                        <div className="col-md-12">
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Observaciones (Opcional)</Form.Label>
                                                                <Form.Control as="textarea" rows={2} name="observacion"
                                                                    placeholder="Ingrese alguna observación..."
                                                                    value={familiarForm.observacion} onChange={handleFamiliarChange} />
                                                            </Form.Group>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveFamiliar} disabled={savingFamiliar}>
                                                            {savingFamiliar ? (
                                                                <><Spinner animation="border" size="sm" className="me-1" /> Guardando...</>
                                                            ) : (
                                                                <><i className="bx bx-save me-1"></i> {editingFamiliar ? 'Actualizar' : 'Guardar'} Familiar</>
                                                            )}
                                                        </button>
                                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => {
                                                            setShowFamiliarForm(false);
                                                            setEditingFamiliar(null);
                                                        }}>
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </form>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-white border-top">
                <Button type='secondary' onClick={handleClose} disabled={isLoadingData}>Cerrar</Button>
                {paso > 1 && !fromStatusChange && (
                    <Button type='secondary' className="me-2" onClick={handleAtras} disabled={isLoadingData}>
                        <i className="bx bx-left-arrow-alt me-1"></i> Atrás
                    </Button>
                )}
                {paso < 3 && (
                    <Button type='primary' onClick={handleSiguiente} disabled={isLoadingData}>
                        Siguiente <i className="bx bx-right-arrow-alt ms-1"></i>
                    </Button>
                )}
                {paso <= 2 && (
                    <Button type='primary' onClick={handleSubmit} disabled={isLoadingData}>
                        <i className="bx bx-save me-1"></i> Guardar Datos
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default EditarSobrevivientes;
