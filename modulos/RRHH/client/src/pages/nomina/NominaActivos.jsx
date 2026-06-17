import React, { useEffect, useState, useRef, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { downloadExcel, downloadExcelZip, generateExcelResumenMensual } from '../../utils/exportExcel.js';
import { getBase64FromUrl } from '../../utils/imageUtils.js';
import logoCet from '../../assets/logo-cet.png';
import { useAuth } from '../../hooks/useAuth.js';

const TIPO_PERSONAL = 'Funcionario';
const ALLOWED_ROLES = [5, 6, 7]

export const NominaActivos = () => {
    const { rol_id } = useAuth()
    const [periodoNomina, setPeriodoNomina] = useState(null);
    const [tipoNomina, setTipoNomina] = useState('1');
    const [nominaData, setNominaData] = useState([]);
    const [loadingCalcular, setLoadingCalcular] = useState(false);
    const [loadingCerrar, setLoadingCerrar] = useState(false);
    const [cierreExitoso, setCierreExitoso] = useState(false);
    const [periodoLoading, setPeriodoLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cierreStatus, setCierreStatus] = useState({ q1: false, q2: false, unificada: false })

    const meses = [
        { id: 1, name: 'Enero' }, { id: 2, name: 'Febrero' }, { id: 3, name: 'Marzo' },
        { id: 4, name: 'Abril' }, { id: 5, name: 'Mayo' }, { id: 6, name: 'Junio' },
        { id: 7, name: 'Julio' }, { id: 8, name: 'Agosto' }, { id: 9, name: 'Septiembre' },
        { id: 10, name: 'Octubre' }, { id: 11, name: 'Noviembre' }, { id: 12, name: 'Diciembre' }
    ];

    const mes = periodoNomina?.mes || '';
    const anio = periodoNomina?.anio || '';
    const mesNombre = periodoNomina?.mesNombre || 'Mes';
    const quincena = tipoNomina;
    const setQuincena = setTipoNomina;

    useEffect(() => {
        const loadPeriodoObjetivo = async () => {
            setPeriodoLoading(true);
            try {
                const res = await fetch('/api/nomina/periodo-objetivo', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();

                if (!data.ok) {
                    throw new Error(data.message || 'No se pudo obtener el periodo de nomina.');
                }

                setPeriodoNomina(data.periodo);
            } catch (error) {
                console.error(error);
                toast.error('Error al obtener el periodo de nomina desde el servidor.');
            } finally {
                setPeriodoLoading(false);
            }
        };

        loadPeriodoObjetivo();
    }, []);

    const verificarCierre = useCallback(async (mes, anio) => {
        if (!mes || !anio) return
        try {
            const [resQ1, resQ2] = await Promise.all([
                fetch(`/api/nomina/verificar-cierre?mes=${mes}&anio=${anio}&quincena=1&tipo_personal=${TIPO_PERSONAL}`),
                fetch(`/api/nomina/verificar-cierre?mes=${mes}&anio=${anio}&quincena=2&tipo_personal=${TIPO_PERSONAL}`)
            ])
            const dataQ1 = await resQ1.json()
            const dataQ2 = await resQ2.json()
            const q1Closed = dataQ1.ok ? dataQ1.data.isClosed : false
            const q2Closed = dataQ2.ok ? dataQ2.data.isClosed : false
            setCierreStatus({
                q1: q1Closed,
                q2: q2Closed,
                unificada: q1Closed || q2Closed
            })
        } catch (error) {
            console.error('Error al verificar cierre:', error)
        }
    }, [])

    useEffect(() => {
        if (periodoNomina?.mes && periodoNomina?.anio) {
            verificarCierre(periodoNomina.mes, periodoNomina.anio)
        }
    }, [periodoNomina, verificarCierre])

    const isProcessingRef = useRef(false);

    const handleCalcular = async () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        setLoadingCalcular(true);
        setNominaData([]);
        try {
            const res = await fetch('/api/nomina/calcular-en-caliente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo_personal: TIPO_PERSONAL, quincena: tipoNomina })
            });
            const data = await res.json();
            if (data.ok) {
                setNominaData(data.datos);
                toast.success('Nómina calculada correctamente (en caliente).');
            } else {
                toast.error(data.message || 'Error al calcular la nómina.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de servidor al calcular nómina.');
        } finally {
            setLoadingCalcular(false);
            isProcessingRef.current = false;
        }
    };

    const handleCerrar = async () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        setLoadingCerrar(true);
        const quincenaKey = tipoNomina === 'unificada' ? 'unificada' : `q${tipoNomina}`
        setCierreStatus(prev => ({ ...prev, [quincenaKey]: true }))
        try {
            const res = await fetch('/api/nomina/guardar-cierre', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo_personal: TIPO_PERSONAL, quincena: tipoNomina, mes, anio })
            });
            const data = await res.json();
            if (data.ok) {
                setCierreExitoso(true);
                await verificarCierre(mes, anio)
                toast.success('Nómina cerrada y guardada correctamente.');
            } else {
                setCierreStatus(prev => ({ ...prev, [quincenaKey]: false }))
                toast.error(data.message || 'Error al cerrar la nómina.');
            }
        } catch (error) {
            setCierreStatus(prev => ({ ...prev, [quincenaKey]: false }))
            console.error(error);
            toast.error('Error de servidor al cerrar nómina.');
        } finally {
            setLoadingCerrar(false);
            isProcessingRef.current = false;
        }
    };



    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);
    };

    const formatFechaCorta = (fecha) => {
        if (!fecha) return '-';
        const d = new Date(fecha);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getDifferenceDisplay = (row, field) => {
        if (row.asignaciones.retroactivo_detalle && row.asignaciones.retroactivo_detalle.length > 0) {
            return row.asignaciones.retroactivo_detalle.reduce((sum, d) => sum + Number(d[`delta_${field}`] || 0), 0);
        }
        if (row.asignaciones.diferencias_suplencia) {
            return row.asignaciones.diferencias_suplencia[field] || 0;
        }
        return 0;
    };

    const buildExportDataMensual = (dataArray) => {
        return dataArray.map(row => ({
            'Cédula': row.empleado.cedula,
            'Nombres': row.empleado.nombres,
            'Apellidos': row.empleado.apellidos,
            'Dirección': row.empleado.departamento,
            'División': row.empleado.division,
            'Unidad': row.empleado.unidad,
            'Cargo CET': row.empleado.cargo_cet,
            'Sueldo Mensual': row.asignaciones.sueldo_quincenal,
            'Antigüedad Mensual': row.asignaciones.antiguedad_quincenal,
            'Prof. Mensual': row.asignaciones.profesionalizacion,
            'P. Jerarquía Mensual': row.asignaciones.prima_jerarquia,
            'P. Transporte Mensual': row.asignaciones.prima_transporte,
            'P. Reconocim. Mensual': row.asignaciones.prima_reconocimiento,
            'P. Hogares Mensual': row.asignaciones.prima_hogares,
            'Comp. Alim. Mensual': row.asignaciones.complemento_alimentacion,
            'P. Hijos Mensual': row.asignaciones.prima_hijos,
            'Dif. Sueldo Mensual': row.asignaciones.diferencias_suplencia?.sueldo || 0,
            'Dif. Antigüedad Mensual': row.asignaciones.diferencias_suplencia?.antiguedad || 0,
            'Dif. Prof. Mensual': row.asignaciones.diferencias_suplencia?.profesionalizacion || 0,
            'Dif. Jerarquía Mensual': row.asignaciones.diferencias_suplencia?.jerarquia || 0,
            'Retroactivo Mensual': row.asignaciones.retroactivo || 0,
            'Total Asignaciones Mensual': row.asignaciones.total_asignaciones,
            'Asig. Mensual': row.deducciones.asignacion_mensual,
            'Asig. IVSS Mensual': row.deducciones.asignacion_semanal_ivss,
            'SSO Empleado Mensual': row.deducciones.seguro_empleado,
            'SSO Patronal Mensual': row.deducciones.seguro_patronal,
            'RPE Empleado Mensual': row.deducciones.rpe_empleado,
            'RPE Patronal Mensual': row.deducciones.rpe_patronal,
            'FAOV Empleado Mensual': row.deducciones.faov_empleado,
            'FAOV Patronal Mensual': row.deducciones.faov_patronal,
            'FEJP Empleado Mensual': row.deducciones.fejp,
            'FEJP Patronal Mensual': row.deducciones.fejp_patronal,
            'Caja Ahorro Empleado Mensual': row.deducciones.caja_ahorro,
            'Caja Ahorro Patronal Mensual': row.deducciones.caja_ahorro_patronal,
            'Total Deducciones Mensual': row.deducciones.total_deducciones,
            'Salario Neto Mensual': row.salario_neto,
            '% Antig. Nuevo': (row.asignaciones.porcentaje_antiguedad_nuevo * 100).toFixed(0) + '%',
            '% Antig. Antiguo': (row.asignaciones.porcentaje_antiguedad_antiguo * 100).toFixed(0) + '%'
        }));
    };

    const buildExportData = (dataArray) => {
        return dataArray.map(row => ({
            'Cédula': row.empleado.cedula,
            'Nombres': row.empleado.nombres,
            'Apellidos': row.empleado.apellidos,
            'Dirección': row.empleado.departamento,
            'División': row.empleado.division,
            'Unidad': row.empleado.unidad,
            'Cargo CET': row.empleado.cargo_cet,
            'Sueldo Quincenal': row.asignaciones.sueldo_quincenal,
            'Antigüedad': row.asignaciones.antiguedad_quincenal,
            'Prof.': row.asignaciones.profesionalizacion,
            'P. Jerarquía': row.asignaciones.prima_jerarquia,
            'P. Transporte': row.asignaciones.prima_transporte,
            'P. Reconocim.': row.asignaciones.prima_reconocimiento,
            'P. Hogares': row.asignaciones.prima_hogares,
            'Comp. Alim.': row.asignaciones.complemento_alimentacion,
            'P. Hijos': row.asignaciones.prima_hijos,
            'Dif. Sueldo': getDifferenceDisplay(row, 'sueldo'),
            'Dif. Antigüedad': getDifferenceDisplay(row, 'antiguedad'),
            'Dif. Prof.': getDifferenceDisplay(row, 'profesionalizacion'),
            'Dif. Jerarquía': getDifferenceDisplay(row, 'jerarquia'),
            'Retroactivo': row.asignaciones.retroactivo || 0,
            'Total Asignaciones': row.asignaciones.total_asignaciones,
            'Asig. Mensual': row.deducciones.asignacion_mensual,
            'Asig. IVSS': row.deducciones.asignacion_semanal_ivss,
            'SSO Empleado': row.deducciones.seguro_empleado,
            'SSO Patronal': row.deducciones.seguro_patronal,
            'RPE Empleado': row.deducciones.rpe_empleado,
            'RPE Patronal': row.deducciones.rpe_patronal,
            'FAOV Empleado': row.deducciones.faov_empleado,
            'FAOV Patronal': row.deducciones.faov_patronal,
            'FEJP Empleado': row.deducciones.fejp,
            'FEJP Patronal': row.deducciones.fejp_patronal,
            'Caja Ahorro Empleado': row.deducciones.caja_ahorro,
            'Caja Ahorro Patronal': row.deducciones.caja_ahorro_patronal,
            'Total Deducciones': row.deducciones.total_deducciones,
            'Salario Neto': row.salario_neto,
            '% Antig. Nuevo': (row.asignaciones.porcentaje_antiguedad_nuevo * 100).toFixed(0) + '%',
            '% Antig. Antiguo': (row.asignaciones.porcentaje_antiguedad_antiguo * 100).toFixed(0) + '%'
        }));
    };

    const handleExportExcel = async () => {
        if (!nominaData || (Array.isArray(nominaData) && nominaData.length === 0) || (nominaData.isUnificada && nominaData.q1.length === 0 && nominaData.q2.length === 0)) {
            toast.warning('No hay datos para exportar.');
            return;
        }

        const mesNombre = meses.find(m => m.id === Number(mes))?.name || 'Mes';
        const logoBase64 = await getBase64FromUrl(logoCet);
        const auditMetadata = {
            mesObjetivo: `${mesNombre} ${anio}`,
            fechaGeneracion: new Date().toLocaleString('es-VE')
        };

        // Obtener firmantes dinámicos desde la BD
        let firmantes = null;
        try {
            const resFirm = await fetch('/api/nomina-activos/firmantes', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const firmData = await resFirm.json();
            if (firmData.ok) firmantes = firmData.firmantes;
        } catch (err) {
            console.warn('No se pudieron obtener los firmantes:', err);
        }

        const summaryConfig = [
            { concepto: 'SUELDO BÁSICO QUINCENAL', key: 'Sueldo Quincenal', type: 'asignacion' },
            { concepto: 'ANTIGÜEDAD QUINCENAL', key: 'Antigüedad', type: 'asignacion' },
            { concepto: 'PROFESIONALIZACIÓN QUINCENAL', key: 'Prof.', type: 'asignacion' },
            { concepto: 'PRIMA JERARQUÍA', key: 'P. Jerarquía', type: 'asignacion' },
            { concepto: 'PRIMA DE TRANSPORTE', key: 'P. Transporte', type: 'asignacion' },
            { concepto: 'PRIMA DE RECONOCIMIENTO', key: 'P. Reconocim.', type: 'asignacion' },
            { concepto: 'PRIMA DE HOGARES', key: 'P. Hogares', type: 'asignacion' },
            { concepto: 'COMPLEMENTO DE ALIMENTACIÓN', key: 'Comp. Alim.', type: 'asignacion' },
            { concepto: 'PRIMA POR HIJOS', key: 'P. Hijos', type: 'asignacion' },
            { concepto: 'DIFERENCIA DE SUELDO BÁSICO', key: 'Dif. Sueldo', type: 'asignacion' },
            { concepto: 'DIFERENCIA DE ANTIGÜEDAD', key: 'Dif. Antigüedad', type: 'asignacion' },
            { concepto: 'DIFERENCIA DE PROFESIONALIZACIÓN', key: 'Dif. Prof.', type: 'asignacion' },
            { concepto: 'DIFERENCIA DE JERARQUÍA', key: 'Dif. Jerarquía', type: 'asignacion' },
            { concepto: 'RETROACTIVO', key: 'Retroactivo', type: 'asignacion' },
            { concepto: 'SEGURO SOCIAL', key: 'SSO Empleado', type: 'deduccion' },
            { concepto: 'RÉGIMEN PRESTACIONAL DE EMPLEO', key: 'RPE Empleado', type: 'deduccion' },
            { concepto: 'FONDO DE AHORRO OBLIGATORIO PARA LA VIVIENDA', key: 'FAOV Empleado', type: 'deduccion' },
            { concepto: 'FONDO ESPECIAL DE JUBILACIONES Y PENSIONES', key: 'FEJP Empleado', type: 'deduccion' },
            { concepto: 'CAJA DE AHORROS', key: 'Caja Ahorro Empleado', type: 'deduccion' }
        ];

        if (nominaData.isUnificada) {
            const files = [
                {
                    data: buildExportData(nominaData.q1),
                    fileName: `Nomina_Activos_${mesNombre}_${anio}_Q1.xlsx`,
                    sheetName: 'Nómina Q1',
                    summaryConfig,
                    auditMetadata
                },
                {
                    data: buildExportData(nominaData.q2),
                    fileName: `Nomina_Activos_${mesNombre}_${anio}_Q2.xlsx`,
                    sheetName: 'Nómina Q2',
                    summaryConfig,
                    auditMetadata
                }
            ];

            try {
                const resResumen = await fetch(`/api/nomina-activos/resumen-mensual?mes=${mes}&anio=${anio}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                const resumenData = await resResumen.json();
                if (resumenData.ok && resumenData.datos?.length > 0) {
                    const dataMensual = buildExportDataMensual(resumenData.datos);
                    const bufferResumen = await generateExcelResumenMensual(dataMensual, auditMetadata, logoBase64, firmantes);
                    if (bufferResumen) {
                        files.push({
                            buffer: bufferResumen,
                            fileName: `resumen_mensual_nom_${anio}_${String(mes).padStart(2, '0')}.xlsx`
                        });
                    }
                }
            } catch (err) {
                console.warn('No se pudo generar el resumen mensual:', err);
            }

            await downloadExcelZip(files, `Nomina_Activos_${mesNombre}_${anio}_Unificada.zip`, logoBase64, firmantes);
        } else {
            const dataToExport = buildExportData(nominaData);
            downloadExcel(dataToExport, `Nomina_Activos_${mesNombre}_${anio}_Q${quincena}.xlsx`, 'Nómina Activos', logoBase64, summaryConfig, auditMetadata, firmantes);
        }
    };

    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <ToastContainer />
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Nómina /</span> Funcionarios Activos
            </h4>

            {/* Filtros */}
            <div className="card mb-4">
                <div className="card-header border-bottom">
                    <h5 className="card-title mb-0">Parámetros de Cálculo</h5>
                </div>
                <div className="card-body mt-3">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">Mes</label>
                            <select className="form-select" value={mes} disabled aria-readonly="true">
                                {meses.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Año</label>
                            <select className="form-select" value={anio} disabled aria-readonly="true">
                                {anio && <option value={anio}>{anio}</option>}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Tipo de Nómina</label>
                            <select className="form-select" value={quincena} onChange={e => { setQuincena(e.target.value); setCierreExitoso(false); if (mes && anio) verificarCierre(mes, anio); }}>
                                <option value={1}>Primera Quincena (1)</option>
                                <option value={2}>Segunda Quincena (2)</option>
                                <option value="unificada">Nómina Unificada (Mensual)</option>
                            </select>
                        </div>
                        <div className="col-md-3 d-flex align-items-end gap-2">
                            <button
                                className="btn btn-primary flex-fill"
                                onClick={handleCalcular}
                                disabled={loadingCalcular || periodoLoading || !periodoNomina}
                            >
                                {loadingCalcular ? (
                                    <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Calculando...</>
                                ) : (
                                    <><i className="bx bx-calculator me-1"></i> Calcular Nómina (En Caliente)</>
                                )}
                            </button>
                            {ALLOWED_ROLES.includes(rol_id) ? (
                                <button
                                    className="btn btn-success flex-fill"
                                    onClick={handleCerrar}
                                    disabled={loadingCerrar || cierreStatus[quincena === 'unificada' ? 'unificada' : `q${quincena}`] || loadingCalcular}
                                >
                                    {loadingCerrar ? (
                                        <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Cerrando...</>
                                    ) : cierreStatus[quincena === 'unificada' ? 'unificada' : `q${quincena}`] ? (
                                        <><i className="bx bx-check-shield me-1"></i> Período Ya Cerrado en BD</>
                                    ) : (
                                        <><i className="bx bx-save me-1"></i> Cerrar y Guardar Nómina</>
                                    )}
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            {/* Buscador dinámico */}
            {!nominaData.isUnificada && nominaData.length > 0 && (
                <div className="card mb-4">
                    <div className="card-body py-3">
                        <div className="input-group">
                            <span className="input-group-text"><i className="bx bx-search"></i></span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por cédula, nombres, dirección, división, unidad o cargo..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                                    <i className="bx bx-x"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Resultados (Tabla Expandible) */}
            {nominaData.isUnificada ? (
                <div className="card text-center py-5">
                    <div className="card-body">
                        <i className="bx bx-check-circle text-success mb-3" style={{ fontSize: '4rem' }}></i>
                        <h4 className="card-title">Nómina Unificada Procesada</h4>
                        <p className="card-text text-muted">
                            Se han procesado correctamente los registros de la primera y segunda quincena.<br />
                            Haga clic en el botón de abajo para descargar ambas nóminas en un archivo ZIP.
                        </p>
                        <button className="btn btn-success mt-3 btn-lg" onClick={handleExportExcel}>
                            <i className="bx bxs-file-archive me-2"></i> Descargar ZIP (1ra y 2da Quincena)
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            Resultados de Nómina ({(() => {
                                const term = searchTerm.toLowerCase();
                                if (!term) return nominaData.length;
                                return nominaData.filter(row => {
                                    const fullName = `${row.empleado.nombres} ${row.empleado.apellidos}`.toLowerCase();
                                    return (
                                        row.empleado.cedula?.toLowerCase().includes(term) ||
                                        fullName.includes(term) ||
                                        row.empleado.departamento?.toLowerCase().includes(term) ||
                                        row.empleado.division?.toLowerCase().includes(term) ||
                                        row.empleado.unidad?.toLowerCase().includes(term) ||
                                        row.empleado.cargo_cet?.toLowerCase().includes(term)
                                    );
                                }).length;
                            })()} Empleados)
                        </h5>
                        {nominaData.length > 0 && (
                            <button className="btn btn-success" onClick={handleExportExcel}>
                                <i className="bx bxs-file-export me-1"></i> Exportar a Excel
                            </button>
                        )}
                    </div>
                    <div className="table-responsive text-nowrap">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Cédula</th>
                                    <th>Nombres y Apellidos</th>
                                    <th>Cargo</th>
                                    <th className="text-end">Sueldo Quin.</th>
                                    <th className="text-end">Antigüedad</th>
                                    <th className="text-end">Prof.</th>
                                    <th className="text-end">P. Jerarquía</th>
                                    <th className="text-end">P. Transporte</th>
                                    <th className="text-end">P. Reconocim.</th>
                                    <th className="text-end">P. Hogares</th>
                                    <th className="text-end">Comp. Alim.</th>
                                    <th className="text-end">P. Hijos</th>
                                    <th className="text-end">Dif. Sueldo</th>
                                    <th className="text-end">Dif. Antigüedad</th>
                                    <th className="text-end">Dif. Prof.</th>
                                    <th className="text-end">Dif. Jerarquía</th>
                                    <th className="text-end">Retroactivo</th>
                                    <th className="text-end fw-bold" style={{ backgroundColor: '#f0f8ff' }}>T. Asignaciones</th>
                                    <th className="text-end" style={{ backgroundColor: '#fffbeb' }}>Asig.<br />Mensual</th>
                                    <th className="text-end" style={{ backgroundColor: '#fffbeb' }}>Asig. Mensual<br />IVSS</th>
                                    <th className="text-end">SSO<br />Empleado</th>
                                    <th className="text-end text-muted">SSO<br />Patronal</th>
                                    <th className="text-end">RPE<br />Empleado</th>
                                    <th className="text-end text-muted">RPE<br />Patronal</th>
                                    <th className="text-end">FAOV<br />Empleado</th>
                                    <th className="text-end text-muted">FAOV<br />Patronal</th>
                                    <th className="text-end">FEJP<br />Empleado</th>
                                    <th className="text-end text-muted">FEJP<br />Patronal</th>
                                    <th className="text-end">Caja Ahorro<br />Empleado/Patronal</th>

                                    <th className="text-end fw-bold" style={{ backgroundColor: '#fff5f5' }}>T. Deducciones</th>
                                    <th className="text-end text-success fw-bold" style={{ backgroundColor: '#f0fff4' }}>Salario Neto</th>
                                    <th className="text-center">% Antig.<br />(Nuevo)</th>
                                    <th className="text-center">% Antig.<br />(Antiguo)</th>
                                </tr>
                            </thead>
                            <tbody className="table-border-bottom-0">
                                {nominaData.length === 0 ? (
                                    <tr>
                                        <td colSpan="34" className="text-center py-4">
                                            No hay datos de nómina para mostrar. Haga clic en Calcular.
                                        </td>
                                    </tr>
                                ) : (
                                    nominaData.filter(row => {
                                        const term = searchTerm.toLowerCase();
                                        if (!term) return true;
                                        const fullName = `${row.empleado.nombres} ${row.empleado.apellidos}`.toLowerCase();
                                        return (
                                            row.empleado.cedula?.toLowerCase().includes(term) ||
                                            fullName.includes(term) ||
                                            row.empleado.departamento?.toLowerCase().includes(term) ||
                                            row.empleado.division?.toLowerCase().includes(term) ||
                                            row.empleado.unidad?.toLowerCase().includes(term) ||
                                            row.empleado.cargo_cet?.toLowerCase().includes(term)
                                        );
                                    }).map((row) => (
                                        <tr key={row.empleado.cedula} className="align-middle">
                                            <td>{row.empleado.cedula}</td>
                                            <td>
                                                <div style={{ minWidth: '220px' }}>
                                                    <strong>{row.empleado.nombres} {row.empleado.apellidos}</strong><br />
                                                    {row.empleado.departamento && <small className="text-muted d-block"><i className="bx bx-buildings me-1"></i>{row.empleado.departamento}</small>}
                                                    {row.empleado.division && <small className="text-muted d-block"><i className="bx bx-git-branch me-1"></i>{row.empleado.division}</small>}
                                                    {row.empleado.unidad && <small className="text-muted d-block"><i className="bx bx-subdirectory-right me-1"></i>{row.empleado.unidad}</small>}
                                                </div>
                                            </td>
                                            <td><div style={{ minWidth: '150px' }}>{row.empleado.cargo_cet}</div></td>
                                            <td className="text-end">{formatCurrency(row.asignaciones.sueldo_quincenal)}</td>
                                            <td className="text-end">{formatCurrency(row.asignaciones.antiguedad_quincenal)}</td>
                                            <td className="text-end">{formatCurrency(row.asignaciones.profesionalizacion)}</td>
                                            <td className="text-end">{formatCurrency(row.asignaciones.prima_jerarquia)}</td>
                                            <td className="text-end">{formatCurrency(row.asignaciones.prima_transporte)}</td>
                                            <td className="text-end">{formatCurrency(row.asignaciones.prima_reconocimiento)}</td>
                                            <td className="text-end">{formatCurrency(row.asignaciones.prima_hogares)}</td>
                                            <td className="text-end">{formatCurrency(row.asignaciones.complemento_alimentacion)}</td>
                                            <td className="text-end">{formatCurrency(row.asignaciones.prima_hijos)}</td>
                                            <td className="text-end text-primary">{formatCurrency(getDifferenceDisplay(row, 'sueldo'))}</td>
                                            <td className="text-end text-primary">{formatCurrency(getDifferenceDisplay(row, 'antiguedad'))}</td>
                                            <td className="text-end text-primary">{formatCurrency(getDifferenceDisplay(row, 'profesionalizacion'))}</td>
                                            <td className="text-end text-primary">{formatCurrency(getDifferenceDisplay(row, 'jerarquia'))}</td>
                                            <td className="text-end">{formatCurrency(row.asignaciones.retroactivo || 0)}</td>
                                            <td className="text-end fw-bold" style={{ backgroundColor: '#f0f8ff' }}>{formatCurrency(row.asignaciones.total_asignaciones)}</td>
                                            <td className="text-end" style={{ backgroundColor: '#fffbeb' }}>{formatCurrency(row.deducciones.asignacion_mensual)}</td>
                                            <td className="text-end" style={{ backgroundColor: '#fffbeb' }}>{formatCurrency(row.deducciones.asignacion_semanal_ivss)}</td>

                                            <td className="text-end text-danger">{formatCurrency(row.deducciones.seguro_empleado)}</td>
                                            <td className="text-end text-muted">{formatCurrency(row.deducciones.seguro_patronal)}</td>
                                            <td className="text-end text-danger">{formatCurrency(row.deducciones.rpe_empleado)}</td>
                                            <td className="text-end text-muted">{formatCurrency(row.deducciones.rpe_patronal)}</td>
                                            <td className="text-end text-danger">{formatCurrency(row.deducciones.faov_empleado)}</td>
                                            <td className="text-end text-muted">{formatCurrency(row.deducciones.faov_patronal)}</td>
                                            <td className="text-end text-danger">{formatCurrency(row.deducciones.fejp)}</td>
                                            <td className="text-end text-muted">{formatCurrency(row.deducciones.fejp_patronal)}</td>
                                            <td className="text-end text-danger">{formatCurrency(row.deducciones.caja_ahorro)}</td>


                                            <td className="text-end fw-bold text-danger" style={{ backgroundColor: '#fff5f5' }}>{formatCurrency(row.deducciones.total_deducciones)}</td>

                                            <td className="text-end text-success fw-bold" style={{ backgroundColor: '#f0fff4' }}>{formatCurrency(row.salario_neto)}</td>
                                            <td className="text-center">{(row.asignaciones.porcentaje_antiguedad_nuevo * 100).toFixed(0)}%</td>
                                            <td className="text-center">{(row.asignaciones.porcentaje_antiguedad_antiguo * 100).toFixed(0)}%</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
