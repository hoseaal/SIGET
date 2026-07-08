import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../../components/atoms/Buttons';
import Alert from '../../../components/atoms/Alert';
import Modal from 'react-bootstrap/Modal';
import { useSelectsDependientes } from '../../../hooks/useSelectsDependientes';

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
    });

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
                    fetch('/api/profesiones'),
                    fetch('/api/primas-profesionalizacion'),
                    fetch('/api/cargos-cet'),
                    fetch('/api/cargos-onapre'),
                    fetch('/api/direcciones'),
                    fetch('/api/condiciones-laborales'),
                    fetch('/api/divisiones'),
                    fetch('/api/unidades'),
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
                setErrorMessage('Error cargando listas desplegables.');
            }
        };

        fetchCatalogos();
    }, [show]);

    // Cascada: Niveles Salariales según Cargo ONAPRE (se mantiene API)
    useEffect(() => {
        const fetch_ = async () => {
            if (!formData.cargo_onapre_id) {
                setCatalogos(prev => ({ ...prev, niveles: [] }));
                return;
            }
            try {
                const res = await fetch(`/api/niveles-salariales?cargo_onapre_id=${formData.cargo_onapre_id}`);
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

    const limpiarFormulario = () => {
        setFormData({
            cedula: '', nombres: '', apellidos: '',
            direccion_habitacion: '',
            profesion_id: '', prima_profesional_id: '',
            fecha_ingreso: '', cargo_cet_id: '', cargo_onapre_id: '',
            condicion_laboral_id: '', nivel_salarial_id: '',
            direccion_id: '', division_id: '', unidad_id: '',
            familiar_nombres: '', familiar_apellidos: '',
            familiar_fecha_nacimiento: '', familiar_parentesco: '',
            familiar_direccion: '', familiar_telefono: '', familiar_cuenta_bancaria: '',
            familiar_fecha_ingreso_beneficio: '', familiar_observacion: '',
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

        if (age <= 18) {
            setErrorMessage('El familiar debe ser mayor de 18 años.');
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
