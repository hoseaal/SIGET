import React, { useState } from "react";
import { Card, Nav, Tab } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Componentes Redes
import { TabPanelSoport } from "./components/TabPanelSoport";
import { TabPuertosPanelS } from "./components/TabPuertosPanelS";
import { TabPanelPared } from "./components/TabPanelPared";
import { TabPuertos } from "./components/TabPuertos";

export const RedesPage = () => {
    // Controlar la pestaña activa
    const [key, setKey] = useState("panelsoport");

    return (
        <>
            <ToastContainer />
            <div className="container-fluid flex-grow-1 container-p-y">
                
                <h4 className="fw-bold py-3 mb-4">
                    <span className="text-muted fw-light">Infraestructura /</span> Lógica de Redes
                </h4>
                
                <Card>
                    <Card.Body>
                        <Tab.Container activeKey={key} onSelect={(k) => setKey(k)}>
                            <Nav variant="tabs" className="flex-column flex-sm-row mb-4 flex-wrap">
                                <Nav.Item>
                                    <Nav.Link eventKey="panelsoport">
                                        <i className="bx bx-server me-1"></i> Paneles de Soporte
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="puertos_panel">
                                        <i className="bx bx-plug me-1"></i> Puertos en Panel
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="panel_pared">
                                        <i className="bx bx-layer me-1"></i> Rosetas / Pared
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="puertos">
                                        <i className="bx bx-desktop me-1"></i> Puertos a Usuario
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <Tab.Content className="p-0 border-0 bg-transparent">
                                
                                <Tab.Pane eventKey="panelsoport">
                                    <TabPanelSoport />
                                </Tab.Pane>
                                
                                <Tab.Pane eventKey="puertos_panel">
                                    <TabPuertosPanelS />
                                </Tab.Pane>
                                
                                <Tab.Pane eventKey="panel_pared">
                                    <TabPanelPared />
                                </Tab.Pane>
                                
                                <Tab.Pane eventKey="puertos">
                                    <TabPuertos />
                                </Tab.Pane>
                                
                            </Tab.Content>
                        </Tab.Container>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
};
