import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Row, Col, Badge, Spinner, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import helpFetch from "../../utils/helpFetch";
import { exportActividadesToExcel } from "../../utils/exportExcel";
import { RegistroActividadModal } from "./components/RegistroActividadModal";

export const ActividadesPage = () => {
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepto, setFilterDepto] = useState("");
    const [departamentos, setDepartamentos] = useState([]);
    const [user, setUser] = useState(null);
    const [showRegistro, setShowRegistro] = useState(false);

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

    const handleExport = () => {
        if (filteredData.length === 0) {
            toast.info("No hay datos para exportar.");
            return;
        }
        exportActividadesToExcel(filteredData);
    };

    const filteredData = actividades.filter(a => {
        const matchesSearch = 
            String(a.nro_act || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(a.equipo_nro_bien || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(a.observaciones || "").toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepto = filterDepto === "" || String(a.direc_id) === filterDepto;
        
        return matchesSearch && matchesDepto;
    });

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
                <Card.Header className="bg-transparent d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h5 className="mb-0">Registro General de Actividades SM</h5>
                    <div className="d-flex gap-2">
                        <Button variant="primary" size="sm" onClick={() => setShowRegistro(true)}>
                            <i className="bx bx-plus me-1"></i> Registrar Actividad
                        </Button>
                        <Button variant="outline-primary" size="sm" onClick={fetchData}>
                            <i className="bx bx-refresh me-1"></i> Actualizar
                        </Button>
                        <Button className="btn-export-excel" size="sm" onClick={handleExport}>
                            <i className="bx bxs-file-export me-1"></i> Exportar Excel
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {/* Filtros */}
                    <Row className="mb-4 g-3">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text><i className="bx bx-search"></i></InputGroup.Text>
                                <Form.Control
                                    placeholder="Buscar por Nro. Actividad, Bien u Observaciones..."
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
                                        No se encontraron actividades registradas.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map(a => (
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
                                            <div className="text-truncate small" style={{maxWidth: '200px'}} title={a.observaciones}>
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
                </Card.Body>
            </Card>
        </div>
    );
};
