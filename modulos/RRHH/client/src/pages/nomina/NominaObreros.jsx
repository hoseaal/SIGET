import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { downloadExcel, downloadExcelZip } from '../../utils/exportExcel.js';
import { getBase64FromUrl } from '../../utils/imageUtils.js';
import logoCet from '../../assets/logo-cet.png';
import { ParametrosNominaCard } from '../../components/nomina/ParametrosNominaCard.jsx';
import { MESES_NOMINA, usePeriodoNomina } from '../../hooks/usePeriodoNomina.js';
import { useAuth } from '../../hooks/useAuth.js';

const TIPO_PERSONAL = 'Obrero Fijo';

export const NominaObreros = () => {
    const { rol_id } = useAuth()
    const [quincena, setQuincena] = useState('1');
    const [nominaData, setNominaData] = useState([]);
    const [loadingCalcular, setLoadingCalcular] = useState(false);
    const [loadingCerrar, setLoadingCerrar] = useState(false);
    const [cierreExitoso, setCierreExitoso] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [cierreStatus, setCierreStatus] = useState({ q1: false, q2: false, unificada: false })
    const meses = MESES_NOMINA;
    const { periodoNomina, setPeriodoNomina, periodoLoading, mes, anio } = usePeriodoNomina(
        '/api/nomina',
        () => toast.error('Error al obtener el periodo de nomina desde el servidor.')
    );

    const isProcessingRef = useRef(false);

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
        if (mes && anio) {
            verificarCierre(mes, anio)
        }
    }, [mes, anio, verificarCierre])

    const handleTipoNominaChange = (value) => {
        setQuincena(value);
        setCierreExitoso(false);
        if (mes && anio) verificarCierre(mes, anio)
    };

    const handleCalcular = async () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        setLoadingCalcular(true);
        setNominaData([]);
        try {
            const res = await fetch('/api/nomina/calcular-en-caliente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo_personal: TIPO_PERSONAL,
                    quincena
                })
            });
            const data = await res.json();

            if (data.ok) {
                setPeriodoNomina(data.periodo);
                setNominaData(data.datos);
                toast.success('Nómina calculada correctamente (en caliente).');
            } else {
                toast.error(data.message || 'Error calculando la nómina.');
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
        const quincenaKey = quincena === 'unificada' ? 'unificada' : `q${quincena}`
        setCierreStatus(prev => ({ ...prev, [quincenaKey]: true }))
        try {
            const res = await fetch('/api/nomina/guardar-cierre', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo_personal: TIPO_PERSONAL,
                    quincena,
                    mes,
                    anio
                })
            });
            const data = await res.json();

            if (data.ok) {
                setCierreExitoso(true);
                await verificarCierre(mes, anio)
                toast.success('Nómina cerrada y guardada en base de datos correctamente.');
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
            'Prima Antigüedad': row.asignaciones.antiguedad_quincenal,
            'Prima Transporte': row.asignaciones.prima_transporte,
            'Prima Reconocimiento': row.asignaciones.prima_reconocimiento,
            'Prima Hogares': row.asignaciones.prima_hogares,
            'Comp. Alimentación': row.asignaciones.complemento_alimentacion,
            'Prima Hijos': row.asignaciones.prima_hijos,
            'Total Asignaciones': row.asignaciones.total_asignaciones,
            'Asig. Mensual IVSS': row.deducciones.asignacion_semanal_ivss,
            'SSO Empleado': row.deducciones.seguro_empleado,
            'SSO Patronal': row.deducciones.seguro_patronal,
            'RPE Empleado': row.deducciones.rpe_empleado,
            'RPE Patronal': row.deducciones.rpe_patronal,
            'FAOV Empleado': row.deducciones.faov_empleado,
            'FAOV Patronal': row.deducciones.faov_patronal,
            'Fondo Jubilación': row.deducciones.fondo_jubilacion,
            'Caja Ahorro Empleado': row.deducciones.caja_ahorro,
            'Caja Ahorro Patronal': row.deducciones.caja_ahorro_patronal,
            'Total Deducciones': row.deducciones.total_deducciones,
            'Salario Neto': row.salario_neto
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

        const summaryConfig = [
            { concepto: 'SUELDO BÁSICO QUINCENAL', key: 'Sueldo Quincenal', type: 'asignacion' },
            { concepto: 'PRIMA ANTIGÜEDAD', key: 'Prima Antigüedad', type: 'asignacion' },
            { concepto: 'PRIMA DE TRANSPORTE', key: 'Prima Transporte', type: 'asignacion' },
            { concepto: 'PRIMA DE RECONOCIMIENTO', key: 'Prima Reconocimiento', type: 'asignacion' },
            { concepto: 'PRIMA DE HOGARES', key: 'Prima Hogares', type: 'asignacion' },
            { concepto: 'COMPLEMENTO DE ALIMENTACIÓN', key: 'Comp. Alimentación', type: 'asignacion' },
            { concepto: 'PRIMA POR HIJOS', key: 'Prima Hijos', type: 'asignacion' },
            { concepto: 'SEGURO SOCIAL', key: 'SSO Empleado', type: 'deduccion' },
            { concepto: 'RÉGIMEN PRESTACIONAL DE EMPLEO', key: 'RPE Empleado', type: 'deduccion' },
            { concepto: 'FONDO DE AHORRO OBLIGATORIO PARA LA VIVIENDA', key: 'FAOV Empleado', type: 'deduccion' },
            { concepto: 'FONDO DE JUBILACIÓN', key: 'Fondo Jubilación', type: 'deduccion' },
            { concepto: 'CAJA DE AHORROS', key: 'Caja Ahorro Empleado', type: 'deduccion' }
        ];

        if (nominaData.isUnificada) {
            const files = [
                {
                    data: buildExportData(nominaData.q1),
                    fileName: `Nomina_Obreros_${mesNombre}_${anio}_Q1.xlsx`,
                    sheetName: 'Nómina Q1',
                    summaryConfig,
                    auditMetadata
                },
                {
                    data: buildExportData(nominaData.q2),
                    fileName: `Nomina_Obreros_${mesNombre}_${anio}_Q2.xlsx`,
                    sheetName: 'Nómina Q2',
                    summaryConfig,
                    auditMetadata
                }
            ];
            await downloadExcelZip(files, `Nomina_Obreros_${mesNombre}_${anio}_Unificada.zip`, logoBase64);
        } else {
            const dataToExport = buildExportData(nominaData);
            const fileName = `Nomina_Obreros_${mesNombre}_${anio}_Q${quincena}`;
            downloadExcel(dataToExport, fileName, 'Nómina Obreros', logoBase64, summaryConfig, auditMetadata);
        }
    };

    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <ToastContainer />
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Nómina /</span> Obreros Fijos
            </h4>
            <ParametrosNominaCard
                mes={mes}
                anio={anio}
                tipoNomina={quincena}
                onTipoNominaChange={handleTipoNominaChange}
                onCalcular={handleCalcular}
                onCerrar={handleCerrar}
                loadingCalcular={loadingCalcular}
                loadingCerrar={loadingCerrar}
                periodoLoading={periodoLoading}
                periodoDisponible={Boolean(periodoNomina)}
                cierreExitoso={cierreExitoso}
                userRolId={rol_id}
                cierreStatus={cierreStatus}
            />

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
                        })()} Obreros)
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
                                <th className="text-end">Sueldo Quin.</th>
                                <th className="text-end">P. Antigüedad</th>
                                <th className="text-end">P. Transporte</th>
                                <th className="text-end">P. Reconocim.</th>
                                <th className="text-end">P. Hogares</th>
                                <th className="text-end">Comp. Alim.</th>
                                <th className="text-end">P. Hijos</th>
                                <th className="text-end fw-bold" style={{ backgroundColor: '#f0f8ff' }}>T. Asignaciones</th>
                                <th className="text-end" style={{ backgroundColor: '#fffbeb' }}>Asig. Semanal<br />IVSS</th>
                                <th className="text-end">SSO<br />Emp.</th>
                                <th className="text-end text-muted">SSO<br />Pat.</th>
                                <th className="text-end">RPE<br />Emp.</th>
                                <th className="text-end text-muted">RPE<br />Pat.</th>
                                <th className="text-end">FAOV<br />Emp.</th>
                                <th className="text-end text-muted">FAOV<br />Pat.</th>
                                <th className="text-end">Fondo<br />Jubilación</th>
                                <th className="text-end">Caja Ahorro<br />Emp.</th>
                                <th className="text-end text-muted">Caja Ahorro<br />Pat.</th>
                                <th className="text-end fw-bold" style={{ backgroundColor: '#fff5f5' }}>T. Deducciones</th>
                                <th className="text-end text-success fw-bold" style={{ backgroundColor: '#f0fff4' }}>Salario Neto</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {nominaData.length === 0 ? (
                                <tr>
                                    <td colSpan="22" className="text-center py-4">
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
                                        <td className="text-end">{formatCurrency(row.asignaciones.sueldo_quincenal)}</td>
                                        <td className="text-end">{formatCurrency(row.asignaciones.antiguedad_quincenal)}</td>
                                        <td className="text-end">{formatCurrency(row.asignaciones.prima_transporte)}</td>
                                        <td className="text-end">{formatCurrency(row.asignaciones.prima_reconocimiento)}</td>
                                        <td className="text-end">{formatCurrency(row.asignaciones.prima_hogares)}</td>
                                        <td className="text-end">{formatCurrency(row.asignaciones.complemento_alimentacion)}</td>
                                        <td className="text-end">{formatCurrency(row.asignaciones.prima_hijos)}</td>
                                        <td className="text-end fw-bold" style={{ backgroundColor: '#f0f8ff' }}>{formatCurrency(row.asignaciones.total_asignaciones)}</td>
                                        <td className="text-end" style={{ backgroundColor: '#fffbeb' }}>{formatCurrency(row.deducciones.asignacion_semanal_ivss)}</td>

                                        <td className="text-end text-danger">{formatCurrency(row.deducciones.seguro_empleado)}</td>
                                        <td className="text-end text-muted">{formatCurrency(row.deducciones.seguro_patronal)}</td>
                                        <td className="text-end text-danger">{formatCurrency(row.deducciones.rpe_empleado)}</td>
                                        <td className="text-end text-muted">{formatCurrency(row.deducciones.rpe_patronal)}</td>
                                        <td className="text-end text-danger">{formatCurrency(row.deducciones.faov_empleado)}</td>
                                        <td className="text-end text-muted">{formatCurrency(row.deducciones.faov_patronal)}</td>
                                        <td className="text-end text-danger">{formatCurrency(row.deducciones.fondo_jubilacion)}</td>
                                        <td className="text-end text-danger">{formatCurrency(row.deducciones.caja_ahorro)}</td>
                                        <td className="text-end text-muted">{formatCurrency(row.deducciones.caja_ahorro_patronal)}</td>

                                        <td className="text-end fw-bold text-danger" style={{ backgroundColor: '#fff5f5' }}>{formatCurrency(row.deducciones.total_deducciones)}</td>
                                        <td className="text-end text-success fw-bold" style={{ backgroundColor: '#f0fff4' }}>{formatCurrency(row.salario_neto)}</td>
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
