import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from "../../components/atoms/Alert";

export const ModalInsertJerarquia = ({ show, handleClose, onSuccess, cargosJerarquia }) => {
    const [formData, setFormData] = useState({
        cargo: '',
        porcentaje: ''
    });
    const [formEnviado, setFormEnviado] = useState(false);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/porcentajes-jerarquias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const responseData = await response.json();

            if (response.ok) {
                setFormEnviado(true);
                setMensajeMostrado(true);
                setTimeout(() => {
                    handleClose();
                    setMensajeMostrado(false);
                    setFormData({ cargo: '', porcentaje: '' }); 
                    if (onSuccess) onSuccess();
                }, 1000);
            } else {
                throw new Error(responseData.error || 'Error al insertar');
            }
        } catch (error) {
            setFormEnviado(false);
            setMensajeMostrado(true);
            setErrorMessage(error.message);
            console.error('Error al insertar jerarquía:', error);
            setTimeout(() => setMensajeMostrado(false), 4000);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Nueva Jerarquia</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id="insertJerarquiaForm" onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Cargo de Jerarquía</Form.Label>
                        <Form.Control
                            type="text"
                            name="cargo"
                            value={formData.cargo}
                            onChange={handleChange}
                            placeholder="Ingrese el cargo de jerarquía"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Porcentaje (%)</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            name="porcentaje"
                            value={formData.porcentaje}
                            onChange={handleChange}
                            placeholder="Ej: 15.50"
                            required
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
                <Button variant="primary" type="submit" form="insertJerarquiaForm">Guardar Jerarquía</Button>
            </Modal.Footer>
            {mensajeMostrado && (
                <div className="p-3">
                    <Alert type={formEnviado ? 'success' : 'danger'}>
                        {formEnviado ? 'Jerarquía insertada con éxito' : `${errorMessage}`}
                    </Alert>
                </div>
            )}
        </Modal>
    );
};
