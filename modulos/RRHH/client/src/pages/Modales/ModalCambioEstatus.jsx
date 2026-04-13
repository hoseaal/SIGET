import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ModalCambioEstatus = ({ show, handleClose, empleado }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nuevo_estatus_id: '',
        porcentaje_jubilacion: '',
        fecha_efectiva: new Date().toISOString().split('T')[0]
    });

    const [estatusList, setEstatusList] = useState([
        { id: 3, nombre: 'Jubilado' },
        { id: 4, nombre: 'Pensionado' },
        { id: 7, nombre: 'Sobreviviente' }
    ]);

    useEffect(() => {
        if (show) {
            setFormData({
                nuevo_estatus_id: '',
                porcentaje_jubilacion: '',
                fecha_efectiva: new Date().toISOString().split('T')[0]
            });
            setError('');
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nuevo_estatus_id) {
            setError('Debe seleccionar un nuevo estatus.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/funcionarios/${empleado.empleado_id}/cambiar-estatus`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nuevo_estatus_id: formData.nuevo_estatus_id,
                    datos_adicionales: {
                        porcentaje_jubilacion: formData.porcentaje_jubilacion,
                        fecha_efectiva: formData.fecha_efectiva
                    }
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al cambiar el estatus');

            // Redirección según el nuevo estatus
            handleClose();
            if (formData.nuevo_estatus_id == 3) {
                navigate('/Personal/Jubilados');
            } else if (formData.nuevo_estatus_id == 4) {
                navigate('/Personal/Pensionados');
            } else if (formData.nuevo_estatus_id == 7) {
                navigate(`/Personal/Sobrevivientes?empleado_id=${empleado.empleado_id}`);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Cambiar Estatus de Funcionario</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <div className="mb-3 text-center">
                        <p>Estás cambiando el estatus de:</p>
                        <h5 className="text-primary">{empleado?.nombres} {empleado?.apellidos}</h5>
                        <p className="text-muted">Cédula: {empleado?.cedula}</p>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Seleccionar Nuevo Estatus</Form.Label>
                        <Form.Select 
                            name="nuevo_estatus_id" 
                            value={formData.nuevo_estatus_id} 
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Seleccione --</option>
                            {estatusList.map(st => (
                                <option key={st.id} value={st.id}>{st.nombre}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* Campos adicionales si es Jubilado o Pensionado */}
                    {(formData.nuevo_estatus_id == 3 || formData.nuevo_estatus_id == 4) && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha Efectiva</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="fecha_efectiva" 
                                    value={formData.fecha_efectiva} 
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            {formData.nuevo_estatus_id == 3 && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Porcentaje de Jubilación (%)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        name="porcentaje_jubilacion" 
                                        placeholder="Ej: 80"
                                        value={formData.porcentaje_jubilacion} 
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            )}
                        </>
                    )}

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Procesando...' : 'Cambiar Estatus'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ModalCambioEstatus;
