import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import helpFetch from "../../../../utils/helpFetch";

export const TabPanelSoport = () => {
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState('crear');
    
    // Form state
    const [currentId, setCurrentId] = useState(null);
    const [nroBien, setNroBien] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    
    const fetchDataList = async () => {
        try {
            setLoading(true);
            const data = await helpFetch.GET("/panel_soport");
            setDataList(data);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando los Patch Panels");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataList();
    }, []);

    const handleShowCreate = () => {
        setNroBien('');
        setDescripcion('');
        setModalAction('crear');
        setModalVisible(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item.id);
        setNroBien(item.nro_bien || '');
        setDescripcion(item.descripcion || '');
        setModalAction('editar');
        setModalVisible(true);
    };

    const handleShowDelete = (item) => {
        setCurrentId(item.id);
        setNroBien(item.nro_bien);
        setDeleteModalVisible(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const isEdit = modalAction === 'editar';
            const method = isEdit ? 'PATCH' : 'POST';
            const url = isEdit ? `/panel_soport/${currentId}` : `/panel_soport`;

            await helpFetch[method](url, { nro_bien: nroBien, descripcion });
            
            toast.success(`Panel de Soporte ${isEdit ? 'actualizado' : 'creado'} con éxito`);
            setModalVisible(false);
            fetchDataList();
        } catch (error) {
            console.error(error);
            toast.error(error.message || `Error guardando Panel de Soporte`);
        }
    };

    const handleDelete = async () => {
        try {
            const success = await helpFetch.DELETE(`/panel_soport/${currentId}`);
            if (!success) throw new Error("No se pudo eliminar");
            toast.success(`Panel de Soporte eliminado con éxito`);
            setDeleteModalVisible(false);
            fetchDataList();
        } catch (error) {
            toast.error(error.message || `Error al eliminar Panel`);
        }
    };

    return (
        <div className="pt-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Listado de Patch Panels (Paneles de Soporte)</h6>
                <Button variant="primary" size="sm" onClick={handleShowCreate}>
                    <i className="bx bx-plus me-1"></i> Registrar Panel
                </Button>
            </div>
            <Table responsive hover size="sm">
                <thead>
                    <tr>
                        <th>Nº</th>
                        <th>Nro. de Bien</th>
                        <th>Descripción</th>
                        <th className="text-end pe-5">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="4" className="text-center py-4">
                                <Spinner animation="border" variant="primary" size="sm" />
                            </td>
                        </tr>
                    ) : dataList.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center py-4 text-muted">
                                No hay patch panels registrados
                            </td>
                        </tr>
                    ) : (
                        dataList.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td><span className="badge bg-label-primary">{item.nro_bien}</span></td>
                                <td>{item.descripcion}</td>
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
                    <Modal.Title>{modalAction === 'crear' ? `Añadir Panel de Soporte` : `Editar Panel`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nro. de Bien (BN)</Form.Label>
                            <Form.Control 
                                type="text"
                                placeholder="Ej. BN-12345"
                                value={nroBien}
                                onChange={(e) => setNroBien(e.target.value)}
                                required
                                autoFocus
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción del Panel</Form.Label>
                            <Form.Control 
                                as="textarea"
                                rows={2}
                                placeholder="Ej. Patch para el ala oeste del piso 2"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                            />
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
                    ¿Estás seguro de que deseas eliminar el panel con bien <strong>"{nroBien}"</strong>? 
                    <br/><br/>
                    <small className="text-danger">Asegúrese de que no tenga puertos amarrados a él, o la eliminación fallará.</small>
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
