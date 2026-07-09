import React, { useEffect, useMemo, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Table from 'react-bootstrap/Table'
import Spinner from 'react-bootstrap/Spinner'
import Alert from '../../components/atoms/Alert'
import { useSelectsDependientes } from '../../hooks/useSelectsDependientes'

const formInicial = {
  fecha_inicio: '',
  fecha_corte: '',
  cargo_cet_id: '',
  cargo_onapre_id: '',
  nivel_salarial_id: '',
  direccion_id: '',
  division_id: '',
  unidad_id: '',
  observacion: ''
}

function calcularFechaCorte(fechaInicio) {
  if (!fechaInicio) return ''
  const [anio, mes] = fechaInicio.split('-').map(Number)
  const ultimoDia = new Date(anio, mes, 0).getDate()
  const diaCorte = Math.min(30, ultimoDia)
  return `${anio}-${String(mes).padStart(2, '0')}-${String(diaCorte).padStart(2, '0')}`
}

function formatFecha(fecha) {
  if (!fecha) return '-'
  const date = new Date(fecha)
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
  return date.toLocaleDateString('es-VE')
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(Number(value || 0))
}

export default function ModalRetroactivos({ show, handleClose, empleado_id, onChanged }) {
  const [funcionario, setFuncionario] = useState(null)
  const [retroactivos, setRetroactivos] = useState([])
  const [catalogos, setCatalogos] = useState({
    cargosCET: [],
    cargosONAPRE: [],
    niveles: [],
    direcciones: [],
    divisiones: [],
    unidades: []
  })
  const [formData, setFormData] = useState(formInicial)
  const [editingId, setEditingId] = useState(null)
  const [tipoNominaPago, setTipoNominaPago] = useState('2')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const {
    cargosCETFiltrados,
    divisionesFiltradas,
    unidadesFiltradas
  } = useSelectsDependientes(formData, catalogos)

  const empleadoNombre = useMemo(() => {
    if (!funcionario) return 'Cargando...'
    return `${funcionario.nombres || ''} ${funcionario.apellidos || ''}`.trim()
  }, [funcionario])

  const flash = (setter, msg, ms = 3500) => {
    setter(msg)
    setTimeout(() => setter(''), ms)
  }

  const resetForm = () => {
    setFormData(formInicial)
    setEditingId(null)
  }

  const cargarCatalogos = async () => {
    const [resCet, resOnapre, resDir, resDiv, resUni] = await Promise.all([
      fetch('/api/rrhh/cargos-cet'),
      fetch('/api/rrhh/cargos-onapre'),
      fetch('/api/rrhh/direcciones'),
      fetch('/api/rrhh/divisiones'),
      fetch('/api/rrhh/unidades')
    ])

    const [cetData, onapreData, dirData, divData, uniData] = await Promise.all([
      resCet.json(), resOnapre.json(), resDir.json(), resDiv.json(), resUni.json()
    ])

    setCatalogos(prev => ({
      ...prev,
      cargosCET: Array.isArray(cetData) ? cetData : cetData.data || [],
      cargosONAPRE: Array.isArray(onapreData) ? onapreData : onapreData.data || [],
      direcciones: Array.isArray(dirData) ? dirData : dirData.data || [],
      divisiones: Array.isArray(divData) ? divData : divData.data || [],
      unidades: Array.isArray(uniData) ? uniData : uniData.data || []
    }))
  }

  const cargarDatos = async () => {
    if (!empleado_id) return
    setLoading(true)
    setError('')

    try {
      const [resFuncionario, resRetroactivos] = await Promise.all([
        fetch(`/api/rrhh/funcionarios/${empleado_id}?type=full`),
        fetch(`/api/rrhh/retroactivos/empleado/${empleado_id}`)
      ])

      const funcionarioData = await resFuncionario.json()
      const retroData = await resRetroactivos.json()

      if (!resFuncionario.ok) throw new Error(funcionarioData.error || 'No se pudo cargar el funcionario.')
      if (!resRetroactivos.ok) throw new Error(retroData.error || 'No se pudieron cargar los retroactivos.')

      setFuncionario(funcionarioData.datos_personales || funcionarioData)
      setRetroactivos(retroData.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!show || !empleado_id) return
    resetForm()
    setError('')
    setSuccessMsg('')
    cargarCatalogos()
    cargarDatos()
  }, [show, empleado_id])

  useEffect(() => {
    const cargarNiveles = async () => {
      if (!formData.cargo_onapre_id || !show) return

      try {
        const res = await fetch(`/api/rrhh/niveles-salariales?cargo_onapre_id=${formData.cargo_onapre_id}`)
        const nivelesData = await res.json()
        const data = nivelesData.success ? nivelesData.data : nivelesData
        setCatalogos(prev => ({ ...prev, niveles: Array.isArray(data) ? data : [] }))
      } catch (err) {
        console.error('Error cargando niveles salariales:', err)
      }
    }

    cargarNiveles()
  }, [formData.cargo_onapre_id, show])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData(prev => {
      const next = { ...prev, [name]: value }

      if (name === 'fecha_inicio') {
        next.fecha_corte = calcularFechaCorte(value)
      }
      if (name === 'direccion_id') {
        next.division_id = ''
        next.unidad_id = ''
      }
      if (name === 'division_id') {
        next.unidad_id = ''
      }
      if (name === 'cargo_onapre_id') {
        next.cargo_cet_id = ''
        next.nivel_salarial_id = ''
      }

      return next
    })
  }

  const validarForm = () => {
    const requeridos = ['fecha_inicio', 'cargo_onapre_id', 'cargo_cet_id', 'nivel_salarial_id', 'direccion_id']
    return requeridos.every(campo => Boolean(formData[campo]))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!validarForm()) {
      setError('Complete todos los campos obligatorios (*).')
      return
    }

    setSaving(true)
    try {
      const payload = {
        fecha_inicio: formData.fecha_inicio,
        fecha_corte: formData.fecha_corte,
        cargo_cet_id: formData.cargo_cet_id,
        cargo_onapre_id: formData.cargo_onapre_id,
        nivel_salarial_id: formData.nivel_salarial_id,
        direccion_id: formData.direccion_id,
        division_id: formData.division_id || null,
        unidad_id: formData.unidad_id || null,
        observacion: formData.observacion
      }
      const url = editingId
        ? `/api/rrhh/retroactivos/empleado/${empleado_id}/${editingId}`
        : `/api/rrhh/retroactivos/empleado/${empleado_id}`
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      if (!res.ok || !data.ok) throw new Error(data.error || 'No se pudo guardar el retroactivo.')

      flash(setSuccessMsg, editingId ? 'Retroactivo actualizado correctamente.' : 'Retroactivo registrado correctamente.')
      resetForm()
      await cargarDatos()
      onChanged?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEditar = (retroactivo) => {
    setEditingId(retroactivo.retroactivo_id)
    setFormData({
      fecha_inicio: retroactivo.fecha_inicio?.slice(0, 10) || '',
      fecha_corte: retroactivo.fecha_corte?.slice(0, 10) || '',
      cargo_cet_id: retroactivo.cargo_cet_id || '',
      cargo_onapre_id: retroactivo.cargo_onapre_id || '',
      nivel_salarial_id: retroactivo.nivel_salarial_id || '',
      direccion_id: retroactivo.direccion_id || '',
      division_id: retroactivo.division_id || '',
      unidad_id: retroactivo.unidad_id || '',
      observacion: retroactivo.observacion || ''
    })
  }

  const handleEliminar = async (retroactivoId) => {
    if (!window.confirm('¿Eliminar este retroactivo pendiente?')) return
    setError('')

    try {
      const res = await fetch(`/api/rrhh/retroactivos/${retroactivoId}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok || !data.ok) throw new Error(data.error || 'No se pudo eliminar el retroactivo.')

      flash(setSuccessMsg, 'Retroactivo eliminado correctamente.')
      await cargarDatos()
      onChanged?.()
    } catch (err) {
      setError(err.message)
    }
  }

  const handlePagar = async (retroactivoId) => {
    if (!window.confirm('¿Marcar este retroactivo como pagado e impactarlo en nómina de activos?')) return
    setError('')

    try {
      const res = await fetch(`/api/rrhh/retroactivos/${retroactivoId}/pagar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoNomina: tipoNominaPago })
      })
      const data = await res.json()

      if (!res.ok || !data.ok) throw new Error(data.error || 'No se pudo pagar el retroactivo.')

      flash(setSuccessMsg, 'Retroactivo pagado e incorporado a la nómina correspondiente.')
      await cargarDatos()
      onChanged?.()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered backdrop="static">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <i className="bx bx-receipt me-2 text-primary"></i>
          Retroactivos - <span className="text-primary">{empleadoNombre}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert type="danger">{error}</Alert>}
        {successMsg && <Alert type="success">{successMsg}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Cargando retroactivos...</p>
          </div>
        ) : (
          <>
            <div className="bg-light p-3 rounded border mb-4">
              <h6 className="text-primary mb-3">
                <i className={`bx ${editingId ? 'bx-edit' : 'bx-plus-circle'} me-1`}></i>
                {editingId ? 'Editar Retroactivo' : 'Registrar Retroactivo'}
              </h6>

              <Form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Fecha de Inicio *</Form.Label>
                      <Form.Control type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Fecha de Corte (auto)</Form.Label>
                      <Form.Control type="date" value={formData.fecha_corte} readOnly disabled className="bg-light" />
                      {formData.fecha_inicio && formData.fecha_corte && (
                        <Form.Text className="text-info fw-bold">
                          <i className="bx bx-calendar-check me-1"></i>
                          {(() => {
                            const inicio = new Date(`${formData.fecha_inicio}T00:00:00`)
                            const corte = new Date(`${formData.fecha_corte}T00:00:00`)
                            if (isNaN(inicio) || isNaN(corte) || corte < inicio) return ''
                            const dias = Math.floor((corte - inicio) / 86400000) + 1
                            return `${dias} día${dias !== 1 ? 's' : ''} de diferencia`
                          })()}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Cargo ONAPRE *</Form.Label>
                      <Form.Select name="cargo_onapre_id" value={formData.cargo_onapre_id} onChange={handleChange}>
                        <option value="">Seleccione</option>
                        {catalogos.cargosONAPRE.map(cargo => (
                          <option key={cargo.cargo_onapre_id} value={cargo.cargo_onapre_id}>{cargo.nombre}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Cargo CET *</Form.Label>
                      <Form.Select name="cargo_cet_id" value={formData.cargo_cet_id} onChange={handleChange} disabled={!formData.cargo_onapre_id}>
                        <option value="">Seleccione</option>
                        {cargosCETFiltrados.map(cargo => (
                          <option key={cargo.cargo_cet_id} value={cargo.cargo_cet_id}>{cargo.nombre}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Nivel Salarial *</Form.Label>
                      <Form.Select name="nivel_salarial_id" value={formData.nivel_salarial_id} onChange={handleChange} disabled={!formData.cargo_onapre_id}>
                        <option value="">Seleccione</option>
                        {catalogos.niveles.map(nivel => (
                          <option key={nivel.nivel_salarial_id} value={nivel.nivel_salarial_id}>
                            {nivel.nombre} - {formatCurrency(nivel.salario_base)}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Dirección *</Form.Label>
                      <Form.Select name="direccion_id" value={formData.direccion_id} onChange={handleChange}>
                        <option value="">Seleccione</option>
                        {catalogos.direcciones.map(dir => (
                          <option key={dir.direccion_id} value={dir.direccion_id}>{dir.nombre}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">División (Opcional)</Form.Label>
                      <Form.Select name="division_id" value={formData.division_id} onChange={handleChange} disabled={!formData.direccion_id}>
                        <option value="">Directo a la Dirección</option>
                        {divisionesFiltradas.map(div => (
                          <option key={div.division_id} value={div.division_id}>{div.nombre}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Unidad (Opcional)</Form.Label>
                      <Form.Select name="unidad_id" value={formData.unidad_id} onChange={handleChange} disabled={!formData.direccion_id}>
                        <option value="">Sin unidad</option>
                        {unidadesFiltradas.map(unidad => (
                          <option key={unidad.unidad_id} value={unidad.unidad_id}>{unidad.nombre}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-9">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Observaciones</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="observacion"
                        value={formData.observacion}
                        onChange={handleChange}
                        placeholder="Motivo del retroactivo..."
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-3 d-flex align-items-end gap-2">
                    <Button type="submit" variant="primary" className="w-100" disabled={saving}>
                      {saving ? <><Spinner size="sm" className="me-1" />Guardando...</> : <><i className="bx bx-save me-1"></i>{editingId ? 'Actualizar' : 'Agregar'}</>}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline-secondary" onClick={resetForm}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </Form>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="m-0 text-secondary">
                <i className="bx bx-history me-1"></i>Historial de Retroactivos
              </h6>
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted">Pagar en:</span>
                <Form.Select size="sm" value={tipoNominaPago} onChange={event => setTipoNominaPago(event.target.value)} style={{ width: 210 }}>
                  <option value="2">Segunda Quincena (2)</option>
                  <option value="unificada">Nómina Unificada</option>
                </Form.Select>
              </div>
            </div>

            <Table bordered hover responsive size="sm" className="align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>Inicio</th>
                  <th>Corte</th>
                  <th>Cargo</th>
                  <th>Días</th>
                  <th>Δ Sueldo</th>
                  <th>Δ Antig.</th>
                  <th>Δ Prof.</th>
                  <th>Δ Jer.</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th style={{ width: 150 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {retroactivos.length > 0 ? retroactivos.map(item => (
                  <tr key={item.retroactivo_id}>
                    <td>{formatFecha(item.fecha_inicio)}</td>
                    <td>{formatFecha(item.fecha_corte)}</td>
                    <td className="text-start">
                      <div className="fw-semibold">{item.cargo_cet_nombre || '-'}</div>
                      <small className="text-muted">{item.nivel_salarial_nombre || item.cargo_onapre_nombre || '-'}</small>
                    </td>
                    <td>{item.dias_diferencia}</td>
                    <td className="text-end">{formatCurrency(item.delta_sueldo)}</td>
                    <td className="text-end">{formatCurrency(item.delta_antiguedad)}</td>
                    <td className="text-end">{formatCurrency(item.delta_profesionalizacion)}</td>
                    <td className="text-end">{formatCurrency(item.delta_jerarquia)}</td>
                    <td className="text-end fw-bold">{formatCurrency(item.monto_retroactivo)}</td>
                    <td>
                      {item.estado === 'PAGADO'
                        ? <span className="badge bg-success">Pagado</span>
                        : <span className="badge bg-warning text-dark">Pendiente</span>
                      }
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-1">
                        <button className="btn btn-sm btn-outline-primary" title="Visualizar" onClick={() => handleEditar(item)}>
                          <i className="bx bx-show"></i>
                        </button>
                        {item.estado === 'PENDIENTE' && (
                          <>
                            <button className="btn btn-sm btn-outline-success" title="Pagar retroactivo" onClick={() => handlePagar(item.retroactivo_id)}>
                              <i className="bx bx-money"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" title="Eliminar" onClick={() => handleEliminar(item.retroactivo_id)}>
                              <i className="bx bx-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="11" className="text-muted py-4">No hay retroactivos registrados.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cerrar Ventana</Button>
      </Modal.Footer>
    </Modal>
  )
}
