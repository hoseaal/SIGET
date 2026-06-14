import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import helpFetch from "../../../utils/helpFetch";
import { ConfirmModal } from "../../../components/ConfirmModal";

const schema = z.object({
    nombre: z.string().min(1, "Ingrese el nombre del modelo").max(100, "Máximo 100 caracteres"),
    marcaId: z.string().min(1, "Seleccione una marca")
});

export const TabModelos = () => {
    const [dataList, setDataList] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState('crear');
    const [currentId, setCurrentId] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteItemLabel, setDeleteItemLabel] = useState('');

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { nombre: "", marcaId: "" }
    });

    const fetchDataList = async () => {
        try {
            setLoading(true);
            const [modData, marcaData] = await Promise.all([
                helpFetch.GET("/modelo"),
                helpFetch.GET("/marca")
            ]);

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
        reset({ nombre: "", marcaId: "" });
        setModalAction('crear');
        setModalVisible(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item.id);
        reset({ nombre: item.nombre, marcaId: String(item.marca_id || "") });
        setModalAction('editar');
        setModalVisible(true);
    };

    const handleShowDelete = (item) => {
        setCurrentId(item.id);
        setDeleteItemLabel(item.nombre);
        setDeleteModalVisible(true);
    };

    const onSubmit = async (data) => {
        try {
            const isEdit = modalAction === 'editar';
            const url = isEdit ? `/modelo/${currentId}` : `/modelo`;
            const method = isEdit ? 'PATCH' : 'POST';

            await helpFetch[method](url, { nombre: data.nombre, marca_id: data.marcaId });

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
            const success = await helpFetch.DELETE(`/modelo/${currentId}`);
            if (!success) throw new Error("No se pudo eliminar");
            toast.success(`Modelo eliminado con éxito`);
            setDeleteModalVisible(false);
            fetchDataList();
        } catch (error) {
            toast.error(error.message || `Error al eliminar Modelo`);
        }
    };

    return (
        <div className="pt-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
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
                                No hay modelos registrados
                            </td>
                        </tr>
                    ) : (
                        dataList.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.nombre}</td>
                                <td>{item.marca_nombre || 'N/A'}</td>
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
                    <Modal.Title>{modalAction === 'crear' ? `Añadir Modelo` : `Editar Modelo`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre del Modelo</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej. OptiPlex 3050"
                                {...register("nombre")}
                                isInvalid={!!errors.nombre}
                                autoFocus
                            />
                            <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Marca a la que pertenece</Form.Label>
                            <Form.Select
                                {...register("marcaId")}
                                isInvalid={!!errors.marcaId}
                            >
                                <option value="">Seleccione una marca...</option>
                                {marcas.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.marcaId?.message}</Form.Control.Feedback>
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
                message={`¿Estás seguro de que deseas eliminar el modelo "${deleteItemLabel}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                variant="danger"
            />
        </div>
    );
};
