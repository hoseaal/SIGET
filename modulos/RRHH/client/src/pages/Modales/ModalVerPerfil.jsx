import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from '../../components/atoms/Alert';

/**
 * ModalVerPerfil: Componente universal para visualizar el expediente digital
 * de cualquier tipo de personal (Funcionarios, Obreros, Jubilados, etc.)
 * 
 * @param {boolean} show - Controla la visibilidad del modal
 * @param {function} handleClose - Función para cerrar el modal
 * @param {string|number} empleado_id - ID único del registro
 * @param {string} tipo - Categoría ('funcionario', 'obrero', 'jubilado', 'pensionado', 'sobreviviente')
 */
const ModalVerPerfil = ({ show, handleClose, empleado_id, tipo = 'funcionario' }) => {
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Configuración dinámica por tipo de personal
    const config = {
        funcionario: {
            endpoint: `/api/funcionarios/${empleado_id}?type=full`,
            titulo: 'Perfil del Funcionario',
            icon: 'bx-user',
            color: 'primary'
        },
        obrero: {
            endpoint: `/api/obreros/${empleado_id}`,
            titulo: 'Perfil del Obrero',
            icon: 'bx-wrench',
            color: 'info'
        },
        jubilado: {
            endpoint: `/api/jubilados/${empleado_id}`,
            titulo: 'Perfil del Jubilado',
            icon: 'bx-勲章', // bx-medal equivalent or similar
            color: 'warning'
        },
        pensionado: {
            endpoint: `/api/funcionarios/${empleado_id}?type=full`, // Ajustar si existe endpoint específico
            titulo: 'Perfil del Pensionado',
            icon: 'bx-wallet',
            color: 'secondary'
        },
        sobreviviente: {
            endpoint: `/api/funcionarios/${empleado_id}?type=full`, // Ajustar si existe endpoint específico
            titulo: 'Perfil del Sobreviviente',
            icon: 'bx-heart',
            color: 'danger'
        }
    };

    const currentConfig = config[tipo] || config.funcionario;

    const cargarDatos = async () => {
        if (!empleado_id) return;
        setLoading(true);
        setError('');

        try {
            const res = await fetch(currentConfig.endpoint);
            if (!res.ok) throw new Error(`No se pudo encontrar la información del ${tipo}.`);

            const data = await res.json();
            
            // Adaptación de estructura de datos (backend suele devolver { data: {...} } o directo)
            const perfil = data.data || data.datos_personales || data;
            setDatos(perfil);

        } catch (err) {
            console.error(err);
            setError(`Error al cargar el expediente digital del ${tipo}.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show && empleado_id) {
            setDatos(null);
            cargarDatos();
        }
    }, [show, empleado_id, tipo]);

    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'No registrado';
        const date = new Date(fechaString);
        // Ajuste de zona horaria para evitar desfase de un día
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toLocaleDateString('es-VE');
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title className={`text-${currentConfig.color}`}>
                    <i className={`bx ${currentConfig.icon} me-2`}></i> {currentConfig.titulo}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-light">
                {error && <Alert type="danger">{error}</Alert>}

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant={currentConfig.color} />
                        <p className="mt-2 text-muted">Cargando expediente digital...</p>
                    </div>
                ) : !datos ? (
                    <div className="text-center py-5 text-muted">
                        No hay datos disponibles para este registro.
                    </div>
                ) : (
                    <div className="row">
                        {/* COLUMNA IZQUIERDA: Tarjeta Principal */}
                        <div className="col-md-4 mb-4">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body text-center">
                                    <div className="avatar avatar-xl mb-3 mx-auto" style={{ width: '120px', height: '120px' }}>
                                        <div className={`rounded-circle bg-${currentConfig.color} d-flex align-items-center justify-content-center text-white w-100 h-100 fs-1`}>
                                            {datos.nombres?.charAt(0) || ''}{datos.apellidos?.charAt(0) || ''}
                                        </div>
                                    </div>
                                    <h4 className="card-title fw-bold text-dark mb-1">
                                        {datos.nombres} {datos.apellidos}
                                    </h4>
                                    <p className="text-muted mb-2">C.I: {datos.cedula}</p>
                                    <span className={`badge bg-label-${currentConfig.color} mb-3`}>
                                        {datos.estatus_nombre || (tipo.charAt(0).toUpperCase() + tipo.slice(1))}
                                    </span>

                                    <hr />
                                    <div className="text-start mt-3">
                                        <p className="mb-2">
                                            <i className="bx bx-buildings me-2 text-primary"></i> 
                                            <strong>Adscripción:</strong> {datos.enc_direccion || datos.direccion_nombre || datos.nombre || 'Sin asignar'}
                                        </p>
                                        <p className="mb-2">
                                            <i className="bx bx-briefcase me-2 text-primary"></i> 
                                            <strong>Cargo:</strong> {datos.cargo_cet_nombre || datos.cargo_onapre_nombre || 'No asignado'}
                                        </p>
                                        <p className="mb-0">
                                            <i className="bx bx-calendar me-2 text-primary"></i> 
                                            <strong>Ingreso:</strong> {formatearFecha(datos.fecha_ingreso)}
                                        </p>
                                        
                                        {tipo === 'jubilado' && datos.porcentaje_jubilacion && (
                                            <p className="mt-2 mb-0 text-success fw-bold">
                                                <i className="bx bx-check-shield me-2"></i>
                                                Jubilación: {datos.porcentaje_jubilacion}%
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: Detalles Extendidos */}
                        <div className="col-md-8">
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="mb-0 text-secondary"><i className="bx bx-id-card me-2"></i> Datos Personales</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3 px-2 mt-1">
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Fecha Nacimiento</small>
                                            <span className="fw-semibold">{formatearFecha(datos.fecha_nacimiento)}</span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Género</small>
                                            <span className="fw-semibold text-capitalize">{datos.genero || '-'}</span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Tipo de Sangre</small>
                                            <span className="fw-semibold">{datos.tipo_sangre || '-'}</span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Teléfono Celular</small>
                                            <span className="fw-semibold">{datos.celular || '-'}</span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Correo Principal</small>
                                            <span className="fw-semibold">{datos.correo_principal || '-'}</span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Cuenta Bancaria</small>
                                            <span className="fw-semibold">{datos.cuenta_bancaria || '-'}</span>
                                        </div>
                                        <div className="col-sm-6 col-md-4">
                                            <small className="text-muted d-block">Estado Civil</small>
                                            <span className="fw-semibold text-capitalize">{datos.estado_civil || '-'}</span>
                                        </div>
                                        <div className="col-12 mt-3">
                                            <small className="text-muted d-block">Dirección de Habitación</small>
                                            <span className="fw-semibold">{datos.direccion_habitacion || 'No registrada'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="mb-0 text-secondary"><i className="bx bx-phone-call me-2"></i> Contactos de Emergencia</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3 px-2 mt-1">
                                        <div className="col-md-6 border-end">
                                            <small className="text-muted d-block">Contacto Principal</small>
                                            <span className="fw-semibold d-block mt-1">{datos.contacto_emergencia_1 || 'No registrado'}</span>
                                            <span className="text-muted"><i className="bx bx-phone"></i> {datos.telefono_emergencia_1 || '-'}</span>
                                        </div>
                                        <div className="col-md-6 pb-2">
                                            <small className="text-muted d-block">Contacto Secundario</small>
                                            <span className="fw-semibold d-block mt-1">{datos.contacto_emergencia_2 || 'No registrado'}</span>
                                            <span className="text-muted"><i className="bx bx-phone"></i> {datos.telefono_emergencia_2 || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="mb-0 text-secondary"><i className="bx bx-line-chart me-2"></i> Información Organizacional</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3 px-2 mt-1">
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Dirección (Niv 1)</small>
                                            <span className="fw-semibold text-primary">{datos.direccion_nombre || datos.nombre || 'No asignada'}</span>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">División (Niv 2)</small>
                                            <span className="fw-semibold">{datos.division_nombre || '-'}</span>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Unidad (Niv 3)</small>
                                            <span className="fw-semibold">{datos.unidad_nombre || '-'}</span>
                                        </div>
                                        <div className="col-md-4 mt-3">
                                            <small className="text-muted d-block">Condición Laboral</small>
                                            <span className="fw-semibold">{datos.condicion_laboral_nombre || '-'}</span>
                                        </div>
                                        <div className="col-md-4 mt-3">
                                            <small className="text-muted d-block">Sueldo Base (Bs.)</small>
                                            <span className="fw-semibold text-success">{datos.salario_base ? `Bs. ${Number(datos.salario_base).toLocaleString('es-VE', {minimumFractionDigits: 2})}` : '-'}</span>
                                        </div>
                                        <div className="col-md-4 mt-3">
                                            <small className="text-muted d-block">Estatus</small>
                                            <span className={`badge bg-label-${currentConfig.color}`}>{datos.estatus_nombre || 'Activo'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-white border-top">
                <Button variant="outline-secondary" onClick={handleClose}>
                    Cerrar Expediente
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalVerPerfil;
