import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext.jsx'
import logoContraloria from '../../../public/assets/img/logo-contraloria-home2.png'
import './page-auth.css'

export default function LoginPage () {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.username.trim() || !formData.password) {
      toast.warning('Ingrese usuario y contrasena')
      return
    }

    setSubmitting(true)
    try {
      await login(formData.username.trim(), formData.password)
      toast.success('Bienvenido al modulo de Soporte Tecnico')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error.message || 'No se pudo iniciar sesion')
      setFormData(prev => ({ ...prev, password: '' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-xxl">
      <div className="authentication-wrapper authentication-basic container-p-y">
        <div className="authentication-inner">
          <div className="card">
            <div className="card-body">
              <div className="app-brand justify-content-center">
                <Link to="/" className="app-brand-link gap-2">
                  <span className="app-brand-logo demo">
                    <img
                      src={logoContraloria}
                      alt="Contraloria del Estado Tachira"
                      style={{ width: 32, height: 'auto' }}
                    />
                  </span>
                  <span className="app-brand-text demo text-body fw-bold">SIGET</span>
                </Link>
              </div>

              <h4 className="mb-2">Bienvenido al modulo de Soporte Tecnico! 👋</h4>
              <p className="mb-4">Ingresa tus credenciales para acceder al sistema.</p>

              <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Nombre de usuario</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Ingrese su usuario"
                    autoComplete="username"
                    autoFocus
                  />
                </div>

                <div className="mb-3 form-password-toggle">
                  <div className="d-flex justify-content-between">
                    <label className="form-label" htmlFor="password">Contrasena</label>
                  </div>
                  <div className="input-group input-group-merge">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                    />
                    <span className="input-group-text cursor-pointer"></span>
                  </div>
                </div>

                <div className="mb-3">
                  <button className="btn btn-primary d-grid w-100" type="submit" disabled={submitting}>
                    {submitting ? 'Ingresando...' : 'Ingresar'}
                  </button>
                </div>
              </form>

              <p className="text-center mb-0 text-muted" style={{ fontSize: '0.78rem' }}>
                Contraloria del Estado Tachira - Division de Servicio Tecnico
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
