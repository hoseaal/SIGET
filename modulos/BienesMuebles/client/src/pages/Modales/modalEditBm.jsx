import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import Alert from "../../components/atoms/Alert";
import { getTableMetadata } from '../../data/fetchData';

// Mapeo de columnas a endpoints para las claves foráneas.
const foreignKeyEndpoints = {
    'dep_ide': '/api/departamentos',
    'foa_ide': '/api/formas-adquisicion',
    'esu_ide': '/api/estados-uso',
    'con_ide': '/api/condiciones-fisicas',
    'mod_ide': '/api/modelos',
    'tip_ide': '/api/tipos-bien',
    'cae_ide': '/api/categorias',
    'com_ide': '/api/conceptos-movimiento',
    'est_ide': '/api/estados-uso'
};

// Campos editables
const editableFields = {
    'bim_des': 'Descripción',
    'bim_ndo': 'Número de Documento',
    'bim_val': 'Valor',
    'bim_color': 'Color',
    'bim_cod': 'Código SUDEBIM',
    'bim_obs': 'Observación',
    'est_ide': 'Estado del Bien',
    'tip_ide': 'Tipo de Bien',
    'con_ide': 'Condición Física',
    'esu_ide': 'Estado de Uso',
};

const columnAliasBim = {
    'bim_ide': 'Código',
    'bim_des': 'Descripción',
    'bim_fec': 'Fecha de Adquisición',
    'bim_ndo': 'Número de Documento',
    'bim_val': 'Valor',
    'bim_moneda': 'Moneda',
    'bim_color': 'Color',
    'bim_cod': 'Código SUDEBIM',
    'bim_obs': 'Observación',
    'bim_sede': 'Sede',
    'est_ide': 'Estado del Bien',
    'tip_ide': 'Tipo de Bien',
    'foa_ide': 'Forma de Adquisición',
    'con_ide': 'Condición Física',
    'esu_ide': 'Estado de Uso',
    'mod_ide': 'Modelo',
    'cae_ide': 'Categoría Específica',
    'bim_inc': 'Incorporado',
    'bim_fed': 'Fecha de Desincorporación',
    'com_ide': 'Concepto de Movimiento',
    'dep_ide': 'Departamento'
};

const estadosBien = [
    { est_ide: 1, est_est: 'Sin etiqueta', badgeClass: 'bg-label-secondary' },
    { est_ide: 2, est_est: 'Inoperativo', badgeClass: 'bg-label-danger' },
    { est_ide: 3, est_est: 'Faltante', badgeClass: 'bg-label-warning' },
    { est_ide: 4, est_est: 'Operativo', badgeClass: 'bg-label-success' }
];

function ModalEditBm({ show, handleClose, BienId, onSuccess }) {
    const [formData, setFormData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [columns, setColumns] = useState([]);
    const [bienData, setBienData] = useState(null);
    const [selectOptions, setSelectOptions] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    
    useEffect(() => {
        if (show && BienId) {
            const fetchInitialData = async () => {
                setLoading(true);
                setError('');
                setSuccess('');
                try {
                    const { columns: metaColumns, primaryKey } = await getTableMetadata('tmab_m');
                    
                    const visibleColumns = metaColumns.filter(
                        col => col.name !== 'bim_inc' && col.name !== 'bim_fed'
                    );

                    const formattedColumns = visibleColumns.map(col => {
                        const isPK = col.name === primaryKey;
                        const isEditable = Object.keys(editableFields).includes(col.name) && !isPK;
                        
                        return {
                            originalName: col.name,
                            displayName: columnAliasBim[col.name] || col.name,
                            isPrimaryKey: isPK,
                            isEditable: isEditable
                        };
                    });
                    setColumns(formattedColumns);

                    const bienRes = await fetch(`/api/bienes/${BienId}`);
                    if (!bienRes.ok) throw new Error('No se pudo cargar el bien.');
                    const bienJson = await bienRes.json();
                    const bien = Array.isArray(bienJson.data) ? bienJson.data[0] : bienJson;
                    
                    setBienData(bien);
                    setOriginalData(bien); // Guardamos los datos originales
                    setFormData(bien); // Inicializamos formData con los datos del bien

                    const optionPromises = Object.entries(foreignKeyEndpoints)
                        .filter(([key]) => Object.keys(editableFields).includes(key))
                        .map(async ([key, endpoint]) => {
                            const res = await fetch(endpoint);
                            const data = await res.json();
                            return { [key]: Array.isArray(data.data) ? data.data : data };
                        });
                    
                    const optionsResults = await Promise.all(optionPromises);
                    const allOptions = Object.assign({}, ...optionsResults);
                    setSelectOptions(allOptions);

                } catch (err) {
                    setError(err.message || 'Ocurrió un error al cargar los datos.');
                } finally {
                    setLoading(false);
                }
            };
            fetchInitialData();
        }
    }, [show, BienId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            // 1. Filtrar solo los campos editables que han cambiado
            const changedFields = {};
            
            Object.keys(editableFields).forEach(key => {
                if (formData[key] !== originalData[key]) {
                    changedFields[key] = formData[key];
                }
            });

            // 2. Si no hay cambios, no hacemos la petición
            if (Object.keys(changedFields).length === 0) {
                setSuccess('No se detectaron cambios para guardar');
                return;
            }

            console.log("Datos modificados a enviar:", changedFields);

            // 3. Enviar solo los campos modificados
            const response = await fetch(`/api/bienes/${BienId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(changedFields),
            });
            
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Error al actualizar el registro.');
            }
            
            setSuccess('✓ Actualizado correctamente');
            setTimeout(() => {
                handleClose();
                 if (onSuccess) onSuccess();
            }, 2000);
        } catch (err) {
            setError(`✗ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

      const renderFormField = (column) => {
    const fieldName = column.originalName;
    const isDisabled = loading || !column.isEditable;
    const isSelect = (fieldName.slice(-3) === 'ide') && !column.isPrimaryKey;

    // Mapeo de campos a sus respectivas propiedades en BienData
    const fieldDisplayMap = {
        'foa_ide': bienData?.forma_adquisicion,
        'mod_ide': bienData?.modelo,
        'cae_ide': bienData?.categoria_especifica,
        'com_ide': bienData?.concepto,
        'dep_ide': bienData?.departamento
    };
    if (fieldName === 'est_ide') {
        return (
            <div>
                <Form.Select
                    name="est_ide"
                    value={formData.est_ide || ''}
                    onChange={handleChange}
                    disabled={isDisabled}
                >
                    <option value="">-- Seleccione estado --</option>
                    {estadosBien.map(estado => (
                        <option key={estado.est_ide} value={estado.est_ide}>
                            {estado.est_est}
                        </option>
                    ))}
                </Form.Select>
            </div>
        );
    }

    // Si el campo está en nuestro mapeo, mostrar el valor correspondiente deshabilitado
    if (fieldName in fieldDisplayMap) {
        return (
            <Form.Control
                type="text"
                value={fieldDisplayMap[fieldName] || ''}
                disabled={true}
                readOnly={true}
                className="form-control-readonly"
            />
        );
    }
    if (fieldName === 'bim_fec') {
    const formattedDate = formData[fieldName] 
        ? new Date(formData[fieldName]).toISOString().split('T')[0]
        : '';
    return (
        <Form.Control
            type="date"
            name={fieldName}
            value={formattedDate}
            onChange={handleChange}
            disabled={isDisabled}
        />
    );
}

    if (isSelect) {
        const options = selectOptions[fieldName] || [];
        const firstOption = options[0];
        const valueKey = firstOption ? Object.keys(firstOption).find(k => k.endsWith('_ide') || k.endsWith('_moneda')) : 'id';
        const displayKey = firstOption ? Object.keys(firstOption).find(k => !k.endsWith('_ide') && k !== valueKey) : 'name';
        
        return (
            <Form.Select
                name={fieldName}
                value={formData[fieldName] || ''}
                onChange={handleChange}
                disabled={isDisabled}
            >
                <option value="">-- Seleccione --</option>
                {options.map((opt, i) => (
                    <option key={i} value={opt[valueKey]}>{opt[displayKey]}</option>
                ))}
            </Form.Select>
        );
    }
    
    if (['bim_des', 'bim_obs'].includes(fieldName)) {
        return (
            <Form.Control
                as="textarea" 
                rows={3} 
                name={fieldName}
                value={formData[fieldName] || ''} 
                onChange={handleChange}
                disabled={isDisabled}
            />
        );
    }

    return (
        <Form.Control
            type="text" 
            name={fieldName}
            value={formData[fieldName] || ''} 
            onChange={handleChange}
            readOnly={!column.isEditable}
            disabled={isDisabled}
            className={!column.isEditable ? 'form-control-readonly' : ''}
        />
    );
};

const getEstadoBadge = (est_ide) => {
    const estado = estadosBien.find(e => e.est_ide === est_ide);
    if (!estado) return null;
    
    return (
        <span className={`badge ${estado.badgeClass} me-1`}>
            {estado.est_est}
        </span>
    );
};

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Bien: {bienData?.bim_ide}  {bienData?.bim_des} {bienData?.est_ide && (
                    <div className="mt-2">
                        {getEstadoBadge(formData.est_ide)}
                    </div>
                )}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading && !columns.length ? (
                        <div className="text-center"><Spinner animation="border" /><p>Cargando datos...</p></div>
                    ) : (
                        <Row>
                            {columns.map((column) => (
                                <Col md={6} key={column.originalName}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{column.displayName}</Form.Label>
                                        {renderFormField(column)}
                                    </Form.Group>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {(error || success) && (<Alert type={error ? 'danger' : 'success'}>{error || success}</Alert>)}
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Guardar Cambios'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ModalEditBm;