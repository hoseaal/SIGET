import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Row, Col, Badge, Spinner, InputGroup, Nav, Pagination } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import helpFetch from "../../utils/helpFetch";
import { exportActividadesToExcel } from "../../utils/exportExcel";
import { exportActividadesToPDF } from "../../utils/exportPDF";
import { exportMensualPDF } from "../../utils/exportMensualPDF";
import { RegistroActividadModal } from "./components/RegistroActividadModal";
import { PaginationComponent } from "../../components/PaginationComponent";

// Helpers para manejo de semanas (Lunes a Viernes)
const getMonday = (d) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
};

const getFriday = (monday) => {
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);
    return friday;
};

const generateWeeksList = (numWeeks = 6) => {
    const weeks = [];
    const currentMonday = getMonday(new Date());

    for (let i = 0; i < numWeeks; i++) {
        const monday = new Date(currentMonday);
        monday.setDate(currentMonday.getDate() - (i * 7));
        const friday = getFriday(monday);

        weeks.push({
            start: monday,
            end: friday,
            label: i === 0 ? "Semana Actual" : `Sem. ${monday.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} - ${friday.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`
        });
    }
    return weeks;
};

export const ActividadesPage = () => {
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepto, setFilterDepto] = useState("");
    const [departamentos, setDepartamentos] = useState([]);
    const [user, setUser] = useState(null);
    const [showRegistro, setShowRegistro] = useState(false);

    // Estado para navegación semanal
    const [weeks] = useState(generateWeeksList());
    const [activeWeekIndex, setActiveWeekIndex] = useState(0);

    // Estado para reporte mensual
    const [viewMode, setViewMode] = useState('semanal'); // 'semanal' o 'mensual'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Estado para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const tableStyle = (
        <style>
            {`
                .extra-small {
                    font-size: 0.65rem;
                    padding: 4px 2px !important;
                    vertical-align: middle;
                    background-color: #f8f9fa;
                    line-height: 1;
                }
                .table-bordered th, .table-bordered td {
                    border: 1px solid #dee2e6 !important;
                }
                .bg-light-header {
                    background-color: #f1f3f5 !important;
                    font-weight: 700;
                }
                .btn-export-excel {
                    background-color: #1d6f42 !important;
                    border-color: #1d6f42 !important;
                    color: white !important;
                }
                .btn-export-excel:hover {
                    background-color: #155231 !important;
                }
            `}
        </style>
    );

    const fetchData = async () => {
        try {
            setLoading(true);
            const [userRes, data, deps] = await Promise.all([
                fetch('/api/auth/verify-auth', { credentials: 'include' }),
                helpFetch.GET("/actividades"),
                helpFetch.GET("/departamento")
            ]);

            const userData = await userRes.json();
            if (userData.success) setUser(userData.user);

            setActividades(data);
            setDepartamentos(deps);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar el historial de actividades");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Resetear a la página 1 cuando cambian los filtros o la semana
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterDepto, activeWeekIndex, viewMode, selectedMonth, selectedYear]);

    const handleExport = () => {
        if (filteredData.length === 0) {
            toast.info("No hay datos para exportar.");
            return;
        }
        exportActividadesToExcel(filteredData);
    };

    const handleExportPDF = () => {
        if (filteredData.length === 0) {
            toast.info("No hay datos para exportar.");
            return;
        }
        exportActividadesToPDF(filteredData);
    };

    const filteredData = actividades.filter(a => {
        // Filtro por término de búsqueda
        const matchesSearch =
            String(a.nro_act || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(a.equipo_nro_bien || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(a.observaciones || "").toLowerCase().includes(searchTerm.toLowerCase());

        // Filtro por departamento
        const matchesDepto = filterDepto === "" || String(a.direc_id) === filterDepto;

        // Si estamos en modo mensual, filtrar por mes/año
        if (viewMode === 'mensual') {
            const date = new Date(a.fecha);
            return matchesSearch && matchesDepto && date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
        }

        // Filtro por rango de fecha (Semana seleccionada - Solo modo semanal)
        const activityDate = new Date(a.fecha);
        const currentWeek = weeks[activeWeekIndex];
        const matchesWeek = activityDate >= currentWeek.start && activityDate <= currentWeek.end;

        return matchesSearch && matchesDepto && matchesWeek;
    });

    // Paginación de los datos filtrados
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);


    // Lógica para procesar el consolidado mensual
    const getMonthlyConsolidated = () => {
        const monthlyData = actividades.filter(a => {
            const date = new Date(a.fecha);
            return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
        });

        // Crear mapa de departamentos
        const consolidated = departamentos.map(dept => {
            const deptActs = monthlyData.filter(a => a.direc_id === dept.id);
            return {
                id: dept.id,
                nombre: dept.nombre,
                cat1: deptActs.filter(a => a.clasificacion_id === 1).length, // Prev SW
                cat2: deptActs.filter(a => a.clasificacion_id === 2).length, // Prev HW
                cat3: deptActs.filter(a => a.clasificacion_id === 3).length, // Corr SW
                cat4: deptActs.filter(a => a.clasificacion_id === 4).length, // Corr HW
                cat5: deptActs.filter(a => a.clasificacion_id === 5).length, // Plat Serv
                cat6: deptActs.filter(a => a.clasificacion_id === 6).length, // Plat Inf
            };
        });

        // Calcular Totales
        const totals = consolidated.reduce((acc, curr) => {
            acc.cat1 += curr.cat1; acc.cat2 += curr.cat2; acc.cat3 += curr.cat3;
            acc.cat4 += curr.cat4; acc.cat5 += curr.cat5; acc.cat6 += curr.cat6;
            return acc;
        }, { cat1: 0, cat2: 0, cat3: 0, cat4: 0, cat5: 0, cat6: 0 });

        return { data: consolidated, totals };
    };

    const monthlyReport = getMonthlyConsolidated();

    return (
        <div className="container-fluid flex-grow-1 container-p-y">
            {tableStyle}
            <ToastContainer />
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Soporte /</span> Historial de Actividades
            </h4>

            <RegistroActividadModal
                show={showRegistro}
                onHide={() => setShowRegistro(false)}
                onSuccess={fetchData}
                user={user}
            />

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-transparent pb-0">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <h5 className="mb-0">
                            {viewMode === 'semanal' ? 'Registro de Actividades' : 'Reporte Mensual'}
                        </h5>
                        <div className="d-flex gap-2">
                            <Button variant="primary" onClick={() => setShowRegistro(true)}>
                                <i className="bx bx-plus me-1"></i> Registrar Actividad
                            </Button>
                            <Button variant="outline-primary" onClick={fetchData}>
                                <i className="bx bx-refresh me-1"></i> Actualizar
                            </Button>
                            {viewMode === 'semanal' && (
                                <>
                                    <Button className="btn-export-excel" onClick={handleExport}>
                                        <i className="bx bxs-file-export me-1"></i> Exportar Excel
                                    </Button>
                                    <Button variant="danger" onClick={handleExportPDF}>
                                        <i className="bx bxs-file-pdf me-1"></i> Exportar PDF
                                    </Button>
                                </>
                            )}
                            {viewMode === 'mensual' && (
                                <Button variant="danger" onClick={() => {
                                    const monthLabels = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                                    exportMensualPDF(monthlyReport, monthLabels[selectedMonth], selectedYear);
                                }}>
                                    <i className="bx bxs-file-pdf me-1"></i> Exportar PDF
                                </Button>
                            )}
                        </div>
                    </div>

                    <Nav variant="pills" activeKey={viewMode} onSelect={(k) => setViewMode(k)} className="mb-0 px-2">
                        <Nav.Item>
                            <Nav.Link eventKey="semanal"><i className="bx bx-list-ul me-1"></i> Reporte Semanal</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="mensual"><i className="bx bx-calendar-event me-1"></i> Reporte Mensual</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body>
                    {viewMode === 'semanal' ? (
                        <>
                            {/* Filtros */}
                            <Row className="mb-5 g-3 mt-2">
                                <Col md={6}>
                                    <InputGroup>
                                        <InputGroup.Text><i className="bx bx-search"></i></InputGroup.Text>
                                        <Form.Control
                                            placeholder="Buscar por Nro. de Bien u Observaciones..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={4}>
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
                                <Col md={2}>
                                    <Button variant="secondary" className="w-100" onClick={() => { setSearchTerm(""); setFilterDepto(""); }}>
                                        Limpiar
                                    </Button>
                                </Col>
                            </Row>
                            {/* Navegación Semanal */}
                            <Nav variant="tabs" activeKey={activeWeekIndex} onSelect={(k) => setActiveWeekIndex(parseInt(k))} className="mb-0 ">
                                {weeks.map((week, index) => (
                                    <Nav.Item key={index}>
                                        <Nav.Link eventKey={index} className="small px-3">
                                            <i className={`bx bx-calendar${index === 0 ? '-check' : ''} me-1`}></i>
                                            {week.label}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>


                            <Table responsive bordered hover className="align-middle text-center">
                                <thead className="table-light">
                                    <tr>
                                        <th rowSpan="2" className="align-middle">DIRECCION SOLICITANTE</th>
                                        <th rowSpan="2" className="align-middle">DESCRIPCION DEL REPORTE</th>
                                        <th rowSpan="2" className="align-middle">BM</th>
                                        <th colSpan="2">MANT. PREVENTIVO</th>
                                        <th colSpan="2">MANT. CORRECTIVO</th>
                                        <th colSpan="2">PLAT. TECNOLOGICA</th>
                                        <th rowSpan="2" className="align-middle">OBSERVACIONES</th>
                                    </tr>
                                    <tr>
                                        <th className="extra-small">SOFTWARE</th>
                                        <th className="extra-small">HARDWARE</th>
                                        <th className="extra-small">SOFTWARE</th>
                                        <th className="extra-small">HARDWARE</th>
                                        <th className="extra-small">SERVICIOS / REDES</th>
                                        <th className="extra-small">INFORMES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="10" className="text-center py-5">
                                                <Spinner animation="border" variant="primary" />
                                                <p className="mt-2 mb-0">Cargando actividades...</p>
                                            </td>
                                        </tr>
                                    ) : filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="text-center py-5 text-muted">
                                                <div className="mb-2"><i className="bx bx-info-circle fs-1"></i></div>
                                                No se encontraron actividades registradas.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map(a => (
                                            <tr key={a.id}>
                                                <td className="text-start small">{a.depto_nombre}</td>
                                                <td className="text-start small">{a.tipo_act_nombre}</td>
                                                <td><span className="fw-bold">{a.equipo_nro_bien || '-'}</span></td>

                                                {/* Mant. Preventivo */}
                                                <td className="fw-bold">{a.clasificacion_id === 1 ? '1' : ''}</td>
                                                <td className="fw-bold">{a.clasificacion_id === 2 ? '1' : ''}</td>

                                                {/* Mant. Correctivo */}
                                                <td className="fw-bold">{a.clasificacion_id === 3 ? '1' : ''}</td>
                                                <td className="fw-bold">{a.clasificacion_id === 4 ? '1' : ''}</td>

                                                {/* Plat. Tecnológica */}
                                                <td className="fw-bold">{a.clasificacion_id === 5 ? '1' : ''}</td>
                                                <td className="fw-bold">{a.clasificacion_id === 6 ? '1' : ''}</td>

                                                <td className="text-start">
                                                    <div className="text-truncate small" style={{ maxWidth: '200px' }} title={a.observaciones}>
                                                        {a.observaciones}
                                                    </div>
                                                    <div className="extra-small text-muted mt-1">
                                                        {new Date(a.fecha).toLocaleDateString()} - {a.usuario_nombre}
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
                        </>
                    ) : (
                        <>
                            {/* Filtros Mensuales */}
                            <Row className="mb-4 g-3 align-items-end py-4">
                                <Col md={3}>
                                    <Form.Label className="small fw-bold">Mes del Reporte</Form.Label>
                                    <Form.Select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                                        {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => (
                                            <option key={i} value={i}>{m}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={2}>
                                    <Form.Label className="small fw-bold">Año</Form.Label>
                                    <Form.Select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                                        {[2024, 2025, 2026].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={7} className="text-end">
                                    <Badge bg="secondary" className="p-2">
                                        <i className="bx bx-info-circle me-1"></i> Resumen de servicios agrupados por dirección
                                    </Badge>
                                </Col>
                            </Row>

                            <Table responsive bordered className="align-middle text-center table-sm">
                                <thead className="table-light">
                                    <tr className="bg-light-header">
                                        <th rowSpan="2" className="align-middle" style={{ width: '40px' }}>Nro.</th>
                                        <th rowSpan="2" className="align-middle text-start">DIRECCION SOLICITANTE</th>
                                        <th colSpan="2">MANT. PREVENTIVO</th>
                                        <th colSpan="2">MANT. CORRECTIVO</th>
                                        <th colSpan="2">PLAT. TECNOLOGICA</th>
                                    </tr>
                                    <tr className="bg-light-header">
                                        <th className="extra-small">SOFTWARE</th>
                                        <th className="extra-small">HARDWARE</th>
                                        <th className="extra-small">SOFTWARE</th>
                                        <th className="extra-small">HARDWARE</th>
                                        <th className="extra-small">SERVICIOS / REDES</th>
                                        <th className="extra-small">INFORMES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyReport.data.map((row, i) => (
                                        <tr key={row.id}>
                                            <td>{i + 1}</td>
                                            <td className="text-start small">{row.nombre}</td>
                                            <td className="fw-bold">{row.cat1 || ''}</td>
                                            <td className="fw-bold">{row.cat2 || ''}</td>
                                            <td className="fw-bold">{row.cat3 || ''}</td>
                                            <td className="fw-bold">{row.cat4 || ''}</td>
                                            <td className="fw-bold">{row.cat5 || ''}</td>
                                            <td className="fw-bold">{row.cat6 || ''}</td>
                                        </tr>
                                    ))}
                                    <tr className="table-secondary fw-bold">
                                        <td colSpan="2" className="text-end">SUB-TOTALES</td>
                                        <td>{monthlyReport.totals.cat1}</td>
                                        <td>{monthlyReport.totals.cat2}</td>
                                        <td>{monthlyReport.totals.cat3}</td>
                                        <td>{monthlyReport.totals.cat4}</td>
                                        <td>{monthlyReport.totals.cat5}</td>
                                        <td>{monthlyReport.totals.cat6}</td>
                                    </tr>
                                </tbody>
                            </Table>

                            <Card className="mt-4 border-0 bg-light">
                                <Card.Body className="p-3">
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                <span>MANTENIMIENTOS PREVENTIVOS Y CORRECTIVOS DE HARDWARE</span>
                                                <span className="fw-bold">{monthlyReport.totals.cat2 + monthlyReport.totals.cat4}</span>
                                            </div>
                                            <div className="d-flex justify-content-between border-bottom pb-2">
                                                <span>MANTENIMIENTOS PREVENTIVOS Y CORRECTIVOS DE SOFTWARE</span>
                                                <span className="fw-bold">{monthlyReport.totals.cat1 + monthlyReport.totals.cat3}</span>
                                            </div>
                                        </Col>
                                        <Col md={6} className="d-flex align-items-center justify-content-end">
                                            <div className="text-end">
                                                <h5 className="mb-0 text-primary">TOTAL DE SERVICIOS DEL MES</h5>
                                                <h2 className="mb-0 fw-bold">{Object.values(monthlyReport.totals).reduce((a, b) => a + b, 0)}</h2>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};
