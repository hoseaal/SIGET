import React from "react";
import { Modal, Button, Row, Col, Badge, ListGroup, Table } from "react-bootstrap";

export const ModalDetalleEquipo = ({ show, onHide, equipo }) => {
    if (!equipo) return null;

    const isPC = equipo.tipo_de_equipo?.toLowerCase().includes("computador") || equipo.tipo_de_equipo?.toLowerCase().includes("pc");
    const isImpresora = equipo.tipo_de_equipo?.toLowerCase().includes("impresora");

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="bg-light">
                <Modal.Title>
                    <i className="bx bx-file me-2"></i>
                    Ficha Técnica: {equipo.nro_bien}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Row className="mb-4">
                    <Col md={6}>
                        <h6 className="text-muted text-uppercase small fw-bold mb-3">Identificación y Ubicación</h6>
                        <ListGroup variant="flush" className="small">
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                                <span className="text-muted">Número de Bien:</span>
                                <span className="fw-bold">{equipo.nro_bien}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                                <span className="text-muted">Tipo de Equipo:</span>
                                <Badge bg="primary">{equipo.tipo_de_equipo}</Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                                <span className="text-muted">Departamento:</span>
                                <span>{equipo.departamento}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                                <span className="text-muted">Piso:</span>
                                <span>{equipo.piso}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                                <span className="text-muted">Marca:</span>
                                <span className="fw-bold">{equipo.marca_nombre || 'N/A'}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                                <span className="text-muted">Modelo:</span>
                                <span>{equipo.modelo_nombre || 'N/A'}</span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>
                    <Col md={6}>
                        <h6 className="text-muted text-uppercase small fw-bold mb-3">Conectividad de Red</h6>
                        <ListGroup variant="flush" className="small">
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                                <span className="text-muted">Puerto de Pared:</span>
                                <Badge bg="label-info" className="text-info">{equipo.puerto_en_panel}</Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                                <span className="text-muted">Patch Panel Soporte:</span>
                                <span>Bien: {equipo.nro_bien_panel_soporte}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                                <span className="text-muted">Puerto en Soporte:</span>
                                <span>{equipo.puerto_soporte}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                                <span className="text-muted">Puerto Switch/Router:</span>
                                <span className="text-primary fw-bold">{equipo.puerto_router}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 d-flex justify-content-between">
                                <span className="text-muted">Estado Enlace:</span>
                                <span className="text-success"><i className="bx bxs-circle me-1 small"></i> Activo</span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>
                </Row>

                {isPC && (
                    <div className="mb-4 pt-3 border-top">
                        <h6 className="text-muted text-uppercase small fw-bold mb-3">Configuración de Software</h6>
                        <Row className="g-3">
                            <Col md={4}>
                                <div className="p-3 border rounded bg-light text-center">
                                    <div className="text-muted small mb-1">Nombre en Red</div>
                                    <div className="fw-bold text-primary">{equipo.nombre_equipo || 'N/A'}</div>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="p-3 border rounded bg-light text-center">
                                    <div className="text-muted small mb-1">Sistema Operativo</div>
                                    <div className="fw-bold">{equipo.sistema_operativo || 'N/A'}</div>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="p-3 border rounded bg-light text-center">
                                    <div className="text-muted small mb-1">Versión Office</div>
                                    <div className="fw-bold">{equipo.version_office || 'N/A'}</div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}

                <div className="pt-3 border-top">
                    <h6 className="text-muted text-uppercase small fw-bold mb-3">Hardware / Componentes</h6>
                    <Table responsive size="sm" className="mb-0 border">
                        <thead className="table-dark">
                            <tr className="small">
                                <th>Elemento</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>Serial / Capacidad</th>
                            </tr>
                        </thead>
                        <tbody className="small">
                            {equipo.detalles && equipo.detalles.length > 0 ? (
                                equipo.detalles.map((det, idx) => (
                                    <tr key={idx}>
                                        <td>{det.tipo || "Hardware"}</td>
                                        <td>
                                            {det.marca_nombre || det.marca || det.toner || "Genérico"}
                                        </td>
                                        <td>
                                            {det.modelo_nombre ? ` ${det.modelo_nombre}` : ''}
                                        </td>
                                        <td>{det.serial || det.capacidad || det.toner_descripcion || "-"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-2 text-muted italic">No hay componentes detallados registrados</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>

                {(equipo.observaciones || equipo.elaborado_por) && (
                    <div className="mt-4 p-3 bg-label-secondary rounded border-start border-secondary border-3 small">
                        {equipo.elaborado_por && <div><strong>Técnico Responsable:</strong> {equipo.elaborado_por}</div>}
                        {equipo.observaciones && <div className="mt-1"><strong>Notas:</strong> {equipo.observaciones}</div>}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-light">
                <Button variant="secondary" onClick={onHide}>Cerrar Vista</Button>
            </Modal.Footer>
        </Modal>
    );
};
