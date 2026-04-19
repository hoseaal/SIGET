import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner, Badge, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import helpFetch from "../../../../utils/helpFetch";

export const TabPanelPared = () => {
    const [dataList, setDataList] = useState([]);
    const [pisos, setPisos] = useState([]);
    const [panelesSoport, setPanelesSoport] = useState([]);
    const [puertosPanel, setPuertosPanel] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState('crear');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    
    // Form state
    const [currentId, setCurrentId] = useState(null);
    const [pisoId, setPisoId] = useState('');
    const [selectedPanelSoport, setSelectedPanelSoport] = useState('');
    const [ppSoporteId, setPpSoporteId] = useState('');

    const fetchDataList = async () => {
        try {
            setLoading(true);
            const [panelesPared, pisosData, puertosPanelData, racksData] = await Promise.all([
                helpFetch.GET("/panel_pared"),
                helpFetch.GET("/piso"),
                helpFetch.GET("/puertos_panel_s"),
                helpFetch.GET("/panel_soport")
            ]);
            
            setDataList(panelesPared);
            setPisos(pisosData);
            setPuertosPanel(puertosPanelData);
            setPanelesSoport(racksData);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando los Paneles de Pared (Rosetas)");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataList();
    }, []);

    const handleShowCreate = () => {
        setPisoId('');
        setSelectedPanelSoport('');
        setPpSoporteId('');
        setModalAction('crear');
        setModalVisible(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item.id);
        setPisoId(item.piso || '');
        setPpSoporteId(item.pp_soporte_id || '');
        
        // Resolver el rack padre a partir del puerto seleccionado
        if (item.pp_soporte_id) {
            const puertoEncontrado = puertosPanel.find(p => String(p.id) === String(item.pp_soporte_id));
            if (puertoEncontrado) {
                setSelectedPanelSoport(puertoEncontrado.panel_soport_id);
            }
        } else {
            setSelectedPanelSoport('');
        }
        
        setModalAction('editar');
        setModalVisible(true);
    };

    const handleShowDelete = (item) => {
        setCurrentId(item.id);
        setDeleteModalVisible(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const isEdit = modalAction === 'editar';
            const method = isEdit ? 'PATCH' : 'POST';
            const url = isEdit ? `/panel_pared/${currentId}` : `/panel_pared`;

            await helpFetch[method](url, { 
                piso: pisoId, 
                pp_soporte_id: ppSoporteId 
            });
            
            toast.success(`Panel de pared ${isEdit ? 'actualizado' : 'registrado'} con éxito`);
            setModalVisible(false);
            fetchDataList();
        } catch (error) {
            console.error(error);
            toast.error(error.message || `Error guardando Panel de Pared`);
        }
    };

    const handleDelete = async () => {
        try {
            const success = await helpFetch.DELETE(`/panel_pared/${currentId}`);
            if (!success) throw new Error("No se pudo eliminar");
            toast.success(`Panel eliminado con éxito`);
            setDeleteModalVisible(false);
            fetchDataList();
        } catch (error) {
            toast.error(error.message || `Error al eliminar el panel`);
        }
    };

    return (
        <div className="pt-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h6 className="mb-0">Listado de Cajas / Paneles de Pared (Rosetas)</h6>
                <Button variant="primary" size="sm" onClick={handleShowCreate}>
                    <i className="bx bx-plus me-1"></i> Registrar Panel
                </Button>
            </div>
            <Table responsive hover size="sm">
                <thead>
                    <tr>
                        <th>ID Cód.</th>
                        <th>Piso Ubicación</th>
                        <th>Conectado a (Puerto Servidor)</th>
                        <th className="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="5" className="text-center py-4">
                                <Spinner animation="border" variant="primary" size="sm" />
                            </td>
                        </tr>
                    ) : dataList.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center py-4 text-muted">
                                No hay paneles de pared registrados
                            </td>
                        </tr>
                    ) : (
                        dataList.map((item) => (
                            <tr key={item.id}>
                                <td><strong>#{item.id}</strong></td>
                                <td>{item.nombre_piso || 'Desconocido'}</td>
                                <td>
                                    {item.puerto_servidor 
                                        ? `Puerto ${item.puerto_servidor} (Patch Panel)`
                                        : <span className="text-muted">Sin enlace</span>}
                                </td>
                                <td className="text-end">
                                    <div className="d-flex justify-content-end gap-2">
                                        <Button variant="warning" size="sm" onClick={() => handleShowEdit(item)}>
                                            <i className="bx bx-edit"></i>
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleShowDelete(item)}>
                                            <i className="bx bx-trash"></i>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Modal Crear/Editar */}
            <Modal show={modalVisible} onHide={() => setModalVisible(false)} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{modalAction === 'crear' ? `Crear Panel de Pared` : `Editar Panel`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Piso de Ubicación</Form.Label>
                            <Form.Select 
                                value={pisoId}
                                onChange={(e) => setPisoId(e.target.value)}
                                required
                            >
                                <option value="">Seleccione un piso...</option>
                                {pisos.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-primary">Conector de Enlace (Uplink)</Form.Label>
                            <Row className="g-2">
                                <Col md={6}>
                                    <Form.Select 
                                        value={selectedPanelSoport}
                                        onChange={(e) => {
                                            setSelectedPanelSoport(e.target.value);
                                            setPpSoporteId(''); // Reset puerto al cambiar rack
                                        }}
                                        required
                                    >
                                        <option value="">1. Seleccionar Rack...</option>
                                        {panelesSoport.map(ps => (
                                            <option key={ps.id} value={ps.id}>
                                                Rack: {ps.nro_bien}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={6}>
                                    <Form.Select 
                                        value={ppSoporteId}
                                        onChange={(e) => setPpSoporteId(e.target.value)}
                                        disabled={!selectedPanelSoport}
                                        required
                                    >
                                        <option value="">2. Seleccionar Puerto...</option>
                                        {puertosPanel
                                            .filter(p => String(p.panel_soport_id) === String(selectedPanelSoport))
                                            .map(pp => (
                                                <option key={pp.id} value={pp.id}>
                                                    Pto: {pp.nro_puerto}
                                                </option>
                                            ))}
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Form.Text className="text-muted">Especifique a qué puerto del site central está conectada esta roseta.</Form.Text>
                        </Form.Group>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setModalVisible(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            {modalAction === 'crear' ? 'Guardar' : 'Actualizar'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Eliminar */}
            <Modal show={deleteModalVisible} onHide={() => setDeleteModalVisible(false)} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que deseas destruir este Panel de Pared? 
                    Todos los puertos finales (usuarios) en esta pared quedarán huérfanos.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setDeleteModalVisible(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Sí, Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
