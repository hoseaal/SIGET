import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { menuPermissions } from '../data/dataPermissions';

const ROL_VISUALIZADOR = 1;

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify-auth', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        const userRole = data.user?.usu_tip;
        const currentPath = location.pathname;

        const allowedRoles = menuPermissions[currentPath];

        if (allowedRoles && !allowedRoles.includes(userRole)) {
          setIsAuthorized(false);
          navigate('/Dashboard', { replace: true });
          return;
        }

        if (!allowedRoles && userRole === ROL_VISUALIZADOR) {
          setIsAuthorized(false);
          navigate('/Dashboard', { replace: true });
          return;
        }

        setIsLoading(false);
      } catch (err) {
        navigate('/Login', { replace: true });
      }
    };

    verifyAuth();
  }, [navigate, location.pathname]);

  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthorized) return null;

  return children;
};

export default ProtectedRoute;
