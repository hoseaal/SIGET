import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import Select from "react-select";
import helpFetch from "../../../utils/helpFetch";

export const RegistroActividadModal = ({ show, onHide, onSuccess, user }) => {
    const [loading, setLoading] = useState(false);
    const [departamentos, setDepartamentos] = useState([]);
    const [tiposAct, setTiposAct] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [fetchingInitial, setFetchingInitial] = useState(false);

    const [formData, setFormData] = useState({
        nro_act: "",
        fecha: new Date().toISOString().split("T")[0],
        direc_id: "",
        equipo_id: "",
        tipo_act: "",
        clasificacion_id: "",
        observaciones: ""
    });

    const clasificaciones = [
        { id: 1, nombre: "MANT. PREVENTIVO - SOFTWARE" },
        { id: 2, nombre: "MANT. PREVENTIVO - HARDWARE" },
        { id: 3, nombre: "MANT. CORRECTIVO - SOFTWARE" },
        { id: 4, nombre: "MANT. CORRECTIVO - HARDWARE" },
        { id: 5, nombre: "PLAT. TECNOLOGICA - SERVICIOS / REDES" },
        { id: 6, nombre: "PLAT. TECNOLOGICA - INFORMES" }
    ];

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
            setFormData(prev => ({ ...prev, nro_act: nextNum.numero }));
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
            // Filtrar equipos por departamento
            setEquipos(data.filter(e => e.direc_id === parseInt(deptoId)));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (show) {
            fetchInitialData();
        }
    }, [show]);

    useEffect(() => {
        if (formData.direc_id) {
            fetchEquipos(formData.direc_id);
        } else {
            setEquipos([]);
        }
    }, [formData.direc_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (selectedOption) => {
        setFormData(prev => ({ 
            ...prev, 
            equipo_id: selectedOption ? selectedOption.value : "" 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.direc_id || !formData.tipo_act || !formData.clasificacion_id) {
            toast.warning("Por favor complete los campos obligatorios.");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
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
            <Form onSubmit={handleSubmit}>
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
                                            name="nro_act" 
                                            value={formData.nro_act} 
                                            onChange={handleChange} 
                                            required 
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
                                            name="fecha" 
                                            value={formData.fecha} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Departamento Solicitante</Form.Label>
                                        <Form.Select 
                                            name="direc_id" 
                                            value={formData.direc_id} 
                                            onChange={handleChange} 
                                            required
                                        >
                                            <option value="">-- Seleccionar Departamento --</option>
                                            {departamentos.map(d => (
                                                <option key={d.id} value={d.id}>{d.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Tipo de Actividad (Descripción del Reporte)</Form.Label>
                                        <Form.Select 
                                            name="tipo_act" 
                                            value={formData.tipo_act} 
                                            onChange={handleChange} 
                                            required
                                        >
                                            <option value="">-- Seleccionar Tipo de Falla/Actividad --</option>
                                            {tiposAct.map(t => (
                                                <option key={t.id} value={t.id}>{t.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="bg-light p-3 rounded border mb-4">
                                <h6 className="fw-bold small text-muted mb-3 text-uppercase">Clasificación para Historial SM</h6>
                                <Row>
                                    <Col md={4}>
                                        <div className="fw-bold small mb-2 border-bottom">Mant. Preventivo</div>
                                        <Form.Check 
                                            type="checkbox" 
                                            label="Software" 
                                            checked={formData.clasificacion_id === 1} 
                                            onChange={() => setFormData(prev => ({ ...prev, clasificacion_id: 1 }))}
                                            id="chk-prev-sw"
                                        />
                                        <Form.Check 
                                            type="checkbox" 
                                            label="Hardware" 
                                            checked={formData.clasificacion_id === 2} 
                                            onChange={() => setFormData(prev => ({ ...prev, clasificacion_id: 2 }))}
                                            id="chk-prev-hw"
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <div className="fw-bold small mb-2 border-bottom">Mant. Correctivo</div>
                                        <Form.Check 
                                            type="checkbox" 
                                            label="Software" 
                                            checked={formData.clasificacion_id === 3} 
                                            onChange={() => setFormData(prev => ({ ...prev, clasificacion_id: 3 }))}
                                            id="chk-corr-sw"
                                        />
                                        <Form.Check 
                                            type="checkbox" 
                                            label="Hardware" 
                                            checked={formData.clasificacion_id === 4} 
                                            onChange={() => setFormData(prev => ({ ...prev, clasificacion_id: 4 }))}
                                            id="chk-corr-hw"
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <div className="fw-bold small mb-2 border-bottom">Plat. Tecnológica</div>
                                        <Form.Check 
                                            type="checkbox" 
                                            label="Servicios / Redes" 
                                            checked={formData.clasificacion_id === 5} 
                                            onChange={() => setFormData(prev => ({ ...prev, clasificacion_id: 5 }))}
                                            id="chk-plat-serv"
                                        />
                                        <Form.Check 
                                            type="checkbox" 
                                            label="Informes" 
                                            checked={formData.clasificacion_id === 6} 
                                            onChange={() => setFormData(prev => ({ ...prev, clasificacion_id: 6 }))}
                                            id="chk-plat-inf"
                                        />
                                    </Col>
                                </Row>
                            </div>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">Equipo / Bien Mueble (Opcional)</Form.Label>
                                <Select
                                    placeholder="Buscar por Nro. Bien..."
                                    isClearable
                                    options={equipos.map(e => ({ 
                                        value: e.id, 
                                        label: `${e.nro_bien} - ${e.nombre || e.tipo_nombre || 'Equipo'}` 
                                    }))}
                                    onChange={handleSelectChange}
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
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label className="fw-semibold">Observaciones / Solución</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={4} 
                                    name="observaciones" 
                                    value={formData.observaciones} 
                                    onChange={handleChange}
                                    placeholder="Describa brevemente la labor realizada..."
                                />
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
