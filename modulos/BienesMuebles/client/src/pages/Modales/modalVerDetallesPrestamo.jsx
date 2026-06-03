import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, ListGroup, Spinner } from 'react-bootstrap';
import Select from 'react-select';

function ModalVerDetallesPrestamo({ show, handleClose, prestamoId, onSuccess }) {
    const [prestamoDetalle, setPrestamoDetalle] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [alertMessage, setAlertMessage] = useState(''); // Para mensajes de éxito/info
    const [showAlert, setShowAlert] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Para controlar el estado de envío

    // Estados para la lógica de devolución
    const [opcionDevolucion, setOpcionDevolucion] = useState('oficio'); // 'oficio' o 'individual'
    const [bienIndividualSeleccionado, setBienIndividualSeleccionado] = useState(''); // Cambiado a string para <select>
    const [bienesActivosPrestamo, setBienesActivosPrestamo] = useState([]); // Bienes con dpr_est = 1

    // --- NUEVOS ESTADOS PARA GENERAR PDF ---
    const [showPdfForm, setShowPdfForm] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [nombreDirectorAdmin, setNombreDirectorAdmin] = useState('');
    const [nombreJefeCompras, setNombreJefeCompras] = useState('');
    const [nombreJefeDestino, setNombreJefeDestino] = useState('');
    // --- FIN DE NUEVOS ESTADOS ---

    // --- ESTADOS PARA AGREGAR BIEN AL PRÉSTAMO ---
    const [showAddBienForm, setShowAddBienForm] = useState(false);
    const [bienesDelOrigen, setBienesDelOrigen] = useState([]); // Lista completa del dep. de origen
    const [isLoadingBienes, setIsLoadingBienes] = useState(false); // Cargando la lista
    const [selectedBienToAdd, setSelectedBienToAdd] = useState(null); // { value, label, bim_ide, bim_des }
    const [isAddingBien, setIsAddingBien] = useState(false);
    // --- FIN ESTADOS AGREGAR BIEN ---


    const truncateText = (text, maxLength = 30) => {
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
            // Reiniciar todos los estados al abrir
            resetModalStates();
        } else if (!show) {
            // Limpiar todo cuando el modal se cierra
            resetModalStates();
            setPrestamoDetalle(null);
        }
    }, [show, prestamoId]);

    // Función para centralizar el reseteo de estados
    const resetModalStates = () => {
        setOpcionDevolucion('oficio');
        setBienIndividualSeleccionado('');
        setErrorMessage('');
        setAlertMessage('');
        setShowAlert(false);
        setIsSubmitting(false);
        setShowPdfForm(false);
        setIsGeneratingPdf(false);
        setNombreDirectorAdmin('');
        setNombreJefeCompras('');
        setNombreJefeDestino('');
        setShowAddBienForm(false);
        setBienesDelOrigen([]);
        setSelectedBienToAdd(null);
        setIsAddingBien(false);
    };

    const fetchPrestamoDetalle = async (id) => {
        try {
            setShowAlert(false);
            setErrorMessage('');
            setAlertMessage('');
            const response = await fetch(`/api/prestamos/${id}`, { credentials: 'include' });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Préstamo no encontrado.');
                }
                throw new Error('Error al cargar los detalles del préstamo.');
            }

            const data = await response.json();
            setPrestamoDetalle(data);

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
        setBienIndividualSeleccionado('');
        setShowAlert(false);
    };

    const handleBienSelectChange = (e) => {
        setBienIndividualSeleccionado(e.target.value);
        setShowAlert(false);
    };

    // --- FUNCIÓN PARA GENERAR EL PDF (TAREA 4: solo bienes activos) ---
    const handleGenerarPdf = async (e) => {
        e.preventDefault();

        if (!nombreDirectorAdmin || !nombreJefeCompras || !nombreJefeDestino) {
            setErrorMessage('Por favor, complete los nombres de todos los funcionarios.');
            setShowAlert(true);
            return;
        }

        setIsGeneratingPdf(true);
        setErrorMessage('');
        setAlertMessage('');
        setShowAlert(false);

        try {
            // Tarea 4: Obtener SOLO bienes activos del préstamo para el PDF
            const bienesActivosRes = await fetch(`/api/prestamos/${prestamoDetalle.pre_ide}/bienes-activos`, { credentials: 'include' });
            if (!bienesActivosRes.ok) throw new Error('No se pudo obtener la lista de bienes activos para el reporte.');
            const bienesActivosData = await bienesActivosRes.json();
            const bienesParaPdf = bienesActivosData.bienes || [];

            if (bienesParaPdf.length === 0) {
                throw new Error('No hay bienes activos en este préstamo para generar el acta.');
            }

            const datosReporte = {
                numeroReporte: prestamoDetalle.pre_ndo,
                fechaReporte: prestamoDetalle.pre_fec,
                departamentoOrigen: prestamoDetalle.departamento_origen_nombre,
                departamentoDestino: prestamoDetalle.departamento_destino_nombre,
                bienes: bienesParaPdf.map(bien => ({
                    bim_ide: bien.bim_ide,
                    bim_des: bien.bim_des,
                    observacion: `ENTREGA DEL BIEN ${bien.bim_des}`
                })),
                nombreDirectorAdmin,
                nombreJefeCompras,
                nombreJefeDestino
            };

            const response = await fetch('/api/pdf/acta-de-entrega', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosReporte)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido al generar el PDF.' }));
                throw new Error(errorData.error || `Error del servidor: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const numeroLimpio = (datosReporte.numeroReporte || 'SN').replace(/[\/\\:*?"<>|]/g, '-');
            link.setAttribute('download', `Acta_de_Entrega_${numeroLimpio}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setAlertMessage(`PDF "Acta de Entrega" generado con ${bienesParaPdf.length} bienes activos.`);
            setShowAlert(true);
            setShowPdfForm(false);

        } catch (error) {
            console.error('Error al generar el PDF:', error);
            setErrorMessage(error.message);
            setShowAlert(true);
        } finally {
            setIsGeneratingPdf(false);
        }
    };
    // --- FIN FUNCIÓN PDF ---

    // --- FUNCIONES PARA AGREGAR BIEN AL PRÉSTAMO ---
    // Carga todos los bienes del departamento de origen del préstamo (igual que modalEnviarBienAlmacen)
    const fetchBienesDelOrigen = async (depId) => {
        if (!depId) return;
        setIsLoadingBienes(true);
        setBienesDelOrigen([]);
        setSelectedBienToAdd(null);
        try {
            const response = await fetch(`/api/bienes/all?inc=1&dep=${depId}`, { credentials: 'include' });
            if (!response.ok) throw new Error('Error al cargar bienes del departamento.');
            const data = await response.json();
            const bienes = Array.isArray(data) ? data : (data.data || []);
            setBienesDelOrigen(bienes);
        } catch (err) {
            console.error('Error cargando bienes del origen:', err);
            setErrorMessage('No se pudieron cargar los bienes del departamento de origen.');
            setShowAlert(true);
        } finally {
            setIsLoadingBienes(false);
        }
    };

    const handleAddBien = async () => {
        if (!selectedBienToAdd) {
            setErrorMessage('Seleccione un bien de la lista.');
            setShowAlert(true);
            return;
        }
        setIsAddingBien(true);
        setShowAlert(false);
        setErrorMessage('');
        try {
            const response = await fetch(`/api/prestamos/${prestamoDetalle.pre_ide}/bienes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ bim_ide: selectedBienToAdd.value })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al agregar el bien.');
            setAlertMessage(`Bien '${selectedBienToAdd.value}' agregado exitosamente al préstamo.`);
            setShowAlert(true);
            setShowAddBienForm(false);
            setSelectedBienToAdd(null);
            setBienesDelOrigen([]);
            await fetchPrestamoDetalle(prestamoId);
            if (onSuccess) onSuccess();
        } catch (error) {
            setErrorMessage(error.message);
            setShowAlert(true);
        } finally {
            setIsAddingBien(false);
        }
    };
    // --- FIN FUNCIONES AGREGAR BIEN ---


    const handleDevolver = async () => {
        setShowAlert(false);
        setErrorMessage('');
        setAlertMessage('');
        setIsSubmitting(true);

        try {
            let response;
            let responseData;

            if (opcionDevolucion === 'oficio') {
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
                if (!bienIndividualSeleccionado) {
                    setErrorMessage('Por favor, seleccione un bien para devolver.');
                    setShowAlert(true);
                    setIsSubmitting(false);
                    return;
                }
                const payload = {
                    dpr_est: 0,
                    pre_ide: prestamoDetalle.pre_ide,
                };

                response = await fetch(`/api/prestamos/bien/${bienIndividualSeleccionado}/estado`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                responseData = await response.json();

                if (!response.ok) {
                    throw new Error(responseData.error || 'Error al devolver el bien individualmente.');
                }

                const bienDevuelto = bienOptions.find(b => b.value === bienIndividualSeleccionado);
                const bienLabel = bienDevuelto ? bienDevuelto.label : `ID ${bienIndividualSeleccionado}`;
                setAlertMessage(`Bien "${bienLabel}" devuelto con éxito.`);
            }

            setShowAlert(true);
            await fetchPrestamoDetalle(prestamoId);
            if (onSuccess) onSuccess();

        } catch (error) {
            setErrorMessage(error.message);
            setShowAlert(true);
            console.error('Error al procesar devolución:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const bienOptions = bienesActivosPrestamo.map(bien => ({
        value: bien.bim_ide,
        label: `${bien.bim_ide} - ${bien.bim_des.substring(0, 40)}...`
    }));

    const isDevolverOficioDisabled = isSubmitting || bienesActivosPrestamo.length === 0 || prestamoDetalle?.pre_est === 0;
    const isDevolverIndividualDisabled = isSubmitting || bienesActivosPrestamo.length === 0 || !bienIndividualSeleccionado || prestamoDetalle?.pre_est === 0;

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
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label><strong>Tipo de Prestamo:</strong></Form.Label>
                                    <Form.Control type="text" value={prestamoDetalle.pre_tip || 'N/A'} readOnly plaintext />
                                </Form.Group>
                            </Col>
                            {/* --- SECCIÓN BOTÓN GENERAR ACTA --- */}
                            <Col md={6} className="d-flex align-items-end">
                                {!showPdfForm && (
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowPdfForm(true)}
                                        disabled={isGeneratingPdf || isSubmitting}
                                    >
                                        Generar Acta de Entrega
                                    </Button>
                                )}
                            </Col>
                        </Row>

                        {/* --- FORMULARIO CONDICIONAL PARA DATOS DEL PDF --- */}
                        {showPdfForm && (
                            <div className="border p-3 rounded mt-3 bg-light">
                                <h5 className="mb-3">Datos para el Acta de Entrega</h5>
                                <Form onSubmit={handleGenerarPdf}>
                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3" controlId="formDirectorAdmin">
                                                <Form.Label>Nombre Director(a) del Depto. Origen</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Ej: Lcda. Ruth Apolinar"
                                                    value={nombreDirectorAdmin}
                                                    onChange={(e) => setNombreDirectorAdmin(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group className="mb-3" controlId="formJefeCompras">
                                                <Form.Label>Nombre Jefe(a) de Compras</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Ej: Abg. Ender Mogollón"
                                                    value={nombreJefeCompras}
                                                    onChange={(e) => setNombreJefeCompras(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group className="mb-3" controlId="formJefeDestino">
                                                <Form.Label>Nombre Director(a) del Depto. Destino</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Ej: Abg. José Alexander Pernía"
                                                    value={nombreJefeDestino}
                                                    onChange={(e) => setNombreJefeDestino(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <div className="d-flex justify-content-end gap-2">
                                        <Button variant="secondary" onClick={() => setShowPdfForm(false)} disabled={isGeneratingPdf}>
                                            Cancelar
                                        </Button>
                                        <Button variant="success" type="submit" disabled={isGeneratingPdf} onClick={handleGenerarPdf}>
                                            {isGeneratingPdf ?
                                                <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Generando...</> :
                                                'Confirmar y Generar PDF'}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        )}

                        <hr />

                        <h5 className="mb-3">Bienes Asociados al Préstamo:</h5>
                        {prestamoDetalle.bienes_detalles && prestamoDetalle.bienes_detalles.length > 0 ? (
                            <ListGroup className="mb-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                {prestamoDetalle.bienes_detalles.map((bien) => (
                                    <ListGroup.Item
                                        key={bien.bim_ide}
                                        variant={bien.dpr_est === 0 ? 'secondary' : ''}
                                    >
                                        <Row className="align-items-center">
                                            <Col xs={10}>
                                                <strong>(ID: {bien.bim_ide})</strong> - {truncateText(bien.bim_des)}
                                                <br />
                                                <small>
                                                    Estado:
                                                    <span className={`ms-1 fw-bold ${bien.dpr_est === 1 ? 'text-success' : 'text-danger'}`}>
                                                        {bien.dpr_est === 1 ? 'ACTIVO' : 'DEVUELTO'}
                                                    </span>
                                                </small>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <Alert variant="info">No hay bienes asociados a este préstamo.</Alert>
                        )}

                        {/* SECCIÓN AGREGAR BIEN AL PRÉSTAMO */}
                        {prestamoDetalle.pre_est === 1 && (
                            <>
                                <hr />
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="mb-0">Agregar Bien al Préstamo:</h5>
                                    {!showAddBienForm && (
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            onClick={() => {
                                                setShowAddBienForm(true);
                                                // Carga los bienes del departamento de origen al abrir el panel
                                                fetchBienesDelOrigen(prestamoDetalle.dep_origen_ide);
                                            }}
                                            disabled={isSubmitting || isAddingBien}
                                        >
                                            <i className="bx bx-plus-circle me-1"></i> Agregar Bien
                                        </Button>
                                    )}
                                </div>
                                {showAddBienForm && (
                                    <div className="border p-3 rounded bg-light mb-3">
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                <strong>Seleccionar bien del departamento de origen:</strong>
                                                <small className="text-muted ms-2">
                                                    ({prestamoDetalle.departamento_origen_nombre || 'dep. origen'})
                                                </small>
                                            </Form.Label>
                                            <Select
                                                options={bienesDelOrigen.map(b => ({
                                                    value: b.bim_ide,
                                                    label: `${b.bim_ide} – ${b.bim_des} (${b.condicion_nombre || 'Estado desc.'})`,
                                                    bim_des: b.bim_des
                                                }))}
                                                value={selectedBienToAdd}
                                                onChange={setSelectedBienToAdd}
                                                isLoading={isLoadingBienes}
                                                isDisabled={isLoadingBienes || isAddingBien}
                                                placeholder={isLoadingBienes ? 'Cargando bienes...' : 'Busque por ID o descripción...'}
                                                noOptionsMessage={() => 'No hay bienes disponibles en el departamento de origen.'}
                                                isClearable
                                            />
                                            <Form.Text className="text-muted">
                                                Se listan los bienes del departamento de origen que no están en préstamo activo.
                                            </Form.Text>
                                        </Form.Group>
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={handleAddBien}
                                                disabled={!selectedBienToAdd || isAddingBien}
                                            >
                                                {isAddingBien
                                                    ? <><Spinner as="span" animation="border" size="sm" className="me-1" />Agregando...</>
                                                    : 'Confirmar y Agregar'
                                                }
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    setShowAddBienForm(false);
                                                    setSelectedBienToAdd(null);
                                                    setBienesDelOrigen([]);
                                                }}
                                                disabled={isAddingBien}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* SECCION DE DEVOLUCION */}
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
                                        value="individual"
                                        checked={opcionDevolucion === 'individual'}
                                        onChange={handleOpcionDevolucionChange}
                                        disabled={isSubmitting || bienesActivosPrestamo.length === 0}
                                    />
                                </Form.Group>

                                {opcionDevolucion === 'individual' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Seleccione el Bien a Devolver:</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={bienIndividualSeleccionado}
                                            onChange={handleBienSelectChange}
                                            disabled={isSubmitting || bienesActivosPrestamo.length === 0}
                                        >
                                            <option value="">Buscar y seleccionar bien...</option>
                                            {bienOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                )}

                                <div className="d-grid gap-2 mt-4">
                                    {opcionDevolucion === 'oficio' && (
                                        <Button
                                            variant="danger"
                                            onClick={handleDevolver}
                                            disabled={isDevolverOficioDisabled}
                                        >
                                            {isSubmitting ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />{`Devolviendo ${prestamoDetalle.pre_tip}...`}</> : `Devolver ${prestamoDetalle.pre_tip}`}
                                        </Button>
                                    )}

                                    {opcionDevolucion === 'individual' && (
                                        <Button
                                            variant="warning"
                                            onClick={handleDevolver}
                                            disabled={isDevolverIndividualDisabled}
                                        >
                                            {isSubmitting ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />Devolviendo Bien...</> : 'Devolver Bien Seleccionado'}
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
                <Button variant="secondary" onClick={handleClose} disabled={isSubmitting || isGeneratingPdf}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalVerDetallesPrestamo;