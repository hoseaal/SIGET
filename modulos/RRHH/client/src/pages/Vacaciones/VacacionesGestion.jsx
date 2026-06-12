import React, { useState, useEffect, useCallback } from 'react'
import { Modal, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap'

const API = '/api/vacaciones'
const STATUS = {
  PROGRAMADO: 1,
  DE_DISFRUTE: 2,
  FINALIZADO: 3,
  REINTEGRO: 4,
  EN_ESPERA: 5
}

const POR_DERECHO_TAB = 'por_derecho'

const TABS = [
  { id: POR_DERECHO_TAB, label: 'Por obtener derecho', icon: 'bx bx-time-five', variant: 'info' },
  { id: STATUS.PROGRAMADO, label: 'Programado', icon: 'bx bx-calendar-check', variant: 'primary' },
  { id: STATUS.DE_DISFRUTE, label: 'De disfrute', icon: 'bx bx-sun', variant: 'success' },
  { id: STATUS.FINALIZADO, label: 'Finalizado', icon: 'bx bx-check-double', variant: 'secondary' },
  { id: STATUS.REINTEGRO, label: 'Reintegro', icon: 'bx bx-redo', variant: 'warning' },
  { id: STATUS.EN_ESPERA, label: 'En espera', icon: 'bx bx-shield-quarter', variant: 'dark' }
]

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatCurrency(n) {
  return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES', minimumFractionDigits: 2 }).format(Number(n || 0))
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24))
}

function esPorDerecho(row) {
  if (Number(row.id_status_vacaciones) > 0) return false
  const d = daysUntil(row.fecha_tope)
  if (d === null || d < 0 || d > 30) return false
  if (!row.fecha_ingreso) return false
  const fechaIngreso = new Date(row.fecha_ingreso)
  if (isNaN(fechaIngreso.getTime())) return false
  const anios = new Date().getFullYear() - fechaIngreso.getFullYear()
  return anios >= 1
}

function buildGroups(rows) {
  const groups = []
  const sorted = [...rows].sort((a, b) => {
    const da = (a.direccion_nombre || '').localeCompare(b.direccion_nombre || '')
    if (da) return da
    const dda = (a.division_nombre || '').localeCompare(b.division_nombre || '')
    if (dda) return dda
    return (a.unidad_nombre || '').localeCompare(b.unidad_nombre || '')
  })

  let currentDir = null, currentDiv = null, currentUni = null
  for (const row of sorted) {
    const dir = row.direccion_nombre || 'Sin Dirección'
    const div = row.division_nombre || 'Sin División'
    const uni = row.unidad_nombre || 'Sin Unidad'

    if (dir !== currentDir || div !== currentDiv || uni !== currentUni) {
      groups.push({ type: 'header', dir, div, uni, key: `${dir}|${div}|${uni}` })
      currentDir = dir; currentDiv = div; currentUni = uni
    }
    groups.push({ type: 'row', data: row })
  }
  return groups
}

export const VacacionesGestion = ({ tipoEmpleado }) => {
  const [consolidado, setConsolidado] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(STATUS.PROGRAMADO)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [fechaInicio, setFechaInicio] = useState('')
  const [diasSolicitados, setDiasSolicitados] = useState(1)
  const [simulacion, setSimulacion] = useState(null)
  const [saving, setSaving] = useState(false)

  const [confirmAction, setConfirmAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [reintegroObs, setReintegroObs] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [dropdownPos, setDropdownPos] = useState(null)

  const [perfilEmpleadoId, setPerfilEmpleadoId] = useState(null)
  const [perfilData, setPerfilData] = useState(null)
  const [loadingPerfil, setLoadingPerfil] = useState(false)

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

  const filteredList = activeTab === POR_DERECHO_TAB
    ? consolidado.filter(row => esPorDerecho(row))
    : consolidado.filter(row => Number(row.id_status_vacaciones) === Number(activeTab))
  const groupedItems = buildGroups(filteredList)
  const COL_COUNT = 14

  const buscarEmpleados = async (q) => {
    if (q.trim().length < 2) { setSearchResults([]); return }
    try {
      const res = await fetch(`${API}/buscar-empleados?q=${encodeURIComponent(q)}&tipo=${tipoEmpleado || ''}`)
      if (res.ok) setSearchResults(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => buscarEmpleados(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const calcularSaldo = async () => {
    if (!selectedEmp || !diasSolicitados || !fechaInicio) return
    try {
      const res = await fetch(`${API}/calcular-saldo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleado_id: selectedEmp.empleado_id,
          dias_solicitados: Number(diasSolicitados),
          fecha_inicio: fechaInicio
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error en simulación')
      setSimulacion(data)
    } catch (err) {
      flash(setError, err.message)
      setSimulacion(null)
    }
  }

  const fetchProyeccion = async () => {
    if (!selectedEmp || !fechaInicio) return
    try {
      const res = await fetch(`${API}/calcular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: selectedEmp.empleado_id, fecha_inicio: fechaInicio })
      })
      const data = await res.json()
      if (res.ok && data.total_dias_disfrute) {
        setDiasSolicitados(data.total_dias_disfrute)
      }
    } catch (err) {
      console.error('Error calculando proyección inicial:', err)
    }
  }

  useEffect(() => {
    if (showModal && selectedEmp && fechaInicio && wizardStep === 2) {
      fetchProyeccion()
    }
  }, [showModal, selectedEmp, fechaInicio, wizardStep])

  useEffect(() => {
    if (showModal && selectedEmp && diasSolicitados > 0 && fechaInicio) calcularSaldo()
  }, [showModal, selectedEmp, diasSolicitados, fechaInicio])

  const handleSubmitSolicitud = async () => {
    if (!selectedEmp || !fechaInicio || !diasSolicitados || !simulacion) return
    setSaving(true)
    try {
      const res = await fetch(`${API}/solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleado_id: selectedEmp.empleado_id,
          fecha_inicio: fechaInicio,
          dias_solicitados: Number(diasSolicitados),
          periodo_id: new Date(fechaInicio).getFullYear()
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al registrar')
      flash(setSuccess, 'Vacaciones programadas exitosamente (status: Programado)')
      setShowModal(false)
      loadConsolidado()
    } catch (err) {
      flash(setError, err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePagar = async () => {
    if (!confirmAction?.empleado_id) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: confirmAction.empleado_id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al pagar')
      flash(setSuccess, `Bono vacacional pagado: ${formatCurrency(data.monto_bono)}`)
      loadConsolidado()
    } catch (err) {
      flash(setError, err.message)
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const handleReintegrar = async () => {
    if (!confirmAction?.empleado_id) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API}/reintegrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: confirmAction.empleado_id, observaciones: reintegroObs })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al reintegrar')
      flash(setSuccess, data.mensaje || 'Reintegro procesado correctamente')
      loadConsolidado()
    } catch (err) {
      flash(setError, err.message)
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
      setReintegroObs('')
    }
  }

  const handleTerminar = async () => {
    if (!confirmAction?.empleado_id) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API}/terminar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: confirmAction.empleado_id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al cerrar')
      flash(setSuccess, data.mensaje || 'Cierre forzoso aplicado correctamente')
      loadConsolidado()
    } catch (err) {
      flash(setError, err.message)
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const handlePosponer = async () => {
    if (!confirmAction?.empleado_id) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API}/posponer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: confirmAction.empleado_id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al posponer')
      flash(setSuccess, data.mensaje)
      loadConsolidado()
    } catch (err) {
      flash(setError, err.message)
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const openPerfil = async (empleadoId) => {
    setPerfilEmpleadoId(empleadoId)
    setLoadingPerfil(true)
    try {
      const res = await fetch(`${API}/perfil/${empleadoId}`)
      if (!res.ok) throw new Error('Error al cargar perfil')
      const data = await res.json()
      setPerfilData(data)
    } catch (err) {
      flash(setError, err.message)
    } finally {
      setLoadingPerfil(false)
    }
  }

  const openRecibo = async (empleadoId) => {
    setReciboEmpleadoId(empleadoId)
    setReciboLoading(true)
    try {
      const res = await fetch(`${API}/recibo/${empleadoId}`)
      if (!res.ok) throw new Error('Error al cargar recibo')
      const data = await res.json()
      setReciboData(data)
    } catch (err) {
      flash(setError, err.message)
    } finally {
      setReciboLoading(false)
    }
  }

  const abrirModal = () => {
    const hoy = new Date().toISOString().split('T')[0]
    setWizardStep(1)
    setSelectedEmp(null)
    setSearchQuery('')
    setSearchResults([])
    setFechaInicio(hoy)
    setDiasSolicitados(1)
    setSimulacion(null)
    setShowModal(true)
  }

  const nextStep = () => {
    if (wizardStep === 1 && !selectedEmp) return flash(setError, 'Selecciona un empleado para continuar')
    if (wizardStep === 2 && !simulacion) return flash(setError, 'Completa la programación de fechas para continuar')
    setWizardStep(prev => Math.min(3, prev + 1))
  }

  const prevStep = () => setWizardStep(prev => Math.max(1, prev - 1))

  const sectionBadge = (label, step) =>
    <span className={`badge me-2 ${wizardStep === step ? 'bg-primary' : wizardStep > step ? 'bg-success' : 'bg-secondary'}`}>
      {wizardStep > step ? <i className="bx bx-check"></i> : step}
    </span>

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

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="py-3 mb-0">
          <span className="text-muted fw-light">Personal /</span>{' '}
          {tipoEmpleado === 'obrero' ? 'Vacaciones - Obreros Fijos' : 'Vacaciones - Funcionarios Activos'}
        </h4>
        <button className="btn btn-primary" onClick={abrirModal}>
          <i className="bx bx-plus me-1"></i> Registrar Vacaciones
        </button>
      </div>

      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

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
                    ? consolidado.filter(r => esPorDerecho(r)).length
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
                <th className="text-center">Vacaciones Pagadas</th>
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
                const pagado = Number(row.pagado) === 1
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
                    <td className="text-center">
                      {pagado
                        ? <Badge bg="success"><i className="bx bx-check me-1"></i>Sí</Badge>
                        : <Badge bg="secondary">No</Badge>}
                    </td>
                    <td className="text-center">{renderActions(row)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Registrar Vacaciones - Asistente ({wizardStep}/3)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {wizardStep === 1 && (
            <>
              <div className="d-flex align-items-center mb-3">
                {sectionBadge('Datos Personales', 1)}
                <h6 className="mb-0 fw-semibold">Datos Personales</h6>
              </div>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Buscar Empleado</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Cédula, nombre o apellido..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSelectedEmp(null); setSimulacion(null) }}
                />
                {searchResults.length > 0 && !selectedEmp && (
                  <div className="list-group mt-1 border rounded shadow-sm position-absolute bg-white" style={{ zIndex: 1000, maxWidth: '95%' }}>
                    {searchResults.map(emp => (
                      <button
                        key={emp.empleado_id}
                        type="button"
                        className="list-group-item list-group-item-action"
                        onClick={() => {
                          setSelectedEmp(emp)
                          setSearchQuery(`${emp.nombres} ${emp.apellidos}`)
                          setSearchResults([])
                        }}
                      >
                        <strong>{emp.cedula}</strong> - {emp.nombres} {emp.apellidos}
                        <span className={`badge ${emp.tipo_empleado === 'obrero' ? 'bg-info' : 'bg-primary'} ms-2`}>
                          {emp.tipo_empleado === 'obrero' ? 'Obrero' : 'Funcionario'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </Form.Group>

              {selectedEmp && (
                <div className="card border-info p-3">
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Cédula:</strong> {selectedEmp.cedula}</p>
                      <p className="mb-1"><strong>Nombres:</strong> {selectedEmp.nombres} {selectedEmp.apellidos}</p>
                      <p className="mb-1"><strong>Cargo:</strong> {selectedEmp.cargo_cet_nombre || selectedEmp.cargo_onapre_nombre || '-'}</p>
                      <p className="mb-0"><strong>Dependencia:</strong> {selectedEmp.dependencia_nombre || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Antigüedad:</strong> {simulacion?.anios_antiguedad ?? '-'} años</p>
                      <p className="mb-1"><strong>Clasificación:</strong> {simulacion?.tipo_empleado === 'obrero' ? 'Obrero' : 'Funcionario'}</p>
                      <p className="mb-0"><strong>Días por ley:</strong> {simulacion?.dias_disfrute_ley ?? '-'} días</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {wizardStep === 2 && (
            <>
              <div className="d-flex align-items-center mb-3">
                {sectionBadge('Tiempos / Fechas', 2)}
                <h6 className="mb-0 fw-semibold">Tiempos / Fechas</h6>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>Fecha de Inicio de Vacaciones</Form.Label>
                    <Form.Control type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                    <Form.Text className="text-muted">Calcula antigüedad hasta este día inclusivo.</Form.Text>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>Días a Disfrutar (Asignación Automática)</Form.Label>
                    <Form.Control type="number" min="1" max={simulacion?.total_disponibles || ''} value={diasSolicitados} onChange={e => setDiasSolicitados(Number(e.target.value))} />
                  </Form.Group>
                </div>
              </div>

              {simulacion && (
                <div className="card shadow-none border bg-light">
                  <div className="card-body p-3">
                    <h6 className="card-title text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.8rem' }}>Reglas de Cálculo Aplicadas</h6>
                    <div className="row text-center mb-3">
                      <div className="col-4 border-end">
                        <div className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Antigüedad</div>
                        <h5 className="mb-0 text-primary">{simulacion.anios_antiguedad} <small>años</small></h5>
                      </div>
                      <div className="col-4 border-end">
                        <div className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Días Base</div>
                        <h5 className="mb-0 text-info">{simulacion.dias_base || 0}</h5>
                      </div>
                      <div className="col-4">
                        <div className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Adicionales</div>
                        <h5 className="mb-0 text-success">{simulacion.dias_adicionales || 0}</h5>
                      </div>
                    </div>

                    <Alert variant="primary" className="py-2 px-3 mb-0 d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Total de Días de Disfrute: </strong>
                        {simulacion.dias_disfrute_ley} hábiles
                      </div>
                      <div className="text-end">
                        <strong>Reincorporación:</strong><br />
                        {formatDate(simulacion.fecha_reincorporacion)}
                      </div>
                    </Alert>
                    <small className="text-muted d-block mt-2 text-center" style={{ fontSize: '0.75rem' }}>
                      <i className="bx bx-info-circle me-1"></i>
                      La proyección omite automáticamente sábados, domingos y días festivos registrados en el calendario.
                    </small>
                  </div>
                </div>
              )}
            </>
          )}

          {wizardStep === 3 && simulacion && (
            <>
              <div className="d-flex align-items-center mb-3">
                {sectionBadge('Control de Días', 3)}
                <h6 className="mb-0 fw-semibold">Control de Días</h6>
              </div>
              <div className="card p-3 mb-3">
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Empleado:</strong> {simulacion.nombres} {simulacion.apellidos}</p>
                    <p className="mb-1"><strong>Días solicitados:</strong> {simulacion.dias_solicitados}</p>
                    <p className="mb-1"><strong>Disponibles:</strong> {simulacion.total_disponibles}</p>
                    <p className="mb-0"><strong>Reincorporación:</strong> {formatDate(simulacion.fecha_reincorporacion)}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Salario diario:</strong> {formatCurrency(simulacion.salario_diario)}</p>
                    <p className="mb-0"><strong>Saldo remanente:</strong> {simulacion.nuevo_acumulado} días</p>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <div className="card border-success h-100">
                    <div className="card-body">
                      <h6 className="text-success mb-2">Pago</h6>
                      <p className="mb-1">Días base: <strong>{simulacion.pago_modalidad_fija?.dias_base}</strong></p>
                      <p className="mb-0">Monto: <strong>{formatCurrency(simulacion.pago_modalidad_fija?.monto)}</strong></p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div>
            {wizardStep > 1 && <Button variant="outline-secondary" onClick={prevStep}>Atrás</Button>}
          </div>
          <div className="d-flex gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            {wizardStep < 3 ? (
              <Button variant="primary" onClick={nextStep}>Siguiente</Button>
            ) : (
              <Button variant="success" onClick={handleSubmitSolicitud} disabled={!simulacion || saving}>
                {saving ? <><Spinner size="sm" className="me-1" />Guardando...</> : 'Confirmar y Guardar'}
              </Button>
            )}
          </div>
        </Modal.Footer>
      </Modal>

      <Modal show={confirmAction !== null} onHide={() => setConfirmAction(null)}>
        <Modal.Header closeButton><Modal.Title>Confirmar Acción</Modal.Title></Modal.Header>
        <Modal.Body>
          {confirmAction?.type === 'pagar' && <p>¿Registrar pago de bono vacacional a <strong>{confirmAction.label}</strong>?</p>}
          {confirmAction?.type === 'reintegrar' && (
            <div>
              <p>¿Interrumpir y reintegrar a <strong>{confirmAction.label}</strong> por necesidad de servicio?</p>
              <Form.Group className="mt-2">
                <Form.Label className="fw-semibold">Observaciones</Form.Label>
                <Form.Control as="textarea" rows={2} placeholder="Motivo del reintegro..." value={reintegroObs} onChange={e => setReintegroObs(e.target.value)} />
              </Form.Group>
            </div>
          )}
          {confirmAction?.type === 'terminar' && <p>¿Aplicar cierre forzoso a <strong>{confirmAction.label}</strong>?</p>}
          {confirmAction?.type === 'posponer' && (
            <div>
              <p>¿Posponer vacaciones de <strong>{confirmAction.label}</strong>?</p>
              <Alert variant="info" className="py-2 mb-0">
                <i className="bx bx-info-circle me-1"></i>
                Los días de ley serán acumulados para el próximo período vacacional.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setConfirmAction(null)}>Cancelar</Button>
          <Button
            variant={confirmAction?.type === 'pagar' ? 'success' : 'warning'}
            onClick={() => {
              if (confirmAction?.type === 'pagar') handlePagar()
              else if (confirmAction?.type === 'reintegrar') handleReintegrar()
              else if (confirmAction?.type === 'posponer') handlePosponer()
              else handleTerminar()
            }}
            disabled={actionLoading}
          >
            {actionLoading ? <><Spinner size="sm" className="me-1" />Procesando...</> : 'Confirmar'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={perfilEmpleadoId !== null} onHide={() => { setPerfilEmpleadoId(null); setPerfilData(null) }} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title><i className="bx bx-user me-2"></i>Perfil del Empleado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingPerfil ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : perfilData ? (
            <div className="row">
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Datos Personales</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr><td className="fw-semibold bg-light" style={{ width: '40%' }}>Cédula</td><td>{perfilData.datos_personales.cedula}</td></tr>
                    <tr><td className="fw-semibold bg-light">Nombres</td><td>{perfilData.datos_personales.nombres}</td></tr>
                    <tr><td className="fw-semibold bg-light">Apellidos</td><td>{perfilData.datos_personales.apellidos}</td></tr>
                    <tr><td className="fw-semibold bg-light">Cargo CET</td><td>{perfilData.datos_laborales.cargo_cet || '-'}</td></tr>
                    <tr><td className="fw-semibold bg-light">Cargo ONAPRE</td><td>{perfilData.datos_laborales.cargo_onapre || '-'}</td></tr>
                    <tr><td className="fw-semibold bg-light">Salario Base</td><td>{formatCurrency(perfilData.datos_laborales.salario_base)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Fecha Ingreso</td><td>{formatDate(perfilData.datos_personales.fecha_ingreso)}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Resumen de Vacaciones</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr><td className="fw-semibold bg-light" style={{ width: '50%' }}>Días Base Anuales</td><td>{perfilData.vacaciones.dias_base_anual}</td></tr>
                    <tr><td className="fw-semibold bg-light">Días Consumidos (año)</td><td>{perfilData.vacaciones.dias_consumidos_anio}</td></tr>
                    <tr><td className="fw-semibold bg-light">Días Pendientes</td><td className="fw-bold text-primary">{perfilData.vacaciones.dias_pendientes}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-muted text-center py-4">No se encontraron datos del empleado.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
        </Modal.Footer>
      </Modal>

      <Modal show={reciboEmpleadoId !== null} onHide={() => { setReciboEmpleadoId(null); setReciboData(null) }} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title><i className="bx bx-receipt me-2"></i>Recibo de Vacaciones</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reciboLoading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : reciboData ? (
            <div className="row">
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Datos del Empleado</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr><td className="fw-semibold bg-light" style={{ width: '40%' }}>Cédula</td><td>{reciboData.empleado.cedula}</td></tr>
                    <tr><td className="fw-semibold bg-light">Nombres</td><td>{reciboData.empleado.nombres} {reciboData.empleado.apellidos}</td></tr>
                    <tr><td className="fw-semibold bg-light">Cargo CET</td><td>{reciboData.empleado.cargo_cet || '-'}</td></tr>
                    <tr><td className="fw-semibold bg-light">F. Ingreso</td><td>{formatDate(reciboData.empleado.fecha_ingreso)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Antigüedad</td><td>{reciboData.empleado.anios_antiguedad} años</td></tr>
                    <tr><td className="fw-semibold bg-light">Cuenta Bancaria</td><td>{reciboData.empleado.nro_cuenta_bancaria || '-'}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Bono Vacacional</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr><td className="fw-semibold bg-light" style={{ width: '50%' }}>Sueldo Básico</td><td>{formatCurrency(reciboData.lineas_recibo.sueldo_basico)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Prima Antigüedad</td><td>{formatCurrency(reciboData.lineas_recibo.prima_antiguedad)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Prima Profesionalización</td><td>{formatCurrency(reciboData.lineas_recibo.prima_profesionalizacion)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Prima Transporte</td><td>{formatCurrency(reciboData.lineas_recibo.prima_transporte)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Prima Hogares</td><td>{formatCurrency(reciboData.lineas_recibo.prima_hogares)}</td></tr>
                    <tr><td className="fw-semibold bg-light border-top fw-bold">Total Mensual</td><td className="border-top fw-bold">{formatCurrency(reciboData.lineas_recibo.total_sueldo_mensual)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Días Bono Vac.</td><td>{reciboData.lineas_recibo.dias_bono_vacacional}</td></tr>
                    <tr><td className="fw-semibold bg-light text-success">Bono Vacacional</td><td className="text-success fw-bold">{formatCurrency(reciboData.lineas_recibo.bono_vacacional)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-muted text-center py-4">No se encontraron datos del recibo.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setReciboEmpleadoId(null); setReciboData(null) }}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default VacacionesGestion
