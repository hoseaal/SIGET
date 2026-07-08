import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import helpFetch from "../../../../utils/helpFetch";
import { ConfirmModal } from "../../../../components/ConfirmModal";

const schema = z.object({
    nroBien: z.string().min(1, "Ingrese el número de bien").max(50, "Máximo 50 caracteres"),
    descripcion: z.string().min(1, "Ingrese una descripción").max(255, "Máximo 255 caracteres")
});

export const TabPanelSoport = () => {
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState('crear');
    const [currentId, setCurrentId] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteItemLabel, setDeleteItemLabel] = useState('');

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { nroBien: "", descripcion: "" }
    });

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

    useEffect(() => {
        const handler = () => fetchDataList();
        window.addEventListener("dataChange", handler);
        return () => window.removeEventListener("dataChange", handler);
    }, []);

    const handleShowCreate = () => {
        reset({ nroBien: "", descripcion: "" });
        setModalAction('crear');
        setModalVisible(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item.id);
        reset({ nroBien: item.nro_bien || "", descripcion: item.descripcion || "" });
        setModalAction('editar');
        setModalVisible(true);
    };

    const handleShowDelete = (item) => {
        setCurrentId(item.id);
        setDeleteItemLabel(item.nro_bien);
        setDeleteModalVisible(true);
    };

    const onSubmit = async (data) => {
        try {
            const isEdit = modalAction === 'editar';
            const method = isEdit ? 'PATCH' : 'POST';
            const url = isEdit ? `/panel_soport/${currentId}` : `/panel_soport`;

            await helpFetch[method](url, { nro_bien: data.nroBien, descripcion: data.descripcion });

            toast.success(`Rack de Soporte ${isEdit ? 'actualizado' : 'creado'} con éxito`);
            setModalVisible(false);
            fetchDataList();
            window.dispatchEvent(new Event("dataChange"));
        } catch (error) {
            console.error(error);
            toast.error(error.message || `Error guardando Rack de Soporte`);
        }
    };

    const handleDelete = async () => {
        try {
            const success = await helpFetch.DELETE(`/panel_soport/${currentId}`);
            if (!success) throw new Error("No se pudo eliminar");
            toast.success(`Rack de Soporte eliminado con éxito`);
            setDeleteModalVisible(false);
            fetchDataList();
            window.dispatchEvent(new Event("dataChange"));
        } catch (error) {
            toast.error(error.message || `Error al eliminar Panel`);
        }
    };

    return (
        <div className="pt-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h6 className="mb-0">Listado de Patch Panels (Rack de Soporte)</h6>
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
                                No hay patch panels registrados
                            </td>
                        </tr>
                    ) : (
                        dataList.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td><span className="badge bg-label-primary">{item.nro_bien}</span></td>
                                <td>{item.descripcion}</td>
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
                    <Modal.Title>{modalAction === 'crear' ? `Añadir Rack de Soporte` : `Editar Rack de Soporte`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nro. de Bien (BN)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej. BN-12345"
                                {...register("nroBien")}
                                isInvalid={!!errors.nroBien}
                                autoFocus
                            />
                            <Form.Control.Feedback type="invalid">{errors.nroBien?.message}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción del Panel</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Ej. Patch para el ala oeste del piso 2"
                                {...register("descripcion")}
                                isInvalid={!!errors.descripcion}
                            />
                            <Form.Control.Feedback type="invalid">{errors.descripcion?.message}</Form.Control.Feedback>
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

            <ConfirmModal
                show={deleteModalVisible}
                onHide={() => setDeleteModalVisible(false)}
                onConfirm={handleDelete}
                title="Confirmar Eliminación"
                message={<span>¿Estás seguro de que deseas eliminar el panel con bien <strong>"{deleteItemLabel}"</strong>?<br/><br/><small className="text-danger">Asegúrese de que no tenga puertos amarrados a él, o la eliminación fallará.</small></span>}
                confirmText="Sí, Eliminar"
                variant="danger"
            />
        </div>
    );
};
