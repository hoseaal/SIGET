import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import helpFetch from '../../../utils/helpFetch';

/**
 * Modal para registrar una nueva transferencia de equipo.
 */
export const TransferenciaModal = ({ show, onHide, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    
    // Maestros
    const [equipos, setEquipos] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [user, setUser] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        origen_id: '',
        equipo_id: '',
        destino_id: '',
        asunto: '',
        observaciones: ''
    });

    useEffect(() => {
        if (show) {
            fetchInitialData();
        } else {
            // Reset form when closed
            setFormData({
                origen_id: '',
                equipo_id: '',
                destino_id: '',
                asunto: '',
                observaciones: ''
            });
        }
    }, [show]);

    const fetchInitialData = async () => {
        try {
            setInitialLoading(true);
            
            // 1. Verificar usuario
            const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
            const userData = await userRes.json();
            
            if (!userData.success) {
                toast.error("Sesión expirada");
                onHide();
                return;
            }
            setUser(userData.user);

            // 2. Cargar Departamentos y Equipos
            const [deps, allEquipos] = await Promise.all([
                helpFetch.GET("/departamento"),
                helpFetch.GET("/equipo")
            ]);

            setDepartamentos(deps);
            setEquipos(allEquipos);

            // 3. Pre-seleccionar Soporte Técnico como DESTINO
            const soporte = deps.find(d => d.nombre.toUpperCase().includes('SERVICIO TECNICO') || d.nombre.toUpperCase().includes('SOPORTE'));
            if (soporte) {
                setFormData(prev => ({ ...prev, destino_id: soporte.id }));
            }

            // 4. Pre-seleccionar departamento del usuario como ORIGEN (si existe)
            const userDepId = userData.user.direc_id;
            if (userDepId) {
                setFormData(prev => ({ ...prev, origen_id: userDepId }));
            }

        } catch (error) {
            console.error("Error al cargar datos iniciales:", error);
            toast.error("Error al cargar datos del formulario");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'origen_id') {
            setFormData(prev => ({ ...prev, [name]: value, equipo_id: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.origen_id || !formData.equipo_id || !formData.destino_id || !formData.asunto) {
            toast.warning("Por favor complete los campos obligatorios (*)");
            return;
        }

        try {
            setLoading(true);
            const payload = { ...formData, usuario_id: user.usuario_id };
            const response = await helpFetch.POST("/transferencia", payload);
            
            if (response) {
                toast.success(`Transferencia ${response.data.nro_caso} registrada con éxito`);
                onSuccess();
            }
        } catch (error) {
            console.error(error);
            const msg = error.message.includes('409') 
                ? "El equipo ya tiene una transferencia pendiente." 
                : (error.message || "Error al registrar la transferencia");
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar equipos según origen seleccionado
    const filteredEquipos = formData.origen_id 
        ? equipos.filter(eq => String(eq.direc_id) === String(formData.origen_id))
        : [];

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton className="text-dark">
                <Modal.Title>Nueva Transferencia a Servicio Técnico</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {initialLoading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Cargando información...</p>
                        </div>
                    ) : (
                        <>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Departamento de Origen <span className="text-danger">*</span></Form.Label>
                                        <Form.Select 
                                            name="origen_id" 
                                            value={formData.origen_id} 
                                            onChange={handleChange} 
                                            required
                                            disabled={user?.rol_id !== 1}
                                        >
                                            <option value="">Seleccione origen...</option>
                                            {departamentos.map(dep => (
                                                <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                                            ))}
                                        </Form.Select>
                                        {user?.rol_id !== 1 && <Form.Text className="text-muted">Asignado automáticamente por su perfil.</Form.Text>}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Entregar a (Destino) <span className="text-danger">*</span></Form.Label>
                                        <Form.Select name="destino_id" value={formData.destino_id} onChange={handleChange} required>
                                            <option value="">Seleccione destino...</option>
                                            {departamentos
                                                .filter(d => d.nombre.toUpperCase().includes('SERVICIO TECNICO') || d.nombre.toUpperCase().includes('SOPORTE'))
                                                .map(dep => (
                                                    <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                                                ))
                                            }
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Equipo a Transferir <span className="text-danger">*</span></Form.Label>
                                        <Form.Select name="equipo_id" value={formData.equipo_id} onChange={handleChange} required disabled={!formData.origen_id}>
                                            <option value="">{formData.origen_id ? 'Seleccione un equipo...' : 'Primero seleccione origen'}</option>
                                            {filteredEquipos.map(eq => (
                                                <option key={eq.id} value={eq.id}>
                                                    {eq.nro_bien} - {eq.tipo_de_equipo} ({eq.modelo_nombre || 'S/M'})
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Text className="text-muted">
                                            Solo se muestran equipos del departamento de origen seleccionado.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Asunto / Motivo <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text" name="asunto" placeholder="Describa el motivo..." value={formData.asunto} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Observaciones Adicionales</Form.Label>
                                <Form.Control as="textarea" rows={3} name="observaciones" placeholder="Detalles de la falla..." value={formData.observaciones} onChange={handleChange} />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading || initialLoading}>
                        {loading ? <Spinner size="sm" animation="border" className="me-1" /> : <i className="bx bx-send me-1"></i>}
                        Registrar Transferencia
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
