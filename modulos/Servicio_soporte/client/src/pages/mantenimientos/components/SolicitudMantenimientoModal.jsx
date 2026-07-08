import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import helpFetch from '../../../utils/helpFetch';
import { Nav } from 'react-bootstrap';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const solicitudSchema = z.object({
    nro_caso: z.string(),
    direc_id: z.string().min(1, "Seleccione departamento"),
    depto_destino_id: z.string().min(1, "Seleccione departamento destino"),
    equipo_id: z.string(),
    asunto: z.string().min(1, "Ingrese el asunto").max(200),
    descripcion: z.string().min(1, "Ingrese la descripción").max(1000),
    activeTab: z.string(),
}).refine((data) => {
        if (data.activeTab === 'toner' && !data.nro_caso?.trim()) return false;
        return true;
    }, { message: "Ingrese el número de oficio", path: ["nro_caso"] })
    .refine((data) => {
        if (data.activeTab === 'toner' && !data.equipo_id) return false;
        return true;
    }, { message: "Seleccione el equipo (impresora)", path: ["equipo_id"] });

export const SolicitudMantenimientoModal = ({ show, onHide, onSuccess, user }) => {
    const [loading, setLoading] = useState(false);
    const [equipos, setEquipos] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [fetchingInitial, setFetchingInitial] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [codigoGenerado, setCodigoGenerado] = useState(null);

    const isAdmin = user?.rol_id === 1;

    const { register, handleSubmit, formState: { errors }, control, reset, setValue, watch, getValues } = useForm({
        resolver: zodResolver(solicitudSchema),
        defaultValues: {
            nro_caso: '',
            direc_id: '',
            depto_destino_id: '',
            equipo_id: '',
            asunto: '',
            descripcion: '',
            activeTab: 'general'
        }
    });

    const watchedDirecId = watch('direc_id');

    useEffect(() => {
        if (show && user) {
            fetchInitialData();
            setActiveTab('general');
            reset({
                nro_caso: '',
                direc_id: String(user.direc_id || ''),
                depto_destino_id: isAdmin ? '' : '14',
                equipo_id: '',
                asunto: '',
                descripcion: '',
                activeTab: 'general'
            });
        }
    }, [show, user]);

    useEffect(() => {
        if (watchedDirecId) {
            fetchEquipos(watchedDirecId);
        }
    }, [watchedDirecId]);

    const fetchInitialData = async () => {
        try {
            setFetchingInitial(true);
            const deps = await helpFetch.GET('/departamento');
            setDepartamentos(deps);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar datos maestros");
        } finally {
            setFetchingInitial(false);
        }
    };

    const fetchEquipos = async (deptoId) => {
        try {
            const data = await helpFetch.GET('/equipo');
            setEquipos(data.filter(e => e.direc_id === parseInt(deptoId)));
        } catch (error) {
            console.error(error);
        }
    };

    const isTonerReport = () => {
        return activeTab === 'toner';
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const payload = {
                ...data,
                nro_caso: activeTab === 'toner' ? data.nro_caso : undefined,
                usuario_id: user.usuario_id
            };
            const result = await helpFetch.POST('/mantenimiento', payload);
            const code = result?.data?.codigo_entrega;
            setCodigoGenerado(code);
            toast.success("Solicitud registrada correctamente.");
            setActiveTab('general');
            reset({
                nro_caso: '',
                direc_id: String(user?.direc_id || ''),
                depto_destino_id: isAdmin ? '' : '14',
                equipo_id: '',
                asunto: '',
                descripcion: '',
                activeTab: 'general'
            });
        } catch (error) {
            console.error(error);
            let userMsg = "Error al registrar la solicitud.";
            try {
                if (error.message.includes('{')) {
                    const rawMsg = error.message.substring(error.message.indexOf('{'));
                    const jsonErr = JSON.parse(rawMsg);
                    if (jsonErr && jsonErr.message) {
                        userMsg = jsonErr.message;
                    }
                }
            } catch (e) {
                console.error(e);
            }
            toast.error(userMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (k) => {
        setActiveTab(k);
        setValue('activeTab', k);
    };

    const esTecnico = user?.rol_id === 1 || user?.rol_id === 2;

    const getFilteredEquipos = () => {
        let filtered = [...equipos];
        if (isTonerReport()) {
            filtered = filtered.filter(e => e.tipo_de_equipo?.toLowerCase().includes('impresora'));
        }
        return filtered;
    };

    const equipoOptions = [
        { value: '', label: '-- No aplica / No listado --' },
        ...getFilteredEquipos().map(e => ({
            value: String(e.id),
            label: `${e.nro_bien} - ${e.tipo_de_equipo || 'S/T'} - Marca: ${e.marca_nombre || 'S/M'}` + (e.modelo_nombre ? ' (' + e.modelo_nombre + ')' : '')
        }))
    ];

    const handleClose = () => {
        setCodigoGenerado(null);
        if (codigoGenerado) {
            onSuccess();
        } else {
            onHide();
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{esTecnico ? 'Registrar Mantenimiento (Admin/Técnico)' : 'Reportar Falla / Mantenimiento'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    <Nav variant="pills" activeKey={activeTab} onSelect={(k) => handleTabChange(k)} className="d-flex justify-content-center mb-4">
                        <Nav.Item>
                            <Nav.Link eventKey="general" className="fw-bold px-4">
                                <i className="bx bx-wrench me-1"></i> Mantenimiento General
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="toner" className="fw-bold px-4">
                                <i className="bx bx-droplet me-1"></i> Solicitud de Tóner
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Row className="mb-3">
                        <Col md={12}>
                            {fetchingInitial ? (
                                <div className="text-center p-2"><Spinner size="sm" /></div>
                            ) : (
                                <div className="p-2 px-3 bg-light rounded border border-primary border-opacity-25 mb-2 d-flex align-items-center">
                                    <i className={`bx ${activeTab === 'toner' ? 'bx-droplet text-primary' : 'bx-cog text-secondary'} fs-4 me-2`}></i>
                                    <div>
                                        <span className="fw-bold">
                                            {activeTab === 'toner' ? 'REPORTE DE TÓNER / CONSUMIBLE' : 'MANTENIMIENTO GENERAL'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Departamento Afectado</Form.Label>
                                <Controller
                                    name="direc_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Form.Select
                                            {...field}
                                            disabled={!isAdmin}
                                            isInvalid={!!errors.direc_id}
                                        >
                                            <option value="">Seleccione departamento...</option>
                                            {departamentos.map(dep => (
                                                <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    )}
                                />
                                <Form.Control.Feedback type="invalid">{errors.direc_id?.message}</Form.Control.Feedback>
                                {!isAdmin && <Form.Text className="text-muted">Asignado automáticamente por su perfil.</Form.Text>}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Departamento de Destino <span className="text-danger">*</span></Form.Label>
                                <Controller
                                    name="depto_destino_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Form.Select
                                            {...field}
                                            isInvalid={!!errors.depto_destino_id}
                                        >
                                            <option value="">-- Seleccionar --</option>
                                            {departamentos
                                                .filter(d => d.id === 14)
                                                .map(d => (
                                                    <option key={d.id} value={d.id}>{d.nombre}</option>
                                                ))}
                                        </Form.Select>
                                    )}
                                />
                                <Form.Control.Feedback type="invalid">{errors.depto_destino_id?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    {activeTab === 'toner' && (
                        <Form.Group className="mb-3">
                            <Form.Label>Nro. de Oficio <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                {...register("nro_caso")}
                                placeholder="Ej: DDRRHH-O-087-2026"
                                isInvalid={!!errors.nro_caso}
                            />
                            <Form.Control.Feedback type="invalid">{errors.nro_caso?.message}</Form.Control.Feedback>
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>
                            {activeTab === 'toner' ? (
                                <>Seleccionar Equipo (Impresora) <span className="text-danger">*</span></>
                            ) : (
                                'Seleccionar Equipo (Opcional)'
                            )}
                        </Form.Label>
                        <Controller
                            name="equipo_id"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={equipoOptions}
                                    placeholder="Escriba Nro. Bien o Tipo para buscar..."
                                    isClearable
                                    onChange={(opt) => field.onChange(opt ? String(opt.value) : '')}
                                    value={equipoOptions.find(opt => opt.value === field.value) || null}
                                    noOptionsMessage={() => activeTab === 'toner' ? 'No hay impresoras registradas en este departamento' : 'No se encontraron equipos'}
                                    styles={activeTab === 'toner' && !!errors.equipo_id ? {
                                        control: (base) => ({ ...base, borderColor: '#dc3545' })
                                    } : undefined}
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
                            <div className="text-danger" style={{ fontSize: '0.85em', marginTop: '4px' }}>
                                {errors.equipo_id.message}
                            </div>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Asunto / Título Breve</Form.Label>
                        <Form.Control
                            {...register("asunto")}
                            placeholder="Ej: Monitor no enciende, No hay internet..."
                            isInvalid={!!errors.asunto}
                        />
                        <Form.Control.Feedback type="invalid">{errors.asunto?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Descripción Detallada</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            {...register("descripcion")}
                            placeholder="Describa el problema lo más detallado posible..."
                            isInvalid={!!errors.descripcion}
                        />
                        <Form.Control.Feedback type="invalid">{errors.descripcion?.message}</Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    {codigoGenerado ? (
                        <>
                            <div className="w-100 text-center mb-2">
                                <div className="alert alert-success py-3 px-4 mb-3">
                                    <i className="bx bx-check-circle fs-3 d-block mb-2"></i>
                                    <h6 className="fw-bold mb-2">¡Solicitud registrada con éxito!</h6>
                                    <p className="mb-2">Su código de seguridad para entregar el equipo es:</p>
                                    <div className="d-inline-block bg-dark text-warning fw-bold fs-3 px-4 py-2 rounded-3 border border-warning">
                                        <i className="bx bx-lock-alt me-2"></i>{codigoGenerado}
                                    </div>

                                </div>
                            </div>
                            <Button variant="secondary" onClick={handleClose}>
                                Cerrar
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? <Spinner size="sm" animation="border" className="me-1" /> : <i className="bx bx-send me-1"></i>}
                                Enviar Reporte
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
