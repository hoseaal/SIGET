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
    
    // Función para manejar la visibilidad de los detalles
    const [expandedRows, setExpandedRows] = useState({});

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
        setExpandedRows({});
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

    const toggleRow = (cedula) => {
        setExpandedRows(prev => ({
            ...prev,
            [cedula]: !prev[cedula]
        }));
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
                                <th></th>
                                <th>Cédula</th>
                                <th>Nombres y Apellidos</th>
                                <th>Cargo</th>
                                <th className="text-end">T. Asignaciones</th>
                                <th className="text-end">T. Deducciones</th>
                                <th className="text-end text-success">Salario Neto</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {nominaData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        No hay datos de nómina para mostrar. Haga clic en Calcular.
                                    </td>
                                </tr>
                            ) : (
                                nominaData.map((row) => (
                                    <React.Fragment key={row.empleado.cedula}>
                                        <tr 
                                            onClick={() => toggleRow(row.empleado.cedula)} 
                                            style={{ cursor: 'pointer' }}
                                            className={expandedRows[row.empleado.cedula] ? "table-active" : ""}
                                        >
                                            <td>
                                                <i className={`bx ${expandedRows[row.empleado.cedula] ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
                                            </td>
                                            <td>{row.empleado.cedula}</td>
                                            <td>
                                                <strong>{row.empleado.nombres} {row.empleado.apellidos}</strong><br/>
                                                <small className="text-muted">{row.empleado.departamento}</small>
                                            </td>
                                            <td>{row.empleado.cargo_cet}</td>
                                            <td className="text-end">{formatCurrency(row.asignaciones.total_asignaciones)}</td>
                                            <td className="text-end">{formatCurrency(row.deducciones.total_deducciones)}</td>
                                            <td className="text-end text-success fw-bold">{formatCurrency(row.salario_neto)}</td>
                                        </tr>
                                        {expandedRows[row.empleado.cedula] && (
                                            <tr>
                                                <td colSpan="7" className="p-0">
                                                    <div className="bg-light p-4 border-bottom">
                                                        <div className="row">
                                                            <div className="col-md-6 border-end">
                                                                <h6 className="text-primary text-uppercase mb-3"><i className="bx bx-plus-circle me-2"></i>Detalle de Asignaciones</h6>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>Sueldo Quincenal:</span>
                                                                    <strong>{formatCurrency(row.asignaciones.sueldo_quincenal)}</strong>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>Antigüedad:</span>
                                                                    <strong>{formatCurrency(row.asignaciones.antiguedad_quincenal)}</strong>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>Profesionalización:</span>
                                                                    <strong>{formatCurrency(row.asignaciones.profesionalizacion)}</strong>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>Prima de Jerarquía:</span>
                                                                    <strong>{formatCurrency(row.asignaciones.prima_jerarquia)}</strong>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>Prima de Transporte:</span>
                                                                    <strong>{formatCurrency(row.asignaciones.prima_transporte)}</strong>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>Prima de Reconocimiento:</span>
                                                                    <strong>{formatCurrency(row.asignaciones.prima_reconocimiento)}</strong>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>Prima de Hogares:</span>
                                                                    <strong>{formatCurrency(row.asignaciones.prima_hogares)}</strong>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>Comp. Alimentación:</span>
                                                                    <strong>{formatCurrency(row.asignaciones.complemento_alimentacion)}</strong>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>Prima por Hijos:</span>
                                                                    <strong>{formatCurrency(row.asignaciones.prima_hijos)}</strong>
                                                                </div>
                                                                {row.asignaciones.diferencias_suplencia && (
                                                                    <div className="mt-2 pt-2 border-top">
                                                                        <small className="text-muted d-block mb-1">DIFERENCIAS POR SUPLENCIA</small>
                                                                        <div className="d-flex justify-content-between mb-1">
                                                                            <span>Dif. Sueldo:</span>
                                                                            <strong>{formatCurrency(row.asignaciones.diferencias_suplencia.sueldo)}</strong>
                                                                        </div>
                                                                        <div className="d-flex justify-content-between mb-1">
                                                                            <span>Dif. Antigüedad:</span>
                                                                            <strong>{formatCurrency(row.asignaciones.diferencias_suplencia.antiguedad)}</strong>
                                                                        </div>
                                                                        <div className="d-flex justify-content-between mb-1">
                                                                            <span>Dif. Profesionalización:</span>
                                                                            <strong>{formatCurrency(row.asignaciones.diferencias_suplencia.profesionalizacion)}</strong>
                                                                        </div>
                                                                        <div className="d-flex justify-content-between mb-1">
                                                                            <span>Dif. Jerarquía:</span>
                                                                            <strong>{formatCurrency(row.asignaciones.diferencias_suplencia.jerarquia)}</strong>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="col-md-6 ps-4">
                                                                <h6 className="text-danger text-uppercase mb-3"><i className="bx bx-minus-circle me-2"></i>Detalle de Deducciones</h6>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>S.S.O (Seguro Social):</span>
                                                                    <strong>{formatCurrency(row.deducciones.seguro_empleado)}</strong>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>R.P.E (Régimen Prestacional):</span>
                                                                    <strong>{formatCurrency(row.deducciones.rpe_empleado)}</strong>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>F.A.O.V:</span>
                                                                    <strong>{formatCurrency(row.deducciones.faov_empleado)}</strong>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>F.E.J.P:</span>
                                                                    <strong>{formatCurrency(row.deducciones.fejp)}</strong>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span>Caja de Ahorros:</span>
                                                                    <strong>{formatCurrency(row.deducciones.caja_ahorro)}</strong>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
