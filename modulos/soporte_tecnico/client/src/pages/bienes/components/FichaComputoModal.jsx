import { useCallback, useEffect, useState } from 'react'
import { Modal, Button, Form, Row, Col, Table, Spinner } from 'react-bootstrap'
import { FaPlus, FaTrashCan, FaPenToSquare, FaFloppyDisk, FaXmark, FaMicrochip } from 'react-icons/fa6'
import { toast } from 'react-toastify'
import api from '../../../utils/helpFetch.js'
import { useAuth } from '../../../context/AuthContext.jsx'

const TIPOS_COMPONENTE = [
  'Procesador',
  'Memoria RAM',
  'Almacenamiento (Disco)',
  'Tarjeta madre',
  'Fuente de poder',
  'Tarjeta de video',
  'Tarjeta de red',
  'Unidad optica',
  'Otro'
]

const CAMPOS_FORM = [
  'nombre_equipo',
  'sistema_operativo',
  'version_office',
  'marca',
  'modelo',
  'serial',
  'ip',
  'mac_address',
  'anydesk',
  'elaborado_por',
  'observaciones'
]

const FORM_VACIO = Object.fromEntries(CAMPOS_FORM.map(campo => [campo, '']))

const COMPONENTE_VACIO = {
  tipo: '',
  marca: '',
  modelo: '',
  serial: '',
  capacidad: '',
  nro_bien: '',
  observaciones: ''
}

function nuevoComponente (tipo = '') {
  return { ...COMPONENTE_VACIO, tipo }
}

function componentesIniciales () {
  return [
    nuevoComponente('Procesador'),
    nuevoComponente('Memoria RAM'),
    nuevoComponente('Almacenamiento (Disco)')
  ]
}

function formularioDesdeDetalle (detalle = {}) {
  return Object.fromEntries(CAMPOS_FORM.map(campo => [campo, detalle?.[campo] || '']))
}

function componentesDesdeApi (lista = []) {
  return lista.map(componente => ({
    id: componente.id,
    tipo: componente.tipo || '',
    marca: componente.marca || '',
    modelo: componente.modelo || '',
    serial: componente.serial || '',
    capacidad: componente.capacidad || '',
    nro_bien: componente.nro_bien || '',
    observaciones: componente.observaciones || ''
  }))
}

function claseBadgeComponente (tipo) {
  return !tipo || tipo === 'Sin especificar' ? 'badge-soft-gray' : 'badge-soft-blue'
}

function Dato ({ label, value, md = 6 }) {
  return (
    <Col xs={12} md={md}>
      <div className="text-muted small">{label}</div>
      <div className="fw-semibold text-body" style={{ whiteSpace: 'pre-wrap' }}>{value || '-'}</div>
    </Col>
  )
}

export default function FichaComputoModal ({ show, onHide, bien, onSaved }) {
  const { user } = useAuth()
  const puedeEditar = ['Administrador', 'Tecnico'].includes(user?.rol)

  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [existe, setExiste] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [componentes, setComponentes] = useState([])

  const cargar = useCallback(async (iniciarEdicion = true) => {
    if (!bien?.bim_ide) return

    setCargando(true)
    setEditando(false)
    setExiste(false)
    setForm(FORM_VACIO)
    setComponentes([])
    try {
      const data = await api.get(`/bienes/${encodeURIComponent(bien.bim_ide)}/ficha`)
      const detalle = data?.detalle || null
      const lista = Array.isArray(data?.componentes) ? data.componentes : []

      setForm(formularioDesdeDetalle(detalle || {}))
      setComponentes(componentesDesdeApi(lista))
      setExiste(Boolean(detalle) || lista.length > 0)

      if (iniciarEdicion && !detalle && lista.length === 0 && puedeEditar) {
        setComponentes(componentesIniciales())
        setEditando(true)
      } else {
        setEditando(false)
      }
    } catch (error) {
      toast.error(error.message || 'No se pudo cargar la ficha tecnica')
      setEditando(false)
    } finally {
      setCargando(false)
    }
  }, [bien?.bim_ide, puedeEditar])

  useEffect(() => {
    if (show) cargar(true)
  }, [show, cargar])

  const setField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const setComponente = (index, name, value) => {
    setComponentes(prev => prev.map((componente, i) => (
      i === index ? { ...componente, [name]: value } : componente
    )))
  }

  const agregarComponente = () => {
    setComponentes(prev => [...prev, nuevoComponente()])
  }

  const eliminarComponente = (index) => {
    setComponentes(prev => prev.filter((_, i) => i !== index))
  }

  const iniciarEdicion = () => {
    if (!existe && componentes.length === 0) {
      setComponentes(componentesIniciales())
    }
    setEditando(true)
  }

  const cancelar = async () => {
    await cargar(false)
  }

  const guardar = async (event) => {
    event.preventDefault()

    const componentesConDatos = componentes.filter(componente => (
      Object.entries(componente).some(([campo, valor]) => (
        campo !== 'id' && String(valor || '').trim() !== ''
      ))
    ))

    setGuardando(true)
    try {
      const respuesta = await api.put(
        `/bienes/${encodeURIComponent(bien.bim_ide)}/ficha`,
        { ...form, componentes: componentesConDatos }
      )

      const data = respuesta?.data || {}
      setForm(formularioDesdeDetalle(data.detalle || {}))
      setComponentes(componentesDesdeApi(data.componentes || []))
      setExiste(Boolean(data.detalle) || (data.componentes || []).length > 0)
      setEditando(false)
      toast.success(respuesta?.message || 'Ficha tecnica guardada correctamente')
      onSaved?.()
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar la ficha tecnica')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    const confirmado = window.confirm(
      'Se eliminara la ficha tecnica de este computador. El bien mueble no se modifica. ¿Desea continuar?'
    )
    if (!confirmado) return

    setGuardando(true)
    try {
      await api.delete(`/bienes/${encodeURIComponent(bien.bim_ide)}/ficha`)
      setForm(FORM_VACIO)
      setComponentes([])
      setExiste(false)
      setEditando(false)
      toast.success('Ficha tecnica eliminada correctamente')
      onSaved?.()
      onHide?.()
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar la ficha tecnica')
    } finally {
      setGuardando(false)
    }
  }

  const tieneDatos = existe || Object.values(form).some(Boolean) || componentes.length > 0

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      dialogClassName="ficha-computo-modal"
      backdrop={guardando ? 'static' : true}
      keyboard={!guardando}
    >
      <Form onSubmit={guardar}>
        <Modal.Header closeButton={!guardando}>
          <Modal.Title style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            <FaMicrochip className="me-2" />
            Ficha tecnica {bien?.bim_ide ? `- ${bien.bim_ide}` : ''}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {cargando ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="me-2" />
              <span className="text-muted">Cargando ficha tecnica...</span>
            </div>
          ) : editando ? (
            <>
              <div className="mb-3">
                <div className="text-muted small">Bien mueble</div>
                <div className="fw-semibold">
                  {bien?.bim_ide} - {bien?.bim_des || 'Sin descripcion'}
                </div>
              </div>

              <h6 className="section-title mb-3">Identificacion del equipo</h6>
              <Row className="g-3 mb-4">
                <Col xs={12} md={4}>
                  <Form.Group controlId="fichaNombreEquipo">
                    <Form.Label className="small fw-semibold">Nombre en red</Form.Label>
                    <Form.Control
                      value={form.nombre_equipo}
                      onChange={e => setField('nombre_equipo', e.target.value)}
                      maxLength={100}
                      placeholder="Ej. AUDITORIA-PC01"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group controlId="fichaMarca">
                    <Form.Label className="small fw-semibold">Marca</Form.Label>
                    <Form.Control
                      value={form.marca}
                      onChange={e => setField('marca', e.target.value)}
                      maxLength={100}
                      placeholder="Ej. HP"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group controlId="fichaModelo">
                    <Form.Label className="small fw-semibold">Modelo</Form.Label>
                    <Form.Control
                      value={form.modelo}
                      onChange={e => setField('modelo', e.target.value)}
                      maxLength={150}
                      placeholder="Ej. ProDesk 400 G7"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group controlId="fichaSerial">
                    <Form.Label className="small fw-semibold">Serial</Form.Label>
                    <Form.Control
                      value={form.serial}
                      onChange={e => setField('serial', e.target.value)}
                      maxLength={100}
                      placeholder="Serial del equipo"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group controlId="fichaSistemaOperativo">
                    <Form.Label className="small fw-semibold">Sistema operativo</Form.Label>
                    <Form.Control
                      value={form.sistema_operativo}
                      onChange={e => setField('sistema_operativo', e.target.value)}
                      maxLength={100}
                      placeholder="Ej. Windows 11 Pro"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group controlId="fichaVersionOffice">
                    <Form.Label className="small fw-semibold">Version de Office</Form.Label>
                    <Form.Control
                      value={form.version_office}
                      onChange={e => setField('version_office', e.target.value)}
                      maxLength={100}
                      placeholder="Ej. 2021 LTSC"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h6 className="section-title mb-3">Red y soporte remoto</h6>
              <Row className="g-3 mb-4">
                <Col xs={12} md={4}>
                  <Form.Group controlId="fichaIp">
                    <Form.Label className="small fw-semibold">Direccion IP</Form.Label>
                    <Form.Control
                      value={form.ip}
                      onChange={e => setField('ip', e.target.value)}
                      maxLength={45}
                      placeholder="Ej. 192.168.1.50"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group controlId="fichaMac">
                    <Form.Label className="small fw-semibold">Direccion MAC</Form.Label>
                    <Form.Control
                      value={form.mac_address}
                      onChange={e => setField('mac_address', e.target.value)}
                      maxLength={17}
                      placeholder="Ej. 00:1A:2B:3C:4D:5E"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group controlId="fichaAnydesk">
                    <Form.Label className="small fw-semibold">AnyDesk / acceso remoto</Form.Label>
                    <Form.Control
                      value={form.anydesk}
                      onChange={e => setField('anydesk', e.target.value)}
                      maxLength={50}
                      placeholder="Ej. 123 456 789"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <div>
                  <h6 className="section-title mb-0">Componentes del computador</h6>
                  <div className="text-muted small">
                    Todos los campos son opcionales. Puede registrar varias memorias RAM o discos; las filas sin datos no se guardan.
                  </div>
                </div>
                <Button type="button" variant="outline-primary" size="sm" onClick={agregarComponente}>
                  <FaPlus className="me-1" /> Agregar componente
                </Button>
              </div>

              <div className="table-responsive ficha-componentes-table mb-4">
                <Table size="sm" className="table-hover table-cet mb-0 align-middle">
                  <thead>
                    <tr className="small">
                      <th style={{ minWidth: 150 }}>Tipo</th>
                      <th style={{ minWidth: 120 }}>Marca</th>
                      <th style={{ minWidth: 140 }}>Modelo</th>
                      <th style={{ minWidth: 130 }}>Serial</th>
                      <th style={{ minWidth: 110 }}>Capacidad</th>
                      <th style={{ minWidth: 110 }}>Nro. bien</th>
                      <th style={{ minWidth: 160 }}>Observaciones</th>
                      <th className="text-center" style={{ width: 44 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {componentes.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center text-muted py-3">
                          No hay componentes agregados.
                        </td>
                      </tr>
                    )}

                    {componentes.map((componente, index) => (
                      <tr key={componente.id || `nuevo-${index}`}>
                        <td>
                          <Form.Select
                            size="sm"
                            value={componente.tipo}
                            onChange={e => setComponente(index, 'tipo', e.target.value)}
                          >
                            <option value="">Sin especificar</option>
                            {TIPOS_COMPONENTE.map(tipo => (
                              <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                            {componente.tipo && !TIPOS_COMPONENTE.includes(componente.tipo) && (
                              <option value={componente.tipo}>{componente.tipo}</option>
                            )}
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            value={componente.marca}
                            onChange={e => setComponente(index, 'marca', e.target.value)}
                            maxLength={100}
                            placeholder="Marca"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            value={componente.modelo}
                            onChange={e => setComponente(index, 'modelo', e.target.value)}
                            maxLength={150}
                            placeholder="Modelo"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            value={componente.serial}
                            onChange={e => setComponente(index, 'serial', e.target.value)}
                            maxLength={100}
                            placeholder="Serial"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            value={componente.capacidad}
                            onChange={e => setComponente(index, 'capacidad', e.target.value)}
                            maxLength={100}
                            placeholder="Ej. 16 GB"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            value={componente.nro_bien}
                            onChange={e => setComponente(index, 'nro_bien', e.target.value)}
                            maxLength={50}
                            placeholder="Nro. bien"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            value={componente.observaciones}
                            onChange={e => setComponente(index, 'observaciones', e.target.value)}
                            maxLength={255}
                            placeholder="Observaciones"
                          />
                        </td>
                        <td className="text-center">
                          <Button
                            type="button"
                            variant="outline-danger"
                            size="sm"
                            title="Eliminar componente"
                            onClick={() => eliminarComponente(index)}
                          >
                            <FaTrashCan />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <h6 className="section-title mb-3">Responsable y observaciones</h6>
              <Row className="g-3">
                <Col xs={12} md={5}>
                  <Form.Group controlId="fichaElaboradoPor">
                    <Form.Label className="small fw-semibold">Elaborado por</Form.Label>
                    <Form.Control
                      value={form.elaborado_por}
                      onChange={e => setField('elaborado_por', e.target.value)}
                      maxLength={100}
                      placeholder="Nombre del tecnico"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={7}>
                  <Form.Group controlId="fichaObservaciones">
                    <Form.Label className="small fw-semibold">Observaciones</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={form.observaciones}
                      onChange={e => setField('observaciones', e.target.value)}
                      maxLength={4000}
                      placeholder="Detalle adicional del equipo..."
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <div className="mb-3">
                <div className="text-muted small">Bien mueble</div>
                <div className="fw-semibold">
                  {bien?.bim_ide} - {bien?.bim_des || 'Sin descripcion'}
                </div>
              </div>

              <h6 className="section-title mb-3">Datos del bien en Bienes Muebles</h6>
              <Row className="g-3 mb-4">
                <Dato label="Tipo de soporte" value={bien?.tipo_soporte} />
                <Dato label="Marca" value={bien?.marca} />
                <Dato label="Modelo" value={bien?.modelo} />
                <Dato label="Serial" value={bien?.bim_ser} />
                <Dato label="Departamento" value={bien?.departamento} />
                <Dato label="Estado" value={bien?.estado} />
              </Row>

              {!tieneDatos ? (
                <div className="empty-state py-4">
                  <FaMicrochip />
                  <div>Este computador aun no tiene ficha tecnica registrada.</div>
                  {puedeEditar && (
                    <Button type="button" variant="primary" size="sm" className="mt-2" onClick={iniciarEdicion}>
                      <FaPenToSquare className="me-1" /> Registrar ficha tecnica
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <h6 className="section-title mb-3">Datos tecnicos</h6>
                  <Row className="g-3 mb-4">
                    <Dato label="Nombre en red" value={form.nombre_equipo} />
                    <Dato label="Sistema operativo" value={form.sistema_operativo} />
                    <Dato label="Version de Office" value={form.version_office} />
                    <Dato label="Marca tecnica" value={form.marca} />
                    <Dato label="Modelo tecnico" value={form.modelo} />
                    <Dato label="Serial tecnico" value={form.serial} />
                    <Dato label="Direccion IP" value={form.ip} />
                    <Dato label="Direccion MAC" value={form.mac_address} />
                    <Dato label="AnyDesk / acceso remoto" value={form.anydesk} />
                    <Dato label="Elaborado por" value={form.elaborado_por} />
                  </Row>

                  <h6 className="section-title mb-3">Componentes</h6>
                  <div className="table-responsive ficha-componentes-table mb-4">
                    <Table size="sm" className="table-hover table-cet mb-0">
                      <thead>
                        <tr className="small">
                          <th>Elemento</th>
                          <th>Marca</th>
                          <th>Modelo</th>
                          <th>Serial</th>
                          <th>Capacidad</th>
                          <th>Nro. bien</th>
                          <th>Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {componentes.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center text-muted py-3">
                              No hay componentes detallados registrados.
                            </td>
                          </tr>
                        ) : componentes.map((componente, index) => (
                          <tr key={componente.id || index}>
                            <td>
                              <span className={`badge ${claseBadgeComponente(componente.tipo)}`}>
                                {componente.tipo || 'Sin especificar'}
                              </span>
                            </td>
                            <td>{componente.marca || '-'}</td>
                            <td>{componente.modelo || '-'}</td>
                            <td>{componente.serial || '-'}</td>
                            <td>{componente.capacidad || '-'}</td>
                            <td>{componente.nro_bien || '-'}</td>
                            <td>{componente.observaciones || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  <h6 className="section-title mb-2">Observaciones</h6>
                  <p className="text-muted mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {form.observaciones || 'Sin observaciones'}
                  </p>
                </>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          {editando ? (
            <>
              <Button type="button" variant="light" onClick={cancelar} disabled={guardando}>
                <FaXmark className="me-1" /> Cancelar
              </Button>
              <Button type="submit" className="btn-cet" disabled={guardando || cargando}>
                <FaFloppyDisk className="me-1" />
                {guardando ? 'Guardando...' : 'Guardar ficha'}
              </Button>
            </>
          ) : (
            <>
              {existe && puedeEditar && (
                <Button type="button" variant="outline-danger" onClick={eliminar} disabled={guardando || cargando}>
                  <FaTrashCan className="me-1" /> Eliminar ficha
                </Button>
              )}
              <div className="ms-auto d-flex gap-2">
                {puedeEditar && (
                  <Button type="button" variant="primary" onClick={iniciarEdicion} disabled={cargando}>
                    <FaPenToSquare className="me-1" /> {existe ? 'Editar ficha' : 'Registrar ficha'}
                  </Button>
                )}
                <Button type="button" variant="outline-secondary" onClick={onHide}>
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
