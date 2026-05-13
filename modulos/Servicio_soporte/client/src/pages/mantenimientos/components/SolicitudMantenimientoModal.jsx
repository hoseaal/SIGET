import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import helpFetch from '../../../utils/helpFetch';
import { Nav } from 'react-bootstrap';

export const SolicitudMantenimientoModal = ({ show, onHide, onSuccess, user }) => {
    const [loading, setLoading] = useState(false);
    const [equipos, setEquipos] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [tiposFalla, setTiposFalla] = useState([]);
    const [fetchingInitial, setFetchingInitial] = useState(false);
    const [activeTab, setActiveTab] = useState('general'); // 'general' o 'toner'
    const [formData, setFormData] = useState({
        direc_id: '',
        equipo_id: '',
        tipo_falla: '',
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
            setFetchingInitial(true);
            const [deps, types] = await Promise.all([
                helpFetch.GET('/departamento'),
                helpFetch.GET('/tipo_act')
            ]);
            setDepartamentos(deps);
            setTiposFalla(types);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar datos maestros");
        } finally {
            setFetchingInitial(false);
        }
    };

    // Sincronizar tipo_falla según el tab activo
    useEffect(() => {
        if (tiposFalla.length > 0) {
            let targetType;
            if (activeTab === 'general') {
                targetType = tiposFalla.find(t => t.nombre.toUpperCase() === 'OTRO');
            } else {
                targetType = tiposFalla.find(t =>
                    t.nombre.toLowerCase().includes('informe asignacion de toner') ||
                    t.nombre.toLowerCase().includes('toner')
                );
            }

            if (targetType) {
                setFormData(prev => ({ ...prev, tipo_falla: targetType.id }));
            }
        }
    }, [activeTab, tiposFalla]);

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

    const isTonerReport = () => {
        return activeTab === 'toner';
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
    const getFilteredEquipos = () => {
        let filtered = [...equipos];
        if (isTonerReport()) {
            filtered = filtered.filter(e => e.tipo_de_equipo?.toLowerCase().includes('impresora'));
        }
        return filtered;
    };

    const equipoOptions = [
        { value: '', label: '-- No aplica / No listado --' },
        ...getFilteredEquipos().map(e => ({
            value: e.id,
            label: `${e.nro_bien} -  ${e.tipo_de_equipo || 'S/T'} - Marca: ${e.marca_nombre || 'S/M'} ${e.modelo_nombre ? `(${e.modelo_nombre})` : ''}`
        }))
    ];

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{esTecnico ? 'Registrar Mantenimiento (Admin/Técnico)' : 'Reportar Falla / Mantenimiento'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Nav variant="pills" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="d-flex justify-content-center mb-4">
                        <Nav.Item>
                            <Nav.Link eventKey="general" className="fw-bold px-4">
                                <i className="bx bx-wrench me-1"></i> Mantenimiento General
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="toner" className="fw-bold px-4">
                                <i className="bx bx-droplet me-1"></i> Solicitud de Tóner
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Row className="mb-3">
                        <Col md={12}>
                            {fetchingInitial ? (
                                <div className="text-center p-2"><Spinner size="sm" /></div>
                            ) : (
                                <div className="p-2 px-3 bg-light rounded border border-primary border-opacity-25 mb-2 d-flex align-items-center">
                                    <i className={`bx ${activeTab === 'toner' ? 'bx-droplet text-primary' : 'bx-cog text-secondary'} fs-4 me-2`}></i>
                                    <div>
                                        <span className="fw-bold">
                                            {activeTab === 'toner' ? 'REPORTE DE TÓNER / CONSUMIBLE' : 'MANTENIMIENTO TÉCNICO GENERAL'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </Col>
                    </Row>

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
