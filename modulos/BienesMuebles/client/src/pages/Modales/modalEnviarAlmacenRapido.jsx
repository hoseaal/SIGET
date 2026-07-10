import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner, Nav } from 'react-bootstrap';

function ModalEnviarAlmacenRapido({ show, handleClose, item, onSuccess }) {
    const DEP_ALMACEN_03 = 11;
    const DEP_ALMACEN_04 = 9;

    const [activeTab, setActiveTab] = useState('existente'); // 'existente' o 'nuevo'
    const [departamentos, setDepartamentos] = useState([]);
    const [existingWarehouseDocs, setExistingWarehouseDocs] = useState([]);

    // Estados para flujo: Asociar a Existente
    const [selectedDocId, setSelectedDocId] = useState('');

    // Estados para flujo: Crear Nuevo
    const [formData, setFormData] = useState({
        pre_ndo: '',
        pre_tip: 'Oficio',
        pre_fec: new Date().toISOString().slice(0, 10),
        dep_ide: '', // Almacén Destino
    });
    const [sinNumero, setSinNumero] = useState(false);

    const [loading, setLoading] = useState(false);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (show && item) {
            setActiveTab('existente');
            setSelectedDocId('');
            setFormData({
                pre_ndo: '',
                pre_tip: 'Oficio',
                pre_fec: new Date().toISOString().slice(0, 10),
                dep_ide: '',
            });
            setSinNumero(false);
            setErrorMsg('');
            setSuccessMsg('');
            setLoading(false);

            fetchInitialData();
        }
    }, [show, item]);

    const fetchInitialData = async () => {
        try {
            // 1. Cargar departamentos
            const depRes = await fetch('/api/departamentos', { credentials: 'include' });
            if (!depRes.ok) throw new Error('Error al cargar departamentos.');
            const depData = await depRes.json();
            const depsList = Array.isArray(depData) ? depData : (depData.data || []);
            setDepartamentos(depsList);

            // 2. Cargar ingresos a almacén existentes activos con origen en el departamento del bien
            setLoadingDocs(true);
            const docsRes = await fetch(`/api/prestamos/almacen?dep_origen_id=${item.dep_ide}`, { credentials: 'include' });
            if (docsRes.ok) {
                const docsData = await docsRes.json();
                setExistingWarehouseDocs(Array.isArray(docsData) ? docsData : []);
            } else {
                setExistingWarehouseDocs([]);
            }
        } catch (error) {
            console.error('Error fetching initial data for warehouse send:', error);
            setErrorMsg('No se pudieron obtener todos los datos requeridos.');
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleSinNumeroChange = (e) => {
        const isChecked = e.target.checked;
        setSinNumero(isChecked);
        if (isChecked) {
            setFormData(prev => ({ ...prev, pre_ndo: 'Sin Numero', pre_fec: null }));
        } else {
            setFormData(prev => ({ ...prev, pre_ndo: '', pre_fec: new Date().toISOString().slice(0, 10) }));
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Enviar Asociación a Existente
    const handleAssociate = async (e) => {
        e.preventDefault();
        if (!selectedDocId) {
            setErrorMsg('Por favor, seleccione un registro de almacén existente.');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const response = await fetch(`/api/prestamos/${selectedDocId}/bienes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bim_ide: item.bim_ide })
            });
            const resData = await response.json();
            if (!response.ok) throw new Error(resData.error || 'Error al asociar bien al registro de almacén.');

            setSuccessMsg('✓ Bien enviado al almacén con éxito (asociado a documento).');
            setTimeout(() => {
                handleClose();
                if (onSuccess) onSuccess();
            }, 1500);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Enviar Creación de Nuevo Registro de Almacén
    const handleCreateNew = async (e) => {
        e.preventDefault();
        if (!formData.pre_ndo || !formData.dep_ide) {
            setErrorMsg('Por favor, complete todos los campos requeridos.');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        const payload = {
            pre_ndo: formData.pre_ndo,
            pre_tip: formData.pre_tip,
            pre_fec: formData.pre_fec,
            dep_origen_ide: parseInt(item.dep_ide),
            dep_ide: parseInt(formData.dep_ide),
            bienes: [item.bim_ide],
            pre_cla: 'A'
        };

        try {
            const response = await fetch('/api/prestamos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const resData = await response.json();
            if (!response.ok) throw new Error(resData.error || 'Error al enviar al almacén.');

            setSuccessMsg('✓ Bien enviado al almacén e ingreso registrado exitosamente.');
            setTimeout(() => {
                handleClose();
                if (onSuccess) onSuccess();
            }, 1500);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const originDepName = departamentos.find(d => d.dep_ide === Number(item?.dep_ide))?.dep_nom || `Departamento ${item?.dep_ide}`;

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton className="bg-light">
                <Modal.Title>
                    <i className="bx bx-archive-in me-2 text-primary fs-3 align-middle"></i>
                    Enviar a Almacén: <strong className="text-secondary">{item?.bim_ide}</strong>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {/* Alerta de Respuesta */}
                {(errorMsg || successMsg) && (
                    <Alert variant={errorMsg ? 'danger' : 'success'} dismissible onClose={() => setErrorMsg('')}>
                        {errorMsg || successMsg}
                    </Alert>
                )}

                {/* Info superior */}
                <div className="alert alert-light border mb-4">
                    <Row>
                        <Col sm={6}>
                            <small className="text-muted d-block">Bien a Transferir</small>
                            <strong className="text-dark">{item?.bim_des}</strong>
                        </Col>
                        <Col sm={6}>
                            <small className="text-muted d-block">Ubicación Origen</small>
                            <strong className="text-primary">{originDepName}</strong>
                        </Col>
                    </Row>
                </div>

                {/* Tabs de Selección */}
                <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={(k) => { setActiveTab(k); setErrorMsg(''); }}>
                    <Nav.Item>
                        <Nav.Link eventKey="existente" disabled={loading}>
                            <i className="bx bx-folder-open me-1"></i> Asociar a Documento de Almacén Existente
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="nuevo" disabled={loading}>
                            <i className="bx bx-plus-circle me-1"></i> Crear Nuevo Envío a Almacén
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                {/* FLUJO 1: ASOCIAR A EXISTENTE */}
                {activeTab === 'existente' && (
                    <Form onSubmit={handleAssociate}>
                        {loadingDocs ? (
                            <div className="text-center my-4">
                                <Spinner animation="border" size="sm" className="me-2" />
                                <span>Buscando oficios de almacén vigentes...</span>
                            </div>
                        ) : existingWarehouseDocs.length > 0 ? (
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">Seleccione el Oficio de Envío Activo</Form.Label>
                                <Form.Select
                                    value={selectedDocId}
                                    onChange={(e) => setSelectedDocId(e.target.value)}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">-- Seleccione un documento --</option>
                                    {existingWarehouseDocs.map((doc) => (
                                        <option key={doc.pre_ide} value={doc.pre_ide}>
                                            {doc.pre_tip}: {doc.pre_ndo} - Almacén: {doc.departamento_destino_nombre} (Fecha: {doc.pre_fec ? new Date(doc.pre_fec).toLocaleDateString() : 'S/F'})
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Text className="text-muted">
                                    Solo se listan los documentos de almacén activos cuyo origen coincide con el custodio de este bien.
                                </Form.Text>
                            </Form.Group>
                        ) : (
                            <div className="text-center p-4 bg-label-secondary rounded mb-4">
                                <i className="bx bx-info-circle fs-3 d-block mb-2 text-warning"></i>
                                <p className="mb-0 fw-semibold text-dark">No hay registros de almacén activos con origen en "{originDepName}".</p>
                                <small className="text-muted">Por favor, vaya a la pestaña "Crear Nuevo Envío" para iniciar el proceso.</small>
                            </div>
                        )}

                        <div className="d-flex justify-content-end gap-2 border-top pt-3">
                            <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancelar</Button>
                            {existingWarehouseDocs.length > 0 && (
                                <Button variant="primary" type="submit" disabled={loading || !selectedDocId}>
                                    {loading ? 'Asociando...' : 'Asociar a Almacén'}
                                </Button>
                            )}
                        </div>
                    </Form>
                )}

                {/* FLUJO 2: CREAR NUEVO ENVÍO */}
                {activeTab === 'nuevo' && (
                    <Form onSubmit={handleCreateNew}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Tipo de Movimiento / Documento</Form.Label>
                                    <Form.Select name="pre_tip" value={formData.pre_tip} onChange={handleFormChange} required disabled={loading}>
                                        <option value="Oficio">Oficio</option>
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Acta">Acta de Recepción</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6} className="d-flex align-items-end pb-3">
                                <Form.Group>
                                    <Form.Check
                                        type="switch"
                                        id="sin-numero-switch-almacen-rapido"
                                        label="Documento sin Número / Fecha"
                                        checked={sinNumero}
                                        onChange={handleSinNumeroChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Número de Documento</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="pre_ndo"
                                        value={formData.pre_ndo}
                                        onChange={handleFormChange}
                                        placeholder="Ej. ACTA-REC-2026-002"
                                        required
                                        disabled={sinNumero || loading}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Fecha</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="pre_fec"
                                        value={sinNumero ? '' : formData.pre_fec}
                                        onChange={handleFormChange}
                                        required={!sinNumero}
                                        disabled={sinNumero || loading}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Departamento Origen (Custodio)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={originDepName}
                                        disabled
                                        readOnly
                                        className="form-control-readonly fw-semibold text-primary"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Almacén de Destino</Form.Label>
                                    <Form.Select
                                        name="dep_ide"
                                        value={formData.dep_ide}
                                        onChange={handleFormChange}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">-- Seleccione almacén --</option>
                                        {departamentos
                                            .filter(dep => dep.dep_ide === DEP_ALMACEN_03 || dep.dep_ide === DEP_ALMACEN_04)
                                            .map(dep => (
                                                <option key={dep.dep_ide} value={dep.dep_ide}>{dep.dep_nom}</option>
                                            ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 border-top pt-3 mt-3">
                            <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancelar</Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Enviando...' : 'Crear y Enviar a Almacén'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal.Body>
        </Modal>
    );
}

export default ModalEnviarAlmacenRapido;
