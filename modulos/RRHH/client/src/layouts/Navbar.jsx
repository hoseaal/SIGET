import getGreetingMessage from '../utils/greetingHandler';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Nav, Navbar as BSNavbar, Image, Toast, ToastContainer } from 'react-bootstrap';
import { BsMenuApp, BsPerson, BsGear, BsCreditCard, BsPower } from 'react-icons/bs';
import ModalContraseña from '../pages/Modales/modalContraseña'

const Navbar = () => {
  const [userData, setUserData] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [showUserConModal, setShowUserConModal] = useState(false);
  const [vacationAlerts, setVacationAlerts] = useState({
    proximosDerecho: [],
    proximosRetornar: []
  });

  const navigate = useNavigate();

  const handleSuccess = () => {
            // Fuerza recarga
        };

  const formatAlertDate = (value) => {
    if (!value) return 'N/A';
    const normalized = typeof value === 'string' && value.includes('T') ? value : `${value}T00:00:00`;
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString();
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/vacaciones/alertas');
      if (res.ok) {
        const data = await res.json();
        setVacationAlerts({
          proximosDerecho: Array.isArray(data?.proximosDerecho)
            ? data.proximosDerecho
            : (Array.isArray(data?.por_derecho) ? data.por_derecho : []),
          proximosRetornar: Array.isArray(data?.proximosRetornar)
            ? data.proximosRetornar
            : (Array.isArray(data?.caducidad) ? data.caducidad : [])
        });
      }
    } catch (error) {
      console.error('Error al obtener alertas de vacaciones:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/auth/verify-auth', {
          method: 'GET',
          credentials: 'include'
        });

        if (!res.ok) throw new Error('Sesión inválida');

        const data = await res.json();

        if (data.success) {
          setUserData(data.user);
        }
      } catch (error) {
        console.error('Error obteniendo datos de usuario:', error);
        // Si falla la sesión, redirigí si querés:
        // navigate('/Login', { replace: true });
      }
    };

    fetchUserData();
  }, []);

  const showNotification = (message, variant) => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Error al cerrar sesión');

      const data = await res.json();
      showNotification(data.message || 'Sesión cerrada correctamente.', 'success');
      setTimeout(() => {
        navigate('/Login', { replace: true });
      }, 2000);

    } catch (error) {
      showNotification('Error al cerrar sesión.', 'danger');
      console.error('Logout error:', error);
    }
  };

  const tipo = [
    { "rol_id": 1, "tipo": "Visualizador" },
    { "rol_id": 2, "tipo": "Temporal" },
    { "rol_id": 3, "tipo": "Trabajador" },
    { "rol_id": 4, "tipo": "Jefe de área" },
    { "rol_id": 5, "tipo": "Administrador" }
  ];

  return (
    <>
    <BSNavbar expand="xl" className="layout-navbar container-xxl navbar-detached bg-navbar-theme">
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
        <a aria-label='toggle for sidebar' className="nav-item nav-link px-0 me-xl-4" href="#">
        <i className="bx bx-menu bx-sm"></i>
        </a>
      </div>

      <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
        {getGreetingMessage(userData?.nombres + ' ' + userData?.apellidos)}
        <Nav className="flex-row align-items-center ms-auto">
          {/* Notifications Dropdown */}
          <Dropdown as={Nav.Item} className="navbar-dropdown dropdown-notifications me-3 d-flex align-items-center">
            <Dropdown.Toggle as={Nav.Link} className="dropdown-toggle hide-arrow d-flex align-items-center" style={{ position: 'relative' }}>
              <i className="bx bx-bell bx-sm"></i>
              {((vacationAlerts.proximosDerecho?.length || 0) +
                (vacationAlerts.proximosRetornar?.length || 0)) > 0 && (
                <span className="badge bg-danger rounded-pill badge-notifications" style={{ position: 'absolute', top: '0', right: '-5px', fontSize: '0.65rem', padding: '0.25em 0.4em' }}>
                  {(vacationAlerts.proximosDerecho?.length || 0) +
                   (vacationAlerts.proximosRetornar?.length || 0)}
                </span>
              )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-menu-end py-0" style={{ width: '320px', maxHeight: '400px', overflowY: 'auto' }}>
              <div className="dropdown-menu-header border-bottom">
                <div className="dropdown-header d-flex align-items-center py-3">
                  <h6 className="text-body mb-0 me-auto">Notificaciones</h6>
                  <a href="#" className="text-muted" title="Refrescar">
                    <i className="bx fs-4 bx-refresh" onClick={fetchNotifications}></i>
                  </a>
                </div>
              </div>
              <ul className="list-group list-group-flush">
                {((vacationAlerts.proximosDerecho?.length || 0) +
                  (vacationAlerts.proximosRetornar?.length || 0)) === 0 ? (
                  <li className="list-group-item text-center text-muted py-4" style={{ fontSize: '0.85rem' }}>
                    <i className="bx bx-bell-off fs-4 mb-2 d-block"></i>
                    No hay alertas de vacaciones.
                  </li>
                ) : (
                  <>
                    {/* Próximos a obtener el derecho */}
                    {vacationAlerts.proximosDerecho?.map((item) => {
                      const linkPath = item.tipo_empleado === 'obrero' ? '/Personal/Vacaciones/Obreros' : '/Personal/Vacaciones/Funcionarios';
                      return (
                        <li 
                          key={`derecho-${item.empleado_id}`} 
                          className="list-group-item list-group-item-action dropdown-notifications-item"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(linkPath)}
                        >
                          <div className="d-flex">
                            <div className="flex-shrink-0 me-3">
                              <div className="avatar">
                                <span className="avatar-initial rounded-circle bg-label-success text-success" style={{ backgroundColor: '#e8fadf', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="bx bx-calendar"></i>
                                </span>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1" style={{ fontSize: '0.85rem' }}>Por obtener derecho</h6>
                              <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                                {item.nombres} {item.apellidos} ({item.tipo_empleado === 'obrero' ? 'Obrero' : 'Funcionario'}) por obtener derecho este mes.
                              </p>
                              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                Derecho: {formatAlertDate(item.fecha_derecho_proximo)}
                              </small>
                            </div>
                          </div>
                        </li>
                      );
                    })}

                    {/* Próximos a retornar */}
                    {vacationAlerts.proximosRetornar?.map((item) => {
                      const linkPath = item.tipo_empleado === 'obrero' ? '/Personal/Vacaciones/Obreros' : '/Personal/Vacaciones/Funcionarios';
                      return (
                        <li 
                          key={`retorno-${item.empleado_id}`} 
                          className="list-group-item list-group-item-action dropdown-notifications-item"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(linkPath)}
                        >
                          <div className="d-flex">
                            <div className="flex-shrink-0 me-3">
                              <div className="avatar">
                                <span className="avatar-initial rounded-circle bg-label-warning text-warning" style={{ backgroundColor: '#fff3e0', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="bx bx-time-five"></i>
                                </span>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1" style={{ fontSize: '0.85rem' }}>Vacaciones por terminar</h6>
                              <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                                {item.nombres} {item.apellidos} ({item.tipo_empleado === 'obrero' ? 'Obrero' : 'Funcionario'}) próximo a retornar.
                              </p>
                              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                Retorno: {formatAlertDate(item.fecha_retorno || item.fecha_fin)}
                              </small>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </>
                )}
              </ul>
              <div className="dropdown-menu-footer border-top p-3">
                <button className="btn btn-primary text-uppercase w-100" style={{ fontSize: '0.8rem' }}>Ver todas las notificaciones</button>
              </div>
            </Dropdown.Menu>
          </Dropdown>

          {/* User Profile Dropdown */}
          <Dropdown as={Nav.Item} className="navbar-dropdown dropdown-user">
            <Dropdown.Toggle as={Nav.Link} className="dropdown-toggle hide-arrow">
              <div className="avatar avatar-online">
                <Image 
                  src="../assets/img/avatars/1.jpg" 
                  className="w-px-40 h-auto rounded-circle" 
                  alt="avatar-image" 
                  aria-label='Avatar Image'
                />
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-menu-end">
              <Dropdown.Item href="#">
                <div className="d-flex">
                  <div className="flex-shrink-0 me-3">
                    <div className="avatar avatar-online">
                      <Image 
                        src="../assets/img/avatars/1.jpg" 
                        className="w-px-40 h-auto rounded-circle" 
                        alt="avatar-image" 
                        aria-label='Avatar Image'
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <span className="fw-medium d-block">{userData?.nombres + ' ' + userData?.apellidos}</span>
                    <small className="text-muted">{tipo.find(item => item?.rol_id === userData?.rol_id)?.tipo || "Desconocido"}</small>
                  </div>
                </div>
              </Dropdown.Item>
              
              <Dropdown.Divider />
              
              <Dropdown.Item  onClick={() => {setShowUserConModal(true)}}>
                <BsPerson className="bx me-2" />
                <span className="align-middle">Cambiar Contraseña</span>
              </Dropdown.Item>
              <Dropdown.Divider />
              
              <Dropdown.Item onClick={handleLogout}>
                <BsPower className="bx me-2" />
                <span className="align-middle">Log Out</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </div>
      <ModalContraseña
                    show={showUserConModal}
                    handleClose={() => setShowUserConModal(false)}
                    rowData={userData} 
                    onSuccess={handleSuccess}
                    idColumn='usuario_id'
                />
    </BSNavbar>

    <ToastContainer position="top-center" className="p-3" style={{ zIndex: 9999, position: 'fixed', right: 0, top: 0 }} >
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Header>
            <strong className="me-auto">{toastVariant === 'success' ? 'Éxito' : 'Error'}</strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'light' ? 'text-dark' : 'text-white'}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
      
      </>
  );
}

export default Navbar;