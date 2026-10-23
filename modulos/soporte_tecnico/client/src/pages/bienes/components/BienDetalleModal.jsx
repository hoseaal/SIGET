import { Modal } from 'react-bootstrap'
import { FaMicrochip } from 'react-icons/fa6'
import { formatDate } from '../../../utils/dateHelpers.js'

function Dato ({ label, value }) {
  return (
    <div className="col-12 col-md-6">
      <div className="text-muted small">{label}</div>
      <div className="fw-semibold text-body">{value || '-'}</div>
    </div>
  )
}

export default function BienDetalleModal ({ show, onHide, bien, onFicha }) {
  if (!bien) return null

  const esComputador = String(bien.tipo_soporte || '').toLowerCase().includes('computador')

  const valor = Number(bien.bim_val)
  const valorFormateado = Number.isFinite(valor)
    ? valor.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '-'

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: '1.05rem', fontWeight: 700 }}>
          Bien {bien.bim_ide}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-3">
          <div className="text-muted small">Descripcion</div>
          <div className="fw-semibold">{bien.bim_des || '-'}</div>
        </div>

        <h6 className="section-title mb-3">Identificacion</h6>
        <div className="row g-3 mb-4">
          <Dato label="Tipo de soporte" value={bien.tipo_soporte} />
          <Dato label="Categoria general" value={bien.categoria_general} />
          <Dato label="Subcategoria" value={bien.subcategoria} />
          <Dato label="Categoria especifica" value={bien.categoria_especifica} />
          <Dato label="Marca" value={bien.marca} />
          <Dato label="Modelo" value={bien.modelo} />
          <Dato label="Serial" value={bien.bim_ser} />
          <Dato label="Codigo" value={bien.bim_cod} />
          <Dato label="Color" value={bien.bim_color} />
          <Dato label="Sede" value={bien.bim_sede} />
        </div>

        <h6 className="section-title mb-3">Ubicacion y estado</h6>
        <div className="row g-3 mb-4">
          <Dato label="Departamento" value={bien.departamento} />
          <Dato label="Estado" value={bien.estado} />
          <Dato label="Condicion fisica" value={bien.condicion} />
          <Dato label="Estado de uso" value={bien.estado_uso} />
          <Dato label="Concepto de movimiento" value={bien.concepto_movimiento} />
          <Dato label="Registro activo" value={Number(bien.bim_inc) === 1 ? 'Si' : 'No'} />
        </div>

        <h6 className="section-title mb-3">Adquisicion</h6>
        <div className="row g-3 mb-4">
          <Dato label="Forma de adquisicion" value={bien.forma_adquisicion} />
          <Dato label="Fecha de ingreso" value={formatDate(bien.bim_fec)} />
          <Dato label="Documento" value={bien.bim_ndo} />
          <Dato label="Valor" value={bien.bim_val != null ? `${valorFormateado} ${bien.bim_moneda || ''}`.trim() : '-'} />
          <Dato label="Fecha de desincorporacion" value={bien.bim_fed ? formatDate(bien.bim_fed) : ''} />
        </div>

        <h6 className="section-title mb-2">Observaciones</h6>
        <p className="text-muted mb-0" style={{ whiteSpace: 'pre-wrap' }}>
          {bien.bim_obs || 'Sin observaciones'}
        </p>
      </Modal.Body>

      <Modal.Footer>
        {esComputador && onFicha && (
          <button className="btn btn-outline-success me-auto" onClick={onFicha}>
            <FaMicrochip className="me-1" /> Ficha tecnica
          </button>
        )}
        <button className="btn btn-outline-secondary" onClick={onHide}>Cerrar</button>
      </Modal.Footer>
    </Modal>
  )
}
