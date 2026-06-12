import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { downloadExcel, downloadExcelZip } from '../../utils/exportExcel.js';
import { getBase64FromUrl } from '../../utils/imageUtils.js';
import logoCet from '../../assets/logo-cet.png';
import { ParametrosNominaCard } from '../../components/nomina/ParametrosNominaCard.jsx';
import { MESES_NOMINA, usePeriodoNomina } from '../../hooks/usePeriodoNomina.js';

export const NominaObreros = () => {
    const [quincena, setQuincena] = useState('1');
    const [nominaData, setNominaData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const meses = MESES_NOMINA;
    const { periodoNomina, setPeriodoNomina, periodoLoading, mes, anio } = usePeriodoNomina(
        '/api/nomina-obreros',
        () => toast.error('Error al obtener el periodo de nomina desde el servidor.')
    );

    const processNomina = async () => {
        setLoading(true);
        setNominaData([]);
        try {
            if (quincena === 'unificada') {
                const url1 = new URL('/api/nomina-obreros/procesar', window.location.origin);
                url1.searchParams.append('tipoNomina', 1);

                const url2 = new URL('/api/nomina-obreros/procesar', window.location.origin);
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
                const url = new URL('/api/nomina-obreros/procesar', window.location.origin);
                url.searchParams.append('tipoNomina', quincena);

                const res = await fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();

                if (data.ok) {
                    setPeriodoNomina(data.periodo);
                    setNominaData(data.datos);
                    toast.success('Nómina de obreros procesada correctamente.');
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
