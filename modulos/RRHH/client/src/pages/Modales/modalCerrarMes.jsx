import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from "../../components/atoms/Alert"; // Asumiendo que tu componente Alert maneja 'variant' y 'message'

function ModalCerrarMes({ 
    show, 
    handleClose,
    onSuccess // Añadir onSuccess como prop para recargar los datos en la vista principal
}) {
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [isLoading, setIsLoading] = useState(false); 
    const handleCerrarMes = async () => {
        setAlertMessage(''); 
        setAlertVariant('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/rrhh/reporteBM4/cerrar-mes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error desconocido al procesar la solicitud.');
            }

            setAlertMessage(data.message || '✓ Mes cerrado correctamente.');
            setAlertVariant('success');

            setTimeout(() => {
                handleClose(); 
                if (onSuccess) onSuccess(); 
            }, 1500); 

        } catch (error) {
            console.error('Error al cerrar mes:', error);
            setAlertMessage(error.message || 'Error inesperado al intentar cerrar el mes.');
            setAlertVariant('danger');

            setTimeout(() => {
                setAlertMessage('');
            }, 4000); 
        } finally {
            setIsLoading(false); 
        }
    };

    const handleModalClose = () => {
        setAlertMessage('');
        setAlertVariant('');
        setIsLoading(false);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleModalClose} centered> {/* 'centered' para centrar el modal */}
            <Modal.Header closeButton>
                <Modal.Title>¿Estás seguro de que deseas Cerrar la cuenta del mes? 
                    <i className='bx bx-wallet'></i>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Esta acción consolidará los datos del mes anterior y se usará para el reporte mensual. Esta acción no se puede deshacer.</p>
            
                {alertMessage && (
                    <Alert 
                        type={alertVariant}
                    >
                        {alertMessage}
                    </Alert>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleModalClose} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button 
                    variant="warning" 
                    onClick={handleCerrarMes}
                    disabled={isLoading} 
                >
                    {isLoading ? 'Procesando...' : 'Cerrar cuenta del mes'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalCerrarMes;