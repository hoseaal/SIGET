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
    // ESTADOS PARA CARGOS ONAPRE (cargos_onapre)
    // ==========================================
    const [columnsOna, setColumnsOna] = useState([]);
    const [idColumnOna, setIdColumnOna] = useState(null);
    const [dataOna, setDataOna] = useState([]);
    const [showOnaModal, setShowOnaModal] = useState(false);
    const [showOnaUpModal, setShowOnaUpModal] = useState(false);
    const [showOnaDelModal, setShowOnaDelModal] = useState(false);

    const columnAliasOna = {
        'cargo_onapre_id': 'Código',
        'nombre': 'Cargo ONAPRE'
    };

    // ==========================================
    // ESTADOS PARA CARGOS CET (cargos_cet)
    // ==========================================
    const [columnsCet, setColumnsCet] = useState([]);
    const [idColumnCet, setIdColumnCet] = useState(null);
    const [dataCet, setDataCet] = useState([]);
    const [showCetModal, setShowCetModal] = useState(false);
    const [showCetUpModal, setShowCetUpModal] = useState(false);
    const [showCetDelModal, setShowCetDelModal] = useState(false);

    const columnAliasCet = {
        'cargo_cet_id': 'Código',
        'nombre': 'Cargo Interno (CET)'
    };

    // ==========================================
    // ESTADOS PARA CONDICIÓN LABORAL (condiciones_laborales)
    // ==========================================
    const [columnsCol, setColumnsCol] = useState([]);
    const [idColumnCol, setIdColumnCol] = useState(null);
    const [dataCol, setDataCol] = useState([]);
    const [showColModal, setShowColModal] = useState(false);
    const [showColUpModal, setShowColUpModal] = useState(false);
    const [showColDelModal, setShowColDelModal] = useState(false);

    const columnAliasCol = {
        'condicion_laboral_id': 'Código',
        'nombre': 'Condición Laboral'
    };

    // ==========================================
    // ESTADOS PARA PROFESIONES (profesiones)
    // ==========================================
    const [columnsPro, setColumnsPro] = useState([]);
    const [idColumnPro, setIdColumnPro] = useState(null);
    const [dataPro, setDataPro] = useState([]);
    const [showProModal, setShowProModal] = useState(false);
    const [showProUpModal, setShowProUpModal] = useState(false);
    const [showProDelModal, setShowProDelModal] = useState(false);

    const columnAliasPro = {
        'profesion_id': 'Código',
        'nombre': 'Profesión'
    };

    // ==========================================
    // EFECTOS (CARGA DE DATOS INDEPENDIENTES)
    // ==========================================

    useEffect(() => {
        const loadOnaData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('cargos_onapre');
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
                const { columns, primaryKey } = await getTableMetadata('cargos_cet');
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
                const { columns, primaryKey } = await getTableMetadata('condiciones_laborales');
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
                const { columns, primaryKey } = await getTableMetadata('profesiones');
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
                
                <ModalInsert show={showOnaModal} handleClose={() => setShowOnaModal(false)} columns={columnsOna} tableName="cargos_onapre" onSuccess={handleSuccess} />

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
                                                <Dropdown.Item href="#" onClick={() => { setDeleteItem(item.cargo_onapre_id); setShowOnaDelModal(true); }}>
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
                <ModalUpdate show={showOnaUpModal} handleClose={() => setShowOnaUpModal(false)} columns={columnsOna} tableName='cargos_onapre' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnOna} />
                <ModalDelete show={showOnaDelModal} handleClose={() => setShowOnaDelModal(false)} tableName="cargos_onapre" rowId={deleteItem} idColumn={idColumnOna} onSuccess={handleSuccess} />
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

                <ModalInsert show={showCetModal} handleClose={() => setShowCetModal(false)} columns={columnsCet} tableName="cargos_cet" onSuccess={handleSuccess} />

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
                                                <Dropdown.Item href="#" onClick={() => { setDeleteItem(item.cargo_cet_id); setShowCetDelModal(true); }}>
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

                <ModalUpdate show={showCetUpModal} handleClose={() => setShowCetUpModal(false)} columns={columnsCet} tableName='cargos_cet' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnCet} />
                <ModalDelete show={showCetDelModal} handleClose={() => setShowCetDelModal(false)} tableName="cargos_cet" rowId={deleteItem} idColumn={idColumnCet} onSuccess={handleSuccess} />
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

                <ModalInsert show={showColModal} handleClose={() => setShowColModal(false)} columns={columnsCol} tableName="condiciones_laborales" onSuccess={handleSuccess} />

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
                                                <Dropdown.Item href="#" onClick={() => { setDeleteItem(item.condicion_laboral_id); setShowColDelModal(true); }}>
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

                <ModalUpdate show={showColUpModal} handleClose={() => setShowColUpModal(false)} columns={columnsCol} tableName='condiciones_laborales' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnCol} />
                <ModalDelete show={showColDelModal} handleClose={() => setShowColDelModal(false)} tableName="condiciones_laborales" rowId={deleteItem} idColumn={idColumnCol} onSuccess={handleSuccess} />
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

                <ModalInsert show={showProModal} handleClose={() => setShowProModal(false)} columns={columnsPro} tableName="profesiones" onSuccess={handleSuccess} />

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
                                                <Dropdown.Item href="#" onClick={() => { setDeleteItem(item.profesion_id); setShowProDelModal(true); }}>
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

                <ModalUpdate show={showProUpModal} handleClose={() => setShowProUpModal(false)} columns={columnsPro} tableName='profesiones' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnPro} />
                <ModalDelete show={showProDelModal} handleClose={() => setShowProDelModal(false)} tableName="profesiones" rowId={deleteItem} idColumn={idColumnPro} onSuccess={handleSuccess} />
            </div>

        </div>
    );
};