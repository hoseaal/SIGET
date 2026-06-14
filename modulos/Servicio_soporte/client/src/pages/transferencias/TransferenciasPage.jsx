import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Row, Col, Badge, Spinner, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import helpFetch from "../../utils/helpFetch";
import { TransferenciaModal } from "./components/TransferenciaModal";
import { TransferenciaDetalleModal } from "./components/TransferenciaDetalleModal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationComponent } from "../../components/PaginationComponent";

export const TransferenciasPage = () => {
    const [transferencias, setTransferencias] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterDepto, setFilterDepto] = useState("");
    const [user, setUser] = useState(null);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(3);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Verificar usuario para filtrar por su departamento
            const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
            const userData = await userRes.json();

            if (userData.success) {
                const currentUser = userData.user;
                setUser(currentUser);
                const depId = currentUser.direc_id;
                const isAdmin = currentUser.rol_id === 1; // 1: Administrador en DB

                // 2. Obtener transferencias y departamentos
                const [transData, depsData] = await Promise.all([
                    isAdmin ? helpFetch.GET("/transferencia") : helpFetch.GET(`/transferencia/origen/${depId}`),
                    helpFetch.GET("/departamento")
                ]);

                setTransferencias(transData);
                setDepartamentos(depsData);
                console.log("transferencia:", transData);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar listado de transferencias");
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
    }, [searchTerm, filterStatus, filterDepto]);

    const filteredData = transferencias.filter(t => {
        const matchesSearch = t.nro_caso.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.equipo_nro_bien.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "" || String(t.status) === filterStatus;
        const matchesDepto = filterDepto === "" || String(t.origen_id) === filterDepto;
        return matchesSearch && matchesStatus && matchesDepto;
    });

    // Lógica de Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransferencias = filteredData.slice(indexOfFirstItem, indexOfLastItem);


    const getStatusBadge = (nombre) => {
        const n = nombre.toLowerCase();
        if (n.includes('pendiente')) return 'warning';
        if (n.includes('recibido') || n.includes('revisión')) return 'info';
        if (n.includes('reparación')) return 'primary';
        if (n.includes('listo') || n.includes('entregado')) return 'success';
        return 'secondary';
    };

        const handleDeleteTransferencia = async () => {
            if (!deleteTarget) return;
            try {
                await helpFetch.DELETE(`/transferencia/${deleteTarget.id}`);
                toast.success("Registro eliminado correctamente.");
                setShowDeleteModal(false);
                setDeleteTarget(null);
                fetchData();
            } catch (error) {
                toast.error(error.message || "Error al eliminar el registro.");
            }
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
                <span className="text-muted fw-light">Soporte /</span> Historial de Transferencias
            </h4>

            <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2 bg-transparent">
                    <h5 className="mb-0">Mis Equipos en Servicio Técnico</h5>
                    <Button variant="primary" onClick={() => setModalVisible(true)}>
                        <i className="bx bx-plus me-1"></i> Nueva Transferencia
                    </Button>
                </Card.Header>
                <Card.Body>
                    {/* Filtros */}
                    <Row className="mb-4 g-3">
                        <Col md={user?.rol_id === 1 ? 4 : 6}>
                            <InputGroup>
                                <InputGroup.Text className="bg-transparent border-end-0">
                                    <i className="bx bx-search"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    className="border-start-0"
                                    placeholder="Buscar por Nro. Caso o Nro. Bien..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        {user?.rol_id === 1 && (
                            <Col md={3}>
                                <Form.Select
                                    value={filterDepto}
                                    onChange={(e) => setFilterDepto(e.target.value)}
                                >
                                    <option value="">Todos los departamentos</option>
                                    {departamentos.map(d => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        )}
                        <Col md={user?.rol_id === 1 ? 3 : 4}>
                            <Form.Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="2">Pendiente</option>
                                <option value="3">Recibido</option>
                                <option value="4">En Revisión</option>
                                <option value="5">En Reparación</option>
                                <option value="6">Listo para Entrega</option>
                                <option value="7">Entregado</option>
                            </Form.Select>
                        </Col>
                        <Col md={2} className="text-end">
                            <Button variant="secondary" className="w-100" onClick={() => { setSearchTerm(""); setFilterStatus(""); setFilterDepto(""); }}>
                                Limpiar
                            </Button>
                        </Col>
                    </Row>

                    <Table responsive hover className="align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Caso #</th>
                                <th>Fecha</th>
                                <th>Equipo</th>
                                <th>Asunto</th>
                                <th>Estatus</th>
                                <th className="text-center">Código Entrega</th>
                                <th className="text-center">Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 mb-0">Cargando transferencias...</p>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5 text-muted">
                                        <div className="mb-2"><i className="bx bx-info-circle fs-1"></i></div>
                                        No hay transferencias registradas para su departamento.
                                    </td>
                                </tr>
                            ) : (
                                currentTransferencias.map(t => (
                                    <tr key={t.id}>
                                        <td>
                                            <span className="fw-bold text-primary">{t.nro_caso}</span>
                                        </td>
                                        <td>
                                            <div className="small">{new Date(t.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}</div>
                                            <div className="text-muted small">{new Date(t.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold">{t.equipo_nro_bien}</div>
                                            <div className="small text-muted">{t.equipo_tipo}</div>
                                        </td>
                                        <td>
                                            <div className="text-truncate" style={{ maxWidth: '200px' }} title={t.asunto}>
                                                {t.asunto}
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg={getStatusBadge(t.status_nombre)} className="bg-label-primary">
                                                {t.status_nombre}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            {parseInt(t.status) !== 7 ? (
                                                <Badge bg="dark" className="fs-6 py-2 px-3">
                                                    <i className="bx bx-lock-alt me-1"></i> {t.codigo_entrega}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted small">Finalizado</span>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    title="Ver Detalles Completos"
                                                    onClick={() => {
                                                        setSelectedTransfer(t);
                                                        setDetailModalVisible(true);
                                                    }}
                                                >
                                                    <i className="bx bx-show me-1"></i>
                                                </Button>
                                                {user?.usuario_id === t.usuario_id && parseInt(t.status) === 2 && (
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        title="Anular"
                                                        onClick={() => { setDeleteTarget(t); setShowDeleteModal(true); }}
                                                    >
                                                        <i className="bx bx-trash"></i>
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

            <TransferenciaModal
                show={modalVisible}
                onHide={() => setModalVisible(false)}
                onSuccess={() => { setModalVisible(false); fetchData(); }}
            />

            <TransferenciaDetalleModal
                show={detailModalVisible}
                onHide={() => {
                    setDetailModalVisible(false);
                    setSelectedTransfer(null);
                }}
                transferencia={selectedTransfer}
            />

            <ConfirmModal
                show={showDeleteModal}
                onHide={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
                onConfirm={handleDeleteTransferencia}
                title="Confirmar Eliminación"
                message={<span>¿Está seguro de que desea eliminar la transferencia <strong>{deleteTarget?.nro_caso}</strong>?<br /><br /><span className="text-danger"><i className="bx bx-info-circle me-1"></i> Esta acción no se puede deshacer.</span></span>}
                confirmText="Eliminar"
                variant="danger"
            />
        </div>
    );
};
