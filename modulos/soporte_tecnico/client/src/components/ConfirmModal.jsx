import { Modal, Button } from 'react-bootstrap'

export default function ConfirmModal ({
  show,
  onHide,
  onConfirm,
  title = 'Confirmar accion',
  children,
  loading = false,
  confirmText = 'Confirmar',
  variant = 'danger'
}) {
  return (
    <Modal show={show} onHide={onHide} centered backdrop={loading ? 'static' : true}>
      <Modal.Header closeButton={!loading}>
        <Modal.Title style={{ fontSize: '1.05rem', fontWeight: 700 }}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={loading}>
          {loading ? 'Procesando...' : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
