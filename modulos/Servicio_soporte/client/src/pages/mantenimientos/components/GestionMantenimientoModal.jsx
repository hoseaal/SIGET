import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge, Spinner, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import helpFetch from '../../../utils/helpFetch';
import { FichaTecnicaEquipoInline } from '../../equipos/components/FichaTecnicaEquipoInline';
import { exportInformeTonerPDF } from '../../../utils/exportInformeTonerPDF';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const gestionSchema = z.object({
    status: z.string().min(1, "Debe seleccionar un estado"),
    prioridad: z.string().optional(),
    diagnostico: z.string().optional(),
    solucion: z.string().optional(),
    tipo_falla: z.string().optional(),
    clasificacion_id: z.number().nullable().optional(),
    codigo_validacion: z.string().optional(),
}).refine((data) => {
    if (data.status === '7' && !data.tipo_falla) return false;
    return true;
}, { message: "Seleccione tipo de actividad", path: ["tipo_falla"] })
.refine((data) => {
    if (data.status === '7' && (data.clasificacion_id === null || data.clasificacion_id === undefined)) return false;
    return true;
}, { message: "Seleccione clasificación", path: ["clasificacion_id"] })
.refine((data) => {
    if (data.status === '7' && (!data.codigo_validacion || !data.codigo_validacion.trim())) return false;
    return true;
}, { message: "Ingrese el código de seguridad del usuario", path: ["codigo_validacion"] });

export const GestionMantenimientoModal = ({ show, onHide, onSuccess, mantenimiento, isTechnical }) => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [tiposAct, setTiposAct] = useState([]);
    const [equipoData, setEquipoData] = useState(null);
    const [fetchingEquipo, setFetchingEquipo] = useState(false);
    const [activeTab, setActiveTab] = useState('gestion');

    const { register, handleSubmit, formState: { errors }, control, reset, watch } = useForm({
        resolver: zodResolver(gestionSchema),
        defaultValues: {
            status: '',
            prioridad: 'Media',
            diagnostico: '',
            solucion: '',
            tipo_falla: '',
            clasificacion_id: null,
            codigo_validacion: '',
        }
    });

    useEffect(() => {
        if (show && mantenimiento) {
            reset({
                status: String(mantenimiento.status || ''),
                prioridad: mantenimiento.prioridad || 'Media',
                diagnostico: mantenimiento.diagnostico || '',
                solucion: mantenimiento.solucion || '',
                clasificacion_id: mantenimiento.clasificacion_id || null,
                tipo_falla: String(mantenimiento.tipo_falla || '')
            });
            fetchInitialData();
        }
    }, [show, mantenimiento]);

    const fetchInitialData = async () => {
        try {
            setFetchingEquipo(true);
            const [userRes, typesRes, equiposRes] = await Promise.all([
                fetch('/api/auth/verify-auth', { credentials: 'include' }),
                helpFetch.GET('/tipo_act'),
                helpFetch.GET('/equipo')
            ]);

            const userData = await userRes.json();
            if (userData.success) setUser(userData.user);
            if (isTechnical) setTiposAct(typesRes);

            if (mantenimiento?.equipo_nro_bien && mantenimiento.equipo_nro_bien !== 'N/A') {
                const found = equiposRes.find(eq => eq.nro_bien === mantenimiento.equipo_nro_bien);
                setEquipoData(found || null);
            }
        } catch (error) {
            console.error("Error al inicializar datos del modal:", error);
        } finally {
            setFetchingEquipo(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const payload = {
                ...data,
                usuario_tecnico_id: user?.usuario_id
            };

            await helpFetch.PUT(`/mantenimiento/${mantenimiento.id}/status`, payload);
            toast.success("Gestión actualizada correctamente.");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al actualizar el mantenimiento.");
        } finally {
            setLoading(false);
        }
    };

    if (!mantenimiento) return null;

    const isEntregado = parseInt(mantenimiento.status) === 7;

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Detalle de Mantenimiento: Oficio {mantenimiento.nro_caso}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-4">
                    <Col md={6}>
                        <div className="mb-2"><strong>Tipo Reportado:</strong> {mantenimiento.tipo_falla_nombre}</div>
                        <div className="mb-2"><strong>Reportado por:</strong> {mantenimiento.usuario_reporta}</div>
                        <div className="mb-2"><strong>Depto:</strong> {mantenimiento.depto_nombre}</div>
                    </Col>
                    <Col md={6}>
                        <div className="mb-2"><strong>Asunto:</strong> {mantenimiento.asunto}</div>
                        <div className="mb-2"><strong>Fecha Reporte:</strong> {new Date(mantenimiento.fecha_solicitud).toLocaleString()}</div>
                        <div className="mb-2"><strong>Equipo:</strong> {mantenimiento.equipo_nro_bien || 'N/A'}</div>
                    </Col>
                    <Col md={12} className="mt-2">
                        <div className="p-3 bg-light rounded border">
                            <strong>Descripción de la falla:</strong>
                            <p className="mb-0 mt-1">{mantenimiento.descripcion}</p>
                        </div>
                    </Col>
                </Row>

                <hr />

                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    id="gestion-mantenimiento-tabs"
                    className="mb-4 nav-fill"
                    variant="pills"
                >
                    <Tab eventKey="gestion" title={<span><i className="bx bx-wrench me-1"></i> Gestión de Caso</span>}>
                        <div className="pt-2">
                            {isTechnical ? (
                                <>
                                    <h6 className="fw-bold mb-3"><i className="bx bx-cog me-1"></i> Acción Técnica</h6>
                                    {isEntregado && (
                                        <div className="alert alert-warning py-2 mb-3">
                                            <i className="bx bx-lock-alt me-1"></i> Este mantenimiento ya ha sido finalizado y entregado. Los datos no pueden ser modificados.
                                        </div>
                                    )}
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Estado</Form.Label>
                                                <Form.Select 
                                                    {...register("status")}
                                                    disabled={isEntregado}
                                                    isInvalid={!!errors.status}
                                                >
                                                    <option value="2">Pendiente</option>
                                                    <option value="3">En Proceso / Reparación</option>
                                                    <option value="7">Finalizado / Resuelto</option>
                                                    <option value="8">Anulado</option>
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">{errors.status?.message}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Prioridad</Form.Label>
                                                <Form.Select 
                                                    {...register("prioridad")}
                                                    disabled={isEntregado}
                                                >
                                                    <option value="Baja">Baja</option>
                                                    <option value="Media">Media</option>
                                                    <option value="Alta">Alta</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Diagnóstico</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            {...register("diagnostico")}
                                            placeholder="Describa el diagnóstico técnico..."
                                            disabled={isEntregado}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Solución Aplicada</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            {...register("solucion")}
                                            placeholder="Describa qué se hizo para resolver la falla..."
                                            disabled={isEntregado}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold text-primary">Confirmar Tipo de Actividad / Falla <span className="text-danger">*</span></Form.Label>
                                        <Form.Select 
                                            {...register("tipo_falla")}
                                            disabled={isEntregado}
                                            isInvalid={!!errors.tipo_falla}
                                        >
                                            <option value="">-- Seleccionar el tipo de falla detectada --</option>
                                            {tiposAct.map(t => (
                                                <option key={t.id} value={t.id}>{t.nombre}</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.tipo_falla?.message}</Form.Control.Feedback>
                                    </Form.Group>

                                    <div className="bg-light p-3 rounded border mb-3">
                                        <h6 className="fw-bold small text-muted mb-3 text-uppercase">Clasificación para Reporte de Actividades <span className="text-danger">*</span></h6>
                                        <Row>
                                            <Col md={4}>
                                                <div className="fw-bold small mb-2 border-bottom">Mant. Preventivo</div>
                                                <Controller
                                                    name="clasificacion_id"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <>
                                                            <Form.Check 
                                                                type="checkbox" 
                                                                label="Software" 
                                                                checked={field.value === 1} 
                                                                onChange={() => field.onChange(field.value === 1 ? null : 1)}
                                                                id="chk-prev-sw"
                                                                disabled={isEntregado}
                                                            />
                                                            <Form.Check 
                                                                type="checkbox" 
                                                                label="Hardware" 
                                                                checked={field.value === 2} 
                                                                onChange={() => field.onChange(field.value === 2 ? null : 2)}
                                                                id="chk-prev-hw"
                                                                disabled={isEntregado}
                                                            />
                                                        </>
                                                    )}
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <div className="fw-bold small mb-2 border-bottom">Mant. Correctivo</div>
                                                <Controller
                                                    name="clasificacion_id"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <>
                                                            <Form.Check 
                                                                type="checkbox" 
                                                                label="Software" 
                                                                checked={field.value === 3} 
                                                                onChange={() => field.onChange(field.value === 3 ? null : 3)}
                                                                id="chk-corr-sw"
                                                                disabled={isEntregado}
                                                            />
                                                            <Form.Check 
                                                                type="checkbox" 
                                                                label="Hardware" 
                                                                checked={field.value === 4} 
                                                                onChange={() => field.onChange(field.value === 4 ? null : 4)}
                                                                id="chk-corr-hw"
                                                                disabled={isEntregado}
                                                            />
                                                        </>
                                                    )}
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <div className="fw-bold small mb-2 border-bottom">Plat. Tecnológica</div>
                                                <Controller
                                                    name="clasificacion_id"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <>
                                                            <Form.Check 
                                                                type="checkbox" 
                                                                label="Servicios / Redes" 
                                                                checked={field.value === 5} 
                                                                onChange={() => field.onChange(field.value === 5 ? null : 5)}
                                                                id="chk-plat-serv"
                                                                disabled={isEntregado}
                                                            />
                                                            <Form.Check 
                                                                type="checkbox" 
                                                                label="Informes" 
                                                                checked={field.value === 6} 
                                                                onChange={() => field.onChange(field.value === 6 ? null : 6)}
                                                                id="chk-plat-inf"
                                                                disabled={isEntregado}
                                                            />
                                                        </>
                                                    )}
                                                />
                                            </Col>
                                        </Row>
                                        {errors.clasificacion_id && (
                                            <div className="text-danger small mt-2">{errors.clasificacion_id.message}</div>
                                        )}
                                    </div>
                                    {(parseInt(watch('status')) === 7 && !isEntregado) && (
                                        <>
                                            <div className="alert alert-info py-2">
                                                <i className="bx bx-info-circle me-1"></i> Al finalizar, se registrará la actividad en el historial y el caso se cerrará permanentemente.
                                            </div>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="fw-bold text-warning">
                                                    <i className="bx bx-lock-alt me-1"></i> Código de Seguridad del Usuario <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    {...register("codigo_validacion")}
                                                    placeholder="Ingrese el código de 6 dígitos proporcionado por el usuario"
                                                    isInvalid={!!errors.codigo_validacion}
                                                    maxLength={6}
                                                    className="border-warning"
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.codigo_validacion?.message}</Form.Control.Feedback>
                                                <Form.Text className="text-muted">Solicite al usuario el código de seguridad que se le mostró al crear el caso.</Form.Text>
                                            </Form.Group>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <h6 className="fw-bold mb-3"><i className="bx bx-info-circle me-1"></i> Información del Caso</h6>
                                    <div className="mb-3">
                                        <strong>Estatus Actual:</strong>
                                        <Badge bg="primary" className="ms-2">{mantenimiento.status_nombre}</Badge>
                                    </div>
                                    {mantenimiento.diagnostico && (
                                        <div className="mb-3">
                                            <strong>Diagnóstico Técnico:</strong>
                                            <p className="mt-1">{mantenimiento.diagnostico}</p>
                                        </div>
                                    )}
                                    {mantenimiento.solucion && (
                                        <div className="mb-3">
                                            <strong>Solución:</strong>
                                            <p className="mt-1">{mantenimiento.solucion}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </Tab>
                    {mantenimiento.equipo_nro_bien && mantenimiento.equipo_nro_bien !== 'N/A' && (
                        <Tab eventKey="ficha" title={<span><i className="bx bx-file me-1"></i> Ficha Técnica del Equipo</span>}>
                            <div className="pt-2">
                                {fetchingEquipo ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted small">Cargando detalles del equipo...</p>
                                    </div>
                                ) : (
                                    <FichaTecnicaEquipoInline equipo={equipoData} />
                                )}
                            </div>
                        </Tab>
                    )}
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                {(mantenimiento.tipo_falla === 10 || mantenimiento.tipo_falla === 14) && (
                    <Button variant="danger" className="me-auto" onClick={() => exportInformeTonerPDF(mantenimiento, user)}>
                        <i className="bx bx-file-pdf me-1"></i> Exportar Informe
                    </Button>
                )}
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
                {(isTechnical && !isEntregado) && (
                    <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={loading}>
                        {loading ? <Spinner size="sm" animation="border" className="me-1" /> : <i className="bx bx-save me-1"></i>}
                        Guardar Cambios
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};
