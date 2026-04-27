import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import Alert from '../../components/atoms/Alert';
import { useSelectsDependientes } from '../../hooks/useSelectsDependientes';

/* ─────────────────────────────────────────────────────────────
   COMPONENTE: ModalEncargoTemporal
   Props:
     • show          {boolean}  – controla visibilidad
     • handleClose   {function} – cierra el modal
     • empleado_id   {number}   – ID del funcionario activo
   ───────────────────────────────────────────────────────────── */
function ModalEncargoTemporal({ show, handleClose, empleado_id }) {

    // ── Datos del funcionario ──────────────────────────────────
    const [funcionario, setFuncionario] = useState(null);

    // ── Catálogos para selectores ──────────────────────────────
    const [catalogos, setCatalogos] = useState({
        cargosCET: [], cargosONAPRE: [], niveles: [], nivelesAntiguos: [],
        direcciones: [], divisiones: [], unidades: []
    });



    // ── Historial ──────────────────────────────────────────────
    const [historial, setHistorial] = useState([]);
    const [encargoActivo, setEncargoActivo] = useState(null);

    // ── UI ──────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // ── Formulario: Nuevo encargo ──────────────────────────────
    const formInicial = {
        fecha_inicio: '',
        cargo_cet_id: '',
        cargo_onapre_id: '',
        nivel_salarial_id: '',
        direccion_id: '',
        division_id: '',
        unidad_id: ''
    };
    const [formData, setFormData] = useState(formInicial);

    const {
        cargosCETFiltrados,
        divisionesFiltradas,
        unidadesFiltradas,
        tieneDivisiones,
        tieneUnidades
    } = useSelectsDependientes(formData, catalogos);

    // ── Modal de finalización ──────────────────────────────────
    const [showFinalizar, setShowFinalizar] = useState(false);
    const [encargoAFinalizar, setEncargoAFinalizar] = useState(null);
    const [fechaFin, setFechaFin] = useState('');
    const [finalizando, setFinalizando] = useState(false);

    // ── Helpers ────────────────────────────────────────────────
    const formatFecha = (f) => {
        if (!f) return '—';
        const d = new Date(f);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        return d.toLocaleDateString('es-VE');
    };

    const flash = (setter, msg, ms = 3500) => {
        setter(msg);
        setTimeout(() => setter(''), ms);
    };

    // ── Cargar catálogos (una sola vez al montar) ──────────────
    const cargarCatalogos = async () => {
        try {
            const [resCet, resOnapre, resNivAnt, resDir, resDiv, resUni] = await Promise.all([
                fetch('/api/cargos-cet'),
                fetch('/api/cargos-onapre'),
                fetch('/api/niveles-salariales-antiguos'),
                fetch('/api/direcciones'),
                fetch('/api/divisiones'),
                fetch('/api/unidades')
            ]);

            const [cetData, onapreData, nivAntData, dirData, divData, uniData] = await Promise.all([
                resCet.json(), resOnapre.json(), resNivAnt.json(),
                resDir.json(), resDiv.json(), resUni.json()
            ]);

            setCatalogos(prev => ({
                ...prev,
                cargosCET: Array.isArray(cetData) ? cetData : cetData.data || [],
                cargosONAPRE: Array.isArray(onapreData) ? onapreData : onapreData.data || [],
                nivelesAntiguos: Array.isArray(nivAntData) ? nivAntData : nivAntData.data || [],
                direcciones: Array.isArray(dirData) ? dirData : dirData.data || [],
                divisiones: Array.isArray(divData) ? divData : divData.data || [],
                unidades: Array.isArray(uniData) ? uniData : uniData.data || []
            }));
        } catch (err) {
            console.error('Error cargando catálogos:', err);
        }
    };

    // ── Cargar historial del funcionario ───────────────────────
    const cargarHistorial = async () => {
        if (!empleado_id) return;
        setLoading(true);
        setError('');
        try {
            // Datos del funcionario
            const resFun = await fetch(`/api/funcionarios/${empleado_id}?type=full`);
            if (resFun.ok) {
                const dataFun = await resFun.json();
                setFuncionario(dataFun.datos_personales || dataFun);
            }

            // Historial de encargos
            const resEnc = await fetch(`/api/encargos-temporales/funcionario/${empleado_id}`);
            if (resEnc.ok) {
                const dataEnc = await resEnc.json();
                setHistorial(dataEnc.historial || []);
                setEncargoActivo(dataEnc.encargo_activo || null);
            }
        } catch (err) {
            console.error(err);
            setError('Error al cargar los datos del funcionario.');
        } finally {
            setLoading(false);
        }
    };

    // ── Efectos ────────────────────────────────────────────────
    useEffect(() => {
        if (show && empleado_id) {
            setFormData(formInicial);
            setError('');
            setSuccessMsg('');
            setShowFinalizar(false);
            setFechaFin('');
            cargarCatalogos();
            cargarHistorial();
        }
    }, [show, empleado_id]);

    // Cascada: Cuando el usuario cambia Cargo ONAPRE manualmente → recargar niveles
    useEffect(() => {
        const fetchNiveles = async () => {
            if (!formData.cargo_onapre_id || !show || loading) return;
            try {
                const res = await fetch(`/api/niveles-salariales?cargo_onapre_id=${formData.cargo_onapre_id}`);
                const nivelesData = await res.json();
                const data = nivelesData.success ? nivelesData.data : nivelesData;
                const nivelesFormateados = Array.isArray(data) ? data.map(n => ({
                    ...n,
                    campo_completo: n.campo_completo || `${n.nombre}`.trim()
                })) : [];
                setCatalogos(prev => ({ ...prev, niveles: nivelesFormateados }));
            } catch (error) {
                console.error("Error cargando niveles:", error);
            }
        };
        fetchNiveles();
    }, [formData.cargo_onapre_id, loading, show]);

    // ── Handlers ───────────────────────────────────────────────
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

    // CREAR nuevo encargo
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        // Validaciones locales
        const requeridos = ['fecha_inicio', 'cargo_onapre_id', 'cargo_cet_id', 'nivel_salarial_id', 'direccion_id'];
        for (const campo of requeridos) {
            if (!formData[campo]) {
                setError('Por favor complete todos los campos obligatorios (*).');
                return;
            }
        }

        if (funcionario) {
            if (String(formData.cargo_cet_id) === String(funcionario.cargo_cet_id) || String(formData.cargo_onapre_id) === String(funcionario.cargo_onapre_id)) {
                setError('El cargo CET u ONAPRE a asignar es igual al que ya posee el funcionario en sus datos laborales base.');
                return;
            }
        }

        setSaving(true);
        try {
            const payload = {
                empleado_id,
                fecha_inicio: formData.fecha_inicio,
                cargo_cet_id: formData.cargo_cet_id,
                cargo_onapre_id: formData.cargo_onapre_id,
                nivel_salarial_id: formData.nivel_salarial_id,
                direccion_id: formData.direccion_id,
                division_id: formData.division_id,
                unidad_id: formData.unidad_id
            };

            const res = await fetch('/api/encargos-temporales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const resErr = await res.json();
                throw new Error(resErr.error || 'Error al guardar el encargo.');
            }

            flash(setSuccessMsg, 'Encargo temporal registrado exitosamente.');
            setFormData(formInicial);
            cargarHistorial();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ABRIR sub-modal de finalizar
    const abrirFinalizar = (encargo) => {
        setEncargoAFinalizar(encargo);
        setFechaFin('');
        setShowFinalizar(true);
    };

    // CONFIRMAR finalización
    const confirmarFinalizar = async () => {
        if (!fechaFin) {
            setError('Debe indicar la fecha de finalización.');
            return;
        }
        setFinalizando(true);
        setError('');
        try {
            const res = await fetch(`/api/encargos-temporales/${encargoAFinalizar.encargo_id}/finalizar`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fecha_fin: fechaFin })
            });

            if (!res.ok) {
                const resErr = await res.json();
                throw new Error(resErr.error || 'Error al finalizar el encargo.');
            }

            setShowFinalizar(false);
            flash(setSuccessMsg, 'Encargo temporal finalizado correctamente.');
            cargarHistorial();
        } catch (err) {
            setError(err.message);
        } finally {
            setFinalizando(false);
        }
    };

    // ELIMINAR encargo
    const handleEliminar = async (encargo_id) => {
        if (!window.confirm('¿Está seguro de eliminar este encargo temporal? Esta acción no se puede deshacer.')) return;
        setError('');
        try {
            const res = await fetch(`/api/encargos-temporales/${encargo_id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar el encargo.');
            flash(setSuccessMsg, 'Encargo eliminado correctamente.');
            cargarHistorial();
        } catch (err) {
            setError(err.message);
        }
    };

    // ── RENDER ─────────────────────────────────────────────────
    return (
        <>
            {/* ── MODAL PRINCIPAL ─────────────────────────────── */}
            <Modal show={show} onHide={handleClose} size="xl" centered backdrop="static">
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>
                        <i className="bx bx-briefcase me-2 text-warning"></i>
                        Encargo Temporal —{' '}
                        <span className="text-primary">
                            {funcionario ? `${funcionario.nombres} ${funcionario.apellidos}` : 'Cargando...'}
                        </span>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* ALERTAS */}
                    {error && <Alert type="danger">{error}</Alert>}
                    {successMsg && <Alert type="success">{successMsg}</Alert>}

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="warning" />
                            <p className="mt-2 text-muted">Cargando datos...</p>
                        </div>
                    ) : (
                        <>
                            {/* ── ESTADO ACTUAL DEL ENCARGO ─────── */}
                            {encargoActivo ? (
                                <div className="alert alert-warning d-flex align-items-start gap-3 mb-4">
                                    <i className="bx bx-info-circle fs-4 mt-1 flex-shrink-0"></i>
                                    <div className="flex-grow-1">
                                        <strong>Encargo activo registrado.</strong> Este funcionario ya posee un
                                        encargo temporal vigente. Debe finalizarlo o eliminarlo para registrar uno nuevo.
                                        <div className="mt-2 small">
                                            <span className="me-3"><strong>Cargo CET:</strong> {encargoActivo.cargo_cet_nombre}</span>
                                            <span className="me-3"><strong>Cargo ONAPRE:</strong> {encargoActivo.cargo_onapre_nombre}</span>
                                            <span><strong>Desde:</strong> {formatFecha(encargoActivo.fecha_inicio)}</span>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="alert alert-success d-flex align-items-center gap-2 mb-4 py-2">
                                    <i className="bx bx-check-circle"></i>
                                    <span>Sin encargo temporal activo. Puede registrar uno nuevo.</span>
                                </div>
                            )}

                            {/* ── FORMULARIO NUEVO ENCARGO ────────── */}
                            <div className={`bg-light p-3 rounded mb-4 border ${encargoActivo ? 'opacity-50 pe-none' : ''}`}>
                                <h6 className="text-primary mb-3">
                                    <i className="bx bx-plus-circle me-1"></i> Registrar Nuevo Encargo Temporal
                                    {encargoActivo && <span className="text-muted small ms-2">(Finalice el encargo activo primero)</span>}
                                </h6>
                                <Form onSubmit={handleSubmit}>
                                    <div className="row g-3">

                                        {/* Fecha inicio */}
                                        <div className="col-md-4">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted">Fecha de Inicio *</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="fecha_inicio"
                                                    value={formData.fecha_inicio}
                                                    onChange={handleChange}
                                                    disabled={!!encargoActivo}
                                                />
                                            </Form.Group>
                                        </div>

                                        {/* Cargo ONAPRE */}
                                        <div className="col-md-4">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted">Cargo ONAPRE *</Form.Label>
                                                <Form.Select
                                                    name="cargo_onapre_id"
                                                    value={formData.cargo_onapre_id}
                                                    onChange={handleChange}
                                                    disabled={!!encargoActivo}
                                                >
                                                    <option value="">-- Seleccione --</option>
                                                    {catalogos.cargosONAPRE.map(c => (
                                                        <option key={c.cargo_onapre_id} value={c.cargo_onapre_id}>{c.nombre}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </div>

                                        {/* Cargo CET */}
                                        <div className="col-md-4">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted">Cargo CET *</Form.Label>
                                                <Form.Select
                                                    name="cargo_cet_id"
                                                    value={formData.cargo_cet_id}
                                                    onChange={handleChange}
                                                    disabled={!!encargoActivo || !formData.cargo_onapre_id || cargosCETFiltrados.length === 0}
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

                                        {/* Nivel Salarial */}
                                        <div className="col-md-4">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted">Nivel Salarial *</Form.Label>
                                                <Form.Select
                                                    name="nivel_salarial_id"
                                                    value={formData.nivel_salarial_id}
                                                    onChange={handleChange}
                                                    disabled={!!encargoActivo || !formData.cargo_onapre_id}
                                                >
                                                    <option value="">-- Seleccione --</option>
                                                    {catalogos.niveles.map(n => (
                                                        <option key={n.nivel_salarial_id} value={n.nivel_salarial_id}>{n.nombre} — {n.salario_base} Bs.</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </div>



                                        {/* Dirección */}
                                        <div className="col-md-4">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted">Dirección *</Form.Label>
                                                <Form.Select
                                                    name="direccion_id"
                                                    value={formData.direccion_id}
                                                    onChange={handleChange}
                                                    disabled={!!encargoActivo}
                                                >
                                                    <option value="">-- Seleccione --</option>
                                                    {catalogos.direcciones.map(d => (
                                                        <option key={d.direccion_id} value={d.direccion_id}>{d.nombre}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </div>

                                        {/* División */}
                                        <div className="col-md-4">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted">División (Opcional)</Form.Label>
                                                <Form.Select
                                                    name="division_id"
                                                    value={formData.division_id}
                                                    onChange={handleChange}
                                                    disabled={!!encargoActivo || !formData.direccion_id}
                                                >
                                                    <option value="">-- Directo a la Dirección --</option>
                                                    {divisionesFiltradas.map(d => (
                                                        <option key={d.division_id} value={d.division_id}>{d.nombre}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </div>

                                        {/* Unidad */}
                                        <div className="col-md-4">
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted">Unidad (Opcional)</Form.Label>
                                                <Form.Select
                                                    name="unidad_id"
                                                    value={formData.unidad_id}
                                                    onChange={handleChange}
                                                    disabled={!!encargoActivo || !formData.direccion_id}
                                                >
                                                    <option value="">{formData.division_id ? '-- Directo a la División --' : '-- Directo a la Dirección --'}</option>
                                                    {unidadesFiltradas.map(u => (
                                                        <option key={u.unidad_id} value={u.unidad_id}>{u.nombre}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </div>

                                        {/* Botón guardar */}
                                        <div className="col-md-4 d-flex align-items-end">
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                className="w-100"
                                                disabled={saving || !!encargoActivo}
                                            >
                                                {saving
                                                    ? <><Spinner size="sm" className="me-2" />Guardando...</>
                                                    : <><i className="bx bx-save me-1"></i>Registrar Encargo</>
                                                }
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </div>

                            {/* ── HISTORIAL ───────────────────────── */}
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="m-0 text-secondary">
                                    <i className="bx bx-history me-1"></i>Historial de Encargos
                                </h6>
                                <span className="badge bg-label-secondary">
                                    {historial.length} registro(s)
                                </span>
                            </div>

                            <Table bordered hover size="sm" responsive className="text-center align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Cargo CET</th>
                                        <th>Cargo ONAPRE</th>
                                        <th>Nivel Salarial</th>
                                        <th>Dirección</th>
                                        <th>Inicio</th>
                                        <th>Fin</th>
                                        <th>Estatus</th>
                                        <th style={{ width: '110px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historial.length > 0 ? (
                                        historial.map((enc) => (
                                            <tr key={enc.encargo_id} className={enc.estatus_encargo ? 'table-warning' : ''}>
                                                <td className="text-start">{enc.cargo_cet_nombre || '—'}</td>
                                                <td className="text-start">{enc.cargo_onapre_nombre || '—'}</td>
                                                <td>{enc.nivel_salarial_nombre || '—'}</td>
                                                <td className="text-start">{enc.direccion_nombre || '—'}</td>
                                                <td>{formatFecha(enc.fecha_inicio)}</td>
                                                <td>
                                                    {enc.fecha_fin
                                                        ? formatFecha(enc.fecha_fin)
                                                        : <span className="badge bg-warning text-dark">Vigente</span>
                                                    }
                                                </td>
                                                <td>
                                                    {enc.estatus_encargo
                                                        ? <span className="badge bg-success">Activo</span>
                                                        : <span className="badge bg-secondary">Finalizado</span>
                                                    }
                                                </td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-1">
                                                        {enc.estatus_encargo === 1 && (
                                                            <button
                                                                className="btn btn-sm btn-warning"
                                                                title="Finalizar encargo"
                                                                onClick={() => abrirFinalizar(enc)}
                                                            >
                                                                <i className="bx bx-check"></i>
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Eliminar encargo"
                                                            onClick={() => handleEliminar(enc.encargo_id)}
                                                        >
                                                            <i className="bx bx-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="py-4 text-muted fst-italic">
                                                No hay encargos temporales registrados para este funcionario.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cerrar Ventana
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ── SUB-MODAL: FINALIZAR ENCARGO ────────────────── */}
            <Modal show={showFinalizar} onHide={() => setShowFinalizar(false)} centered backdrop="static" size="sm">
                <Modal.Header closeButton>
                    <Modal.Title className="fs-6">
                        <i className="bx bx-calendar-check me-2 text-warning"></i>
                        Finalizar Encargo Temporal
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert type="danger">{error}</Alert>}
                    <p className="text-muted small mb-3">
                        Indique la fecha en que finalizó el encargo temporal. Esta fecha quedará registrada en el historial.
                    </p>
                    <Form.Group>
                        <Form.Label className="small fw-bold text-muted">Fecha de Finalización *</Form.Label>
                        <Form.Control
                            type="date"
                            value={fechaFin}
                            onChange={e => setFechaFin(e.target.value)}
                            min={encargoAFinalizar?.fecha_inicio}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => setShowFinalizar(false)} disabled={finalizando}>
                        Cancelar
                    </Button>
                    <Button variant="warning" size="sm" onClick={confirmarFinalizar} disabled={finalizando}>
                        {finalizando
                            ? <><Spinner size="sm" className="me-1" />Guardando...</>
                            : <><i className="bx bx-check me-1"></i>Confirmar</>
                        }
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalEncargoTemporal;
