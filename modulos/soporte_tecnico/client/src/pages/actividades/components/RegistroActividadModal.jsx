import { useEffect, useMemo, useState } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import api from '../../../utils/helpFetch.js'
import { toISODate } from '../../../utils/dateHelpers.js'
import { useAuth } from '../../../context/AuthContext.jsx'
import BienBuscador from './BienBuscador.jsx'

const FORM_VACIO = {
  fecha: toISODate(new Date()),
  departamento_id: '',
  clasificacion_id: '',
  tipo_actividad_id: '',
  bim_ide: '',
  observaciones: ''
}

export default function RegistroActividadModal ({
  show,
  onHide,
  onSaved,
  actividad,
  departamentos,
  clasificaciones,
  tipos,
  bienes
}) {
  const { user } = useAuth()
  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [numeroPreview, setNumeroPreview] = useState('')
  const [bienesDepartamento, setBienesDepartamento] = useState([])
  const [cargandoBienes, setCargandoBienes] = useState(false)

  const esEdicion = Boolean(actividad)

  useEffect(() => {
    if (!show) return

    if (actividad) {
      const tipoActual = tipos.find(t => Number(t.id) === Number(actividad.tipo_actividad_id))
      setForm({
        fecha: actividad.fecha ? String(actividad.fecha).slice(0, 10) : toISODate(new Date()),
        departamento_id: actividad.departamento_id ?? '',
        clasificacion_id: actividad.clasificacion_id ?? tipoActual?.clasificacion_id ?? '',
        tipo_actividad_id: actividad.tipo_actividad_id ?? '',
        bim_ide: actividad.bim_ide ?? '',
        observaciones: actividad.observaciones || ''
      })
      setNumeroPreview(actividad.nro_act || '')
    } else {
      setForm({
        ...FORM_VACIO,
        fecha: toISODate(new Date()),
        departamento_id: user?.departamento_id ?? ''
      })
      setNumeroPreview('')
      api.get('/actividades/proximo-numero')
        .then(data => setNumeroPreview(data.numero))
        .catch(() => setNumeroPreview(''))
    }
  }, [show, actividad, user, tipos])

  const clasificacionSeleccionada = useMemo(
    () => clasificaciones.find(c => Number(c.id) === Number(form.clasificacion_id)),
    [clasificaciones, form.clasificacion_id]
  )

  const tiposFiltrados = useMemo(() => {
    if (!form.clasificacion_id) return []
    return tipos.filter(t => Number(t.clasificacion_id) === Number(form.clasificacion_id))
  }, [tipos, form.clasificacion_id])

  const bienesFiltrados = useMemo(() => {
    const lista = form.departamento_id ? bienesDepartamento : bienes
    if (!form.bim_ide) return lista
    if (lista.some(b => String(b.bim_ide) === String(form.bim_ide))) return lista
    const actual = bienes.find(b => String(b.bim_ide) === String(form.bim_ide))
    return actual ? [actual, ...lista] : lista
  }, [bienes, bienesDepartamento, form.bim_ide, form.departamento_id])

  useEffect(() => {
    if (!show || !form.departamento_id) {
      setBienesDepartamento(bienes)
      setCargandoBienes(false)
      return
    }

    let activo = true
    setCargandoBienes(true)
    api.get(`/bienes?limit=1000&activo=1&departamento_id=${encodeURIComponent(form.departamento_id)}`)
      .then(data => {
        if (activo) setBienesDepartamento(data.data || [])
      })
      .catch(() => {
        if (activo) setBienesDepartamento(bienes)
      })
      .finally(() => {
        if (activo) setCargandoBienes(false)
      })

    return () => { activo = false }
  }, [show, form.departamento_id, bienes])

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }))

  const handleClasificacion = (value) => {
    setForm(prev => ({
      ...prev,
      clasificacion_id: value,
      tipo_actividad_id: ''
    }))
  }

  const handleDepartamento = (value) => {
    setForm(prev => ({
      ...prev,
      departamento_id: value,
      bim_ide: ''
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.fecha || !form.departamento_id) {
      toast.warning('La fecha y el departamento son obligatorios')
      return
    }
    if (!form.clasificacion_id) {
      toast.warning('Seleccione una clasificacion')
      return
    }
    if (!form.tipo_actividad_id) {
      toast.warning('Seleccione un tipo de actividad')
      return
    }

    const payload = {
      fecha: form.fecha,
      departamento_id: Number(form.departamento_id),
      clasificacion_id: Number(form.clasificacion_id),
      tipo_actividad_id: Number(form.tipo_actividad_id),
      bim_ide: form.bim_ide || null,
      observaciones: form.observaciones,
      usuario_id: user?.id
    }

    setGuardando(true)
    try {
      if (esEdicion) {
        await api.put(`/actividades/${actividad.id}`, payload)
        toast.success('Actividad actualizada correctamente')
      } else {
        await api.post('/actividades', payload)
        toast.success('Actividad registrada correctamente')
      }
      onSaved()
      onHide()
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar la actividad')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop={guardando ? 'static' : true}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!guardando}>
          <Modal.Title style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {esEdicion ? 'Editar actividad' : 'Registrar nueva actividad'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="g-3">
            <Col xs={12} md={4}>
              <Form.Group controlId="actFecha">
                <Form.Label className="small fw-semibold">Fecha *</Form.Label>
                <Form.Control
                  type="date"
                  value={form.fecha}
                  onChange={e => setField('fecha', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={8}>
              <Form.Group controlId="actNumero">
                <Form.Label className="small fw-semibold">Numero de actividad</Form.Label>
                <Form.Control
                  value={numeroPreview}
                  readOnly
                  placeholder="Se generara automaticamente"
                  style={{ background: '#f7f9fc' }}
                />
                <Form.Text className="text-muted">
                  {esEdicion
                    ? 'El numero de actividad no se modifica.'
                    : 'El sistema asigna el correlativo al guardar.'}
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="actDepartamento">
                <Form.Label className="small fw-semibold">Direccion / Departamento solicitante *</Form.Label>
                <Form.Select
                  value={form.departamento_id}
                  onChange={e => handleDepartamento(e.target.value)}
                  required
                >
                  <option value="">Seleccione un departamento</option>
                  {departamentos.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="actClasificacion">
                <Form.Label className="small fw-semibold">Clasificacion *</Form.Label>
                <Form.Select
                  value={form.clasificacion_id}
                  onChange={e => handleClasificacion(e.target.value)}
                  required
                >
                  <option value="">Seleccione una clasificacion</option>
                  {clasificaciones.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </Form.Select>
                {clasificacionSeleccionada && (
                  <Form.Text className="text-muted">
                    Tipos disponibles: <strong>{tiposFiltrados.length}</strong>
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="actTipo">
                <Form.Label className="small fw-semibold">Tipo de actividad *</Form.Label>
                <Form.Select
                  value={form.tipo_actividad_id}
                  onChange={e => setField('tipo_actividad_id', e.target.value)}
                  disabled={!form.clasificacion_id}
                  required
                >
                  <option value="">
                    {form.clasificacion_id
                      ? 'Seleccione un tipo'
                      : 'Primero seleccione una clasificacion'}
                  </option>
                  {tiposFiltrados.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Los tipos se cargan segun la clasificacion seleccionada.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="actBien">
                <Form.Label className="small fw-semibold">Bien mueble (opcional)</Form.Label>
                <BienBuscador
                  id="actBien"
                  value={form.bim_ide}
                  options={bienesFiltrados}
                  onChange={value => setField('bim_ide', value)}
                  loading={cargandoBienes}
                />
                <Form.Text className="text-muted">
                  Escriba el número o parte de la descripción para filtrar los bienes.
                  {!cargandoBienes && bienesFiltrados.length > 0 && ` (${bienesFiltrados.length} disponibles)`}
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="actObservaciones">
                <Form.Label className="small fw-semibold">Observaciones / descripcion del trabajo</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  maxLength={1000}
                  placeholder="Detalle la actividad realizada..."
                  value={form.observaciones}
                  onChange={e => setField('observaciones', e.target.value)}
                />
                <Form.Text className="text-muted">
                  {form.observaciones.length}/1000 caracteres. Se almacena en mayusculas.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" className="btn-cet" disabled={guardando}>
            {guardando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Registrar actividad')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
