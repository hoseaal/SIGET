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
        'dir_ide': 'Código',
        'dir_nom': 'Dirección'
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
        'div_ide': 'Código',
        'div_nom': 'División',
        'dir_ide': 'Dirección'
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
        'uni_ide': 'Código',
        'uni_nom': 'Unidad',
        'div_ide': 'División'
    };

    // ==========================================
    // EFECTOS (CARGA DE DATOS)
    // ==========================================

    // Cargar Direcciones
    useEffect(() => {
        const loadDirData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('tmadir');
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
                const { columns, primaryKey } = await getTableMetadata('tesdiv');
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
                const { columns, primaryKey } = await getTableMetadata('tesuni');
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
        acc[dir.dir_ide] = dir.dir_nom;
        return acc;
    }, {});

    const DivisionesMap = dataDiv.reduce((acc, div) => {
        acc[div.div_ide] = div.div_nom;
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
                    tableName="tmadir"
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
                                                    setDeleteItem(item.dir_ide);
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
                    tableName='tmadir'
                    rowData={editingItem} 
                    onSuccess={handleSuccess}
                    idColumn={idColumnDir}
                />
                <ModalDelete 
                    show={showDirDelModal}
                    handleClose={() => setShowDirDelModal(false)}
                    tableName="tmadir"
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
                    foreign={'tmadir'} // Referencia a la tabla Direcciones
                    idColumn={idColumnDiv}
                    tableName="tesdiv"
                    onSuccess={handleSuccess}
                />

                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsDiv
                                    .filter(col => col.originalName !== 'dir_ide') // Excluye la columna foránea
                                    .map((col, index) => (
                                        <th key={index}>{col.displayName}</th>
                                    ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {Object.entries(
                                dataDiv.reduce((acc, item) => {
                                    const dirId = item.dir_ide;
                                    if (!acc[dirId]) acc[dirId] = [];
                                    acc[dirId].push(item);
                                    return acc;
                                }, {})
                            ).map(([dirId, divisiones]) => (
                                <React.Fragment key={`group-div-${dirId}`}>
                                    {/* Cabecera Agrupadora */}
                                    <tr className="bg-light">
                                        <td colSpan={columnsDiv.filter(col => col.originalName !== 'dir_ide').length + 1}>
                                            <strong className="text-primary">Dirección {dirId}: {DireccionesMap[dirId] || `Dirección ${dirId}`}</strong>
                                        </td>
                                    </tr>
                                    
                                    {/* Filas de la División */}
                                    {divisiones.map((item, index) => (
                                        <tr key={`div-${dirId}-${index}`}>
                                            {columnsDiv
                                                .filter(col => col.originalName !== 'dir_ide')
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
                                                            setDeleteItem(item.div_ide);
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
                    tableName='tesdiv'
                    rowData={editingItem} 
                    foreign='tmadir'
                    onSuccess={handleSuccess}
                    idColumn={idColumnDiv}
                />
                <ModalDelete 
                    show={showDivDelModal}
                    handleClose={() => setShowDivDelModal(false)}
                    tableName="tesdiv"
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
                    foreign={'tesdiv'} // Referencia a la tabla Divisiones
                    idColumn={idColumnUni}
                    tableName="tesuni"
                    onSuccess={handleSuccess}
                />

                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsUni
                                    .filter(col => col.originalName !== 'div_ide') // Excluye la columna foránea
                                    .map((col, index) => (
                                        <th key={index}>{col.displayName}</th>
                                    ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {Object.entries(
                                dataUni.reduce((acc, item) => {
                                    const divId = item.div_ide;
                                    if (!acc[divId]) acc[divId] = [];
                                    acc[divId].push(item);
                                    return acc;
                                }, {})
                            ).map(([divId, unidades]) => (
                                <React.Fragment key={`group-uni-${divId}`}>
                                    {/* Cabecera Agrupadora */}
                                    <tr className="bg-light">
                                        <td colSpan={columnsUni.filter(col => col.originalName !== 'div_ide').length + 1}>
                                            <strong className="text-primary">División {divId}: {DivisionesMap[divId] || `División ${divId}`}</strong>
                                        </td>
                                    </tr>
                                    
                                    {/* Filas de la Unidad */}
                                    {unidades.map((item, index) => (
                                        <tr key={`uni-${divId}-${index}`}>
                                            {columnsUni
                                                .filter(col => col.originalName !== 'div_ide')
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
                                                            setDeleteItem(item.uni_ide);
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
                    tableName='tesuni'
                    rowData={editingItem} 
                    foreign='tesdiv'
                    onSuccess={handleSuccess}
                    idColumn={idColumnUni}
                />
                <ModalDelete 
                    show={showUniDelModal}
                    handleClose={() => setShowUniDelModal(false)}
                    tableName="tesuni"
                    rowId={deleteItem} 
                    idColumn={idColumnUni} 
                    onSuccess={handleSuccess} 
                />
            </div>
        </div>
    );
};