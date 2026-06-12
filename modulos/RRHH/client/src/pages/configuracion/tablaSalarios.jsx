import React, { useState, useEffect } from 'react';
import { Dropdown, Form, Modal, Button } from 'react-bootstrap';
import { getTableMetadata } from '../../data/fetchData';
import ModalInsert from '../Modales/modalInsert';
import ModalUpdate from '../Modales/modalUpdate';
import ModalDelete from '../Modales/modalDelete';
import { ModalInsertNivelSalarial } from '../Modales/modalInsertNivelSalarial';
import { ModalInsertJerarquia } from '../Modales/ModalInsertJerarquia';

export const TablaSalarios = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    // ==========================================
    // ESTADOS: MATRIZ ONAPRE Y NIVELES (niveles_salariales)
    // ==========================================
    const [dataOna, setDataOna] = useState([]);
    const [dataNiv, setDataNiv] = useState([]);
    const [columnsNiv, setColumnsNiv] = useState([]);
    const [idColumnNiv, setIdColumnNiv] = useState(null);

    // Estados para los modales de Nivel Salarial
    const [showNivModal, setShowNivModal] = useState(false); // Para insertar (Nuevo Custom)
    const [showNivUpModal, setShowNivUpModal] = useState(false); // Para actualizar

    const columnAliasNiv = {
        'nivel_salarial_id': 'Código',
        'nombre': 'Nivel',
        'salario_base': 'Salario (Bs)',
        'cargo_onapre_id': 'Cargo ONAPRE'
    };

    // ==========================================
    // ESTADOS: MATRIZ ONAPRE Y NIVELES ANTIGUOS(niveles_salariales_antiguos)
    // ==========================================
    const [dataNivAnt, setDataNivAnt] = useState([]);
    const [columnsNivAnt, setColumnsNivAnt] = useState([]);
    const [idColumnNivAnt, setIdColumnNivAnt] = useState(null);

    // Estados para los modales de Nivel Salarial
    const [showNivAntModal, setShowNivAntModal] = useState(false); // Para insertar (Nuevo Custom)
    const [showNivAntUpModal, setShowNivAntUpModal] = useState(false); // Para actualizar

    const columnAliasNivAnt = {
        'nivel_salarial_antiguo_id': 'Código',
        'nombre': 'Nivel',
        'salario_antiguo': 'Salario (Bs)',
        'cargo_onapre_id': 'Cargo ONAPRE'
    };

    // ==========================================
    // ESTADOS: PRIMAS (primas_generales)
    // ==========================================
    const [columnsPri, setColumnsPri] = useState([]);
    const [idColumnPri, setIdColumnPri] = useState(null);
    const [dataPri, setDataPri] = useState([]);
    const [showPriModal, setShowPriModal] = useState(false);
    const [showPriUpModal, setShowPriUpModal] = useState(false);
    const [showPriDelModal, setShowPriDelModal] = useState(false);

    const columnAliasPri = {
        'prima_id': 'Código',
        'nombre': 'Concepto',
        'asignacion': 'Asignación',
        'pri_val': 'Valor Fijo (Bs)'
    };

    // ==========================================
    // ESTADOS: PROFESIONALIZACIÓN (primas_profesionalizacion)
    // ==========================================
    const [columnsPrf, setColumnsPrf] = useState([]);
    const [idColumnPrf, setIdColumnPrf] = useState(null);
    const [dataPrf, setDataPrf] = useState([]);
    const [dataJer, setDataJer] = useState([]);
    const [showPrfModal, setShowPrfModal] = useState(false);
    const [showJerModal, setShowJerModal] = useState(false);
    const [showPrfUpModal, setShowPrfUpModal] = useState(false);
    const [showPrfDelModal, setShowPrfDelModal] = useState(false);

    const columnAliasPrf = {
        'prima_profesional_id': 'Código',
        'descripcion': 'Grado Académico',
        'porcentaje_actual': 'Porcentaje (%)',
        'porcentaje_anterior': 'Porcentaje Antiguo (%)'
    };

    // ==========================================
    // ESTADOS: ANTIGÜEDAD (configuracion_antiguedad)
    // ==========================================
    const [columnsAnt, setColumnsAnt] = useState([]);
    const [idColumnAnt, setIdColumnAnt] = useState(null);
    const [dataAnt, setDataAnt] = useState([]);
    const [showAntModal, setShowAntModal] = useState(false);
    const [showAntUpModal, setShowAntUpModal] = useState(false);
    const [showAntDelModal, setShowAntDelModal] = useState(false);

    const columnAliasAnt = {
        'antiguedad_id': 'Código',
        'anios_cumplidos': 'Años de Servicio',
        'porcentaje_actual': 'Porcentaje Actual (%)',
        'porcentaje_anterior': 'Porcentaje Anterior (%)'
    };

    // ==========================================
    // ESTADOS: DEDUCCIONES (deducciones)
    // ==========================================
    const [columnsDe, setColumnsDe] = useState([]);
    const [idColumnDe, setIdColumnDe] = useState(null);
    const [dataDe, setDataDe] = useState([]);
    const [showDeModal, setShowDeModal] = useState(false);
    const [showDeUpModal, setShowDeUpModal] = useState(false);
    const [showDeDelModal, setShowDeDelModal] = useState(false);

    const columnAliasDe = {
        'deduccion_id': 'Código',
        'nombre': 'Deducción (Ej: IVSS)',
        'porcentaje': 'Porcentaje (%)'
    };

    // ==========================================
    // ESTADOS: PENSIONADOS (sueldos_pensionados)
    // ==========================================
    const [columnsPen, setColumnsPen] = useState([]);
    const [idColumnPen, setIdColumnPen] = useState(null);
    const [dataPen, setDataPen] = useState([]);
    const [showPenModal, setShowPenModal] = useState(false);
    const [showPenUpModal, setShowPenUpModal] = useState(false);
    const [showPenDelModal, setShowPenDelModal] = useState(false);

    const columnAliasPen = {
        'sueldo_pensionado_id': 'Código',
        'salario_base': 'Salario Base (Bs)'
    };

    // ==========================================
    // ESTADOS: SOBREVIVIENTES (sueldo_sobreviente)
    // ==========================================
    const [columnsSob, setColumnsSob] = useState([]);
    const [idColumnSob, setIdColumnSob] = useState(null);
    const [dataSob, setDataSob] = useState([]);
    const [showSobModal, setShowSobModal] = useState(false);
    const [showSobUpModal, setShowSobUpModal] = useState(false);
    const [showSobDelModal, setShowSobDelModal] = useState(false);

    const columnAliasSob = {
        'id_sueldo': 'Código',
        'sueldo_base': 'Salario Base (Bs)'
    };

    // ==========================================
    // EFECTOS (CARGA DE DATOS)
    // ==========================================

    useEffect(() => {
        const loadMatrizData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('niveles_salariales');
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

    useEffect(() => {
        const loadMatrizAntData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('niveles_salariales_antiguos');
                setColumnsNivAnt(columns.map(col => ({
                    originalName: col.name,
                    displayName: columnAliasNivAnt[col.name] || col.name,
                    isPrimaryKey: col.name === primaryKey
                })));
                setIdColumnNivAnt(primaryKey);

                const resNivAnt = await fetch('/api/niveles-salariales-antiguos', { credentials: 'include' });
                setDataNivAnt(await resNivAnt.json());
            } catch (error) { console.error('Error cargando Matriz ONAPRE:', error); }
        };
        loadMatrizAntData();
    }, [refreshKey]);

    useEffect(() => {
        const loadPriData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('primas_generales');
                setColumnsPri(columns.map(col => ({ originalName: col.name, displayName: columnAliasPri[col.name] || col.name, isPrimaryKey: col.name === primaryKey })));
                setIdColumnPri(primaryKey);
                const res = await fetch('/api/primas', { credentials: 'include' });
                setDataPri(await res.json());
            } catch (error) { console.error('Error cargando Primas:', error); }
        };
        loadPriData();
    }, [refreshKey]);

    useEffect(() => {
        const loadPrfData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('primas_profesionalizacion');
                setColumnsPrf(columns.map(col => ({ originalName: col.name, displayName: columnAliasPrf[col.name] || col.name, isPrimaryKey: col.name === primaryKey })));
                setIdColumnPrf(primaryKey);
                const res = await fetch('/api/primas-profesionalizacion', { credentials: 'include' });
                setDataPrf(await res.json());
            } catch (error) { console.error('Error cargando Profesionalización:', error); }
        };
        loadPrfData();
    }, [refreshKey]);

    useEffect(() => {
        const loadJerData = async () => {
            try {
                const res = await fetch('/api/porcentajes-jerarquias', { credentials: 'include' });
                setDataJer(await res.json());
            } catch (error) { console.error('Error cargando Jerarquías:', error); }
        };
        loadJerData();
    }, [refreshKey]);

    useEffect(() => {
        const loadAntData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('configuracion_antiguedad');
                setColumnsAnt(columns.map(col => ({ originalName: col.name, displayName: columnAliasAnt[col.name] || col.name, isPrimaryKey: col.name === primaryKey })));
                setIdColumnAnt(primaryKey);
                const res = await fetch('/api/antiguedad', { credentials: 'include' });
                setDataAnt(await res.json());
            } catch (error) { console.error('Error cargando Antigüedad:', error); }
        };
        loadAntData();
    }, [refreshKey]);

    useEffect(() => {
        const loadDeData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('deducciones');
                setColumnsDe(columns.map(col => ({ originalName: col.name, displayName: columnAliasDe[col.name] || col.name, isPrimaryKey: col.name === primaryKey })));
                setIdColumnDe(primaryKey);
                const res = await fetch('/api/deducciones', { credentials: 'include' });
                setDataDe(await res.json());
            } catch (error) { console.error('Error cargando Deducciones:', error); }
        };
        loadDeData();
    }, [refreshKey]);

    useEffect(() => {
        const loadPenData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('sueldos_pensionados');
                setColumnsPen(columns.map(col => ({ originalName: col.name, displayName: columnAliasPen[col.name] || col.name, isPrimaryKey: col.name === primaryKey })));
                setIdColumnPen(primaryKey);
                const res = await fetch('/api/sueldo-pensionado', { credentials: 'include' });
                const result = await res.json();
                // Si el API retorna un objeto, lo envolvemos en un array para la tabla
                setDataPen(result && result.sueldo_pensionado_id ? [result] : []);
            } catch (error) { console.error('Error cargando Sueldos Pensionados:', error); }
        };
        loadPenData();
    }, [refreshKey]);

    useEffect(() => {
        const loadSobData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('sueldo_sobreviente');
                setColumnsSob(columns.map(col => ({ originalName: col.name, displayName: columnAliasSob[col.name] || col.name, isPrimaryKey: col.name === primaryKey })));
                setIdColumnSob(primaryKey);
                const res = await fetch('/api/sueldo-sobreviviente', { credentials: 'include' });
                const result = await res.json();
                setDataSob(result && result.id_sueldo ? [result] : []);
            } catch (error) { console.error('Error cargando Sueldos Sobrevivientes:', error); }
        };
        loadSobData();
    }, [refreshKey]);

    // ==========================================
    // LÓGICA DE PROCESAMIENTO MATRIZ DINÁMICA
    // ==========================================

    const nombresDirectivos = [
        'Contralor del Estado',
        'Director General',
        'Jefe de División',
        'Jefe de División General',
        'Director de Línea',
        'Coordinador de Área'
    ];

    const isDirectivo = (nombre) => {

        if (!nombre) return false;
        const normalized = nombre.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return nombresDirectivos.some(d => {
            const normalizedD = d.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            return normalized === normalizedD;
        });
    };

    const isEspecial = (nombre) => {
        if (!nombre) return false;
        const n = nombre.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        // Usamos includes para mayor robustez en cargos que pueden tener variaciones, 
        // pero que deben caer en la tabla de sueldo fijo.
        return n.includes("JEFE DE DIVISION GENERAL") || 
               n.includes("DIRECTOR DE LINEA") || 
               n.includes("COORDINADOR DE AREA");
    };

    const directivosOna = dataOna.filter(ona => isDirectivo(ona.nombre));
    const operativosOna = dataOna.filter(ona => !isDirectivo(ona.nombre));

    const operativosEscalaOna = operativosOna.filter(ona => !isEspecial(ona.nombre));
    const operativosEspecialOna = operativosOna.filter(ona => isEspecial(ona.nombre));

    const ordenRomanos = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10 };
    const nivelesDinamicos = [...new Set(dataNiv.map(n => n.nombre))]
        .filter(nombre => !isDirectivo(nombre) && !isEspecial(nombre))
        .sort((a, b) => (ordenRomanos[a] || 99) - (ordenRomanos[b] || 99));

    const niveles = nivelesDinamicos.length > 0 ? nivelesDinamicos : ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

    const matrizNiveles = dataNiv.reduce((acc, curr) => {
        if (!acc[curr.cargo_onapre_id]) acc[curr.cargo_onapre_id] = {};
        acc[curr.cargo_onapre_id][curr.nombre] = curr;
        return acc;
    }, {});

    const columnasNivelEditables = columnsNiv.filter(col => col.originalName === 'salario_base');

    // ==========================================
    // LÓGICA DE PROCESAMIENTO MATRIZ DINÁMICA ANTIGUA
    // ==========================================

    const nivelesAntDinamicos = [...new Set(dataNivAnt?.map(n => n.nombre))]
        .filter(nombre => !isDirectivo(nombre) && !isEspecial(nombre))
        .sort((a, b) => (ordenRomanos[a] || 99) - (ordenRomanos[b] || 99));

    const nivelesAnt = nivelesAntDinamicos.length > 0 ? nivelesAntDinamicos : ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

    const matrizNivelesAnt = dataNivAnt.reduce((acc, curr) => {
        if (!acc[curr.cargo_onapre_id]) acc[curr.cargo_onapre_id] = {};
        acc[curr.cargo_onapre_id][curr.nombre] = curr;
        return acc;
    }, {});

    const columnasNivelAntEditables = columnsNivAnt.filter(col => col.originalName === 'salario_antiguo');

    // ==========================================
    // LÓGICA DE PROCESAMIENTO PROFESIONALIZACIÓN Y JERARQUÍAS
    // ==========================================

    const cargosJerarquia = [
        'JEFE DE DIVISION',
        'JEFE DE DIVISION GENERAL',
        'DIRECTOR GENERAL',
        'CONTRALOR DEL ESTADO',
        'DIRECTOR DE LINEA',
        'COORDINADOR DE AREA'
    ];

    const isJerarquia = (descripcion) => {
        if (!descripcion) return false;
        const normalized = descripcion.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return cargosJerarquia.some(cargo => {
            const normalizedCargo = cargo.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            return normalized === normalizedCargo;
        });
    };

    const dataPrfProfesional = dataPrf.filter(item => !isJerarquia(item.descripcion));
    // Ya no filtramos jerarquías de Profesionalización, usamos dataJer directamente

    return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración Salarial /</span> Tablas Salariales</h4>

            {/* ========================================== */}
            {/* 1. MATRIZ: TABULADOR ONAPRE */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-0">Tabulador Salarial (ONAPRE)</h5>
                        <small className="text-muted">Haga clic sobre un monto para editar el salario correspondiente.</small>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => setShowNivModal(true)}>
                        <i className="bx bx-plus me-1"></i> Agregar Nivel Salarial
                    </button>
                </div>

                <div className="table-responsive text-nowrap p-3">
                    <h6 className="mt-2 text-primary fw-bold">Cargos con Sueldo Fijo</h6>
                    <table className="table table-bordered table-hover mb-4">
                        <thead className="table-light text-center">
                            <tr>
                                <th className="align-middle bg-primary text-white">GRUPOS O CLASES DE CARGOS</th>
                                <th className="bg-secondary text-white">SUELDO MENSUAL</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {[...directivosOna, ...operativosEspecialOna].map((ona) => {
                                const nivelesCargo = matrizNiveles[ona.cargo_onapre_id] || {};
                                const nivelData = nivelesCargo[ona.nombre];
                                return (
                                    <tr key={ona.cargo_onapre_id}>
                                        <td className="fw-bold text-center align-middle">{ona.nombre}</td>
                                        <td className="text-center align-middle">
                                            {nivelData ? (
                                                <button
                                                    className="btn btn-sm btn-link text-decoration-none text-dark fw-semibold"
                                                    title={`Editar Sueldo (${ona.nombre})`}
                                                    onClick={() => {
                                                        setEditingItem(nivelData);
                                                        setShowNivUpModal(true);
                                                    }}
                                                >
                                                    {Number(nivelData.salario_base).toFixed(2)}
                                                </button>
                                            ) : (
                                                <span className="text-muted">---</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <h6 className="mt-4 text-primary fw-bold">Personal Operativo (Tabulador I-VII)</h6>
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
                            {operativosEscalaOna.map((ona) => {
                                const nivelesCargo = matrizNiveles[ona.cargo_onapre_id] || {};
                                return (
                                    <tr key={ona.cargo_onapre_id}>
                                        <td className="fw-bold text-center align-middle">{ona.nombre}</td>
                                        {niveles.map(lvl => {
                                            const nivelData = nivelesCargo[lvl];
                                            return (
                                                <td key={lvl} className="text-center align-middle">
                                                    {nivelData ? (
                                                        <button
                                                            className="btn btn-sm btn-link text-decoration-none text-dark fw-semibold"
                                                            title={`Editar Nivel ${lvl} (${ona.nombre})`}
                                                            onClick={() => {
                                                                setEditingItem(nivelData);
                                                                setShowNivUpModal(true);
                                                            }}
                                                        >
                                                            {Number(nivelData.salario_base).toFixed(2)}
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

                {/* MODAL CUSTOM PARA INSERTAR (Maneja las reglas de I-VII y Cupos llenos) */}
                <ModalInsertNivelSalarial
                    show={showNivModal}
                    handleClose={() => setShowNivModal(false)}
                    dataOna={dataOna}
                    matrizNiveles={matrizNiveles}
                    onSuccess={handleSuccess}
                />

                {/* MODAL UPDATE GENÉRICO (Solo expone 'salario_base') */}
                <ModalUpdate
                    show={showNivUpModal}
                    handleClose={() => setShowNivUpModal(false)}
                    columns={columnasNivelEditables}
                    tableName='niveles_salariales'
                    rowData={editingItem}
                    onSuccess={handleSuccess}
                    idColumn={idColumnNiv}
                />
            </div>

            <hr className="my-5" />

            {/* ========================================== */}
            {/* 2. MATRIZ: TABULADOR ONAPRE ANTIGUO*/}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-0">Tabulador Salarial ANTIGUO (ONAPRE)</h5>
                        <small className="text-muted">Haga clic sobre un monto para editar el salario correspondiente.</small>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => setShowNivAntModal(true)}>
                        <i className="bx bx-plus me-1"></i> Agregar Nivel Salarial
                    </button>
                </div>

                <div className="table-responsive text-nowrap p-3">
                    <h6 className="mt-2 text-primary fw-bold">Cargos con Sueldo Fijo</h6>
                    <table className="table table-bordered table-hover mb-4">
                        <thead className="table-light text-center">
                            <tr>
                                <th className="align-middle bg-primary text-white">GRUPOS O CLASES DE CARGOS</th>
                                <th className="bg-secondary text-white">SUELDO MENSUAL</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {[...directivosOna, ...operativosEspecialOna].map((ona) => {
                                const nivelesCargo = matrizNivelesAnt[ona.cargo_onapre_id] || {};
                                const nivelData = nivelesCargo[ona.nombre];
                                return (
                                    <tr key={ona.cargo_onapre_id}>
                                        <td className="fw-bold text-center align-middle">{ona.nombre}</td>
                                        <td className="text-center align-middle">
                                            {nivelData ? (
                                                <button
                                                    className="btn btn-sm btn-link text-decoration-none text-dark fw-semibold"
                                                    title={`Editar Sueldo (${ona.nombre})`}
                                                    onClick={() => {
                                                        setEditingItem(nivelData);
                                                        setShowNivAntUpModal(true);
                                                    }}
                                                >
                                                    {Number(nivelData.salario_antiguo).toFixed(2)}
                                                </button>
                                            ) : (
                                                <span className="text-muted">---</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <h6 className="mt-4 text-primary fw-bold">Personal Operativo (Tabulador I-VII)</h6>
                    <table className="table table-bordered table-hover">
                        <thead className="table-light text-center">
                            <tr>
                                <th rowSpan="2" className="align-middle bg-primary text-white">GRUPOS O CLASES DE CARGOS</th>
                                <th colSpan={nivelesAnt.length} className="bg-secondary text-white">NIVELES O RANGOS DE SUELDOS MENSUALES</th>
                            </tr>
                            <tr>
                                {nivelesAnt.map(lvl => <th key={lvl} className="bg-light">{lvl}</th>)}
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {operativosEscalaOna.map((ona) => {
                                const nivelesCargo = matrizNivelesAnt[ona.cargo_onapre_id] || {};
                                return (
                                    <tr key={ona.cargo_onapre_id}>
                                        <td className="fw-bold text-center align-middle">{ona.nombre}</td>
                                        {nivelesAnt.map(lvl => {
                                            const nivelData = nivelesCargo[lvl];
                                            return (
                                                <td key={lvl} className="text-center align-middle">
                                                    {nivelData ? (
                                                        <button
                                                            className="btn btn-sm btn-link text-decoration-none text-dark fw-semibold"
                                                            title={`Editar Nivel ${lvl} (${ona.nombre})`}
                                                            onClick={() => {
                                                                setEditingItem(nivelData);
                                                                setShowNivAntUpModal(true);
                                                            }}
                                                        >
                                                            {Number(nivelData.salario_antiguo).toFixed(2)}
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

                {/* MODAL CUSTOM PARA INSERTAR (Maneja las reglas de I-VII y Cupos llenos) */}
                <ModalInsertNivelSalarial
                    show={showNivAntModal}
                    handleClose={() => setShowNivAntModal(false)}
                    dataOna={dataOna}
                    matrizNiveles={matrizNivelesAnt}
                    tableName="niveles_salariales_antiguos"
                    onSuccess={handleSuccess}
                />

                {/* MODAL UPDATE GENÉRICO (Solo expone 'salario_base') */}
                <ModalUpdate
                    show={showNivAntUpModal}
                    handleClose={() => setShowNivAntUpModal(false)}
                    columns={columnasNivelAntEditables}
                    tableName='niveles_salariales_antiguos'
                    rowData={editingItem}
                    onSuccess={handleSuccess}
                    idColumn={idColumnNivAnt}
                />
            </div>

            <hr className="my-5" />

            {/* ========================================== */}
            {/* 2. PRIMAS (primas_generales) */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Primas y Beneficios</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowPriModal(true)}>Agregar Prima</button>
                </div>
                <ModalInsert show={showPriModal} handleClose={() => setShowPriModal(false)} columns={columnsPri} tableName="primas_generales" onSuccess={handleSuccess} />
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
                                                <Dropdown.Item onClick={() => { setDeleteItem(item.prima_id); setShowPriDelModal(true); }}><i className="bx bx-trash me-1"></i> Eliminar</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ModalUpdate show={showPriUpModal} handleClose={() => setShowPriUpModal(false)} columns={columnsPri} tableName='primas_generales' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnPri} />
                <ModalDelete show={showPriDelModal} handleClose={() => setShowPriDelModal(false)} tableName="primas_generales" rowId={deleteItem} idColumn={idColumnPri} onSuccess={handleSuccess} />
            </div>

            {/* ========================================== */}
            {/* 3. PROFESIONALIZACIÓN (primas_profesionalizacion) */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Escala por Profesionalización</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowPrfModal(true)}>Agregar Grado</button>
                </div>
                <ModalInsert show={showPrfModal} handleClose={() => setShowPrfModal(false)} columns={columnsPrf} tableName="primas_profesionalizacion" onSuccess={handleSuccess} />
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsPrf.map((col, idx) => <th key={idx}>{col.displayName}</th>)}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataPrfProfesional.map((item, index) => (
                                <tr key={`prf-${index}`}>
                                    {columnsPrf.map((col) => <td key={`${index}-${col.originalName}`}>{item[col.originalName.toLowerCase()] ?? 'N/A'}</td>)}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm"><i className="bx bx-dots-vertical-rounded"></i></Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => { setEditingItem(item); setShowPrfUpModal(true); }}><i className="bx bx-edit-alt me-1"></i> Editar</Dropdown.Item>
                                                <Dropdown.Item onClick={() => { setDeleteItem(item.prima_profesional_id); setShowPrfDelModal(true); }}><i className="bx bx-trash me-1"></i> Eliminar</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ModalUpdate show={showPrfUpModal} handleClose={() => setShowPrfUpModal(false)} columns={columnsPrf} tableName='primas_profesionalizacion' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnPrf} />
                <ModalDelete show={showPrfDelModal} handleClose={() => setShowPrfDelModal(false)} tableName="primas_profesionalizacion" rowId={deleteItem} idColumn={idColumnPrf} onSuccess={handleSuccess} />
            </div>

            {/* ========================================== */}
            {/* 4. JERARQUÍAS (primas_profesionalizacion - filtrado) */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Jerarquias</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowJerModal(true)}>Agregar Jerarquía</button>
                </div>
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Cargo de Jerarquía</th>
                                <th>Porcentaje (%)</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataJer.map((item, index) => (
                                <tr key={`jer-${index}`}>
                                    <td>{item.jerarquia_id}</td>
                                    <td>{item.cargo}</td>
                                    <td>{item.porcentaje}%</td>
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm"><i className="bx bx-dots-vertical-rounded"></i></Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => {
                                                    // Adaptar item para ModalUpdate genérico si es necesario
                                                    setEditingItem(item);
                                                    // Nota: ModalUpdate podría necesitar configuración extra para esta tabla nueva
                                                    // Pero por ahora cumplimos con el requerimiento de visualización
                                                }}><i className="bx bx-edit-alt me-1"></i> Editar</Dropdown.Item>
                                                <Dropdown.Item onClick={() => {
                                                    setDeleteItem(item.jerarquia_id);
                                                    // setShowPrfDelModal(true) funcionará si le pasamos el tableName correcto
                                                }}><i className="bx bx-trash me-1"></i> Eliminar</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MODAL ESPECÍFICO PARA JERARQUÍAS (Evita errores de escritura) */}
                <ModalInsertJerarquia
                    show={showJerModal}
                    handleClose={() => setShowJerModal(false)}
                    onSuccess={handleSuccess}
                    cargosJerarquia={cargosJerarquia}
                />
            </div>

            {/* ========================================== */}
            {/* 4. ANTIGÜEDAD (configuracion_antiguedad) */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Porcentajes de Antigüedad</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowAntModal(true)}>Agregar Escala</button>
                </div>
                <ModalInsert show={showAntModal} handleClose={() => setShowAntModal(false)} columns={columnsAnt} tableName="configuracion_antiguedad" onSuccess={handleSuccess} />
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
                                                <Dropdown.Item onClick={() => { setDeleteItem(item.antiguedad_id); setShowAntDelModal(true); }}><i className="bx bx-trash me-1"></i> Eliminar</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ModalUpdate show={showAntUpModal} handleClose={() => setShowAntUpModal(false)} columns={columnsAnt} tableName='configuracion_antiguedad' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnAnt} />
                <ModalDelete show={showAntDelModal} handleClose={() => setShowAntDelModal(false)} tableName="configuracion_antiguedad" rowId={deleteItem} idColumn={idColumnAnt} onSuccess={handleSuccess} />
            </div>

            {/* ========================================== */}
            {/* 5. DEDUCCIONES (deducciones) */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Deducciones de Ley</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowDeModal(true)}>Agregar Deducción</button>
                </div>
                <ModalInsert show={showDeModal} handleClose={() => setShowDeModal(false)} columns={columnsDe} tableName="deducciones" onSuccess={handleSuccess} />
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
                <ModalUpdate show={showDeUpModal} handleClose={() => setShowDeUpModal(false)} columns={columnsDe} tableName='deducciones' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnDe} />
                <ModalDelete show={showDeDelModal} handleClose={() => setShowDeDelModal(false)} tableName="deducciones" rowId={deleteItem} idColumn={idColumnDe} onSuccess={handleSuccess} />
            </div>

            {/* ========================================== */}
            {/* 6. SALARIO PENSIONADOS (sueldos_pensionados) */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Salario de Pensionados</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowPenModal(true)} disabled={dataPen.length > 0}>
                        {dataPen.length > 0 ? 'Salario Configurado' : 'Agregar Salario'}
                    </button>
                </div>
                <ModalInsert show={showPenModal} handleClose={() => setShowPenModal(false)} columns={columnsPen} tableName="sueldos_pensionados" onSuccess={handleSuccess} />
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsPen.map((col, idx) => <th key={idx}>{col.displayName}</th>)}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataPen.length > 0 ? (
                                dataPen.map((item, index) => (
                                    <tr key={`pen-${index}`}>
                                        {columnsPen.map((col) => <td key={`${index}-${col.originalName}`}>{item[col.originalName.toLowerCase()] ?? 'N/A'}</td>)}
                                        <td>
                                            <Dropdown>
                                                <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm"><i className="bx bx-dots-vertical-rounded"></i></Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => { setEditingItem(item); setShowPenUpModal(true); }}><i className="bx bx-edit-alt me-1"></i> Editar</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => { setDeleteItem(item.sueldo_pensionado_id); setShowPenDelModal(true); }}><i className="bx bx-trash me-1"></i> Eliminar</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columnsPen.length + 1} className="text-center">No se ha configurado el sueldo de los pensionados</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <ModalUpdate show={showPenUpModal} handleClose={() => setShowPenUpModal(false)} columns={columnsPen} tableName='sueldos_pensionados' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnPen} />
                <ModalDelete show={showPenDelModal} handleClose={() => setShowPenDelModal(false)} tableName="sueldos_pensionados" rowId={deleteItem} idColumn={idColumnPen} onSuccess={handleSuccess} />
            </div>

            {/* ========================================== */}
            {/* 7. SALARIO SOBREVIVIENTES (sueldo_sobreviente) */}
            {/* ========================================== */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Salario de Sobrevivientes</h5>
                    <button type="button" className="btn btn-primary" onClick={() => setShowSobModal(true)} disabled={dataSob.length > 0}>
                        {dataSob.length > 0 ? 'Salario Configurado' : 'Agregar Salario'}
                    </button>
                </div>
                <ModalInsert show={showSobModal} handleClose={() => setShowSobModal(false)} columns={columnsSob} tableName="sueldo_sobreviente" onSuccess={handleSuccess} />
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columnsSob.map((col, idx) => <th key={idx}>{col.displayName}</th>)}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataSob.length > 0 ? (
                                dataSob.map((item, index) => (
                                    <tr key={`sob-${index}`}>
                                        {columnsSob.map((col) => <td key={`${index}-${col.originalName}`}>{item[col.originalName.toLowerCase()] ?? 'N/A'}</td>)}
                                        <td>
                                            <Dropdown>
                                                <Dropdown.Toggle variant="secondary" className="nav-dropdown-dark-example btn-sm"><i className="bx bx-dots-vertical-rounded"></i></Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => { setEditingItem(item); setShowSobUpModal(true); }}><i className="bx bx-edit-alt me-1"></i> Editar</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => { setDeleteItem(item.id_sueldo); setShowSobDelModal(true); }}><i className="bx bx-trash me-1"></i> Eliminar</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columnsSob.length + 1} className="text-center">No se ha configurado el sueldo de los sobrevivientes</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <ModalUpdate show={showSobUpModal} handleClose={() => setShowSobUpModal(false)} columns={columnsSob} tableName='sueldo_sobreviente' rowData={editingItem} onSuccess={handleSuccess} idColumn={idColumnSob} />
                <ModalDelete show={showSobDelModal} handleClose={() => setShowSobDelModal(false)} tableName="sueldo_sobreviente" rowId={deleteItem} idColumn={idColumnSob} onSuccess={handleSuccess} />
            </div>
        </div>
    );
};