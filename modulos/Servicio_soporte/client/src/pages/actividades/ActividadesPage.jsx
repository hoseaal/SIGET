import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Row, Col, Badge, Spinner, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import helpFetch from "../../utils/helpFetch";

export const ActividadesPage = () => {
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepto, setFilterDepto] = useState("");
    const [departamentos, setDepartamentos] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [data, deps] = await Promise.all([
                helpFetch.GET("/actividades"),
                helpFetch.GET("/departamento")
            ]);
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
            <ToastContainer />
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Soporte /</span> Historial de Actividades
            </h4>

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Registro General de Actividades SM</h5>
                    <Button variant="outline-primary" size="sm" onClick={fetchData}>
                        <i className="bx bx-refresh me-1"></i> Actualizar
                    </Button>
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

                    <Table responsive hover className="align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Nro. Act</th>
                                <th>Fecha</th>
                                <th>Departamento</th>
                                <th>Equipo</th>
                                <th>Tipo / Descripción</th>
                                <th>Observaciones</th>
                                <th>Técnico</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 mb-0">Cargando actividades...</p>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        No se encontraron actividades registradas.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map(a => (
                                    <tr key={a.id}>
                                        <td><span className="fw-bold text-primary">{a.nro_act}</span></td>
                                        <td>
                                            <div className="small">{new Date(a.fecha).toLocaleDateString()}</div>
                                            <div className="text-muted extra-small">{new Date(a.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        </td>
                                        <td><div className="small">{a.depto_nombre}</div></td>
                                        <td>
                                            <div className="fw-bold">{a.equipo_nro_bien || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <div className="small fw-bold">{a.tipo_act_nombre}</div>
                                            <div className="extra-small text-muted">{a.descripcion_nombre}</div>
                                        </td>
                                        <td>
                                            <div className="text-truncate small" style={{maxWidth: '250px'}} title={a.observaciones}>
                                                {a.observaciones}
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg="label-primary" className="bg-label-primary text-primary">
                                                {a.usuario_nombre}
                                            </Badge>
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
