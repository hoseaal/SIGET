import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReportTable } from '../../components/ReportTable';

const meses = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: new Date(2000, i).toLocaleString('es', { month: 'long' }) }));
const anios = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

const formatCurrency = (v) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(v);

const badgeClass = (t) => {
  const map = { Funcionario: 'primary', 'Obrero Fijo': 'secondary', Jubilado: 'success', Pensionado: 'warning', Sobreviviente: 'info' };
  return `bg-label-${map[t] || 'light'}`;
};

const columns = [
  { header: 'Cédula', accessor: 'cedula' },
  { header: 'Nombres y Apellidos', render: (r) => <strong>{r.nombres} {r.apellidos}</strong> },
  { header: 'Tipo Personal', render: (r) => <span className={`badge ${badgeClass(r.tipo_personal)}`}>{r.tipo_personal}</span> },
  { header: 'Departamento', accessor: 'departamento' },
  { header: 'Aporte Total', accessor: 'total', align: 'right', render: (r) => <strong>{formatCurrency(r.total)}</strong> },
];

const excelColumns = [
  { header: 'Cédula', accessor: 'cedula' },
  { header: 'Nombres', accessor: 'nombres' },
  { header: 'Apellidos', accessor: 'apellidos' },
  { header: 'Tipo Personal', accessor: 'tipo_personal' },
  { header: 'Departamento', accessor: 'departamento' },
  { header: 'Aporte Total', accessor: 'total', type: 'currency' },
];

export const ReporteCajaAhorro = () => {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [periodo, setPeriodo] = useState('quincenal');
  const [quincenaNo, setQuincenaNo] = useState(1);
  const [tipoPersonal, setTipoPersonal] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState(null);

  const generarReporte = async () => {
    setLoading(true);
    setReporteData(null);
    try {
      const params = new URLSearchParams({ mes, anio, tipo_personal: tipoPersonal });
      if (periodo === 'quincenal') params.append('quincena_no', quincenaNo);
      const res = await fetch(`/api/caja-ahorro/reporte?${params}`);
      const data = await res.json();
      if (data.ok) { setReporteData(data); toast.success('Reporte generado.'); }
      else toast.error(data.error || 'Error al generar el reporte.');
    } catch { toast.error('Error de servidor.'); } finally { setLoading(false); }
  };

  const filtered = (reporteData?.data || []).filter(r => {
    if (tipoPersonal !== 'Todos' && r.tipo_personal !== tipoPersonal) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return [r.cedula, r.nombres, r.apellidos, r.tipo_personal, r.departamento].some(v => v?.toLowerCase().includes(q));
  });

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <ToastContainer />
      <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Reportes /</span> Caja de Ahorro</h4>

      <div className="card mb-4">
        <div className="card-header border-bottom"><h5 className="card-title mb-0">Filtros</h5></div>
        <div className="card-body mt-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-2">
              <label className="form-label">Período</label>
              <select className="form-select" value={periodo} onChange={e => setPeriodo(e.target.value)}>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>
            {periodo === 'quincenal' && (
              <div className="col-md-2">
                <label className="form-label">Quincena</label>
                <select className="form-select" value={quincenaNo} onChange={e => setQuincenaNo(Number(e.target.value))}>
                  <option value={1}>Primera</option><option value={2}>Segunda</option>
                </select>
              </div>
            )}
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
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={generarReporte} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-1" />Generando...</> : <><i className="bx bx-search me-1" />Generar</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {reporteData && (
        <ReportTable
          data={filtered}
          columns={columns}
          excelColumns={excelColumns}
          excelFilename={`caja_ahorro_${mes}_${anio}`}
          title={`Caja de Ahorro — Total: ${formatCurrency(reporteData.resumen.total_general)}`}
          subtitle={`${reporteData.resumen.total_empleados} empleados`}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          tipoPersonal={tipoPersonal}
          onTipoChange={setTipoPersonal}
        />
      )}
    </div>
  );
};
