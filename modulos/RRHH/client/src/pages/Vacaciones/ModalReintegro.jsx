import React from 'react'
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap'

export const ModalReintegro = ({ confirmAction, reintegroObs, setReintegroObs, actionLoading, onConfirm, onCancel }) => {
  const show = confirmAction !== null

  const getVariant = () => {
    if (confirmAction?.type === 'pagar') return 'success'
    if (confirmAction?.type === 'terminar') return 'danger'
    return 'warning'
  }

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton><Modal.Title>Confirmar Acción</Modal.Title></Modal.Header>
      <Modal.Body>
        {confirmAction?.type === 'pagar' && (
          <p>¿Registrar pago de bono vacacional a <strong>{confirmAction.label}</strong>?</p>
        )}

        {confirmAction?.type === 'reintegrar' && (
          <div>
            <p>¿Interrumpir y reintegrar a <strong>{confirmAction.label}</strong> por necesidad de servicio?</p>
            <Form.Group className="mt-2">
              <Form.Label className="fw-semibold">Observaciones <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Motivo del reintegro (obligatorio)..."
                value={reintegroObs}
                onChange={e => setReintegroObs(e.target.value)}
                isInvalid={reintegroObs.trim().length === 0}
              />
              <Form.Text className="text-muted">
                <i className="bx bx-info-circle me-1"></i>
                El motivo quedará registrado en el historial del empleado.
              </Form.Text>
            </Form.Group>
          </div>
        )}

        {confirmAction?.type === 'terminar' && (
          <p>¿Aplicar cierre forzoso a <strong>{confirmAction.label}</strong>?</p>
        )}

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
        <Button variant="outline-secondary" onClick={onCancel}>Cancelar</Button>
        <Button
          variant={getVariant()}
          onClick={onConfirm}
          disabled={actionLoading || (confirmAction?.type === 'reintegrar' && reintegroObs.trim().length === 0)}
        >
          {actionLoading ? <><Spinner size="sm" className="me-1" />Procesando...</> : 'Confirmar'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalReintegro
