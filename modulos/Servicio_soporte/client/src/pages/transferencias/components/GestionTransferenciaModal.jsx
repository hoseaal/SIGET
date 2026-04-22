import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import helpFetch from '../../../utils/helpFetch';

/**
 * Modal para que el técnico gestione la transferencia.
 * Soporta recepción (cambio de status y prioridad) y entrega (diagnóstico y solución).
 */
export const GestionTransferenciaModal = ({ show, onHide, onSuccess, transferencia }) => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        status: '',
        prioridad: '',
        diagnostico_tecnico: '',
        solucion_tecnica: ''
    });

    useEffect(() => {
        if (show && transferencia) {
            setFormData({
                status: transferencia.status || '',
                prioridad: transferencia.prioridad || 'Media',
                diagnostico_tecnico: transferencia.diagnostico_tecnico || '',
                solucion_tecnica: transferencia.solucion_tecnica || ''
            });
            fetchUser();
        }
    }, [show, transferencia]);

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
        if (!formData.status) {
            toast.warning("Debe seleccionar un estado.");
            return;
        }

        try {
            setLoading(true);
            
            const payload = {
                ...formData,
                usuario_tecnico_id: user?.usuario_id
            };

            // Lógica automática de fechas
            if (formData.status === 3) { // Recibido
                payload.fecha_recepcion = new Date().toISOString().slice(0, 19).replace('T', ' ');
            }
            if (formData.status === 7) { // Entregado
                payload.fecha_entrega = new Date().toISOString().slice(0, 19).replace('T', ' ');
            }

            await helpFetch.PUT(`/transferencia/${transferencia.id}/status`, payload);
            toast.success("Gestión actualizada correctamente.");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar la transferencia.");
        } finally {
            setLoading(false);
        }
    };

    if (!transferencia) return null;

    const isPending = transferencia.status === 2; // Pendiente

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Gestionar Transferencia: {transferencia.nro_caso}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-4">
                    <Col md={6}>
                        <div className="mb-2"><strong>Equipo:</strong> {transferencia.equipo_nro_bien}</div>
                        <div className="mb-2"><strong>Origen:</strong> {transferencia.origen_nombre}</div>
                        <div className="mb-2"><strong>Usuario:</strong> {transferencia.usuario_crea}</div>
                    </Col>
                    <Col md={6}>
                        <div className="mb-2"><strong>Asunto:</strong> {transferencia.asunto}</div>
                        <div className="mb-2"><strong>Fecha Solicitud:</strong> {new Date(transferencia.fecha).toLocaleString()}</div>
                        <div className="mb-2">
                            <strong>Obs. Usuario:</strong> {transferencia.observaciones || 'Ninguna'}
                        </div>
                    </Col>
                </Row>

                <hr />

                <h6 className="fw-bold mb-3"><i className="bx bx-wrench me-1"></i> Acción Técnica</h6>
                
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Estado de la Transferencia</Form.Label>
                            <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                <option value="2">Pendiente (Sin recibir)</option>
                                <option value="3">Recibido (En Soporte)</option>
                                <option value="4">En Revisión</option>
                                <option value="5">En Reparación</option>
                                <option value="6">Listo para Entrega</option>
                                <option value="7">Entregado / Finalizado</option>
                                <option value="8">Anulado</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Prioridad Asignada</Form.Label>
                            <Form.Select name="prioridad" value={formData.prioridad} onChange={handleChange}>
                                <option value="Baja">Baja</option>
                                <option value="Media">Media</option>
                                <option value="Alta">Alta</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>Diagnóstico Técnico</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={2} 
                        name="diagnostico_tecnico"
                        value={formData.diagnostico_tecnico}
                        onChange={handleChange}
                        placeholder="Describa los hallazgos técnicos..."
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Reporte de Solución / Entrega</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        name="solucion_tecnica"
                        value={formData.solucion_tecnica}
                        onChange={handleChange}
                        placeholder="Describa el mantenimiento realizado y el estado final del equipo..."
                    />
                </Form.Group>

                {formData.status == 7 && (
                    <div className="alert alert-success d-flex align-items-center">
                        <i className="bx bx-check-circle me-2"></i>
                        <div>
                            Al marcar como <strong>Entregado</strong>, se generará el reporte final de entrega para el usuario.
                        </div>
                    </div>
                )}

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Cerrar
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={loading}>
                    {loading ? <Spinner size="sm" animation="border" className="me-1" /> : <i className="bx bx-save me-1"></i>}
                    Guardar Cambios
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
