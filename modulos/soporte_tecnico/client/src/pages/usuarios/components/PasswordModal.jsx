import { useEffect, useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { toast } from 'react-toastify'
import api from '../../../utils/helpFetch.js'

export default function PasswordModal ({ show, onHide, usuario, onSaved }) {
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (show) {
      setPassword('')
      setConfirmar('')
    }
  }, [show])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.warning('La contrasena debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmar) {
      toast.warning('Las contrasenas no coinciden')
      return
    }

    setGuardando(true)
    try {
      await api.put(`/usuarios/${usuario.id}/password`, { password })
      toast.success('Contrasena actualizada correctamente')
      onSaved?.()
      onHide()
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar la contrasena')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered backdrop={guardando ? 'static' : true}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!guardando}>
          <Modal.Title style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            Cambiar contrasena
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-muted small mb-3">
            Usuario: <strong>{usuario?.username}</strong> - {usuario?.nombres} {usuario?.apellidos}
          </p>

          <Form.Group className="mb-3" controlId="pwNueva">
            <Form.Label className="small fw-semibold">Nueva contrasena</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </Form.Group>

          <Form.Group controlId="pwConfirmar">
            <Form.Label className="small fw-semibold">Confirmar contrasena</Form.Label>
            <Form.Control
              type="password"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              autoComplete="new-password"
              required
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" className="btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Actualizar contrasena'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
