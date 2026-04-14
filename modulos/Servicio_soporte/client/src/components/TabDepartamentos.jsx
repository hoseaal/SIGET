import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

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
            const [deptRes, pisosRes] = await Promise.all([
                fetch("/api/departamento", { credentials: "include" }),
                fetch("/api/piso", { credentials: "include" })
            ]);
            
            if (!deptRes.ok) throw new Error(`Error al obtener departamentos`);
            if (!pisosRes.ok) throw new Error(`Error al obtener pisos`);
            
            const deptData = await deptRes.json();
            const pisosData = await pisosRes.json();
            
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
            const url = isEdit ? `/api/departamento/${currentId}` : `/api/departamento`;
            const method = isEdit ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, piso_id: pisoId }),
                credentials: 'include'
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.error || "Ocurrió un error al guardar");
            }
            
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
            const res = await fetch(`/api/departamento/${currentId}`, { 
                method: 'DELETE',
                credentials: 'include' 
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.error || "No se pudo eliminar");
            }
            toast.success(`Departamento eliminado con éxito`);
            setDeleteModalVisible(false);
            fetchDataList();
        } catch (error) {
            toast.error(error.message || `Error al eliminar Departamento`);
        }
    };

    return (
        <div className="pt-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
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
                                No hay departamentos registrados
                            </td>
                        </tr>
                    ) : (
                        dataList.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.nombre}</td>
                                <td>{item.nombre_piso || 'N/A'}</td>
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
