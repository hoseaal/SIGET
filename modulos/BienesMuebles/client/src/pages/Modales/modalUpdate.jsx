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
    const [tiposUsuario, setTiposUsuario] = useState([]);
    const [modulosAcceso, setModulosAcceso] = useState([]);

    const endpointMap = {
        tmacat: '/api/categorias',
        tessca: '/api/subcategorias',
        tescae: '/api/categorias-especificas',
        tmamar: '/api/marcas',
        tesmod: '/api/modelos',
        tmab_m: '/api/bienes',
        tesusu: '/api/user',
        tmacom: '/api/conceptos-movimiento',
    };

    if (tableName === 'tesusu' ) {
        columns = columns.filter(col => col.originalName !== 'usu_tip' && col.originalName !== 'usu_mod');
    }

    useEffect(() => {
        if (show && rowData) {
            setFormData(rowData);
        }
    }, [show, rowData]);

    useEffect(() => {
        if (foreign === 'tmamar' && show ) {
            const fetchForeignData = async () => {
                try {
                    const response = await fetch(`/api/marcas/alfabeticamente`);
                    if (!response.ok) throw new Error('Error al obtener datos');
                    const data = await response.json();
                    setForeignTable(data);
                } catch (error) {
                    console.error(`Error al obtener datos de ${foreign}:`, error);
                    setErrorMessage(`Error al cargar datos de ${foreign}`);
                }
            };
            fetchForeignData();
        } else if (show && foreign) {
            const fetchForeignData = async () => {
                try {
                    const response = await fetch(`${endpointMap[foreign]}`);
                    if (!response.ok) throw new Error('Error al obtener datos');
                    const data = await response.json();
                    setForeignTable(data);
                } catch (error) {
                    console.error(`Error al obtener datos de ${foreign}:`, error);
                    setErrorMessage(`Error al cargar datos de ${foreign}`);
                }
            };
            fetchForeignData();
        }
    }, [show, foreign]);

    // Catálogos dinámicos para el usuario de login (tesusu): tipos y módulos desde la BD
    useEffect(() => {
        if (!show || tableName !== 'tesusu') return;
        const fetchCatalogosUsuario = async () => {
            try {
                const [resTipos, resModulos] = await Promise.all([
                    fetch('/api/meta/tipos-usuario'),
                    fetch('/api/meta/modulos-acceso')
                ]);
                if (resTipos.ok) setTiposUsuario(await resTipos.json());
                if (resModulos.ok) setModulosAcceso(await resModulos.json());
            } catch (error) {
                console.error('Error al cargar catálogos de usuario:', error);
            }
        };
        fetchCatalogosUsuario();
    }, [show, tableName]);

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
            setErrorMessage('Error: No se encontró el ID del registro');
            setMensajeMostrado(true);
            return;
        }

        try {
            const response = await fetch(`${endpointMap[tableName]}/${rowId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error desconocido');
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
            setErrorMessage(error.message || 'Error desconocido');

            setTimeout(() => {
                setMensajeMostrado(false);
            }, 3000);
        }
    };

    const isFieldDisabled = (column) => {
        return column.isPrimaryKey; // Solo la PK se desactiva
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Actualizar registro</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {columns && columns.map((column, index) => {
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
                    {tableName === 'tesusu' && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Tipo de Usuario</Form.Label>
                                <Form.Select
                                    name="usu_tip"
                                    value={formData.usu_tip || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione una opción</option>
                                    {/* Cargado dinámicamente desde testip */}
                                    {tiposUsuario.map((item) => (
                                        <option 
                                            key={item.usu_tip} 
                                            value={item.usu_tip}
                                        >
                                            {item.tip_nom}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Módulo de Usuario</Form.Label>
                                <Form.Select
                                    name="usu_mod"
                                    value={formData.usu_mod || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione una opción</option>
                                    {/* Cargado dinámicamente desde tesacc */}
                                    {modulosAcceso.map((item) => (
                                        <option 
                                            key={item.usu_mod} 
                                            value={item.usu_mod}
                                        >
                                            {item.acc_nom}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </>
                    )}
                   
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
