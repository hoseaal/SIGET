import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Dropdown } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'
import logoContraloria from '../../public/assets/img/logo-contraloria-home2.png'
import avatar1 from '../../public/assets/img/avatars/1.jpg'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: 'bx bx-home-smile', end: true },
  { to: '/actividades', label: 'Actividades', icon: 'bx bx-list-check' },
  { to: '/bienes', label: 'Bienes muebles', icon: 'bx bx-package' },
  { to: '/catalogos', label: 'Tipos de actividad', icon: 'bx bx-purchase-tag-alt' },
  { to: '/usuarios', label: 'Usuarios', icon: 'bx bx-user', roles: ['Administrador'] }
]

function getSaludo () {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos dias'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function MenuItem ({ item }) {
  const location = useLocation()
  const isActive = item.end
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to)

  return (
    <li className={`menu-item ${isActive ? 'active' : ''}`}>
      <NavLink to={item.to} end={item.end} className="menu-link">
        <i className={`menu-icon tf-icons ${item.icon}`}></i>
        <div>{item.label}</div>
      </NavLink>
    </li>
  )
}

export default function DashboardLayout () {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.info('Sesion finalizada correctamente')
    navigate('/login', { replace: true })
  }

  const itemsVisibles = NAV_ITEMS.filter(
    item => !item.roles || item.roles.includes(user?.rol)
  )

  return (
    <div className={`layout-wrapper layout-content-navbar ${menuOpen ? 'menu-open' : ''}`}>
      <div className="layout-container">
        <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
          <div className="app-brand demo">
            <Link to="/" className="app-brand-link">
              <img
                src={logoContraloria}
                alt="Contraloria del Estado Tachira"
                style={{ width: 26, height: 'auto' }}
              />
              <span className="app-brand-text demo menu-text fw-bold ms-2">SIGET</span>
            </Link>
            <a
              href="#"
              className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none"
              onClick={(e) => { e.preventDefault(); setMenuOpen(false) }}
              aria-label="Cerrar menu"
            >
              <i className="bx bx-chevron-left bx-sm align-middle"></i>
            </a>
          </div>

          <div className="menu-inner-shadow"></div>

          <ul className="menu-inner py-1">
            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">Operacion</span>
            </li>
            {itemsVisibles.map(item => (
              <MenuItem key={item.to} item={item} />
            ))}

          </ul>
        </aside>

        <div className="layout-page">
          <nav
            className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
            id="layout-navbar"
          >
            <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
              <a
                className="nav-item nav-link px-0 me-xl-4"
                href="#"
                onClick={(e) => { e.preventDefault(); setMenuOpen(true) }}
                aria-label="Abrir menu"
              >
                <i className="bx bx-menu bx-sm"></i>
              </a>
            </div>

            <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
              <div className="navbar-nav align-items-center">
                <div className="nav-item d-flex align-items-center">
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                    {getSaludo()}, <strong className="text-body">{user?.nombres}</strong>
                  </span>
                </div>
              </div>

              <ul className="navbar-nav flex-row align-items-center ms-auto">
                <li className="nav-item navbar-dropdown dropdown-user dropdown">
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      as="a"
                      className="nav-link dropdown-toggle hide-arrow"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="avatar avatar-online">
                        <img
                          src={avatar1}
                          alt="Avatar"
                          className="w-px-40 h-auto rounded-circle"
                        />
                      </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.ItemText>
                        <div className="d-flex">
                          <div className="flex-shrink-0 me-3">
                            <div className="avatar avatar-online">
                              <img
                                src={avatar1}
                                alt="Avatar"
                                className="w-px-40 h-auto rounded-circle"
                              />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <span className="fw-medium d-block">
                              {user?.nombres} {user?.apellidos}
                            </span>
                            <small className="text-muted">{user?.rol}</small>
                          </div>
                        </div>
                      </Dropdown.ItemText>

                      <Dropdown.Divider />

                      <Dropdown.Item onClick={() => navigate('/usuarios')}>
                        <i className="bx bx-user me-2"></i>
                        <span className="align-middle">Usuarios</span>
                      </Dropdown.Item>

                      <Dropdown.Divider />

                      <Dropdown.Item onClick={handleLogout}>
                        <i className="bx bx-power-off me-2"></i>
                        <span className="align-middle">Cerrar sesion</span>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </li>
              </ul>
            </div>
          </nav>

          <div className="content-wrapper">
            <div className="container-xxl flex-grow-1 container-p-y">
              <Outlet />
            </div>

            <footer className="content-footer footer bg-footer-theme">
              <div className="container-xxl d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column">
                <div className="mb-2 mb-md-0">
                  © {new Date().getFullYear()}, Contraloria del Estado Tachira
                </div>
                <div className="text-muted small">
                  Division de Servicio Tecnico
                </div>
              </div>
            </footer>
          </div>
        </div>

        <div
          className="layout-overlay layout-menu-toggle"
          onClick={() => setMenuOpen(false)}
        ></div>
      </div>
    </div>
  )
}
