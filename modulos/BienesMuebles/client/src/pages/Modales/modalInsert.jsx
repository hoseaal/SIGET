import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Alert from "../../components/atoms/Alert";
import { fetchData } from '../../data/fetchData';

function ModalInsert({ show, handleClose, columns, tableName, foreign }) {
    const [formData, setFormData] = useState({});

    const [formEnviado, setFormEnviado] = useState(false)
    const [mensajeMostrado, setMensajeMostrado] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(false); 

    const [foreignTable, setForeignTable] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
            if (foreign) {
                const fetchforeign = async () => {
                    try {
                        const foreignTableData = await fetchData(foreign, '*');
                        setForeignTable(foreignTableData)
                    } catch (error) {
                        console.error('Error fetching areas:', error);
                    }
                };
                fetchforeign();
            }
    },[show, tableName])
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('/api/insert', {
                table: tableName, 
                data: formData
            });


            if (response.status === 201) {
                setFormEnviado(true)
                    setMensajeMostrado(true)
                    setTimeout(() => {
                        handleClose();
                        setMensajeMostrado(false);
                        if (props.onSuccess) props.onSuccess(); // Recargar datos
                    }, 1000);
                }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error === 'DUPLICATE_KEY') {
                setErrorMessage('Error: Este codigo ya existe.'); 
            }
                setFormEnviado(false); // Indicar que hubo un error
                setMensajeMostrado(true);
                console.error('Error al insertar:', error);
                setErrorMessage(error.response?.data?.error || error.message)

                setTimeout(() => {
                    setMensajeMostrado(false);
                  }, 3000);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Insertar</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form onSubmit={handleSubmit}>
                    {columns && columns.map((column, index) => {
                        // Determinar si es foránea (termina en 'ide' y tabla comienza con 'tes' y NO es PK)
                        const isForeignKey = column.originalName.slice(-3) === 'ide' && 
                                           tableName.slice(0, 3) === 'tes' && 
                                           !column.isPrimaryKey;
                
                        if (isForeignKey && foreignTable.length > 0) {
                            const firstItem = foreignTable[0];
                            const ideField = Object.keys(firstItem).find(key => key.endsWith('_ide'));
                            const displayField = Object.keys(firstItem).find(key => !key.endsWith('_ide'));
                            return (
                                <Form.Group key={index} className="mb-3">
                                    <Form.Label>{column.displayName}</Form.Label>
                                    <Form.Select
                                        name={column.originalName}
                                        value={formData[column.originalName] || ''}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione una opción</option>
                                        {foreignTable.map((item) => (
                                            <option 
                                                key={item[ideField]} 
                                                value={item[ideField]}
                                            >
                                                {displayField ? item[displayField] : item[ideField]}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            );
                        }

                        // Para PK y columnas normales
                        return (
                            <Form.Group key={index} className="mb-3">
                                <Form.Label>{column.displayName}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name={column.originalName}
                                    value={formData[column.originalName] || ''}
                                    onChange={handleChange}
                                    placeholder={`Ingrese ${column.displayName}`}
                                    required={column.isPrimaryKey}
                                />
                            </Form.Group>
                        );
                    })}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Guardar Cambios
                </Button>
            </Modal.Footer>
            {mensajeMostrado && 
                            <Alert key={formEnviado ? 'success' : 'danger'} type={formEnviado ? 'success' : 'danger'}>
                            {formEnviado ? 'Insertado con exito' : `${errorMessage}`}
                        </Alert>
                          }
        </Modal>
    );
}

export default ModalInsert;