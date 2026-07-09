import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from "../../components/atoms/Alert"; // Asegúrate que la ruta sea correcta

function ModalDesincorporarBien({ show, handleClose, BienId, onSuccess }) {
    // Existing states for desincorporation logic
    const [comIde, setComIde] = useState('');
    const [bimFed, setBimFed] = useState('');

    // States for modal communication
    const [formEnviado, setFormEnviado] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState('danger');

    // States for bien search
    const [bienData, setBienData] = useState(null);
    const [codigoBienInput, setCodigoBienInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false); // New state for PDF generation loading

    // --- STATES FOR PDF DATA (User Inputs) ---
    const [numeroActa, setNumeroActa] = useState(''); // For the main acta number
    const [nombreDirectorAdmin, setNombreDirectorAdmin] = useState('');
    const [ciDirectorAdmin, setCiDirectorAdmin] = useState('');
    const [nombreDirectorAsignacion, setNombreDirectorAsignacion] = useState(''); // Corresponds to Director(a) o Jefe de Oficina
    const [ciDirectorAsignacion, setCiDirectorAsignacion] = useState('');
    const [unidadAdministrativa, setUnidadAdministrativa] = useState(''); // For Director(a) de (unidad adminstrativa)
    const [nombreJefeCompras, setNombreJefeCompras] = useState('');
    const [ciJefeCompras, setCiJefeCompras] = useState('');
    const [nombreAnalistaBienes, setNombreAnalistaBienes] = useState('');
    const [ciAnalistaBienes, setCiAnalistaBienes] = useState('');
    const [numeroActaDesincorporacion, setNumeroActaDesincorporacion] = useState(''); // Acta number for the desincorporation document
    const [fechaActaDesincorporacion, setFechaActaDesincorporacion] = useState(''); // Date string for desincorporation acta
    const [nombreFuncionarioElabora, setNombreFuncionarioElabora] = useState('');

    // Conceptos de Movimiento (existing state, will still be fetched)
    const [conceptoMov, setConceptoMov] = useState([]);

    // Hook to fetch bien data if BienId is provided
    useEffect(() => {
        if (BienId) {
            fetchBienData(BienId);
        }
    }, [BienId]);

    // Clean up state when modal closes
    useEffect(() => {
        if (!show) {
            limpiarFormulario();
        }
    }, [show]);

    // Fetch only Conceptos de Movimiento
    useEffect(() => {
        const fetchConceptosMov = async () => {
            try {
                const conceptosMovRes = await fetch('/api/rrhh/conceptos-movimiento');
                const conceptosMovData = await conceptosMovRes.json();
                setConceptoMov(conceptosMovData);
            } catch (error) {
                console.error('Error al cargar los conceptos de movimiento:', error);
                setTipoMensaje('danger');
                setMensaje('Error al cargar conceptos de movimiento.');
            }
        };

        fetchConceptosMov();
    }, []);

    const limpiarFormulario = () => {
        setBienData(null);
        setCodigoBienInput('');
        setComIde('');
        setBimFed('');
        setMensaje('');
        setTipoMensaje('danger'); // Reset message type
        setFormEnviado(false);
        setPdfLoading(false);

        // --- CLEAR ALL PDF RELATED STATES ON FORM CLEANUP ---
        setNumeroActa('');
        setNombreDirectorAdmin('');
        setCiDirectorAdmin('');
        setNombreDirectorAsignacion('');
        setCiDirectorAsignacion('');
        setUnidadAdministrativa('');
        setNombreJefeCompras('');
        setCiJefeCompras('');
        setNombreAnalistaBienes('');
        setCiAnalistaBienes('');
        setNumeroActaDesincorporacion('');
        setFechaActaDesincorporacion('');
        setNombreFuncionarioElabora('');
    };

    const fetchBienData = async (id) => {
        if (!id) return;
        setLoading(true);
        setMensaje('');
        try {
            const response = await fetch(`/api/rrhh/bienes/${id}`);
            if (!response.ok) {
                throw new Error('No se pudo encontrar el bien con el código proporcionado.');
            }
            const data = await response.json();
            setBienData(data);
        } catch (error) {
            setBienData(null);
            setTipoMensaje('danger');
            setMensaje(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!bienData || !comIde || !bimFed) {
            setTipoMensaje('danger');
            setMensaje('Debe seleccionar la condición de movimiento y la fecha.');
            return;
        }

        const datosParaDesincorporar = {
            com_ide: comIde,
            bim_fed: bimFed
        };

        setLoading(true);
        setMensaje('');

        try {
            const response = await fetch(`/api/rrhh/bienes/${bienData.bim_ide}/desincorporar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosParaDesincorporar)
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.error || 'Ocurrió un error al desincorporar el bien.');
            }

            setTipoMensaje('success');
            setMensaje('¡Bien desincorporado con éxito!');
            setFormEnviado(true);

            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            setTipoMensaje('danger');
            setMensaje(error.message);
            setFormEnviado(false);
        } finally {
            setLoading(false);
        }
    };

    const generatePdfActa = async () => {
        // Validate all required inputs for PDF generation
        const requiredPdfFields = [
            numeroActa, nombreDirectorAdmin, ciDirectorAdmin, nombreDirectorAsignacion,
            ciDirectorAsignacion, nombreJefeCompras, ciJefeCompras,
            nombreAnalistaBienes, ciAnalistaBienes, nombreFuncionarioElabora
        ];

        if (!bienData || requiredPdfFields.some(field => !field)) {
            setTipoMensaje('danger');
            setMensaje('Por favor, complete todos los campos requeridos para generar el acta de desincorporación.');
            return;
        }

        setPdfLoading(true);
        setMensaje('');

        try {
            const pdfData = {
                numeroActa: numeroActa,
                nombreDirectorAdmin,
                ciDirectorAdmin,
                nombreDirectorAsignacion,
                ciDirectorAsignacion,
                unidadAdministrativa: bienData.departamento,
                nombreJefeCompras,
                ciJefeCompras,
                nombreAnalistaBienes,
                ciAnalistaBienes,
                codigoBien: bienData.bim_ide,
                descripcionBien: bienData.bim_des,
                valorBien: bienData.bim_val,
                numeroActaDesincorporacion: numeroActa,
                fechaActaDesincorporacion: bimFed,
                nombreFuncionarioElabora
            };

            const response = await fetch('/api/rrhh/pdf/acta-desincorporacion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf'
                },
                body: JSON.stringify(pdfData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al generar el PDF: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `acta_desincorporacion_${pdfData.numeroActa}_bien_${pdfData.codigoBien}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setTipoMensaje('success');
            setMensaje('PDF de desincorporación generado con éxito.');
            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (error) {
            console.error('Error generating PDF:', error);
            setTipoMensaje('danger');
            setMensaje(`Error al generar el PDF: ${error.message}`);
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Desincorporar Bien Mueble y Generar Acta</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={() => fetchBienData(codigoBienInput)}>
                    {!BienId && (
                        <Form.Group className="mb-3">
                            <Form.Label>Ingrese el código del bien a desincorporar</Form.Label>
                            <div className="d-flex">
                                <Form.Control
                                    type="text"
                                    value={codigoBienInput}
                                    onChange={(e) => setCodigoBienInput(e.target.value)}
                                    placeholder="Código del bien"
                                    disabled={loading || formEnviado || pdfLoading}
                                />
                                <Button
                                    variant="primary"
                                    onClick={() => fetchBienData(codigoBienInput)}
                                    disabled={loading || !codigoBienInput || formEnviado || pdfLoading}
                                    className="ms-2"
                                >
                                    {loading ? 'Buscando...' : 'Buscar'}
                                </Button>
                            </div>
                        </Form.Group>
                    )}

                    {mensaje && (
                        <Alert type={tipoMensaje}>
                            {mensaje}
                        </Alert>
                    )}

                    {bienData && (
                        <>
                            <h5>Datos del Bien</h5>
                            <p><strong>Código:</strong> {bienData.bim_ide || 'N/A'}</p>
                            <p><strong>Descripción:</strong> {bienData.bim_des || 'N/A'}</p>
                            <p><strong>Departamento Actual:</strong> {bienData.departamento || 'N/A'}</p>
                            <p><strong>Valor:</strong> Bs. {bienData.bim_val ? parseFloat(bienData.bim_val).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}</p>
                            <hr />

                            <h5>Información de Desincorporación</h5>
                            <Form.Group className="mb-3" controlId="com_ide">
                                <Form.Label>Concepto de Movimiento</Form.Label>
                                <Form.Select
                                    aria-label="Seleccione la condición"
                                    name='com_ide'
                                    value={comIde}
                                    onChange={(e) => setComIde(e.target.value)}
                                    disabled={formEnviado || pdfLoading}
                                >
                                    <option value="">Seleccione una opción</option>
                                    {conceptoMov.map((item) => (
                                        <option key={item.com_ide} value={item.com_ide}>
                                            {item.com_com}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="bim_fed">
                                <Form.Label>Fecha de Desincorporación</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={bimFed}
                                    onChange={(e) => setBimFed(e.target.value)}
                                    disabled={formEnviado || pdfLoading}
                                />
                            </Form.Group>

                            <hr />
                            <h5>Datos para el Acta de Desincorporación (Firmantes y Documento)</h5>

                            <Form.Group className="mb-3" controlId="numeroActa">
                                <Form.Label>Número de Acta</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={numeroActa}
                                    onChange={(e) => setNumeroActa(e.target.value)}
                                    placeholder="Ej: XXX-2025"
                                    disabled={formEnviado || pdfLoading}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="nombreDirectorAdmin">
                                <Form.Label>Nombre Director(a) de Administración</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={nombreDirectorAdmin}
                                    onChange={(e) => setNombreDirectorAdmin(e.target.value)}
                                    disabled={formEnviado || pdfLoading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="ciDirectorAdmin">
                                <Form.Label>Cédula Director(a) de Administración</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={ciDirectorAdmin}
                                    onChange={(e) => setCiDirectorAdmin(e.target.value)}
                                    disabled={formEnviado || pdfLoading}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="nombreDirectorAsignacion">
                                <Form.Label>Nombre Director(a) ó Jefe de Oficina</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={nombreDirectorAsignacion}
                                    onChange={(e) => setNombreDirectorAsignacion(e.target.value)}
                                    disabled={formEnviado || pdfLoading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="ciDirectorAsignacion">
                                <Form.Label>Cédula Director(a) ó Jefe de Oficina</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={ciDirectorAsignacion}
                                    onChange={(e) => setCiDirectorAsignacion(e.target.value)}
                                    disabled={formEnviado || pdfLoading}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="nombreJefeCompras">
                                <Form.Label>Nombre Jefe de División de Compras</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={nombreJefeCompras}
                                    onChange={(e) => setNombreJefeCompras(e.target.value)}
                                    disabled={formEnviado || pdfLoading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="ciJefeCompras">
                                <Form.Label>Cédula Jefe de División de Compras</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={ciJefeCompras}
                                    onChange={(e) => setCiJefeCompras(e.target.value)}
                                    disabled={formEnviado || pdfLoading}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="nombreAnalistaBienes">
                                <Form.Label>Nombre Analista de Bienes e Inventarios IV</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={nombreAnalistaBienes}
                                    onChange={(e) => setNombreAnalistaBienes(e.target.value)}
                                    disabled={formEnviado || pdfLoading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="ciAnalistaBienes">
                                <Form.Label>Cédula Analista de Bienes e Inventarios IV</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={ciAnalistaBienes}
                                    onChange={(e) => setCiAnalistaBienes(e.target.value)}
                                    disabled={formEnviado || pdfLoading}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="nombreFuncionarioElabora">
                                <Form.Label>Nombre del Funcionario que Elabora el Acta</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={nombreFuncionarioElabora}
                                    onChange={(e) => setNombreFuncionarioElabora(e.target.value)}
                                    disabled={formEnviado || pdfLoading}
                                />
                            </Form.Group>
                        </>
                    )}
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    onClick={handleSubmit}
                    disabled={!bienData || loading || formEnviado || pdfLoading}
                >
                    {loading ? 'Procesando Desincorporación...' : 'Desincorporar Bien'}
                </Button>
                {formEnviado && ( // Show PDF generation button only after successful desincorporation
                    <Button
                        variant="success"
                        onClick={generatePdfActa}
                        disabled={pdfLoading}
                    >
                        {pdfLoading ? 'Generando PDF...' : 'Generar Acta Desincorporación PDF'}
                    </Button>
                )}
                 {mensaje && (
                        <Alert type={tipoMensaje}>
                            {mensaje}
                        </Alert>
                    )}

            </Modal.Footer>
        </Modal>
    );
}

export default ModalDesincorporarBien;