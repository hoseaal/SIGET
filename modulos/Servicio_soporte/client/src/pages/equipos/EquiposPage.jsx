import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Row, Col, Badge, Spinner, InputGroup, Pagination } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import helpFetch from "../../utils/helpFetch";
import { ModalEquipo } from "./components/ModalEquipo";
import { ModalDetalleEquipo } from "./components/ModalDetalleEquipo";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PaginationComponent } from "../../components/PaginationComponent";

export const EquiposPage = () => {
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterTipo, setFilterTipo] = useState("");
    const [filterDep, setFilterDep] = useState("");

    // Maestros para filtros
    const [tiposEquipo, setTiposEquipo] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
    const [selectedEquipo, setSelectedEquipo] = useState(null);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(2);

    const fetchEquipos = async () => {
        try {
            setLoading(true);
            const data = await helpFetch.GET("/equipo");
            setEquipos(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar listado de equipos");
        } finally {
            setLoading(false);
        }
    };

    const fetchMaestros = async () => {
        try {
            const [tipos, deps] = await Promise.all([
                helpFetch.GET("/tipo_equipo"),
                helpFetch.GET("/departamento")
            ]);
            setTiposEquipo(tipos);
            setDepartamentos(deps);
        } catch (error) {
            console.error("Error cargando maestros para filtros:", error);
        }
    };

    useEffect(() => {
        fetchEquipos();
        fetchMaestros();
    }, []);

    // Resetear a la página 1 cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterTipo, filterDep]);

    const handleOpenCreate = () => {
        setSelectedEquipo(null);
        setModalVisible(true);
    };

    const handleOpenEdit = (equipo) => {
        setSelectedEquipo(equipo);
        setModalVisible(true);
    };

    const handleOpenDetalle = (equipo) => {
        setSelectedEquipo(equipo);
        setModalDetalleVisible(true);
    };

    const handleDelete = async (id) => {
        setDeleteTargetId(id);
        setShowConfirmModal(true);
    };

    const confirmDeleteEquipo = async () => {
        try {
            const res = await helpFetch.DELETE(`/equipo/${deleteTargetId}`);
            if (res) {
                toast.success("Equipo eliminado correctamente");
                fetchEquipos();
            }
        } catch (error) {
            toast.error(error.message || "Error al eliminar equipo");
        } finally {
            setShowConfirmModal(false);
            setDeleteTargetId(null);
        }
    };

    const filteredEquipos = equipos.filter(eq => {
        const matchesSearch = eq.nro_bien.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTipo = filterTipo === "" || String(eq.tipo_de_equipo) === filterTipo || eq.tipo_de_equipo === filterTipo;
        // Nota: en el backend getAll eq.tipo_de_equipo parece ser el NOMBRE (segun el alias te.nombre as Tipo_de_equipo)
        // Revisando el backend: JOIN tipo_equipo te ON e.tipo_equipo = te.id -> te.nombre as Tipo_de_equipo
        const matchesDep = filterDep === "" || eq.departamento === filterDep;
        return matchesSearch && matchesTipo && matchesDep;
    });

    // Lógica de Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEquipos = filteredEquipos.slice(indexOfFirstItem, indexOfLastItem);


    const getBadgeVariant = (tipo) => {
        const t = tipo?.toLowerCase() || "";
        if (t.includes("computador") || t.includes("pc")) return "primary";
        if (t.includes("impresora")) return "success";
        if (t.includes("escaner")) return "info";
        return "secondary";
    };

    return (
        <div className="container-fluid flex-grow-1 container-p-y">
            <ToastContainer />
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Inventario /</span> Gestión de Equipos
            </h4>

            <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h5 className="mb-0">Listado Maestro de Equipos</h5>
                    <Button variant="primary" onClick={handleOpenCreate}>
                        <i className="bx bx-plus me-1"></i> Nuevo Equipo
                    </Button>
                </Card.Header>
                <Card.Body>
                    {/* Filtros */}
                    <Row className="mb-4 g-3">
                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text><i className="bx bx-search"></i></InputGroup.Text>
                                <Form.Control
                                    placeholder="Buscar por Nro. Bien..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Select
                                value={filterTipo}
                                onChange={(e) => setFilterTipo(e.target.value)}
                            >
                                <option value="">Todos los tipos</option>
                                {tiposEquipo.map(t => (
                                    <option key={t.id} value={t.nombre}>{t.nombre}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Select

                                value={filterDep}
                                onChange={(e) => setFilterDep(e.target.value)}
                            >
                                <option value="">Todos los departamentos</option>
                                {departamentos.map(d => (
                                    <option key={d.id} value={d.nombre}>{d.nombre}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={2} className="text-end">
                            <Button variant="secondary" className="w-100" onClick={() => { setSearchTerm(""); setFilterTipo(""); setFilterDep(""); }}>
                                Limpiar
                            </Button>
                        </Col>
                    </Row>

                    <Table responsive hover className="align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Nro. Bien</th>
                                <th>Tipo</th>
                                <th>Ubicación / Departamento</th>
                                <th>Red (Puerto)</th>
                                <th>Resumen Specs</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 mb-0">Cargando equipos...</p>
                                    </td>
                                </tr>
                            ) : filteredEquipos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">
                                        No se encontraron equipos registrados
                                    </td>
                                </tr>
                            ) : (
                                currentEquipos.map(eq => (
                                    <tr key={eq.id}>
                                        <td><strong>{eq.nro_bien}</strong></td>
                                        <td>
                                            <Badge bg={getBadgeVariant(eq.tipo_de_equipo)}>
                                                {eq.tipo_de_equipo}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="small text-muted">{eq.piso}</div>
                                            <div>{eq.departamento}</div>
                                        </td>
                                        <td>
                                            <div className="small">Puerto: {eq.puerto_en_panel}</div>
                                            <div className="small text-muted">P. Soporte: {eq.puerto_soporte}</div>
                                            {eq.ip && <div className="small fw-bold text-primary mt-1"><i className="bx bx-broadcast me-1"></i>{eq.ip}</div>}
                                        </td>
                                        <td>
                                            <div style={{ maxWidth: '250px', fontSize: '0.85rem' }}>
                                                {/* Caso 1: Impresora con Tóner */}
                                                {(eq.tipo_de_equipo?.toLowerCase().includes("impresora") && eq.toner_nombre) ? (
                                                    <div className="fw-bold">
                                                        <i className="bx bx-droplet me-1 text-primary"></i>
                                                        Tóner: {eq.toner_nombre}
                                                    </div>
                                                ) :
                                                    /* Caso 2: Equipo con componentes (PC) */
                                                    (eq.detalles && eq.detalles.length > 0) ? (
                                                        <ul className="ps-3 mb-0">
                                                            {eq.detalles.map((det, i) => (
                                                                <li key={i}>
                                                                    <span className="fw-bold">{det.tipo}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <span className="text-muted">Sin detalles técnicos</span>
                                                    )}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <Button size="sm" variant="primary" title="Ver Detalles" onClick={() => handleOpenDetalle(eq)}>
                                                    <i className="bx bx-show"></i>
                                                </Button>
                                                <Button size="sm" variant="warning" title="Editar" onClick={() => handleOpenEdit(eq)}>
                                                    <i className="bx bx-edit"></i>
                                                </Button>
                                                <Button size="sm" variant="danger" title="Eliminar" onClick={() => handleDelete(eq.id)}>
                                                    <i className="bx bx-trash"></i>
                                                </Button>
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
                        totalItems={filteredEquipos.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </Card.Body>
            </Card>

            <ModalEquipo
                show={modalVisible}
                onHide={() => setModalVisible(false)}
                onSuccess={() => { setModalVisible(false); fetchEquipos(); }}
                equipo={selectedEquipo}
            />

            <ModalDetalleEquipo
                show={modalDetalleVisible}
                onHide={() => setModalDetalleVisible(false)}
                equipo={selectedEquipo}
            />

            <ConfirmModal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                onConfirm={confirmDeleteEquipo}
                title="Eliminar Equipo"
                message="¿Está seguro de eliminar este equipo y todos sus detalles?"
                confirmText="Sí, Eliminar"
                variant="danger"
            />
        </div>
    );
};
