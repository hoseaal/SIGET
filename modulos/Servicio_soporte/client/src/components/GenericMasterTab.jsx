import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import helpFetch from "../utils/helpFetch";

export const GenericMasterTab = ({ endpoint, titleItem }) => {
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState('crear'); // 'crear' | 'editar'

    const [currentId, setCurrentId] = useState(null);
    const [nombre, setNombre] = useState('');

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const fetchDataList = async () => {
        try {
            setLoading(true);
            const data = await helpFetch.GET(endpoint);
            setDataList(data);
        } catch (error) {
            console.error(error);
            toast.error(`Error cargando ${titleItem}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataList();
    }, [endpoint]);

    const handleShowCreate = () => {
        setNombre('');
        setModalAction('crear');
        setModalVisible(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item.id);
        setNombre(item.nombre);
        setModalAction('editar');
        setModalVisible(true);
    };

    const handleShowDelete = (item) => {
        setCurrentId(item.id);
        setNombre(item.nombre);
        setDeleteModalVisible(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const isEdit = modalAction === 'editar';
            const method = isEdit ? 'PATCH' : 'POST';
            const url = isEdit ? `${endpoint}/${currentId}` : endpoint;

            await helpFetch[method](url, { nombre });
            
            toast.success(`${titleItem} ${isEdit ? 'actualizado' : 'creado'} con éxito`);
            setModalVisible(false);
            fetchDataList();
        } catch (error) {
            console.error(error);
            toast.error(error.message || `Error guardando ${titleItem}`);
        }
    };

    const handleDelete = async () => {
        try {
            const success = await helpFetch.DELETE(`${endpoint}/${currentId}`);
            if (!success) throw new Error("No se pudo eliminar");
            toast.success(`${titleItem} eliminado con éxito`);
            setDeleteModalVisible(false);
            fetchDataList();
        } catch (error) {
            toast.error(error.message || `Error al eliminar ${titleItem}`);
        }
    };

    return (
        <div className="pt-2">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Listado de {titleItem}</h6>
                <Button variant="primary" size="sm" onClick={handleShowCreate}>
                    <i className="bx bx-plus me-1"></i> Añadir {titleItem}
                </Button>
            </div>
            <Table responsive hover size="sm">
                <thead>
                    <tr>
                        <th>Nº</th>
                        <th>Nombre / Descripción</th>
                        <th className="text-end pe-5">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="3" className="text-center py-4">
                                <Spinner animation="border" variant="primary" size="sm" />
                            </td>
                        </tr>
                    ) : dataList.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="text-center py-4 text-muted">
                                No hay opciones registradas
                            </td>
                        </tr>
                    ) : (
                        dataList.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.nombre}</td>
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
                    <Modal.Title>{modalAction === 'crear' ? `Añadir ${titleItem}` : `Editar ${titleItem}`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={`Ej. Ingrese ${titleItem.toLowerCase()}`}
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                autoFocus
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
                    ¿Estás seguro de que deseas eliminar este registro <strong>"{nombre}"</strong>? Esta acción no se puede deshacer.
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
