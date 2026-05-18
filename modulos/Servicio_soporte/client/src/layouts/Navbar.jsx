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

  const navigate = useNavigate();

  const handleSuccess = () => {
            setRefreshKey(prev => prev + 1); // Fuerza recarga
        };

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
        <a aria-label="Abrir menú lateral" role="button" className="nav-item nav-link px-0 me-xl-4" href="#">
          <i className="bx bx-menu bx-sm" aria-hidden="true"></i>
        </a>
      </div>

      <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
        {getGreetingMessage(userData?.nombres + ' ' + userData?.apellidos)}
        <Nav className="flex-row align-items-center ms-auto">
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