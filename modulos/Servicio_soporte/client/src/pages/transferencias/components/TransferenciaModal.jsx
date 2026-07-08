import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import helpFetch from '../../../utils/helpFetch';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const transferenciaSchema = z.object({
    origen_id: z.string().min(1, "Seleccione origen"),
    equipo_id: z.string().min(1, "Seleccione equipo"),
    destino_id: z.string().min(1, "Seleccione destino"),
    asunto: z.string().min(1, "Ingrese el asunto").max(200),
    observaciones: z.string().max(500).optional(),
});

/**
 * Modal para registrar una nueva transferencia de equipo.
 */
export const TransferenciaModal = ({ show, onHide, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);

    // Maestros
    const [equipos, setEquipos] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [user, setUser] = useState(null);

    const isAdmin = user?.rol_id === 1;

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
        resolver: zodResolver(transferenciaSchema),
        defaultValues: {
            origen_id: '',
            equipo_id: '',
            destino_id: '',
            asunto: '',
            observaciones: ''
        }
    });

    const watchedOrigenId = watch('origen_id');

    useEffect(() => {
        if (show) {
            fetchInitialData();
        } else {
            reset({
                origen_id: '',
                equipo_id: '',
                destino_id: '14',
                asunto: '',
                observaciones: ''
            });
        }
    }, [show]);

    useEffect(() => {
        setValue('equipo_id', '');
    }, [watchedOrigenId]);

    const fetchInitialData = async () => {
        try {
            setInitialLoading(true);

            // 1. Verificar usuario
            const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
            const userData = await userRes.json();

            if (!userData.success) {
                toast.error("Sesión expirada");
                onHide();
                return;
            }
            setUser(userData.user);

            // 2. Cargar Departamentos y Equipos
            const [deps, allEquipos] = await Promise.all([
                helpFetch.GET("/departamento"),
                helpFetch.GET("/equipo")
            ]);

            setDepartamentos(deps);
            setEquipos(allEquipos);

            // 3. Pre-seleccionar División de Servicio Técnico como DESTINO (ID=14)
            setValue('destino_id', '14');

            // 4. Pre-seleccionar departamento del usuario como ORIGEN (si existe)
            const userDepId = userData.user.direc_id;
            if (userDepId) {
                setValue('origen_id', String(userDepId));
            }

        } catch (error) {
            console.error("Error al cargar datos iniciales:", error);
            toast.error("Error al cargar datos del formulario");
        } finally {
            setInitialLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const payload = { ...data, usuario_id: user.usuario_id };
            const response = await helpFetch.POST("/transferencia", payload);

            if (response) {
                toast.success(`Transferencia ${response.data.nro_caso} registrada con éxito`);
                onSuccess();
            }
        } catch (error) {
            console.error(error);
            const msg = error.message.includes('409')
                ? "El equipo ya tiene una transferencia pendiente."
                : (error.message || "Error al registrar la transferencia");
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar equipos según origen seleccionado
    const filteredEquipos = watchedOrigenId
        ? equipos.filter(eq => String(eq.direc_id) === String(watchedOrigenId))
        : [];

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton className="text-dark">
                <Modal.Title>Nueva Transferencia a Servicio Técnico</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    {initialLoading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Cargando información...</p>
                        </div>
                    ) : (
                        <>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Departamento de Origen <span className="text-danger">*</span></Form.Label>
                                        <Form.Select
                                            {...register("origen_id")}
                                            disabled={!isAdmin}
                                            isInvalid={!!errors.origen_id}
                                        >
                                            <option value="">Seleccione origen...</option>
                                            {departamentos.map(dep => (
                                                <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.origen_id?.message}</Form.Control.Feedback>
                                        {!isAdmin && <Form.Text className="text-muted">Asignado automáticamente por su perfil.</Form.Text>}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Entregar a (Destino) <span className="text-danger">*</span></Form.Label>
                                        <Form.Select
                                            {...register("destino_id")}
                                            isInvalid={!!errors.destino_id}
                                        >
                                            <option value="">Seleccione destino...</option>
                                            {departamentos
                                                .filter(d => isAdmin ? d.nombre.toUpperCase().includes("DIVISIÓN DE SERVICIO TÉCNICO") || d.nombre.toUpperCase().includes("DIVISION DE SERVICIO TECNICO") : d.id === 14)
                                                .map(dep => (
                                                    <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                                                ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.destino_id?.message}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Equipo a Transferir <span className="text-danger">*</span></Form.Label>
                                        <Form.Select {...register("equipo_id")} isInvalid={!!errors.equipo_id} disabled={!watchedOrigenId}>
                                            <option value="">{watchedOrigenId ? 'Seleccione un equipo...' : 'Primero seleccione origen'}</option>
                                            {filteredEquipos.map(eq => (
                                                <option key={eq.id} value={eq.id}>
                                                    {eq.nro_bien} - {eq.tipo_de_equipo} ({eq.modelo_nombre || 'S/M'})
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.equipo_id?.message}</Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Solo se muestran equipos del departamento de origen seleccionado.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Asunto / Motivo <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text" {...register("asunto")} placeholder="Describa el motivo..." isInvalid={!!errors.asunto} />
                                        <Form.Control.Feedback type="invalid">{errors.asunto?.message}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Observaciones Adicionales</Form.Label>
                                <Form.Control as="textarea" rows={3} {...register("observaciones")} placeholder="Detalles de la falla..." isInvalid={!!errors.observaciones} />
                                <Form.Control.Feedback type="invalid">{errors.observaciones?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading || initialLoading}>
                        {loading ? <Spinner size="sm" animation="border" className="me-1" /> : <i className="bx bx-send me-1"></i>}
                        Registrar Transferencia
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
