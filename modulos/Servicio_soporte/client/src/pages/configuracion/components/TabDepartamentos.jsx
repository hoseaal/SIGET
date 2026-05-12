import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import helpFetch from "../../../utils/helpFetch";

export const TabDepartamentos = () => {
    const [dataList, setDataList] = useState([]);
    const [pisos, setPisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState('crear'); // 'crear' | 'editar'

    // Form state
    const [currentId, setCurrentId] = useState(null);
    const [nombre, setNombre] = useState('');
    const [pisoId, setPisoId] = useState('');

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const fetchDataList = async () => {
        try {
            setLoading(true);
            const [deptData, pisosData] = await Promise.all([
                helpFetch.GET("/departamento"),
                helpFetch.GET("/piso")
            ]);

            setDataList(deptData);
            setPisos(pisosData);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando departamentos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataList();
    }, []);

    const handleShowCreate = () => {
        setNombre('');
        setPisoId('');
        setModalAction('crear');
        setModalVisible(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item.id);
        setNombre(item.nombre);
        setPisoId(item.piso_id || ''); // Asegurar default
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
            const url = isEdit ? `/departamento/${currentId}` : `/departamento`;
            const method = isEdit ? 'PATCH' : 'POST';

            await helpFetch[method](url, { nombre, piso_id: pisoId });

            toast.success(`Departamento ${isEdit ? 'actualizado' : 'creado'} con éxito`);
            setModalVisible(false);
            fetchDataList();
        } catch (error) {
            console.error(error);
            toast.error(error.message || `Error guardando Departamento`);
        }
    };

    const handleDelete = async () => {
        try {
            const success = await helpFetch.DELETE(`/departamento/${currentId}`);
            if (!success) throw new Error("No se pudo eliminar");
            toast.success(`Departamento eliminado con éxito`);
            setDeleteModalVisible(false);
            fetchDataList();
        } catch (error) {
            toast.error(error.message || `Error al eliminar Departamento`);
        }
    };

    return (
        <div className="pt-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h6 className="mb-0">Listado de Departamentos</h6>
                <Button variant="primary" size="sm" onClick={handleShowCreate}>
                    <i className="bx bx-plus me-1"></i> Añadir Departamento
                </Button>
            </div>
            <Table responsive hover size="sm">
                <thead>
                    <tr>
                        <th>Nº</th>
                        <th>Nombre</th>
                        <th>Piso Asignado</th>
                        <th className="text-end">Acciones</th>
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
                                <div className="mb-2"><i className="bx bx-info-circle fs-1"></i></div>
                                No hay departamentos registrados
                            </td>
                        </tr>
                    ) : (
                        dataList.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.nombre}</td>
                                <td>{item.nombre_piso || 'N/A'}</td>
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
                    <Modal.Title>{modalAction === 'crear' ? `Añadir Departamento` : `Editar Departamento`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre del Departamento</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej. Recursos Humanos"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                autoFocus
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Piso al que pertenece</Form.Label>
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
                    ¿Estás seguro de que deseas eliminar este departamento <strong>"{nombre}"</strong>? Esta acción no se puede deshacer.
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
