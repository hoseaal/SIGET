import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import helpFetch from '../../../utils/helpFetch';

export const SolicitudMantenimientoModal = ({ show, onHide, onSuccess, user }) => {
    const [loading, setLoading] = useState(false);
    const [equipos, setEquipos] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [formData, setFormData] = useState({
        tipo_falla: 'Equipo de Computación',
        direc_id: '',
        equipo_id: '',
        asunto: '',
        descripcion: '',
        prioridad: 'Media'
    });

    useEffect(() => {
        if (show && user) {
            fetchInitialData();
            setFormData(prev => ({ 
                ...prev, 
                direc_id: user.direc_id // Por defecto el del usuario logueado
            }));
        }
    }, [show, user]);

    // Cuando cambie el departamento seleccionado, recargar equipos de ese depto
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

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{esTecnico ? 'Registrar Mantenimiento (Admin/Técnico)' : 'Reportar Falla / Mantenimiento'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={esTecnico ? 4 : 6}>
                            <Form.Group>
                                <Form.Label>Tipo de Falla</Form.Label>
                                <Form.Select name="tipo_falla" value={formData.tipo_falla} onChange={handleChange}>
                                    <option value="Equipo de Computación">Equipo de Computación</option>
                                    <option value="Falla de Red / Internet">Falla de Red / Internet</option>
                                    <option value="Impresora / Toner">Impresora / Toner</option>
                                    <option value="Software / Aplicación">Software / Aplicación</option>
                                    <option value="Otro">Otro</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        
                        {esTecnico && (
                            <Col md={4}>
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
                            </Col>
                        )}

                        <Col md={esTecnico ? 4 : 6}>
                            <Form.Group>
                                <Form.Label>Prioridad</Form.Label>
                                <Form.Select name="prioridad" value={formData.prioridad} onChange={handleChange}>
                                    <option value="Baja">Baja</option>
                                    <option value="Media">Media</option>
                                    <option value="Alta">Alta</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>


                    {formData.tipo_falla === 'Equipo de Computación' && (
                        <Form.Group className="mb-3">
                            <Form.Label>Seleccionar Equipo (Opcional)</Form.Label>
                            <Form.Select name="equipo_id" value={formData.equipo_id} onChange={handleChange}>
                                <option value="">-- No aplica / No listado --</option>
                                {equipos.map(e => (
                                    <option key={e.id} value={e.id}>{e.nro_bien} - {e.tipo_nombre}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}

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
