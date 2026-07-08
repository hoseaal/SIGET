import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReportTable } from '../../components/ReportTable';

const tiposPersonal = ['Todos', 'Funcionario', 'Obrero Fijo', 'Jubilado', 'Pensionado', 'Sobreviviente'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);

const badgeColor = (tipo) => {
  const map = { 'Funcionario': 'primary', 'Obrero Fijo': 'secondary', 'Jubilado': 'success', 'Pensionado': 'warning', 'Sobreviviente': 'info' };
  return map[tipo] || 'light';
};

const columns = [
  { header: 'Tipo', accessor: 'tipo_personal', render: (r) => <span className={`badge bg-label-${badgeColor(r.tipo_personal)}`}>{r.tipo_personal}</span> },
  { header: 'Cédula', accessor: 'cedula' },
  { header: 'Nombres y Apellidos', render: (r) => <strong>{r.nombres} {r.apellidos}</strong> },
  { header: 'Cargo', accessor: 'cargo', render: (r) => <small>{r.cargo}</small> },
  { header: 'Departamento', accessor: 'departamento' },
  { header: 'Fecha de Ingreso', accessor: 'fecha_ingreso', render: (r) => {
    if (!r.fecha_ingreso) return '-';
    const datePart = typeof r.fecha_ingreso === 'string' ? r.fecha_ingreso.split('T')[0] : '';
    if (!datePart) return '-';
    const [y, m, d] = datePart.split('-');
    return `${d}/${m}/${y}`;
  }},
];

const excelColumns = [
  { header: 'Tipo Personal', accessor: 'tipo_personal' },
  { header: 'Cédula', accessor: 'cedula' },
  { header: 'Nombres', accessor: 'nombres' },
  { header: 'Apellidos', accessor: 'apellidos' },
  { header: 'Cargo', accessor: 'cargo' },
  { header: 'Departamento', accessor: 'departamento' },
  { header: 'Fecha de Ingreso', accessor: 'fecha_ingreso' },
];

export const ReporteIngresos = () => {
  const hoy = new Date();
  const hace1a = new Date(hoy.getFullYear() - 1, hoy.getMonth(), 1);
  const [desde, setDesde] = useState(hace1a.toISOString().split('T')[0]);
  const [hasta, setHasta] = useState(hoy.toISOString().split('T')[0]);
  const [tipoPersonal, setTipoPersonal] = useState('Todos');
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const generarReporte = async () => {
    if (!desde || !hasta) { toast.warning('Debe seleccionar un rango de fechas.'); return; }
    if (desde > hasta) { toast.warning('La fecha "Desde" debe ser anterior a "Hasta".'); return; }
    setLoading(true);
    setReporteData(null);
    setSearchTerm('');
    try {
      const url = new URL('/api/reporte-ingresos/generar', window.location.origin);
      url.searchParams.append('desde', desde);
      url.searchParams.append('hasta', hasta);
      url.searchParams.append('tipo_personal', tipoPersonal);
      const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (data.ok) { setReporteData(data); toast.success('Reporte de ingresos generado correctamente.'); }
      else toast.error(data.error || 'Error al generar el reporte.');
    } catch (error) {
      console.error(error);
      toast.error('Error de servidor al generar el reporte.');
    } finally { setLoading(false); }
  };

  const filteredData = reporteData?.data?.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return [row.cedula, row.nombres, row.apellidos, row.cargo, row.tipo_personal].some(v => v?.toLowerCase().includes(term));
  }) || [];

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <ToastContainer />
      <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Reportes /</span> Ingresos de Personal</h4>

      <div className="card mb-4">
        <div className="card-header border-bottom"><h5 className="card-title mb-0">Filtros del Reporte</h5></div>
        <div className="card-body mt-3">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Desde</label>
              <input type="date" className="form-control" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Hasta</label>
              <input type="date" className="form-control" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Tipo de Personal</label>
              <select className="form-select" value={tipoPersonal} onChange={(e) => setTipoPersonal(e.target.value)}>
                {tiposPersonal.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={generarReporte} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-1" />Generando...</> : <><i className="bx bx-search me-1" /> Generar Reporte</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {reporteData && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card shadow-sm border-primary h-100">
                <div className="card-body text-center py-3">
                  <div className="text-muted small">Total Ingresos</div>
                  <h3 className="text-primary fw-bold mb-0">{reporteData.data.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-success h-100">
                <div className="card-body text-center py-3">
                  <div className="text-muted small">Funcionarios</div>
                  <h3 className="text-success fw-bold mb-0">{reporteData.data.filter(r => r.tipo_personal === 'Funcionario').length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-warning h-100">
                <div className="card-body text-center py-3">
                  <div className="text-muted small">Obreros Fijos</div>
                  <h3 className="text-warning fw-bold mb-0">{reporteData.data.filter(r => r.tipo_personal === 'Obrero Fijo').length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-info h-100">
                <div className="card-body text-center py-3">
                  <div className="text-muted small">Jub/Pen/Sob</div>
                  <h3 className="text-info fw-bold mb-0">{reporteData.data.filter(r => !['Funcionario', 'Obrero Fijo'].includes(r.tipo_personal)).length}</h3>
                </div>
              </div>
            </div>
          </div>

          <ReportTable
            data={filteredData}
            columns={columns}
            excelColumns={excelColumns}
            excelFilename={`ingresos_${desde}_${hasta}`}
            title="Personal Ingresado"
            subtitle={`${desde} — ${hasta}`}
            loading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            tipoPersonal={tipoPersonal}
            onTipoChange={setTipoPersonal}
          />
        </>
      )}
    </div>
  );
};
