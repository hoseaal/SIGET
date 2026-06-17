import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReportTable } from '../../components/ReportTable';
import { exportToExcel } from '../../utils/exportExcel';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);

const badgeColor = (tipo) => {
  const map = { 'Funcionario': 'primary', 'Obrero Fijo': 'secondary', 'Jubilado': 'success', 'Pensionado': 'warning', 'Sobreviviente': 'info' };
  return map[tipo] || 'light';
};

const detailColumns = [
  { header: 'Tipo', accessor: 'tipo_personal', render: (r) => <span className={`badge bg-label-${badgeColor(r.tipo_personal)}`}>{r.tipo_personal === 'Obrero Fijo' ? 'Obrero' : r.tipo_personal}</span> },
  { header: 'Cédula', accessor: 'cedula' },
  { header: 'Nombre', accessor: 'nombre_completo', render: (r) => <strong>{r.nombre_completo}</strong> },
  { header: 'Cargo', accessor: 'cargo' },
  { header: 'Sueldo+Ant.', accessor: 'sueldo_antiguedad', align: 'right', render: (r) => formatCurrency(r.sueldo_antiguedad) },
  { header: 'Primas', accessor: 'primas', align: 'right', render: (r) => formatCurrency(r.primas) },
  { header: 'Asig.', accessor: 'total_asignaciones', align: 'right', render: (r) => formatCurrency(r.total_asignaciones) },
  { header: 'Ded.', accessor: 'total_deducciones', align: 'right', render: (r) => formatCurrency(r.total_deducciones) },
  { header: 'Neto', accessor: 'neto', align: 'right', render: (r) => <strong>{formatCurrency(r.neto)}</strong> },
];

const excelDetailColumns = [
  { header: 'Tipo Personal', accessor: 'tipo_personal' },
  { header: 'Cédula', accessor: 'cedula' },
  { header: 'Nombre Completo', accessor: 'nombre_completo' },
  { header: 'Cargo', accessor: 'cargo' },
  { header: 'Sueldo y Antigüedad', accessor: 'sueldo_antiguedad', type: 'currency' },
  { header: 'Primas', accessor: 'primas', type: 'currency' },
  { header: 'Total Asignaciones', accessor: 'total_asignaciones', type: 'currency' },
  { header: 'Total Deducciones', accessor: 'total_deducciones', type: 'currency' },
  { header: 'Neto', accessor: 'neto', type: 'currency' },
];

const CONCEPT_LABELS = {
  sueldo_antiguedad: 'Sueldo+Antigüedad',
  primas: 'Primas',
  otros: 'Otros',
  total_asignaciones: 'Total Asignaciones',
  seguro_social: 'Seguro Social',
  rpe: 'RPE',
  faov: 'FAOV',
  fejp: 'FEJP',
  caja_ahorro: 'Caja Ahorro',
  aporte_patronal: 'Aporte Patronal',
  total_deducciones: 'Total Deducciones',
  total_neto: 'Neto',
};

export const ReporteResumenNomina = () => {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [quincena, setQuincena] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [verDetalle, setVerDetalle] = useState(false);

  const generarReporte = async () => {
    if (!mes || !anio) { toast.warning('Debe seleccionar mes y año.'); return; }
    setLoading(true);
    setReporteData(null);
    setSearchTerm('');
    setVerDetalle(false);
    try {
      const params = new URLSearchParams({ mes, anio, quincena });
      const res = await fetch(`/api/resumen-nomina/generar?${params}`, {
        method: 'GET', headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok) { setReporteData(data); toast.success('Resumen de nómina generado correctamente.'); }
      else toast.error(data.error || 'Error al generar el resumen.');
    } catch (error) {
      console.error(error);
      toast.error('Error de servidor al generar el resumen.');
    } finally { setLoading(false); }
  };

  const filteredData = reporteData?.data?.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return [row.cedula, row.nombre_completo, row.cargo, row.tipo_personal].some(v => v?.toLowerCase().includes(term));
  }) || [];

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <ToastContainer />
      <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Reportes /</span> Resumen de Nómina</h4>

      <div className="card mb-4">
        <div className="card-header border-bottom"><h5 className="card-title mb-0">Filtros del Reporte</h5></div>
        <div className="card-body mt-3">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Mes</label>
              <select className="form-select" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('es', { month: 'long' })}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Año</label>
              <select className="form-select" value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
                {Array.from({ length: 5 }, (_, i) => { const y = hoy.getFullYear() - 2 + i; return <option key={y} value={y}>{y}</option>; })}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Quincena</label>
              <select className="form-select" value={quincena} onChange={(e) => setQuincena(Number(e.target.value))}>
                <option value={1}>1ra Quincena</option><option value={2}>2da Quincena</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={generarReporte} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-1" />Generando...</> : <><i className="bx bx-search me-1" /> Generar Resumen</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {reporteData && (() => {
        const resumen = reporteData.resumen;
        const porTipo = reporteData.porTipo || [];

        const handleExportResumen = async () => {
          await exportToExcel({
            columns: [
              { header: 'Tipo', accessor: 'tipo_personal' },
              { header: 'Cantidad', accessor: 'cantidad', align: 'right' },
              { header: 'Sueldo + Antigüedad', accessor: 'sueldo_antiguedad', align: 'right', type: 'currency' },
              { header: 'Primas', accessor: 'primas', align: 'right', type: 'currency' },
              { header: 'Otros', accessor: 'otros', align: 'right', type: 'currency' },
              { header: 'Total Asignaciones', accessor: 'total_asignaciones', align: 'right', type: 'currency' },
              { header: 'Total Deducciones', accessor: 'total_deducciones', align: 'right', type: 'currency' },
              { header: 'Neto', accessor: 'total_neto', align: 'right', type: 'currency' },
            ],
            data: porTipo.filter(t => t.cantidad > 0),
            title: `Resumen de Nómina - ${new Date(anio, mes - 1).toLocaleString('es', { month: 'long' })} ${anio}`,
            filename: `resumen_nomina_${mes}_${anio}`,
          });
        };

        return (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card shadow-sm border-primary h-100">
                <div className="card-body text-center py-3">
                  <div className="text-muted small">Total Empleados</div>
                  <h3 className="text-primary fw-bold mb-0">{resumen.total_empleados}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-success h-100">
                <div className="card-body text-center py-3">
                  <div className="text-muted small">Total Asignaciones</div>
                  <h3 className="text-success fw-bold mb-0">{formatCurrency(resumen.total_asignaciones)}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-danger h-100">
                <div className="card-body text-center py-3">
                  <div className="text-muted small">Total Deducciones</div>
                  <h3 className="text-danger fw-bold mb-0">{formatCurrency(resumen.total_deducciones)}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-info h-100">
                <div className="card-body text-center py-3">
                  <div className="text-muted small">Total Neto</div>
                  <h3 className="text-info fw-bold mb-0">{formatCurrency(resumen.total_neto)}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            {porTipo.filter(t => t.cantidad > 0).map((tipo) => {
              const colors = { 'Funcionario': 'primary', 'Obrero Fijo': 'secondary', 'Jubilado': 'success', 'Pensionado': 'warning', 'Sobreviviente': 'info' };
              const color = colors[tipo.tipo_personal] || 'light';
              return (
                <div key={tipo.tipo_personal} className="col-md">
                  <div className={`card shadow-sm border-${color} h-100`}>
                    <div className="card-body text-center py-3">
                      <div className="text-muted small">{tipo.tipo_personal === 'Obrero Fijo' ? 'Obreros' : tipo.tipo_personal + 's'}</div>
                      <h3 className={`text-${color} fw-bold mb-0`}>{tipo.cantidad}</h3>
                      <small className="text-muted">{formatCurrency(tipo.total_neto)}</small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="mb-0"><i className="bx bx-group me-1"></i>Totales por Tipo de Personal</h5>
              <button className="btn btn-outline-success btn-sm" onClick={handleExportResumen}>
                <i className="bx bx-download me-1"></i> Exportar Resumen a Excel
              </button>
            </div>
            <div className="table-responsive text-nowrap">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Tipo</th><th className="text-end">Cantidad</th>
                    <th className="text-end">Sueldo + Antigüedad</th><th className="text-end">Primas</th>
                    <th className="text-end">Otros</th><th className="text-end">Total Asignaciones</th>
                    <th className="text-end">Deducciones</th><th className="text-end">Neto</th><th className="text-end">%</th>
                  </tr>
                </thead>
                <tbody className="table-border-bottom-0">
                  {porTipo.filter(t => t.cantidad > 0).map((tipo) => (
                    <tr key={tipo.tipo_personal} className="align-middle">
                      <td><span className={`badge bg-${badgeColor(tipo.tipo_personal)}`}>{tipo.tipo_personal === 'Obrero Fijo' ? 'Obrero Fijo' : tipo.tipo_personal}</span></td>
                      <td className="text-end fw-bold">{tipo.cantidad}</td>
                      <td className="text-end">{formatCurrency(tipo.sueldo_antiguedad)}</td>
                      <td className="text-end">{formatCurrency(tipo.primas)}</td>
                      <td className="text-end">{formatCurrency(tipo.otros)}</td>
                      <td className="text-end">{formatCurrency(tipo.total_asignaciones)}</td>
                      <td className="text-end">{formatCurrency(tipo.total_deducciones)}</td>
                      <td className="text-end fw-bold">{formatCurrency(tipo.total_neto)}</td>
                      <td className="text-end">{resumen.total_neto > 0 ? ((tipo.total_neto / resumen.total_neto) * 100).toFixed(1) + '%' : '0%'}</td>
                    </tr>
                  ))}
                  <tr className="table-active fw-bold">
                    <td>TOTAL</td>
                    <td className="text-end">{resumen.total_empleados}</td>
                    <td className="text-end">{formatCurrency(resumen.total_sueldo_antiguedad)}</td>
                    <td className="text-end">{formatCurrency(resumen.total_primas)}</td>
                    <td className="text-end">{formatCurrency(resumen.total_otros)}</td>
                    <td className="text-end">{formatCurrency(resumen.total_asignaciones)}</td>
                    <td className="text-end">{formatCurrency(resumen.total_deducciones)}</td>
                    <td className="text-end">{formatCurrency(resumen.total_neto)}</td>
                    <td className="text-end">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="mb-0"><i className="bx bx-list-ul me-1"></i>Detalle por Concepto</h5>
              <div className="d-flex flex-wrap gap-1">
                <span className="badge bg-secondary">Sueldo: {formatCurrency(resumen.total_sueldo_antiguedad)}</span>
                <span className="badge bg-success">Primas: {formatCurrency(resumen.total_primas)}</span>
                <span className="badge bg-info">Otros: {formatCurrency(resumen.total_otros)}</span>
                <span className="badge bg-danger">Ded: {formatCurrency(resumen.total_seguro_social + resumen.total_rpe + resumen.total_faov + resumen.total_fejp + resumen.total_caja_ahorro)}</span>
                <span className="badge bg-primary">Aporte Pat.: {formatCurrency(resumen.total_aporte_patronal)}</span>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <button className="btn btn-outline-primary" onClick={() => setVerDetalle(!verDetalle)}>
                  <i className={`bx ${verDetalle ? 'bx-hide' : 'bx-show'} me-1`}></i>
                  {verDetalle ? 'Ocultar Detalle' : 'Ver Detalle de Empleados'}
                </button>
              </div>
            </div>
          </div>

          {verDetalle && (
            <ReportTable
              data={filteredData}
              columns={detailColumns}
              excelColumns={excelDetailColumns}
              excelFilename={`detalle_nomina_${mes}_${anio}`}
              title="Detalle por Empleado"
              subtitle={`${new Date(anio, mes - 1).toLocaleString('es', { month: 'long' })} ${anio} — ${quincena === 1 ? '1ra' : '2da'} Quincena`}
              loading={loading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          )}
        </>
        );
      })()}
    </div>
  );
};
