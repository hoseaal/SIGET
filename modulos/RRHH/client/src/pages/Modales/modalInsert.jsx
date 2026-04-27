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
    const [foreignData, setForeignData] = useState({});

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
        niveles_salariales_antiguos: '/api/niveles-salariales-antiguos',
        primas_generales: '/api/primas',
        primas_profesionalizacion: '/api/primas-profesionalizacion',
        configuracion_antiguedad: '/api/antiguedad',
        deducciones: '/api/deducciones'
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Efecto para buscar los datos de las llaves foráneas
    useEffect(() => {
        if (foreign && show) { 
            const fetchAllForeign = async () => {
                const tables = Array.isArray(foreign) ? foreign : [foreign];
                const newData = {};

                for (const table of tables) {
                    const endpoint = endpointMap[table];
                    if (!endpoint) {
                        console.warn(`No se encontró endpoint configurado para la tabla foránea: ${table}`);
                        continue;
                    }

                    try {
                        const res = await fetch(endpoint);
                        const data = await res.json();
                        newData[table] = data;
                    } catch (error) {
                        console.error(`Error al obtener datos de ${table}:`, error);
                    }
                }
                setForeignData(newData);
            };
            fetchAllForeign();
        }
    }, [show, tableName, foreign]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = endpointMap[tableName];
        if (!endpoint) {
            console.error('No se encontró endpoint POST para la tabla:', tableName);
            setErrorMessage(`Falta configurar endpointMap para ${tableName}`);
            setMensajeMostrado(true);
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
                setErrorMessage("Este registro ya existe (Dato duplicado).");
            } else {
                setErrorMessage(errorMsg);
            }

            console.error('Error al insertar:', error);
            setTimeout(() => {
                setMensajeMostrado(false);
            }, 4000);
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

                        // 1. SI ES PRIMARY KEY, LA OMITIMOS (Retornamos null por AUTO_INCREMENT)
                        if (isPrimaryKey) {
                            return null;
                        }

                        // 2. Detectar si es clave foránea (termina en _id o _ide)
                        // Buscamos si tenemos datos para esta columna en foreignData
                        let tableData = [];
                        let tableNameMatch = null;

                        // Intentar encontrar la tabla correspondiente
                        if (column.originalName.endsWith('_id') || column.originalName.endsWith('_ide') || column.originalName.endsWith('id')) {
                            const possibleTableName = column.originalName.replace(/(_id|_ide|id)$/, 'es').toLowerCase(); // Convención simple
                            // O buscar en las tablas cargadas
                            tableNameMatch = Object.keys(foreignData).find(t => 
                                column.originalName.startsWith(t.replace(/es$/, '').replace(/s$/, ''))
                            );
                            
                            if (tableNameMatch) {
                                tableData = foreignData[tableNameMatch];
                            }
                        }

                        const isForeignKey = tableData.length > 0;

                        // 3. RENDERIZAR SELECT PARA CLAVE FORÁNEA
                        if (isForeignKey) {
                            const firstItem = tableData[0];
                            // Buscar el campo que sirve como ID (el que termina en _id o _ide)
                            const ideField = Object.keys(firstItem).find(key => 
                                key.toLowerCase().endsWith('_id') || 
                                key.toLowerCase().endsWith('_ide') || 
                                key.toLowerCase() === 'id'
                            ) || Object.keys(firstItem)[0];

                            // Buscar un campo para mostrar (preferiblemente nombre, descripcion, etc.)
                            const displayField = Object.keys(firstItem).find(key => 
                                ['nombre', 'descripcion', 'denominacion', 'nombre_completo'].includes(key.toLowerCase())
                            ) || Object.keys(firstItem).find(key => key !== ideField) || ideField;

                            // Verificar si es opcional (direccion_id o division_id)
                            const isOptional = ['direccion_id', 'division_id'].includes(column.originalName);

                            return (
                                <Form.Group key={index} className="mb-3">
                                    <Form.Label>{column.displayName} {isOptional && <small className="text-muted">(Opcional)</small>}</Form.Label>
                                    <Form.Select
                                        name={column.originalName}
                                        value={formData[column.originalName] || ''}
                                        onChange={handleChange}
                                        required={!isOptional}
                                    >
                                        <option value="">Seleccione una opción</option>
                                        {tableData.map((item) => (
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
                        // (Si el nombre de la columna sugiere un número o porcentaje, lo tratamos como "number")
                        const isNumberField = ['por', 'val', 'sal', 'ani'].some(suffix => column.originalName.endsWith(suffix));
                        const isOptionalField = ['porcentaje_anterior'].includes(column.originalName);

                        return (
                            <Form.Group key={index} className="mb-3">
                                <Form.Label>{column.displayName} {isOptionalField && <small className="text-muted">(Opcional)</small>}</Form.Label>
                                <Form.Control
                                    type={isNumberField ? "number" : "text"}
                                    step={isNumberField ? "0.01" : undefined}
                                    name={column.originalName}
                                    value={formData[column.originalName] || ''}
                                    onChange={handleChange}
                                    placeholder={`Ingrese ${column.displayName}`}
                                    required={!isOptionalField}
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