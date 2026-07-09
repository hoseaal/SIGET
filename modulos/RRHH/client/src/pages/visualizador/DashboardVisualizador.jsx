import React, { useEffect, useState, useCallback } from 'react';
import {
    Container, Row, Col, Card, Button, Spinner, Alert, Badge, Table
} from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { generarConstancia } from '../../utils/generarConstancia';

// ─────────────────────────────────────────────────────────────────────────────
// Hook reutilizable: hace fetch autenticado y maneja loading/error
// ─────────────────────────────────────────────────────────────────────────────
function useFetch(url, options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!url) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(url, { credentials: 'include', ...options });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `Error ${res.status}`);
            }
            setData(await res.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return { data, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente: Fila de datos (etiqueta + valor)
// ─────────────────────────────────────────────────────────────────────────────
const DataRow = ({ label, value, badge }) => (
    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
        <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.04em', minWidth: 160 }}>
            {label}
        </span>
        {badge
            ? <Badge bg={badge.color} className="px-3 py-2">{value || '—'}</Badge>
            : <span className="fw-medium text-end">{value || <span className="text-muted fst-italic">Sin datos</span>}</span>
        }
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Vista: Perfil (Datos personales y laborales)
// ─────────────────────────────────────────────────────────────────────────────
const VistaPerfil = ({ empleado }) => {
    const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-VE') : null;
    const fmtMonto = (m) => m ? `Bs. ${Number(m).toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : null;

    return (
        <Row className="g-4">
            <Col md={6}>
                <Card className="h-100 border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom fw-bold">
                        <i className="bx bx-user-circle me-2 text-primary"></i>
                        Datos Personales
                    </Card.Header>
                    <Card.Body>
                        <DataRow label="Nombre completo" value={`${empleado.nombres} ${empleado.apellidos}`} />
                        <DataRow label="Cédula de identidad" value={`V-${empleado.cedula}`} />
                        <DataRow label="Fecha de nacimiento" value={fmtFecha(empleado.fecha_nacimiento)} />
                        <DataRow label="Género" value={empleado.genero} />
                        <DataRow label="Estado civil" value={empleado.estado_civil} />
                        <DataRow label="Teléfono" value={empleado.celular || empleado.telefono_fijo} />
                        <DataRow label="Correo" value={empleado.correo_principal} />
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="h-100 border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom fw-bold">
                        <i className="bx bx-briefcase me-2 text-primary"></i>
                        Datos del Cargo
                    </Card.Header>
                    <Card.Body>
                        <DataRow label="Cargo (ONAPRE)" value={empleado.cargo_onapre_nombre} />
                        <DataRow label="Cargo (CET)" value={empleado.cargo_cet_nombre} />
                        <DataRow label="Dirección" value={empleado.direccion_nombre} />
                        <DataRow label="División" value={empleado.division_nombre} />
                        <DataRow label="Unidad" value={empleado.unidad_nombre} />
                        <DataRow label="Fecha de ingreso" value={fmtFecha(empleado.fecha_ingreso)} />
                        <DataRow label="Salario base" value={fmtMonto(empleado.salario_base)} badge={{ color: 'success' }} />
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Vista: Antigüedades
// ─────────────────────────────────────────────────────────────────────────────
const VistaAntiguedades = ({ empleadoId }) => {
    const { data, loading, error } = useFetch(
        empleadoId ? `/api/rrhh/mi-perfil/antiguedades?empleado_id=${empleadoId}` : null
    );

    if (loading) return <div className="text-center py-5"><Spinner animation="border" size="sm" className="me-2" />Cargando historial...</div>;
    if (error) return <Alert variant="warning" className="mt-3"><i className="bx bx-info-circle me-2"></i>{error}</Alert>;

    const records = Array.isArray(data) ? data : [];

    if (!records.length) {
        return (
            <div className="text-center py-5 text-muted">
                <i className="bx bx-history" style={{ fontSize: 48 }}></i>
                <p className="mt-2">No hay registros de antigüedades reconocidos.</p>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <Table hover className="align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th>Institución</th>
                        <th>Fecha de Ingreso</th>
                        <th>Fecha de Egreso</th>
                        <th>Tiempo Reconocido</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((r, i) => (
                        <tr key={i}>
                            <td className="fw-medium">{r.institucion || '—'}</td>
                            <td>{r.fecha_ingreso ? new Date(r.fecha_ingreso).toLocaleDateString('es-VE') : '—'}</td>
                            <td>{r.fecha_egreso ? new Date(r.fecha_egreso).toLocaleDateString('es-VE') : '—'}</td>
                            <td>{r.anios_reconocidos} años, {r.meses_reconocidos} meses, {r.dias_reconocidos} días</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Vista: Encargos Temporales
// ─────────────────────────────────────────────────────────────────────────────
const VistaEncargos = ({ empleadoId }) => {
    const { data, loading, error } = useFetch(
        empleadoId ? `/api/rrhh/mi-perfil/encargos?empleado_id=${empleadoId}` : null
    );

    if (loading) return <div className="text-center py-5"><Spinner animation="border" size="sm" className="me-2" />Cargando encargos...</div>;
    if (error) return <Alert variant="warning" className="mt-3"><i className="bx bx-info-circle me-2"></i>{error}</Alert>;

    const records = Array.isArray(data) ? data : [];

    if (!records.length) {
        return (
            <div className="text-center py-5 text-muted">
                <i className="bx bx-briefcase-alt-2" style={{ fontSize: 48 }}></i>
                <p className="mt-2">No hay encargos temporales registrados.</p>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <Table hover className="align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th>Cargo (CET)</th>
                        <th>Dirección</th>
                        <th>Periodo</th>
                        <th>Estatus</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((r, i) => (
                        <tr key={i}>
                            <td className="fw-medium">{r.cargo_cet || '—'}</td>
                            <td>{r.direccion || '—'}</td>
                            <td>
                                {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString('es-VE') : '—'} 
                                {' - '} 
                                {r.fecha_fin ? new Date(r.fecha_fin).toLocaleDateString('es-VE') : '—'}
                            </td>
                            <td>
                                <Badge bg={r.estatus_encargo === 'Activo' ? 'success' : 'secondary'}>
                                    {r.estatus_encargo || '—'}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Vista: Vacaciones (historial de fechas de disfrute)
// ─────────────────────────────────────────────────────────────────────────────
const VistaVacaciones = ({ empleadoId }) => {
    const { data, loading, error } = useFetch(
        empleadoId ? `/api/rrhh/mi-perfil/vacaciones?empleado_id=${empleadoId}` : null
    );

    if (loading) return <div className="text-center py-5"><Spinner animation="border" size="sm" className="me-2" />Cargando historial vacacional...</div>;
    if (error) return <Alert variant="warning" className="mt-3"><i className="bx bx-info-circle me-2"></i>{error}</Alert>;

    const records = Array.isArray(data) ? data : [];

    if (!records.length) {
        return (
            <div className="text-center py-5 text-muted">
                <i className="bx bx-sun" style={{ fontSize: 48 }}></i>
                <p className="mt-2">No hay vacaciones registradas.</p>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <Table hover className="align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th>Período</th>
                        <th>Fechas de Disfrute</th>
                        <th>Días</th>
                        <th>Estatus</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((r, i) => (
                        <tr key={i}>
                            <td className="fw-medium">{r.periodo || '—'}</td>
                            <td>
                                {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString('es-VE') : '—'} 
                                {' a '} 
                                {r.fecha_fin ? new Date(r.fecha_fin).toLocaleDateString('es-VE') : '—'}
                            </td>
                            <td>{r.dias_disfrute || '—'}</td>
                            <td>
                                <Badge bg={
                                    r.estatus === 'Disfrutadas' ? 'success' : 
                                    r.estatus === 'En Disfrute' ? 'primary' : 'warning'
                                }>
                                    {r.estatus || '—'}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Vista: Nómina Mensual (desde historial_pagos)
// ─────────────────────────────────────────────────────────────────────────────
const VistaNomina = ({ empleadoId }) => {
    const { data, loading, error } = useFetch(
        empleadoId ? `/api/rrhh/mi-perfil/nomina?empleado_id=${empleadoId}` : null
    );

    if (loading) return <div className="text-center py-5"><Spinner animation="border" size="sm" className="me-2" />Cargando historial de nómina...</div>;
    if (error) return <Alert variant="warning" className="mt-3"><i className="bx bx-info-circle me-2"></i>{error}</Alert>;

    const recibos = data?.recibos || [];

    if (!recibos.length) {
        return (
            <div className="text-center py-5 text-muted">
                <i className="bx bx-receipt" style={{ fontSize: 48 }}></i>
                <p className="mt-2">No hay recibos de nómina registrados aún.</p>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <Table hover className="align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th>Período</th>
                        <th>Tipo de Nómina</th>
                        <th>Fecha de pago</th>
                        <th className="text-end">Monto total</th>
                    </tr>
                </thead>
                <tbody>
                    {recibos.map((r, i) => (
                        <tr key={i}>
                            <td className="fw-medium">{r.periodo || '—'}</td>
                            <td>
                                <Badge bg="primary" className="text-capitalize">
                                    {r.tipo_nomina || 'Mensual'}
                                </Badge>
                            </td>
                            <td>{r.fecha_pago ? new Date(r.fecha_pago).toLocaleDateString('es-VE') : '—'}</td>
                            <td className="text-end fw-bold text-success">
                                {r.monto_total
                                    ? `Bs. ${Number(r.monto_total).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
                                    : '—'
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <p className="text-muted small mt-2 ps-1">Mostrando los últimos 24 recibos.</p>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal del Portal del Empleado
// ─────────────────────────────────────────────────────────────────────────────
export const DashboardVisualizador = () => {
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const activeView = queryParams.get('view') || 'perfil';

    const [descargando, setDescargando] = useState(false);

    const { data: empleado, loading, error } = useFetch(
        user?.empleado_id ? `/api/rrhh/mi-perfil/datos-laborales?empleado_id=${user.empleado_id}` : null
    );

    const handleDownloadConstancia = async () => {
        setDescargando(true);
        try {
            await generarConstancia(user.empleado_id, empleado?.cedula);
        } catch (e) {
            alert(`Error: ${e.message}`);
        } finally {
            setDescargando(false);
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'perfil':
                return empleado
                    ? <VistaPerfil empleado={empleado} />
                    : <p className="text-muted">Sin información laboral disponible.</p>;
            case 'antiguedades':
                return <VistaAntiguedades empleadoId={user.empleado_id} />;
            case 'encargos':
                return <VistaEncargos empleadoId={user.empleado_id} />;
            case 'nomina':
                return <VistaNomina empleadoId={user.empleado_id} />;
            case 'vacaciones':
                return <VistaVacaciones empleadoId={user.empleado_id} />;
            case 'constancia':
                return (
                    <div className="text-center py-5">
                        <i className="bx bxs-file-pdf text-danger" style={{ fontSize: 64 }}></i>
                        <h5 className="mt-3">Constancia de Trabajo</h5>
                        <p className="text-muted mb-4">
                            Genera un documento PDF con tus datos laborales actuales.
                        </p>
                        <Button
                            variant="danger"
                            size="lg"
                            className="d-inline-flex align-items-center gap-2"
                            onClick={handleDownloadConstancia}
                            disabled={descargando}
                        >
                            {descargando
                                ? <><Spinner size="sm" /> Generando PDF...</>
                                : <><i className="bx bxs-file-pdf fs-5"></i> Descargar Constancia</>
                            }
                        </Button>
                    </div>
                );
            default:
                return <p className="text-muted">Selecciona una opción del menú.</p>;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Cargando tu portal...</p>
            </div>
        );
    }

    if (!user?.empleado_id) {
        return (
            <Container className="mt-5">
                <Alert variant="warning" className="d-flex align-items-center gap-2">
                    <i className="bx bx-error-circle fs-4"></i>
                    <div>
                        <strong>Sin vinculación:</strong> Tu usuario no está asociado a ningún empleado.
                        Contacta al administrador del sistema.
                    </div>
                </Alert>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <i className="bx bx-error me-2"></i>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <div>
            {/* ── Encabezado de bienvenida ─────────────────────────────── */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h4 className="mb-0 fw-bold">
                        <i className="bx bx-user-badge me-2 text-primary"></i>
                        Portal del Empleado
                    </h4>
                    <p className="text-muted mb-0 small mt-1">
                        Hola, <strong>{user.nombres}</strong> — aquí puedes consultar tu expediente laboral.
                    </p>
                </div>
            </div>

            {/* ── Tarjetas de resumen rápido ───────────────────────────── */}
            <Row className="g-3 mb-4">
                {[
                    { icon: 'bx-id-card',   color: 'primary',  label: 'Cédula',    value: empleado ? `V-${empleado.cedula}` : '—' },
                    { icon: 'bx-building',  color: 'info',     label: 'Dirección', value: empleado?.direccion_nombre || '—' },
                    { icon: 'bx-briefcase', color: 'warning',  label: 'Cargo',     value: empleado?.cargo_onapre_nombre || empleado?.cargo_cet_nombre || '—' },
                    { icon: 'bx-calendar',  color: 'success',  label: 'Ingreso',   value: empleado?.fecha_ingreso ? new Date(empleado.fecha_ingreso).toLocaleDateString('es-VE') : '—' },
                ].map(({ icon, color, label, value }) => (
                    <Col key={label} xs={12} sm={6} xl={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body className="d-flex align-items-center gap-3">
                                <div className={`bg-label-${color} rounded-circle d-flex align-items-center justify-content-center`}
                                    style={{ width: 48, height: 48, flexShrink: 0 }}>
                                    <i className={`bx ${icon} text-${color} fs-4`}></i>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-muted small mb-0">{label}</p>
                                    <p className="fw-bold mb-0 text-truncate" title={value}>{value}</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* ── Panel de renderizado dinámico ────────────────────────── */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    {renderContent()}
                </Card.Body>
            </Card>

            {/* ── Nota informativa de solo lectura ─────────────────────── */}
            <Alert variant="light" className="mt-4 d-flex align-items-center gap-2 border">
                <i className="bx bx-lock-alt text-muted fs-5"></i>
                <small className="text-muted">
                    Este portal es de <strong>solo consulta</strong>. Para modificar cualquier dato laboral,
                    dirígete a la Dirección de Recursos Humanos.
                </small>
            </Alert>
        </div>
    );
};
