import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import helpFetch from "../../../../utils/helpFetch";

export const TabPuertos = () => {
    const [dataList, setDataList] = useState([]);
    const [panelesPared, setPanelesPared] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState('crear');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    
    // Form state
    const [currentId, setCurrentId] = useState(null);
    const [nroPuerto, setNroPuerto] = useState('');
    const [panelId, setPanelId] = useState('');

    const fetchDataList = async () => {
        try {
            setLoading(true);
            const [puertosData, panelesData] = await Promise.all([
                helpFetch.GET("/puertos"),
                helpFetch.GET("/panel_pared")
            ]);
            
            setDataList(puertosData);
            setPanelesPared(panelesData);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando Puertos de Usuario");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataList();
    }, []);

    const handleShowCreate = () => {
        setNroPuerto('');
        setPanelId('');
        setModalAction('crear');
        setModalVisible(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item.id);
        setNroPuerto(item.nro_puerto || '');
        setPanelId(item.panel_id || '');
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
            const url = isEdit ? `/puertos/${currentId}` : `/puertos`;

            await helpFetch[method](url, { 
                nro_puerto: nroPuerto, 
                panel_id: panelId 
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
            const success = await helpFetch.DELETE(`/puertos/${currentId}`);
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
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h6 className="mb-0">Listado de Puertos Finales (Usuarios)</h6>
                <Button variant="primary" size="sm" onClick={handleShowCreate}>
                    <i className="bx bx-plus me-1"></i> Añadir Puerto
                </Button>
            </div>
            <Table responsive hover size="sm">
                <thead>
                    <tr>
                        <th>ID Interno</th>
                        <th>Nro. Etiqueta / Puerto</th>
                        <th>Caja / Roseta a la que pertenece</th>
                        <th>Piso Ubicación</th>
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
                                No hay puertos finales registrados
                            </td>
                        </tr>
                    ) : (
                        dataList.map((item) => (
                            <tr key={item.id}>
                                <td>#{item.id}</td>
                                <td><strong>{item.nro_puerto}</strong></td>
                                <td>Panel #{item.panel_id} {item.es_panel_principal ? '(Principal)' : ''}</td>
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
                    <Modal.Title>{modalAction === 'crear' ? `Añadir Puerto` : `Editar Puerto`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nro. del Puerto (Etiqueta de la pared)</Form.Label>
                            <Form.Control 
                                type="text"
                                placeholder="Ej. A-12"
                                value={nroPuerto}
                                onChange={(e) => setNroPuerto(e.target.value)}
                                required
                                autoFocus
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Seleccionar Caja/Roseta (Panel de Pared)</Form.Label>
                            <Form.Select 
                                value={panelId}
                                onChange={(e) => setPanelId(e.target.value)}
                                required
                            >
                                <option value="">Seleccione a dónde pertenece...</option>
                                {panelesPared.map(pp => (
                                    <option key={pp.id} value={pp.id}>
                                        Roseta #{pp.id} en {pp.nombre_piso} {pp.es_panel_principal ? '(Principal)' : ''}
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
                    ¿Estás seguro de que deseas eliminar la etiqueta de puerto <strong>"{nroPuerto}"</strong>?
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
