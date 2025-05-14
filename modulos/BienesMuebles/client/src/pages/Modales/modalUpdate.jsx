import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Alert from "../../components/atoms/Alert";
import { fetchData } from '../../data/fetchData';

function ModalUpdate({ show, handleClose, columns, tableName, foreign, onSuccess, rowData, idColumn }) {
    const [formData, setFormData] = useState({});
    const [formEnviado, setFormEnviado] = useState(false);
    const [mensajeMostrado, setMensajeMostrado] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(''); 
    const [foreignTable, setForeignTable] = useState([]);

    // Cargar datos iniciales cuando cambia rowData o se muestra el modal
    useEffect(() => {
        if (show && rowData) {
            setFormData(rowData);
        }
    }, [show, rowData]);

    // Cargar datos foráneos si es necesario
    useEffect(() => {
        if (show && foreign) {
            const fetchForeignData = async () => {
                try {
                    const foreignTableData = await fetchData(foreign, '*');
                    setForeignTable(foreignTableData);
                } catch (error) {
                    console.error(`Error fetching ${foreign} data:`, error);
                    setErrorMessage(`Error al cargar datos de ${foreign}`);
                }
            };
            fetchForeignData();
        }
    }, [show, foreign]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
         setMensajeMostrado(false);
        setErrorMessage('');
        
        const rowId = rowData[idColumn];
        
        console.log('ID a actualizar:', rowId); // Debug
        
        if (!rowId) {
            setErrorMessage('Error: No se encontró el ID del registro');
            return;
        }

        try {
             // Crear objeto con solo los datos modificables (excluyendo PKs)
            const updateData = { ...formData };
                    const response = await axios.put('/api/update', {
                        table: tableName,
                        id: rowId, // ID del registro a actualizar
                        data: updateData
                    });

                    if (response.status === 200) {
                        setFormEnviado(true);
                        setMensajeMostrado(true);
                        
                        setTimeout(() => {
                            handleClose();
                            setMensajeMostrado(false);
                            if (onSuccess) onSuccess(); // Recargar datos
                        }, 1000);
                    }
                
        } catch (error) {
            setFormEnviado(false);
                    setMensajeMostrado(true);
                    
                    if (error.response?.data?.error === 'DUPLICATE_KEY') {
                        setErrorMessage('Error: Este código ya existe.');
                    } else {
                        console.error('Error al actualizar:', error);
                        setErrorMessage(error.response?.data?.error || error.message || 'Error desconocido');
                    }

                    setTimeout(() => {
                        setMensajeMostrado(false);
                    }, 3000);
        }
        }

    // Determinar si un campo debe ser deshabilitado (PK o FK)
    const isFieldDisabled = (column) => {
        return column.isPrimaryKey || 
               (column.originalName.slice(-3) === 'ide');
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Actualizar registro</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {columns && columns.map((column, index) => {
                        // Determinar si es foránea
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

                        // Para campos normales
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
                                    disabled={isFieldDisabled(column)}
                                />
                            </Form.Group>
                        );
                    })}
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
                    {formEnviado ? '✓ Actualizado correctamente' : `✗ ${errorMessage}`}
                </Alert>
            )}
        </Modal>
    );
}

export default ModalUpdate;