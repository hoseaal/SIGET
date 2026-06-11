import React, { useState } from "react";
import { Card, Nav, Tab } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Componentes
import { GenericMasterTab } from "./components/GenericMasterTab";
import { TabDepartamentos } from "./components/TabDepartamentos";
import { TabModelos } from "./components/TabModelos";
import { TabTipoToner } from "./components/TabTipoToner";

export const ConfiguracionPage = () => {
    // Controlar la pestaña activa
    const [key, setKey] = useState("tiposFalla");

    return (
        <>
            <ToastContainer />
            <div className="container-fluid flex-grow-1 container-p-y">

                <h4 className="fw-bold py-3 mb-4">
                    <span className="text-muted fw-light">Mantenimiento /</span> Configuración de Maestros
                </h4>

                <Card>
                    <Card.Body>
                        <Tab.Container activeKey={key} onSelect={(k) => setKey(k)}>
                            <Nav variant="pills" className="flex-column flex-sm-row mb-4 flex-wrap">
                                <Nav.Item>
                                    <Nav.Link eventKey="tiposFalla">
                                        <i className="bx bx-error-circle me-1"></i> Tipos de Falla
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="tiposActividad">
                                        <i className="bx bx-run me-1"></i> Tipos de Actividad
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="marcas">
                                        <i className="bx bx-purchase-tag me-1"></i> Marcas
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="modelos">
                                        <i className="bx bx-laptop me-1"></i> Modelos
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="pisos">
                                        <i className="bx bx-building me-1"></i> Pisos
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="departamentos">
                                        <i className="bx bx-briefcase me-1"></i> Departamentos
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="tiposEquipo">
                                        <i className="bx bx-desktop me-1"></i> Tipos de Equipo
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="tiposComponente">
                                        <i className="bx bx-chip me-1"></i> Tipos de Componente
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="tiposToner">
                                        <i className="bx bx-droplet me-1"></i> Tipos de Tóner
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className="d-flex align-items-center" eventKey="status">
                                        <i className="bx bx-radio-circle-marked me-1 fs-4"></i> Status
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <Tab.Content className="p-0 border-0 bg-transparent">
                                <Tab.Pane eventKey="tiposFalla">
                                    <GenericMasterTab endpoint="/tipo_act" titleItem="Tipo de Falla" />
                                </Tab.Pane>

                                <Tab.Pane eventKey="tiposActividad">
                                    <GenericMasterTab endpoint="/tipo_act" titleItem="Tipo de Actividad" />
                                </Tab.Pane>

                                <Tab.Pane eventKey="marcas">
                                    <GenericMasterTab endpoint="/marca" titleItem="Marca" />
                                </Tab.Pane>

                                <Tab.Pane eventKey="modelos">
                                    {/* Pasamos el control al componente especializado */}
                                    <TabModelos />
                                </Tab.Pane>

                                <Tab.Pane eventKey="pisos">
                                    <GenericMasterTab endpoint="/piso" titleItem="Piso" />
                                </Tab.Pane>

                                <Tab.Pane eventKey="departamentos">
                                    <TabDepartamentos />
                                </Tab.Pane>

                                <Tab.Pane eventKey="tiposEquipo">
                                    <GenericMasterTab endpoint="/tipo_equipo" titleItem="Tipo de Equipo" />
                                </Tab.Pane>

                                <Tab.Pane eventKey="tiposComponente">
                                    <GenericMasterTab endpoint="/tipo_componente" titleItem="Tipo de Componente" />
                                </Tab.Pane>

                                <Tab.Pane eventKey="tiposToner">
                                    <TabTipoToner />
                                </Tab.Pane>

                                <Tab.Pane eventKey="status">
                                    <GenericMasterTab endpoint="/status" titleItem="Status" />
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
};
