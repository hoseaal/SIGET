import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { getTableMetadata } from '../../data/fetchData';
import ModalInsert from '../Modales/modalInsert';
import ModalUpdate from '../Modales/modalUpdate';
import ModalDelete from '../Modales/modalDelete';

export const ClasificacionyCargos = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1); // Fuerza recarga de todos los useEffect
    };

    // ==========================================
    // ESTADOS PARA CARGOS ONAPRE (tmaona)
    // ==========================================
    const [columnsOna, setColumnsOna] = useState([]);
    const [idColumnOna, setIdColumnOna] = useState(null);
    const [dataOna, setDataOna] = useState([]);
    const [showOnaModal, setShowOnaModal] = useState(false);
    const [showOnaUpModal, setShowOnaUpModal] = useState(false);
    const [showOnaDelModal, setShowOnaDelModal] = useState(false);

    const columnAliasOna = {
        'ona_ide': 'Código',
        'ona_nom': 'Cargo ONAPRE'
    };

    // ==========================================
    // ESTADOS PARA CARGOS CET (tmacet)
    // ==========================================
    const [columnsCet, setColumnsCet] = useState([]);
    const [idColumnCet, setIdColumnCet] = useState(null);
    const [dataCet, setDataCet] = useState([]);
    const [showCetModal, setShowCetModal] = useState(false);
    const [showCetUpModal, setShowCetUpModal] = useState(false);
    const [showCetDelModal, setShowCetDelModal] = useState(false);

    const columnAliasCet = {
        'cet_ide': 'Código',
        'cet_nom': 'Cargo Interno (CET)'
    };

    // ==========================================
    // ESTADOS PARA CONDICIÓN LABORAL (tmacol)
    // ==========================================
    const [columnsCol, setColumnsCol] = useState([]);
    const [idColumnCol, setIdColumnCol] = useState(null);
    const [dataCol, setDataCol] = useState([]);
    const [showColModal, setShowColModal] = useState(false);
    const [showColUpModal, setShowColUpModal] = useState(false);
    const [showColDelModal, setShowColDelModal] = useState(false);

    const columnAliasCol = {
        'col_ide': 'Código',
        'col_nom': 'Condición Laboral'
    };

    // ==========================================
    // ESTADOS PARA PROFESIONES (tmapro)
    // ==========================================
    const [columnsPro, setColumnsPro] = useState([]);
    const [idColumnPro, setIdColumnPro] = useState(null);
    const [dataPro, setDataPro] = useState([]);
    const [showProModal, setShowProModal] = useState(false);
    const [showProUpModal, setShowProUpModal] = useState(false);
    const [showProDelModal, setShowProDelModal] = useState(false);

    const columnAliasPro = {
        'pro_ide': 'Código',
        'pro_nom': 'Profesión'
    };

    // ==========================================
    // EFECTOS (CARGA DE DATOS INDEPENDIENTES)
    // ==========================================

    useEffect(() => {
        const loadOnaData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('tmaona');
                setColumnsOna(columns.map(col => ({
                    originalName: col.name,
                    displayName: columnAliasOna[col.name] || col.name,
                    isPrimaryKey: col.name === primaryKey
                })));
                setIdColumnOna(primaryKey);

                const res = await fetch('/api/cargos-onapre', { credentials: 'include' });
                setDataOna(await res.json());
            } catch (error) { console.error('Error cargando ONAPRE:', error); }
        };
        loadOnaData();
    }, [refreshKey]);

    useEffect(() => {
        const loadCetData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('tmacet');
                setColumnsCet(columns.map(col => ({
                    originalName: col.name,
                    displayName: columnAliasCet[col.name] || col.name,
                    isPrimaryKey: col.name === primaryKey
                })));
                setIdColumnCet(primaryKey);

                const res = await fetch('/api/cargos-cet', { credentials: 'include' });
                setDataCet(await res.json());
            } catch (error) { console.error('Error cargando CET:', error); }
        };
        loadCetData();
    }, [refreshKey]);

    useEffect(() => {
        const loadColData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('tmacol');
                setColumnsCol(columns.map(col => ({
                    originalName: col.name,
                    displayName: columnAliasCol[col.name] || col.name,
                    isPrimaryKey: col.name === primaryKey
                })));
                setIdColumnCol(primaryKey);

                const res = await fetch('/api/condiciones-laborales', { credentials: 'include' });
                setDataCol(await res.json());
            } catch (error) { console.error('Error cargando Condición Laboral:', error); }
        };
        loadColData();
    }, [refreshKey]);

    useEffect(() => {
        const loadProData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('tmapro');
                setColumnsPro(columns.map(col => ({
                    originalName: col.name,
                    displayName: columnAliasPro[col.name] || col.name,
                    isPrimaryKey: col.name === primaryKey
                })));
                setIdColumnPro(primaryKey);

                const res = await fetch('/api/profesiones', { credentials: 'include' });
                setDataPro(await res.json());
            } catch (error) { console.error('Error cargando Profesiones:', error); }
        };
        loadProData();
    }, [refreshKey]);


    return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración RRHH /</span> Clasificación y Cargos</h4>
            
            {/* ========================================== */}
            {/* 1. CARGOS ONAPRE */}
            {/* ========================================== */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Cargos ONAPRE</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowOnaModal(true)}>
                        Agregar Cargo ONAPRE
                    </button>
                </div>
                
                <ModalInsert show={showOnaModal} handleClose={() => setShowOnaModal(false)} columns={columnsOna} tableName="tmaona" onSuccess={handleSuccess} />

                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsOna.map((col, index) => <th key={index}>{col.displayName}</th>)}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {dataOna.map((item, index) => (
                                <tr key={`ona-${index}`}>
                                    {columnsOna.map((col) => (
                                        <td key={`${index}-${col.originalName}`}>{item[col.originalName.toLowerCase()] ?? 'N/A'}</td>
                                    ))}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm">
                                                <i className="bx bx-dots-vertical-rounded"></i>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item href="#" onClick={() => { setEditingItem(item); setShowOnaUpModal(true); }}>
                                                    <i className="bx bx-edit-alt me-1"></i> Editar
                                                </Dropdown.Item>
                                                <Dropdown.Item href="#" onClick={() => { setDeleteItem(item.ona_ide); setShowOnaDelModal(true); }}>
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
                <ModalUpdate show={showOnaUpModal} handleClose={() => setShowOnaUpModal(false)} columns={columnsOna} tableName='tmaona' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnOna} />
                <ModalDelete show={showOnaDelModal} handleClose={() => setShowOnaDelModal(false)} tableName="tmaona" rowId={deleteItem} idColumn={idColumnOna} onSuccess={handleSuccess} />
            </div>

            <hr className="my-5" />

            {/* ========================================== */}
            {/* 2. CARGOS CET */}
            {/* ========================================== */}
            <div className="card">
               <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Cargos Internos (CET)</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowCetModal(true)}>
                        Agregar Cargo CET
                    </button>
                </div>

                <ModalInsert show={showCetModal} handleClose={() => setShowCetModal(false)} columns={columnsCet} tableName="tmacet" onSuccess={handleSuccess} />

                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsCet.map((col, index) => <th key={index}>{col.displayName}</th>)}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {dataCet.map((item, index) => (
                                <tr key={`cet-${index}`}>
                                    {columnsCet.map((col) => (
                                        <td key={`col-${index}-${col.originalName}`}>{item[col.originalName.toLowerCase()] ?? 'N/A'}</td>
                                    ))}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm">
                                                <i className="bx bx-dots-vertical-rounded"></i>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item href="#" onClick={() => { setEditingItem(item); setShowCetUpModal(true); }}>
                                                    <i className="bx bx-edit-alt me-1"></i> Editar
                                                </Dropdown.Item>
                                                <Dropdown.Item href="#" onClick={() => { setDeleteItem(item.cet_ide); setShowCetDelModal(true); }}>
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

                <ModalUpdate show={showCetUpModal} handleClose={() => setShowCetUpModal(false)} columns={columnsCet} tableName='tmacet' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnCet} />
                <ModalDelete show={showCetDelModal} handleClose={() => setShowCetDelModal(false)} tableName="tmacet" rowId={deleteItem} idColumn={idColumnCet} onSuccess={handleSuccess} />
            </div>

            <hr className="my-5" />

            {/* ========================================== */}
            {/* 3. CONDICIÓN LABORAL */}
            {/* ========================================== */}
            <div className="card">
               <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Condición Laboral</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowColModal(true)}>
                        Agregar Condición
                    </button>
                </div>

                <ModalInsert show={showColModal} handleClose={() => setShowColModal(false)} columns={columnsCol} tableName="tmacol" onSuccess={handleSuccess} />

                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsCol.map((col, index) => <th key={index}>{col.displayName}</th>)}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {dataCol.map((item, index) => (
                                <tr key={`col-${index}`}>
                                    {columnsCol.map((col) => (
                                        <td key={`col-${index}-${col.originalName}`}>{item[col.originalName.toLowerCase()] ?? 'N/A'}</td>
                                    ))}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm">
                                                <i className="bx bx-dots-vertical-rounded"></i>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item href="#" onClick={() => { setEditingItem(item); setShowColUpModal(true); }}>
                                                    <i className="bx bx-edit-alt me-1"></i> Editar
                                                </Dropdown.Item>
                                                <Dropdown.Item href="#" onClick={() => { setDeleteItem(item.col_ide); setShowColDelModal(true); }}>
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

                <ModalUpdate show={showColUpModal} handleClose={() => setShowColUpModal(false)} columns={columnsCol} tableName='tmacol' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnCol} />
                <ModalDelete show={showColDelModal} handleClose={() => setShowColDelModal(false)} tableName="tmacol" rowId={deleteItem} idColumn={idColumnCol} onSuccess={handleSuccess} />
            </div>

            <hr className="my-5" />

            {/* ========================================== */}
            {/* 4. PROFESIONES */}
            {/* ========================================== */}
            <div className="card">
               <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Profesiones</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowProModal(true)}>
                        Agregar Profesión
                    </button>
                </div>

                <ModalInsert show={showProModal} handleClose={() => setShowProModal(false)} columns={columnsPro} tableName="tmapro" onSuccess={handleSuccess} />

                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsPro.map((col, index) => <th key={index}>{col.displayName}</th>)}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {dataPro.map((item, index) => (
                                <tr key={`pro-${index}`}>
                                    {columnsPro.map((col) => (
                                        <td key={`col-${index}-${col.originalName}`}>{item[col.originalName.toLowerCase()] ?? 'N/A'}</td>
                                    ))}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm">
                                                <i className="bx bx-dots-vertical-rounded"></i>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item href="#" onClick={() => { setEditingItem(item); setShowProUpModal(true); }}>
                                                    <i className="bx bx-edit-alt me-1"></i> Editar
                                                </Dropdown.Item>
                                                <Dropdown.Item href="#" onClick={() => { setDeleteItem(item.pro_ide); setShowProDelModal(true); }}>
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

                <ModalUpdate show={showProUpModal} handleClose={() => setShowProUpModal(false)} columns={columnsPro} tableName='tmapro' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnPro} />
                <ModalDelete show={showProDelModal} handleClose={() => setShowProDelModal(false)} tableName="tmapro" rowId={deleteItem} idColumn={idColumnPro} onSuccess={handleSuccess} />
            </div>

        </div>
    );
};