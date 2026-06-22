import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Table, Card, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import helpFetch from "../../../utils/helpFetch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const equipoSchema = z.object({
    nro_bien: z.string().min(1, "Ingrese número de bien").max(50),
    tipo_equipo: z.string().min(1, "Seleccione tipo de equipo"),
    direc_id: z.string().min(1, "Seleccione departamento"),
    marca_id: z.string().min(1, "Seleccione marca"),
    modelo_id: z.string().optional(),
    pp_pared: z.string().min(1, "Seleccione puerto de pared"),
    ip: z.string().optional(),
    nombre_equipo: z.string().max(100).optional(),
    sistema_operativo: z.string().max(100).optional(),
    version_office: z.string().max(100).optional(),
    elaborado_por: z.string().max(100).optional(),
    observaciones: z.string().max(500).optional(),
    toner_id: z.string().optional(),
}).refine((data) => {
    if (data.ip && data.ip.trim()) {
        const ipv4Regex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
        return ipv4Regex.test(data.ip.trim());
    }
    return true;
}, { message: "Formato IP inválido (ej. 192.168.1.50)", path: ["ip"] }).refine((data) => {
    if (data.tipo_equipo === "2" && !data.toner_id) return false;
    return true;
}, { message: "Seleccione el modelo de tóner", path: ["toner_id"] });

export const ModalEquipo = ({ show, onHide, onSuccess, equipo }) => {
    const isEdit = !!equipo;
    const [loadingMaestros, setLoadingMaestros] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Listas Maestras
    const [maestros, setMaestros] = useState({
        departamentos: [],
        tiposEquipo: [],
        panelesPared: [],
        puertosPared: [],
        marcas: [],
        modelos: [],
        tiposToner: [],
        tiposComponente: []
    });

    const [selectedPanel, setSelectedPanel] = useState("");

    // 4. Componentes (Para PC)
    const [componentes, setComponentes] = useState([]);
    const [nuevoComp, setNuevoComp] = useState({
        tipo_id: "",
        marca_id: "",
        modelo_id: "",
        serial: "",
        capacidad: "",
        nro_bien: ""
    });

    const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
        resolver: zodResolver(equipoSchema),
        defaultValues: {
            nro_bien: "",
            tipo_equipo: "",
            direc_id: "",
            marca_id: "",
            modelo_id: "",
            pp_pared: "",
            ip: "",
            nombre_equipo: "",
            sistema_operativo: "",
            version_office: "",
            elaborado_por: "",
            observaciones: "",
            toner_id: "",
        }
    });

    const watchedTipoEquipo = watch('tipo_equipo');
    const watchedMarcaId = watch('marca_id');

    // Cargar maestros al abrir el modal
    useEffect(() => {
        if (show) {
            const load = async () => {
                setLoadingMaestros(true);
                try {
                    const [deps, tiposEq, ports, walls, brands, mods, toners, compTypes] = await Promise.all([
                        helpFetch.GET("/departamento"),
                        helpFetch.GET("/tipo_equipo"),
                        helpFetch.GET("/puertos"),
                        helpFetch.GET("/panel_pared"),
                        helpFetch.GET("/marca"),
                        helpFetch.GET("/modelo"),
                        helpFetch.GET("/tipo_toner"),
                        helpFetch.GET("/tipo_componente")
                    ]);
                    setMaestros({
                        departamentos: deps,
                        tiposEquipo: tiposEq,
                        puertosPared: ports,
                        panelesPared: walls,
                        marcas: brands,
                        modelos: mods,
                        tiposToner: toners,
                        tiposComponente: compTypes
                    });

                    if (equipo) {
                        setValue("nro_bien", equipo.nro_bien || "");
                        setValue("direc_id", String(equipo.direc_id || ""));
                        setValue("tipo_equipo", String(equipo.tipo_equipo_id || ""));
                        setValue("pp_pared", String(equipo.pp_pared || ""));
                        setValue("marca_id", String(equipo.marca_id || ""));
                        setValue("modelo_id", String(equipo.modelo_id || ""));
                        setValue("ip", equipo.ip || "");

                        if (equipo.pp_pared) {
                            const portObj = (ports || maestros.puertosPared).find(p => String(p.id) === String(equipo.pp_pared));
                            if (portObj) {
                                setSelectedPanel(portObj.panel_id);
                            }
                        }

                        if (String(equipo.tipo_de_equipo).trim().toLowerCase() === "computador" || equipo.tipo_equipo_id === 1) {
                            setValue("nombre_equipo", equipo.nombre_equipo || "");
                            setValue("sistema_operativo", equipo.sistema_operativo || "");
                            setValue("version_office", equipo.version_office || "");
                            setValue("elaborado_por", equipo.elaborado_por || "");
                            setValue("observaciones", equipo.observaciones || "");

                            const compsRaw = equipo.detalles || [];
                            const compsMapeados = compsRaw.map(c => ({
                                id: c.id,
                                tipo_id: c.tipo_id || "",
                                marca_id: c.marca_id || "",
                                modelo_id: c.modelo_id || "",
                                serial: c.serial || "",
                                capacidad: c.capacidad || "",
                                nro_bien: c.nro_bien || ""
                            }));
                            setComponentes(compsMapeados);
                        }

                        const esImpresora = String(equipo.tipo_de_equipo).toLowerCase().includes("impresora") || equipo.tipo_equipo_id === 2;
                        if (esImpresora) {
                            setValue("toner_id", String(equipo.toner_id || ""));
                        }
                    } else {
                        reset();
                        setSelectedPanel("");
                        setComponentes([]);
                    }
                } catch (err) {
                    console.error("Error cargando maestros:", err);
                    toast.error("Error al cargar datos necesarios");
                } finally {
                    setLoadingMaestros(false);
                }
            };
            load();
        }
    }, [show, equipo?.id]);

    const handleAddComponent = () => {
        if (!nuevoComp.tipo_id || !nuevoComp.serial) {
            toast.warning("Complete tipo y serial del componente");
            return;
        }
        setComponentes([...componentes, nuevoComp]);
        setNuevoComp({ tipo_id: "", marca_id: "", modelo_id: "", serial: "", capacidad: "", nro_bien: "" });
    };

    const removeComponent = (index) => {
        setComponentes(componentes.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        if (String(data.tipo_equipo) === "1") {
            if (componentes.length === 0) {
                toast.error("Debe agregar al menos un componente interno para una computadora");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const payload = {
                general: {
                    ...data,
                    nro_bien: data.nro_bien.trim(),
                    ip: data.ip?.trim() || null
                },
                detallesComputo: String(data.tipo_equipo) === "1" ? {
                    nombre_equipo: data.nombre_equipo,
                    sistema_operativo: data.sistema_operativo,
                    version_office: data.version_office,
                    elaborado_por: data.elaborado_por,
                    observaciones: data.observaciones
                } : null,
                detallesImpresora: String(data.tipo_equipo) === "2" ? {
                    toner_id: data.toner_id
                } : null,
                componentes: String(data.tipo_equipo) === "1" ? componentes : []
            };

            if (isEdit) {
                await helpFetch.PATCH(`/equipo/${equipo.id}`, payload);
                toast.success("Equipo actualizado con éxito");
            } else {
                await helpFetch.POST("/equipo", payload);
                toast.success("Equipo registrado con éxito");
            }
            onSuccess();
        } catch (error) {
            toast.error(error.message || "Error al procesar solicitud");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCompTypeName = (id) => maestros.tiposComponente.find(t => String(t.id) === String(id))?.nombre || id;

    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEdit ? `Editar Equipo: ${equipo.nro_bien}` : "Registrar Nuevo Equipo"}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                    {loadingMaestros ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p>Cargando maestros...</p>
                        </div>
                    ) : (
                        <>
                            {/* SECCION 1: GENERAL */}
                            <div className="mb-4">
                                <h6 className="text-primary border-bottom pb-2 mb-3">
                                    <i className="bx bx-info-circle me-1"></i> Información General
                                </h6>
                                <Row className="g-3">
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Número de Bien</Form.Label>
                                            <Form.Control
                                                {...register("nro_bien")}
                                                placeholder="Ej. C-123"
                                                isInvalid={!!errors.nro_bien}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.nro_bien?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Tipo de Equipo</Form.Label>
                                            <Form.Select
                                                {...register("tipo_equipo")}
                                                isInvalid={!!errors.tipo_equipo}
                                            >
                                                <option value="">Seleccione...</option>
                                                {maestros.tiposEquipo.map(t => (
                                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.tipo_equipo?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Departamento</Form.Label>
                                            <Form.Select
                                                {...register("direc_id")}
                                                isInvalid={!!errors.direc_id}
                                            >
                                                <option value="">Seleccione...</option>
                                                {maestros.departamentos.map(d => (
                                                    <option key={d.id} value={d.id}>{d.nombre}</option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.direc_id?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Marca</Form.Label>
                                            <Form.Select
                                                {...register("marca_id", {
                                                    onChange: (e) => {
                                                        setValue("modelo_id", "");
                                                    }
                                                })}
                                                isInvalid={!!errors.marca_id}
                                            >
                                                <option value="">Seleccione...</option>
                                                {maestros.marcas.map(m => (
                                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.marca_id?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Modelo</Form.Label>
                                            <Form.Select
                                                disabled={!watchedMarcaId}
                                                {...register("modelo_id")}
                                            >
                                                <option value="">Seleccione...</option>
                                                {maestros.modelos
                                                    .filter(m => String(m.marca_id) === String(watchedMarcaId))
                                                    .map(m => (
                                                        <option key={m.id} value={m.id}>{m.nombre}</option>
                                                    ))
                                                }
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Dirección IP (Opcional)</Form.Label>
                                            <Form.Control
                                                {...register("ip")}
                                                placeholder="Ej. 192.168.1.50"
                                                isInvalid={!!errors.ip}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.ip?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <hr className="my-2" />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold">1. Seleccionar Caja / Roseta de Pared</Form.Label>
                                            <Form.Select
                                                value={selectedPanel}
                                                onChange={(e) => {
                                                    setSelectedPanel(e.target.value);
                                                    setValue("pp_pared", "");
                                                }}
                                            >
                                                <option value="">Seleccione Roseta...</option>
                                                {maestros.panelesPared.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        Caja #{p.id} - Piso: {p.nombre_piso}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold">2. Seleccionar Puerto en esta Pared</Form.Label>
                                            <Form.Select
                                                {...register("pp_pared")}
                                                disabled={!selectedPanel}
                                                isInvalid={!!errors.pp_pared}
                                            >
                                                <option value="">
                                                    {!selectedPanel ? "Elija una roseta primero..." : "Seleccione Puerto..."}
                                                </option>
                                                {maestros.puertosPared
                                                    .filter(p => String(p.panel_id) === String(selectedPanel))
                                                    .map(p => (
                                                        <option key={p.id} value={p.id} disabled={!!p.equipo_asignado} style={p.equipo_asignado ? { color: 'red' } : {}}>
                                                            Puerto: {p.nro_puerto}{p.equipo_asignado ? ` (Ocupado: ${p.equipo_asignado})` : ''}
                                                        </option>
                                                    ))}
                                            </Form.Select>
                                            {selectedPanel && maestros.puertosPared.filter(p => String(p.panel_id) === String(selectedPanel)).filter(p => !p.equipo_asignado).length === 0 && (
                                                <Form.Text className="text-danger">
                                                    No hay puertos libres disponibles en esta roseta.
                                                </Form.Text>
                                            )}
                                            <Form.Control.Feedback type="invalid">{errors.pp_pared?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>

                            {/* SECCION 2: ESPECIFICA SEGUN TIPO */}

                            {/* SI ES COMPUTADOR (ID 1) */}
                            {String(watchedTipoEquipo) === "1" && (
                                <div className="mb-4">
                                    <h6 className="text-primary border-bottom pb-2 mb-3">
                                        <i className="bx bx-desktop me-1"></i> Detalles de Cómputo
                                    </h6>
                                    <Row className="g-3 mb-3">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Nombre en Red</Form.Label>
                                                <Form.Control
                                                    {...register("nombre_equipo")}
                                                    placeholder="Ej. AUDITORIA-PC01"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Sistema Operativo</Form.Label>
                                                <Form.Control
                                                    {...register("sistema_operativo")}
                                                    placeholder="Ej. Windows 11 Pro"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Versión Office</Form.Label>
                                                <Form.Control
                                                    {...register("version_office")}
                                                    placeholder="Ej. 2021 LTSC"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Registrado/Elaborado por</Form.Label>
                                                <Form.Control
                                                    {...register("elaborado_por")}
                                                    placeholder="Nombre del técnico"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Observaciones Iniciales</Form.Label>
                                                <Form.Control
                                                    as="textarea" rows={1}
                                                    {...register("observaciones")}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* COMPONENTES */}
                                    <Card className="mt-4 bg-light border-0">
                                        <Card.Body>
                                            <h6 className="mb-3">Hardware / Componentes Internos</h6>
                                            <Row className="g-2 mb-3 align-items-end">
                                                <Col md={2}>
                                                    <Form.Label className="small">Tipo</Form.Label>
                                                    <Form.Select
                                                        size="sm"
                                                        value={nuevoComp.tipo_id}
                                                        onChange={(e) => setNuevoComp({ ...nuevoComp, tipo_id: e.target.value })}
                                                    >
                                                        <option value="">Tipo...</option>
                                                        {maestros.tiposComponente.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                                    </Form.Select>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label className="small">Marca</Form.Label>
                                                    <Form.Select
                                                        size="sm"
                                                        value={nuevoComp.marca_id}
                                                        onChange={(e) => setNuevoComp({ ...nuevoComp, marca_id: e.target.value, modelo_id: "" })}
                                                    >
                                                        <option value="">Marca...</option>
                                                        {maestros.marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                                    </Form.Select>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label className="small">Modelo</Form.Label>
                                                    <Form.Select
                                                        size="sm"
                                                        disabled={!nuevoComp.marca_id}
                                                        value={nuevoComp.modelo_id}
                                                        onChange={(e) => setNuevoComp({ ...nuevoComp, modelo_id: e.target.value })}
                                                    >
                                                        <option value="">Modelo...</option>
                                                        {maestros.modelos
                                                            .filter(m => String(m.marca_id) === String(nuevoComp.marca_id))
                                                            .map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)
                                                        }
                                                    </Form.Select>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label className="small">Serial</Form.Label>
                                                    <Form.Control
                                                        size="sm" placeholder="Serial..."
                                                        value={nuevoComp.serial}
                                                        onChange={(e) => setNuevoComp({ ...nuevoComp, serial: e.target.value })}
                                                    />
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label className="small">Capacid.</Form.Label>
                                                    <Form.Control
                                                        size="sm" placeholder="GB/Slots..."
                                                        value={nuevoComp.capacidad}
                                                        onChange={(e) => setNuevoComp({ ...nuevoComp, capacidad: e.target.value })}
                                                    />
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label className="small">Bien Comp.</Form.Label>
                                                    <Form.Control
                                                        size="sm" placeholder="B-XXXX"
                                                        value={nuevoComp.nro_bien}
                                                        onChange={(e) => setNuevoComp({ ...nuevoComp, nro_bien: e.target.value })}
                                                    />
                                                </Col>
                                                <Col md={2}>
                                                    <Button variant="dark" size="sm" className="w-100" onClick={handleAddComponent}>
                                                        <i className="bx bx-plus"></i> Añadir
                                                    </Button>
                                                </Col>
                                            </Row>

                                            <Table size="sm" striped bordered hover variant="white" className="mb-0 overflow-hidden rounded-1">
                                                <thead>
                                                    <tr className="table-dark">
                                                        <th>Tipo</th>
                                                        <th>Marca</th>
                                                        <th>Modelo</th>
                                                        <th>Serial</th>
                                                        <th>Capacidad</th>
                                                        <th>Nro Bien</th>
                                                        <th className="text-center"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {componentes.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="text-center py-2 text-muted">Añada componentes (RAM, Disco, etc.)</td>
                                                        </tr>
                                                    ) : (
                                                        componentes.map((c, i) => (
                                                            <tr key={i}>
                                                                <td>{getCompTypeName(c.tipo_id)}</td>
                                                                <td>{maestros.marcas.find(m => String(m.id) === String(c.marca_id))?.nombre || '-'}</td>
                                                                <td>{maestros.modelos.find(m => String(m.id) === String(c.modelo_id))?.nombre || '-'}</td>
                                                                <td>{c.serial}</td>
                                                                <td>{c.capacidad}</td>
                                                                <td>{c.nro_bien || '-'}</td>
                                                                <td className="text-center">
                                                                    <i className="bx bx-trash text-danger cursor-pointer" onClick={() => removeComponent(i)}></i>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                </div>
                            )}

                            {/* SI ES IMPRESORA (ID 2) */}
                            {String(watchedTipoEquipo) === "2" && (
                                <div className="mb-4">
                                    <h6 className="text-primary border-bottom pb-2 mb-3">
                                        <i className="bx bx-printer me-1"></i> Detalles de Impresión
                                    </h6>
                                    <Row className="g-3">
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold">Seleccionar Modelo de Tóner Correspondiente</Form.Label>
                                                <Form.Select
                                                    {...register("toner_id")}
                                                    isInvalid={!!errors.toner_id}
                                                >
                                                    <option value="">Seleccione tóner...</option>
                                                    {maestros.tiposToner
                                                        .map(t => (
                                                            <option key={t.id} value={t.id}>
                                                                {t.nombre} {t.marca_nombre ? `(${t.marca_nombre})` : ''} {t.modelo_nombre ? `- Mod: ${t.modelo_nombre}` : ''}
                                                            </option>
                                                        ))
                                                    }
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">{errors.toner_id?.message}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {/* Otros tipos (Escaner, etc) podrían añadirse aquí */}
                            {watchedTipoEquipo && String(watchedTipoEquipo) !== "1" && String(watchedTipoEquipo) !== "2" && (
                                <div className="alert alert-info py-2">
                                    Este tipo de equipo no requiere detalles adicionales por ahora.
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loadingMaestros || isSubmitting}>
                        {isSubmitting ? (
                            <><Spinner as="span" animation="border" size="sm" className="me-2" />{isEdit ? "Guardando..." : "Registrando..."}</>
                        ) : (
                            isEdit ? "Guardar Cambios" : "Registrar Equipo"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
