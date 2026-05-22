import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import helpFetch from '../../../utils/helpFetch';
import { exportInformeTonerPDF } from '../../../utils/exportInformeTonerPDF';

export const GestionMantenimientoModal = ({ show, onHide, onSuccess, mantenimiento, isTechnical }) => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [tiposAct, setTiposAct] = useState([]);
    
    const [formData, setFormData] = useState({
        status: '',
        prioridad: '',
        diagnostico: '',
        solucion: '',
        clasificacion_id: null,
        tipo_falla: ''
    });

    useEffect(() => {
        if (show && mantenimiento) {
            setFormData({
                status: mantenimiento.status || '',
                prioridad: mantenimiento.prioridad || 'Media',
                diagnostico: mantenimiento.diagnostico || '',
                solucion: mantenimiento.solucion || '',
                clasificacion_id: mantenimiento.clasificacion_id || null,
                tipo_falla: mantenimiento.tipo_falla || ''
            });
            fetchUser();
            if (isTechnical) {
                fetchTiposAct();
            }
        }
    }, [show, mantenimiento]);

    const fetchUser = async () => {
        const res = await fetch('/api/auth/verify-auth', { credentials: 'include' });
        const data = await res.json();
        if (data.success) setUser(data.user);
    };

    const fetchTiposAct = async () => {
        try {
            const res = await helpFetch.GET('/tipo_act');
            setTiposAct(res);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClasificacionChange = (id) => {
        setFormData(prev => ({ 
            ...prev, 
            clasificacion_id: prev.clasificacion_id === id ? null : id 
        }));
    };

    const handleSave = async () => {
        if (!formData.status) {
            toast.warning("Debe seleccionar un estado.");
            return;
        }

        // Validaciones obligatorias para finalizar
        if (parseInt(formData.status) === 7) {
            if (!formData.tipo_falla) {
                toast.warning("Debe seleccionar el Tipo de Actividad para el reporte final.");
                return;
            }
            if (!formData.clasificacion_id) {
                toast.warning("Debe seleccionar una Clasificación para el reporte final.");
                return;
            }
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                usuario_tecnico_id: user?.usuario_id
            };

            await helpFetch.PUT(`/mantenimiento/${mantenimiento.id}/status`, payload);
            toast.success("Gestión actualizada correctamente.");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al actualizar el mantenimiento.");
        } finally {
            setLoading(false);
        }
    };

    if (!mantenimiento) return null;

    const isEntregado = parseInt(mantenimiento.status) === 7;

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Detalle de Mantenimiento: Oficio {mantenimiento.nro_caso}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-4">
                    <Col md={6}>
                        <div className="mb-2"><strong>Tipo Reportado:</strong> {mantenimiento.tipo_falla_nombre}</div>
                        <div className="mb-2"><strong>Reportado por:</strong> {mantenimiento.usuario_reporta}</div>
                        <div className="mb-2"><strong>Depto:</strong> {mantenimiento.depto_nombre}</div>
                    </Col>
                    <Col md={6}>
                        <div className="mb-2"><strong>Asunto:</strong> {mantenimiento.asunto}</div>
                        <div className="mb-2"><strong>Fecha Reporte:</strong> {new Date(mantenimiento.fecha_solicitud).toLocaleString()}</div>
                        <div className="mb-2"><strong>Equipo:</strong> {mantenimiento.equipo_nro_bien || 'N/A'}</div>
                    </Col>
                    <Col md={12} className="mt-2">
                        <div className="p-3 bg-light rounded border">
                            <strong>Descripción de la falla:</strong>
                            <p className="mb-0 mt-1">{mantenimiento.descripcion}</p>
                        </div>
                    </Col>
                </Row>

                {isTechnical ? (
                    <>
                        <hr />
                        <h6 className="fw-bold mb-3"><i className="bx bx-wrench me-1"></i> Acción Técnica</h6>
                        {isEntregado && (
                            <div className="alert alert-warning py-2 mb-3">
                                <i className="bx bx-lock-alt me-1"></i> Este mantenimiento ya ha sido finalizado y entregado. Los datos no pueden ser modificados.
                            </div>
                        )}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Select 
                                        name="status" 
                                        value={formData.status} 
                                        onChange={handleChange}
                                        disabled={isEntregado}
                                    >
                                        <option value="2">Pendiente</option>
                                        <option value="3">En Proceso / Reparación</option>
                                        <option value="7">Finalizado / Resuelto</option>
                                        <option value="8">Anulado</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Prioridad</Form.Label>
                                    <Form.Select 
                                        name="prioridad" 
                                        value={formData.prioridad} 
                                        onChange={handleChange}
                                        disabled={isEntregado}
                                    >
                                        <option value="Baja">Baja</option>
                                        <option value="Media">Media</option>
                                        <option value="Alta">Alta</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Diagnóstico</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="diagnostico"
                                value={formData.diagnostico}
                                onChange={handleChange}
                                placeholder="Describa el diagnóstico técnico..."
                                disabled={isEntregado}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Solución Aplicada</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="solucion"
                                value={formData.solucion}
                                onChange={handleChange}
                                placeholder="Describa qué se hizo para resolver la falla..."
                                disabled={isEntregado}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold text-primary">Confirmar Tipo de Actividad / Falla <span className="text-danger">*</span></Form.Label>
                            <Form.Select 
                                name="tipo_falla" 
                                value={formData.tipo_falla} 
                                onChange={handleChange} 
                                disabled={isEntregado}
                                className={!formData.tipo_falla && parseInt(formData.status) === 7 ? "border-danger" : ""}
                            >
                                <option value="">-- Seleccionar el tipo de falla detectada --</option>
                                {tiposAct.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <div className="bg-light p-3 rounded border mb-3">
                            <h6 className="fw-bold small text-muted mb-3 text-uppercase">Clasificación para Reporte de Actividades <span className="text-danger">*</span></h6>
                            <Row>
                                <Col md={4}>
                                    <div className="fw-bold small mb-2 border-bottom">Mant. Preventivo</div>
                                    <Form.Check 
                                        type="checkbox" 
                                        label="Software" 
                                        checked={formData.clasificacion_id === 1} 
                                        onChange={() => handleClasificacionChange(1)}
                                        id="chk-prev-sw"
                                        disabled={isEntregado}
                                    />
                                    <Form.Check 
                                        type="checkbox" 
                                        label="Hardware" 
                                        checked={formData.clasificacion_id === 2} 
                                        onChange={() => handleClasificacionChange(2)}
                                        id="chk-prev-hw"
                                        disabled={isEntregado}
                                    />
                                </Col>
                                <Col md={4}>
                                    <div className="fw-bold small mb-2 border-bottom">Mant. Correctivo</div>
                                    <Form.Check 
                                        type="checkbox" 
                                        label="Software" 
                                        checked={formData.clasificacion_id === 3} 
                                        onChange={() => handleClasificacionChange(3)}
                                        id="chk-corr-sw"
                                        disabled={isEntregado}
                                    />
                                    <Form.Check 
                                        type="checkbox" 
                                        label="Hardware" 
                                        checked={formData.clasificacion_id === 4} 
                                        onChange={() => handleClasificacionChange(4)}
                                        id="chk-corr-hw"
                                        disabled={isEntregado}
                                    />
                                </Col>
                                <Col md={4}>
                                    <div className="fw-bold small mb-2 border-bottom">Plat. Tecnológica</div>
                                    <Form.Check 
                                        type="checkbox" 
                                        label="Servicios / Redes" 
                                        checked={formData.clasificacion_id === 5} 
                                        onChange={() => handleClasificacionChange(5)}
                                        id="chk-plat-serv"
                                        disabled={isEntregado}
                                    />
                                    <Form.Check 
                                        type="checkbox" 
                                        label="Informes" 
                                        checked={formData.clasificacion_id === 6} 
                                        onChange={() => handleClasificacionChange(6)}
                                        id="chk-plat-inf"
                                        disabled={isEntregado}
                                    />
                                </Col>
                            </Row>
                        </div>
                        {(formData.status == 7 && !isEntregado) && (
                            <div className="alert alert-info py-2">
                                <i className="bx bx-info-circle me-1"></i> Al finalizar, se registrará la actividad en el historial y el caso se cerrará permanentemente.
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <hr />
                        <div className="mb-3">
                            <strong>Estatus Actual:</strong>
                            <Badge bg="primary" className="ms-2">{mantenimiento.status_nombre}</Badge>
                        </div>
                        {mantenimiento.diagnostico && (
                            <div className="mb-3">
                                <strong>Diagnóstico Técnico:</strong>
                                <p className="mt-1">{mantenimiento.diagnostico}</p>
                            </div>
                        )}
                        {mantenimiento.solucion && (
                            <div className="mb-3">
                                <strong>Solución:</strong>
                                <p className="mt-1">{mantenimiento.solucion}</p>
                            </div>
                        )}
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                {(mantenimiento.tipo_falla === 10 || mantenimiento.tipo_falla === 14) && (
                    <Button variant="danger" className="me-auto" onClick={() => exportInformeTonerPDF(mantenimiento, user)}>
                        <i className="bx bx-file-pdf me-1"></i> Exportar Informe
                    </Button>
                )}
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
                {(isTechnical && !isEntregado) && (
                    <Button variant="primary" onClick={handleSave} disabled={loading}>
                        {loading ? <Spinner size="sm" animation="border" className="me-1" /> : <i className="bx bx-save me-1"></i>}
                        Guardar Cambios
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};
