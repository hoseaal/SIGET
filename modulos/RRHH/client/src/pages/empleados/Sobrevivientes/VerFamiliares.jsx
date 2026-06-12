import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Spinner } from 'react-bootstrap';

const VerFamiliares = ({ show, handleClose, sobreviviente_id }) => {
    const [familiares, setFamiliares] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!show || !sobreviviente_id) return;

        const loadFamiliares = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/sobrevivientes/${sobreviviente_id}/familiares`);
                const result = await response.json();
                if (result.success) {
                    const familiaresFiltrados = (result.data || []).filter(
                        fam => fam.fecha_ingreso_beneficio && fam.edad >= 18
                    );
                    setFamiliares(familiaresFiltrados);
                } else {
                    throw new Error(result.error || 'Error al cargar los familiares');
                }
            } catch (err) {
                console.error('Error cargando familiares:', err);
                setError('No se pudieron cargar los familiares.');
            } finally {
                setIsLoading(false);
            }
        };

        loadFamiliares();
    }, [show, sobreviviente_id]);

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    <i className="bx bx-id-card me-2"></i> Perfil del Familiar Sobreviviente
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Cargando familiares...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger text-center">
                        <i className="bx bx-error-circle me-2"></i> {error}
                    </div>
                ) : familiares.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <i className="bx bx-info-circle fs-1 mb-2"></i>
                        <p>No hay familiares vinculados a este sobreviviente.</p>
                    </div>
                ) : (
                    <div className="container-fluid px-0">
                        {familiares.map((fam) => (
                            <div className="card shadow-sm border-0 mb-3" key={fam.familiar_id}>
                                <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 text-secondary">
                                        <i className="bx bx-user-circle me-2"></i>
                                        {fam.nombres} {fam.apellidos}
                                    </h5>
                                    <span className={`badge ${fam.estatus ? 'bg-label-success' : 'bg-label-danger'}`}>
                                        {fam.estatus ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <div className="row g-4 px-2 mt-1">
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Cédula de Identidad</small>
                                            <span className="fw-semibold">
                                                {fam.cedula || '—'}
                                            </span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Parentesco</small>
                                            <span className="fw-semibold text-primary text-capitalize">
                                                {fam.parentesco || '—'}
                                            </span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Fecha Nacimiento</small>
                                            <span className="fw-semibold pb-1">
                                                {fam.fecha_nacimiento ? new Date(fam.fecha_nacimiento).toLocaleDateString('es-VE') : '—'}
                                            </span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Edad</small>
                                            <span className="fw-semibold">{fam.edad ? `${fam.edad} años` : '—'}</span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Teléfono</small>
                                            <span className="fw-semibold"><i className="bx bx-phone me-1 text-muted"></i>{fam.telefono || '—'}</span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Cuenta Bancaria</small>
                                            <span className="fw-semibold text-monospace">{fam.cuenta_bancaria || '—'}</span>
                                        </div>
                                        <div className="col-12 mt-3">
                                            <small className="text-muted d-block mb-1">Dirección Registrada</small>
                                            <div className="p-2 bg-light rounded text-dark">
                                                <i className="bx bx-map me-2 text-primary"></i>
                                                {fam.direccion || 'Dirección no especificada'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default VerFamiliares;
