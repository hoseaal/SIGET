import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import Select from 'react-select';

function ModalRegistrarPrestamo({ show, handleClose, onSuccess }) {
    // IDs de Almacén para validación (evitar que usen este modal para enviar a almacén)
    const DEP_ALMACEN_03 = 11; 
    const DEP_ALMACEN_04 = 9;

    const [formData, setFormData] = useState({
        pre_ndo: '',          
        pre_tip: 'Oficio',           
        pre_fec: new Date().toISOString().slice(0, 10), 
        dep_origen_ide: '',   
        dep_ide: '',          
        bienesSeleccionados: [], 
    });

    const [sinNumero, setSinNumero] = useState(false);

    const [departamentos, setDepartamentos] = useState([]);
    const [bienesDisponibles, setBienesDisponibles] = useState([]); 
    const [filteredBienes, setFilteredBienes] = useState([]); 

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (show) {
            setFormData({
                pre_ndo: '',
                pre_tip: 'Oficio',
                pre_fec: new Date().toISOString().slice(0, 10),
                dep_origen_ide: '',
                dep_ide: '',
                bienesSeleccionados: [],
            });
            setErrorMessage('');
            setAlertMessage('');
            setShowAlert(false);
            setLoading(false);
            fetchInitialData();
        }
    }, [show]);

    const fetchInitialData = async () => {
        try {
            const [depRes, bienesRes] = await Promise.all([
                fetch('/api/departamentos', { credentials: 'include' }),
                fetch('/api/bienes/all?inc=1', { credentials: 'include' }),
            ]);

            if (!depRes.ok || !bienesRes.ok) throw new Error('Error al cargar datos iniciales.');

            const depData = await depRes.json();
            const bienesData = await bienesRes.json();

            setDepartamentos(Array.isArray(depData) ? depData : (depData.data || []));
            setBienesDisponibles(Array.isArray(bienesData) ? bienesData : (bienesData.data || []));
            setFilteredBienes([]); 
        } catch (error) {
            console.error('Error fetching initial data:', error);
            setErrorMessage('No se pudieron cargar los datos necesarios.');
            setShowAlert(true);
        }
    };

    // --- LÓGICA DE FILTRADO (Simplificada) ---
    useEffect(() => {
        if (formData.dep_origen_ide) {
            const depOrigenId = parseInt(formData.dep_origen_ide);
            
            const bienesFiltrados = bienesDisponibles.filter(bien =>
                bien.dep_ide === depOrigenId && // Solo bienes del origen seleccionado
                // Validar que NO estén ya en almacén (por seguridad lógica)
                bien.dep_ide !== DEP_ALMACEN_03 && 
                bien.dep_ide !== DEP_ALMACEN_04
                // ELIMINADO: bien.con_ide !== CONDICION_FISICA_EXCLUIDA -> Ahora se permiten todos los estados
            );

            setFilteredBienes(bienesFiltrados);

            // Limpiar selección si los items ya no coinciden
            setFormData(prev => ({
                ...prev,
                bienesSeleccionados: prev.bienesSeleccionados.filter(bienId =>
                    bienesFiltrados.some(bien => bien.bim_ide === bienId)
                ),
            }));
        } else {
            setFilteredBienes([]);
            setFormData(prev => ({ ...prev, bienesSeleccionados: [] }));
        }
    }, [formData.dep_origen_ide, bienesDisponibles]);

    const handleSinNumeroChange = (e) => {
        const isChecked = e.target.checked;
        setSinNumero(isChecked);
        if (isChecked) {
            setFormData(prev => ({ ...prev, pre_ndo: 'Sin Numero', pre_fec: null }));
        } else {
            setFormData(prev => ({ ...prev, pre_ndo: '', pre_fec: new Date().toISOString().slice(0, 10) }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        if (!formData.pre_ndo || !formData.dep_origen_ide || !formData.dep_ide) {
            setErrorMessage('Por favor, complete todos los campos obligatorios.');
            setShowAlert(true);
            setLoading(false);
            return;
        }

        if (formData.dep_origen_ide === formData.dep_ide) {
            setErrorMessage('El origen y el destino no pueden ser el mismo.');
            setShowAlert(true);
            setLoading(false);
            return;
        }
        
        // Validación: Evitar usar este modal para enviar a Almacén (usar el otro modal)
        if (parseInt(formData.dep_ide) === DEP_ALMACEN_03 || parseInt(formData.dep_ide) === DEP_ALMACEN_04) {
             setErrorMessage('Para enviar bienes al Almacén, utilice la opción "Ingresar a Almacén".');
             setShowAlert(true);
             setLoading(false);
             return;
        }

        if (formData.bienesSeleccionados.length === 0) {
            setErrorMessage('Debe seleccionar al menos un bien.');
            setShowAlert(true);
            setLoading(false);
            return;
        }

        const payload = {
            pre_ndo: formData.pre_ndo,
            pre_tip: formData.pre_tip,    
            pre_fec: formData.pre_fec,
            dep_origen_ide: parseInt(formData.dep_origen_ide),
            dep_ide: parseInt(formData.dep_ide),
            bienes: formData.bienesSeleccionados,
            
            // --- CAMBIO IMPORTANTE ---
            pre_cla: 'P' // Clasificación: 'P' para Préstamo Normal
        };

        try {
            const response = await fetch('/api/prestamos', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (response.ok) {
                setAlertMessage('Préstamo registrado con éxito.');
                setShowAlert(true);
                setTimeout(() => {
                    handleClose();
                    if (onSuccess) onSuccess();
                }, 1500); 
            } else {
                throw new Error(responseData.error || 'Error al registrar el préstamo.');
            }
        } catch (error) {
            setErrorMessage(error.message);
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    // Opciones para react-select
    const bienOptions = filteredBienes.map(bien => ({
        value: bien.bim_ide,
        // Mostramos el estado en el label para información del usuario
        label: `${bien.bim_ide} - ${bien.bim_des} (${bien.condicion_nombre || 'Estado desconocido'})`,
    }));

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Registrar Nuevo Préstamo</Modal.Title>
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
                                <Form.Label>Tipo de Préstamo</Form.Label>
                                <Form.Control as="select" name="pre_tip" value={formData.pre_tip} onChange={handleChange} required>
                                    <option value="Oficio">Oficio</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Asignacion">Asignación Personal</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6} className="d-flex align-items-end pb-3">
                             <Form.Group>
                                <Form.Check
                                    type="switch"
                                    id="sin-numero-switch-prestamo"
                                    label="Sin Número de Documento / Fecha"
                                    checked={sinNumero}
                                    onChange={handleSinNumeroChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Número de Documento</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="pre_ndo"
                                    value={formData.pre_ndo}
                                    onChange={handleChange}
                                    placeholder="Ej. OFICIO-RRHH-001"
                                    required
                                    disabled={sinNumero}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha del Préstamo</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="pre_fec"
                                    value={sinNumero ? 'S/N' : formData.pre_fec}
                                    onChange={handleChange}
                                    required
                                    disabled={sinNumero}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Departamento de Origen</Form.Label>
                                <Form.Control as="select" name="dep_origen_ide" value={formData.dep_origen_ide} onChange={handleChange} required >
                                    <option value="">Seleccione origen...</option>
                                    {departamentos
                                        // Excluir almacenes como origen si se desea, o permitirlo si se prestan cosas desde el almacén
                                        // Aquí permitimos todo excepto el destino actual
                                        .filter(dep => dep.dep_ide !== parseInt(formData.dep_ide))
                                        .map(dep => (
                                            <option key={dep.dep_ide} value={dep.dep_ide}>{dep.dep_nom}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Departamento de Destino</Form.Label>
                                <Form.Control as="select" name="dep_ide" value={formData.dep_ide} onChange={handleChange} required>
                                    <option value="">Seleccione destino...</option>
                                    {departamentos
                                        .filter(dep => dep.dep_ide !== parseInt(formData.dep_origen_ide))
                                        .map(dep => (
                                            <option key={dep.dep_ide} value={dep.dep_ide}>{dep.dep_nom}</option>
                                    ))}
                                </Form.Control>
                                <Form.Text className="text-muted">
                                    Si desea enviar al Almacén, use la opción "Ingreso a Almacén" en el menú principal.
                                </Form.Text>
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
                            placeholder={formData.dep_origen_ide ? "Busque y seleccione bienes..." : "Primero seleccione origen"}
                            noOptionsMessage={() => "No hay bienes disponibles en el origen."}
                            isDisabled={loading || !formData.dep_origen_ide}
                        />
                        <Form.Text className="text-muted">
                            Se muestran todos los bienes disponibles del departamento de origen.
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? <><Spinner as="span" animation="border" size="sm" className="me-1"/> Guardando...</> : 'Registrar Préstamo'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalRegistrarPrestamo;