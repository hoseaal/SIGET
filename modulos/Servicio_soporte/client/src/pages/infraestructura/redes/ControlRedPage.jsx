import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, Button, Form, Spinner, Row, Col, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import helpFetch from "../../../utils/helpFetch";
import { ModalDetalleEquipo } from "../../equipos/components/ModalDetalleEquipo";
import { ConfirmModal } from "../../../components/ConfirmModal";
import "./ControlRed.css"; // Estilos de diseño premium e interactivo

export const ControlRedPage = () => {
    const [pisos, setPisos] = useState([]);
    const [selectedPiso, setSelectedPiso] = useState("");
    const [croquis, setCroquis] = useState(null);
    const [puntos, setPuntos] = useState([]);
    const [puertosDisponibles, setPuertosDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPuntos, setLoadingPuntos] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Modal para detalles y asignación/edición de puerto
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null); // { id, x_pct, y_pct, puerto_id }
    const [assignedPuertoId, setAssignedPuertoId] = useState("");
    const [showFichaModal, setShowFichaModal] = useState(false);
    const [equipoFicha, setEquipoFicha] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const imageContainerRef = useRef(null);

    useEffect(() => {
        const fetchPisos = async () => {
            try {
                setLoading(true);
                const data = await helpFetch.GET("/piso");
                setPisos(data);
            } catch (error) {
                console.error(error);
                toast.error("Error al cargar los pisos");
            } finally {
                setLoading(false);
            }
        };
        fetchPisos();
    }, []);

    useEffect(() => {
        if (selectedPiso) {
            fetchCroquisYPoints(selectedPiso);
        } else {
            setCroquis(null);
            setPuntos([]);
        }
    }, [selectedPiso]);

    const fetchCroquisYPoints = async (pisoId) => {
        try {
            setLoadingPuntos(true);
            const croquisData = await helpFetch.GET(`/croquis/piso/${pisoId}`);
            if (croquisData) {
                setCroquis(croquisData);
                setShowUploadForm(false);
                // Cargar puntos del croquis
                const puntosData = await helpFetch.GET(`/puntos_red_posicion/croquis/${croquisData.id}`);
                setPuntos(puntosData);
            } else {
                setCroquis(null);
                setPuntos([]);
                setShowUploadForm(true);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar croquis y puntos de red");
        } finally {
            setLoadingPuntos(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUploadCroquis = async (e) => {
        e.preventDefault();
        if (!selectedFile || !selectedPiso) {
            toast.warning("Por favor, seleccione un archivo de croquis.");
            return;
        }

        const formData = new FormData();
        formData.append("imagen", selectedFile);
        formData.append("piso_id", selectedPiso);

        try {
            setLoadingPuntos(true);
            // Usamos un fetch estándar porque helpFetch.POST por defecto serializa a JSON
            const response = await fetch("/api/croquis", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Error al subir croquis");
            }

            toast.success("Plano/Croquis subido correctamente");
            setSelectedFile(null);
            fetchCroquisYPoints(selectedPiso);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al subir el croquis");
        } finally {
            setLoadingPuntos(false);
        }
    };

    const handleImageClick = async (e) => {
        if (!croquis || !imageContainerRef.current) return;

        // Evitar que el clic en un pin existente propague el clic a la imagen
        if (e.target.closest(".red-pin")) return;

        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Abrir modal de asignación para crear un nuevo punto
        setSelectedPoint({
            id: null, // indica que es nuevo
            x_pct: x.toFixed(2),
            y_pct: y.toFixed(2),
            puerto_id: ""
        });
        setAssignedPuertoId("");

        // Cargar puertos disponibles para el piso
        await loadAvailablePuertos(selectedPiso);
        setShowAssignModal(true);
    };

    const handlePinClick = (point) => {
        setSelectedPoint(point);
        setShowDetailsModal(true);
    };

    const loadAvailablePuertos = async (pisoId, currentPuertoId = null) => {
        try {
            const url = `/puntos_red_posicion/disponibles/piso/${pisoId}${currentPuertoId ? `?currentPuertoId=${currentPuertoId}` : ""}`;
            const data = await helpFetch.GET(url);
            setPuertosDisponibles(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar puertos disponibles");
        }
    };

    const requestConfirm = useCallback((config) => {
        setConfirmAction(config);
        setShowConfirmModal(true);
    }, []);

    const handleOpenFichaTecnica = async (equipoId) => {
        try {
            const data = await helpFetch.GET("/equipo");
            const found = data.find(e => e.id === equipoId);
            setEquipoFicha(found || null);
            setShowFichaModal(true);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar datos del equipo");
        }
    };

    const handleSaveAssignment = async () => {
        if (!assignedPuertoId) {
            toast.warning("Por favor, seleccione un puerto de red.");
            return;
        }

        try {
            if (selectedPoint.id === null) {
                // Crear punto posicionado
                await helpFetch.POST("/puntos_red_posicion", {
                    croquis_id: croquis.id,
                    puerto_id: parseInt(assignedPuertoId),
                    x_pct: parseFloat(selectedPoint.x_pct),
                    y_pct: parseFloat(selectedPoint.y_pct)
                });
                toast.success("Punto de red ubicado con éxito");
            } else {
                // Actualizar punto
                await helpFetch.PUT(`/puntos_red_posicion/${selectedPoint.id}`, {
                    puerto_id: parseInt(assignedPuertoId),
                    x_pct: parseFloat(selectedPoint.x_pct),
                    y_pct: parseFloat(selectedPoint.y_pct)
                });
                toast.success("Asignación de puerto actualizada");
            }
            setShowAssignModal(false);
            fetchCroquisYPoints(selectedPiso);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al guardar asignación");
        }
    };

    const handleDeletePoint = async () => {
        if (!selectedPoint || selectedPoint.id === null) return;

        try {
            await helpFetch.DELETE(`/puntos_red_posicion/${selectedPoint.id}`);
            toast.success("Punto de red removido del plano");
            setShowAssignModal(false);
            fetchCroquisYPoints(selectedPiso);
        } catch (error) {
            console.error(error);
            toast.error("Error al remover el punto");
        }
    };

    const handleDeleteCroquis = async () => {
        if (!croquis) return;
        requestConfirm({
            title: "Eliminar Plano Completo",
            message: "¿Seguro que deseas eliminar el plano completo? Se desvincularán todos los puntos mapeados.",
            variant: "danger",
            confirmText: "Sí, Eliminar",
            onConfirm: async () => {
                try {
                    setLoadingPuntos(true);
                    await helpFetch.DELETE(`/croquis/${croquis.id}`);
                    toast.success("Plano de piso eliminado correctamente");
                    setCroquis(null);
                    setPuntos([]);
                    setShowUploadForm(true);
                } catch (error) {
                    console.error(error);
                    toast.error("Error al eliminar plano");
                } finally {
                    setLoadingPuntos(false);
                    setShowConfirmModal(false);
                }
            }
        });
    };

    return (
        <div className="container-fluid flex-grow-1 container-p-y">
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Infraestructura /</span> Control y Mapeo de Red
            </h4>

            <Card className="mb-4 premium-card shadow-sm border-0">
                <Card.Body className="glassmorphic-body">
                    <Row className="align-items-center">
                        <Col md={6} lg={4}>
                            <Form.Group className="mb-0">
                                <Form.Label className="fw-semibold text-muted small uppercase">Seleccione el Piso</Form.Label>
                                <Form.Select
                                    value={selectedPiso}
                                    onChange={(e) => setSelectedPiso(e.target.value)}
                                    className="custom-select-premium"
                                >
                                    <option value="">-- Seleccionar Piso --</option>
                                    {pisos.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        {croquis && (
                            <Col className="text-end mt-3 mt-md-0">
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={handleDeleteCroquis}
                                    className="me-2 rounded-pill shadow-xs"
                                >
                                    <i className="bx bx-trash me-1"></i> Eliminar Plano
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setShowUploadForm(!showUploadForm)}
                                    className="rounded-pill shadow-xs"
                                >
                                    <i className="bx bx-sync me-1"></i> {showUploadForm ? "Ver Plano" : "Reemplazar Plano"}
                                </Button>
                            </Col>
                        )}
                    </Row>
                </Card.Body>
            </Card>

            {loadingPuntos ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Cargando datos del piso seleccionado...</p>
                </div>
            ) : (
                selectedPiso && (
                    <>
                        {showUploadForm && (
                            <Card className="premium-card mb-4 border-0 shadow-sm animate-fade-in">
                                <Card.Body className="p-4 text-center">
                                    <h5 className="mb-3 text-primary">Subir Plano / Croquis de Red</h5>
                                    <p className="text-muted small mb-4">
                                        Selecciona una imagen de plano (PNG, JPG, SVG) del piso actual para mapear los puertos finales.
                                    </p>
                                    <Form onSubmit={handleUploadCroquis} className="d-flex flex-column align-items-center">
                                        <div className="upload-dropzone mb-3">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                id="croquisFile"
                                                className="upload-input"
                                            />
                                            <label htmlFor="croquisFile" className="upload-label">
                                                <i className="bx bx-cloud-upload display-4 text-primary mb-2"></i>
                                                <span>{selectedFile ? selectedFile.name : "Seleccionar Archivo de Imagen"}</span>
                                            </label>
                                        </div>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="px-4 py-2 rounded-pill shadow"
                                            disabled={!selectedFile}
                                        >
                                            Subir Plano
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        )}

                        {croquis && !showUploadForm && (
                            <Card className="premium-card border-0 shadow-sm overflow-hidden mb-4">
                                <Card.Header className="bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-1 fw-bold">Distribución Física de Puertos</h5>
                                        <p className="text-muted small mb-0">
                                            Haz clic en cualquier punto del croquis para registrar y asignar un puerto de red.
                                        </p>
                                    </div>
                                    <div className="badge bg-label-primary rounded-pill px-3 py-2">
                                        <i className="bx bx-pin me-1"></i> {puntos.length} Puertos Mapeados
                                    </div>
                                </Card.Header>
                                <Card.Body className="p-4 text-center d-flex justify-content-center">
                                    <div className="croquis-workspace-wrapper">
                                        <div
                                            ref={imageContainerRef}
                                            className="croquis-container"
                                            onClick={handleImageClick}
                                        >
                                            <img
                                                src={croquis.imagen_url}
                                                alt={`Plano de red piso`}
                                                className="croquis-image"
                                            />
                                            {puntos.map((point) => (
                                                <div
                                                    key={point.id}
                                                    className="red-pin"
                                                    style={{
                                                        left: `${point.x_pct}%`,
                                                        top: `${point.y_pct}%`,
                                                    }}
                                                    onClick={() => handlePinClick(point)}
                                                    title={`Puerto: ${point.nro_puerto}`}
                                                >
                                                    <span className="pin-pulse"></span>
                                                    {point.nro_puerto}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </>
                )
            )}

            {/* Modal para configurar puerto */}
            <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered backdrop="static">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">
                        {selectedPoint?.id ? "Editar Ubicación de Red" : "Mapear Nuevo Puerto"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted small mb-3">
                        Asigna un puerto disponible en este piso a la coordenada seleccionada (X: {selectedPoint?.x_pct}%, Y: {selectedPoint?.y_pct}%).
                    </p>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Seleccionar Puerto de Red</Form.Label>
                        <Form.Select
                            value={assignedPuertoId}
                            onChange={(e) => setAssignedPuertoId(e.target.value)}
                            className="form-select-premium"
                        >
                            <option value="">-- Seleccionar Puerto --</option>
                            {puertosDisponibles.map((p) => (
                                <option key={p.id} value={p.id}>
                                    Roseta #{p.panel_id} - Puerto: {p.nro_puerto} {p.is_patch_panel1 ? "(Principal)" : ""}
                                </option>
                            ))}
                        </Form.Select>
                        {puertosDisponibles.length === 0 && (
                            <Form.Text className="text-danger">
                                No hay más puertos libres registrados para este piso. Créalos primero en "Lógica de Red".
                            </Form.Text>
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    {selectedPoint?.id && (
                        <Button variant="danger" onClick={handleDeletePoint} className="me-auto rounded-pill px-3">
                            Remover Punto
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => setShowAssignModal(false)} className="rounded-pill px-3">
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSaveAssignment}
                        disabled={!assignedPuertoId}
                        className="rounded-pill px-4"
                    >
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de Detalles del Punto de Red */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-primary">
                        Detalles del Punto de Red
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    <div className="table-responsive">
                        <table className="table table-bordered table-sm mb-0">
                            <tbody>
                                <tr>
                                    <th className="bg-light" style={{ width: '40%' }}>Puerto de Red</th>
                                    <td><strong>{selectedPoint?.nro_puerto}</strong></td>
                                </tr>
                                <tr>
                                    <th className="bg-light">Ubicación (Roseta)</th>
                                    <td>Roseta #{selectedPoint?.panel_id} {selectedPoint?.is_patch_panel1 ? '(Principal)' : ''}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h6 className="mt-4 mb-2 fw-semibold text-secondary d-flex align-items-center">
                        <i className="bx bx-desktop me-1"></i> Dispositivo Conectado
                    </h6>

                    {selectedPoint?.equipo_id ? (
                        <div className="table-responsive">
                            <table className="table table-bordered table-sm mb-0">
                                <tbody>
                                    <tr>
                                        <th className="bg-light" style={{ width: '40%' }}>Tipo de Equipo</th>
                                        <td>{selectedPoint?.tipo_equipo_nombre || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <th className="bg-light">Bien Mueble (Activo)</th>
                                        <td><strong>{selectedPoint?.nro_bien || 'N/A'}</strong></td>
                                    </tr>
                                    <tr>
                                        <th className="bg-light">Nombre de Equipo</th>
                                        <td>{selectedPoint?.nombre_equipo || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <th className="bg-light">Dirección IP</th>
                                        <td>{selectedPoint?.ip ? <code className="text-primary">{selectedPoint.ip}</code> : 'N/A'}</td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                    ) : (
                        <div className="alert alert-warning py-2 mb-0 small">
                            <i className="bx bx-info-circle me-1"></i> No hay ningún equipo registrado a este puerto en la base de datos de inventario.
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                            requestConfirm({
                                title: "Remover Punto de Red",
                                message: "¿Seguro que deseas remover este punto de red del plano?",
                                variant: "danger",
                                confirmText: "Sí, Remover",
                                onConfirm: async () => {
                                    try {
                                        await helpFetch.DELETE(`/puntos_red_posicion/${selectedPoint.id}`);
                                        toast.success("Punto de red removido");
                                        setShowDetailsModal(false);
                                        setShowConfirmModal(false);
                                        fetchCroquisYPoints(selectedPiso);
                                    } catch (error) {
                                        toast.error("Error al remover el punto");
                                        setShowConfirmModal(false);
                                    }
                                }
                            });
                        }}
                        className="me-auto rounded-pill px-3"
                    >
                        <i className="bx bx-trash"></i>
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenFichaTecnica(selectedPoint.equipo_id)}
                        className="rounded-pill px-3"
                    >
                        <i className="bx bx-file me-1"></i> Ver Ficha Técnica
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={async () => {
                            setShowDetailsModal(false);
                            setAssignedPuertoId(String(selectedPoint.puerto_id));
                            await loadAvailablePuertos(selectedPiso, selectedPoint.puerto_id);
                            setShowAssignModal(true);
                        }}
                        className="rounded-pill px-3"
                    >
                        <i className="bx bx-edit me-1"></i> Reasignar Puerto
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setShowDetailsModal(false)} className="rounded-pill px-3">
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            <ModalDetalleEquipo
                show={showFichaModal}
                onHide={() => setShowFichaModal(false)}
                equipo={equipoFicha}
            />

            <ConfirmModal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                onConfirm={confirmAction?.onConfirm}
                title={confirmAction?.title}
                message={confirmAction?.message}
                confirmText={confirmAction?.confirmText}
                variant={confirmAction?.variant}
            />
        </div>
    );
};
