import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from "../../components/atoms/Alert";

function ModalInsert({ show, handleClose, columns, tableName, foreign, onSuccess }) {
    const [formData, setFormData] = useState({});
    const [formEnviado, setFormEnviado] = useState(false);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [foreignTable, setForeignTable] = useState([]);

    const endpointMap = {
        tmadir: '/api/direcciones',
        tesdiv: '/api/divisiones',
        tesuni: '/api/unidades',
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (foreign === 'tmamar' && show) {
            const fetchForeign = async () => {
                try {
                    const res = await fetch(`/api/marcas/alfabeticamente`);
                    const data = await res.json();
                    setForeignTable(data);
                } catch (error) {
                    console.error('Error al obtener datos foráneos:', error);
                }
            };
            fetchForeign();
        } else if (foreign && show) { 
            const fetchForeign = async () => {
                try {
                    const res = await fetch(`${endpointMap[foreign]}`);
                    const data = await res.json();
                    setForeignTable(data);
                } catch (error) {
                    console.error('Error al obtener datos foráneos:', error);
                }
            };
            fetchForeign();
        }
    }, [show, tableName, foreign]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = endpointMap[tableName];
        if (!endpoint) {
            console.error('No se encontró endpoint para la tabla:', tableName);
            return;
        }

        try {
            const response = await fetch(endpoint, {
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
                    // Limpiar el formulario tras guardar con éxito
                    setFormData({}); 
                    if (onSuccess) onSuccess();
                }, 1000);
            } else {
                throw new Error(responseData.error || 'Error al insertar');
            }
        } catch (error) {
            setFormEnviado(false);
            setMensajeMostrado(true);
            const errorMsg = error.response?.data?.error || error.message;

            if (errorMsg.includes("Duplicate entry")) {
                setErrorMessage("Este registro ya existe");
            } else {
                setErrorMessage(errorMsg);
            }

            console.error('Error al insertar:', error);
            setTimeout(() => {
                setMensajeMostrado(false);
            }, 3000);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Insertar Nuevo Registro</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id="insertForm" onSubmit={handleSubmit}>
                    {columns && columns.map((column, index) => {
                        const isPrimaryKey = Boolean(column.isPrimaryKey === true || column.isPrimaryKey === "true" || column.isPrimaryKey === 1 || column.isPrimaryKey === "1");

                        // 1. SI ES PRIMARY KEY, LA OMITIMOS (Retornamos null)
                        if (isPrimaryKey) {
                            return null;
                        }

                        // 2. Detectar si es clave foránea
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
                                                {item[displayField]}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            );
                        }

                        // 4. RENDERIZAR INPUT PARA CAMPOS NORMALES
                        return (
                            <Form.Group key={index} className="mb-3">
                                <Form.Label>{column.displayName}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name={column.originalName}
                                    value={formData[column.originalName] || ''}
                                    onChange={handleChange}
                                    placeholder={`Ingrese ${column.displayName}`}
                                    required // Hacemos requerido el campo por defecto
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
                {/* Cambiamos onClick al botón por type="submit" referenciando al form para que valide los "required" */}
                <Button variant="primary" type="submit" form="insertForm">
                    Guardar Cambios
                </Button>
            </Modal.Footer>
            {mensajeMostrado && (
                <div className="p-3">
                    <Alert key={formEnviado ? 'success' : 'danger'} type={formEnviado ? 'success' : 'danger'}>
                        {formEnviado ? 'Insertado con éxito' : `${errorMessage}`}
                    </Alert>
                </div>
            )}
        </Modal>
    );
}

export default ModalInsert;