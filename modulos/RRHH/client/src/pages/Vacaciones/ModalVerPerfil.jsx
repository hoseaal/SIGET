import React, { useState } from 'react'
import { Modal, Button, Spinner } from 'react-bootstrap'
import { formatDate, formatCurrency } from './utils/vacacionesUtils'

export const ModalVerPerfil = ({ empleadoId, perfilData, loading, onHide }) => {
  const [perfilTab, setPerfilTab] = useState('datos')
  const [perfilPage, setPerfilPage] = useState(1)

  const show = empleadoId !== null

  const handleHide = () => {
    setPerfilTab('datos')
    setPerfilPage(1)
    onHide()
  }

  return (
    <Modal show={show} onHide={handleHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title><i className="bx bx-user me-2"></i>Perfil del Empleado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : perfilData ? (
          <>
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button className={`nav-link ${perfilTab === 'datos' ? 'active' : ''}`} onClick={() => setPerfilTab('datos')}>
                  <i className="bx bx-id-card me-1"></i>Datos
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${perfilTab === 'historial' ? 'active' : ''}`} onClick={() => { setPerfilTab('historial'); setPerfilPage(1) }}>
                  <i className="bx bx-history me-1"></i>Historial
                </button>
              </li>
            </ul>

            {perfilTab === 'datos' && (
              <div className="row">
                <div className="col-md-6">
                  <h6 className="fw-bold border-bottom pb-2 mb-3">Datos Personales</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr><td className="fw-semibold bg-light" style={{ width: '40%' }}>Cédula</td><td>{perfilData.datos_personales.cedula}</td></tr>
                      <tr><td className="fw-semibold bg-light">Nombres</td><td>{perfilData.datos_personales.nombres}</td></tr>
                      <tr><td className="fw-semibold bg-light">Apellidos</td><td>{perfilData.datos_personales.apellidos}</td></tr>
                      <tr><td className="fw-semibold bg-light">Cargo CET</td><td>{perfilData.datos_laborales.cargo_cet || '-'}</td></tr>
                      <tr><td className="fw-semibold bg-light">Cargo ONAPRE</td><td>{perfilData.datos_laborales.cargo_onapre || '-'}</td></tr>
                      <tr><td className="fw-semibold bg-light">Salario Base</td><td>{formatCurrency(perfilData.datos_laborales.salario_base)}</td></tr>
                      <tr><td className="fw-semibold bg-light">Fecha Ingreso</td><td>{formatDate(perfilData.datos_personales.fecha_ingreso)}</td></tr>
                      <tr><td className="fw-semibold bg-light">Antigüedad</td><td>{perfilData.antiguedad?.anios ?? '-'} años, {perfilData.antiguedad?.meses ?? '-'} meses, {perfilData.antiguedad?.dias ?? '-'} días</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold border-bottom pb-2 mb-3">Resumen de Vacaciones</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr><td className="fw-semibold bg-light" style={{ width: '50%' }}>Días Base Anuales</td><td>{perfilData.vacaciones.dias_base_anual}</td></tr>
                      <tr><td className="fw-semibold bg-light">Días Consumidos (año)</td><td>{perfilData.vacaciones.dias_consumidos_anio}</td></tr>
                      <tr><td className="fw-semibold bg-light">Días Pendientes</td><td className="fw-bold text-primary">{perfilData.vacaciones.dias_pendientes}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {perfilTab === 'historial' && (() => {
              const historialCompleto = perfilData.vacaciones.historial || []
              const itemsPerPage = 10
              const totalPages = Math.ceil(historialCompleto.length / itemsPerPage)
              const indexOfLast = perfilPage * itemsPerPage
              const indexOfFirst = indexOfLast - itemsPerPage
              const currentHistorial = historialCompleto.slice(indexOfFirst, indexOfLast)

              return (
                <div>
                  <h6 className="fw-bold border-bottom pb-2 mb-3">Historial de Vacaciones y Reintegros</h6>
                  {historialCompleto.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Estatus</th>
                            <th>Fecha Inicio</th>
                            {/* Días hábiles originales de la solicitud */}
                            <th className="text-center">Días Hábiles</th>
                            {/* ✔ Fecha real de finalización del descanso físico (proyección pura, inmutable) */}
                            <th className="text-center text-success">
                              <i className="bx bx-calendar-check me-1"></i>Fin Real
                            </th>
                            {/* ✔ Primer día hábil posterior: cuándo regresa a laborar */}
                            <th className="text-center text-primary">
                              <i className="bx bx-log-in me-1"></i>Reintegro
                            </th>
                            <th>Observaciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentHistorial.map((h, i) => (
                            <tr key={i}>
                              <td>
                                <span className="badge bg-secondary">{h.nombre_status || 'Sin estatus'}</span>
                              </td>
                              <td>{formatDate(h.fecha_inicio)}</td>

                              {/* Días hábiles de esta solicitud/registro */}
                              <td className="text-center fw-bold">{h.dias_habiles ?? '-'}</td>

                              {/* ✔ Fecha de Finalización Real: consume el campo persistido en BD.
                                   Fallback a fecha_fin para registros legacy. */}
                              <td className="text-center fw-bold text-success">
                                {formatDate(h.fecha_finalizacion_real || h.fecha_fin) || '-'}
                              </td>

                              {/* ✔ Fecha de Reintegro Laboral: primer día hábil post-fin-real */}
                              <td className="text-center fw-bold text-primary">
                                {formatDate(h.fecha_reintegro_laboral) || '-'}
                              </td>

                              <td style={{ fontSize: '0.8rem' }}>
                                {h.observaciones || 'Sin observaciones'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {totalPages > 1 && (
                        <div className="d-flex justify-content-end mt-2">
                          <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${perfilPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => setPerfilPage(prev => Math.max(1, prev - 1))}>Anterior</button>
                            </li>
                            {[...Array(totalPages)].map((_, idx) => (
                              <li key={idx} className={`page-item ${perfilPage === idx + 1 ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => setPerfilPage(idx + 1)}>{idx + 1}</button>
                              </li>
                            ))}
                            <li className={`page-item ${perfilPage === totalPages ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => setPerfilPage(prev => Math.min(totalPages, prev + 1))}>Siguiente</button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted text-center py-4">No hay registros de vacaciones.</p>
                  )}
                </div>
              )
            })()}
          </>
        ) : (
          <p className="text-muted text-center py-4">No se encontraron datos del empleado.</p>
        )}
      </Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  )
}

export default ModalVerPerfil
