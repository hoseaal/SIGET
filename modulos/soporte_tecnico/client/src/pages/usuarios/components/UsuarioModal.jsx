import { useEffect, useState } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import api from '../../../utils/helpFetch.js'

const ROLES = ['Administrador', 'Tecnico', 'Consulta']

const FORM_VACIO = {
  username: '',
  password: '',
  nombres: '',
  apellidos: '',
  cedula: '',
  email: '',
  rol: 'Consulta',
  departamento_id: '',
  activo: true
}

export default function UsuarioModal ({ show, onHide, onSaved, usuario, departamentos }) {
  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const esEdicion = Boolean(usuario)

  useEffect(() => {
    if (!show) return
    if (usuario) {
      setForm({
        username: usuario.username || '',
        password: '',
        nombres: usuario.nombres || '',
        apellidos: usuario.apellidos || '',
        cedula: usuario.cedula || '',
        email: usuario.email || '',
        rol: usuario.rol || 'Consulta',
        departamento_id: usuario.departamento_id ?? '',
        activo: Boolean(usuario.activo)
      })
    } else {
      setForm(FORM_VACIO)
    }
  }, [show, usuario])

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.username.trim() || !form.nombres.trim() || !form.apellidos.trim()) {
      toast.warning('Usuario, nombres y apellidos son obligatorios')
      return
    }
    if (!esEdicion && form.password.length < 6) {
      toast.warning('La contrasena debe tener al menos 6 caracteres')
      return
    }

    const payload = {
      username: form.username.trim(),
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      cedula: form.cedula.trim() || null,
      email: form.email.trim() || null,
      rol: form.rol,
      departamento_id: form.departamento_id ? Number(form.departamento_id) : null,
      activo: form.activo
    }
    if (!esEdicion) payload.password = form.password

    setGuardando(true)
    try {
      if (esEdicion) {
        await api.put(`/usuarios/${usuario.id}`, payload)
        toast.success('Usuario actualizado correctamente')
      } else {
        await api.post('/usuarios', payload)
        toast.success('Usuario creado correctamente')
      }
      onSaved()
      onHide()
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el usuario')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop={guardando ? 'static' : true}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!guardando}>
          <Modal.Title style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="g-3">
            <Col xs={12} sm={6}>
              <Form.Group controlId="usUsername">
                <Form.Label className="small fw-semibold">Nombre de usuario *</Form.Label>
                <Form.Control
                  type="text"
                  value={form.username}
                  onChange={e => setField('username', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group controlId="usPassword">
                <Form.Label className="small fw-semibold">
                  {esEdicion ? 'Nueva contrasena (opcional)' : 'Contrasena *'}
                </Form.Label>
                <Form.Control
                  type="password"
                  value={form.password}
                  onChange={e => setField('password', e.target.value)}
                  placeholder={esEdicion ? 'Dejar vacio para no cambiar' : 'Minimo 6 caracteres'}
                  autoComplete="new-password"
                />
                {esEdicion && (
                  <Form.Text className="text-muted">
                    Use la opcion &quot;Cambiar clave&quot; si desea actualizarla.
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group controlId="usNombres">
                <Form.Label className="small fw-semibold">Nombres *</Form.Label>
                <Form.Control
                  type="text"
                  value={form.nombres}
                  onChange={e => setField('nombres', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group controlId="usApellidos">
                <Form.Label className="small fw-semibold">Apellidos *</Form.Label>
                <Form.Control
                  type="text"
                  value={form.apellidos}
                  onChange={e => setField('apellidos', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group controlId="usCedula">
                <Form.Label className="small fw-semibold">Cedula</Form.Label>
                <Form.Control
                  type="text"
                  value={form.cedula}
                  onChange={e => setField('cedula', e.target.value)}
                  placeholder="V-12345678"
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group controlId="usEmail">
                <Form.Label className="small fw-semibold">Correo electronico</Form.Label>
                <Form.Control
                  type="email"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={4}>
              <Form.Group controlId="usRol">
                <Form.Label className="small fw-semibold">Rol *</Form.Label>
                <Form.Select value={form.rol} onChange={e => setField('rol', e.target.value)}>
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} sm={5}>
              <Form.Group controlId="usDepto">
                <Form.Label className="small fw-semibold">Departamento</Form.Label>
                <Form.Select
                  value={form.departamento_id}
                  onChange={e => setField('departamento_id', e.target.value)}
                >
                  <option value="">Sin departamento</option>
                  {departamentos.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} sm={3}>
              <Form.Group controlId="usActivo">
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
            {guardando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear usuario')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
