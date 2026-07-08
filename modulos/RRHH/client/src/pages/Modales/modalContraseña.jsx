import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup'; // Importar InputGroup
import Alert from "../../components/atoms/Alert";

function ModalContraseña({ show, handleClose, rowData, idColumn, onSuccess }) {
    // Solo necesitamos las contraseñas, no todos los datos del formulario inicial
    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [formEnviado, setFormEnviado] = useState(false);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Limpiar el formulario al abrir el modal para nuevas contraseñas
    useEffect(() => {
        if (show) {
            setPasswordData({
                password: '',
                confirmPassword: ''
            });
            setErrorMessage('');
            setMensajeMostrado(false);
            setFormEnviado(false);
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensajeMostrado(false);
        setErrorMessage('');

        const rowId = rowData[idColumn];
        if (!rowId) {
            setErrorMessage('Error: No se encontró el ID del usuario.');
            setMensajeMostrado(true);
            return;
        }

        // --- Validación de contraseñas ---
        if (!passwordData.password || !passwordData.confirmPassword) {
            setErrorMessage('Ambos campos de contraseña son obligatorios.');
            setMensajeMostrado(true);
            return;
        }

        if (passwordData.password !== passwordData.confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden.');
            setMensajeMostrado(true);
            return;
        }
        // --- Fin Validación ---

        try {
            const response = await fetch(`/api/user/${rowId}/password`, { // Corregido el slash final
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: passwordData.password }) // Enviar solo la contraseña
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error desconocido al actualizar la contraseña.');
            }

            setFormEnviado(true);
            setMensajeMostrado(true);
            setTimeout(() => {
                handleClose();
                setMensajeMostrado(false); // Resetear el mensaje al cerrar
                if (onSuccess) onSuccess(); // Llama a onSuccess si está definida
            }, 1500); // Dar un poco más de tiempo para ver el mensaje de éxito

        } catch (error) {
            setFormEnviado(false);
            setMensajeMostrado(true);
            setErrorMessage(error.message || 'Error de conexión o servidor.');

            setTimeout(() => {
                setMensajeMostrado(false);
            }, 3000);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Actualizar Contraseña de {rowData?.username || rowData?.nombres}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="password" className="mb-3">
                        <Form.Label column sm={4}>Nueva Contraseña</Form.Label> 
                            <InputGroup>
                                <InputGroup.Text>
                                    <i className="bx bx-key"></i> 
                                </InputGroup.Text>
                                <Form.Control
                                    type="password"
                                    autoComplete="new-password" 
                                    value={passwordData.password}
                                    onChange={handleChange}
                                    name="password"
                                    placeholder=""
                                    required 
                                />
                            </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="confirmPassword" className="mb-3">
                        <Form.Label column sm={4}>Confirmar Contraseña</Form.Label> 
                            <InputGroup>
                                <InputGroup.Text>
                                    <i className="bx bx-key"></i> 
                                </InputGroup.Text>
                                <Form.Control
                                    type="password"
                                    autoComplete="new-password"
                                    value={passwordData.confirmPassword}
                                    onChange={handleChange}
                                    name="confirmPassword"
                                    placeholder=""
                                    required
                                />
                            </InputGroup>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Guardar Cambios
                </Button>
            </Modal.Footer>

            {mensajeMostrado && (
                <Alert
                    key={formEnviado ? 'success' : 'danger'}
                    type={formEnviado ? 'success' : 'danger'}
                >
                    {formEnviado ? '✓ Contraseña actualizada correctamente' : `✗ ${errorMessage}`}
                </Alert>
            )}
        </Modal>
    );
}

export default ModalContraseña;