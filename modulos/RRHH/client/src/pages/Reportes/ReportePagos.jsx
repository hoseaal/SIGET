import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReportTable } from '../../components/ReportTable';

const meses = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: new Date(2000, i).toLocaleString('es', { month: 'long' }) }));
const anios = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

const formatCurrency = (v) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(v);

const columns = [
  { header: 'Cédula', accessor: 'cedula' },
  { header: 'Nombres y Apellidos', accessor: 'nombre_completo' },
  { header: 'Cargo', accessor: 'cargo' },
  { header: 'Tipo Personal', accessor: 'tipo_personal' },
  { header: 'Asignaciones', accessor: 'total_asignaciones', align: 'right', render: (r) => formatCurrency(r.total_asignaciones) },
  { header: 'Deducciones', accessor: 'total_deducciones', align: 'right', render: (r) => formatCurrency(r.total_deducciones) },
  { header: 'Neto', accessor: 'neto', align: 'right', render: (r) => <strong>{formatCurrency(r.neto)}</strong> },
];

const excelColumns = [
  { header: 'Cédula', accessor: 'cedula' },
  { header: 'Nombre Completo', accessor: 'nombre_completo' },
  { header: 'Cargo', accessor: 'cargo' },
  { header: 'Tipo Personal', accessor: 'tipo_personal' },
  { header: 'Total Asignaciones', accessor: 'total_asignaciones', type: 'currency' },
  { header: 'Total Deducciones', accessor: 'total_deducciones', type: 'currency' },
  { header: 'Neto a Pagar', accessor: 'neto', type: 'currency' },
];

export const ReportePagos = () => {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [quincena, setQuincena] = useState(1);
  const [tipoPersonal, setTipoPersonal] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState(null);

  const generarReporte = async () => {
    setLoading(true);
    setReporteData(null);
    try {
      const params = new URLSearchParams({ mes, anio, quincena, tipo_personal: tipoPersonal });
      const res = await fetch(`/api/reporte-pagos/generar?${params}`);
      const data = await res.json();
      if (data.ok) { setReporteData(data); toast.success('Reporte generado.'); }
      else toast.error(data.error || 'Error al generar el reporte.');
    } catch { toast.error('Error de servidor.'); } finally { setLoading(false); }
  };

  const filtered = (reporteData?.data || []).filter(r => {
    if (tipoPersonal !== 'Todos' && r.tipo_personal !== tipoPersonal) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return [r.cedula, r.nombre_completo, r.cargo, r.tipo_personal].some(v => v?.toLowerCase().includes(q));
  });

  const resumen = reporteData?.resumen;

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <ToastContainer />
      <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Reportes /</span> Pagos</h4>

      <div className="card mb-4">
        <div className="card-header border-bottom"><h5 className="card-title mb-0">Filtros</h5></div>
        <div className="card-body mt-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-2">
              <label className="form-label">Mes</label>
              <select className="form-select" value={mes} onChange={e => setMes(Number(e.target.value))}>
                {meses.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Año</label>
              <select className="form-select" value={anio} onChange={e => setAnio(Number(e.target.value))}>
                {anios.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Quincena</label>
              <select className="form-select" value={quincena} onChange={e => setQuincena(Number(e.target.value))}>
                <option value={1}>Primera</option><option value={2}>Segunda</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={generarReporte} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-1" />Generando...</> : <><i className="bx bx-search me-1" />Generar</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {resumen && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card"><div className="card-body text-center py-3"><h6 className="text-muted">Empleados</h6><h4 className="fw-bold mb-0">{resumen.total_empleados}</h4></div></div>
            </div>
            <div className="col-md-3">
              <div className="card"><div className="card-body text-center py-3"><h6 className="text-muted">Total Asignaciones</h6><h4 className="fw-bold mb-0 text-success">{formatCurrency(resumen.total_asignaciones)}</h4></div></div>
            </div>
            <div className="col-md-3">
              <div className="card"><div className="card-body text-center py-3"><h6 className="text-muted">Total Deducciones</h6><h4 className="fw-bold mb-0 text-danger">{formatCurrency(resumen.total_deducciones)}</h4></div></div>
            </div>
            <div className="col-md-3">
              <div className="card"><div className="card-body text-center py-3"><h6 className="text-muted">Total Neto</h6><h4 className="fw-bold mb-0 text-primary">{formatCurrency(resumen.total_neto)}</h4></div></div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header"><h5 className="mb-0"><i className="bx bx-group me-1"></i>Totales por Tipo de Personal</h5></div>
            <div className="table-responsive text-nowrap">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Tipo</th><th className="text-end">Cantidad</th>
                    <th className="text-end">Total Asignaciones</th><th className="text-end">Total Deducciones</th><th className="text-end">Neto</th>
                  </tr>
                </thead>
                <tbody className="table-border-bottom-0">
                  {(resumen.porTipo || []).filter(t => t.cantidad > 0).map((tipo) => (
                    <tr key={tipo.tipo_personal} className="align-middle">
                      <td><span className="badge bg-label-primary">{tipo.tipo_personal === 'Obrero Fijo' ? 'Obrero' : tipo.tipo_personal}</span></td>
                      <td className="text-end fw-bold">{tipo.cantidad}</td>
                      <td className="text-end text-success">{formatCurrency(tipo.total_asignaciones)}</td>
                      <td className="text-end text-danger">{formatCurrency(tipo.total_deducciones)}</td>
                      <td className="text-end fw-bold text-primary">{formatCurrency(tipo.total_neto)}</td>
                    </tr>
                  ))}
                  <tr className="table-active fw-bold">
                    <td>TOTAL</td>
                    <td className="text-end">{resumen.total_empleados}</td>
                    <td className="text-end">{formatCurrency(resumen.total_asignaciones)}</td>
                    <td className="text-end">{formatCurrency(resumen.total_deducciones)}</td>
                    <td className="text-end">{formatCurrency(resumen.total_neto)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {reporteData && (
        <ReportTable
          data={filtered}
          columns={columns}
          excelColumns={excelColumns}
          excelFilename={`pagos_${mes}_${anio}`}
          title="Detalle de Pagos"
          subtitle={`Quincena ${quincena} — ${resumen?.total_empleados || 0} empleados`}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          tipoPersonal={tipoPersonal}
          onTipoChange={setTipoPersonal}
          groupBy="tipo_personal"
        />
      )}
    </div>
  );
};
