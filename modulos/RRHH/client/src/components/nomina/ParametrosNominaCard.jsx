import React from 'react'
import { MESES_NOMINA } from '../../hooks/usePeriodoNomina.js'

const ALLOWED_ROLES = [5, 6, 7]

export function ParametrosNominaCard({
  mes,
  anio,
  tipoNomina,
  onTipoNominaChange,
  onCalcular,
  onCerrar,
  loadingCalcular,
  loadingCerrar,
  periodoLoading,
  periodoDisponible,
  cierreExitoso,
  userRolId,
  cierreStatus
}) {
  const puedeCerrar = ALLOWED_ROLES.includes(userRolId)
  const quincenaKey = tipoNomina === 'unificada' ? 'unificada' : `q${tipoNomina}`
  const yaCerrado = cierreStatus?.[quincenaKey] ?? cierreExitoso

  return (
    <div className="card mb-4">
      <div className="card-header border-bottom">
        <h5 className="card-title mb-0">Parámetros de Cálculo</h5>
      </div>
      <div className="card-body mt-3">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Mes</label>
            <select className="form-select" value={mes} disabled aria-readonly="true">
              {MESES_NOMINA.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Año</label>
            <select className="form-select" value={anio} disabled aria-readonly="true">
              {anio && <option value={anio}>{anio}</option>}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Tipo de Nómina</label>
            <select className="form-select" value={tipoNomina} onChange={event => onTipoNominaChange(event.target.value)}>
              <option value="1">Primera Quincena (1)</option>
              <option value="2">Segunda Quincena (2)</option>
              <option value="unificada">Nómina Unificada (Mensual)</option>
            </select>
          </div>
          <div className="col-md-3 d-flex align-items-end gap-2">
            <button
              className="btn btn-primary flex-fill"
              onClick={onCalcular}
              disabled={loadingCalcular || periodoLoading || !periodoDisponible}
            >
              {loadingCalcular ? (
                <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Calculando...</>
              ) : (
                <><i className="bx bx-calculator me-1"></i> Calcular Nómina (En Caliente)</>
              )}
            </button>
            {puedeCerrar ? (
              <button
                className="btn btn-success flex-fill"
                onClick={onCerrar}
                disabled={loadingCerrar || yaCerrado || loadingCalcular}
              >
                {loadingCerrar ? (
                  <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Cerrando...</>
                ) : yaCerrado ? (
                  <><i className="bx bx-lock me-1"></i> Período Ya Cerrado en BD</>
                ) : (
                  <><i className="bx bx-save me-1"></i> Cerrar y Guardar Nómina</>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
