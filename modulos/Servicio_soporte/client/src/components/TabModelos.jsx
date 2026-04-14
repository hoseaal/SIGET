import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

export const TabModelos = () => {
    const [dataList, setDataList] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState('crear'); // 'crear' | 'editar'
    
    // Form state
    const [currentId, setCurrentId] = useState(null);
    const [nombre, setNombre] = useState('');
    const [marcaId, setMarcaId] = useState('');

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    
    const fetchDataList = async () => {
        try {
            setLoading(true);
            const [modelosRes, marcasRes] = await Promise.all([
                fetch("/api/modelo", { credentials: "include" }),
                fetch("/api/marca", { credentials: "include" })
            ]);
            
            if (!modelosRes.ok) throw new Error(`Error al obtener modelos`);
            if (!marcasRes.ok) throw new Error(`Error al obtener marcas`);
            
            const modData = await modelosRes.json();
            const marcaData = await marcasRes.json();
            
            setDataList(modData);
            setMarcas(marcaData);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando modelos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataList();
    }, []);

    const handleShowCreate = () => {
        setNombre('');
        setMarcaId('');
        setModalAction('crear');
        setModalVisible(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item.id);
        setNombre(item.nombre);
        setMarcaId(item.marca_id || ''); // Asegurar default
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
            const url = isEdit ? `/api/modelo/${currentId}` : `/api/modelo`;
            const method = isEdit ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, marca_id: marcaId }),
                credentials: 'include'
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.error || "Ocurrió un error al guardar");
            }
            
            toast.success(`Modelo ${isEdit ? 'actualizado' : 'creado'} con éxito`);
            setModalVisible(false);
            fetchDataList();
        } catch (error) {
            console.error(error);
            toast.error(error.message || `Error guardando Modelo`);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/modelo/${currentId}`, { 
                method: 'DELETE',
                credentials: 'include' 
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.error || "No se pudo eliminar");
            }
            toast.success(`Modelo eliminado con éxito`);
            setDeleteModalVisible(false);
            fetchDataList();
        } catch (error) {
            toast.error(error.message || `Error al eliminar Modelo`);
        }
    };

    return (
        <div className="pt-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Listado de Modelos</h6>
                <Button variant="primary" size="sm" onClick={handleShowCreate}>
                    <i className="bx bx-plus me-1"></i> Añadir Modelo
                </Button>
            </div>
            <Table responsive hover size="sm">
                <thead>
                    <tr>
                        <th>Nº</th>
                        <th>Nombre</th>
                        <th>Marca Asociada</th>
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
                                No hay modelos registrados
                            </td>
                        </tr>
                    ) : (
                        dataList.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.nombre}</td>
                                <td>{item.marca_nombre || 'N/A'}</td>
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
                    <Modal.Title>{modalAction === 'crear' ? `Añadir Modelo` : `Editar Modelo`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre del Modelo</Form.Label>
                            <Form.Control 
                                type="text"
                                placeholder="Ej. OptiPlex 3050"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                autoFocus
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Marca a la que pertenece</Form.Label>
                            <Form.Select 
                                value={marcaId}
                                onChange={(e) => setMarcaId(e.target.value)}
                                required
                            >
                                <option value="">Seleccione una marca...</option>
                                {marcas.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.nombre}
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
                    ¿Estás seguro de que deseas eliminar el modelo <strong>"{nombre}"</strong>? Esta acción no se puede deshacer.
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
