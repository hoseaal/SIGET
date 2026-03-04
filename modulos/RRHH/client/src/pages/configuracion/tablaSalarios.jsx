import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { getTableMetadata } from '../../data/fetchData';
import ModalInsert from '../Modales/modalInsert';
import ModalUpdate from '../Modales/modalUpdate';
import ModalDelete from '../Modales/modalDelete';

export const TablaSalarios = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1); // Fuerza recarga de todos los useEffect
    };

    // ==========================================
    // ESTADOS: MATRIZ ONAPRE Y NIVELES (tesniv)
    // ==========================================
    const [dataOna, setDataOna] = useState([]);
    const [dataNiv, setDataNiv] = useState([]);
    const [columnsNiv, setColumnsNiv] = useState([]);
    const [idColumnNiv, setIdColumnNiv] = useState(null);
    // Cambiamos Insert por Update para los niveles
    const [showNivUpModal, setShowNivUpModal] = useState(false); 

    const columnAliasNiv = {
        'niv_ide': 'Código',
        'niv_nom': 'Nivel',
        'niv_sal': 'Salario (Bs)',
        'ona_ide': 'Cargo ONAPRE'
    };

    // ==========================================
    // ESTADOS: PRIMAS (tmapri)
    // ==========================================
    const [columnsPri, setColumnsPri] = useState([]);
    const [idColumnPri, setIdColumnPri] = useState(null);
    const [dataPri, setDataPri] = useState([]);
    const [showPriModal, setShowPriModal] = useState(false);
    const [showPriUpModal, setShowPriUpModal] = useState(false);
    const [showPriDelModal, setShowPriDelModal] = useState(false);

    const columnAliasPri = {
        'pri_ide': 'Código',
        'pri_nom': 'Nombre de la Prima',
        'pri_por': 'Porcentaje (%)',
        'pri_val': 'Valor Fijo (Bs)'
    };

    // ==========================================
    // ESTADOS: PROFESIONALIZACIÓN (tmaprf)
    // ==========================================
    const [columnsPrf, setColumnsPrf] = useState([]);
    const [idColumnPrf, setIdColumnPrf] = useState(null);
    const [dataPrf, setDataPrf] = useState([]);
    const [showPrfModal, setShowPrfModal] = useState(false);
    const [showPrfUpModal, setShowPrfUpModal] = useState(false);
    const [showPrfDelModal, setShowPrfDelModal] = useState(false);

    const columnAliasPrf = {
        'prf_ide': 'Código',
        'prf_nom': 'Grado Académico',
        'prf_act': 'Porcentaje (%)',
        'prf_ant': 'Porcentaje Antiguo (%)'
    };

    // ==========================================
    // ESTADOS: ANTIGÜEDAD (tmaant)
    // ==========================================
    const [columnsAnt, setColumnsAnt] = useState([]);
    const [idColumnAnt, setIdColumnAnt] = useState(null);
    const [dataAnt, setDataAnt] = useState([]);
    const [showAntModal, setShowAntModal] = useState(false);
    const [showAntUpModal, setShowAntUpModal] = useState(false);
    const [showAntDelModal, setShowAntDelModal] = useState(false);

    const columnAliasAnt = {
        'ant_ide': 'Código',
        'ant_ani': 'Años de Servicio',
        'ant_act': 'Porcentaje Actual (%)',
        'ant_ant': 'Porcentaje Anterior (%)'
    };

    // ==========================================
    // ESTADOS: DEDUCCIONES (tmade)
    // ==========================================
    const [columnsDe, setColumnsDe] = useState([]);
    const [idColumnDe, setIdColumnDe] = useState(null);
    const [dataDe, setDataDe] = useState([]);
    const [showDeModal, setShowDeModal] = useState(false);
    const [showDeUpModal, setShowDeUpModal] = useState(false);
    const [showDeDelModal, setShowDeDelModal] = useState(false);

    const columnAliasDe = {
        'ded_ide': 'Código',
        'ded_nom': 'Deducción (Ej: IVSS)',
        'ded_por': 'Porcentaje (%)'
    };

    // ==========================================
    // EFECTOS (CARGA DE DATOS)
    // ==========================================

    // 1. Cargar ONAPRE y Niveles para la Matriz
    useEffect(() => {
        const loadMatrizData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('tesniv');
                setColumnsNiv(columns.map(col => ({
                    originalName: col.name,
                    displayName: columnAliasNiv[col.name] || col.name,
                    isPrimaryKey: col.name === primaryKey
                })));
                setIdColumnNiv(primaryKey);

                const [resOna, resNiv] = await Promise.all([
                    fetch('/api/cargos-onapre', { credentials: 'include' }),
                    fetch('/api/niveles-salariales', { credentials: 'include' })
                ]);
                setDataOna(await resOna.json());
                setDataNiv(await resNiv.json());
            } catch (error) { console.error('Error cargando Matriz ONAPRE:', error); }
        };
        loadMatrizData();
    }, [refreshKey]);

    // 2. Cargar Primas
    useEffect(() => {
        const loadPriData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('tmapri');
                setColumnsPri(columns.map(col => ({ originalName: col.name, displayName: columnAliasPri[col.name] || col.name, isPrimaryKey: col.name === primaryKey })));
                setIdColumnPri(primaryKey);
                const res = await fetch('/api/primas', { credentials: 'include' });
                setDataPri(await res.json());
            } catch (error) { console.error('Error cargando Primas:', error); }
        };
        loadPriData();
    }, [refreshKey]);

    // 3. Cargar Profesionalización
    useEffect(() => {
        const loadPrfData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('tmaprf');
                setColumnsPrf(columns.map(col => ({ originalName: col.name, displayName: columnAliasPrf[col.name] || col.name, isPrimaryKey: col.name === primaryKey })));
                setIdColumnPrf(primaryKey);
                const res = await fetch('/api/primas-profesionalizacion', { credentials: 'include' });
                setDataPrf(await res.json());
            } catch (error) { console.error('Error cargando Profesionalización:', error); }
        };
        loadPrfData();
    }, [refreshKey]);

    // 4. Cargar Antigüedad
    useEffect(() => {
        const loadAntData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('tmaant');
                setColumnsAnt(columns.map(col => ({ originalName: col.name, displayName: columnAliasAnt[col.name] || col.name, isPrimaryKey: col.name === primaryKey })));
                setIdColumnAnt(primaryKey);
                const res = await fetch('/api/antiguedad', { credentials: 'include' });
                setDataAnt(await res.json());
            } catch (error) { console.error('Error cargando Antigüedad:', error); }
        };
        loadAntData();
    }, [refreshKey]);

    // 5. Cargar Deducciones
    useEffect(() => {
        const loadDeData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('tmade');
                setColumnsDe(columns.map(col => ({ originalName: col.name, displayName: columnAliasDe[col.name] || col.name, isPrimaryKey: col.name === primaryKey })));
                setIdColumnDe(primaryKey);
                const res = await fetch('/api/deducciones', { credentials: 'include' });
                setDataDe(await res.json());
            } catch (error) { console.error('Error cargando Deducciones:', error); }
        };
        loadDeData();
    }, [refreshKey]);

    // ==========================================
    // LÓGICA DE PROCESAMIENTO MATRIZ DINÁMICA
    // ==========================================
    
    // Extraer valores únicos de niv_nom dinámicamente de la base de datos
    const ordenRomanos = { 'I':1, 'II':2, 'III':3, 'IV':4, 'V':5, 'VI':6, 'VII':7, 'VIII':8, 'IX':9, 'X':10 };
    const nivelesDinamicos = [...new Set(dataNiv.map(n => n.niv_nom))]
        .sort((a, b) => (ordenRomanos[a] || 99) - (ordenRomanos[b] || 99));

    // Si la BD está vacía, mostrar los básicos por defecto para que la tabla no se rompa
    const niveles = nivelesDinamicos.length > 0 ? nivelesDinamicos : ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

    // Agrupamos los niveles por ona_ide
    const matrizNiveles = dataNiv.reduce((acc, curr) => {
        if (!acc[curr.ona_ide]) acc[curr.ona_ide] = {};
        acc[curr.ona_ide][curr.niv_nom] = curr;
        return acc;
    }, {});

    // Filtramos las columnas del modal de edición para que SOLO pida el salario
    const columnasNivelEditables = columnsNiv.filter(col => col.originalName === 'niv_sal');

    return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración Salarial /</span> Tablas Salariales</h4>

            {/* ========================================== */}
            {/* 1. MATRIZ: TABULADOR ONAPRE */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">NIVELES O RANGOS DE SUELDOS MENSUALES</h5>
                    <small className="text-muted">Haga clic sobre un monto para editar el salario del nivel correspondiente.</small>
                </div>

                <div className="table-responsive text-nowrap p-3">
                    <table className="table table-bordered table-hover">
                        <thead className="table-light text-center">
                            <tr>
                                <th rowSpan="2" className="align-middle bg-primary text-white">GRUPOS O CLASES DE CARGOS</th>
                                <th colSpan={niveles.length} className="bg-secondary text-white">NIVELES O RANGOS DE SUELDOS MENSUALES</th>
                            </tr>
                            <tr>
                                {niveles.map(lvl => <th key={lvl} className="bg-light">{lvl}</th>)}
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {dataOna.map((ona) => {
                                const nivelesCargo = matrizNiveles[ona.ona_ide] || {};
                                return (
                                    <tr key={ona.ona_ide}>
                                        <td className="fw-bold text-center align-middle">{ona.ona_nom}</td>
                                        {niveles.map(lvl => {
                                            const nivelData = nivelesCargo[lvl];
                                            return (
                                                <td key={lvl} className="text-center align-middle">
                                                    {nivelData ? (
                                                        <button 
                                                            className="btn btn-sm btn-link text-decoration-none text-dark fw-semibold"
                                                            title={`Editar Nivel ${lvl} (${ona.ona_nom})`}
                                                            onClick={() => {
                                                                setEditingItem(nivelData);
                                                                setShowNivUpModal(true);
                                                            }}
                                                        >
                                                            {Number(nivelData.niv_sal).toFixed(2)}
                                                        </button>
                                                    ) : (
                                                        <span className="text-muted">---</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Modal de Update Específico para el Nivel (Solo muestra el Salario) */}
                <ModalUpdate 
                    show={showNivUpModal} 
                    handleClose={() => setShowNivUpModal(false)} 
                    columns={columnasNivelEditables} // ¡Magia! Solo le pasamos el salario
                    tableName='tesniv' 
                    rowData={editingItem} 
                    onSuccess={handleSuccess} 
                    idColumn={idColumnNiv} 
                />
            </div>

            <hr className="my-5" />

            {/* ========================================== */}
            {/* 2. PRIMAS (tmapri) */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Primas y Beneficios</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowPriModal(true)}>Agregar Prima</button>
                </div>
                <ModalInsert show={showPriModal} handleClose={() => setShowPriModal(false)} columns={columnsPri} tableName="tmapri" onSuccess={handleSuccess} />
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsPri.map((col, idx) => <th key={idx}>{col.displayName}</th>)}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataPri.map((item, index) => (
                                <tr key={`pri-${index}`}>
                                    {columnsPri.map((col) => <td key={`${index}-${col.originalName}`}>{item[col.originalName.toLowerCase()] ?? 'N/A'}</td>)}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm"><i className="bx bx-dots-vertical-rounded"></i></Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => { setEditingItem(item); setShowPriUpModal(true); }}><i className="bx bx-edit-alt me-1"></i> Editar</Dropdown.Item>
                                                <Dropdown.Item onClick={() => { setDeleteItem(item.pri_ide); setShowPriDelModal(true); }}><i className="bx bx-trash me-1"></i> Eliminar</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ModalUpdate show={showPriUpModal} handleClose={() => setShowPriUpModal(false)} columns={columnsPri} tableName='tmapri' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnPri} />
                <ModalDelete show={showPriDelModal} handleClose={() => setShowPriDelModal(false)} tableName="tmapri" rowId={deleteItem} idColumn={idColumnPri} onSuccess={handleSuccess} />
            </div>

            {/* ========================================== */}
            {/* 3. PROFESIONALIZACIÓN (tmaprf) */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Escala por Profesionalización</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowPrfModal(true)}>Agregar Grado</button>
                </div>
                <ModalInsert show={showPrfModal} handleClose={() => setShowPrfModal(false)} columns={columnsPrf} tableName="tmaprf" onSuccess={handleSuccess} />
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsPrf.map((col, idx) => <th key={idx}>{col.displayName}</th>)}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataPrf.map((item, index) => (
                                <tr key={`prf-${index}`}>
                                    {columnsPrf.map((col) => <td key={`${index}-${col.originalName}`}>{item[col.originalName.toLowerCase()] ?? 'N/A'}</td>)}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm"><i className="bx bx-dots-vertical-rounded"></i></Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => { setEditingItem(item); setShowPrfUpModal(true); }}><i className="bx bx-edit-alt me-1"></i> Editar</Dropdown.Item>
                                                <Dropdown.Item onClick={() => { setDeleteItem(item.prf_ide); setShowPrfDelModal(true); }}><i className="bx bx-trash me-1"></i> Eliminar</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ModalUpdate show={showPrfUpModal} handleClose={() => setShowPrfUpModal(false)} columns={columnsPrf} tableName='tmaprf' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnPrf} />
                <ModalDelete show={showPrfDelModal} handleClose={() => setShowPrfDelModal(false)} tableName="tmaprf" rowId={deleteItem} idColumn={idColumnPrf} onSuccess={handleSuccess} />
            </div>

            {/* ========================================== */}
            {/* 4. ANTIGÜEDAD (tmaant) */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Porcentajes de Antigüedad</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowAntModal(true)}>Agregar Escala</button>
                </div>
                <ModalInsert show={showAntModal} handleClose={() => setShowAntModal(false)} columns={columnsAnt} tableName="tmaant" onSuccess={handleSuccess} />
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsAnt.map((col, idx) => <th key={idx}>{col.displayName}</th>)}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataAnt.map((item, index) => (
                                <tr key={`ant-${index}`}>
                                    {columnsAnt.map((col) => <td key={`${index}-${col.originalName}`}>{item[col.originalName.toLowerCase()] ?? 'N/A'}</td>)}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm"><i className="bx bx-dots-vertical-rounded"></i></Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => { setEditingItem(item); setShowAntUpModal(true); }}><i className="bx bx-edit-alt me-1"></i> Editar</Dropdown.Item>
                                                <Dropdown.Item onClick={() => { setDeleteItem(item.ant_ide); setShowAntDelModal(true); }}><i className="bx bx-trash me-1"></i> Eliminar</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ModalUpdate show={showAntUpModal} handleClose={() => setShowAntUpModal(false)} columns={columnsAnt} tableName='tmaant' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnAnt} />
                <ModalDelete show={showAntDelModal} handleClose={() => setShowAntDelModal(false)} tableName="tmaant" rowId={deleteItem} idColumn={idColumnAnt} onSuccess={handleSuccess} />
            </div>

            {/* ========================================== */}
            {/* 5. DEDUCCIONES (tmade) */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Deducciones de Ley</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowDeModal(true)}>Agregar Deducción</button>
                </div>
                <ModalInsert show={showDeModal} handleClose={() => setShowDeModal(false)} columns={columnsDe} tableName="tmade" onSuccess={handleSuccess} />
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsDe.map((col, idx) => <th key={idx}>{col.displayName}</th>)}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataDe.map((item, index) => (
                                <tr key={`de-${index}`}>
                                    {columnsDe.map((col) => <td key={`${index}-${col.originalName}`}>{item[col.originalName.toLowerCase()] ?? 'N/A'}</td>)}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm"><i className="bx bx-dots-vertical-rounded"></i></Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => { setEditingItem(item); setShowDeUpModal(true); }}><i className="bx bx-edit-alt me-1"></i> Editar</Dropdown.Item>
                                                <Dropdown.Item onClick={() => { setDeleteItem(item.de_ide); setShowDeDelModal(true); }}><i className="bx bx-trash me-1"></i> Eliminar</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ModalUpdate show={showDeUpModal} handleClose={() => setShowDeUpModal(false)} columns={columnsDe} tableName='tmade' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnDe} />
                <ModalDelete show={showDeDelModal} handleClose={() => setShowDeDelModal(false)} tableName="tmade" rowId={deleteItem} idColumn={idColumnDe} onSuccess={handleSuccess} />
            </div>

        </div>
    );
};