import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Table, Card, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import helpFetch from "../../../utils/helpFetch";

export const ModalEquipo = ({ show, onHide, onSuccess, equipo }) => {
    const isEdit = !!equipo;
    const [loadingMaestros, setLoadingMaestros] = useState(false);
    
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

    // --- ESTADOS DEL FORMULARIO ---
    
    // 1. Datos Generales
    const [formGeneral, setFormGeneral] = useState({
        nro_bien: "",
        direc_id: "",
        tipo_equipo: "",
        pp_pared: "",
        marca_id: "",
        modelo_id: ""
    });

    const [selectedPanel, setSelectedPanel] = useState("");

    // 2. Detalles Computo (Tipo 1)
    const [detallesComputo, setDetallesComputo] = useState({
        nombre_equipo: "",
        sistema_operativo: "",
        version_office: "",
        elaborado_por: "",
        observaciones: ""
    });

    // 3. Detalles Impresora (Tipo 2)
    const [detallesImpresora, setDetallesImpresora] = useState({
        marca: "",
        toner_id: ""
    });

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

                    // Si es editar, poblar estados (simplificado para demostración, 
                    // el backend getAll ya trae mucha info pero la edicion completa re-usará el registrar)
                    if (equipo) {
                        setFormGeneral({
                            nro_bien: equipo.nro_bien,
                            direc_id: (deps || maestros.departamentos).find(d => d.nombre === equipo.departamento)?.id || "",
                            tipo_equipo: (tiposEq || maestros.tiposEquipo).find(t => t.nombre === equipo.tipo_de_equipo)?.id || "",
                            pp_pared: equipo.pp_pared || "",
                            marca_id: equipo.marca_id || "",
                            modelo_id: equipo.modelo_id || ""
                        });
                        
                        // Determinar el panel seleccionado basándose en el puerto del equipo
                        if (equipo.pp_pared) {
                            const portObj = (ports || maestros.puertosPared).find(p => String(p.id) === String(equipo.pp_pared));
                            if (portObj) {
                                setSelectedPanel(portObj.panel_id);
                            }
                        }

                        // Poblar detalles si es tipo PC (Tipo 1)
                        if (String(equipo.tipo_de_equipo).trim().toLowerCase() === "computador" || equipo.tipo_de_equipo === 1) {
                            setDetallesComputo({
                                nombre_equipo: equipo.nombre_equipo || "",
                                sistema_operativo: equipo.sistema_operativo || "",
                                version_office: equipo.version_office || "",
                                elaborado_por: equipo.elaborado_por || "",
                                observaciones: equipo.observaciones || ""
                            });
                            
                            // Mapear componentes conservando sus IDs originales
                            const compsRaw = (equipo.detalles || []).filter(d => d.serial);
                            const compsMapeados = compsRaw.map(c => ({
                                tipo_id: c.tipo_id || "",
                                marca_id: c.marca_id || "",
                                modelo_id: c.modelo_id || "",
                                serial: c.serial,
                                capacidad: c.capacidad,
                                nro_bien: c.nro_bien || ""
                            }));
                            setComponentes(compsMapeados);
                        }
                    } else {
                        resetForm();
                    }
                } catch (err) {
                    toast.error("Error al cargar datos necesarios");
                } finally {
                    setLoadingMaestros(false);
                }
            };
            load();
        }
    }, [show, equipo]);

    const resetForm = () => {
        setFormGeneral({ nro_bien: "", direc_id: "", tipo_equipo: "", pp_pared: "", marca_id: "", modelo_id: "" });
        setSelectedPanel("");
        setDetallesComputo({ nombre_equipo: "", sistema_operativo: "", version_office: "", elaborado_por: "", observaciones: "" });
        setDetallesImpresora({ marca: "", toner_id: "" });
        setComponentes([]);
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                general: formGeneral,
                detallesComputo: String(formGeneral.tipo_equipo) === "1" ? detallesComputo : null,
                detallesImpresora: String(formGeneral.tipo_equipo) === "2" ? detallesImpresora : null,
                componentes: String(formGeneral.tipo_equipo) === "1" ? componentes : []
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
        }
    };

    // Helper para obtener nombres de IDs para la tabla temporal de componentes
    const getCompTypeName = (id) => maestros.tiposComponente.find(t => String(t.id) === String(id))?.nombre || id;

    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEdit ? `Editar Equipo: ${equipo.nro_bien}` : "Registrar Nuevo Equipo"}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
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
                                                required
                                                placeholder="Ej. C-123"
                                                value={formGeneral.nro_bien}
                                                onChange={(e) => setFormGeneral({...formGeneral, nro_bien: e.target.value})}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Tipo de Equipo</Form.Label>
                                            <Form.Select 
                                                required
                                                value={formGeneral.tipo_equipo}
                                                onChange={(e) => setFormGeneral({...formGeneral, tipo_equipo: e.target.value})}
                                            >
                                                <option value="">Seleccione...</option>
                                                {maestros.tiposEquipo.map(t => (
                                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Departamento</Form.Label>
                                            <Form.Select 
                                                required
                                                value={formGeneral.direc_id}
                                                onChange={(e) => setFormGeneral({...formGeneral, direc_id: e.target.value})}
                                            >
                                                <option value="">Seleccione...</option>
                                                {maestros.departamentos.map(d => (
                                                    <option key={d.id} value={d.id}>{d.nombre}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Marca</Form.Label>
                                            <Form.Select 
                                                required
                                                value={formGeneral.marca_id}
                                                onChange={(e) => setFormGeneral({...formGeneral, marca_id: e.target.value, modelo_id: ""})}
                                            >
                                                <option value="">Seleccione...</option>
                                                {maestros.marcas.map(m => (
                                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Modelo</Form.Label>
                                            <Form.Select 
                                                disabled={!formGeneral.marca_id}
                                                value={formGeneral.modelo_id}
                                                onChange={(e) => setFormGeneral({...formGeneral, modelo_id: e.target.value})}
                                            >
                                                <option value="">Seleccione...</option>
                                                {maestros.modelos
                                                    .filter(m => String(m.marca_id) === String(formGeneral.marca_id))
                                                    .map(m => (
                                                        <option key={m.id} value={m.id}>{m.nombre}</option>
                                                    ))
                                                }
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <hr className="my-2"/>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold">1. Seleccionar Caja / Roseta de Pared</Form.Label>
                                            <Form.Select 
                                                required
                                                value={selectedPanel}
                                                onChange={(e) => {
                                                    setSelectedPanel(e.target.value);
                                                    setFormGeneral({...formGeneral, pp_pared: ""}); // Reset puerto al cambiar pared
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
                                                required
                                                disabled={!selectedPanel}
                                                value={formGeneral.pp_pared}
                                                onChange={(e) => setFormGeneral({...formGeneral, pp_pared: e.target.value})}
                                            >
                                                <option value="">
                                                    {!selectedPanel ? "Elija una roseta primero..." : "Seleccione Puerto..."}
                                                </option>
                                                {maestros.puertosPared
                                                    .filter(p => String(p.panel_id) === String(selectedPanel))
                                                    .map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            Puerto: {p.nro_puerto}
                                                        </option>
                                                    ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>

                            {/* SECCION 2: ESPECIFICA SEGUN TIPO */}
                            
                            {/* SI ES COMPUTADOR (ID 1) */}
                            {String(formGeneral.tipo_equipo) === "1" && (
                                <div className="mb-4">
                                    <h6 className="text-primary border-bottom pb-2 mb-3">
                                        <i className="bx bx-desktop me-1"></i> Detalles de Cómputo
                                    </h6>
                                    <Row className="g-3 mb-3">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Nombre en Red</Form.Label>
                                                <Form.Control 
                                                    placeholder="Ej. AUDITORIA-PC01"
                                                    value={detallesComputo.nombre_equipo}
                                                    onChange={(e) => setDetallesComputo({...detallesComputo, nombre_equipo: e.target.value})}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Sistema Operativo</Form.Label>
                                                <Form.Control 
                                                    placeholder="Ej. Windows 11 Pro"
                                                    value={detallesComputo.sistema_operativo}
                                                    onChange={(e) => setDetallesComputo({...detallesComputo, sistema_operativo: e.target.value})}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Versión Office</Form.Label>
                                                <Form.Control 
                                                    placeholder="Ej. 2021 LTSC"
                                                    value={detallesComputo.version_office}
                                                    onChange={(e) => setDetallesComputo({...detallesComputo, version_office: e.target.value})}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Registrado/Elaborado por</Form.Label>
                                                <Form.Control 
                                                    placeholder="Nombre del técnico"
                                                    value={detallesComputo.elaborado_por}
                                                    onChange={(e) => setDetallesComputo({...detallesComputo, elaborado_por: e.target.value})}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Observaciones Iniciales</Form.Label>
                                                <Form.Control 
                                                    as="textarea" rows={1}
                                                    value={detallesComputo.observaciones}
                                                    onChange={(e) => setDetallesComputo({...detallesComputo, observaciones: e.target.value})}
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
                                                        onChange={(e) => setNuevoComp({...nuevoComp, tipo_id: e.target.value})}
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
                                                        onChange={(e) => setNuevoComp({...nuevoComp, marca_id: e.target.value, modelo_id: ""})}
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
                                                        onChange={(e) => setNuevoComp({...nuevoComp, modelo_id: e.target.value})}
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
                                                        onChange={(e) => setNuevoComp({...nuevoComp, serial: e.target.value})}
                                                    />
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label className="small">Capacid.</Form.Label>
                                                    <Form.Control 
                                                        size="sm" placeholder="GB/Slots..."
                                                        value={nuevoComp.capacidad}
                                                        onChange={(e) => setNuevoComp({...nuevoComp, capacidad: e.target.value})}
                                                    />
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label className="small">Bien Comp.</Form.Label>
                                                    <Form.Control 
                                                        size="sm" placeholder="B-XXXX"
                                                        value={nuevoComp.nro_bien}
                                                        onChange={(e) => setNuevoComp({...nuevoComp, nro_bien: e.target.value})}
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
                                                            <td colSpan="5" className="text-center py-2 text-muted">Añada componentes (RAM, Disco, etc.)</td>
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
                                                                    <i className="bx bx-x text-danger cursor-pointer" onClick={() => removeComponent(i)}></i>
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
                            {String(formGeneral.tipo_equipo) === "2" && (
                                <div className="mb-4">
                                    <h6 className="text-primary border-bottom pb-2 mb-3">
                                        <i className="bx bx-printer me-1"></i> Detalles de Impresión
                                    </h6>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Marca</Form.Label>
                                                <Form.Select 
                                                    value={detallesImpresora.marca}
                                                    onChange={(e) => setDetallesImpresora({...detallesImpresora, marca: e.target.value})}
                                                >
                                                    <option value="">Seleccione marca...</option>
                                                    {maestros.marcas.map(m => (
                                                        <option key={m.id} value={m.id}>{m.nombre}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Modelo de Tóner</Form.Label>
                                                <Form.Select 
                                                    value={detallesImpresora.toner_id}
                                                    onChange={(e) => setDetallesImpresora({...detallesImpresora, toner_id: e.target.value})}
                                                >
                                                    <option value="">Seleccione tóner...</option>
                                                    {maestros.tiposToner.map(t => (
                                                        <option key={t.id} value={t.id}>{t.nombre}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {/* Otros tipos (Escaner, etc) podrían añadirse aquí */}
                            {(!formGeneral.tipo_equipo || (String(formGeneral.tipo_equipo) !== "1" && String(formGeneral.tipo_equipo) !== "2")) && formGeneral.tipo_equipo && (
                                <div className="alert alert-info py-2">
                                    Este tipo de equipo no requiere detalles adicionales por ahora.
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={onHide}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loadingMaestros}>
                        {isEdit ? "Guardar Cambios" : "Registrar Equipo"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
