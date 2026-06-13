import React, { useState, useCallback, useEffect } from 'react'
import { Alert, Badge, Spinner } from 'react-bootstrap'
import { API, STATUS, TABS, POR_DERECHO_TAB, formatDate, daysUntil, esPorDerecho, buildGroups } from './utils/vacacionesUtils'
import { ModalRegistroVacaciones } from './ModalRegistroVacaciones'
import { ModalVerPerfil } from './ModalVerPerfil'
import { ModalReintegro } from './ModalReintegro'
import { ModalRecibo } from './ModalRecibo'

export const VacacionesGestion = ({ tipoEmpleado }) => {
  const [consolidado, setConsolidado] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(STATUS.PROGRAMADO)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal: Registro
  const [showRegistro, setShowRegistro] = useState(false)

  // Modal: Acciones (reintegro, pago, terminar, posponer)
  const [confirmAction, setConfirmAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [reintegroObs, setReintegroObs] = useState('')

  // Dropdown de acciones en tabla
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [dropdownPos, setDropdownPos] = useState(null)

  // Modal: Perfil
  const [perfilEmpleadoId, setPerfilEmpleadoId] = useState(null)
  const [perfilData, setPerfilData] = useState(null)
  const [loadingPerfil, setLoadingPerfil] = useState(false)

  // Modal: Recibo
  const [reciboEmpleadoId, setReciboEmpleadoId] = useState(null)
  const [reciboData, setReciboData] = useState(null)
  const [reciboLoading, setReciboLoading] = useState(false)

  const flash = (setter, msg, ms = 4000) => { setter(msg); setTimeout(() => setter(''), ms) }

  const loadConsolidado = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/consolidado?tipo=${tipoEmpleado || ''}`)
      if (!res.ok) throw new Error('Error al cargar datos')
      const data = await res.json()
      setConsolidado(Array.isArray(data) ? data : [])
    } catch (err) {
      flash(setError, err.message)
    } finally {
      setLoading(false)
    }
  }, [tipoEmpleado])

  useEffect(() => { loadConsolidado() }, [loadConsolidado])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setOpenDropdownId(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const getLocalDateStr = () => new Date().toLocaleDateString('en-CA')
  const todayStr = getLocalDateStr()

  const filteredList = activeTab === POR_DERECHO_TAB
    ? consolidado.filter(row => esPorDerecho(row))
    : activeTab === STATUS.PROGRAMADO
      ? consolidado.filter(row =>
        Number(row.id_status_vacaciones) === Number(activeTab) &&
        row.fecha_inicio &&
        row.fecha_inicio !== todayStr
      )
      : consolidado.filter(row => Number(row.id_status_vacaciones) === Number(activeTab))

  const groupedItems = buildGroups(filteredList)
  const COL_COUNT = 13

  /* ─── Handlers de Acciones ─── */

  const handlePagar = async () => {
    if (!confirmAction?.empleado_id) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API}/pagar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: confirmAction.empleado_id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al pagar')
      flash(setSuccess, `Bono vacacional pagado: ${data.monto_bono}`)
      loadConsolidado()
    } catch (err) { flash(setError, err.message) }
    finally { setActionLoading(false); setConfirmAction(null) }
  }

  const handleReintegrar = async () => {
    if (!confirmAction?.empleado_id) return
    if (!reintegroObs || reintegroObs.trim().length === 0) {
      return flash(setError, 'Debe especificar el motivo del reintegro en las observaciones.')
    }
    setActionLoading(true)
    try {
      const res = await fetch(`${API}/reintegrar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: confirmAction.empleado_id, observaciones: reintegroObs.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al reintegrar')
      flash(setSuccess, data.mensaje || 'Reintegro procesado correctamente')
      loadConsolidado()
    } catch (err) { flash(setError, err.message) }
    finally { setActionLoading(false); setConfirmAction(null); setReintegroObs('') }
  }

  const handleTerminar = async () => {
    if (!confirmAction?.empleado_id) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API}/terminar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: confirmAction.empleado_id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al cerrar')
      flash(setSuccess, data.mensaje || 'Cierre forzoso aplicado correctamente')
      loadConsolidado()
    } catch (err) { flash(setError, err.message) }
    finally { setActionLoading(false); setConfirmAction(null) }
  }

  const handlePosponer = async () => {
    if (!confirmAction?.empleado_id) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API}/posponer`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: confirmAction.empleado_id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al posponer')
      flash(setSuccess, data.mensaje)
      loadConsolidado()
    } catch (err) { flash(setError, err.message) }
    finally { setActionLoading(false); setConfirmAction(null) }
  }

  const handleConfirmAction = () => {
    if (confirmAction?.type === 'pagar') handlePagar()
    else if (confirmAction?.type === 'reintegrar') handleReintegrar()
    else if (confirmAction?.type === 'posponer') handlePosponer()
    else handleTerminar()
  }

  const openPerfil = async (empleadoId) => {
    setPerfilEmpleadoId(empleadoId)
    setLoadingPerfil(true)
    try {
      const res = await fetch(`${API}/perfil/${empleadoId}`)
      if (!res.ok) throw new Error('Error al cargar perfil')
      setPerfilData(await res.json())
    } catch (err) { flash(setError, err.message) }
    finally { setLoadingPerfil(false) }
  }

  const openRecibo = async (empleadoId) => {
    setReciboEmpleadoId(empleadoId)
    setReciboLoading(true)
    try {
      const res = await fetch(`${API}/recibo/${empleadoId}`)
      if (!res.ok) throw new Error('Error al cargar recibo')
      setReciboData(await res.json())
    } catch (err) { flash(setError, err.message) }
    finally { setReciboLoading(false) }
  }

  /* ─── Renders ─── */

  const renderFechaTopeCell = (fechaTope) => {
    const d = daysUntil(fechaTope)
    let bg = ''
    if (d !== null) {
      if (d < 0) bg = '#f8d7da'
      else if (d <= 30) bg = '#fff3cd'
    }
    return (
      <td className="text-center" style={bg ? { backgroundColor: bg } : {}}>
        <span style={d !== null && d < 0 ? { color: '#dc3545', fontWeight: 'bold' } : {}}>
          {formatDate(fechaTope)}
        </span>
        {d !== null && d < 0 && <br />}
        {d !== null && d < 0 && <small className="text-danger fw-bold">Vencida</small>}
        {d !== null && d >= 0 && d <= 30 && <br />}
        {d !== null && d >= 0 && d <= 30 && <small className="text-warning fw-bold">{d} días</small>}
      </td>
    )
  }

  const renderActions = (row) => {
    const open = openDropdownId === row.empleado_id
    const statusId = Number(row.id_status_vacaciones)

    const handleClick = (e) => {
      e.stopPropagation()
      if (open) { setOpenDropdownId(null); return }
      const rect = e.currentTarget.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 4, left: rect.right - 180 })
      setOpenDropdownId(row.empleado_id)
    }

    return (
      <div className="position-relative" style={{ display: 'inline-block' }}>
        <button className="btn btn-sm btn-outline-secondary" onClick={handleClick}>
          <i className="bx bx-dots-vertical-rounded me-1"></i>Acciones
        </button>
        {open && dropdownPos && (
          <ul className="acciones-menu dropdown-menu show border shadow" style={{
            position: 'fixed', zIndex: 1060, fontSize: '0.85rem', minWidth: '190px',
            top: dropdownPos.top, left: dropdownPos.left
          }}>
            <li>
              <button className="dropdown-item" onClick={() => { setOpenDropdownId(null); openPerfil(row.empleado_id) }}>
                <i className="bx bx-show me-2"></i>Ver Perfil
              </button>
            </li>
            <li>
              <button className="dropdown-item" onClick={() => { setOpenDropdownId(null); openRecibo(row.empleado_id) }}>
                <i className="bx bx-receipt me-2"></i>Descargar Recibo
              </button>
            </li>
            {activeTab === POR_DERECHO_TAB && (
              <li>
                <button className="dropdown-item text-info" onClick={() => { setOpenDropdownId(null); setConfirmAction({ type: 'posponer', empleado_id: row.empleado_id, label: `${row.nombres} ${row.apellidos}` }) }}>
                  <i className="bx bx-time me-2"></i>Posponer
                </button>
              </li>
            )}
            {statusId === STATUS.DE_DISFRUTE && (
              <>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-warning" onClick={() => { setOpenDropdownId(null); setConfirmAction({ type: 'reintegrar', empleado_id: row.empleado_id, label: `${row.nombres} ${row.apellidos}` }) }}>
                    <i className="bx bx-redo me-2"></i>Reintegro
                  </button>
                </li>
                <li>
                  <button className="dropdown-item text-danger" onClick={() => { setOpenDropdownId(null); setConfirmAction({ type: 'terminar', empleado_id: row.empleado_id, label: `${row.nombres} ${row.apellidos}` }) }}>
                    <i className="bx bx-x-circle me-2"></i>Finalizar Vacaciones
                  </button>
                </li>
              </>
            )}
            {statusId === STATUS.PROGRAMADO && (
              <li>
                <button className="dropdown-item text-success" onClick={() => { setOpenDropdownId(null); setConfirmAction({ type: 'pagar', empleado_id: row.empleado_id, label: `${row.nombres} ${row.apellidos}` }) }}>
                  <i className="bx bx-credit-card me-2"></i>Registrar Pago
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="py-3 mb-0">
          <span className="text-muted fw-light">Personal /</span>{' '}
          {tipoEmpleado === 'obrero' ? 'Vacaciones - Obreros Fijos' : 'Vacaciones - Funcionarios Activos'}
        </h4>
        <button className="btn btn-primary" onClick={() => setShowRegistro(true)}>
          <i className="bx bx-plus me-1"></i> Registrar Vacaciones
        </button>
      </div>

      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* ─── Tabla Principal ─── */}
      <div className="card shadow-sm">
        <div className="card-header bg-transparent border-bottom">
          <div className="d-flex flex-wrap gap-2" role="group">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`btn btn-sm ${activeTab === tab.id ? `btn-${tab.variant}` : `btn-outline-${tab.variant}`}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`${tab.icon} me-1`}></i> {tab.label}
                <span className={`badge ms-1 ${activeTab === tab.id ? 'bg-light text-dark' : `bg-${tab.variant}`}`}>
                  {tab.id === POR_DERECHO_TAB
                    ? consolidado.filter(r => r.estado_vacaciones === 'por_derecho').length
                    : tab.id === STATUS.PROGRAMADO
                      ? consolidado.filter(r =>
                        Number(r.id_status_vacaciones) === tab.id &&
                        r.fecha_inicio &&
                        r.fecha_inicio !== todayStr
                      ).length
                      : consolidado.filter(r => Number(r.id_status_vacaciones) === tab.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle mb-0" style={{ fontSize: '0.8rem' }}>
            <thead className="table-light">
              <tr>
                <th className="text-center" style={{ width: '40px' }}>Nro.</th>
                <th>Cédula</th>
                <th>Apellidos y Nombres</th>
                <th>Cargo CET</th>
                <th className="text-center">F. Ingreso</th>
                <th className="text-center">Fecha Tope</th>
                <th className="text-center">Salida</th>
                <th className="text-center">Reintegro a Laborar</th>
                <th className="text-center">Reintegro por Necesidad</th>
                <th className="text-center">Días Pend. Disfrute</th>
                <th className="text-center">Días Disfrute Año Actual</th>
                <th className="text-center">Total Días Pendientes</th>

                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={COL_COUNT} className="text-center py-4"><Spinner animation="border" variant="primary" /></td></tr>
              ) : groupedItems.length === 0 ? (
                <tr><td colSpan={COL_COUNT} className="text-center py-4 text-muted">No hay registros en esta categoría.</td></tr>
              ) : groupedItems.map((item, idx) => {
                if (item.type === 'header') {
                  const parts = [item.dir]
                  if (item.div && item.div !== 'Sin División') parts.push(`› ${item.div}`)
                  if (item.uni && item.uni !== 'Sin Unidad') parts.push(`› ${item.uni}`)
                  return (
                    <tr key={item.key} className="table-secondary" style={{ borderBottom: '2px solid #dee2e6' }}>
                      <td colSpan={COL_COUNT} className="py-1">
                        <strong><i className="bx bx-building me-1"></i>{parts.join(' ')}</strong>
                      </td>
                    </tr>
                  )
                }
                const row = item.data
                const rowIdx = groupedItems.filter((g, j) => g.type === 'row' && j < idx).length
                const isReintegro = Number(row.id_status_vacaciones) === STATUS.REINTEGRO
                return (
                  <tr key={row.empleado_id}>
                    <td className="text-center">{rowIdx + 1}</td>
                    <td><strong>{row.cedula}</strong></td>
                    <td>{row.apellidos}, {row.nombres}</td>
                    <td>{row.cargo_cet_nombre || '-'}</td>
                    <td className="text-center">{formatDate(row.fecha_ingreso)}</td>
                    {renderFechaTopeCell(row.fecha_tope)}
                    <td className="text-center">{formatDate(row.fecha_inicio)}</td>
                    <td className="text-center">
                      {isReintegro ? '-' : formatDate(row.fecha_fin)}
                    </td>
                    <td className="text-center">
                      {isReintegro
                        ? <Badge bg="warning" className="text-dark"><i className="bx bx-redo me-1"></i>{formatDate(row.fecha_fin)}</Badge>
                        : '-'}
                    </td>
                    <td className="text-center fw-bold">{row.dias_pendientes_disfrute ?? '-'}</td>
                    <td className="text-center">{row.dias_usados_anio ?? '-'}</td>
                    <td className="text-center fw-bold text-primary">{row.dias_pendientes ?? '-'}</td>

                    <td className="text-center">{renderActions(row)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modales ─── */}
      <ModalRegistroVacaciones
        show={showRegistro}
        onHide={() => setShowRegistro(false)}
        tipoEmpleado={tipoEmpleado}
        onSuccess={msg => { flash(setSuccess, msg); loadConsolidado() }}
        onError={msg => flash(setError, msg)}
      />

      <ModalReintegro
        confirmAction={confirmAction}
        reintegroObs={reintegroObs}
        setReintegroObs={setReintegroObs}
        actionLoading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => { setConfirmAction(null); setReintegroObs('') }}
      />

      <ModalVerPerfil
        empleadoId={perfilEmpleadoId}
        perfilData={perfilData}
        loading={loadingPerfil}
        onHide={() => { setPerfilEmpleadoId(null); setPerfilData(null) }}
      />

      <ModalRecibo
        empleadoId={reciboEmpleadoId}
        reciboData={reciboData}
        loading={reciboLoading}
        onHide={() => { setReciboEmpleadoId(null); setReciboData(null) }}
      />
    </div>
  )
}

export default VacacionesGestion
