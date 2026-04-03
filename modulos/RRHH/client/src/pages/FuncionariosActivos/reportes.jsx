import React from 'react';
import { useState, useEffect } from 'react';
import ModalActaVerificacion from '../Modales/modalActaVerificacion'; // Asegúrate de que esta ruta sea correcta
import { Container, Row, Col, Card, Button } from 'react-bootstrap'; // Importa los componentes de React-Bootstrap
import ModalGenerarEtiquetas from '../Modales/modalGenerarEtiquetas';

export const Reportes = () => {
    const [showVeriModal, setShowVeriModal] = useState(false);
    const [showEtiquetasModal, setShowEtiquetasModal] = useState(false);

    const handleOpenEtiquetasModal = () => setShowEtiquetasModal(true);

    const handleCloseEtiquetasModal = () => setShowEtiquetasModal(false);

    const handleOpenModal = () => setShowVeriModal(true);

    const handleCloseModal = () => {
        console.log("Cerrando modal...", showVeriModal);
        setShowVeriModal(false);
    };



    return (
        <Container fluid className="py-3"> {/* Contenedor fluido para ocupar todo el ancho */}
            <Row className="mb-4">
                <Col>
                    <h4 className="py-3 mb-0"><span className="text-muted fw-light">Gestion de Archivos/ </span> Reportes</h4>
                </Col>
            </Row>
            <Card className="shadow-sm"> {/* Tarjeta principal con sombra */}
                <Card.Header as="h5" className="bg-light text-dark">
                    Generación de Reportes
                </Card.Header>
                <Card.Body>

                    <Row className="g-4"> {/* Fila para organizar las tarjetas de reportes con espaciado */}
                        <Col md={6} lg={4}> {/* Columnas responsivas: 2 en mediano, 3 en grande */}
                            <Card className="h-100 border-primary"> {/* Tarjeta para Acta de Verificación, destacada */}
                                <Card.Body className="d-flex flex-column justify-content-between">
                                    <Card.Title className="text-primary">Acta de Verificación</Card.Title>
                                    <Card.Text>
                                        Genera un acta detallada para la verificación de inventario de Cada Departamento
                                    </Card.Text>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={handleOpenModal}
                                        className="w-100 mt-auto" // Botón al final de la tarjeta
                                    >
                                        <i className="bx bxs-file-pdf me-2"></i> Generar Acta de Verificación
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} lg={4}>
                            <Card className="h-100"> {/* Tarjeta para Etiquetas */}
                                <Card.Body className="d-flex flex-column justify-content-between">
                                    <Card.Title>Etiquetas de Inventario</Card.Title>
                                    <Card.Text>
                                        Imprime etiquetas de inventario para identificar los bienes muebles de forma rápida y eficiente.
                                    </Card.Text>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        // Aquí puedes añadir la función onClick para generar etiquetas
                                        onClick={handleOpenEtiquetasModal}
                                        className="w-100 mt-auto"
                                    >
                                        <i className="bx bxs-purchase-tag-alt me-2"></i> Generar Etiquetas
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>

                    </Row>
                </Card.Body>
            </Card>

            <ModalActaVerificacion
                show={showVeriModal}
                handleClose={handleCloseModal}
            />

            <ModalGenerarEtiquetas
                show={showEtiquetasModal}
                handleClose={handleCloseEtiquetasModal}
            />
        </Container>
    );
};