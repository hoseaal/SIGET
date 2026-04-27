import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import helpFetch from '../../../utils/helpFetch';

export const GestionMantenimientoModal = ({ show, onHide, onSuccess, mantenimiento, isTechnical }) => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        status: '',
        prioridad: '',
        diagnostico: '',
        solucion: ''
    });

    useEffect(() => {
        if (show && mantenimiento) {
            setFormData({
                status: mantenimiento.status || '',
                prioridad: mantenimiento.prioridad || 'Media',
                diagnostico: mantenimiento.diagnostico || '',
                solucion: mantenimiento.solucion || ''
            });
            if (isTechnical) fetchUser();
        }
    }, [show, mantenimiento]);

    const fetchUser = async () => {
        const res = await fetch('/api/auth/verify-auth', { credentials: 'include' });
        const data = await res.json();
        if (data.success) setUser(data.user);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
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
            toast.error("Error al actualizar el mantenimiento.");
        } finally {
            setLoading(false);
        }
    };

    if (!mantenimiento) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Detalle de Mantenimiento: {mantenimiento.nro_caso}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-4">
                    <Col md={6}>
                        <div className="mb-2"><strong>Tipo:</strong> {mantenimiento.tipo_falla}</div>
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
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
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
                                    <Form.Select name="prioridad" value={formData.prioridad} onChange={handleChange}>
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
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Solución Aplicada</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="solucion"
                                value={formData.solucion}
                                onChange={handleChange}
                                placeholder="Describa qué se hizo para resolver la falla..."
                            />
                        </Form.Group>
                        {formData.status == 7 && (
                            <div className="alert alert-info py-2">
                                <i className="bx bx-info-circle me-1"></i> Al finalizar, se registrará automáticamente en el reporte de actividades.
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
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
                {isTechnical && (
                    <Button variant="primary" onClick={handleSave} disabled={loading}>
                        {loading ? <Spinner size="sm" animation="border" className="me-1" /> : <i className="bx bx-save me-1"></i>}
                        Guardar Cambios
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};
