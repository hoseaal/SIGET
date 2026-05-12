import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Row, Col, Badge, Spinner, InputGroup, Pagination } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import helpFetch from "../../utils/helpFetch";
import { GestionTransferenciaModal } from "./components/GestionTransferenciaModal";
import { generateTransferPDF } from "../../utils/ReporteTransferencia";
import { PaginationComponent } from "../../components/PaginationComponent";

export const TransferenciaTecnicoPage = () => {
    const [transferencias, setTransferencias] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPrio, setFilterPrio] = useState("");
    const [filterDepto, setFilterDepto] = useState("");

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [transData, depsData] = await Promise.all([
                helpFetch.GET("/transferencia"),
                helpFetch.GET("/departamento")
            ]);
            setTransferencias(transData);
            setDepartamentos(depsData);

        } catch (error) {
            console.error(error);
            toast.error("Error al cargar tablero técnico");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    // Resetear a la página 1 cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterPrio, filterDepto]);

    const handleOpenGestion = (t) => {
        setSelectedTransfer(t);
        setModalVisible(true);
    };

    const filteredData = transferencias.filter(t => {
        const matchesSearch = t.nro_caso.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.equipo_nro_bien.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.origen_nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "" || String(t.status) === filterStatus;
        const matchesPrio = filterPrio === "" || t.prioridad === filterPrio;
        const matchesDepto = filterDepto === "" || String(t.origen_id) === filterDepto;
        return matchesSearch && matchesStatus && matchesPrio && matchesDepto;
    });

    // Lógica de Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransferencias = filteredData.slice(indexOfFirstItem, indexOfLastItem);


    const getStatusBadge = (nombre) => {
        const n = nombre.toLowerCase();
        if (n.includes('pendiente')) return 'label-warning';
        if (n.includes('recibido') || n.includes('revisión')) return 'label-info';
        if (n.includes('reparación')) return 'label-primary';
        if (n.includes('listo') || n.includes('entregado')) return 'label-success';
        if (n.includes('anulado')) return 'label-danger';
        return 'label-secondary';
    };

    const getPriorityBadge = (prio) => {
        switch (prio) {
            case 'Alta': return 'danger';
            case 'Media': return 'warning';
            case 'Baja': return 'info';
            default: return 'secondary';
        }
    };

    return (
        <div className="container-fluid flex-grow-1 container-p-y">
            <ToastContainer />
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Soporte Técnico /</span> Tablero de Transferencias
            </h4>

            <Row className="mb-4">
                <Col md={3}>
                    <Card className="bg-primary text-white">
                        <Card.Body className="text-center">
                            <h3 className="text-white mb-0">{transferencias.filter(t => t.status === 2).length}</h3>
                            <div className="small">Nuevas Solicitudes</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="bg-warning text-white">
                        <Card.Body className="text-center">
                            <h3 className="text-white mb-0">{transferencias.filter(t => [3, 4, 5].includes(t.status)).length}</h3>
                            <div className="small">En Taller</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-transparent">
                    <h5 className="mb-0">Gestión de Equipos Recibidos</h5>
                </Card.Header>
                <Card.Body>
                    {/* Filtros */}
                    <Row className="mb-4 g-3">
                        <Col md={3}>
                            <InputGroup>
                                <InputGroup.Text><i className="bx bx-search"></i></InputGroup.Text>
                                <Form.Control
                                    placeholder="Buscar por Caso, Bien o Departamento..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Select value={filterDepto} onChange={(e) => setFilterDepto(e.target.value)}>
                                <option value="">Todos los departamentos</option>
                                {departamentos.map(d => (
                                    <option key={d.id} value={d.id}>{d.nombre}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="">Todos los estados</option>
                                <option value="2">Pendiente</option>
                                <option value="3">Recibido</option>
                                <option value="4">En Revisión</option>
                                <option value="5">En Reparación</option>
                                <option value="6">Listo para Entrega</option>
                                <option value="7">Entregado</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Select value={filterPrio} onChange={(e) => setFilterPrio(e.target.value)}>
                                <option value="">Todas las prioridades</option>
                                <option value="Alta">Alta</option>
                                <option value="Media">Media</option>
                                <option value="Baja">Baja</option>
                            </Form.Select>
                        </Col>
                        <Col md={2} className="text-end">
                            <Button variant="secondary" className="w-100" onClick={() => { setSearchTerm(""); setFilterStatus(""); setFilterPrio(""); setFilterDepto(""); }}>
                                Limpiar
                            </Button>
                        </Col>
                    </Row>

                    <Table responsive hover className="align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Caso #</th>
                                <th>Origen / Usuario</th>
                                <th>Equipo</th>
                                <th>Fecha Rec.</th>
                                <th>Prioridad</th>
                                <th>Estatus</th>
                                <th className="text-center">Gestionar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <div className="mb-2"><i className="bx bx-info-circle fs-1"></i></div>
                                        No hay solicitudes de transferencia pendientes.
                                    </td>
                                </tr>
                            ) : (
                                currentTransferencias.map(t => (
                                    <tr key={t.id}>
                                        <td><span className="fw-bold">{t.nro_caso}</span></td>
                                        <td>
                                            <div className="fw-bold">{t.origen_nombre}</div>
                                            <div className="small text-muted">{t.usuario_crea}</div>
                                        </td>
                                        <td>
                                            <div>{t.equipo_nro_bien}</div>
                                            <div className="small text-muted">{t.asunto}</div>
                                        </td>
                                        <td>
                                            <div className="small">{new Date(t.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}</div>
                                            <div className="text-muted small">{new Date(t.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td>
                                            <Badge bg={getPriorityBadge(t.prioridad)}>{t.prioridad}</Badge>
                                        </td>
                                        <td>
                                            <Badge bg={getStatusBadge(t.status_nombre)} className="bg-label-primary">
                                                {t.status_nombre}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-1">
                                                <Button size="sm" variant="primary" onClick={() => handleOpenGestion(t)} title="Gestionar">
                                                    <i className="bx bx-cog"></i>
                                                </Button>
                                                {(t.status === 6 || t.status === 7) && (
                                                    <Button size="sm" variant="info" onClick={() => generateTransferPDF(t)} title="Imprimir Reporte">
                                                        <i className="bx bx-printer"></i>
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

            <GestionTransferenciaModal
                show={modalVisible}
                onHide={() => setModalVisible(false)}
                onSuccess={() => { setModalVisible(false); fetchData(); }}
                transferencia={selectedTransfer}
            />
        </div>
    );
};
