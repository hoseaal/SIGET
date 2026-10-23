import { useEffect, useState } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import api from '../../../utils/helpFetch.js'

const FORM_VACIO = {
  nombre: '',
  clasificacion_id: '',
  departamento_id: '',
  activo: true
}

export default function TipoActividadModal ({
  show,
  onHide,
  onSaved,
  tipo,
  clasificaciones,
  departamentos
}) {
  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const esEdicion = Boolean(tipo)

  useEffect(() => {
    if (!show) return
    if (tipo) {
      setForm({
        nombre: tipo.nombre || '',
        clasificacion_id: tipo.clasificacion_id ?? '',
        departamento_id: tipo.departamento_id ?? '',
        activo: Boolean(tipo.activo)
      })
    } else {
      setForm({
        ...FORM_VACIO,
        clasificacion_id: clasificaciones[0]?.id ?? '',
        departamento_id: departamentos[0]?.id ?? ''
      })
    }
  }, [show, tipo, clasificaciones, departamentos])

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.nombre.trim()) {
      toast.warning('El nombre del tipo de actividad es obligatorio')
      return
    }
    if (!form.clasificacion_id) {
      toast.warning('Seleccione una clasificacion')
      return
    }

    const payload = {
      nombre: form.nombre.trim(),
      clasificacion_id: Number(form.clasificacion_id),
      departamento_id: form.departamento_id ? Number(form.departamento_id) : null,
      activo: form.activo
    }

    setGuardando(true)
    try {
      if (esEdicion) {
        await api.put(`/tipos-actividad/${tipo.id}`, payload)
        toast.success('Tipo de actividad actualizado correctamente')
      } else {
        await api.post('/tipos-actividad', payload)
        toast.success('Tipo de actividad creado correctamente')
      }
      onSaved()
      onHide()
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el tipo de actividad')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered backdrop={guardando ? 'static' : true}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!guardando}>
          <Modal.Title style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {esEdicion ? 'Editar tipo de actividad' : 'Nuevo tipo de actividad'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group controlId="taNombre">
                <Form.Label className="small fw-semibold">Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  value={form.nombre}
                  onChange={e => setField('nombre', e.target.value)}
                  placeholder="Ej: Mantenimiento preventivo"
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="taClasificacion">
                <Form.Label className="small fw-semibold">Clasificacion *</Form.Label>
                <Form.Select
                  value={form.clasificacion_id}
                  onChange={e => setField('clasificacion_id', e.target.value)}
                  required
                >
                  <option value="">Seleccione una clasificacion</option>
                  {clasificaciones.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Determina la columna del reporte Excel en la que se contabiliza.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="taDepto">
                <Form.Label className="small fw-semibold">Departamento</Form.Label>
                <Form.Select
                  value={form.departamento_id}
                  onChange={e => setField('departamento_id', e.target.value)}
                >
                  <option value="">Sin departamento especifico</option>
                  {departamentos.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="taActivo">
                <Form.Label className="small fw-semibold">Estado</Form.Label>
                <Form.Select
                  value={form.activo ? '1' : '0'}
                  onChange={e => setField('activo', e.target.value === '1')}
                >
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" className="btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear tipo')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
