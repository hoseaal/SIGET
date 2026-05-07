import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import helpFetch from '../../../utils/helpFetch';

export const SolicitudMantenimientoModal = ({ show, onHide, onSuccess, user }) => {
    const [loading, setLoading] = useState(false);
    const [equipos, setEquipos] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [tiposFalla, setTiposFalla] = useState([]);
    const [formData, setFormData] = useState({
        direc_id: '',
        equipo_id: '',
        asunto: '',
        descripcion: ''
    });

    useEffect(() => {
        if (show && user) {
            fetchInitialData();
            setFormData(prev => ({ 
                ...prev, 
                direc_id: user.direc_id 
            }));
        }
    }, [show, user]);

    useEffect(() => {
        if (formData.direc_id) {
            fetchEquipos(formData.direc_id);
        }
    }, [formData.direc_id]);

    const fetchInitialData = async () => {
        try {
            const deps = await helpFetch.GET('/departamento');
            setDepartamentos(deps);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchEquipos = async (deptoId) => {
        try {
            const data = await helpFetch.GET('/equipo');
            setEquipos(data.filter(e => e.direc_id === parseInt(deptoId)));
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler especial para react-select
    const handleSelectChange = (selectedOption) => {
        setFormData(prev => ({ 
            ...prev, 
            equipo_id: selectedOption ? selectedOption.value : '' 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.asunto || !formData.descripcion || !formData.direc_id) {
            toast.warning("Por favor complete los campos obligatorios.");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                usuario_id: user.usuario_id
            };
            await helpFetch.POST('/mantenimiento', payload);
            toast.success("Solicitud registrada correctamente.");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Error al registrar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    const esTecnico = user?.rol_id === 1 || user?.rol_id === 2;

    // Preparar opciones para react-select
    const equipoOptions = [
        { value: '', label: '-- No aplica / No listado --' },
        ...equipos.map(e => ({
            value: e.id,
            label: `${e.nro_bien} - ${e.tipo_nombre} (${e.modelo_nombre || 'S/M'})`
        }))
    ];

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{esTecnico ? 'Registrar Mantenimiento (Admin/Técnico)' : 'Reportar Falla / Mantenimiento'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={12}>
                            {esTecnico ? (
                                <Form.Group>
                                    <Form.Label>Departamento Afectado</Form.Label>
                                    <Form.Select 
                                        name="direc_id" 
                                        value={formData.direc_id} 
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {departamentos.map(d => (
                                            <option key={d.id} value={d.id}>{d.nombre}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            ) : (
                                <div className="p-2 bg-light rounded border mb-2">
                                    <small className="text-muted d-block">Solicitante:</small>
                                    <strong>{user?.nombre}</strong> 
                                    <small className="text-muted ms-3">Dpto:</small> {departamentos.find(d => d.id === user?.direc_id)?.nombre}
                                </div>
                            )}
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Seleccionar Equipo (Opcional)</Form.Label>
                        <Select
                            options={equipoOptions}
                            placeholder="Escriba Nro. Bien o Tipo para buscar..."
                            isClearable
                            onChange={handleSelectChange}
                            value={equipoOptions.find(opt => opt.value === formData.equipo_id)}
                            noOptionsMessage={() => "No se encontraron equipos"}
                            theme={(theme) => ({
                                ...theme,
                                borderRadius: 5,
                                colors: {
                                    ...theme.colors,
                                    primary: '#007bff',
                                },
                            })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Asunto / Título Breve</Form.Label>
                        <Form.Control 
                            name="asunto" 
                            value={formData.asunto} 
                            onChange={handleChange} 
                            placeholder="Ej: Monitor no enciende, No hay internet..."
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Descripción Detallada</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={4} 
                            name="descripcion" 
                            value={formData.descripcion} 
                            onChange={handleChange} 
                            placeholder="Describa el problema lo más detallado posible..."
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner size="sm" animation="border" className="me-1" /> : <i className="bx bx-send me-1"></i>}
                        Enviar Reporte
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
