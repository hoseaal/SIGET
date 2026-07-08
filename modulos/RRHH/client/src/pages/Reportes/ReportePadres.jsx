import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { exportToExcel } from '../../utils/exportExcel';

const tiposPersonal = ['Todos', 'Funcionario', 'Obrero Fijo'];

const RANGOS = [
  { key: '0-5', label: '0-5 años', color: '#696cff' },
  { key: '5-10', label: '5-10 años', color: '#71dd37' },
  { key: '10-12', label: '10-12 años', color: '#ffab00' },
  { key: '12-15', label: '12-15 años', color: '#ff6384' },
  { key: '15-18', label: '15-18 años', color: '#9966ff' },
  { key: '18-20', label: '18-20 años', color: '#03c3ec' },
  { key: '20-25', label: '20-25 años', color: '#ff9f40' },
];

const RANGO_COLORS = Object.fromEntries(RANGOS.map(r => [r.key, r.color]));

const formatFecha = (f) => {
  if (!f) return '-';
  return new Date(f + 'T00:00:00').toLocaleDateString('es-VE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

export const ReportePadres = () => {
  const [tipoPersonal, setTipoPersonal] = useState('Todos');
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState(null);
  const [activeRangos, setActiveRangos] = useState(RANGOS.map(r => r.key));

  const toggleRango = (key) => {
    setActiveRangos(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const generarReporte = async () => {
    setLoading(true);
    setReporteData(null);
    try {
      const params = new URLSearchParams();
      if (tipoPersonal !== 'Todos') params.append('tipo_personal', tipoPersonal);
      const res = await fetch(`/api/reporte-padres/generar?${params}`, {
        method: 'GET', headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok) { setReporteData(data); toast.success('Reporte generado correctamente.'); }
      else toast.error(data.error || 'Error al generar el reporte.');
    } catch (error) {
      console.error(error);
      toast.error('Error de servidor al generar el reporte.');
    } finally { setLoading(false); }
  };

  const empleadosFiltrados = reporteData?.data?.map(emp => {
    const hijosFiltrados = emp.hijos.filter(h => activeRangos.includes(h.rango));
    return { ...emp, hijos: hijosFiltrados, total_hijos: hijosFiltrados.length };
  }).filter(emp => emp.total_hijos > 0) || [];

  const totalHijosFiltrados = empleadosFiltrados.reduce((s, e) => s + e.total_hijos, 0);

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <ToastContainer />
      <h4 className="fw-bold py-3 mb-4">
        <span className="text-muted fw-light">Reportes /</span> Empleados Padres (Día del Padre/Madre)
      </h4>

      <div className="card mb-4">
        <div className="card-header border-bottom"><h5 className="card-title mb-0">Filtros del Reporte</h5></div>
        <div className="card-body mt-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Tipo de Personal</label>
              <select className="form-select" value={tipoPersonal} onChange={(e) => setTipoPersonal(e.target.value)}>
                {tiposPersonal.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100" onClick={generarReporte} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-1" />Generando...</> : <><i className="bx bx-search me-1" /> Generar Reporte</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {reporteData && (() => {
        const resumen = reporteData.resumen || {};
        const porTipo = reporteData.porTipo || [];

        const handleExportExcel = async () => {
          const exportData = empleadosFiltrados.map(emp => ({
            tipo: emp.tipo_personal === 'Obrero Fijo' ? 'Obrero' : 'Funcionario',
            cedula: emp.cedula,
            empleado: `${emp.nombres} ${emp.apellidos}`,
            cargo: emp.cargo,
            total_hijos: emp.total_hijos,
            hijos: emp.hijos.map(h => `${h.nombres} ${h.apellidos} (${h.edad}a)`).join(', '),
          }));
          await exportToExcel({
            columns: [
              { header: 'Tipo', accessor: 'tipo' },
              { header: 'Cédula', accessor: 'cedula' },
              { header: 'Empleado', accessor: 'empleado' },
              { header: 'Cargo', accessor: 'cargo' },
              { header: 'Total Hijos', accessor: 'total_hijos', align: 'right' },
              { header: 'Hijos', accessor: 'hijos' },
            ],
            data: exportData,
            title: `Empleados Padres - ${tipoPersonal}`,
            filename: `empleados_padres_${new Date().toISOString().slice(0, 10)}`,
          });
        };

        return (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card shadow-sm border-primary h-100">
                <div className="card-body text-center py-3">
                  <div className="text-muted small">Empleados con Hijos</div>
                  <h3 className="text-primary fw-bold mb-0">{resumen.total_empleados}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-success h-100">
                <div className="card-body text-center py-3">
                  <div className="text-muted small">Total Hijos</div>
                  <h3 className="text-success fw-bold mb-0">{resumen.total_hijos}</h3>
                </div>
              </div>
            </div>
            {porTipo.filter(t => t.cantidad > 0).map((tipo) => {
              const colors = { 'Funcionario': 'info', 'Obrero Fijo': 'warning', 'Jubilado': 'success', 'Pensionado': 'danger', 'Sobreviviente': 'secondary' };
              const color = colors[tipo.tipo_personal] || 'light';
              const label = tipo.tipo_personal === 'Obrero Fijo' ? 'Obreros' : tipo.tipo_personal === 'Sobreviviente' ? 'Sobrevivientes' : tipo.tipo_personal + 's';
              return (
                <div key={tipo.tipo_personal} className="col-md">
                  <div className={`card shadow-sm border-${color} h-100`}>
                    <div className="card-body text-center py-3">
                      <div className="text-muted small">{label}</div>
                      <h3 className={`text-${color} fw-bold mb-0`}>{tipo.cantidad}</h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0"><i className="bx bx-filter me-1"></i>Segmentación por Rangos de Edad</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2 mb-3">
                {RANGOS.map(r => (
                  <button key={r.key}
                    className={`btn btn-sm ${activeRangos.includes(r.key) ? '' : 'btn-outline-secondary'} ${activeRangos.includes(r.key) ? 'text-white' : ''}`}
                    style={{
                      backgroundColor: activeRangos.includes(r.key) ? r.color : 'transparent',
                      borderColor: r.color,
                      color: activeRangos.includes(r.key) ? '#fff' : r.color,
                      minWidth: '90px',
                    }}
                    onClick={() => toggleRango(r.key)}
                  >
                    {r.label}
                    {activeRangos.includes(r.key) && (
                      <span className="ms-1 badge bg-light text-dark">{reporteData.rangos.find(x => x.rango === r.key)?.cantidad || 0}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-12">
              <div className="card h-100">
                <div className="card-header">
                  <h6 className="mb-0"><i className="bx bx-bar-chart-alt me-1"></i>Hijos por Rango de Edad</h6>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm table-hover mb-0">
                    <thead className="table-light">
                      <tr><th>Rango</th><th className="text-end">Cantidad</th><th className="text-end">%</th><th>Barra</th></tr>
                    </thead>
                    <tbody>
                      {reporteData.rangos.map(r => {
                        const pct = reporteData.resumen.total_hijos > 0 ? ((r.cantidad / reporteData.resumen.total_hijos) * 100).toFixed(1) : 0;
                        return (
                          <tr key={r.rango}>
                            <td>
                              <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: RANGO_COLORS[r.rango] || '#ccc', borderRadius: 3, marginRight: 8 }}></span>
                              {r.label}
                            </td>
                            <td className="text-end fw-bold">{r.cantidad}</td>
                            <td className="text-end">{pct}%</td>
                            <td style={{ width: '40%' }}>
                              <div className="progress" style={{ height: 8 }}>
                                <div className="progress-bar" style={{ width: `${pct}%`, backgroundColor: RANGO_COLORS[r.rango] || '#ccc' }}></div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="mb-0"><i className="bx bx-user me-1"></i>Empleados Beneficiarios ({empleadosFiltrados.length} empleados, {totalHijosFiltrados} hijos)</h5>
              <div className="d-flex gap-2 align-items-center">
                <small className="text-muted">{activeRangos.length < RANGOS.length ? 'Filtro activo por rango de edad' : 'Todos los rangos'}</small>
                <button className="btn btn-outline-success btn-sm" onClick={handleExportExcel}>
                  <i className="bx bx-download me-1"></i> Exportar a Excel
                </button>
              </div>
            </div>
            <div className="table-responsive text-nowrap">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr><th>Tipo</th><th>Cédula</th><th>Empleado</th><th>Cargo</th><th className="text-center">Hijos</th><th>Hijo(s)</th></tr>
                </thead>
                <tbody className="table-border-bottom-0">
                  {empleadosFiltrados.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-4">No se encontraron empleados con hijos en los rangos seleccionados.</td></tr>
                  ) : (
                    empleadosFiltrados.map((emp) => (
                      <tr key={emp.empleado_id} className="align-middle">
                        <td><span className={`badge bg-label-${emp.tipo_personal === 'Funcionario' ? 'primary' : 'secondary'}`}>{emp.tipo_personal === 'Obrero Fijo' ? 'Obrero' : 'Funcionario'}</span></td>
                        <td>{emp.cedula}</td>
                        <td><strong>{emp.nombres} {emp.apellidos}</strong></td>
                        <td style={{ maxWidth: '200px' }}><small>{emp.cargo}</small></td>
                        <td className="text-center"><span className="badge bg-primary rounded-pill">{emp.total_hijos}</span></td>
                        <td style={{ maxWidth: '350px' }}>
                          <div className="d-flex flex-wrap gap-1">
                            {emp.hijos.map(h => (
                              <span key={h.familiar_id} className="badge bg-label-info me-1 mb-1" title={formatFecha(h.fecha_nacimiento)}
                                style={{ borderLeft: `3px solid ${RANGO_COLORS[h.rango] || '#ccc'}` }}>
                                {h.nombres} {h.apellidos} ({h.edad} a{'\u00F1'})
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
        );
      })()}
    </div>
  );
};
