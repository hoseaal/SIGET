import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import helpFetch from "../../../../utils/helpFetch";

const schema = z.object({
    panelSoportId: z.string().min(1, "Seleccione un panel"),
    nroPuerto: z.string().min(1, "Ingrese el número de puerto"),
    pRouter: z.string().min(1, "Ingrese el puerto del router")
});

export const TabPuertosPanelS = () => {
    const [dataList, setDataList] = useState([]);
    const [paneles, setPaneles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState('crear');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [deleteItemLabel, setDeleteItemLabel] = useState('');

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { panelSoportId: "", nroPuerto: "", pRouter: "" }
    });

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
        reset({ panelSoportId: "", nroPuerto: "", pRouter: "" });
        setModalAction('crear');
        setModalVisible(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item.id);
        reset({
            panelSoportId: String(item.panel_soport_id || ""),
            nroPuerto: String(item.nro_puerto || ""),
            pRouter: String(item.p_router || "")
        });
        setModalAction('editar');
        setModalVisible(true);
    };

    const handleShowDelete = (item) => {
        setCurrentId(item.id);
        setDeleteItemLabel(item.nro_puerto);
        setDeleteModalVisible(true);
    };

    const onSubmit = async (data) => {
        try {
            const isEdit = modalAction === 'editar';
            const method = isEdit ? 'PATCH' : 'POST';
            const url = isEdit ? `/puertos_panel_s/${currentId}` : `/puertos_panel_s`;

            await helpFetch[method](url, {
                nro_puerto: parseInt(data.nroPuerto, 10),
                p_router: parseInt(data.pRouter, 10),
                panel_soport_id: parseInt(data.panelSoportId, 10)
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
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
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

            <Modal show={modalVisible} onHide={() => setModalVisible(false)} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{modalAction === 'crear' ? `Asignar Puerto a Panel` : `Editar Asignación`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Patch Panel (Soporte)</Form.Label>
                            <Form.Select
                                {...register("panelSoportId")}
                                isInvalid={!!errors.panelSoportId}
                            >
                                <option value="">Seleccione un Patch Panel...</option>
                                {paneles.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nro_bien} - {p.descripcion}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.panelSoportId?.message}</Form.Control.Feedback>
                        </Form.Group>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Nro. de Puerto Local</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        placeholder="Ej. 24"
                                        {...register("nroPuerto")}
                                        isInvalid={!!errors.nroPuerto}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.nroPuerto?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Puerto en el Router (Uplink)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ej. Gi1/0/24"
                                        {...register("pRouter")}
                                        isInvalid={!!errors.pRouter}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.pRouter?.message}</Form.Control.Feedback>
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

            <Modal show={deleteModalVisible} onHide={() => setDeleteModalVisible(false)} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que deseas desconectar y eliminar el puerto <strong>{deleteItemLabel}</strong>?
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
