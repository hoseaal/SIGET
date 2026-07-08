import React from 'react'
import { Modal, Button, Spinner } from 'react-bootstrap'
import { formatDate, formatCurrency } from './utils/vacacionesUtils'
import { downloadReciboExcel } from './utils/reciboExcel'

export const ModalRecibo = ({ empleadoId, reciboData, loading, onHide }) => {
  const show = empleadoId !== null

  const downloadExcel = () => downloadReciboExcel(reciboData)

  const vac = reciboData?.vacacion || {}

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title><i className="bx bx-receipt me-2"></i>Recibo de Vacaciones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : reciboData ? (
          <>
            <div className="row">
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Datos del Empleado</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr><td className="fw-semibold bg-light" style={{ width: '40%' }}>Cédula</td><td>{reciboData.empleado.cedula}</td></tr>
                    <tr><td className="fw-semibold bg-light">Nombres</td><td>{reciboData.empleado.nombres} {reciboData.empleado.apellidos}</td></tr>
                    <tr><td className="fw-semibold bg-light">Cargo CET</td><td>{reciboData.empleado.cargo_cet || '-'}</td></tr>
                    <tr><td className="fw-semibold bg-light">F. Ingreso</td><td>{formatDate(reciboData.empleado.fecha_ingreso)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Antigüedad</td><td>{reciboData.empleado.antiguedad_anios ?? reciboData.empleado.anios_antiguedad ?? '-'} años, {reciboData.empleado.antiguedad_meses ?? '-'} meses, {reciboData.empleado.antiguedad_dias ?? '-'} días</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Bono Vacacional</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr><td className="fw-semibold bg-light" style={{ width: '50%' }}>Sueldo Básico</td><td>{formatCurrency(reciboData.lineas_recibo.sueldo_basico)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Prima Antigüedad</td><td>{formatCurrency(reciboData.lineas_recibo.prima_antiguedad)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Prima Profesionalización</td><td>{formatCurrency(reciboData.lineas_recibo.prima_profesionalizacion)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Prima Transporte</td><td>{formatCurrency(reciboData.lineas_recibo.prima_transporte)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Prima Hogares</td><td>{formatCurrency(reciboData.lineas_recibo.prima_hogares)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Prima Mejoramiento Económico</td><td>{formatCurrency(reciboData.lineas_recibo.prima_mejoramiento_economico)}</td></tr>
                    <tr><td className="fw-semibold bg-light border-top fw-bold">Total Mensual</td><td className="border-top fw-bold">{formatCurrency(reciboData.lineas_recibo.total_sueldo_mensual)}</td></tr>
                    <tr><td className="fw-semibold bg-light">Días Bono Vac.</td><td>{reciboData.lineas_recibo.dias_bono_vacacional}</td></tr>
                    <tr><td className="fw-semibold bg-light text-success">Bono Vacacional</td><td className="text-success fw-bold">{formatCurrency(reciboData.lineas_recibo.bono_vacacional)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            {vac.fecha_inicio && (
              <div className="row mt-3">
                <div className="col-12">
                  <h6 className="fw-bold border-bottom pb-2 mb-3">Período Vacacional</h6>
                  <table className="table table-sm">
                    <tbody>
                      {/* Fechas de inicio y fin administrativo (lo que está en BD) */}
                      <tr>
                        <td className="fw-semibold bg-light" style={{ width: '20%' }}>Fecha Inicio</td>
                        <td style={{ width: '30%' }}>{formatDate(vac.fecha_inicio)}</td>
                        <td className="fw-semibold bg-light" style={{ width: '20%' }}>Fecha Fin (BD)</td>
                        <td style={{ width: '30%' }}>{formatDate(vac.fecha_fin)}</td>
                      </tr>

                      {/* ✔ Fecha de Finalización Real — proyección pura de días hábiles, inmutable ante reintegros */}
                      <tr style={{ background: '#f0fdf4' }}>
                        <td className="fw-semibold text-success" style={{ width: '20%' }}>
                          <i className="bx bx-calendar-check me-1"></i>Fin Real Disfrute
                        </td>
                        <td className="fw-bold text-success" colSpan={3}>
                          {formatDate(vac.fecha_fin_real) || <span className="text-muted">No calculada</span>}
                          <small className="text-muted ms-2 fw-normal">
                            (último día hábil de descanso)
                          </small>
                        </td>
                      </tr>

                      {/* ✔ Fecha de Reintegro Laboral — primer día hábil posterior a Fin Real */}
                      <tr style={{ background: '#eff6ff' }}>
                        <td className="fw-semibold text-primary" style={{ width: '20%' }}>
                          <i className="bx bx-log-in me-1"></i>Reintegro Laboral
                        </td>
                        <td className="fw-bold text-primary" colSpan={3}>
                          {formatDate(vac.fecha_reincorporacion) || <span className="text-muted">No calculada</span>}
                          <small className="text-muted ms-2 fw-normal">
                            (retorno al trabajo)
                          </small>
                        </td>
                      </tr>

                      <tr>
                        <td className="fw-semibold bg-light">Días Hábiles</td>
                        <td>{vac.dias_habiles}</td>
                        <td className="fw-semibold bg-light">Período</td>
                        <td>{vac.periodo}</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold bg-light">Saldo Anterior</td>
                        <td>{vac.saldo_anterior} día(s)</td>
                        <td className="fw-semibold bg-light">Saldo Restante</td>
                        <td>{vac.saldo_restante} día(s)</td>
                      </tr>
                      {vac.observaciones && <tr><td className="fw-semibold bg-light">Observaciones</td><td colSpan={3}>{vac.observaciones}</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted text-center py-4">No se encontraron datos del recibo.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        {reciboData && (
          <Button variant="success" onClick={downloadExcel}>
            <i className="bx bx-spreadsheet me-1"></i> Descargar Excel
          </Button>
        )}
        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  )
}

