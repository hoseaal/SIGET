import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import Select from 'react-select'; // Importa react-select para una mejor experiencia de usuario en selección de bienes

function ModalRegistrarPrestamo({ show, handleClose, onSuccess }) {
    const [formData, setFormData] = useState({
        pre_ndo: '',           // Número de oficio
        pre_fec: new Date().toISOString().slice(0, 10), // Fecha actual por defecto
        dep_origen_ide: '',    // Departamento de origen
        dep_ide: '',           // Departamento de destino
        usu_ide: '',           // Usuario que registra el préstamo (asumimos que lo obtendremos del contexto de autenticación o de otra forma)
        pre_obs: '',           // Observaciones del préstamo
        bienesSeleccionados: [], // Array para los bienes seleccionados
    });

    const [departamentos, setDepartamentos] = useState([]);
    const [condicionesFisicas, setCondicionesFisicas] = useState([]);
    const [bienesDisponibles, setBienesDisponibles] = useState([]); // Bienes que se pueden seleccionar
    const [filteredBienes, setFilteredBienes] = useState([]); // Bienes filtrados por departamento de origen

    const [formEnviado, setFormEnviado] = useState(false);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    // IDs de exclusión
    const CONDICION_FISICA_EXCLUIDA = 4; // "Mal estado en almacén"
    const DEPARTAMENTO_EXCLUIDO = 11;    // ID del departamento "Almacén" (si existe)

    useEffect(() => {
        if (show) {
            // Reiniciar formData cada vez que el modal se abre
            setFormData({
                pre_ndo: '',
                pre_fec: new Date().toISOString().slice(0, 10),
                dep_origen_ide: '',
                dep_ide: '',
                usu_ide: '', // Podrías pre-llenar esto con el ID del usuario logueado
                pre_obs: '',
                bienesSeleccionados: [],
            });
            setErrorMessage('');
            setShowAlert(false);

            // Cargar datos al abrir el modal
            fetchInitialData();
        }
    }, [show]);

    // Cargar departamentos, condiciones físicas y todos los bienes (no filtrados inicialmente)
    const fetchInitialData = async () => {
        try {
            // Departamentos
            const [depRes, condRes, bienesRes] = await Promise.all([
                fetch('/api/departamentos', { credentials: 'include' }),
                fetch('/api/condiciones-fisicas', { credentials: 'include' }),
                fetch('/api/bienes', { credentials: 'include' }), // Traemos todos los bienes inicialmente
            ]);

            if (!depRes.ok || !condRes.ok || !bienesRes.ok) {
                throw new Error('Error al cargar datos iniciales.');
            }

            const depData = await depRes.json();
            const condData = await condRes.json();
            const bienesData = await bienesRes.json();

            setDepartamentos(depData || []);
            // Filtrar condición física 4 ("Mal estado en almacén")
            setCondicionesFisicas(condData.filter(cond => cond.cof_ide !== CONDICION_FISICA_EXCLUIDA) || []);
            setBienesDisponibles(bienesData.data || []); // Guarda todos los bienes
            setFilteredBienes(bienesData.data || []); // Inicialmente, todos los bienes están disponibles para selección
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
                bien.dep_ide === depOrigenId && // Bienes que pertenecen al departamento de origen seleccionado
                bien.cof_ide !== CONDICION_FISICA_EXCLUIDA && // No "Mal estado en almacén"
                bien.dep_ide !== DEPARTAMENTO_EXCLUIDO // No del departamento "Almacén"
            );
            setFilteredBienes(bienesFiltrados);
        } else {
            // Si no hay departamento de origen seleccionado, no hay bienes para añadir
            setFilteredBienes([]);
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

        // Validaciones previas
        if (!formData.pre_ndo || !formData.pre_fec || !formData.dep_origen_ide || !formData.dep_ide) {
            setErrorMessage('Por favor, complete todos los campos obligatorios.');
            setShowAlert(true);
            return;
        }

        if (formData.dep_origen_ide === formData.dep_ide) {
            setErrorMessage('El Departamento de Origen y el Departamento de Destino no pueden ser el mismo.');
            setShowAlert(true);
            return;
        }

        // Exclusión de Departamento 11 (Almacén) como destino para préstamos normales
        if (parseInt(formData.dep_ide) === DEPARTAMENTO_EXCLUIDO) {
            setErrorMessage('No se puede realizar un préstamo normal al Departamento de Almacén. Use la gestión de "Bienes en Mal Estado".');
            setShowAlert(true);
            return;
        }

        // Mapear los IDs de bienes seleccionados para enviarlos
        const bienesParaEnviar = formData.bienesSeleccionados;

        if (bienesParaEnviar.length === 0) {
            setErrorMessage('Debe seleccionar al menos un bien para el préstamo.');
            setShowAlert(true);
            return;
        }

        const payload = {
            pre_ndo: formData.pre_ndo,
            pre_fec: formData.pre_fec,
            dep_origen_ide: parseInt(formData.dep_origen_ide),
            dep_ide: parseInt(formData.dep_ide),
            pre_obs: formData.pre_obs,
            // Asume que usu_ide se obtendrá del contexto del backend o de un valor de usuario logueado.
            // Para el ejemplo, podríamos poner un valor quemado o manejarlo en el backend.
            usu_ide: 1, // **AJUSTAR ESTO: Reemplazar con el ID del usuario autenticado**
            bienes: bienesParaEnviar, // IDs de los bienes
        };

        try {
            const response = await fetch('/api/prestamos', { // Endpoint para crear un nuevo préstamo
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (response.ok) {
                setFormEnviado(true);
                setAlertMessage('Préstamo registrado con éxito.');
                setShowAlert(true);
                setTimeout(() => {
                    handleClose();
                    if (onSuccess) onSuccess();
                }, 1500); // Dar tiempo para ver el mensaje de éxito
            } else {
                throw new Error(responseData.error || 'Error al registrar el préstamo.');
            }
        } catch (error) {
            setFormEnviado(false);
            setErrorMessage(error.message);
            setShowAlert(true);
            console.error('Error al registrar el préstamo:', error);
        }
    };

     const truncateText = (text, maxLength = 10) => {
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;
        
        return (
            <span title={text}>
                {`${text.substring(0, maxLength)}...`}
            </span>
        );
    };

    // Opciones para react-select
    const bienOptions = filteredBienes.map(bien => ({
        value: bien.bie_ide,
        label: `${bien.bim_ide} - ${bien.bim_des.substring(0, 50)+'...'}`,
    }));

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Registrar Nuevo Préstamo Normal</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {showAlert && (
                    <Alert variant={formEnviado ? 'success' : 'danger'} onClose={() => setShowAlert(false)} dismissible>
                        {formEnviado ? alertMessage : errorMessage}
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
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha del Préstamo</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="pre_fec"
                                    value={formData.pre_fec}
                                    onChange={handleChange}
                                    required
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
                                >
                                    <option value="">Seleccione un departamento</option>
                                    {departamentos.map(dep => (
                                        // Excluir el departamento con ID 11 "Almacén" como origen para préstamos normales
                                        // Un préstamo normal NO PUEDE ORIGINARSE del almacén con esta lógica.
                                        // Si un bien ya está en almacén, se gestiona con el endpoint de "mal estado".
                                        dep.dep_ide !== DEPARTAMENTO_EXCLUIDO && (
                                            <option key={dep.dep_ide} value={dep.dep_ide}>{dep.dep_nom}</option>
                                        )
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Departamento de Destino</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="dep_ide"
                                    value={formData.dep_ide}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccione un departamento</option>
                                    {departamentos.map(dep => (
                                        // Excluir el departamento con ID 11 "Almacén" como destino para préstamos normales
                                        dep.dep_ide !== DEPARTAMENTO_EXCLUIDO && (
                                            <option key={dep.dep_ide} value={dep.dep_ide}>{dep.dep_nom}</option>
                                        )
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Bienes a Prestar</Form.Label>
                        <Select
                            isMulti
                            name="bienes"
                            options={bienOptions}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            onChange={handleBienSelectChange}
                            value={bienOptions.filter(option => formData.bienesSeleccionados.includes(option.value))}
                            placeholder="Seleccione los bienes a prestar"
                            noOptionsMessage={() => "No hay bienes disponibles o no se ha seleccionado departamento de origen."}
                        />
                         <Form.Text className="text-muted">
                            Solo se muestran bienes del departamento de origen seleccionado que no están en "mal estado en almacén" y no pertenecen al departamento "Almacén".
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Observaciones</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="pre_obs"
                            value={formData.pre_obs}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Ingrese cualquier observación adicional sobre el préstamo"
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Registrar Préstamo
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalRegistrarPrestamo;