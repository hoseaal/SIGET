import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from "../../components/atoms/Alert";

function ModalUpdate({ show, handleClose, columns, tableName, foreign, onSuccess, rowData, idColumn }) {
    const [formData, setFormData] = useState({});
    const [formEnviado, setFormEnviado] = useState(false);
    const [mensajeMostrado, setMensajeMostrado] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(''); 
    const [foreignTable, setForeignTable] = useState([]);

    // MAPA UNIVERSAL DE ENDPOINTS (Sistema RRHH)
    const endpointMap = {
        // Estructura Organizacional
        direcciones: '/api/direcciones',
        divisiones: '/api/divisiones',
        unidades: '/api/unidades',
        
        // Clasificación y Cargos
        cargos_onapre: '/api/cargos-onapre',
        cargos_cet: '/api/cargos-cet',
        condiciones_laborales: '/api/condiciones-laborales',
        profesiones: '/api/profesiones',
        
        // Tablas Salariales y Deducciones
        niveles_salariales: '/api/niveles-salariales',
        primas_generales: '/api/primas',
        primas_profesionalizacion: '/api/primas-profesionalizacion',
        configuracion_antiguedad: '/api/antiguedad',
        deducciones: '/api/deducciones'
    };

    // Al abrir el modal, cargamos los datos de la fila a editar
    useEffect(() => {
        if (show && rowData) {
            setFormData(rowData);
        }
    }, [show, rowData]);

    // Efecto para buscar los datos de la llave foránea (si existe)
    useEffect(() => {
        if (show && foreign) {
            const fetchForeignData = async () => {
                const endpoint = endpointMap[foreign];
                if (!endpoint) {
                    console.warn(`No se encontró endpoint configurado para la tabla foránea: ${foreign}`);
                    return;
                }

                try {
                    const response = await fetch(endpoint);
                    if (!response.ok) throw new Error('Error al obtener datos foráneos');
                    const data = await response.json();
                    setForeignTable(data);
                } catch (error) {
                    console.error(`Error al obtener datos de ${foreign}:`, error);
                    setErrorMessage(`Error al cargar lista desplegable de ${foreign}`);
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
        if (!rowId) {
            setErrorMessage('Error: No se encontró el ID del registro a actualizar');
            setMensajeMostrado(true);
            return;
        }

        const endpoint = endpointMap[tableName];
        if (!endpoint) {
            setErrorMessage(`Falta configurar endpointMap para la tabla ${tableName}`);
            setMensajeMostrado(true);
            return;
        }

        try {
            const response = await fetch(`${endpoint}/${rowId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error al actualizar el registro');
            }

            setFormEnviado(true);
            setMensajeMostrado(true);
            setTimeout(() => {
                handleClose();
                setMensajeMostrado(false);
                if (onSuccess) onSuccess();
            }, 1000);

        } catch (error) {
            setFormEnviado(false);
            setMensajeMostrado(true);
            
            const errorMsg = error.message;
            if (errorMsg.includes("Duplicate entry")) {
                setErrorMessage("Este registro ya existe (Dato duplicado).");
            } else {
                setErrorMessage(errorMsg);
            }

            setTimeout(() => {
                setMensajeMostrado(false);
            }, 3000);
        }
    };

    // Función para bloquear la edición de la llave primaria
    const isFieldDisabled = (column) => {
        return Boolean(column.isPrimaryKey === true || column.isPrimaryKey === "true" || column.isPrimaryKey === 1 || column.isPrimaryKey === "1");
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Actualizar Registro</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id="updateForm" onSubmit={handleSubmit}>
                    {columns && columns.map((column, index) => {
                        
                        // 1. SI ES PRIMARY KEY, la mostramos deshabilitada para referencia, pero no la enviamos vacía
                        if (isFieldDisabled(column)) {
                            return (
                                <Form.Group key={index} className="mb-3">
                                    <Form.Label>{column.displayName} (Identificador)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name={column.originalName}
                                        value={formData[column.originalName] || ''}
                                        disabled={true}
                                        readOnly
                                    />
                                </Form.Group>
                            );
                        }

                        // 2. Detectar si es clave foránea (termina en _ide)
                        const isForeignKey = column.originalName.endsWith('ide') && foreignTable.length > 0;

                        // 3. RENDERIZAR SELECT PARA CLAVE FORÁNEA
                        if (isForeignKey) {
                            const firstItem = foreignTable[0];
                            const ideField = Object.keys(firstItem).find(key => key.endsWith('_ide'));
                            const displayField = Object.keys(firstItem).find(key => key !== ideField);

                            return (
                                <Form.Group key={index} className="mb-3">
                                    <Form.Label>{column.displayName}</Form.Label>
                                    <Form.Select
                                        name={column.originalName}
                                        value={formData[column.originalName] || ''}
                                        onChange={handleChange}
                                        required
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

                        // 4. RENDERIZAR INPUT PARA CAMPOS NORMALES
                        // (Si el nombre de la columna sugiere un número o porcentaje, lo tratamos como "number")
                        const isNumberField = ['por', 'val', 'sal', 'ani'].some(suffix => column.originalName.endsWith(suffix));

                        return (
                            <Form.Group key={index} className="mb-3">
                                <Form.Label>{column.displayName}</Form.Label>
                                <Form.Control
                                    type={isNumberField ? "number" : "text"}
                                    step={isNumberField ? "0.01" : undefined}
                                    name={column.originalName}
                                    value={formData[column.originalName] || ''}
                                    onChange={handleChange}
                                    placeholder={`Ingrese ${column.displayName}`}
                                    required
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
                {/* Cambiado type="submit" referenciando al form */}
                <Button variant="primary" type="submit" form="updateForm">
                    Guardar Cambios
                </Button>
            </Modal.Footer>

            {mensajeMostrado && (
                <div className="p-3 pb-0">
                    <Alert 
                        key={formEnviado ? 'success' : 'danger'} 
                        type={formEnviado ? 'success' : 'danger'}
                    >
                        {formEnviado ? '✓ Actualizado correctamente' : `✗ ${errorMessage}`}
                    </Alert>
                </div>
            )}
        </Modal>
    );
}

export default ModalUpdate;