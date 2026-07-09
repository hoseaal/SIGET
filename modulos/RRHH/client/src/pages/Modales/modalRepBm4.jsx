// components/modals/ModalGenerarReporteBM4.js

import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from "../../components/atoms/Alert"; // Asegúrate que la ruta sea correcta

function ModalGenerarReporteBM4({ show, handleClose, initialFinancialData }) {
    // Financial inputs states
    const [existenciaAnterior, setExistenciaAnterior] = useState('');
    const [incorporacionesMesActual, setIncorporacionesMesActual] = useState('0.00'); // Default to 0.00
    const [desincorporacionesMesActual, setDesincorporacionesMesActual] = useState('0.00'); // Default to 0.00
    const [excepcionFaltantes, setExcepcionFaltantes] = useState('0.00'); // Default to 0.00
    const [faltantesPorInvestigar, setFaltantesPorInvestigar] = useState('0.00'); // Default to 0.00
    const [existenciaFinal, setExistenciaFinal] = useState('');

    // UI states
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState('danger');

    // Effect to set initial data from props when modal is shown or initialFinancialData changes
    useEffect(() => {
        if (show && initialFinancialData) {
            setExistenciaAnterior(initialFinancialData.existenciaAnterior ? parseFloat(initialFinancialData.existenciaAnterior).toFixed(2) : '00.00');
            setExistenciaFinal(initialFinancialData.existenciaFinal ? parseFloat(initialFinancialData.existenciaFinal).toFixed(2) : '');
            // Optionally, pre-fill these if they are also part of initialFinancialData
            setIncorporacionesMesActual(initialFinancialData.incorporacionesMesActual ? initialFinancialData.incorporacionesMesActual.toFixed(2) : '0.00');
            setDesincorporacionesMesActual(initialFinancialData.desincorporacionesMesActual ? initialFinancialData.desincorporacionesMesActual.toFixed(2) : '0.00');
            // The other two ("excepcionFaltantes" and "faltantesPorInvestigar") will remain "0.00" by default as requested.
        } else if (!show) {
            // Reset states when modal is hidden
            limpiarFormulario();
        }
    }, [show, initialFinancialData]); // Depend on show and initialFinancialData

    const limpiarFormulario = () => {
        setExistenciaAnterior('');
        setIncorporacionesMesActual('0.00');
        setDesincorporacionesMesActual('0.00');
        setExcepcionFaltantes('0.00');
        setFaltantesPorInvestigar('0.00');
        setExistenciaFinal('');
        setMensaje('');
        setTipoMensaje('danger');
        setLoading(false);
    };

    const handleSubmit = async () => {
        // Basic validation for required fields
        const requiredFinancialFields = [
            existenciaAnterior, incorporacionesMesActual, desincorporacionesMesActual,
            excepcionFaltantes, faltantesPorInvestigar, existenciaFinal
        ];

        if (requiredFinancialFields.some(field => field === null || field === undefined || field === '')) {
            setTipoMensaje('danger');
            setMensaje('Por favor, complete todos los campos.');
            return;
        }

        // Validate numeric fields conversion
        const numericValues = [
            existenciaAnterior, incorporacionesMesActual, desincorporacionesMesActual,
            excepcionFaltantes, faltantesPorInvestigar, existenciaFinal
        ].map(val => parseFloat(val));

        if (numericValues.some(isNaN)) {
            setTipoMensaje('danger');
            setMensaje('Los campos de valores financieros deben ser números válidos.');
            return;
        }

        setLoading(true);
        setMensaje('');

        try {
            const pdfData = {
                existenciaAnterior: parseFloat(existenciaAnterior),
                incorporacionesMesActual: parseFloat(incorporacionesMesActual),
                desincorporacionesMesActual: parseFloat(desincorporacionesMesActual),
                excepcionFaltantes: parseFloat(excepcionFaltantes),
                faltantesPorInvestigar: parseFloat(faltantesPorInvestigar),
                existenciaFinal: parseFloat(existenciaFinal),
            };

            const response = await fetch('/api/rrhh/pdf/reporte-bm4', {
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
            link.setAttribute('download', `reporte_BM4.pdf`); // Filename set by backend, this is a fallback
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setTipoMensaje('success');
            setMensaje('Reporte BM4 generado con éxito.');
            setTimeout(() => {
                handleClose();
            }, 2000);

        } catch (error) {
            console.error('Error generating BM4 PDF:', error);
            setTipoMensaje('danger');
            setMensaje(`Error al generar el reporte: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Generar Reporte BM-4</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    {mensaje && (
                        <Alert type={tipoMensaje}>
                            {mensaje}
                        </Alert>
                    )}

                    <h5>Valores Financieros del Reporte (editable)</h5>
                    <Form.Group className="mb-3" controlId="existenciaAnterior">
                        <Form.Label>Existencia Anterior (Bs.)</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            value={existenciaAnterior}
                            onChange={(e) => setExistenciaAnterior(e.target.value)}
                            disabled={loading}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="incorporacionesMesActual">
                        <Form.Label>Incorporaciones en el mes de la cuenta (Bs.)</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            value={incorporacionesMesActual}
                            onChange={(e) => setIncorporacionesMesActual(e.target.value)}
                            placeholder="0.00"
                            disabled={loading}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="desincorporacionesMesActual">
                        <Form.Label>Desincorporaciones en el mes de la cuenta por todos los conceptos (Bs.)</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            value={desincorporacionesMesActual}
                            onChange={(e) => setDesincorporacionesMesActual(e.target.value)}
                            placeholder="0.00"
                            disabled={loading}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="excepcionFaltantes">
                        <Form.Label>Con excepción del 60, “Faltantes de Bienes por investigar” (Bs.)</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            value={excepcionFaltantes}
                            onChange={(e) => setExcepcionFaltantes(e.target.value)}
                            placeholder="0.00"
                            disabled={loading}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="faltantesPorInvestigar">
                        <Form.Label>Desincorporaciones en el mes de la cuenta por el concepto 60, “Faltante de Bienes por Investigar” (Bs.)</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            value={faltantesPorInvestigar}
                            onChange={(e) => setFaltantesPorInvestigar(e.target.value)}
                            placeholder="0.00"
                            disabled={loading}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="existenciaFinal">
                        <Form.Label>Existencia Final (Bs.)</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            value={existenciaFinal}
                            onChange={(e) => setExistenciaFinal(e.target.value)}
                            disabled={loading}
                        />
                    </Form.Group>

                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Generando Reporte...' : 'Generar Reporte BM-4'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalGenerarReporteBM4;