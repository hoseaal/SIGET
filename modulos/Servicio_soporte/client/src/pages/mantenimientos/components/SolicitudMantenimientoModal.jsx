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
    tipo_falla: z.string(),
    asunto: z.string().min(1, "Ingrese el asunto").max(200),
    descripcion: z.string().min(1, "Ingrese la descripción").max(1000),
    activeTab: z.string(),
}).refine((data) => {
    if (data.activeTab === 'general' && data.depto_destino_id && !data.tipo_falla) return false;
    return true;
}, { message: "Seleccione tipo de falla", path: ["tipo_falla"] })
.refine((data) => {
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
    const [tiposFalla, setTiposFalla] = useState([]);
    const [fetchingInitial, setFetchingInitial] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const { register, handleSubmit, formState: { errors }, control, reset, setValue, watch, getValues } = useForm({
        resolver: zodResolver(solicitudSchema),
        defaultValues: {
            nro_caso: '',
            direc_id: '',
            depto_destino_id: '',
            equipo_id: '',
            tipo_falla: '',
            asunto: '',
            descripcion: '',
            activeTab: 'general'
        }
    });

    const watchedDirecId = watch('direc_id');
    const watchedDeptoDestino = watch('depto_destino_id');
    const watchedEquipoId = watch('equipo_id');

    useEffect(() => {
        if (show && user) {
            fetchInitialData();
            setActiveTab('general');
            reset({
                nro_caso: '',
                direc_id: String(user.direc_id || ''),
                depto_destino_id: '',
                equipo_id: '',
                tipo_falla: '',
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
            const [deps, types] = await Promise.all([
                helpFetch.GET('/departamento'),
                helpFetch.GET('/tipo_act')
            ]);
            setDepartamentos(deps);
            setTiposFalla(types);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar datos maestros");
        } finally {
            setFetchingInitial(false);
        }
    };

    useEffect(() => {
        if (tiposFalla.length > 0) {
            if (activeTab === 'toner') {
                const targetType = tiposFalla.find(t =>
                    t.nombre.toLowerCase().includes('informe asignacion de toner') ||
                    t.nombre.toLowerCase().includes('toner')
                );
                if (targetType) {
                    setValue('tipo_falla', String(targetType.id));
                }
            } else {
                setValue('tipo_falla', '');
            }
        }
    }, [activeTab, tiposFalla, watchedDeptoDestino]);

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
            await helpFetch.POST('/mantenimiento', payload);
            toast.success("Solicitud registrada correctamente.");
            setActiveTab('general');
            reset({
                nro_caso: '',
                direc_id: String(user?.direc_id || ''),
                depto_destino_id: '',
                equipo_id: '',
                tipo_falla: '',
                asunto: '',
                descripcion: '',
                activeTab: 'general'
            });
            onSuccess();
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

    const getFilteredTiposFalla = () => {
        if (!watchedDeptoDestino) return [];
        return tiposFalla.filter(t => 
            String(t.depto_id) === String(watchedDeptoDestino) || 
            t.nombre.toUpperCase() === 'OTRO'
        );
    };

    const equipoOptions = [
        { value: '', label: '-- No aplica / No listado --' },
        ...getFilteredEquipos().map(e => ({
            value: e.id,
            label: `${e.nro_bien} - ${e.tipo_de_equipo || 'S/T'} - Marca: ${e.marca_nombre || 'S/M'}` + (e.modelo_nombre ? ' (' + e.modelo_nombre + ')' : '')
        }))
    ];

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
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
                            {esTecnico ? (
                                <Form.Group>
                                    <Form.Label>Departamento Afectado</Form.Label>
                                    <Form.Select
                                        {...register("direc_id")}
                                        isInvalid={!!errors.direc_id}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {departamentos.map(d => (
                                            <option key={d.id} value={d.id}>{d.nombre}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{errors.direc_id?.message}</Form.Control.Feedback>
                                </Form.Group>
                            ) : (
                                <div className="p-2 bg-light rounded border mb-2">
                                    <small className="text-muted d-block">Solicitante:</small>
                                    <strong>{user?.nombre}</strong>
                                    <small className="text-muted ms-3">Dpto:</small> {departamentos.find(d => d.id === user?.direc_id)?.nombre}
                                </div>
                            )}
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Departamento de Destino <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    {...register("depto_destino_id")}
                                    isInvalid={!!errors.depto_destino_id}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {departamentos.map(d => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.depto_destino_id?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    {activeTab === 'general' && watchedDeptoDestino && (
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo de Requerimiento / Falla <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                {...register("tipo_falla")}
                                isInvalid={!!errors.tipo_falla}
                            >
                                <option value="">-- Seleccionar --</option>
                                {getFilteredTiposFalla().map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.tipo_falla?.message}</Form.Control.Feedback>
                        </Form.Group>
                    )}

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
                                    onChange={(opt) => field.onChange(opt ? opt.value : '')}
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
                    <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner size="sm" animation="border" className="me-1" /> : <i className="bx bx-send me-1"></i>}
                        Enviar Reporte
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
