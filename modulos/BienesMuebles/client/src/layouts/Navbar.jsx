import getGreetingMessage from '../utils/greetingHandler';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Nav, Navbar as BSNavbar, Image } from 'react-bootstrap';
import { BsMenuApp, BsPerson, BsGear, BsCreditCard, BsPower } from 'react-icons/bs';

const Navbar = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Error al cerrar sesión');

      const data = await res.json();
      alert(data.message || 'Sesión cerrada');
      navigate('/Login', { replace: true });

    } catch (error) {
      alert('Error al cerrar sesión');
      console.error('Logout error:', error);
    }
  };

  const tipo = [
    { "usu_tip": 0, "tipo": "Solo vistas" },
    { "usu_tip": 1, "tipo": "Temporal" },
    { "usu_tip": 2, "tipo": "Trabajador" },
    { "usu_tip": 3, "tipo": "Jefe de área" },
    { "usu_tip": 4, "tipo": "Administrador" }
  ];

  return (
    <BSNavbar expand="xl" className="layout-navbar container-xxl navbar-detached bg-navbar-theme">
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
        <a aria-label='toggle for sidebar' className="nav-item nav-link px-0 me-xl-4" href="#">
        <i className="bx bx-menu bx-sm"></i>
        </a>
      </div>

      <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
        {getGreetingMessage(userData?.usu_nom + ' ' + userData?.usu_ape)}
        <Nav className="flex-row align-items-center ms-auto">
          <Dropdown as={Nav.Item} className="navbar-dropdown dropdown-user">
            <Dropdown.Toggle as={Nav.Link} className="dropdown-toggle hide-arrow">
              <div className="avatar avatar-online">
                <Image 
                  src="../assets/img/avatars/1.png" 
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
                        src="../assets/img/avatars/1.png" 
                        className="w-px-40 h-auto rounded-circle" 
                        alt="avatar-image" 
                        aria-label='Avatar Image'
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <span className="fw-medium d-block">{userData?.usu_nom + ' ' + userData?.usu_ape}</span>
                    <small className="text-muted">{tipo.find(item => item?.usu_tip === userData?.usu_tip)?.tipo || "Desconocido"}</small>
                  </div>
                </div>
              </Dropdown.Item>
              
              <Dropdown.Divider />
              
              <Dropdown.Item href="#">
                <BsPerson className="bx me-2" />
                <span className="align-middle">My Profile</span>
              </Dropdown.Item>
              
              <Dropdown.Item href="#">
                <BsGear className="bx me-2" />
                <span className="align-middle">Settings</span>
              </Dropdown.Item>
              
              <Dropdown.Item href="#">
                <span className="d-flex align-items-center align-middle">
                  <BsCreditCard className="flex-shrink-0 bx me-2" />
                  <span className="flex-grow-1 align-middle ms-1">Billing</span>
                  <span className="flex-shrink-0 badge badge-center rounded-pill bg-danger w-px-20 h-px-20">4</span>
                </span>
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
    </BSNavbar>
  );
}

export default Navbar;