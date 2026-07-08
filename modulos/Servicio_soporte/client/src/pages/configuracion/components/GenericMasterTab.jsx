import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import helpFetch from "../../../utils/helpFetch";
import { ConfirmModal } from "../../../components/ConfirmModal";

const schema = z.object({
    nombre: z.string().min(1, "Ingrese un nombre").max(100, "Máximo 100 caracteres")
});

export const GenericMasterTab = ({ endpoint, titleItem }) => {
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState('crear');
    const [currentId, setCurrentId] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteItemLabel, setDeleteItemLabel] = useState('');

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { nombre: "" }
    });

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
        reset({ nombre: "" });
        setModalAction('crear');
        setModalVisible(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item.id);
        reset({ nombre: item.nombre });
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
            const method = isEdit ? 'PATCH' : 'POST';
            const url = isEdit ? `${endpoint}/${currentId}` : endpoint;

            await helpFetch[method](url, { nombre: data.nombre });

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
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
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
                        <th className="text-end" style={{ width: '120px' }}>ACCIONES</th>
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
                                <div className="mb-2"><i className="bx bx-info-circle fs-1"></i></div>
                                No hay opciones registradas
                            </td>
                        </tr>
                    ) : (
                        dataList.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.nombre}</td>
                                <td className="text-end">
                                    <div className="d-flex justify-content-end">
                                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowEdit(item)}>
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
                    <Modal.Title>{modalAction === 'crear' ? `Añadir ${titleItem}` : `Editar ${titleItem}`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={`Ej. Ingrese ${titleItem.toLowerCase()}`}
                                {...register("nombre")}
                                isInvalid={!!errors.nombre}
                                autoFocus
                            />
                            <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
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
                message={`¿Estás seguro de que deseas eliminar este registro "${deleteItemLabel}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                variant="danger"
            />
        </div>
    );
};
