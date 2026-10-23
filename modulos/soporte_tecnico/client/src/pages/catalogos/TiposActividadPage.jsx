import { useEffect, useMemo, useState } from 'react'
import {
  FaPlus, FaPenToSquare, FaTrashCan, FaMagnifyingGlass, FaCircleInfo,
  FaTags, FaFilter
} from 'react-icons/fa6'
import { toast } from 'react-toastify'
import api from '../../utils/helpFetch.js'
import { clasificacionColor, clasificacionKpi, clasificacionShort } from '../../utils/dateHelpers.js'
import { useAuth } from '../../context/AuthContext.jsx'
import TipoActividadModal from './components/TipoActividadModal.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'

export default function TiposActividadPage () {
  const { user } = useAuth()
  const [tipos, setTipos] = useState([])
  const [clasificaciones, setClasificaciones] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroClasificacion, setFiltroClasificacion] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)

  const [showEliminar, setShowEliminar] = useState(false)
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const esAdmin = user?.rol === 'Administrador'

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [t, c, d] = await Promise.all([
        api.get('/tipos-actividad'),
        api.get('/clasificaciones'),
        api.get('/departamentos')
      ])
      setTipos(t)
      setClasificaciones(c)
      setDepartamentos(d)
    } catch (error) {
      toast.error(error.message || 'No se pudieron cargar los tipos de actividad')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return tipos.filter(t => {
      const coincideClasificacion = !filtroClasificacion ||
        Number(t.clasificacion_id) === Number(filtroClasificacion)
      if (!coincideClasificacion) return false
      if (!q) return true
      return t.nombre.toLowerCase().includes(q) ||
        (t.clasificacion_nombre || '').toLowerCase().includes(q) ||
        (t.departamento_nombre || '').toLowerCase().includes(q)
    })
  }, [tipos, busqueda, filtroClasificacion])

  const resumen = useMemo(() => {
    return clasificaciones.map(c => ({
      ...c,
      total: tipos.filter(t => Number(t.clasificacion_id) === Number(c.id)).length
    }))
  }, [clasificaciones, tipos])

  const abrirNuevo = () => {
    setEditando(null)
    setShowModal(true)
  }

  const abrirEditar = (tipo) => {
    setEditando(tipo)
    setShowModal(true)
  }

  const pedirEliminar = (tipo) => {
    setAEliminar(tipo)
    setShowEliminar(true)
  }

  const confirmarEliminar = async () => {
    if (!aEliminar) return
    setEliminando(true)
    try {
      await api.delete(`/tipos-actividad/${aEliminar.id}`)
      toast.success('Tipo de actividad eliminado correctamente')
      setShowEliminar(false)
      setAEliminar(null)
      cargarDatos()
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar el tipo de actividad. Verifique si tiene actividades asociadas.')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h4>Tipos de actividad</h4>
          <p>Catalogo de actividades agrupadas por clasificacion para los reportes.</p>
        </div>
        {esAdmin && (
          <button className="btn btn-primary" onClick={abrirNuevo}>
            <FaPlus className="me-1" /> Nuevo tipo
          </button>
        )}
      </div>

      <div className="row g-3 mb-4">
        {resumen.map(c => (
          <div className="col-6 col-md-4 col-xl-2" key={c.id}>
            <div className="kpi-card" style={{ padding: '0.9rem', gap: 10 }}>
              <div className={`kpi-icon ${clasificacionKpi(c.codigo)}`} style={{ width: 38, height: 38, fontSize: '1rem' }}>
                <FaTags />
              </div>
              <div className="min-w-0">
                <div className="kpi-value" style={{ fontSize: '1.25rem' }}>{c.total}</div>
                <div
                  className="kpi-label text-truncate"
                  title={c.nombre}
                  style={{ fontSize: '0.7rem' }}
                >
                  {clasificacionShort(c.nombre, c.codigo)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-cet mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-6">
              <label className="form-label small fw-semibold" htmlFor="ta-search">Buscar</label>
              <div className="input-group">
                <span className="input-group-text"><FaMagnifyingGlass /></span>
                <input
                  id="ta-search"
                  type="text"
                  className="form-control"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Nombre, clasificacion o departamento..."
                />
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <label className="form-label small fw-semibold" htmlFor="ta-filtro">Clasificacion</label>
              <div className="input-group">
                <span className="input-group-text"><FaFilter /></span>
                <select
                  id="ta-filtro"
                  className="form-select"
                  value={filtroClasificacion}
                  onChange={e => setFiltroClasificacion(e.target.value)}
                >
                  <option value="">Todas las clasificaciones</option>
                  {clasificaciones.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-12 col-lg-2 text-lg-end">
              <span className="text-muted small">{filtrados.length} de {tipos.length} tipo(s)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-cet">
        <div className="card-header-cet">
          <h5 className="section-title">Catalogo</h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-cet">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Clasificacion</th>
                <th>Departamento</th>
                <th>Estado</th>
                {esAdmin && <th className="text-center">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={esAdmin ? 5 : 4} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                    <span className="ms-2 text-muted">Cargando catalogo...</span>
                  </td>
                </tr>
              )}

              {!loading && filtrados.length === 0 && (
                <tr>
                  <td colSpan={esAdmin ? 5 : 4}>
                    <div className="empty-state">
                      <FaCircleInfo />
                      <div>No se encontraron tipos de actividad.</div>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filtrados.map(t => (
                <tr key={t.id}>
                  <td className="fw-semibold text-body">{t.nombre}</td>
                  <td>
                    <span className={`badge ${clasificacionColor(t.clasificacion_codigo)}`}>
                      {t.clasificacion_nombre}
                    </span>
                  </td>
                  <td>{t.departamento_nombre || '-'}</td>
                  <td>
                    <span className={`badge ${t.activo ? 'badge-soft-green' : 'badge-soft-red'}`}>
                      {t.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {esAdmin && (
                    <td className="text-center text-nowrap">
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        title="Editar tipo"
                        onClick={() => abrirEditar(t)}
                      >
                        <FaPenToSquare />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Eliminar tipo"
                        onClick={() => pedirEliminar(t)}
                      >
                        <FaTrashCan />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TipoActividadModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSaved={cargarDatos}
        tipo={editando}
        clasificaciones={clasificaciones}
        departamentos={departamentos}
      />

      <ConfirmModal
        show={showEliminar}
        onHide={() => { setShowEliminar(false); setAEliminar(null) }}
        onConfirm={confirmarEliminar}
        loading={eliminando}
        title="Eliminar tipo de actividad"
        confirmText="Eliminar"
      >
        <p className="mb-2">
          ¿Seguro que desea eliminar el tipo <strong>{aEliminar?.nombre}</strong>?
        </p>
        <p className="text-muted small mb-0">
          Si tiene actividades asociadas, el sistema impedira la eliminacion.
        </p>
      </ConfirmModal>
    </>
  )
}
