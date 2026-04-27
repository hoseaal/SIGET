import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Row, Col, Badge, Spinner, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import helpFetch from "../../utils/helpFetch";
import { SolicitudMantenimientoModal } from "./components/SolicitudMantenimientoModal";
import { GestionMantenimientoModal } from "./components/GestionMantenimientoModal";

export const MantenimientosPage = ({ isTechnicalDashboard = false }) => {
    const [mantenimientos, setMantenimientos] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterDepto, setFilterDepto] = useState("");
    const [user, setUser] = useState(null);

    // Modal state
    const [showSolicitud, setShowSolicitud] = useState(false);
    const [showGestion, setShowGestion] = useState(false);
    const [selectedMaint, setSelectedMaint] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
            const userData = await userRes.json();

            if (userData.success) {
                setUser(userData.user);
                const [maintData, depsData] = await Promise.all([
                    isTechnicalDashboard ? helpFetch.GET("/mantenimiento") : helpFetch.GET(`/mantenimiento/depto/${userData.user.direc_id}`),
                    helpFetch.GET("/departamento")
                ]);
                setMantenimientos(maintData);
                setDepartamentos(depsData);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar mantenimientos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isTechnicalDashboard]);

    const filteredData = mantenimientos.filter(m => {
        const matchesSearch = m.nro_caso.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.equipo_nro_bien && m.equipo_nro_bien.toLowerCase().includes(searchTerm.toLowerCase())) ||
            m.asunto.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "" || String(m.status) === filterStatus;
        const matchesDepto = filterDepto === "" || String(m.direc_id) === filterDepto;
        return matchesSearch && matchesStatus && matchesDepto;
    });

    const getStatusBadge = (nombre) => {
        const n = nombre.toLowerCase();
        if (n.includes('pendiente')) return 'warning';
        if (n.includes('proceso') || n.includes('revisión')) return 'info';
        if (n.includes('finalizado') || n.includes('listo')) return 'success';
        if (n.includes('anulado')) return 'danger';
        return 'secondary';
    };

    return (
        <div className="container-fluid flex-grow-1 container-p-y">
            <ToastContainer />
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Soporte /</span> {isTechnicalDashboard ? 'Tablero de Mantenimiento' : 'Gestión de Fallas'}
            </h4>

            <Card className="shadow-sm border-0">
                <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2 bg-transparent">
                    <h5 className="mb-0">{isTechnicalDashboard ? 'Todas las Solicitudes' : 'Mis Reportes de Falla'}</h5>
                    {!isTechnicalDashboard && (
                        <Button variant="primary" onClick={() => setShowSolicitud(true)}>
                            <i className="bx bx-plus me-1"></i> Reportar Falla
                        </Button>
                    )}
                </Card.Header>
                <Card.Body>
                    <Row className="mb-4 g-3">
                        <Col md={isTechnicalDashboard ? 4 : 6}>
                            <InputGroup>
                                <InputGroup.Text><i className="bx bx-search"></i></InputGroup.Text>
                                <Form.Control
                                    placeholder="Buscar por Caso, Bien o Asunto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        {isTechnicalDashboard && (
                            <Col md={3}>
                                <Form.Select value={filterDepto} onChange={(e) => setFilterDepto(e.target.value)}>
                                    <option value="">Todos los Deptos</option>
                                    {departamentos.map(d => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        )}
                        <Col md={isTechnicalDashboard ? 3 : 4}>
                            <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="">Todos los estados</option>
                                <option value="2">Pendiente</option>
                                <option value="3">En Proceso</option>
                                <option value="7">Finalizado</option>
                                <option value="8">Anulado</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Button variant="secondary" className="w-100" onClick={() => { setSearchTerm(""); setFilterStatus(""); setFilterDepto(""); }}>
                                Limpiar
                            </Button>
                        </Col>
                    </Row>


                    <Table responsive hover className="align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Caso #</th>
                                <th>Tipo / Asunto</th>
                                <th>Equipo</th>
                                <th>Fecha</th>
                                <th>Prioridad</th>
                                <th>Estatus</th>
                                <th className="text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">No se encontraron registros.</td></tr>
                            ) : (
                                filteredData.map(m => (
                                    <tr key={m.id}>
                                        <td><span className="fw-bold">{m.nro_caso}</span></td>
                                        <td>
                                            <div className="fw-bold">{m.tipo_falla}</div>
                                            <div className="small text-muted">{m.asunto}</div>
                                        </td>
                                        <td>{m.equipo_nro_bien || <span className="text-muted">N/A</span>}</td>
                                        <td>{new Date(m.fecha_solicitud).toLocaleDateString()}</td>
                                        <td>
                                            <Badge bg={m.prioridad === 'Alta' ? 'danger' : m.prioridad === 'Media' ? 'warning' : 'info'}>
                                                {m.prioridad}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={getStatusBadge(m.status_nombre)} className="bg-label-primary">
                                                {m.status_nombre}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            <Button size="sm" variant="outline-primary" onClick={() => { setSelectedMaint(m); setShowGestion(true); }}>
                                                <i className={`bx ${isTechnicalDashboard ? 'bx-cog' : 'bx-show'}`}></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <SolicitudMantenimientoModal
                show={showSolicitud}
                onHide={() => setShowSolicitud(false)}
                onSuccess={() => { setShowSolicitud(false); fetchData(); }}
                user={user}
            />

            <GestionMantenimientoModal
                show={showGestion}
                onHide={() => setShowGestion(false)}
                onSuccess={() => { setShowGestion(false); fetchData(); }}
                mantenimiento={selectedMaint}
                isTechnical={isTechnicalDashboard}
            />
        </div>
    );
};
