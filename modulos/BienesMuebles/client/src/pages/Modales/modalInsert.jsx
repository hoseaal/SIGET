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
        tmacat: '/api/categorias',
        tessca: '/api/subcategorias',
        tescae: '/api/categorias-especificas',
        tmamar: '/api/marcas',
        tesmod: '/api/modelos',
        tmab_m: '/api/bienes',
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (foreign && show) {
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
                    if (onSuccess) onSuccess();
                }, 1000);
            } else {
                throw new Error(responseData.error || 'Error al insertar');
            }
        } catch (error) {
            setFormEnviado(false);
            setMensajeMostrado(true);
            setErrorMessage(error.message);
            console.error('Error al insertar:', error);
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
                        const isPrimaryKey = Boolean(column.isPrimaryKey === true || column.isPrimaryKey === "true" || column.isPrimaryKey === 1 || column.isPrimaryKey === "1");

                        // Detectar si es clave foránea
                        const isForeignKey = column.originalName.endsWith('ide') &&
                                            !isPrimaryKey && // Esto evita que se confunda con PK
                                            foreignTable.length > 0;

                        // SELECT para FK
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

                        // INPUT para PK o campos normales
                        return (
                            <Form.Group key={index} className="mb-3">
                            <Form.Label>{column.displayName}</Form.Label>
                            <Form.Control
                                type="text"
                                name={column.originalName}
                                value={formData[column.originalName] || ''}
                                onChange={handleChange}
                                placeholder={`Ingrese ${column.displayName}`}
                                required={isPrimaryKey}
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
            {mensajeMostrado && (
                <Alert key={formEnviado ? 'success' : 'danger'} type={formEnviado ? 'success' : 'danger'}>
                    {formEnviado ? 'Insertado con éxito' : `${errorMessage}`}
                </Alert>
            )}
        </Modal>
    );
}

export default ModalInsert;
