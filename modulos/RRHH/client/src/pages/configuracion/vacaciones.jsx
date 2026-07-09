import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { getTableMetadata } from '../../data/fetchData';
import ModalInsert from '../Modales/modalInsert';
import ModalUpdate from '../Modales/modalUpdate';
import ModalDelete from '../Modales/modalDelete';
import CalendarFestivos from './CalendarFestivos';

export const VacacionesConfig = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    // ==========================================
    // ESTADOS: VACACIONES FUNCIONARIOS
    // Columnas reales DB: id_configuracion, rango_minimo, rango_maximo, dias_disfrute, pago
    // ==========================================
    const [columnsVac, setColumnsVac] = useState([]);
    const [idColumnVac, setIdColumnVac] = useState(null);
    const [dataVac, setDataVac] = useState([]);
    const [showVacModal, setShowVacModal] = useState(false);
    const [showVacUpModal, setShowVacUpModal] = useState(false);
    const [showVacDelModal, setShowVacDelModal] = useState(false);

    const columnAliasVac = {
        'id_configuracion': 'Código',
        'rango_minimo': 'Año de antigüedad (desde)',
        'rango_maximo': 'Año de antigüedad (hasta)',
        'dias_disfrute': 'Días de disfrute',
        'pago': 'Pago'
    };

    // ==========================================
    // ESTADOS: VACACIONES OBREROS
    // Columnas reales DB: id_configuracion, anio, dias_disfrute, pago
    // ==========================================
    const [columnsVacObr, setColumnsVacObr] = useState([]);
    const [idColumnVacObr, setIdColumnVacObr] = useState(null);
    const [dataVacObr, setDataVacObr] = useState([]);
    const [showVacObrModal, setShowVacObrModal] = useState(false);
    const [showVacObrUpModal, setShowVacObrUpModal] = useState(false);
    const [showVacObrDelModal, setShowVacObrDelModal] = useState(false);

    const columnAliasVacObr = {
        'id_configuracion': 'Código',
        'anio': 'Año de antigüedad',
        'dias_disfrute': 'Días de disfrute y pago'

    };

    // ==========================================
    // EFECTOS (CARGA DE DATOS)
    // ==========================================
    useEffect(() => {
        const loadVacData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('configuracion_vacaciones');
                setColumnsVac(columns.map(col => ({
                    originalName: col.name,
                    displayName: columnAliasVac[col.name] || col.name,
                    isPrimaryKey: col.name === primaryKey
                })));
                setIdColumnVac(primaryKey);
                const res = await fetch('/api/rrhh/configuracion-vacaciones', { credentials: 'include' });
                const data = await res.json();
                setDataVac(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error cargando Vacaciones de Funcionarios:', error);
                setDataVac([]);
            }
        };
        loadVacData();
    }, [refreshKey]);

    useEffect(() => {
        const loadVacObrData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('configuracion_vacaciones_obreros');
                setColumnsVacObr(columns.map(col => ({
                    originalName: col.name,
                    displayName: columnAliasVacObr[col.name] || col.name,
                    isPrimaryKey: col.name === primaryKey
                })));
                setIdColumnVacObr(primaryKey);
                const res = await fetch('/api/rrhh/configuracion-vacaciones-obreros', { credentials: 'include' });
                const data = await res.json();
                setDataVacObr(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error cargando Vacaciones de Obreros:', error);
                setDataVacObr([]);
            }
        };
        loadVacObrData();
    }, [refreshKey]);

    return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración /</span> Vacaciones</h4>

            {/* ========================================== */}
            {/* 1. TABLA VACACIONES FUNCIONARIOS */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-0">Vacaciones (Funcionarios)</h5>
                        <small className="text-muted">Configuración de días de vacaciones según años de antigüedad.</small>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => setShowVacModal(true)}>
                        <i className="bx bx-plus me-1"></i> Agregar Regla
                    </button>
                </div>
                <ModalInsert
                    show={showVacModal}
                    handleClose={() => setShowVacModal(false)}
                    columns={columnsVac}
                    tableName="configuracion_vacaciones"
                    onSuccess={handleSuccess}
                />
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsVac.filter(col => !col.isPrimaryKey).map((col, idx) => (
                                    <th key={idx}>{col.displayName}</th>
                                ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataVac.length === 0 ? (
                                <tr><td colSpan={columnsVac.length} className="text-center text-muted py-3">Sin registros aún</td></tr>
                            ) : dataVac.map((item, index) => (
                                <tr key={`vac-${index}`}>
                                    {columnsVac.filter(col => !col.isPrimaryKey).map((col) => (
                                        <td key={`${index}-${col.originalName}`}>{item[col.originalName] ?? 'N/A'}</td>
                                    ))}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm">
                                                <i className="bx bx-dots-vertical-rounded"></i>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => { setEditingItem(item); setShowVacUpModal(true); }}>
                                                    <i className="bx bx-edit-alt me-1"></i> Editar
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => { setDeleteItem(item[idColumnVac]); setShowVacDelModal(true); }}>
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
                    show={showVacUpModal}
                    handleClose={() => setShowVacUpModal(false)}
                    columns={columnsVac}
                    tableName='configuracion_vacaciones'
                    rowData={editingItem}
                    onSuccess={handleSuccess}
                    idColumn={idColumnVac}
                />
                <ModalDelete
                    show={showVacDelModal}
                    handleClose={() => setShowVacDelModal(false)}
                    tableName="configuracion_vacaciones"
                    rowId={deleteItem}
                    idColumn={idColumnVac}
                    onSuccess={handleSuccess}
                />
            </div>

            <hr className="my-5" />

            {/* ========================================== */}
            {/* 2. TABLA VACACIONES OBREROS */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-0">Vacaciones (Obreros)</h5>
                        <small className="text-muted">Configuración de días de vacaciones según años de antigüedad para obreros.</small>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => setShowVacObrModal(true)}>
                        <i className="bx bx-plus me-1"></i> Agregar Regla
                    </button>
                </div>
                <ModalInsert
                    show={showVacObrModal}
                    handleClose={() => setShowVacObrModal(false)}
                    columns={columnsVacObr}
                    tableName="configuracion_vacaciones_obreros"
                    onSuccess={handleSuccess}
                />
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsVacObr.filter(col => !col.isPrimaryKey).map((col, idx) => (
                                    <th key={idx}>{col.displayName}</th>
                                ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataVacObr.length === 0 ? (
                                <tr><td colSpan={columnsVacObr.length} className="text-center text-muted py-3">Sin registros aún</td></tr>
                            ) : dataVacObr.map((item, index) => (
                                <tr key={`vacObr-${index}`}>
                                    {columnsVacObr.filter(col => !col.isPrimaryKey).map((col) => (
                                        <td key={`${index}-${col.originalName}`}>{item[col.originalName] ?? 'N/A'}</td>
                                    ))}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm">
                                                <i className="bx bx-dots-vertical-rounded"></i>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => { setEditingItem(item); setShowVacObrUpModal(true); }}>
                                                    <i className="bx bx-edit-alt me-1"></i> Editar
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => { setDeleteItem(item[idColumnVacObr]); setShowVacObrDelModal(true); }}>
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
                    show={showVacObrUpModal}
                    handleClose={() => setShowVacObrUpModal(false)}
                    columns={columnsVacObr}
                    tableName='configuracion_vacaciones_obreros'
                    rowData={editingItem}
                    onSuccess={handleSuccess}
                    idColumn={idColumnVacObr}
                />
                <ModalDelete
                    show={showVacObrDelModal}
                    handleClose={() => setShowVacObrDelModal(false)}
                    tableName="configuracion_vacaciones_obreros"
                    rowId={deleteItem}
                    idColumn={idColumnVacObr}
                    onSuccess={handleSuccess}
                />
            </div>

            <hr className="my-5" />

            {/* ========================================== */}
            {/* 3. CALENDARIO DE DÍAS FESTIVOS */}
            {/* ========================================== */}
            <CalendarFestivos />
        </div>
    );
};

export default VacacionesConfig;
