import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Spinner, Badge } from 'react-bootstrap';

const estadosBien = [
    { est_ide: 1, est_est: 'Sin etiqueta', badgeClass: 'bg-label-secondary' },
    { est_ide: 2, est_est: 'Inoperativo', badgeClass: 'bg-label-danger' },
    { est_ide: 3, est_est: 'Faltante', badgeClass: 'bg-label-warning' },
    { est_ide: 4, est_est: 'Operativo', badgeClass: 'bg-label-success' }
];

function ModalViewBm({ show, handleClose, BienId }) {
    const [bienData, setBienData] = useState(null);
    const [prestamoInfo, setPrestamoInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show && BienId) {
            const fetchDetails = async () => {
                setLoading(true);
                setError('');
                try {
                    // Cargar datos del bien
                    const bienRes = await fetch(`/api/bienes/${BienId}`);
                    if (!bienRes.ok) throw new Error('No se pudo cargar el bien.');
                    const bienJson = await bienRes.json();
                    const bien = Array.isArray(bienJson.data) ? bienJson.data[0] : bienJson;
                    setBienData(bien);

                    // Cargar estado de préstamo/almacén activo
                    const prestamoRes = await fetch(`/api/prestamos/estado-bien/${BienId}`);
                    if (prestamoRes.ok) {
                        const prestamoData = await prestamoRes.json();
                        setPrestamoInfo(prestamoData);
                    } else {
                        setPrestamoInfo(null);
                    }
                } catch (err) {
                    console.error('Error cargando detalles del bien:', err);
                    setError(err.message || 'Error al obtener la información.');
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [show, BienId]);

    const getEstadoBadge = (est_ide) => {
        const estado = estadosBien.find(e => e.est_ide === Number(est_ide));
        if (!estado) return <Badge bg="secondary">Desconocido</Badge>;
        
        let labelClass = 'secondary';
        if (estado.est_ide === 2) labelClass = 'danger';
        if (estado.est_ide === 3) labelClass = 'warning';
        if (estado.est_ide === 4) labelClass = 'success';

        return <Badge bg={labelClass}>{estado.est_est.toUpperCase()}</Badge>;
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered backdrop="static">
            <Modal.Header closeButton className="bg-light">
                <Modal.Title className="w-100">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <span className="fw-bold">Detalles del Bien Mueble</span>
                            <span className="text-muted ms-2 small">#{bienData?.bim_ide}</span>
                        </div>
                        {bienData?.est_ide && getEstadoBadge(bienData.est_ide)}
                    </div>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {loading ? (
                    <div className="text-center my-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Obteniendo información completa del bien...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger text-center my-4">
                        <i className="bx bx-error-circle me-2 fs-4 align-middle"></i>
                        {error}
                    </div>
                ) : bienData ? (
                    <div>
                        {/* Estado de Ubicación y Custodia */}
                        <div className="card border shadow-none mb-4 bg-label-light">
                            <div className="card-body p-3">
                                <h6 className="card-title text-primary fw-bold mb-3 d-flex align-items-center">
                                    <i className="bx bx-map-pin me-2 fs-4"></i> Ubicación y Custodia
                                </h6>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <div className="p-2 border-start border-primary border-3 bg-white rounded">
                                            <small className="text-muted d-block text-uppercase fw-bold">Departamento Propietario (Origen)</small>
                                            <span className="fs-6 fw-semibold text-dark">{bienData.departamento || 'No asignado'}</span>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className={`p-2 border-start border-3 bg-white rounded ${prestamoInfo ? 'border-info' : 'border-success'}`}>
                                            <small className="text-muted d-block text-uppercase fw-bold">Estado y Ubicación Actual</small>
                                            {prestamoInfo ? (
                                                <div>
                                                    <span className="badge bg-label-info mb-1">
                                                        {prestamoInfo.pre_cla === 'A' ? 'EN ALMACÉN' : 'EN PRÉSTAMO'}
                                                    </span>
                                                    <div className="fw-bold text-dark">
                                                        {prestamoInfo.departamento_destino_nombre}
                                                    </div>
                                                    <small className="text-muted">
                                                        Documento: <strong className="text-secondary">{prestamoInfo.pre_ndo}</strong> ({prestamoInfo.pre_tip})
                                                    </small>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="badge bg-label-success mb-1">EN RESGUARDO</span>
                                                    <div className="fw-bold text-dark">Custodian en su departamento original</div>
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        <Row className="g-4">
                            {/* Panel 1: Datos de Identificación */}
                            <Col md={6}>
                                <div className="card h-100 border shadow-none">
                                    <div className="card-body">
                                        <h6 className="card-title fw-bold text-dark mb-3 border-bottom pb-2">
                                            <i className="bx bx-info-circle me-1"></i> Identificación del Bien
                                        </h6>
                                        <Row className="g-2">
                                            <Col xs={12}>
                                                <small className="text-muted d-block">Descripción</small>
                                                <p className="fw-semibold text-dark text-wrap bg-light p-2 rounded">{bienData.bim_des || 'N/A'}</p>
                                            </Col>
                                            <Col xs={6}>
                                                <small className="text-muted d-block">Código del Bien</small>
                                                <p className="fw-bold text-secondary">{bienData.bim_ide || 'N/A'}</p>
                                            </Col>
                                            <Col xs={6}>
                                                <small className="text-muted d-block">Código SUDEBIP</small>
                                                <p className="fw-bold text-secondary">{bienData.bim_cod || 'Sin registro'}</p>
                                            </Col>
                                            <Col xs={6}>
                                                <small className="text-muted d-block">Serial</small>
                                                <p className="fw-semibold text-dark">{bienData.bim_ser || 'N/A'}</p>
                                            </Col>
                                            <Col xs={6}>
                                                <small className="text-muted d-block">Color</small>
                                                <p className="fw-semibold text-dark">{bienData.bim_color || 'N/A'}</p>
                                            </Col>
                                            <Col xs={6}>
                                                <small className="text-muted d-block">Marca</small>
                                                <p className="fw-semibold text-dark">{bienData.marca || 'N/A'}</p>
                                            </Col>
                                            <Col xs={6}>
                                                <small className="text-muted d-block">Modelo</small>
                                                <p className="fw-semibold text-dark">{bienData.modelo || 'N/A'}</p>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </Col>

                            {/* Panel 2: Datos Técnicos y Adquisición */}
                            <Col md={6}>
                                <div className="card h-100 border shadow-none">
                                    <div className="card-body">
                                        <h6 className="card-title fw-bold text-dark mb-3 border-bottom pb-2">
                                            <i className="bx bx-receipt me-1"></i> Detalles y Adquisición
                                        </h6>
                                        <Row className="g-2">
                                            <Col xs={6}>
                                                <small className="text-muted d-block">Condición Física</small>
                                                <p className="fw-semibold text-dark text-wrap">
                                                    {bienData.condicion || 'N/A'}
                                                </p>
                                            </Col>
                                            <Col xs={6}>
                                                <small className="text-muted d-block">Estado de Uso</small>
                                                <p className="fw-semibold text-dark text-wrap">
                                                    {bienData.estado_uso || 'N/A'}
                                                </p>
                                            </Col>
                                            <Col xs={12}>
                                                <small className="text-muted d-block">Categoría Específica</small>
                                                <p className="fw-semibold text-dark">{bienData.categoria_especifica || 'N/A'}</p>
                                            </Col>
                                            <Col xs={6}>
                                                <small className="text-muted d-block">Forma de Adquisición</small>
                                                <p className="fw-semibold text-dark">{bienData.forma_adquisicion || 'N/A'}</p>
                                            </Col>
                                            <Col xs={6}>
                                                <small className="text-muted d-block">Fecha de Adquisición</small>
                                                <p className="fw-semibold text-dark">
                                                    {bienData.bim_fec ? new Date(bienData.bim_fec).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </Col>
                                            <Col xs={6}>
                                                <small className="text-muted d-block">Número de Documento</small>
                                                <p className="fw-semibold text-dark">{bienData.bim_ndo || 'N/A'}</p>
                                            </Col>
                                            <Col xs={6}>
                                                <small className="text-muted d-block">Valor de Adquisición</small>
                                                <p className="fw-bold text-success">
                                                    {bienData.bim_val ? `${Number(bienData.bim_val).toLocaleString()} ${bienData.bim_moneda || 'BS'}` : '0.00'}
                                                </p>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </Col>

                            {/* Panel 3: Observaciones */}
                            <Col xs={12}>
                                <div className="card border shadow-none">
                                    <div className="card-body">
                                        <h6 className="card-title fw-bold text-dark mb-2">
                                            <i className="bx bx-message-detail me-1"></i> Observaciones generales
                                        </h6>
                                        <p className="text-muted mb-0 bg-light p-3 rounded" style={{ minHeight: '60px', whiteSpace: 'pre-wrap' }}>
                                            {bienData.bim_obs || 'Ninguna observación registrada para este bien mueble.'}
                                        </p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                ) : (
                    <div className="text-center my-4 py-4 text-muted">
                        No se encontró información disponible para este bien.
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-light">
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar Vista
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalViewBm;
