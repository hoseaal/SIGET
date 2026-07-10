import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import helpFetch from "../../../utils/helpFetch";
import { ConfirmModal } from "../../../components/ConfirmModal";

const schema = z.object({
    nombre: z.string().min(1, "Ingrese el nombre del tóner").max(100, "Máximo 100 caracteres"),
    marcaId: z.string().optional(),
    modeloId: z.string().optional(),
    descripcion: z.string().max(255, "Máximo 255 caracteres").optional()
});

export const TabTipoToner = () => {
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState('crear');
    const [currentId, setCurrentId] = useState(null);
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteItemLabel, setDeleteItemLabel] = useState('');

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { nombre: "", marcaId: "", modeloId: "", descripcion: "" }
    });

    const marcaId = watch("marcaId");

    const fetchDataList = async () => {
        try {
            setLoading(true);
            const data = await helpFetch.GET("/tipo_toner");
            setDataList(data);
        } catch (error) {
            console.error(error);
            toast.error(`Error cargando Tipos de Tóner`);
        } finally {
            setLoading(false);
        }
    };

    const fetchMaestros = async () => {
        try {
            const [brands, modules] = await Promise.all([
                helpFetch.GET("/marca"),
                helpFetch.GET("/modelo")
            ]);
            setMarcas(brands);
            setModelos(modules);
        } catch (error) {
            console.error("Error cargando maestros:", error);
        }
    };

    useEffect(() => {
        fetchDataList();
        fetchMaestros();
    }, []);

    const handleShowCreate = () => {
        reset({ nombre: "", descripcion: "", marcaId: "", modeloId: "" });
        setModalAction('crear');
        setModalVisible(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item.id);
        reset({
            nombre: item.nombre,
            descripcion: item.descripcion || "",
            marcaId: String(item.marca_id || ""),
            modeloId: String(item.modelo_id || "")
        });
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
            const url = isEdit ? `/tipo_toner/${currentId}` : `/tipo_toner`;

            await helpFetch[method](url, {
                nombre: data.nombre,
                descripcion: data.descripcion,
                marca_id: data.marcaId || null,
                modelo_id: data.modeloId || null
            });

            toast.success(`Tipo de Tóner ${isEdit ? 'actualizado' : 'creado'} con éxito`);
            setModalVisible(false);
            fetchDataList();
        } catch (error) {
            console.error(error);
            toast.error(error.message || `Error guardando Tipo de Tóner`);
        }
    };

    const handleDelete = async () => {
        try {
            const success = await helpFetch.DELETE(`/tipo_toner/${currentId}`);
            if (!success) throw new Error("No se pudo eliminar");
            toast.success(`Tipo de Tóner eliminado con éxito`);
            setDeleteModalVisible(false);
            fetchDataList();
        } catch (error) {
            toast.error(error.message || `Error al eliminar Tipo de Tóner`);
        }
    };

    return (
        <div className="pt-2">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h6 className="mb-0">Listado de Tipos de Tóner</h6>
                <Button variant="primary" size="sm" onClick={handleShowCreate}>
                    <i className="bx bx-plus me-1"></i> Añadir Tipo de Tóner
                </Button>
            </div>
            <Table responsive hover size="sm">
                <thead>
                    <tr>
                        <th>Nº</th>
                        <th>Nombre / Modelo</th>
                        <th>Marca</th>
                        <th>Modelo Eq.</th>
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
                                <div className="mb-2"><i className="bx bx-info-circle fs-1"></i></div>
                                No hay tipos de tóner registrados
                            </td>
                        </tr>
                    ) : (
                        dataList.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td><strong>{item.nombre}</strong></td>
                                <td>{item.marca_nombre || <span className="text-muted">-</span>}</td>
                                <td>{item.modelo_nombre || <span className="text-muted">-</span>}</td>
                                <td>{item.descripcion || <span className="text-muted">Sin descripción</span>}</td>
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
                    <Modal.Title>{modalAction === 'crear' ? `Añadir Tipo de Tóner` : `Editar Tipo de Tóner`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre / Modelo del Tóner</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej. HP 85A (CE285A)"
                                {...register("nombre")}
                                isInvalid={!!errors.nombre}
                                autoFocus
                            />
                            <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Label>Marca Asociada</Form.Label>
                                <Form.Select
                                    {...register("marcaId")}
                                    isInvalid={!!errors.marcaId}
                                    onChange={(e) => {
                                        setValue("marcaId", e.target.value);
                                        setValue("modeloId", "");
                                    }}
                                >
                                    <option value="">Seleccione marca...</option>
                                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.marcaId?.message}</Form.Control.Feedback>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label>Modelo Asociado</Form.Label>
                                <Form.Select
                                    {...register("modeloId")}
                                    isInvalid={!!errors.modeloId}
                                    disabled={!marcaId}
                                >
                                    <option value="">Seleccione modelo...</option>
                                    {modelos
                                        .filter(m => String(m.marca_id) === String(marcaId))
                                        .map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)
                                    }
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.modeloId?.message}</Form.Control.Feedback>
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Descripción adicional</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Ej. Compatible con impresoras LaserJet Pro M1132/M1212"
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
                message={`¿Estás seguro de que deseas eliminar el tipo de tóner "${deleteItemLabel}"? Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                variant="danger"
            />
        </div>
    );
};
