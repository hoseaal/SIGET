import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Row, Col, Badge, Spinner, InputGroup, Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import helpFetch from "../../utils/helpFetch";
import { SolicitudMantenimientoModal } from "./components/SolicitudMantenimientoModal";
import { GestionMantenimientoModal } from "./components/GestionMantenimientoModal";
import { PaginationComponent } from "../../components/PaginationComponent";
import { exportInformeTonerPDF } from "../../utils/exportInformeTonerPDF";

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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(3);

    const fetchData = async () => {
        try {
            setLoading(true);
            const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
            const userData = await userRes.json();

            if (userData.success) {
                setUser(userData.user);
                const isAdmin = userData.user.rol_id === 1;
                const [maintData, depsData] = await Promise.all([
                    (isTechnicalDashboard || isAdmin) ? helpFetch.GET("/mantenimiento") : helpFetch.GET(`/mantenimiento/depto/${userData.user.direc_id}`),
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

    // Resetear a la página 1 cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterDepto]);

    const filteredData = mantenimientos.filter(m => {
        const matchesSearch = m.nro_caso.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.equipo_nro_bien && m.equipo_nro_bien.toLowerCase().includes(searchTerm.toLowerCase())) ||
            m.asunto.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "" || String(m.status) === filterStatus;
        const matchesDepto = filterDepto === "" || String(m.direc_id) === filterDepto;
        return matchesSearch && matchesStatus && matchesDepto;
    });

    // Lógica de Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMantenimientos = filteredData.slice(indexOfFirstItem, indexOfLastItem);


    const getStatusBadge = (nombre) => {
        const n = nombre.toLowerCase();
        if (n.includes('pendiente')) return 'warning';
        if (n.includes('proceso') || n.includes('revisión')) return 'info';
        if (n.includes('finalizado') || n.includes('listo')) return 'success';
        return 'secondary';
    };

    const handleDeleteMantenimiento = async () => {
        if (!deleteTarget) return;
        try {
            await helpFetch.DELETE(`/mantenimiento/${deleteTarget.id}`);
            toast.success("Registro eliminado correctamente.");
            setShowDeleteModal(false);
            setDeleteTarget(null);
            fetchData();
        } catch (error) {
            toast.error(error.message || "Error al eliminar el registro.");
        }
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
                        <Col md={(isTechnicalDashboard || user?.rol_id === 1) ? 4 : 6}>
                            <InputGroup>
                                <InputGroup.Text><i className="bx bx-search"></i></InputGroup.Text>
                                <Form.Control
                                    placeholder="Buscar por Nro. Oficio, Bien o Asunto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        {(isTechnicalDashboard || user?.rol_id === 1) && (
                            <Col md={3}>
                                <Form.Select value={filterDepto} onChange={(e) => setFilterDepto(e.target.value)}>
                                    <option value="">Todos los Deptos</option>
                                    {departamentos.map(d => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        )}
                        <Col md={(isTechnicalDashboard || user?.rol_id === 1) ? 3 : 4}>
                            <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="">Todos los estados</option>
                                <option value="2">Pendiente</option>
                                <option value="3">En Proceso</option>
                                <option value="7">Finalizado</option>
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
                                <th>Nro. de Oficio</th>
                                <th>Tipo / Asunto</th>
                                <th>Equipo</th>
                                <th className="text-center">Fecha de Solicitud</th>
                                <th className="text-center">Fecha de Fin</th>
                                <th className="text-center">Código Seguridad</th>
                                <th className="text-center">Estatus</th>
                                <th className="text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5 text-muted">
                                        <div className="mb-2"><i className="bx bx-info-circle fs-1"></i></div>
                                        No hay mantenimientos registradas para su departamento.
                                    </td>
                                </tr>
                            ) : (
                                currentMantenimientos.map(m => (
                                    <tr key={m.id}>
                                        <td><span className="fw-bold">{m.nro_caso}</span></td>
                                        <td>
                                            <div className="fw-bold">{m.asunto}</div>
                                            <div className="small text-muted">{m.tipo_falla_nombre}</div>
                                        </td>
                                        <td>{m.equipo_nro_bien || <span className="text-muted">N/A</span>}</td>
                                        <td className="text-center">{new Date(m.fecha_solicitud).toLocaleDateString()}</td>
                                        <td className="text-center">
                                            {m.fecha_fin ? new Date(m.fecha_fin).toLocaleDateString() : <span className="text-muted">N/A</span>}
                                        </td>
                                        <td className="text-center">
                                            {parseInt(m.status) === 7 ? (
                                                <span className="text-muted small">Finalizado</span>
                                            ) : m.codigo_entrega ? (
                                                <Badge bg="dark" className="fs-6 py-2 px-3">
                                                    <i className="bx bx-lock-alt me-1"></i> {m.codigo_entrega}
                                                </Badge>
                                            ) : (
                                                <i className="bx bx-lock-alt me-1"></i>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <Badge bg={getStatusBadge(m.status_nombre)} className="bg-label-primary text-center">
                                                {m.status_nombre}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-1">
                                                <Button size="sm" variant="primary" onClick={() => { setSelectedMaint(m); setShowGestion(true); }}>
                                                    <i className={`bx ${isTechnicalDashboard ? 'bx-cog' : 'bx-show'}`}></i>
                                                </Button>
                                                {!isTechnicalDashboard && user?.usuario_id === m.usuario_id && parseInt(m.status) === 2 && (
                                                    <Button size="sm" variant="danger" title="Anular" onClick={() => { setDeleteTarget(m); setShowDeleteModal(true); }}>
                                                        <i className="bx bx-trash"></i>
                                                    </Button>
                                                )}
                                                {(m.tipo_falla === 10 || m.tipo_falla === 14) && (
                                                    <Button size="sm" variant="danger" title="Exportar Informe de Tóner" onClick={() => exportInformeTonerPDF(m, user)}>
                                                        <i className="bx bxs-file-pdf me-1"></i>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>

                    {/* Controles de Paginación */}
                    <PaginationComponent
                        currentPage={currentPage}
                        totalItems={filteredData.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
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

            <Modal show={showDeleteModal} onHide={() => { setShowDeleteModal(false); setDeleteTarget(null); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Está seguro de que desea eliminar la solicitud <strong>{deleteTarget?.nro_caso}</strong>?
                    <br /><br />
                    <span className="text-danger"><i className="bx bx-info-circle me-1"></i> Esta acción no se puede deshacer.</span>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDeleteMantenimiento}>
                        <i className="bx bx-trash me-1"></i> Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
