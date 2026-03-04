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
    'mod_ide': '/api/modelos/alfabeticamente',
    'mar_ide': '/api/marcas',
    'cae_ide': '/api/categorias',
    'com_ide': '/api/conceptos-movimiento',
    'est_ide': '/api/estados-uso'
};

// Campos editables
const editableFields = {
    'dep_ide': 'Departamento Original',
    'bim_des': 'Descripción',
    'bim_ndo': 'Número de Documento',
    'bim_val': 'Valor',
    'bim_color': 'Color',
    'bim_cod': 'Código SUDEBIP',
    'bim_obs': 'Observación',
    'est_ide': 'Estado del Bien',
    'con_ide': 'Condición Física', // Ahora es editable siempre
    'esu_ide': 'Estado de Uso',
    'mod_ide': 'Modelo',
    'foa_ide': 'Forma de Adquisición',
};

const columnAliasBim = {
    'bim_ide': 'Código',
    'bim_des': 'Descripción',
    'bim_fec': 'Fecha de Adquisición',
    'bim_ndo': 'Número de Documento',
    'bim_val': 'Valor',
    'bim_moneda': 'Moneda',
    'bim_color': 'Color',
    'bim_cod': 'Código SUDEBIP',
    'bim_obs': 'Observación',
    'bim_sede': 'Sede',
    'est_ide': 'Estado del Bien',
    'foa_ide': 'Forma de Adquisición',
    'con_ide': 'Condición Física',
    'esu_ide': 'Estado de Uso',
    'mar_ide': 'Marca',
    'dep_ide': 'Departamento',
    'cae_ide': 'Categoría Específica',
    'bim_inc': 'Incorporado',
    'bim_fed': 'Fecha de Desincorporación',
    'com_ide': 'Concepto de Movimiento',
    'mod_ide': 'Modelo',
    'bim_ser': 'Serial',
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
    const [prestamoInfo, setPrestamoInfo] = useState(null); 
    const [selectOptions, setSelectOptions] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const truncateText = (text, maxLength = 30) => { // Aumenté un poco el límite
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;
        return <span title={text}>{`${text.substring(0, maxLength)}...`}</span>;
    };

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

                    // Asegurar que mar_ide esté presente
                    if (!formattedColumns.some(c => c.originalName === 'mar_ide')) {
                        formattedColumns.push({
                            originalName: 'mar_ide',
                            displayName: columnAliasBim['mar_ide'],
                            isPrimaryKey: false,
                            isEditable: !!editableFields['mar_ide']
                        });
                    }

                    setColumns(formattedColumns);

                    // --- Carga de datos del bien ---
                    const bienRes = await fetch(`/api/bienes/${BienId}`);
                    if (!bienRes.ok) throw new Error('No se pudo cargar el bien.');
                    const bienJson = await bienRes.json();
                    const bien = Array.isArray(bienJson.data) ? bienJson.data[0] : bienJson; 
                    
                    setBienData(bien);
                    setOriginalData(bien);
                    setFormData(bien);

                    // --- Carga de información de préstamo --
                    const prestamoRes = await fetch(`/api/prestamos/estado-bien/${BienId}`);
                    if (!prestamoRes.ok) {
                        if (prestamoRes.status === 404) {
                            setPrestamoInfo(null); // No está activo en ningún lado, está en su origen
                        } else {
                            // Si falla, no bloqueamos el modal, solo logueamos
                            console.warn('No se pudo verificar el estado de préstamo del bien.');
                            setPrestamoInfo(null);
                        }
                    } else {
                        const prestamoData = await prestamoRes.json();
                        setPrestamoInfo(prestamoData);
                    }

                    // --- Carga de selects ---
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
            const changedFields = {};
            
            Object.keys(editableFields).forEach(key => {
                // Comparamos valores (convirtiendo a string por si acaso vienen números y strings mixtos)
                if (String(formData[key]) !== String(originalData[key])) {
                    changedFields[key] = formData[key];
                }
            });

            if (Object.keys(changedFields).length === 0) {
                setSuccess('No se detectaron cambios para guardar');
                setLoading(false);
                return;
            }

            // --- CORRECCIÓN CLAVE ---
            // Se eliminó el bloque que lanzaba error si 'prestamoInfo !== null'.
            // Ahora se permite editar aunque esté prestado.
            // ------------------------

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
            }, 1500);
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

        // Mapeo de campos solo visuales (read-only)
        const fieldDisplayMap = {
            'mar_ide': bienData?.marca,
            'cae_ide': bienData?.categoria_especifica,
            'com_ide': bienData?.concepto
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
            // Lógica para detectar dinámicamente qué campo es el ID y cuál el Label en el objeto
            const valueKey = options.length > 0 ? Object.keys(options[0]).find(k => k.endsWith('_ide')) : '';
            const displayKey = options.length > 0 ? Object.keys(options[0]).find(k => !k.endsWith('_ide') && k !== valueKey) : '';
            
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
        // Excluir 'dep_ide' de este renderizado genérico (se muestra arriba manualmente)
        if (fieldName === 'dep_ide') {
            return null; 
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
        const estado = estadosBien.find(e => e.est_ide === Number(est_ide));
        if (!estado) return null;
        
        return (
            <span className={`badge ${estado.badgeClass} me-1`}>
                {estado.est_est}
            </span>
        );
    };

    // Helper para el título de ubicación actual
    const getUbicacionLabel = () => {
        if (!prestamoInfo) return 'Ubicación: Departamento Original (En Custodia)';
        // Si tienes el campo pre_cla en prestamoInfo podrías ser más específico:
        // if (prestamoInfo.pre_cla === 'A') return `EN ALMACÉN (Oficio: ${prestamoInfo.pre_ndo})`;
        // if (prestamoInfo.pre_cla === 'P') return `EN PRÉSTAMO (Oficio: ${prestamoInfo.pre_ndo})`;
        return `UBICACIÓN ACTUAL (Activo en: ${prestamoInfo.pre_ndo})`;
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title className="w-100"> 
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span>Editar Bien: {bienData?.bim_ide}</span>
                            {bienData?.est_ide && (
                                <div>
                                    {getEstadoBadge(formData.est_ide)}
                                </div>
                            )}
                        </div>
                        <small className="text-muted">{truncateText(bienData?.bim_des, 60)}</small>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading && !bienData ? (
                        <div className="text-center my-4">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Cargando datos del bien...</p>
                        </div>
                    ) : (
                        <Row className="mb-6 g-3"> 
                            {/* Información de Ubicación (Solo Lectura) */}
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Departamento Propietario (Origen):</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={bienData?.departamento || ''}
                                        disabled={true}
                                        readOnly={true}
                                        className="form-control-readonly"
                                        style={{ fontWeight: '500' }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{getUbicacionLabel()}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={prestamoInfo 
                                            ? `${prestamoInfo.departamento_destino_nombre}`
                                            : 'En resguardo del propietario'}
                                        disabled={true} 
                                        readOnly={true}
                                        className={prestamoInfo ? 'form-control-readonly border-info' : 'form-control-readonly'}
                                        style={{ fontWeight: 'bold', color: prestamoInfo ? '#007bff' : '#6c757d' }}
                                    />
                                    {prestamoInfo && (
                                        <Form.Text className="text-muted">
                                            Este bien tiene un movimiento activo. Puede editar sus características físicas, pero no su departamento origen.
                                        </Form.Text>
                                    )}
                                </Form.Group>
                            </Col>
                        
                            <div className="border-bottom my-2"></div> {/* Separador */}

                            {/* Renderizado dinámico de columnas */}
                            {columns.map((column) => {
                                // Renderizamos el campo solo si renderFormField no retorna null
                                const field = renderFormField(column);
                                if (!field) return null;

                                return (
                                    <Col md={6} key={column.originalName}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{column.displayName}</Form.Label>
                                            {field}
                                        </Form.Group>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {(error || success) && (
                        <div className="flex-grow-1">
                             <Alert type={error ? 'danger' : 'success'}>{error || success}</Alert>
                        </div>
                    )}
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <><Spinner as="span" animation="border" size="sm" className="me-1"/> Guardando...</> : 'Guardar Cambios'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ModalEditBm;