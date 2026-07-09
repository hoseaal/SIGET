import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { downloadExcel, downloadExcelZip } from '../../utils/exportExcel.js';
import { getBase64FromUrl } from '../../utils/imageUtils.js';
import logoCet from '../../assets/logo-cet.png';
import { ParametrosNominaCard } from '../../components/nomina/ParametrosNominaCard.jsx';
import { MESES_NOMINA, usePeriodoNomina } from '../../hooks/usePeriodoNomina.js';
import { useAuth } from '../../hooks/useAuth.js';

const TIPO_PERSONAL = 'Jubilado';

export const NominaJubilados = () => {
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
        '/api/rrhh/nomina',
        () => toast.error('Error al obtener el periodo de nomina desde el servidor.')
    );

    const isProcessingRef = useRef(false);

    const verificarCierre = useCallback(async (mes, anio) => {
        if (!mes || !anio) return
        try {
            const [resQ1, resQ2] = await Promise.all([
                fetch(`/api/rrhh/nomina/verificar-cierre?mes=${mes}&anio=${anio}&quincena=1&tipo_personal=${TIPO_PERSONAL}`),
                fetch(`/api/rrhh/nomina/verificar-cierre?mes=${mes}&anio=${anio}&quincena=2&tipo_personal=${TIPO_PERSONAL}`)
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
        setCierreExitoso(false);
        try {
            if (quincena === 'unificada') {
                const body = { tipo_personal: TIPO_PERSONAL };

                const [res1, res2] = await Promise.all([
                    fetch('/api/rrhh/nomina/calcular-en-caliente', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...body, quincena: 1 })
                    }),
                    fetch('/api/rrhh/nomina/calcular-en-caliente', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...body, quincena: 2 })
                    })
                ]);

                const data1 = await res1.json();
                const data2 = await res2.json();

                if (!data1.ok) {
                    toast.error(data1.message || 'Error procesando la primera quincena.');
                }
                if (!data2.ok) {
                    toast.error(data2.message || 'Error procesando la segunda quincena.');
                }
                if (data1.ok && data2.ok) {
                    setNominaData({ isUnificada: true, q1: data1.datos, q2: data2.datos });
                    toast.success('Nómina unificada calculada correctamente.');
                }
            } else {
                const res = await fetch('/api/rrhh/nomina/calcular-en-caliente', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo_personal: TIPO_PERSONAL, quincena: quincena === 'unificada' ? 'unificada' : Number(quincena) })
            });
            const data = await res.json();

            if (data.ok) {
                setNominaData(data.datos);
                toast.success('Nómina de jubilados calculada correctamente.');
                } else {
                    toast.error(data.message || 'Error calculando la nómina.');
                }
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
            const res = await fetch('/api/rrhh/nomina/guardar-cierre', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo_personal: TIPO_PERSONAL, quincena, mes, anio })
            });
            const data = await res.json();

            if (data.ok) {
                setCierreExitoso(true);
                await verificarCierre(mes, anio)
                toast.success('Nómina guardada y cerrada correctamente.');
            } else {
                setCierreStatus(prev => ({ ...prev, [quincenaKey]: false }))
                toast.error(data.message || 'Error al guardar la nómina.');
            }
        } catch (error) {
            setCierreStatus(prev => ({ ...prev, [quincenaKey]: false }))
            console.error(error);
            toast.error('Error de servidor al guardar nómina.');
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
            'Cédula': row.cedula,
            'Nombre Completo': row.nombre_completo,
            'Cargo': row.cargo,
            'Ubicación': row.ubicacion,
            'Sueldo Base': row.sueldo_base,
            '% Jubilación': row.pct_jub + '%',
            '% Antigüedad': row.pct_ant + '%',
            'Pensión Quincenal': row.pension_quincenal,
            'Antigüedad Quincenal': row.antiguedad_quincenal,
            'Prima Prof.': row.prima_profesionalizacion,
            'Total Asignaciones': row.total_asignaciones,
            'Caja Ahorro Emp.': row.caja_ahorro_empleado,
            'Caja Ahorro Patr.': row.caja_ahorro_patrono,
            'Total Deducciones': row.total_deducciones,
            'Sueldo Neto': row.sueldo_neto
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
            { concepto: 'PENSIÓN QUINCENAL', key: 'Pensión Quincenal', type: 'asignacion' },
            { concepto: 'ANTIGÜEDAD QUINCENAL', key: 'Antigüedad Quincenal', type: 'asignacion' },
            { concepto: 'PRIMA PROFESIONALIZACIÓN', key: 'Prima Prof.', type: 'asignacion' },
            { concepto: 'CAJA DE AHORROS', key: 'Caja Ahorro Emp.', type: 'deduccion' }
        ];

        if (nominaData.isUnificada) {
            const files = [
                {
                    data: buildExportData(nominaData.q1),
                    fileName: `Nomina_Jubilados_${mesNombre}_${anio}_Q1.xlsx`,
                    sheetName: 'Nómina Q1',
                    summaryConfig,
                    auditMetadata
                },
                {
                    data: buildExportData(nominaData.q2),
                    fileName: `Nomina_Jubilados_${mesNombre}_${anio}_Q2.xlsx`,
                    sheetName: 'Nómina Q2',
                    summaryConfig,
                    auditMetadata
                }
            ];
            await downloadExcelZip(files, `Nomina_Jubilados_${mesNombre}_${anio}_Unificada.zip`, logoBase64);
        } else {
            const dataToExport = buildExportData(nominaData);
            downloadExcel(dataToExport, `Nomina_Jubilados_${mesNombre}_${anio}_Q${quincena}.xlsx`, 'Nómina Jubilados', logoBase64, summaryConfig, auditMetadata);
        }
    };

    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <ToastContainer />
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Nómina /</span> Jubilados
            </h4>

            {/* Filtros */}
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

            {/* Buscador dinámico */}
            {!nominaData.isUnificada && nominaData.length > 0 && (
                <div className="card mb-4">
                    <div className="card-body py-3">
                        <div className="input-group">
                            <span className="input-group-text"><i className="bx bx-search"></i></span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por cédula, nombre, cargo o ubicación..."
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

            {/* Resultados */}
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
                                return (
                                    row.cedula?.toLowerCase().includes(term) ||
                                    row.nombre_completo?.toLowerCase().includes(term) ||
                                    row.cargo?.toLowerCase().includes(term) ||
                                    row.ubicacion?.toLowerCase().includes(term)
                                );
                            }).length;
                        })()} Jubilados)
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
                                <th className="text-center">% Jub / % Ant</th>
                                <th className="text-end">Pensión Quin.</th>
                                <th className="text-end">Antigüedad</th>
                                <th className="text-end">Prima Prof.</th>
                                <th className="text-end fw-bold" style={{ backgroundColor: '#f0f8ff' }}>T. Asignaciones</th>
                                <th className="text-end text-danger">Caja Ahorro</th>
                                <th className="text-end fw-bold text-danger" style={{ backgroundColor: '#fff5f5' }}>T. Deducciones</th>
                                <th className="text-end text-success fw-bold" style={{ backgroundColor: '#f0fff4' }}>Salario Neto</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {nominaData.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center py-4">
                                        No hay datos de nómina para mostrar. Haga clic en Calcular.
                                    </td>
                                </tr>
                            ) : (
                                nominaData.filter(row => {
                                    const term = searchTerm.toLowerCase();
                                    if (!term) return true;
                                    return (
                                        row.cedula?.toLowerCase().includes(term) ||
                                        row.nombre_completo?.toLowerCase().includes(term) ||
                                        row.cargo?.toLowerCase().includes(term) ||
                                        row.ubicacion?.toLowerCase().includes(term)
                                    );
                                }).map((row) => (
                                    <tr key={row.cedula} className="align-middle">
                                        <td>{row.cedula}</td>
                                        <td>
                                            <div style={{ minWidth: '200px' }}>
                                                <strong>{row.nombre_completo}</strong><br />
                                                <small className="text-muted">{row.cargo}</small>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge bg-label-info">{row.pct_jub}%</span> / <span className="badge bg-label-secondary">{row.pct_ant}%</span>
                                        </td>
                                        <td className="text-end">{formatCurrency(row.pension_quincenal)}</td>
                                        <td className="text-end">{formatCurrency(row.antiguedad_quincenal)}</td>
                                        <td className="text-end">{formatCurrency(row.prima_profesionalizacion)}</td>
                                        <td className="text-end fw-bold" style={{ backgroundColor: '#f0f8ff' }}>{formatCurrency(row.total_asignaciones)}</td>
                                        <td className="text-end text-danger">{formatCurrency(row.caja_ahorro_empleado)}</td>
                                        <td className="text-end fw-bold text-danger" style={{ backgroundColor: '#fff5f5' }}>{formatCurrency(row.total_deducciones)}</td>
                                        <td className="text-end text-success fw-bold" style={{ backgroundColor: '#f0fff4' }}>{formatCurrency(row.sueldo_neto)}</td>
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
