import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { getTableMetadata } from '../../data/fetchData';
import ModalInsert from '../Modales/modalInsert';
import ModalUpdate from '../Modales/modalUpdate';
import ModalDelete from '../Modales/modalDelete';

export const EstructuraOrganizacional = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1); // Fuerza recarga
    };

    // ==========================================
    // ESTADOS PARA DIRECCIONES (Nivel 1)
    // ==========================================
    const [columnsDir, setColumnsDir] = useState([]);
    const [idColumnDir, setIdColumnDir] = useState(null);
    const [dataDir, setDataDir] = useState([]);
    const [showDirModal, setShowDirModal] = useState(false);
    const [showDirUpModal, setShowDirUpModal] = useState(false);
    const [showDirDelModal, setShowDirDelModal] = useState(false);

    const columnAliasDir = {
        'direccion_id': 'Código',
        'nombre': 'Dirección'
    };

    // ==========================================
    // ESTADOS PARA DIVISIONES (Nivel 2)
    // ==========================================
    const [columnsDiv, setColumnsDiv] = useState([]);
    const [idColumnDiv, setIdColumnDiv] = useState(null);
    const [dataDiv, setDataDiv] = useState([]);
    const [showDivModal, setShowDivModal] = useState(false);
    const [showDivUpModal, setShowDivUpModal] = useState(false);
    const [showDivDelModal, setShowDivDelModal] = useState(false);

    const columnAliasDiv = {
        'division_id': 'Código',
        'nombre': 'División',
        'direccion_id': 'Dirección'
    };

    // ==========================================
    // ESTADOS PARA UNIDADES (Nivel 3)
    // ==========================================
    const [columnsUni, setColumnsUni] = useState([]);
    const [idColumnUni, setIdColumnUni] = useState(null);
    const [dataUni, setDataUni] = useState([]);
    const [showUniModal, setShowUniModal] = useState(false);
    const [showUniUpModal, setShowUniUpModal] = useState(false);
    const [showUniDelModal, setShowUniDelModal] = useState(false);

    const columnAliasUni = {
        'unidad_id': 'Código',
        'nombre': 'Unidad',
        'division_id': 'División'
    };

    // ==========================================
    // EFECTOS (CARGA DE DATOS)
    // ==========================================

    // Cargar Direcciones
    useEffect(() => {
        const loadDirData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('direcciones');
                setColumnsDir(columns.map(col => ({
                    originalName: col.name,
                    displayName: columnAliasDir[col.name] || col.name,
                    isPrimaryKey: col.name === primaryKey
                })));
                setIdColumnDir(primaryKey);

                const res = await fetch('/api/direcciones', { credentials: 'include' });
                const data = await res.json();
                setDataDir(data);
            } catch (error) {
                console.error('Error cargando direcciones:', error);
            }
        };
        loadDirData();
    }, [refreshKey]);

    // Cargar Divisiones
    useEffect(() => {
        const loadDivData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('divisiones');
                setColumnsDiv(columns.map(col => ({
                    originalName: col.name,
                    displayName: columnAliasDiv[col.name] || col.name,
                    isPrimaryKey: col.name === primaryKey
                })));
                setIdColumnDiv(primaryKey);

                const res = await fetch('/api/divisiones', { credentials: 'include' });
                const data = await res.json();
                setDataDiv(data);
            } catch (error) {
                console.error('Error cargando divisiones:', error);
            }
        };
        loadDivData();
    }, [refreshKey]);

    // Cargar Unidades
    useEffect(() => {
        const loadUniData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('unidades');
                setColumnsUni(columns.map(col => ({
                    originalName: col.name,
                    displayName: columnAliasUni[col.name] || col.name,
                    isPrimaryKey: col.name === primaryKey
                })));
                setIdColumnUni(primaryKey);

                const res = await fetch('/api/unidades', { credentials: 'include' });
                const data = await res.json();
                setDataUni(data);
            } catch (error) {
                console.error('Error cargando unidades:', error);
            }
        };
        loadUniData();
    }, [refreshKey]);

    // ==========================================
    // MAPEOS PARA MOSTRAR NOMBRES EN TABLAS AGRUPADAS
    // ==========================================
    const DireccionesMap = dataDir.reduce((acc, dir) => {
        acc[dir.direccion_id] = dir.nombre;
        return acc;
    }, {});

    const DivisionesMap = dataDiv.reduce((acc, div) => {
        acc[div.division_id] = div.nombre;
        return acc;
    }, {});

    return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración Organizacional /</span> Estructura Organizacional</h4>
            
            {/* ========================================== */}
            {/* 1. DIRECCIONES */}
            {/* ========================================== */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Direcciones</h5>
                    <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={() => setShowDirModal(true)}
                    >
                        Agregar Dirección
                    </button>
                </div>
                
                <ModalInsert
                    show={showDirModal}
                    handleClose={() => setShowDirModal(false)}
                    columns={columnsDir}
                    tableName="direcciones"
                    onSuccess={handleSuccess}
                />

                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsDir.map((col, index) => (
                                    <th key={index}>{col.displayName}</th>
                                ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {dataDir.map((item, index) => (
                                <tr key={`dir-${index}`}>
                                    {columnsDir.map((col) => (
                                        <td key={`${index}-${col.originalName}`}>
                                            {item[col.originalName.toLowerCase()] ?? 'N/A'}
                                        </td>
                                    ))}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" id={`dropdown-dir-${index}`} className="nav-dropdown-dark-example btn-sm">
                                                <i className="bx bx-dots-vertical-rounded"></i>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item href="#" onClick={() => {
                                                    setEditingItem(item);
                                                    setShowDirUpModal(true);
                                                }}>
                                                    <i className="bx bx-edit-alt me-1"></i> Editar
                                                </Dropdown.Item>
                                                <Dropdown.Item href="#" onClick={() => {
                                                    setDeleteItem(item.direccion_id);
                                                    setShowDirDelModal(true);
                                                }}>
                                                    <i className="bx bx-trash me-1"></i> Eliminar
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ModalUpdate 
                    show={showDirUpModal}
                    handleClose={() => setShowDirUpModal(false)}
                    columns={columnsDir}
                    tableName='direcciones'
                    rowData={editingItem} 
                    onSuccess={handleSuccess}
                    idColumn={idColumnDir}
                />
                <ModalDelete 
                    show={showDirDelModal}
                    handleClose={() => setShowDirDelModal(false)}
                    tableName="direcciones"
                    rowId={deleteItem} 
                    idColumn={idColumnDir} 
                    onSuccess={handleSuccess} 
                />
            </div>

            <hr className="my-5" />

            {/* ========================================== */}
            {/* 2. DIVISIONES (Agrupadas por Dirección) */}
            {/* ========================================== */}
            <div className="card">
               <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Divisiones</h5>
                    <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={() => setShowDivModal(true)}
                    >
                        Agregar División
                    </button>
                </div>

                <ModalInsert
                    show={showDivModal}
                    handleClose={() => setShowDivModal(false)}
                    columns={columnsDiv}
                    foreign={'direcciones'} // Referencia a la tabla Direcciones
                    idColumn={idColumnDiv}
                    tableName="divisiones"
                    onSuccess={handleSuccess}
                />

                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsDiv
                                    .filter(col => col.originalName !== 'direccion_id') // Excluye la columna foránea
                                    .map((col, index) => (
                                        <th key={index}>{col.displayName}</th>
                                    ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {Object.entries(
                                dataDiv.reduce((acc, item) => {
                                    const dirId = item.direccion_id;
                                    if (!acc[dirId]) acc[dirId] = [];
                                    acc[dirId].push(item);
                                    return acc;
                                }, {})
                            ).map(([dirId, divisiones]) => (
                                <React.Fragment key={`group-div-${dirId}`}>
                                    {/* Cabecera Agrupadora */}
                                    <tr className="bg-light">
                                        <td colSpan={columnsDiv.filter(col => col.originalName !== 'direccion_id').length + 1}>
                                            <strong className="text-primary">Dirección {dirId}: {DireccionesMap[dirId] || `Dirección ${dirId}`}</strong>
                                        </td>
                                    </tr>
                                    
                                    {/* Filas de la División */}
                                    {divisiones.map((item, index) => (
                                        <tr key={`div-${dirId}-${index}`}>
                                            {columnsDiv
                                                .filter(col => col.originalName !== 'direccion_id')
                                                .map((col) => (
                                                    <td key={`col-${dirId}-${index}-${col.originalName}`}>
                                                        {item[col.originalName.toLowerCase()] ?? 'N/A'}
                                                    </td>
                                                ))}
                                            <td>
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="secondary" id={`dropdown-div-${dirId}-${index}`} className="nav-dropdown-dark-example btn-sm">
                                                        <i className="bx bx-dots-vertical-rounded"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item href="#" onClick={() => {
                                                            setEditingItem(item);
                                                            setShowDivUpModal(true);
                                                        }}>
                                                            <i className="bx bx-edit-alt me-1"></i> Editar
                                                        </Dropdown.Item>
                                                        <Dropdown.Item href="#" onClick={() => {
                                                            setDeleteItem(item.division_id);
                                                            setShowDivDelModal(true);
                                                        }}>
                                                            <i className="bx bx-trash me-1"></i> Eliminar
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <ModalUpdate 
                    show={showDivUpModal}
                    handleClose={() => setShowDivUpModal(false)}
                    columns={columnsDiv}
                    tableName='divisiones'
                    rowData={editingItem} 
                    foreign='direcciones'
                    onSuccess={handleSuccess}
                    idColumn={idColumnDiv}
                />
                <ModalDelete 
                    show={showDivDelModal}
                    handleClose={() => setShowDivDelModal(false)}
                    tableName="divisiones"
                    rowId={deleteItem} 
                    idColumn={idColumnDiv} 
                    onSuccess={handleSuccess} 
                />
            </div>

            <hr className="my-5" />

            {/* ========================================== */}
            {/* 3. UNIDADES (Agrupadas por División) */}
            {/* ========================================== */}
            <div className="card">
               <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Unidades</h5>
                    <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={() => setShowUniModal(true)}
                    >
                        Agregar Unidad
                    </button>
                </div>

                <ModalInsert
                    show={showUniModal}
                    handleClose={() => setShowUniModal(false)}
                    columns={columnsUni}
                    foreign={'divisiones'} // Referencia a la tabla Divisiones
                    idColumn={idColumnUni}
                    tableName="unidades"
                    onSuccess={handleSuccess}
                />

                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsUni
                                    .filter(col => col.originalName !== 'division_id') // Excluye la columna foránea
                                    .map((col, index) => (
                                        <th key={index}>{col.displayName}</th>
                                    ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {Object.entries(
                                dataUni.reduce((acc, item) => {
                                    const divId = item.division_id;
                                    if (!acc[divId]) acc[divId] = [];
                                    acc[divId].push(item);
                                    return acc;
                                }, {})
                            ).map(([divId, unidades]) => (
                                <React.Fragment key={`group-uni-${divId}`}>
                                    {/* Cabecera Agrupadora */}
                                    <tr className="bg-light">
                                        <td colSpan={columnsUni.filter(col => col.originalName !== 'division_id').length + 1}>
                                            <strong className="text-primary">División {divId}: {DivisionesMap[divId] || `División ${divId}`}</strong>
                                        </td>
                                    </tr>
                                    
                                    {/* Filas de la Unidad */}
                                    {unidades.map((item, index) => (
                                        <tr key={`uni-${divId}-${index}`}>
                                            {columnsUni
                                                .filter(col => col.originalName !== 'division_id')
                                                .map((col) => (
                                                    <td key={`col-${divId}-${index}-${col.originalName}`}>
                                                        {item[col.originalName.toLowerCase()] ?? 'N/A'}
                                                    </td>
                                                ))}
                                            <td>
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="secondary" id={`dropdown-uni-${divId}-${index}`} className="nav-dropdown-dark-example btn-sm">
                                                        <i className="bx bx-dots-vertical-rounded"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item href="#" onClick={() => {
                                                            setEditingItem(item);
                                                            setShowUniUpModal(true);
                                                        }}>
                                                            <i className="bx bx-edit-alt me-1"></i> Editar
                                                        </Dropdown.Item>
                                                        <Dropdown.Item href="#" onClick={() => {
                                                            setDeleteItem(item.unidad_id);
                                                            setShowUniDelModal(true);
                                                        }}>
                                                            <i className="bx bx-trash me-1"></i> Eliminar
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <ModalUpdate 
                    show={showUniUpModal}
                    handleClose={() => setShowUniUpModal(false)}
                    columns={columnsUni}
                    tableName='unidades'
                    rowData={editingItem} 
                    foreign='divisiones'
                    onSuccess={handleSuccess}
                    idColumn={idColumnUni}
                />
                <ModalDelete 
                    show={showUniDelModal}
                    handleClose={() => setShowUniDelModal(false)}
                    tableName="unidades"
                    rowId={deleteItem} 
                    idColumn={idColumnUni} 
                    onSuccess={handleSuccess} 
                />
            </div>
        </div>
    );
};