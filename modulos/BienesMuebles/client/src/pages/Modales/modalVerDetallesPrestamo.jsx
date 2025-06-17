import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, ListGroup, Spinner } from 'react-bootstrap';
import Select from 'react-select'; // Importa react-select

function ModalVerDetallesPrestamo({ show, handleClose, prestamoId, onSuccess }) {
    const [prestamoDetalle, setPrestamoDetalle] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [alertMessage, setAlertMessage] = useState(''); // Para mensajes de éxito/info
    const [showAlert, setShowAlert] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Para controlar el estado de envío

    // Estados para la lógica de devolución
    const [opcionDevolucion, setOpcionDevolucion] = useState('oficio'); // 'oficio' o 'individual'
    const [bienIndividualSeleccionado, setBienIndividualSeleccionado] = useState(null);
    const [bienesActivosPrestamo, setBienesActivosPrestamo] = useState([]); // Bienes con dpr_est = 1

    const truncateText = (text, maxLength = 30) => { // Ajustado a 30 para mejor visibilidad
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;
        
        return (
            <span title={text}>
                {`${text.substring(0, maxLength)}...`}
            </span>
        );
    };

    useEffect(() => {
        if (show && prestamoId) {
            fetchPrestamoDetalle(prestamoId);
            // Reiniciar estados de devolución cuando el modal se abre
            setOpcionDevolucion('oficio');
            setBienIndividualSeleccionado(null);
            setErrorMessage('');
            setAlertMessage('');
            setShowAlert(false);
            setIsSubmitting(false);
        } else if (!show) {
            // Limpiar el estado cuando el modal se cierra
            setPrestamoDetalle(null);
            setErrorMessage('');
            setAlertMessage('');
            setShowAlert(false);
            setIsSubmitting(false);
            setBienesActivosPrestamo([]);
        }
    }, [show, prestamoId]);

    const fetchPrestamoDetalle = async (id) => {
        try {
            setShowAlert(false);
            setErrorMessage('');
            setAlertMessage(''); // Limpiar también el mensaje de éxito
            const response = await fetch(`/api/prestamos/${id}`, { credentials: 'include' });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Préstamo no encontrado.');
                }
                throw new Error('Error al cargar los detalles del préstamo.');
            }

            const result = await response.json(); // Asume que la API devuelve { success: true, data: prestamo }
            const data = result; // Acceder a la propiedad 'data'
            setPrestamoDetalle(data);

            // Filtrar y establecer solo los bienes que aún están activos (dpr_est = 1)
            const activos = data.bienes_detalles?.filter(bien => bien.dpr_est === 1) || [];
            setBienesActivosPrestamo(activos);

        } catch (error) {
            console.error('Error fetching loan details:', error);
            setErrorMessage(error.message);
            setShowAlert(true);
            setPrestamoDetalle(null);
            setBienesActivosPrestamo([]);
        }
    };

    const formatFecha = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const handleOpcionDevolucionChange = (e) => {
        setOpcionDevolucion(e.target.value);
        setBienIndividualSeleccionado(null); // Limpiar selección individual al cambiar opción
        setErrorMessage('');
        setAlertMessage('');
        setShowAlert(false);
    };

    const handleBienSelectChange = (selectedOption) => {
        setBienIndividualSeleccionado(selectedOption);
        setErrorMessage('');
        setAlertMessage('');
        setShowAlert(false);
    };

    const handleDevolver = async () => {
        setShowAlert(false);
        setErrorMessage('');
        setAlertMessage('');
        setIsSubmitting(true);

        try {
            let response;
            let responseData;

            if (opcionDevolucion === 'oficio') {
                // Devolver todo el oficio
                response = await fetch(`/api/prestamos/${prestamoDetalle.pre_ide}/estado`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pre_est: 0 })
                });
                responseData = await response.json();

                if (!response.ok) {
                    throw new Error(responseData.error || 'Error al devolver el oficio completo.');
                }
                setAlertMessage('Oficio devuelto completamente con éxito.');

            } else { // Devolución individual
                if (!bienIndividualSeleccionado || !bienIndividualSeleccionado.value) {
                    setErrorMessage('Por favor, seleccione un bien para devolver.');
                    setShowAlert(true);
                    setIsSubmitting(false);
                    return;
                }
                // El bim_ide va en la URL, pero dpr_est y pre_ide van en el BODY
                const payload = {
                    dpr_est: 0, // El estado a actualizar
                    pre_ide: prestamoDetalle.pre_ide, // El ID del préstamo para el contexto
                };

                // La URL debe ser /api/prestamos/bien/{bim_ide}/estado
                response = await fetch(`/api/prestamos/bien/${bienIndividualSeleccionado.value}/estado`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload) // Enviamos el payload con dpr_est y pre_ide
                });
                responseData = await response.json();

                if (!response.ok) {
                    throw new Error(responseData.error || 'Error al devolver el bien individualmente.');
                }
                setAlertMessage(`Bien "${bienIndividualSeleccionado.label}" devuelto con éxito.`);
            }

            setShowAlert(true);
            // Refrescar los detalles del préstamo después de una devolución exitosa
            // Esto asegura que la lista de bienes y su estado se actualicen en el modal
            await fetchPrestamoDetalle(prestamoId);
            // Llamar a onSuccess para que la tabla principal (donde se listan los préstamos) se actualice
            if (onSuccess) onSuccess();

        } catch (error) {
            setErrorMessage(error.message);
            setShowAlert(true);
            console.error('Error al procesar devolución:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Opciones para react-select solo para los bienes activos
    const bienOptions = bienesActivosPrestamo.map(bien => ({
        value: bien.bim_ide,
        label: bien.bim_ide + '-' + bien.bim_des.substring(0, 30)+'...'
    }));

    // Determinar si el botón de devolución total debe estar deshabilitado
    const isDevolverOficioDisabled = isSubmitting || bienesActivosPrestamo.length === 0 || prestamoDetalle?.pre_est === 0;

    // Determinar si el botón de devolución individual debe estar deshabilitado
    const isDevolverIndividualDisabled = isSubmitting || bienesActivosPrestamo.length === 0 || !bienIndividualSeleccionado || prestamoDetalle?.pre_est === 0;

    console.log(prestamoDetalle)

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Detalles del Préstamo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {showAlert && (
                    <Alert variant={errorMessage ? 'danger' : 'success'} onClose={() => setShowAlert(false)} dismissible>
                        {errorMessage || alertMessage}
                    </Alert>
                )}

                {prestamoDetalle ? (
                    <Form>
                        <h5 className="mb-3">Información General del Préstamo:</h5>
                        <Row className="mb-2">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label><strong>Número de Oficio:</strong></Form.Label>
                                    <Form.Control type="text" value={prestamoDetalle.pre_ndo || 'N/A'} readOnly plaintext />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label><strong>Fecha del Préstamo:</strong></Form.Label>
                                    <Form.Control type="text" value={formatFecha(prestamoDetalle.pre_fec) || 'N/A'} readOnly plaintext />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label><strong>Departamento de Origen:</strong></Form.Label>
                                    <Form.Control type="text" value={prestamoDetalle.departamento_origen_nombre || 'N/A'} readOnly plaintext />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label><strong>Departamento de Destino:</strong></Form.Label>
                                    <Form.Control type="text" value={prestamoDetalle.departamento_destino_nombre || 'N/A'} readOnly plaintext />
                                </Form.Group>
                            </Col>
                        </Row>

                        <hr />

                        <h5 className="mb-3">Bienes Asociados al Préstamo:</h5>
                        {prestamoDetalle.bienes_detalles && prestamoDetalle.bienes_detalles.length > 0 ? (
                            <ListGroup className="mb-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                {prestamoDetalle.bienes_detalles.map((bien) => (
                                    <ListGroup.Item 
                                        key={bien.bim_ide} 
                                        variant={bien.dpr_est === 0 ? 'secondary' : ''} // Estilo para bienes devueltos
                                    >
                                        <Row className="align-items-center">
                                            <Col xs={10}>
                                                <strong>(ID: {bien.bim_ide})</strong> - {truncateText(bien.bim_des)} 
                                                <br/>
                                                <small>
                                                    Estado: 
                                                    <span className={`ms-1 fw-bold ${bien.dpr_est === 1 ? 'text-success' : 'text-danger'}`}>
                                                        {bien.dpr_est === 1 ? 'ACTIVO' : 'DEVUELTO'}
                                                    </span>
                                                </small>
                                            </Col>
                                            <Col xs={2} className="text-end">
                                                {/* Solo mostrar botón si el bien está activo y el préstamo no está completamente devuelto */}
                                                {bien.dpr_est === 1 && prestamoDetalle.pre_est === 1 && (
                                                    <Button 
                                                        variant="outline-primary" 
                                                        size="sm" 
                                                        onClick={() => {
                                                            setOpcionDevolucion('individual');
                                                            setBienIndividualSeleccionado({ value: bien.bim_ide, label: `${bien.bim_cod || 'N/A'} - ${bien.bim_des}` });
                                                            // Opcional: Desplazar a la sección de devolución
                                                            const devolucionSection = document.getElementById('devolucion-section');
                                                            if (devolucionSection) {
                                                                devolucionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                            }
                                                        }}
                                                        disabled={isSubmitting}
                                                        title="Devolver solo este bien"
                                                    >
                                                        Devolver
                                                    </Button>
                                                )}
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <Alert variant="info">No hay bienes asociados a este préstamo.</Alert>
                        )}

                        {/* Sección de Devolución, solo si el préstamo está activo */}
                        {prestamoDetalle.pre_est === 1 && (
                            <>
                                <hr />
                                <h5 className="mb-3" id="devolucion-section">Opciones de Devolución:</h5>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Devolver TODOS los bienes de este oficio"
                                        name="devolucionOption"
                                        id="devolucionOficio"
                                        value="oficio"
                                        checked={opcionDevolucion === 'oficio'}
                                        onChange={handleOpcionDevolucionChange}
                                        disabled={isSubmitting || bienesActivosPrestamo.length === 0}
                                    />
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Devolver UN bien individualmente"
                                        name="devolucionOption"
                                        id="devolucionIndividual"
                                        value="individual"
                                        checked={opcionDevolucion === 'individual'}
                                        onChange={handleOpcionDevolucionChange}
                                        disabled={isSubmitting || bienesActivosPrestamo.length === 0}
                                    />
                                </Form.Group>

                                {opcionDevolucion === 'individual' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Seleccione el Bien a Devolver:</Form.Label>
                                        <Select
                                            name="bienIndividual"
                                            options={bienOptions}
                                            className="basic-single-select"
                                            classNamePrefix="select"
                                            onChange={handleBienSelectChange}
                                            value={bienIndividualSeleccionado}
                                            placeholder="Buscar y seleccionar bien..."
                                            noOptionsMessage={() => "No hay bienes activos para devolución individual."}
                                            isClearable
                                            isDisabled={isSubmitting || bienesActivosPrestamo.length === 0}
                                        />
                                        {bienesActivosPrestamo.length === 0 && (
                                            <Form.Text className="text-muted">
                                                No hay bienes pendientes de devolución en este oficio que puedan ser devueltos individualmente.
                                            </Form.Text>
                                        )}
                                    </Form.Group>
                                )}

                                <div className="d-grid gap-2 mt-4">
                                    {opcionDevolucion === 'oficio' && (
                                        <Button 
                                            variant="danger" 
                                            onClick={handleDevolver} 
                                            disabled={isDevolverOficioDisabled}
                                        >
                                            {isSubmitting ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />Devolviendo Oficio Completo...</> : 'Devolver Oficio Completo'}
                                        </Button>
                                    )}

                                    {opcionDevolucion === 'individual' && (
                                        <Button 
                                            variant="warning" 
                                            onClick={handleDevolver} 
                                            disabled={isDevolverIndividualDisabled}
                                        >
                                            {isSubmitting ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />Devolviendo Bien Seleccionado...</> : 'Devolver Bien Seleccionado'}
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                         {prestamoDetalle.pre_est === 0 && (
                            <Alert variant="success" className="mt-4 text-center">
                                Este préstamo ha sido completamente devuelto.
                            </Alert>
                        )}
                    </Form>
                ) : (
                    <div className="text-center my-4">
                        <Spinner animation="border" role="status" className="me-2" />
                        Cargando detalles del préstamo...
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalVerDetallesPrestamo;