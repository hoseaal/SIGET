import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import Select from "react-select";
import helpFetch from "../../../utils/helpFetch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const actividadSchema = z.object({
    nro_act: z.string(),
    fecha: z.string().min(1, "La fecha es obligatoria"),
    direc_id: z.string().min(1, "Seleccione departamento"),
    tipo_act: z.string().min(1, "Seleccione tipo de actividad"),
    clasificacion_id: z.number().min(1, "Seleccione clasificación"),
    equipo_id: z.string().optional(),
    observaciones: z.string().max(500).optional(),
});

export const RegistroActividadModal = ({ show, onHide, onSuccess, user }) => {
    const [loading, setLoading] = useState(false);
    const [departamentos, setDepartamentos] = useState([]);
    const [tiposAct, setTiposAct] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [fetchingInitial, setFetchingInitial] = useState(false);

    const { register, handleSubmit, formState: { errors }, control, reset, setValue, watch } = useForm({
        resolver: zodResolver(actividadSchema),
        defaultValues: {
            nro_act: "",
            fecha: new Date().toISOString().split("T")[0],
            direc_id: "",
            equipo_id: "",
            tipo_act: "",
            clasificacion_id: 0,
            observaciones: ""
        }
    });

    const clasificaciones = [
        { id: 1, nombre: "MANT. PREVENTIVO - SOFTWARE" },
        { id: 2, nombre: "MANT. PREVENTIVO - HARDWARE" },
        { id: 3, nombre: "MANT. CORRECTIVO - SOFTWARE" },
        { id: 4, nombre: "MANT. CORRECTIVO - HARDWARE" },
        { id: 5, nombre: "PLAT. TECNOLOGICA - SERVICIOS / REDES" },
        { id: 6, nombre: "PLAT. TECNOLOGICA - INFORMES" }
    ];

    const watchedDirecId = watch('direc_id');

    const fetchInitialData = async () => {
        try {
            setFetchingInitial(true);
            const [deps, tipos, nextNum] = await Promise.all([
                helpFetch.GET("/departamento"),
                helpFetch.GET("/tipo_act"),
                helpFetch.GET("/actividades/proximo-numero")
            ]);
            setDepartamentos(deps);
            setTiposAct(tipos);
            setValue("nro_act", nextNum.numero);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar datos iniciales");
        } finally {
            setFetchingInitial(false);
        }
    };

    const fetchEquipos = async (deptoId) => {
        if (!deptoId) return;
        try {
            const data = await helpFetch.GET("/equipo");
            setEquipos(data.filter(e => e.direc_id === parseInt(deptoId)));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (show) {
            fetchInitialData();
            reset({
                nro_act: "",
                fecha: new Date().toISOString().split("T")[0],
                direc_id: "",
                equipo_id: "",
                tipo_act: "",
                clasificacion_id: 0,
                observaciones: ""
            });
        }
    }, [show]);

    useEffect(() => {
        if (watchedDirecId) {
            fetchEquipos(watchedDirecId);
        } else {
            setEquipos([]);
        }
    }, [watchedDirecId]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const payload = {
                ...data,
                usuario_id: user.usuario_id
            };
            await helpFetch.POST("/actividades", payload);
            toast.success("Actividad registrada correctamente");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al registrar actividad");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">
                    <i className="bx bx-list-plus me-2 text-primary"></i>
                    Registrar Actividad Manual
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body className="pt-4">
                    {fetchingInitial ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Preparando formulario...</p>
                        </div>
                    ) : (
                        <>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Nro. Actividad</Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("nro_act")}
                                            readOnly
                                            className="bg-light border-0 fw-bold text-primary"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Fecha</Form.Label>
                                        <Form.Control
                                            type="date"
                                            {...register("fecha")}
                                            isInvalid={!!errors.fecha}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.fecha?.message}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Departamento Solicitante</Form.Label>
                                        <Form.Select
                                            {...register("direc_id")}
                                            isInvalid={!!errors.direc_id}
                                        >
                                            <option value="">-- Seleccionar Departamento --</option>
                                            {departamentos.map(d => (
                                                <option key={d.id} value={d.id}>{d.nombre}</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.direc_id?.message}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Tipo de Actividad (Descripción del Reporte)</Form.Label>
                                        <Form.Select
                                            {...register("tipo_act")}
                                            isInvalid={!!errors.tipo_act}
                                        >
                                            <option value="">-- Seleccionar Tipo de Falla/Actividad --</option>
                                            {tiposAct.map(t => (
                                                <option key={t.id} value={t.id}>{t.nombre}</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.tipo_act?.message}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="bg-light p-3 rounded border mb-4">
                                <h6 className="fw-bold small text-muted mb-3 text-uppercase">Clasificación para Historial SM</h6>
                                <Controller
                                    name="clasificacion_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Row>
                                            <Col md={4}>
                                                <div className="fw-bold small mb-2 border-bottom">Mant. Preventivo</div>
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Software"
                                                    checked={field.value === 1}
                                                    onChange={() => field.onChange(1)}
                                                    id="chk-prev-sw"
                                                />
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Hardware"
                                                    checked={field.value === 2}
                                                    onChange={() => field.onChange(2)}
                                                    id="chk-prev-hw"
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <div className="fw-bold small mb-2 border-bottom">Mant. Correctivo</div>
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Software"
                                                    checked={field.value === 3}
                                                    onChange={() => field.onChange(3)}
                                                    id="chk-corr-sw"
                                                />
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Hardware"
                                                    checked={field.value === 4}
                                                    onChange={() => field.onChange(4)}
                                                    id="chk-corr-hw"
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <div className="fw-bold small mb-2 border-bottom">Plat. Tecnológica</div>
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Servicios / Redes"
                                                    checked={field.value === 5}
                                                    onChange={() => field.onChange(5)}
                                                    id="chk-plat-serv"
                                                />
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Informes"
                                                    checked={field.value === 6}
                                                    onChange={() => field.onChange(6)}
                                                    id="chk-plat-inf"
                                                />
                                            </Col>
                                        </Row>
                                    )}
                                />
                                {errors.clasificacion_id && (
                                    <div className="text-danger small mt-2">{errors.clasificacion_id.message}</div>
                                )}
                            </div>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">Equipo / Bien Mueble (Opcional)</Form.Label>
                                <Controller
                                    name="equipo_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            placeholder="Buscar por Nro. Bien..."
                                            isClearable
                                            options={equipos.map(e => ({
                                                value: e.id,
                                                label: `${e.nro_bien} -  ${e.tipo_de_equipo || 'S/T'} - Marca: ${e.marca_nombre || 'S/M'} ${e.modelo_nombre ? `(${e.modelo_nombre})` : ''}`
                                            }))}
                                            onChange={(opt) => field.onChange(opt ? String(opt.value) : '')}
                                            value={equipos.find(e => String(e.id) === String(field.value)) ? {
                                                value: field.value,
                                                label: `${equipos.find(e => String(e.id) === String(field.value))?.nro_bien} -  ${equipos.find(e => String(e.id) === String(field.value))?.tipo_de_equipo || 'S/T'}`
                                            } : null}
                                            noOptionsMessage={() => "No se encontraron equipos"}
                                            theme={(theme) => ({
                                                ...theme,
                                                borderRadius: 5,
                                                colors: {
                                                    ...theme.colors,
                                                    primary: '#007bff',
                                                },
                                            })}
                                        />
                                    )}
                                />
                                {errors.equipo_id && (
                                    <div className="text-danger small mt-2">{errors.equipo_id.message}</div>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label className="fw-semibold">Observaciones / Solución</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    {...register("observaciones")}
                                    placeholder="Describa brevemente la labor realizada..."
                                    isInvalid={!!errors.observaciones}
                                />
                                <Form.Control.Feedback type="invalid">{errors.observaciones?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={onHide} disabled={loading} className="text-muted">
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading || fetchingInitial} className="px-4">
                        {loading ? (
                            <Spinner size="sm" animation="border" className="me-1" />
                        ) : (
                            <i className="bx bx-save me-1"></i>
                        )}
                        Guardar Actividad
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
