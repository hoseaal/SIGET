import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import Select from 'react-select'; // Asegúrate de tener react-select instalado

function ModalEnviarBienAlmacen({ show, handleClose, onSuccess }) {
    const DEPARTAMENTO_ALMACEN_ID = 11; // ID del departamento "Almacén"
    const CONDICION_FISICA = 4; // "Mal estado en almacén" (no deberían enviarse más a almacén si ya están así)

    const [formData, setFormData] = useState({
        pre_ndo: '',                         // Número de oficio
        pre_fec: new Date().toISOString().slice(0, 10), // Fecha actual por defecto
        dep_origen_ide: '',                  // Departamento de origen (seleccionable)
        dep_ide: DEPARTAMENTO_ALMACEN_ID,    // Departamento de destino (fijo: Almacén)
        bienesSeleccionados: [],             // Array para los bienes seleccionados
    });

    const [departamentos, setDepartamentos] = useState([]);
    const [bienesDisponibles, setBienesDisponibles] = useState([]); // Todos los bienes
    const [filteredBienes, setFilteredBienes] = useState([]);     // Bienes filtrados para selección

    const [loading, setLoading] = useState(false); // Estado de carga del formulario
    const [errorMessage, setErrorMessage] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (show) {
            // Reiniciar formData y estados de alerta cada vez que el modal se abre
            setFormData({
                pre_ndo: '',
                pre_fec: new Date().toISOString().slice(0, 10),
                dep_origen_ide: '',
                dep_ide: DEPARTAMENTO_ALMACEN_ID, // Asegurarse de que el destino es siempre Almacén
                bienesSeleccionados: [],
            });
            setErrorMessage('');
            setAlertMessage('');
            setShowAlert(false);
            setLoading(false);

            // Cargar datos al abrir el modal
            fetchInitialData();
        }
    }, [show]);

    // Cargar departamentos y todos los bienes
    const fetchInitialData = async () => {
        try {
            const [depRes, bienesRes] = await Promise.all([
                fetch('/api/departamentos', { credentials: 'include' }),
                fetch('/api/bienes/all?inc=1', { credentials: 'include' }),
            ]);

            if (!depRes.ok || !bienesRes.ok) {
                throw new Error('Error al cargar datos iniciales necesarios.');
            }

            const depData = await depRes.json();
            const bienesData = await bienesRes.json();

            setDepartamentos(Array.isArray(depData) ? depData : (depData.data || []));
            setBienesDisponibles(Array.isArray(bienesData) ? bienesData : (bienesData.data || []));
            setFilteredBienes([]); // Reset filteredBienes
        } catch (error) {
            console.error('Error fetching initial data:', error);
            setErrorMessage('No se pudieron cargar los datos necesarios para el formulario.');
            setShowAlert(true);
        }
    };

    // Filtrar bienes por departamento de origen seleccionado y exclusiones
    useEffect(() => {
        if (formData.dep_origen_ide) {
            const depOrigenId = parseInt(formData.dep_origen_ide);
            const bienesFiltrados = bienesDisponibles.filter(bien =>
                bien.dep_ide === depOrigenId && // Bienes que actualmente pertenecen al departamento de origen seleccionado
                bien.dep_ide !== DEPARTAMENTO_ALMACEN_ID && // Asegurarse de que no están ya en almacén
                bien.con_ide === CONDICION_FISICA // solo incluir bienes ya marcados como "Mal estado en almacén"
            );
            setFilteredBienes(bienesFiltrados);
            // Si los bienes seleccionados ya no están en el filteredBienes, removerlos
            setFormData(prev => ({
                ...prev,
                bienesSeleccionados: prev.bienesSeleccionados.filter(bienId =>
                    bienesFiltrados.some(bien => bien.bim_ide === bienId)
                ),
            }));
        } else {
            setFilteredBienes([]);
            setFormData(prev => ({
                ...prev,
                bienesSeleccionados: [],
            }));
        }
    }, [formData.dep_origen_ide, bienesDisponibles]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleBienSelectChange = (selectedOptions) => {
        setFormData(prev => ({
            ...prev,
            bienesSeleccionados: selectedOptions ? selectedOptions.map(option => option.value) : [],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowAlert(false);
        setErrorMessage('');
        setLoading(true);

        // Validaciones previas
        if (!formData.pre_ndo || !formData.pre_fec || !formData.dep_origen_ide) {
            setErrorMessage('Por favor, complete todos los campos obligatorios (Número de Oficio, Fecha, Departamento de Origen).');
            setShowAlert(true);
            setLoading(false);
            return;
        }

        // Validación específica para esta funcionalidad
        if (parseInt(formData.dep_origen_ide) === DEPARTAMENTO_ALMACEN_ID) {
            setErrorMessage('El Departamento de Origen no puede ser "Almacén" para enviar bienes al Almacén.');
            setShowAlert(true);
            setLoading(false);
            return;
        }

        const bienesParaEnviar = formData.bienesSeleccionados;

        if (bienesParaEnviar.length === 0) {
            setErrorMessage('Debe seleccionar al menos un bien para enviar al almacén.');
            setShowAlert(true);
            setLoading(false);
            return;
        }

        const payload = {
            pre_ndo: formData.pre_ndo,
            pre_fec: formData.pre_fec,
            dep_origen_ide: parseInt(formData.dep_origen_ide),
            dep_ide: DEPARTAMENTO_ALMACEN_ID, // Aseguramos que el destino es el Almacén
            bienes: bienesParaEnviar, // IDs de los bienes
        };

        try {
            // Usamos el endpoint específico para préstamos a almacén
            const response = await fetch('/api/prestamos/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (response.ok) {
                setAlertMessage('Bien(es) enviado(s) al almacén con éxito.');
                setShowAlert(true);
                setTimeout(() => {
                    handleClose();
                    if (onSuccess) onSuccess(); // Forzar la recarga de la tabla padre
                }, 1500); // Dar tiempo para ver el mensaje de éxito
            } else {
                throw new Error(responseData.error || 'Error al enviar el bien(es) al almacén.');
            }
        } catch (error) {
            setErrorMessage(error.message);
            setShowAlert(true);
            console.error('Error al enviar bien(es) al almacén:', error);
        } finally {
            setLoading(false);
        }
    };

    // Opciones para react-select, mostrando solo los bienes filtrados
    const bienOptions = filteredBienes.map(bien => ({
        value: bien.bim_ide,
        label: `${bien.bim_cod || 'N/A'} - ${bien.bim_des}`, // Usar bim_cod y bim_des para el label
    }));

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Enviar Bien(es) a Almacén</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {showAlert && (
                    <Alert variant={errorMessage ? 'danger' : 'success'} onClose={() => setShowAlert(false)} dismissible>
                        {errorMessage || alertMessage}
                    </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Número de Oficio</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="pre_ndo"
                                    value={formData.pre_ndo}
                                    onChange={handleChange}
                                    placeholder="Ingrese el número de oficio"
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha del Envío</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="pre_fec"
                                    value={formData.pre_fec}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Departamento de Origen</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="dep_origen_ide"
                                    value={formData.dep_origen_ide}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Seleccione un departamento</option>
                                    {departamentos
                                        .filter(dep => dep.dep_ide !== DEPARTAMENTO_ALMACEN_ID) // Excluir "Almacén" como origen
                                        .map(dep => (
                                            <option key={dep.dep_ide} value={dep.dep_ide}>
                                                {dep.dep_nom}
                                            </option>
                                        ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Departamento de Destino</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={departamentos.find(dep => dep.dep_ide === DEPARTAMENTO_ALMACEN_ID)?.dep_nom || 'Almacén'}
                                    readOnly // Este campo es de solo lectura y siempre es "Almacén"
                                    disabled={loading}
                                />
                                <Form.Text className="text-muted">
                                    El destino se establece automáticamente como "Almacén".
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Bienes a Enviar al Almacén</Form.Label>
                        <Select
                            isMulti
                            name="bienes"
                            options={bienOptions}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            onChange={handleBienSelectChange}
                            value={bienOptions.filter(option => formData.bienesSeleccionados.includes(option.value))}
                            placeholder="Seleccione los bienes a enviar"
                            noOptionsMessage={() => "No hay bienes disponibles en el departamento de origen seleccionado."}
                            isDisabled={loading || !formData.dep_origen_ide}
                        />
                        <Form.Text className="text-muted">
                            Solo se muestran bienes del departamento de origen seleccionado que NO están actualmente en el almacén ni en mal estado.
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                            Enviando...
                        </>
                    ) : (
                        'Enviar al Almacén'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalEnviarBienAlmacen;