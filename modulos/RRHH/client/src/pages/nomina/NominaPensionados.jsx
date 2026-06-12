import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { downloadExcel, downloadExcelZip } from '../../utils/exportExcel.js';
import { getBase64FromUrl } from '../../utils/imageUtils.js';
import logoCet from '../../assets/logo-cet.png';
import { ParametrosNominaCard } from '../../components/nomina/ParametrosNominaCard.jsx';
import { MESES_NOMINA, usePeriodoNomina } from '../../hooks/usePeriodoNomina.js';

export const NominaPensionados = () => {
    const [quincena, setQuincena] = useState('1');
    const [nominaData, setNominaData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const meses = MESES_NOMINA;
    const { periodoNomina, setPeriodoNomina, periodoLoading, mes, anio } = usePeriodoNomina(
        '/api/nomina-pensionados',
        () => toast.error('Error al obtener el periodo de nomina desde el servidor.')
    );

    const processNomina = async () => {
        setLoading(true);
        setNominaData([]);
        try {
            if (quincena === 'unificada') {
                const url1 = new URL('/api/nomina-pensionados/procesar', window.location.origin);
                url1.searchParams.append('tipoNomina', 1);

                const url2 = new URL('/api/nomina-pensionados/procesar', window.location.origin);
                url2.searchParams.append('tipoNomina', 2);

                const [res1, res2] = await Promise.all([
                    fetch(url1, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
                    fetch(url2, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
                ]);

                const data1 = await res1.json();
                const data2 = await res2.json();

                if (data1.ok && data2.ok) {
                    setPeriodoNomina(data1.periodo);
                    setNominaData({ isUnificada: true, q1: data1.datos, q2: data2.datos });
                    toast.success('Nómina unificada procesada correctamente.');
                } else {
                    toast.error('Error procesando la nómina unificada.');
                }
            } else {
                const url = new URL('/api/nomina-pensionados/procesar', window.location.origin);
                url.searchParams.append('tipoNomina', quincena);

                const res = await fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();

                if (data.ok) {
                    setPeriodoNomina(data.periodo);
                    setNominaData(data.datos);
                    toast.success('Nómina de pensionados procesada correctamente.');
                } else {
                    toast.error(data.message || 'Error procesando la nómina.');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de servidor al procesar nómina.');
        } finally {
            setLoading(false);
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
            'Pensión Base': row.pension,
            'Pensión Incapacidad': row.pension_incapacidad,
            'Total Asignaciones': row.total_asignaciones,
            'Caja Ahorro Emp.': row.caja_aporte_empleado_patrono,
            'Caja Ahorro Patr.': row.caja_aporte_empleado_patrono,
            'Total Deducciones': row.total_deducciones,
            'Neto a Cobrar': row.sueldo_neto
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
            { concepto: 'PENSIÓN POR INCAPACIDAD', key: 'Pensión Incapacidad', type: 'asignacion' },
            { concepto: 'CAJA DE AHORROS', key: 'Caja Ahorro Emp.', type: 'deduccion' }
        ];

        if (nominaData.isUnificada) {
            const files = [
                {
                    data: buildExportData(nominaData.q1),
                    fileName: `Nomina_Pensionados_${mesNombre}_${anio}_Q1.xlsx`,
                    sheetName: 'Nómina Q1',
                    summaryConfig,
                    auditMetadata
                },
                {
                    data: buildExportData(nominaData.q2),
                    fileName: `Nomina_Pensionados_${mesNombre}_${anio}_Q2.xlsx`,
                    sheetName: 'Nómina Q2',
                    summaryConfig,
                    auditMetadata
                }
            ];
            await downloadExcelZip(files, `Nomina_Pensionados_${mesNombre}_${anio}_Unificada.zip`, logoBase64);
        } else {
            const dataToExport = buildExportData(nominaData);
            downloadExcel(dataToExport, `Nomina_Pensionados_${mesNombre}_${anio}_Q${quincena}.xlsx`, 'Nómina Pensionados', logoBase64, summaryConfig, auditMetadata);
        }
    };

    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <ToastContainer />
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Nómina /</span> Pensionados
            </h4>

            {/* Filtros */}
            <ParametrosNominaCard
                mes={mes}
                anio={anio}
                tipoNomina={quincena}
                onTipoNominaChange={setQuincena}
                onProcesar={processNomina}
                loading={loading}
                periodoLoading={periodoLoading}
                periodoDisponible={Boolean(periodoNomina)}
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
                                placeholder="Buscar por cédula, nombre o cargo..."
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
                                row.cedula?.toLowerCase().includes(term) ||
                                row.nombre_completo?.toLowerCase().includes(term) ||
                                row.cargo?.toLowerCase().includes(term)
                            )).length;
                        })()} Pensionados)
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
                                <th className="text-end">Pensión Base</th>
                                <th className="text-end">P. Incapacidad</th>
                                <th className="text-end fw-bold" style={{ backgroundColor: '#f0f8ff' }}>T. Asignaciones</th>
                                <th className="text-end text-danger">Caja Ahorro Empleado y Patronal</th>
                                <th className="text-end fw-bold text-danger" style={{ backgroundColor: '#fff5f5' }}>T. Deducciones</th>
                                <th className="text-end text-success fw-bold" style={{ backgroundColor: '#f0fff4' }}>Neto</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {nominaData.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
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
                                        row.cargo?.toLowerCase().includes(term)
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
                                        <td className="text-end">{formatCurrency(row.pension)}</td>
                                        <td className="text-end">{formatCurrency(row.pension_incapacidad)}</td>
                                        <td className="text-end fw-bold" style={{ backgroundColor: '#f0f8ff' }}>{formatCurrency(row.total_asignaciones)}</td>
                                        <td className="text-end text-danger">{formatCurrency(row.caja_aporte_empleado_patrono)}</td>
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
