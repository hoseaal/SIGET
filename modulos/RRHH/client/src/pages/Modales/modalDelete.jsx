import React, { useState, useEffect } from 'react';
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
        tmadir: '/api/direcciones',
        tesdiv: '/api/divisiones',
        tesuni: '/api/unidades',
    };

    const [userType, setUserType] = useState(null);
    const [userData, setUserData] = useState(null);
    useEffect(() => {
            const fetchUserData = async () => {
                try {
                    const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
                    if (!userRes.ok) throw new Error('No autorizado.');
                    const userDataResult = await userRes.json();
                    if (!userDataResult.success) throw new Error(userDataResult.message || 'Error desconocido al verificar usuario.');
                    
                    const currentUserType = userDataResult.user.usu_tip;
                    setUserType(currentUserType);
                    setUserData(userDataResult.user)
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
    
            fetchUserData();
        }, []);

    const handleDelete = async () => {
        setMensajeMostrado(false);
        setErrorMessage('');
        setIsDeleting(true);

        try {
            if (tableName === 'tesusu'){
                if(userData?.usu_ide === rowId) {
                throw new Error ('No Puedes Eliminarte a ti mismo')
            }
            }

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
            console.error('Error al eliminar:', error); // Mantenemos el error completo en la consola para depuración

            let mensajeParaUsuario = 'Ocurrió un error inesperado al eliminar.'; // Mensaje por defecto

            const esErrorDeForeignKey = error.message.includes('foreign key constraint fails') || error.message.includes('violates foreign key constraint');

            if (esErrorDeForeignKey) {
                mensajeParaUsuario = 'No se puede eliminar este registro porque está siendo utilizado en otras partes del sistema.';
            }

            setErrorMessage(mensajeParaUsuario);
            setMensajeMostrado(true);
            setIsDeleting(false);

            setTimeout(() => {
                setMensajeMostrado(false);
            }, 3000);
        }
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar registro de {tableName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {mensajeMostrado &&
                 <Alert type={errorMessage ? 'danger' : 'success'}>
                            {errorMessage || '✓ Registro eliminado correctamente'}
                    </Alert>
                }
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
