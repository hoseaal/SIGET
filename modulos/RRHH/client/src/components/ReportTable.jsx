import React, { useState, useMemo } from 'react';
import { exportToExcel } from '../utils/exportExcel';

const PAGE_SIZE = 10;

export const PER_TIPO = ['Todos', 'Funcionario', 'Obrero Fijo', 'Jubilado', 'Pensionado', 'Sobreviviente'];

export function usePagination(data) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((data?.length || 0) / PAGE_SIZE));
  const pageData = useMemo(() => {
    if (!data) return [];
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  return { page, setPage, totalPages, pageData, PAGE_SIZE };
}

export function ReportTable({
  data,
  columns,
  title,
  subtitle,
  loading,
  searchTerm,
  onSearchChange,
  tipoPersonal,
  onTipoChange,
  extraFilters,
  excelColumns,
  excelFilename,
  summaryConfig,
  groupBy,
  emptyMessage = 'No se encontraron registros.',
}) {
  const { page, setPage, totalPages, pageData, PAGE_SIZE } = usePagination(data);

  const handleExport = async () => {
    const cols = excelColumns || columns;
    await exportToExcel({
      columns: cols,
      data: data || [],
      title: title || 'Reporte',
      filename: excelFilename || 'reporte',
      summaryConfig,
      groupBy,
    });
  };

  return (
    <div>
      <div className="card mb-4">
        <div className="card-header border-bottom">
          <h5 className="card-title mb-0">{title}</h5>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div className="card-body mt-3">
          <div className="row g-3 align-items-end">
            {extraFilters}
            {onTipoChange && (
              <div className="col-md-3">
                <label className="form-label">Tipo de Personal</label>
                <select className="form-select" value={tipoPersonal} onChange={(e) => { onTipoChange(e.target.value); }}>
                  {PER_TIPO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
            {onSearchChange && (
              <div className="col-md-3">
                <label className="form-label">Buscar</label>
                <input
                  type="text" className="form-control" placeholder="Buscar..."
                  value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            )}
            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={handleExport} disabled={!data || data.length === 0}>
                <i className="bx bx-download me-1"></i> Exportar a Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive text-nowrap">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className={col.align === 'right' ? 'text-end' : ''} style={col.width ? { width: col.width } : {}}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="table-border-bottom-0">
              {loading ? (
                <tr><td colSpan={columns.length} className="text-center py-4"><div className="spinner-border spinner-border-sm me-2" role="status" />Cargando...</td></tr>
              ) : pageData.length === 0 ? (
                <tr><td colSpan={columns.length} className="text-center py-4">{emptyMessage}</td></tr>
              ) : (
                pageData.map((row, i) => (
                  <tr key={row.id || row.empleado_id || row.cedula || i} className="align-middle">
                    {columns.map((col, j) => (
                      <td key={j} className={col.align === 'right' ? 'text-end' : ''}>
                        {col.render ? col.render(row, i) : (col.accessor ? row[col.accessor] : '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="card-footer d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data?.length || 0)} de {data?.length || 0} registros
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>&laquo;</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>&raquo;</button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
