import { useEffect, useMemo, useState } from 'react'
import {
  FaPlus, FaPenToSquare, FaTrashCan, FaKey, FaMagnifyingGlass,
  FaCircleInfo, FaUserShield
} from 'react-icons/fa6'
import { toast } from 'react-toastify'
import api from '../../utils/helpFetch.js'
import { useAuth } from '../../context/AuthContext.jsx'
import UsuarioModal from './components/UsuarioModal.jsx'
import PasswordModal from './components/PasswordModal.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'

const COLOR_ROL = {
  Administrador: 'badge-soft-blue',
  Tecnico: 'badge-soft-green',
  Consulta: 'badge-soft-gray'
}

export default function UsuariosPage () {
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)

  const [showPassword, setShowPassword] = useState(false)
  const [usuarioClave, setUsuarioClave] = useState(null)

  const [showEliminar, setShowEliminar] = useState(false)
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [u, d] = await Promise.all([
        api.get('/usuarios'),
        api.get('/departamentos')
      ])
      setUsuarios(u)
      setDepartamentos(d)
    } catch (error) {
      toast.error(error.message || 'No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return usuarios
    return usuarios.filter(u =>
      `${u.nombres} ${u.apellidos}`.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.cedula || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      u.rol.toLowerCase().includes(q)
    )
  }, [usuarios, busqueda])

  const abrirNuevo = () => {
    setEditando(null)
    setShowModal(true)
  }

  const abrirEditar = (usuario) => {
    setEditando(usuario)
    setShowModal(true)
  }

  const abrirClave = (usuario) => {
    setUsuarioClave(usuario)
    setShowPassword(true)
  }

  const pedirEliminar = (usuario) => {
    setAEliminar(usuario)
    setShowEliminar(true)
  }

  const confirmarEliminar = async () => {
    if (!aEliminar) return
    setEliminando(true)
    try {
      await api.delete(`/usuarios/${aEliminar.id}`)
      toast.success('Usuario eliminado correctamente')
      setShowEliminar(false)
      setAEliminar(null)
      cargarDatos()
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar el usuario. Verifique si tiene actividades asociadas.')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h4>Gestion de usuarios</h4>
          <p>Administre el acceso de los usuarios al modulo de soporte tecnico.</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>
          <FaPlus className="me-1" /> Nuevo usuario
        </button>
      </div>

      <div className="card-cet mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-8">
              <label className="form-label small fw-semibold" htmlFor="us-search">Buscar</label>
              <div className="input-group">
                <span className="input-group-text"><FaMagnifyingGlass /></span>
                <input
                  id="us-search"
                  type="text"
                  className="form-control"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Nombre, usuario, cedula, correo o rol..."
                />
              </div>
            </div>
            <div className="col-12 col-md-4 text-md-end">
              <span className="text-muted small">{filtrados.length} de {usuarios.length} usuario(s)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-cet">
        <div className="card-header-cet">
          <h5 className="section-title">Usuarios del sistema</h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-cet">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Cedula</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Departamento</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                    <span className="ms-2 text-muted">Cargando usuarios...</span>
                  </td>
                </tr>
              )}

              {!loading && filtrados.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <FaCircleInfo />
                      <div>No se encontraron usuarios.</div>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filtrados.map(u => (
                <tr key={u.id}>
                  <td className="fw-semibold text-body text-nowrap">
                    {u.nombres} {u.apellidos}
                    {u.id === user?.id && (
                      <span className="badge badge-soft-gray ms-2">Yo</span>
                    )}
                  </td>
                  <td className="text-nowrap">{u.username}</td>
                  <td className="text-nowrap">{u.cedula || '-'}</td>
                  <td>{u.email || '-'}</td>
                  <td>
                    <span className={`badge ${COLOR_ROL[u.rol] || 'badge-soft-gray'}`}>
                      <FaUserShield className="me-1" />
                      {u.rol}
                    </span>
                  </td>
                  <td>{u.departamento_nombre || '-'}</td>
                  <td>
                    <span className={`badge ${u.activo ? 'badge-soft-green' : 'badge-soft-red'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-center text-nowrap">
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      title="Editar usuario"
                      onClick={() => abrirEditar(u)}
                    >
                      <FaPenToSquare />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      title="Cambiar contrasena"
                      onClick={() => abrirClave(u)}
                    >
                      <FaKey />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Eliminar usuario"
                      onClick={() => pedirEliminar(u)}
                      disabled={u.id === user?.id}
                    >
                      <FaTrashCan />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UsuarioModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSaved={cargarDatos}
        usuario={editando}
        departamentos={departamentos}
      />

      <PasswordModal
        show={showPassword}
        onHide={() => { setShowPassword(false); setUsuarioClave(null) }}
        usuario={usuarioClave}
        onSaved={cargarDatos}
      />

      <ConfirmModal
        show={showEliminar}
        onHide={() => { setShowEliminar(false); setAEliminar(null) }}
        onConfirm={confirmarEliminar}
        loading={eliminando}
        title="Eliminar usuario"
        confirmText="Eliminar"
      >
        <p className="mb-2">
          ¿Seguro que desea eliminar al usuario <strong>{aEliminar?.nombres} {aEliminar?.apellidos}</strong>?
        </p>
        <p className="text-muted small mb-0">
          Si el usuario tiene actividades registradas, no podra eliminarse. Puede desactivarlo en su lugar.
        </p>
      </ConfirmModal>
    </>
  )
}
