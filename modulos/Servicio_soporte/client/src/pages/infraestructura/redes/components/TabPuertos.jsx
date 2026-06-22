import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import helpFetch from "../../../../utils/helpFetch";
import { ConfirmModal } from "../../../../components/ConfirmModal";

const schema = z.object({
    nroPuerto: z.string().min(1, "Ingrese el número de puerto").max(20, "Máximo 20 caracteres"),
    panelId: z.string().min(1, "Seleccione un panel de pared")
});

export const TabPuertos = () => {
    const [dataList, setDataList] = useState([]);
    const [panelesPared, setPanelesPared] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState('crear');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [deleteItemLabel, setDeleteItemLabel] = useState('');

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { nroPuerto: "", panelId: "" }
    });

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

    useEffect(() => {
        const handler = () => fetchDataList();
        window.addEventListener("dataChange", handler);
        return () => window.removeEventListener("dataChange", handler);
    }, []);

    const handleShowCreate = () => {
        reset({ nroPuerto: "", panelId: "" });
        setModalAction('crear');
        setModalVisible(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item.id);
        reset({
            nroPuerto: item.nro_puerto || "",
            panelId: String(item.panel_id || "")
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
            const url = isEdit ? `/puertos/${currentId}` : `/puertos`;

            await helpFetch[method](url, {
                nro_puerto: data.nroPuerto,
                panel_id: data.panelId
            });

            toast.success(`Puerto ${isEdit ? 'actualizado' : 'registrado'} con éxito`);
            setModalVisible(false);
            fetchDataList();
            window.dispatchEvent(new Event("dataChange"));
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
            window.dispatchEvent(new Event("dataChange"));
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
                        <th>Equipo Asignado</th>
                        <th className="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="6" className="text-center py-4">
                                <Spinner animation="border" variant="primary" size="sm" />
                            </td>
                        </tr>
                    ) : dataList.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center py-4 text-muted">
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
                                <td>
                                    {item.equipo_asignado ? (
                                        <span className="text-danger fw-semibold">
                                            {item.equipo_asignado} {item.tipo_equipo_nombre ? `(${item.tipo_equipo_nombre})` : ''}
                                        </span>
                                    ) : (
                                        <span className="text-success">Disponible</span>
                                    )}
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
                    <Modal.Title>{modalAction === 'crear' ? `Añadir Puerto` : `Editar Puerto`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nro. del Puerto (Etiqueta de la pared)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej. A-12"
                                {...register("nroPuerto")}
                                isInvalid={!!errors.nroPuerto}
                                autoFocus
                            />
                            <Form.Control.Feedback type="invalid">{errors.nroPuerto?.message}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Seleccionar Caja/Roseta (Rack de Pared)</Form.Label>
                            <Form.Select
                                {...register("panelId")}
                                isInvalid={!!errors.panelId}
                            >
                                <option value="">Seleccione a dónde pertenece...</option>
                                {panelesPared.map(pp => (
                                    <option key={pp.id} value={pp.id}>
                                        Roseta #{pp.id} en {pp.nombre_piso} {pp.es_panel_principal ? '(Principal)' : ''}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.panelId?.message}</Form.Control.Feedback>
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
                message={`¿Estás seguro de que deseas eliminar la etiqueta de puerto "${deleteItemLabel}"?`}
                confirmText="Sí, Eliminar"
                variant="danger"
            />
        </div>
    );
};
