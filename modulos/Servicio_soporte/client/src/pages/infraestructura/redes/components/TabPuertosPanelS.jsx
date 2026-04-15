import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import helpFetch from "../../../../utils/helpFetch";

export const TabPuertosPanelS = () => {
    const [dataList, setDataList] = useState([]);
    const [paneles, setPaneles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState('crear');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    
    // Form state
    const [currentId, setCurrentId] = useState(null);
    const [nroPuerto, setNroPuerto] = useState('');
    const [pRouter, setPRouter] = useState('');
    const [panelSoportId, setPanelSoportId] = useState('');

    const fetchDataList = async () => {
        try {
            setLoading(true);
            const [puertosData, panelesData] = await Promise.all([
                helpFetch.GET("/puertos_panel_s"),
                helpFetch.GET("/panel_soport")
            ]);
            
            setDataList(puertosData);
            setPaneles(panelesData);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando los Puertos del Patch Panel");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataList();
    }, []);

    const handleShowCreate = () => {
        setNroPuerto('');
        setPRouter('');
        setPanelSoportId('');
        setModalAction('crear');
        setModalVisible(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item.id);
        setNroPuerto(item.nro_puerto || '');
        setPRouter(item.p_router || '');
        setPanelSoportId(item.panel_soport_id || '');
        setModalAction('editar');
        setModalVisible(true);
    };

    const handleShowDelete = (item) => {
        setCurrentId(item.id);
        setNroPuerto(item.nro_puerto);
        setDeleteModalVisible(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const isEdit = modalAction === 'editar';
            const method = isEdit ? 'PATCH' : 'POST';
            const url = isEdit ? `/puertos_panel_s/${currentId}` : `/puertos_panel_s`;

            await helpFetch[method](url, { 
                nro_puerto: nroPuerto, 
                p_router: pRouter, 
                panel_soport_id: panelSoportId 
            });
            
            toast.success(`Puerto ${isEdit ? 'actualizado' : 'registrado'} con éxito`);
            setModalVisible(false);
            fetchDataList();
        } catch (error) {
            console.error(error);
            toast.error(error.message || `Error guardando Puerto`);
        }
    };

    const handleDelete = async () => {
        try {
            const success = await helpFetch.DELETE(`/puertos_panel_s/${currentId}`);
            if (!success) throw new Error("No se pudo eliminar");
            toast.success(`Puerto eliminado con éxito`);
            setDeleteModalVisible(false);
            fetchDataList();
        } catch (error) {
            toast.error(error.message || `Error al eliminar el puerto`);
        }
    };

    return (
        <div className="pt-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Listado de Puertos en Patch Panel</h6>
                <Button variant="primary" size="sm" onClick={handleShowCreate}>
                    <i className="bx bx-plus me-1"></i> Asignar Puerto
                </Button>
            </div>
            <Table responsive hover size="sm">
                <thead>
                    <tr>
                        <th>Nº Int.</th>
                        <th>Nro. Puerto</th>
                        <th>Puerto Router asoc.</th>
                        <th>Patch Panel Pertenece</th>
                        <th className="text-end pe-5">Acciones</th>
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
                                No hay puertos de panel registrados
                            </td>
                        </tr>
                    ) : (
                        dataList.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td><strong>{item.nro_puerto}</strong></td>
                                <td><span className="badge bg-label-info">{item.p_router || 'N/A'}</span></td>
                                <td>
                                    {item.panel_nro_bien 
                                        ? `${item.panel_nro_bien} - ${item.panel_descripcion}` 
                                        : 'N/A'}
                                </td>
                                <td className="text-end pe-5">
                                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowEdit(item)}>
                                        <i className="bx bx-edit"></i>
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleShowDelete(item)}>
                                        <i className="bx bx-trash"></i>
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Modal Crear/Editar */}
            <Modal show={modalVisible} onHide={() => setModalVisible(false)} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{modalAction === 'crear' ? `Asignar Puerto a Panel` : `Editar Asignación`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Patch Panel (Soporte)</Form.Label>
                            <Form.Select 
                                value={panelSoportId}
                                onChange={(e) => setPanelSoportId(e.target.value)}
                                required
                            >
                                <option value="">Seleccione un Patch Panel...</option>
                                {paneles.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nro_bien} - {p.descripcion}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Nro. de Puerto Local</Form.Label>
                                    <Form.Control 
                                        type="number"
                                        min="1"
                                        placeholder="Ej. 24"
                                        value={nroPuerto}
                                        onChange={(e) => setNroPuerto(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Puerto en el Router (Uplink)</Form.Label>
                                    <Form.Control 
                                        type="text"
                                        placeholder="Ej. Gi1/0/24"
                                        value={pRouter}
                                        onChange={(e) => setPRouter(e.target.value)}
                                        required
                                    />
                                    <Form.Text className="text-muted">ID del puerto a donde se conecta en el switch físico.</Form.Text>
                                </Form.Group>
                            </div>
                        </div>
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
                    ¿Estás seguro de que deseas desconectar y eliminar el puerto <strong>{nroPuerto}</strong>? 
                    Esta acción podría dejar huérfanas rosetas de pared.
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
