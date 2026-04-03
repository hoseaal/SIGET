import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from '../../components/atoms/Alert';

const ModalVerPerfil = ({ show, handleClose, empleado_id }) => {
    const [funcionario, setFuncionario] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const cargarDatos = async () => {
        if (!empleado_id) return;
        setLoading(true);
        setError('');
        
        try {
            // Se asume que el endpoint base para obtener funcionario único por ID es compatible
            const resFun = await fetch(`/api/funcionarios/${empleado_id}?type=full`);
            if (!resFun.ok) throw new Error('No se pudo encontrar la información del empleado.');
            
            const dataFun = await resFun.json();
            
            // Adaptar en caso de que devuelva un envelope como { data: {...} }
            const perfil = dataFun.data || dataFun.datos_personales || dataFun;
            setFuncionario(perfil);
            
        } catch (err) {
            console.error(err);
            setError('Error al cargar el perfil completo del funcionario.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show && empleado_id) {
            setFuncionario(null);
            cargarDatos();
        }
    }, [show, empleado_id]);

    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'No registrado';
        const date = new Date(fechaString);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toLocaleDateString('es-VE');
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title className="text-primary">
                    <i className="bx bx-user me-2"></i> Perfil del Funcionario
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-light">
                {error && <Alert type="danger">{error}</Alert>}
                
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Cargando expediente digital...</p>
                    </div>
                ) : !funcionario ? (
                    <div className="text-center py-5 text-muted">
                        No hay datos disponibles.
                    </div>
                ) : (
                    <div className="row">
                        {/* COLUMNA IZQUIERDA: Tarjeta Principal */}
                        <div className="col-md-4 mb-4">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body text-center">
                                    <div className="avatar avatar-xl mb-3 mx-auto" style={{ width: '120px', height: '120px' }}>
                                        <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white w-100 h-100 fs-1">
                                            {funcionario.nombres?.charAt(0) || ''}{funcionario.apellidos?.charAt(0) || ''}
                                        </div>
                                    </div>
                                    <h4 className="card-title fw-bold text-dark mb-1">
                                        {funcionario.nombres} {funcionario.apellidos}
                                    </h4>
                                    <p className="text-muted mb-2">{funcionario.cedula}</p>
                                    <span className="badge bg-label-primary mb-3">
                                        {funcionario.estatus_nombre || 'Activo'}
                                    </span>
                                    
                                    <hr />
                                    <div className="text-start mt-3">
                                        <p className="mb-2"><i className="bx bx-buildings me-2 text-primary"></i> <strong>Sede:</strong> {funcionario.enc_direccion || funcionario.direccion_nombre || funcionario.nombre || 'Sin Adscripción'}</p>
                                        <p className="mb-2"><i className="bx bx-briefcase me-2 text-primary"></i> <strong>Cargo:</strong> {funcionario.cargo_cet_nombre || funcionario.cargo_onapre_nombre || 'No asignado'}</p>
                                        <p className="mb-0"><i className="bx bx-calendar me-2 text-primary"></i> <strong>Ingreso:</strong> {formatearFecha(funcionario.fecha_ingreso)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: Detalles Extendidos */}
                        <div className="col-md-8">
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="mb-0 text-secondary"><i className="bx bx-id-card me-2"></i> Datos Personales y de Contacto</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3 px-2 mt-1">
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Fecha Nacimiento</small>
                                            <span className="fw-semibold">{formatearFecha(funcionario.fecha_nacimiento)}</span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Género</small>
                                            <span className="fw-semibold">{funcionario.genero || '-'}</span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Tipo de Sangre</small>
                                            <span className="fw-semibold">{funcionario.tipo_sangre || '-'}</span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Teléfono Celular</small>
                                            <span className="fw-semibold">{funcionario.celular || '-'}</span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Correo Principal</small>
                                            <span className="fw-semibold">{funcionario.correo_principal || '-'}</span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Estado Civil</small>
                                            <span className="fw-semibold">{funcionario.estado_civil || '-'}</span>
                                        </div>
                                        <div className="col-12 mt-3">
                                            <small className="text-muted d-block">Dirección de Habitación</small>
                                            <span className="fw-semibold">{funcionario.direccion_habitacion || 'No registrada'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="mb-0 text-secondary"><i className="bx bx-first-aid me-2"></i>  Contactos de Emergencia</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3 px-2 mt-1">
                                        <div className="col-md-6 border-end">
                                            <small className="text-muted d-block">Contacto 1</small>
                                            <span className="fw-semibold d-block mt-1">{funcionario.contacto_emergencia_1 || 'No registrado'}</span>
                                            <span className="text-muted"><i className="bx bx-phone"></i> {funcionario.telefono_emergencia_1 || '-'}</span>
                                        </div>
                                        <div className="col-md-6 pb-2">
                                            <small className="text-muted d-block">Contacto 2</small>
                                            <span className="fw-semibold d-block mt-1">{funcionario.contacto_emergencia_2 || 'No registrado'}</span>
                                            <span className="text-muted"><i className="bx bx-phone"></i> {funcionario.telefono_emergencia_2 || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="mb-0 text-secondary"><i className="bx bx-line-chart me-2"></i>  Datos Organizacionales (Niveles)</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3 px-2 mt-1">
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Dirección (Niv 1)</small>
                                            <span className="fw-semibold text-primary">{funcionario.direccion_nombre || funcionario.nombre || 'No asignada'}</span>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">División (Niv 2)</small>
                                            <span className="fw-semibold">{funcionario.division_nombre || '-'}</span>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Unidad (Niv 3)</small>
                                            <span className="fw-semibold">{funcionario.unidad_nombre || '-'}</span>
                                        </div>
                                        <div className="col-md-4 mt-3">
                                            <small className="text-muted d-block">Condición Laboral</small>
                                            <span className="fw-semibold">{funcionario.condicion_laboral_nombre || '-'}</span>
                                        </div>
                                        <div className="col-md-4 mt-3">
                                            <small className="text-muted d-block">Sueldo Base (Ref)</small>
                                            <span className="fw-semibold text-success">{funcionario.salario_base ? `Bs. ${funcionario.salario_base}` : '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-white border-top">
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalVerPerfil;
