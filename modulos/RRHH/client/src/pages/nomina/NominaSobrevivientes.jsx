import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { downloadExcel, downloadExcelZip } from '../../utils/exportExcel.js';
import { getBase64FromUrl } from '../../utils/imageUtils.js';
import logoCet from '../../assets/logo-cet.png';
import { ParametrosNominaCard } from '../../components/nomina/ParametrosNominaCard.jsx';
import { MESES_NOMINA, usePeriodoNomina } from '../../hooks/usePeriodoNomina.js';
import { useAuth } from '../../hooks/useAuth.js';

const TIPO_PERSONAL = 'Sobreviviente';

export const NominaSobrevivientes = () => {
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
        try {
            if (quincena === 'unificada') {
                const res = await fetch('/api/rrhh/nomina/calcular-en-caliente', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tipo_personal: TIPO_PERSONAL, quincena: 'unificada' })
                });
                const data = await res.json();
                if (res.ok) {
                    setNominaData({ isUnificada: true, q1: data.datos.q1, q2: data.datos.q2 });
                    toast.success('Nómina unificada calculada correctamente (en caliente).');
                } else {
                    toast.error(data.message || 'Error calculando la nómina unificada.');
                }
            } else {
                const res = await fetch('/api/rrhh/nomina/calcular-en-caliente', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tipo_personal: TIPO_PERSONAL, quincena: parseInt(quincena, 10) })
                });
                const data = await res.json();
                if (res.ok) {
                    setNominaData(data.datos);
                    toast.success('Nómina de sobrevivientes calculada correctamente (en caliente).');
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
            if (res.ok) {
                setCierreExitoso(true);
                await verificarCierre(mes, anio)
                toast.success('Nómina guardada y cerrada correctamente.');
            } else {
                setCierreStatus(prev => ({ ...prev, [quincenaKey]: false }))
                toast.error(data.message || 'Error al guardar y cerrar la nómina.');
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-VE');
    };

    const buildExportData = (dataArray) => {
        return dataArray.map(row => ({
            'Cédula Sobreviviente': row.familiar_cedula,
            'Nombre Sobreviviente': row.familiar_nombre_completo,
            'Cédula Causante': row.empleado_cedula,
            'Nombre Causante': row.empleado_nombre,
            'Inicio Beneficio': formatDate(row.fecha_inicio_beneficio),
            'Pensión Base': row.pension_base,
            'Pensión Sobreviviente': row.pension_sobreviviente,
            'Prima Mej. Económico': row.prima_mejoramiento_economico,
            'Total Asignaciones': row.total_asignaciones,
            'Total Deducciones': row.total_deducciones,
            'Neto a Cobrar': row.neto_a_cobrar
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
            { concepto: 'PENSIÓN BASE', key: 'Pensión Base', type: 'asignacion' },
            { concepto: 'PENSIÓN SOBREVIVIENTE', key: 'Pensión Sobreviviente', type: 'asignacion' },
            { concepto: 'PRIMA MEJ. ECONÓMICO', key: 'Prima Mej. Económico', type: 'asignacion' }
        ];

        if (nominaData.isUnificada) {
            const files = [
                {
                    data: buildExportData(nominaData.q1),
                    fileName: `Nomina_Sobrevivientes_${mesNombre}_${anio}_Q1.xlsx`,
                    sheetName: 'Nómina Q1',
                    summaryConfig,
                    auditMetadata
                },
                {
                    data: buildExportData(nominaData.q2),
                    fileName: `Nomina_Sobrevivientes_${mesNombre}_${anio}_Q2.xlsx`,
                    sheetName: 'Nómina Q2',
                    summaryConfig,
                    auditMetadata
                }
            ];
            await downloadExcelZip(files, `Nomina_Sobrevivientes_${mesNombre}_${anio}_Unificada.zip`, logoBase64);
        } else {
            const dataToExport = buildExportData(nominaData);
            downloadExcel(dataToExport, `Nomina_Sobrevivientes_${mesNombre}_${anio}_Q${quincena}.xlsx`, 'Nómina Sobrevivientes', logoBase64, summaryConfig, auditMetadata);
        }
    };

    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <ToastContainer />
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Nómina /</span> Sobrevivientes
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
                                placeholder="Buscar por cédula o nombre del sobreviviente / causante..."
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
                            return nominaData.filter(row => (
                                row.familiar_cedula?.toLowerCase().includes(term) ||
                                row.familiar_nombre_completo?.toLowerCase().includes(term) ||
                                row.empleado_cedula?.toLowerCase().includes(term) ||
                                row.empleado_nombre?.toLowerCase().includes(term)
                            )).length;
                        })()} Sobrevivientes)
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
                                <th>Familiar</th>
                                <th>Jubilado</th>
                                <th>Inicio</th>
                                <th className="text-end">P. Base</th>
                                <th className="text-end">P. Sobrev.</th>
                                <th className="text-end">P. Mej. Ec.</th>
                                <th className="text-end fw-bold" style={{ backgroundColor: '#f0f8ff' }}>T. Asignaciones</th>
                                <th className="text-end fw-bold text-danger" style={{ backgroundColor: '#fff5f5' }}>T. Deducciones</th>
                                <th className="text-end text-success fw-bold" style={{ backgroundColor: '#f0fff4' }}>Neto</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {nominaData.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">
                                        No hay datos de nómina para mostrar. Haga clic en Calcular.
                                    </td>
                                </tr>
                            ) : (
                                nominaData.filter(row => {
                                    const term = searchTerm.toLowerCase();
                                    if (!term) return true;
                                    return (
                                        row.familiar_cedula?.toLowerCase().includes(term) ||
                                        row.familiar_nombre_completo?.toLowerCase().includes(term) ||
                                        row.empleado_cedula?.toLowerCase().includes(term) ||
                                        row.empleado_nombre?.toLowerCase().includes(term)
                                    );
                                }).map((row, index) => (
                                    <tr key={index} className="align-middle">
                                        <td>
                                            <div style={{ minWidth: '180px' }}>
                                                <strong>{row.familiar_nombre_completo}</strong><br />
                                                <small className="text-muted">C.I: {row.familiar_cedula}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ minWidth: '180px' }}>
                                                <strong>{row.empleado_nombre}</strong><br />
                                                <small className="text-muted">C.I: {row.empleado_cedula}</small>
                                            </div>
                                        </td>
                                        <td>{formatDate(row.fecha_inicio_beneficio)}</td>
                                        <td className="text-end">{formatCurrency(row.pension_base)}</td>
                                        <td className="text-end">{formatCurrency(row.pension_sobreviviente)}</td>
                                        <td className="text-end">{formatCurrency(row.prima_mejoramiento_economico)}</td>
                                        <td className="text-end fw-bold" style={{ backgroundColor: '#f0f8ff' }}>{formatCurrency(row.total_asignaciones)}</td>
                                        <td className="text-end fw-bold text-danger" style={{ backgroundColor: '#fff5f5' }}>{formatCurrency(row.total_deducciones)}</td>
                                        <td className="text-end text-success fw-bold" style={{ backgroundColor: '#f0fff4' }}>{formatCurrency(row.neto_a_cobrar)}</td>
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
