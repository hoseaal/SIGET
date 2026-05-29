import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge, Spinner, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import helpFetch from '../../../utils/helpFetch';
import { generateTransferPDF } from '../../../utils/ReporteTransferencia';
import { FichaTecnicaEquipoInline } from '../../equipos/components/FichaTecnicaEquipoInline';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const gestionTransferenciaSchema = z.object({
    status: z.string().min(1, "Debe seleccionar un estado"),
    prioridad: z.string().optional(),
    diagnostico_tecnico: z.string().optional(),
    solucion_tecnica: z.string().optional(),
    tipo_act: z.string().optional(),
    clasificacion_id: z.number().nullable().optional(),
    codigo_validacion: z.string().optional(),
}).refine((data) => {
    if (data.status === '7' && !data.tipo_act) return false;
    return true;
}, { message: "Seleccione tipo de actividad", path: ["tipo_act"] })
.refine((data) => {
    if (data.status === '7' && (data.clasificacion_id === null || data.clasificacion_id === undefined)) return false;
    return true;
}, { message: "Seleccione clasificación", path: ["clasificacion_id"] })
.refine((data) => {
    if (data.status === '7' && !data.codigo_validacion?.trim()) return false;
    return true;
}, { message: "Ingrese código de validación", path: ["codigo_validacion"] });

/**
 * Modal para que el técnico gestione la transferencia.
 * Soporta recepción (cambio de status y prioridad) y entrega (diagnóstico y solución).
 */
export const GestionTransferenciaModal = ({ show, onHide, onSuccess, transferencia }) => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [tiposAct, setTiposAct] = useState([]);
    const [fetchingInitial, setFetchingInitial] = useState(false);

    // Equipment detail states
    const [equipoData, setEquipoData] = useState(null);
    const [fetchingEquipo, setFetchingEquipo] = useState(false);
    const [activeTab, setActiveTab] = useState('gestion');

    const { register, handleSubmit, formState: { errors }, control, reset, watch } = useForm({
        resolver: zodResolver(gestionTransferenciaSchema),
        defaultValues: {
            status: '',
            prioridad: 'Media',
            diagnostico_tecnico: '',
            solucion_tecnica: '',
            codigo_validacion: '',
            clasificacion_id: null,
            tipo_act: ''
        }
    });

    const watchedStatus = watch('status');

    useEffect(() => {
        if (show && transferencia) {
            reset({
                status: String(transferencia.status || ''),
                prioridad: transferencia.prioridad || 'Media',
                diagnostico_tecnico: transferencia.diagnostico_tecnico || '',
                solucion_tecnica: transferencia.solucion_tecnica || '',
                codigo_validacion: '',
                clasificacion_id: transferencia.clasificacion_id || null,
                tipo_act: String(transferencia.tipo_act || '')
            });
            fetchInitialData();
        }
    }, [show, transferencia]);

    const fetchInitialData = async () => {
        try {
            setFetchingInitial(true);
            setFetchingEquipo(true);
            const [userRes, typesRes, equiposRes] = await Promise.all([
                fetch('/api/auth/verify-auth', { credentials: 'include' }),
                helpFetch.GET('/tipo_act'),
                helpFetch.GET('/equipo')
            ]);

            const userData = await userRes.json();
            if (userData.success) setUser(userData.user);
            setTiposAct(typesRes);

            if (transferencia?.equipo_nro_bien) {
                const found = equiposRes.find(eq => eq.nro_bien === transferencia.equipo_nro_bien);
                setEquipoData(found || null);
            }
        } catch (error) {
            console.error("Error al inicializar datos del modal:", error);
        } finally {
            setFetchingInitial(false);
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

            // Lógica automática de fechas
            if (parseInt(data.status) === 3) { // Recibido
                payload.fecha_recepcion = new Date().toISOString().slice(0, 19).replace('T', ' ');
            }
            if (parseInt(data.status) === 7) { // Entregado
                payload.fecha_entrega = new Date().toISOString().slice(0, 19).replace('T', ' ');
            }

            await helpFetch.PUT(`/transferencia/${transferencia.id}/status`, payload);
            toast.success("Gestión actualizada correctamente.");

            // Si el estado es Entregado, generar el PDF automáticamente
            if (data.status == 7) {
                generateTransferPDF({
                    ...transferencia,
                    diagnostico_tecnico: data.diagnostico_tecnico,
                    solucion_tecnica: data.solucion_tecnica
                }, { nombre: user?.nombre || 'Técnico de Soporte' });
            }

            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al actualizar la transferencia.");
        } finally {
            setLoading(false);
        }
    };

    if (!transferencia) return null;

    const isEntregado = parseInt(transferencia.status) === 7;

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Gestionar Transferencia: {transferencia.nro_caso}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-4">
                    <Col md={6}>
                        <div className="mb-2 d-flex align-items-center gap-2">
                            <span><strong>Equipo:</strong> {transferencia.equipo_nro_bien}</span>
                        </div>
                        <div className="mb-2"><strong>Origen:</strong> {transferencia.origen_nombre}</div>
                        <div className="mb-2"><strong>Usuario:</strong> {transferencia.usuario_crea}</div>
                    </Col>
                    <Col md={6}>
                        <div className="mb-2"><strong>Asunto:</strong> {transferencia.asunto}</div>
                        <div className="mb-2"><strong>Fecha Solicitud:</strong> {new Date(transferencia.fecha).toLocaleString()}</div>
                        <div className="mb-2">
                            <strong>Obs. Usuario:</strong> {transferencia.observaciones || 'Ninguna'}
                        </div>
                    </Col>
                </Row>

                <hr />

                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    id="gestion-transferencia-tabs"
                    className="mb-4 nav-fill"
                    variant="pills"
                >
                    <Tab eventKey="gestion" title={<span><i className="bx bx-wrench me-1"></i> Gestión de Caso</span>}>
                        <div className="pt-2">
                            <h6 className="fw-bold mb-3"><i className="bx bx-cog me-1"></i> Acción Técnica</h6>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Estado de la Transferencia</Form.Label>
                                        <Form.Select {...register("status")} disabled={isEntregado} isInvalid={!!errors.status}>
                                            <option value="2">Pendiente (Sin recibir)</option>
                                            <option value="3">Recibido (En Soporte)</option>
                                            <option value="4">En Revisión</option>
                                            <option value="5">En Reparación</option>
                                            <option value="6">Listo para Entrega</option>
                                            <option value="7">Entregado / Finalizado</option>
                                            <option value="8">Anulado</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.status?.message}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Prioridad Asignada</Form.Label>
                                        <Form.Select {...register("prioridad")} disabled={isEntregado}>
                                            <option value="Baja">Baja</option>
                                            <option value="Media">Media</option>
                                            <option value="Alta">Alta</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Diagnóstico Técnico</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    {...register("diagnostico_tecnico")}
                                    placeholder="Describa los hallazgos técnicos..."
                                    disabled={isEntregado}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Reporte de Solución / Entrega</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    {...register("solucion_tecnica")}
                                    placeholder="Describa el mantenimiento realizado y el estado final del equipo..."
                                    disabled={isEntregado}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold text-primary">Tipo de Actividad / Falla <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    {...register("tipo_act")}
                                    disabled={isEntregado}
                                    isInvalid={!!errors.tipo_act}
                                >
                                    <option value="">-- Seleccionar el tipo de falla detectada --</option>
                                    {tiposAct.map(t => (
                                        <option key={t.id} value={t.id}>{t.nombre}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.tipo_act?.message}</Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    Esta información es necesaria para el reporte de actividades institucional.
                                </Form.Text>
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
                                                        id="chk-tra-prev-sw"
                                                        disabled={isEntregado}
                                                    />
                                                    <Form.Check
                                                        type="checkbox"
                                                        label="Hardware"
                                                        checked={field.value === 2}
                                                        onChange={() => field.onChange(field.value === 2 ? null : 2)}
                                                        id="chk-tra-prev-hw"
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
                                                        id="chk-tra-corr-sw"
                                                        disabled={isEntregado}
                                                    />
                                                    <Form.Check
                                                        type="checkbox"
                                                        label="Hardware"
                                                        checked={field.value === 4}
                                                        onChange={() => field.onChange(field.value === 4 ? null : 4)}
                                                        id="chk-tra-corr-hw"
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
                                                        id="chk-tra-plat-serv"
                                                        disabled={isEntregado}
                                                    />
                                                    <Form.Check
                                                        type="checkbox"
                                                        label="Informes"
                                                        checked={field.value === 6}
                                                        onChange={() => field.onChange(field.value === 6 ? null : 6)}
                                                        id="chk-tra-plat-inf"
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

                            {watchedStatus == 7 && transferencia.status != 7 && (
                                <div className="bg-light p-3 rounded mb-3 border border-success">
                                    <Form.Group>
                                        <Form.Label className="text-success fw-bold">Código de Validación de Entrega <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("codigo_validacion")}
                                            placeholder="Ingrese el código proporcionado por el usuario"
                                            maxLength={6}
                                            className="form-control-lg text-center fw-bold"
                                            style={{ letterSpacing: '5px' }}
                                            isInvalid={!!errors.codigo_validacion}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.codigo_validacion?.message}</Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Este código es obligatorio para finalizar la entrega y debe ser proporcionado por el usuario solicitante.
                                        </Form.Text>
                                    </Form.Group>
                                </div>
                            )}

                            {watchedStatus == 7 && transferencia.status != 7 && (
                                <div className="alert alert-success d-flex align-items-center">
                                    <i className="bx bx-check-circle me-2"></i>
                                    <div>
                                        Al marcar como <strong>Entregado</strong>, se registrará la actividad en el historial y se generará el reporte final.
                                    </div>
                                </div>
                            )}
                        </div>
                    </Tab>
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
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Cerrar
                </Button>
                <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={loading}>
                    {loading ? <Spinner size="sm" animation="border" className="me-1" /> : <i className="bx bx-save me-1"></i>}
                    Guardar Cambios
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
