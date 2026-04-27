import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const NominaActivos = () => {
    const d = new Date();
    const currentMonth = d.getMonth() + 1;
    const currentYear = d.getFullYear();
    const currentQuincena = d.getDate() <= 15 ? 1 : 2;

    const [mes, setMes] = useState(currentMonth);
    const [anio, setAnio] = useState(currentYear);
    const [quincena, setQuincena] = useState(currentQuincena);
    const [nominaData, setNominaData] = useState([]);
    const [loading, setLoading] = useState(false);

    const meses = [
        { id: 1, name: 'Enero' }, { id: 2, name: 'Febrero' }, { id: 3, name: 'Marzo' },
        { id: 4, name: 'Abril' }, { id: 5, name: 'Mayo' }, { id: 6, name: 'Junio' },
        { id: 7, name: 'Julio' }, { id: 8, name: 'Agosto' }, { id: 9, name: 'Septiembre' },
        { id: 10, name: 'Octubre' }, { id: 11, name: 'Noviembre' }, { id: 12, name: 'Diciembre' }
    ];

    const generateYears = () => {
        let years = [];
        for (let i = currentYear - 5; i <= currentYear + 1; i++) {
            years.push(i);
        }
        return years;
    };

    const processNomina = async () => {
        setLoading(true);
        setNominaData([]);
        try {
            const url = new URL('/api/nomina-activos/procesar', window.location.origin);
            url.searchParams.append('mes', mes);
            url.searchParams.append('anio', anio);
            url.searchParams.append('quincena', quincena);

            const res = await fetch(url, {
                method: 'GET',
                // Si necesitas enviar credenciales/cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();

            if (data.ok) {
                setNominaData(data.datos);
                toast.success('Nómina procesada correctamente.');
            } else {
                toast.error(data.message || 'Error procesando la nómina.');
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
                            <select className="form-select" value={mes} onChange={e => setMes(e.target.value)}>
                                {meses.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Año</label>
                            <select className="form-select" value={anio} onChange={e => setAnio(e.target.value)}>
                                {generateYears().map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Quincena</label>
                            <select className="form-select" value={quincena} onChange={e => setQuincena(e.target.value)}>
                                <option value={1}>Primera (1 al 15)</option>
                                <option value={2}>Segunda (16 al Fin)</option>
                            </select>
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                            <button
                                className="btn btn-primary w-100"
                                onClick={processNomina}
                                disabled={loading}
                            >
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Procesando...</>
                                ) : (
                                    <><i className="bx bx-calculator me-1"></i> Calcular Nómina</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resultados (Tabla Expandible) */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Resultados de Nómina ({nominaData.length} Empleados)</h5>
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
                                <th className="text-end">Dif. Sueldo (Sup)</th>
                                <th className="text-end">Dif. Antigüedad (Sup)</th>
                                <th className="text-end">Dif. Prof. (Sup)</th>
                                <th className="text-end">Dif. Jerarquía (Sup)</th>
                                <th className="text-end fw-bold" style={{ backgroundColor: '#f0f8ff' }}>T. Asignaciones</th>
                                <th className="text-end">S.S.O</th>
                                <th className="text-end">R.P.E</th>
                                <th className="text-end">F.A.O.V</th>
                                <th className="text-end">F.E.J.P</th>
                                <th className="text-end">Caja Ahorros</th>
                                <th className="text-end fw-bold" style={{ backgroundColor: '#fff5f5' }}>T. Deducciones</th>
                                <th className="text-end text-success fw-bold" style={{ backgroundColor: '#f0fff4' }}>Salario Neto</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {nominaData.length === 0 ? (
                                <tr>
                                    <td colSpan="24" className="text-center py-4">
                                        No hay datos de nómina para mostrar. Haga clic en Calcular.
                                    </td>
                                </tr>
                            ) : (
                                nominaData.map((row) => (
                                    <tr key={row.empleado.cedula} className="align-middle">
                                        <td>{row.empleado.cedula}</td>
                                        <td>
                                            <div style={{ minWidth: '200px' }}>
                                                <strong>{row.empleado.nombres} {row.empleado.apellidos}</strong><br />
                                                <small className="text-muted">{row.empleado.departamento}</small>
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
                                        <td className="text-end">{row.asignaciones.diferencias_suplencia ? formatCurrency(row.asignaciones.diferencias_suplencia.sueldo) : 'Bs. 0,00'}</td>
                                        <td className="text-end">{row.asignaciones.diferencias_suplencia ? formatCurrency(row.asignaciones.diferencias_suplencia.antiguedad) : 'Bs. 0,00'}</td>
                                        <td className="text-end">{row.asignaciones.diferencias_suplencia ? formatCurrency(row.asignaciones.diferencias_suplencia.profesionalizacion) : 'Bs. 0,00'}</td>
                                        <td className="text-end">{row.asignaciones.diferencias_suplencia ? formatCurrency(row.asignaciones.diferencias_suplencia.jerarquia) : 'Bs. 0,00'}</td>
                                        <td className="text-end fw-bold" style={{ backgroundColor: '#f0f8ff' }}>{formatCurrency(row.asignaciones.total_asignaciones)}</td>

                                        <td className="text-end text-danger">{formatCurrency(row.deducciones.seguro_empleado)}</td>
                                        <td className="text-end text-danger">{formatCurrency(row.deducciones.rpe_empleado)}</td>
                                        <td className="text-end text-danger">{formatCurrency(row.deducciones.faov_empleado)}</td>
                                        <td className="text-end text-danger">{formatCurrency(row.deducciones.fejp)}</td>
                                        <td className="text-end text-danger">{formatCurrency(row.deducciones.caja_ahorro)}</td>
                                        <td className="text-end fw-bold text-danger" style={{ backgroundColor: '#fff5f5' }}>{formatCurrency(row.deducciones.total_deducciones)}</td>

                                        <td className="text-end text-success fw-bold" style={{ backgroundColor: '#f0fff4' }}>{formatCurrency(row.salario_neto)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
