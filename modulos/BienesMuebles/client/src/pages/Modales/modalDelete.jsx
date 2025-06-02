import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from "../../components/atoms/Alert";

function ModalDelete({ 
    show, 
    handleClose, 
    tableName, 
    rowId, 
    idColumn,
    onSuccess 
}) {
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);


const endpointMap = {
        tmacat: '/api/categorias',
        tessca: '/api/subcategorias',
        tescae: '/api/categorias-especificas',
        tmamar: '/api/marcas',
        tesmod: '/api/modelos',
        tmab_m: '/api/bienes',
    };

    const handleDelete = async () => {
        setMensajeMostrado(false);
        setErrorMessage('');
        setIsDeleting(true);

        try {
            const response = await fetch(`${endpointMap[tableName]}/${rowId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.error || 'Error desconocido');
            }

            setMensajeMostrado(true);
            setIsDeleting(false);

            setTimeout(() => {
                handleClose();
                setMensajeMostrado(false);
                if (onSuccess) onSuccess(); // Recargar datos
            }, 1000);
        } catch (error) {
            console.error('Error al eliminar:', error);
            setErrorMessage(error.message || 'Error al eliminar el registro');
            setMensajeMostrado(true);
            setIsDeleting(false);

            setTimeout(() => {
                setMensajeMostrado(false);
            }, 3000);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar registro de {tableName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {mensajeMostrado && (
                    <Alert 
                        variant={errorMessage ? 'danger' : 'success'}
                        message={errorMessage || '✓ Registro eliminado correctamente'}
                    />
                )}
                
                {!mensajeMostrado && (
                    <>
                        <p>¿Estás seguro de que deseas eliminar este registro?</p>
                        <p><strong>ID:</strong> {rowId}</p>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
                    Cancelar
                </Button>
                <Button 
                    variant="danger" 
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalDelete;
