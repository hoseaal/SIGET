import React from 'react';
import { Modal, Button, Row, Col, Badge, Card } from 'react-bootstrap';

export const TransferenciaDetalleModal = ({ show, onHide, transferencia }) => {
    if (!transferencia) return null;

    const getStatusBadge = (nombre) => {
        const n = nombre?.toLowerCase() || '';
        if (n.includes('pendiente')) return 'warning';
        if (n.includes('recibido') || n.includes('revisión')) return 'info';
        if (n.includes('reparación')) return 'primary';
        if (n.includes('listo') || n.includes('entregado')) return 'success';
        if (n.includes('anulado')) return 'danger';
        return 'secondary';
    };

    const getPriorityBadge = (prio) => {
        switch (prio) {
            case 'Alta': return 'danger';
            case 'Media': return 'warning';
            case 'Baja': return 'info';
            default: return 'secondary';
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton className="bg-light">
                <Modal.Title className="h5 mb-0">
                    <i className="bx bx-detail me-2 text-primary"></i>
                    Detalles de la Transferencia: <span className="text-primary">{transferencia.nro_caso}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {/* Cabecera de estado rápida */}
                <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-lighter rounded">
                    <div>
                        <div className="text-muted small uppercase fw-bold">Fecha de Solicitud</div>
                        <div className="fw-bold">{new Date(transferencia.fecha).toLocaleString()}</div>
                    </div>
                    <div className="text-end">
                        <div className="text-muted small uppercase fw-bold mb-1"> Prioridad / Estatus </div>
                        <div className="d-flex gap-2 justify-content-end">
                            <Badge bg={getPriorityBadge(transferencia.prioridad)} className="px-3 py-2 fs-6">
                                {transferencia.prioridad || 'Media'}
                            </Badge>
                            <Badge bg={getStatusBadge(transferencia.status_nombre)} className="px-3 py-2 fs-6">
                                {transferencia.status_nombre}
                            </Badge>
                        </div>
                    </div>
                </div>

                <Row className="g-4">
                    {/* Información del Equipo */}
                    <Col md={6}>
                        <h6 className="fw-bold border-bottom pb-2 mb-3">
                            <i className="bx bx-desktop me-2"></i>Información del Equipo
                        </h6>
                        <div className="mb-2">
                            <span className="text-muted">Número de Bien:</span>
                            <div className="fw-bold">{transferencia.equipo_nro_bien}</div>
                        </div>
                        <div className="mb-2">
                            <span className="text-muted">Tipo de Equipo:</span>
                            <div>{transferencia.equipo_tipo}</div>
                        </div>
                    </Col>

                    {/* Origen y Destino */}
                    <Col md={6}>
                        <h6 className="fw-bold border-bottom pb-2 mb-3">
                            <i className="bx bx-map-pin me-2"></i>Ubicación
                        </h6>
                        <div className="mb-2">
                            <span className="text-muted">Departamento de Origen:</span>
                            <div className="fw-bold">{transferencia.origen_nombre}</div>
                        </div>
                        <div className="mb-2">
                            <span className="text-muted">Departamento de Destino:</span>
                            <div>{transferencia.destino_nombre || 'Servicio Técnico'}</div>
                        </div>
                    </Col>

                    <Col md={12}>
                        <Card className="border-2 bg-light">
                            <Card.Body>
                                <h6 className="fw-bold mb-2">Asunto / Motivo</h6>
                                <p className="mb-3 fs-5 fw-bold text-dark">{transferencia.asunto}</p>

                                <h6 className="fw-bold mb-2">Observaciones del Usuario</h6>
                                <p className="mb-0 text-muted italic">
                                    {transferencia.observaciones ? `"${transferencia.observaciones}"` : "Sin observaciones adicionales."}
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Reporte Técnico (Solo si hay datos o no está pendiente) */}
                    {(transferencia.diagnostico_tecnico || transferencia.solucion_tecnica || transferencia.status > 2) && (
                        <Col md={12}>
                            <h6 className="fw-bold border-bottom pb-2 mb-3 text-primary">
                                <i className="bx bx-wrench me-2"></i>Reporte de Servicio Técnico
                            </h6>
                            <Row>
                                <Col md={6} className="mb-3">
                                    <div className="fw-bold small text-muted text-uppercase mb-1">Diagnóstico Inicial</div>
                                    <div className="p-3 border rounded bg-white" style={{ minHeight: '100px', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                        {transferencia.diagnostico_tecnico || <em className="text-muted">Pendiente por revisión técnica...</em>}
                                    </div>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <div className="fw-bold small text-muted text-uppercase mb-1">Solución Aplicada</div>
                                    <div className="p-3 border rounded bg-white" style={{ minHeight: '100px', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                        {transferencia.solucion_tecnica || <em className="text-muted">En proceso de reparación...</em>}
                                    </div>
                                </Col>
                            </Row>
                            {transferencia.usuario_tecnico && (
                                <div className="mt-2 text-end small text-muted">
                                    <strong>Técnico Responsable:</strong> {transferencia.usuario_tecnico}
                                </div>
                            )}
                        </Col>
                    )}
                </Row>
            </Modal.Body>
            <Modal.Footer className="bg-light">
                <Button variant="secondary" onClick={onHide}>
                    Cerrar Detalle
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
