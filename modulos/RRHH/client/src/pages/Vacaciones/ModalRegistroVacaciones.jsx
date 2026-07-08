import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap'
import { API, STATUS, formatDate, formatCurrency } from './utils/vacacionesUtils'
import { useNotifications } from '../../hooks/NotificationContext'

export const ModalRegistroVacaciones = ({ show, onHide, tipoEmpleado, onSuccess, onError }) => {
  const { refreshNotifications } = useNotifications();
  const [wizardStep, setWizardStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [fechaInicio, setFechaInicio] = useState('')
  const [diasSolicitados, setDiasSolicitados] = useState(1)
  const [simulacion, setSimulacion] = useState(null)
  const [saving, setSaving] = useState(false)
  const [observaciones, setObservaciones] = useState('')

  const getLocalDateStr = () => new Date().toLocaleDateString('en-CA')

  // Reset state when modal opens
  useEffect(() => {
    if (show) {
      setWizardStep(1)
      setSelectedEmp(null)
      setSearchQuery('')
      setSearchResults([])
      setFechaInicio(getLocalDateStr())
      setDiasSolicitados(1)
      setSimulacion(null)
      setObservaciones('')
    }
  }, [show])

  // Debounced employee search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length < 2) { setSearchResults([]); return }
      try {
        const res = await fetch(`${API}/buscar-empleados?q=${encodeURIComponent(searchQuery)}&tipo=${tipoEmpleado || ''}`)
        if (res.ok) setSearchResults(await res.json())
      } catch (err) { console.error(err) }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, tipoEmpleado])

  // Auto-fetch recommended days when entering step 2
  useEffect(() => {
    if (show && selectedEmp && fechaInicio && wizardStep === 2) {
      const fetchProyeccion = async () => {
        try {
          const res = await fetch(`${API}/calcular`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empleado_id: selectedEmp.empleado_id, fecha_inicio: fechaInicio })
          })
          const data = await res.json()
          if (res.ok && data.total_dias_disfrute) setDiasSolicitados(data.total_dias_disfrute)
        } catch (err) { console.error('Error calculando proyección inicial:', err) }
      }
      fetchProyeccion()
    }
  }, [show, selectedEmp, fechaInicio, wizardStep])

  // Recalculate balance whenever inputs change
  useEffect(() => {
    if (!show || !selectedEmp || diasSolicitados <= 0 || !fechaInicio) return
    const calcularSaldo = async () => {
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
        onError(err.message)
        setSimulacion(null)
      }
    }
    calcularSaldo()
  }, [show, selectedEmp, diasSolicitados, fechaInicio])

  const excedeSaldo = simulacion && diasSolicitados > simulacion.saldo_disponible_real

  const nextStep = () => {
    if (wizardStep === 1 && !selectedEmp) return onError('Selecciona un empleado para continuar')
    if (wizardStep === 2 && !simulacion) return onError('Completa la programación de fechas para continuar')
    setWizardStep(prev => Math.min(3, prev + 1))
  }
  const prevStep = () => setWizardStep(prev => Math.max(1, prev - 1))

  const sectionBadge = (label, step) => (
    <span className={`badge me-2 ${wizardStep === step ? 'bg-primary' : wizardStep > step ? 'bg-success' : 'bg-secondary'}`}>
      {wizardStep > step ? <i className="bx bx-check"></i> : step}
    </span>
  )

  const handleSubmit = async () => {
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
          periodo_id: new Date(fechaInicio).getFullYear(),
          observaciones: observaciones.trim()
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al registrar')
      const statusName = data.id_status_vacaciones === STATUS.DE_DISFRUTE ? 'De disfrute' : 'Programado'
      refreshNotifications()
      onSuccess(`Vacaciones registradas exitosamente (status: ${statusName})`)
      onHide()
    } catch (err) {
      onError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Registrar Vacaciones - Asistente ({wizardStep}/3)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* STEP 1: Selección de Empleado */}
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
                    <p className="mb-1"><strong>Antigüedad:</strong> {simulacion?.antiguedad_anios ?? '-'} años, {simulacion?.antiguedad_meses ?? '-'} meses, {simulacion?.antiguedad_dias ?? '-'} días</p>
                    <p className="mb-1"><strong>Clasificación:</strong> {simulacion?.tipo_empleado === 'obrero' ? 'Obrero' : 'Funcionario'}</p>
                    <p className="mb-0"><strong>Días por ley:</strong> {simulacion?.dias_disfrute_ley ?? '-'} días</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* STEP 2: Tiempos / Fechas */}
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
                  <Form.Label>Días a Disfrutar</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={simulacion?.saldo_disponible_real || 1}
                    value={diasSolicitados}
                    onChange={e => setDiasSolicitados(Number(e.target.value))}
                    isInvalid={!!excedeSaldo}
                  />
                  {excedeSaldo ? (
                    <div className="text-danger mt-1 small fw-bold">
                      <i className="bx bx-error-circle me-1"></i>
                      Error: Los días solicitados superan el saldo disponible ({simulacion.saldo_disponible_real} días).
                    </div>
                  ) : simulacion && (
                    <div className="mt-1">
                      <Form.Text className="text-primary d-block fw-bold mb-1">
                        <i className="bx bx-calendar me-1"></i>
                        Días Totales del Período: {simulacion.dias_totales_periodo}
                      </Form.Text>
                      <Form.Text className="text-muted d-block">
                        <i className="bx bx-info-circle me-1"></i>
                        Saldo disponible para este período: <strong>{simulacion.saldo_disponible_real}</strong> días &middot;
                        Restarán <strong>{Math.max(0, simulacion.saldo_disponible_real - diasSolicitados)}</strong> días
                      </Form.Text>
                    </div>
                  )}
                </Form.Group>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Observaciones (Opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Motivo o detalle adicional..."
                    value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                  />
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
                      <h5 className="mb-0 text-primary">{simulacion.antiguedad_anios ?? simulacion.anios_antiguedad ?? '-'} <small>años</small></h5>
                      <small className="text-muted">{simulacion.antiguedad_meses ?? '-'}m {simulacion.antiguedad_dias ?? '-'}d</small>
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

                  <div className="d-flex flex-wrap gap-3 mb-2">
                    <div className="text-center px-3 py-1 rounded border bg-white" style={{ flex: '1 1 100px' }}>
                      <div className="text-muted small">Días solicitados</div>
                      <strong className="text-primary" style={{ fontSize: '1.1rem' }}>{simulacion.dias_solicitados}</strong>
                    </div>
                    <div className="text-center px-3 py-1 rounded border bg-white" style={{ flex: '1 1 100px' }}>
                      <div className="text-muted small">Días disponibles</div>
                      <strong className="text-info" style={{ fontSize: '1.1rem' }}>{simulacion.saldo_disponible_real}</strong>
                    </div>
                    <div className="text-center px-3 py-1 rounded border bg-white" style={{ flex: '1 1 100px' }}>
                      <div className="text-muted small">Días restantes</div>
                      <strong className="text-success" style={{ fontSize: '1.1rem' }}>{Math.max(0, simulacion.saldo_disponible_real - simulacion.dias_solicitados)}</strong>
                    </div>
                  </div>
                  <Alert variant="primary" className="py-2 px-3 mb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div style={{ minWidth: '100%' }} className="border-bottom border-primary pb-2 mb-2">
                      <strong>Total de Días de Disfrute: </strong>
                      {simulacion.dias_disfrute_ley} hábiles &middot;
                      <span className="ms-2"><strong>Base:</strong> {simulacion.dias_base} <strong>Adicionales:</strong> {simulacion.dias_adicionales || 0}</span>
                    </div>
                    <div className="flex-grow-1 text-success fw-bold">
                      <i className="bx bx-calendar-check me-1"></i>
                      <span className="text-dark">Fin Real Disfrute:</span> {formatDate(simulacion.fecha_finalizacion_real)}
                    </div>
                    <div className="flex-grow-1 text-primary fw-bold text-end">
                      <i className="bx bx-log-in me-1"></i>
                      <span className="text-dark">Reintegro Laboral:</span> {formatDate(simulacion.fecha_reincorporacion)}
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

        {/* STEP 3: Confirmación */}
        {wizardStep === 3 && simulacion && (
          <>
            <div className="d-flex align-items-center mb-3">
              {sectionBadge('Control de Días', 3)}
              <h6 className="mb-0 fw-semibold">Control de Días</h6>
            </div>
            <div className="d-flex flex-wrap gap-3 mb-3">
              <div className="text-center px-3 py-1 rounded border bg-light" style={{ flex: '1 1 100px' }}>
                <div className="text-muted small">Días solicitados</div>
                <strong className="text-primary" style={{ fontSize: '1.1rem' }}>{simulacion.dias_solicitados}</strong>
              </div>
              <div className="text-center px-3 py-1 rounded border bg-light" style={{ flex: '1 1 100px' }}>
                <div className="text-muted small">Días disponibles</div>
                <strong className="text-info" style={{ fontSize: '1.1rem' }}>{simulacion.saldo_disponible_real}</strong>
              </div>
              <div className="text-center px-3 py-1 rounded border bg-light" style={{ flex: '1 1 100px' }}>
                <div className="text-muted small">Días restantes</div>
                <strong className="text-success" style={{ fontSize: '1.1rem' }}>{simulacion.nuevo_acumulado}</strong>
              </div>
            </div>
            <div className="card p-3 mb-3">
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-1"><strong>Empleado:</strong> {simulacion.nombres} {simulacion.apellidos}</p>
                  <p className="mb-1 text-success"><strong>Fin Real Disfrute:</strong> {formatDate(simulacion.fecha_finalizacion_real)}</p>
                  <p className="mb-1 text-primary"><strong>Reintegro Laboral:</strong> {formatDate(simulacion.fecha_reincorporacion)}</p>
                  <p className="mb-0 mt-2"><strong>Antigüedad:</strong> {simulacion.antiguedad_anios ?? simulacion.anios_antiguedad ?? '-'} años, {simulacion.antiguedad_meses ?? '-'} meses, {simulacion.antiguedad_dias ?? '-'} días</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1"><strong>Salario diario:</strong> {formatCurrency(simulacion.salario_diario)}</p>
                  <p className="mb-0"><strong>Días de ley:</strong> {simulacion.dias_disfrute_ley} hábiles</p>
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
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          {wizardStep < 3 ? (
            <Button
              variant="primary"
              onClick={nextStep}
              disabled={wizardStep === 2 && !!excedeSaldo}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleSubmit}
              disabled={!simulacion || saving || !!excedeSaldo}
            >
              {saving ? <><Spinner size="sm" className="me-1" />Guardando...</> : 'Confirmar y Guardar'}
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalRegistroVacaciones
