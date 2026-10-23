import { useCallback, useEffect, useMemo, useState } from 'react'
import { Modal, Form, Row, Col } from 'react-bootstrap'
import {
  FaPlus, FaPenToSquare, FaTrashCan, FaFileExcel, FaMagnifyingGlass,
  FaRotateLeft, FaCalendarWeek, FaCircleInfo, FaChevronLeft, FaChevronRight
} from 'react-icons/fa6'
import { toast } from 'react-toastify'
import api, { downloadFile } from '../../utils/helpFetch.js'
import {
  MESES, clasificacionColor, formatDate, getMonday, getFriday, toISODate
} from '../../utils/dateHelpers.js'
import { useAuth } from '../../context/AuthContext.jsx'
import RegistroActividadModal from './components/RegistroActividadModal.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'

const PAGE_SIZE = 10

function filtrosIniciales () {
  const monday = getMonday()
  const friday = getFriday(monday)
  return {
    desde: toISODate(monday),
    hasta: toISODate(friday),
    departamento_id: '',
    clasificacion_id: '',
    tipo_actividad_id: '',
    search: ''
  }
}

export default function ActividadesPage () {
  const { user } = useAuth()
  const [actividades, setActividades] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [clasificaciones, setClasificaciones] = useState([])
  const [tipos, setTipos] = useState([])
  const [bienes, setBienes] = useState([])
  const [loading, setLoading] = useState(true)
  const [exportando, setExportando] = useState(false)

  const [draft, setDraft] = useState(filtrosIniciales)
  const [filtros, setFiltros] = useState(filtrosIniciales)
  const [page, setPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)

  const [showEliminar, setShowEliminar] = useState(false)
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const [showMensual, setShowMensual] = useState(false)
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [anio, setAnio] = useState(new Date().getFullYear())

  const canEdit = user?.rol === 'Administrador' || user?.rol === 'Tecnico'
  const canDelete = user?.rol === 'Administrador'

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [d, cl, t] = await Promise.all([
          api.get('/departamentos'),
          api.get('/clasificaciones'),
          api.get('/tipos-actividad')
        ])
        setDepartamentos(d)
        setClasificaciones(cl)
        setTipos(t)
      } catch (error) {
        toast.error(error.message || 'No se pudieron cargar los catalogos')
      }

      try {
        const bienesData = await api.get('/bienes?limit=1000&activo=1')
        setBienes(bienesData.data || [])
      } catch (error) {
        setBienes([])
        toast.warning(error.message || 'No se pudieron cargar los bienes muebles')
      }
    }
    cargarCatalogos()
  }, [])

  const cargarActividades = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.set(key, value)
        }
      })
      const data = await api.get(`/actividades?${params.toString()}`)
      setActividades(data)
      setPage(1)
    } catch (error) {
      toast.error(error.message || 'No se pudieron cargar las actividades')
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => {
    cargarActividades()
  }, [cargarActividades])

  const tiposFiltro = useMemo(() => {
    if (!draft.clasificacion_id) return tipos
    return tipos.filter(t => Number(t.clasificacion_id) === Number(draft.clasificacion_id))
  }, [tipos, draft.clasificacion_id])

  const totalPages = Math.max(1, Math.ceil(actividades.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const visibles = actividades.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)

  const paginas = useMemo(() => {
    const lista = []
    const inicio = Math.max(1, pageSafe - 2)
    const fin = Math.min(totalPages, pageSafe + 2)
    for (let i = inicio; i <= fin; i++) lista.push(i)
    return lista
  }, [pageSafe, totalPages])

  const handleDraft = (e) => {
    const { name, value } = e.target
    setDraft(prev => {
      if (name === 'clasificacion_id') {
        return { ...prev, clasificacion_id: value, tipo_actividad_id: '' }
      }
      return { ...prev, [name]: value }
    })
  }

  const aplicarFiltros = (e) => {
    e.preventDefault()
    setFiltros({ ...draft })
  }

  const limpiarFiltros = () => {
    const vacio = {
      desde: '',
      hasta: '',
      departamento_id: '',
      clasificacion_id: '',
      tipo_actividad_id: '',
      search: ''
    }
    setDraft(vacio)
    setFiltros(vacio)
  }

  const semanaActual = () => {
    const nuevo = filtrosIniciales()
    setDraft(nuevo)
    setFiltros(nuevo)
  }

  const abrirNueva = () => {
    setEditando(null)
    setShowModal(true)
  }

  const abrirEditar = (actividad) => {
    setEditando(actividad)
    setShowModal(true)
  }

  const pedirEliminar = (actividad) => {
    setAEliminar(actividad)
    setShowEliminar(true)
  }

  const confirmarEliminar = async () => {
    if (!aEliminar) return
    setEliminando(true)
    try {
      await api.delete(`/actividades/${aEliminar.id}`)
      toast.success('Actividad eliminada correctamente')
      setShowEliminar(false)
      setAEliminar(null)
      cargarActividades()
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar la actividad')
    } finally {
      setEliminando(false)
    }
  }

  const exportarSemanal = async () => {
    if (!filtros.desde || !filtros.hasta) {
      toast.warning('Seleccione el rango de fechas para el reporte semanal')
      return
    }
    setExportando(true)
    try {
      const params = new URLSearchParams({
        desde: filtros.desde,
        hasta: filtros.hasta
      })
      if (filtros.departamento_id) params.set('departamento_id', filtros.departamento_id)
      await downloadFile(
        `/reportes/actividades/semanal?${params.toString()}`,
        `Actividades_Semanal_${filtros.desde}_${filtros.hasta}.xlsx`
      )
      toast.success('Reporte semanal generado correctamente')
    } catch (error) {
      toast.error(error.message || 'No se pudo generar el reporte semanal')
    } finally {
      setExportando(false)
    }
  }

  const exportarMensual = async () => {
    setExportando(true)
    try {
      await downloadFile(
        `/reportes/actividades/mensual?mes=${mes}&anio=${anio}`,
        `Actividades_Mensual_${anio}_${String(mes).padStart(2, '0')}.xlsx`
      )
      toast.success('Reporte mensual generado correctamente')
      setShowMensual(false)
    } catch (error) {
      toast.error(error.message || 'No se pudo generar el reporte mensual')
    } finally {
      setExportando(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h4>Registro de actividades</h4>
          <p>Registre y consulte las actividades realizadas por el servicio tecnico.</p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          {canEdit && (
            <button className="btn btn-primary" onClick={abrirNueva}>
              <FaPlus className="me-1" /> Nueva actividad
            </button>
          )}
          <button className="btn btn-outline-success" onClick={exportarSemanal} disabled={exportando}>
            <FaFileExcel className="me-1" /> Reporte semanal
          </button>
          <button className="btn btn-outline-success" onClick={() => setShowMensual(true)}>
            <FaFileExcel className="me-1" /> Reporte mensual
          </button>
        </div>
      </div>

      <div className="card-cet mb-4">
        <div className="card-body p-3 p-lg-4">
          <form onSubmit={aplicarFiltros} className="row g-3 align-items-end">
            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="f-desde">Desde</label>
              <input
                id="f-desde"
                type="date"
                className="form-control"
                name="desde"
                value={draft.desde}
                onChange={handleDraft}
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="f-hasta">Hasta</label>
              <input
                id="f-hasta"
                type="date"
                className="form-control"
                name="hasta"
                value={draft.hasta}
                onChange={handleDraft}
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="f-depto">Departamento</label>
              <select
                id="f-depto"
                className="form-select"
                name="departamento_id"
                value={draft.departamento_id}
                onChange={handleDraft}
              >
                <option value="">Todos</option>
                {departamentos.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="f-clasificacion">Clasificacion</label>
              <select
                id="f-clasificacion"
                className="form-select"
                name="clasificacion_id"
                value={draft.clasificacion_id}
                onChange={handleDraft}
              >
                <option value="">Todas</option>
                {clasificaciones.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="f-tipo">Tipo de actividad</label>
              <select
                id="f-tipo"
                className="form-select"
                name="tipo_actividad_id"
                value={draft.tipo_actividad_id}
                onChange={handleDraft}
              >
                <option value="">Todos</option>
                {tiposFiltro.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label small fw-semibold" htmlFor="f-search">Buscar</label>
              <input
                id="f-search"
                type="text"
                className="form-control"
                name="search"
                value={draft.search}
                onChange={handleDraft}
                placeholder="Nro, observacion, bien..."
              />
            </div>

            <div className="col-12 d-flex gap-2 flex-wrap">
              <button type="submit" className="btn btn-primary">
                <FaMagnifyingGlass className="me-1" /> Buscar
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={limpiarFiltros}>
                <FaRotateLeft className="me-1" /> Limpiar
              </button>
              <button type="button" className="btn btn-outline-primary" onClick={semanaActual}>
                <FaCalendarWeek className="me-1" /> Semana actual
              </button>
              <span className="ms-auto text-muted small align-self-center">
                {actividades.length} actividad(es) encontrada(s)
              </span>
            </div>
          </form>
        </div>
      </div>

      <div className="card-cet">
        <div className="card-header-cet">
          <h5 className="section-title">Actividades registradas</h5>
          <span className="text-muted small">{actividades.length} registro(s)</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-cet">
            <thead>
              <tr>
                <th>Nro</th>
                <th>Fecha</th>
                <th>Departamento</th>
                <th>Clasificacion</th>
                <th>Tipo de actividad</th>
                <th>Bien mueble</th>
                <th>Registrado por</th>
                <th>Observaciones</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                    <span className="ms-2 text-muted">Cargando actividades...</span>
                  </td>
                </tr>
              )}

              {!loading && visibles.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <FaCircleInfo />
                      <div>No se encontraron actividades para los filtros seleccionados.</div>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && visibles.map(a => (
                <tr key={a.id}>
                  <td><span className="badge badge-soft-blue">{a.nro_act}</span></td>
                  <td className="text-nowrap">{formatDate(a.fecha)}</td>
                  <td style={{ minWidth: 180 }}>{a.departamento_nombre}</td>
                  <td style={{ minWidth: 190 }}>
                    <span className={`badge ${clasificacionColor(a.clasificacion_codigo)}`}>
                      {a.clasificacion_nombre || '-'}
                    </span>
                  </td>
                  <td style={{ minWidth: 190 }}>{a.tipo_actividad_nombre}</td>
                  <td className="text-nowrap">
                    {a.equipo_nro_bien || '-'}
                    {a.equipo_descripcion ? (
                      <span className="text-muted small d-block text-truncate" style={{ maxWidth: 220 }} title={a.equipo_descripcion}>
                        {a.equipo_descripcion}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-nowrap">{a.usuario_nombre || '-'}</td>
                  <td>
                    <span
                      className="d-inline-block text-truncate"
                      style={{ maxWidth: 200 }}
                      title={a.observaciones || ''}
                    >
                      {a.observaciones || '-'}
                    </span>
                  </td>
                  <td className="text-center text-nowrap">
                    {canEdit && (
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        title="Editar actividad"
                        onClick={() => abrirEditar(a)}
                      >
                        <FaPenToSquare />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Eliminar actividad"
                        onClick={() => pedirEliminar(a)}
                      >
                        <FaTrashCan />
                      </button>
                    )}
                    {!canEdit && !canDelete && <span className="text-muted">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && actividades.length > 0 && (
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 border-top">
            <span className="text-muted small">
              Mostrando {(pageSafe - 1) * PAGE_SIZE + 1} - {Math.min(pageSafe * PAGE_SIZE, actividades.length)} de {actividades.length}
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${pageSafe === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(pageSafe - 1)}>
                    <FaChevronLeft size={10} />
                  </button>
                </li>
                {paginas.map(p => (
                  <li key={p} className={`page-item ${p === pageSafe ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                  </li>
                ))}
                <li className={`page-item ${pageSafe === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(pageSafe + 1)}>
                    <FaChevronRight size={10} />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      <RegistroActividadModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSaved={cargarActividades}
        actividad={editando}
        departamentos={departamentos}
        clasificaciones={clasificaciones}
        tipos={tipos}
        bienes={bienes}
      />

      <ConfirmModal
        show={showEliminar}
        onHide={() => { setShowEliminar(false); setAEliminar(null) }}
        onConfirm={confirmarEliminar}
        loading={eliminando}
        title="Eliminar actividad"
        confirmText="Eliminar"
      >
        <p className="mb-2">
          ¿Seguro que desea eliminar la actividad <strong>{aEliminar?.nro_act}</strong>?
        </p>
        <p className="text-muted small mb-0">Esta accion no se puede deshacer.</p>
      </ConfirmModal>

      <Modal show={showMensual} onHide={() => setShowMensual(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            Reporte mensual consolidado
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">
            Se generara un consolidado por departamento y clasificacion con las actividades del mes seleccionado.
          </p>
          <Row className="g-3">
            <Col xs={7}>
              <Form.Group controlId="repMes">
                <Form.Label className="small fw-semibold">Mes</Form.Label>
                <Form.Select value={mes} onChange={e => setMes(Number(e.target.value))}>
                  {MESES.map((m, index) => (
                    <option key={m} value={index + 1}>{m}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={5}>
              <Form.Group controlId="repAnio">
                <Form.Label className="small fw-semibold">Año</Form.Label>
                <Form.Control
                  type="number"
                  min={2000}
                  max={2100}
                  value={anio}
                  onChange={e => setAnio(Number(e.target.value))}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-outline-secondary" onClick={() => setShowMensual(false)}>
            Cancelar
          </button>
          <button className="btn btn-success" onClick={exportarMensual} disabled={exportando}>
            <FaFileExcel className="me-1" /> {exportando ? 'Generando...' : 'Descargar Excel'}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
