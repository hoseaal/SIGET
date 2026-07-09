import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { menuPermissions } from '../data/dataPermissions';


const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  // CORRECCIÓN: empieza en false para no mostrar contenido antes de verificar
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch('/api/rrhh/auth/verify-auth', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        const userRole = data.user?.rol_id;
        const roleName = data.user?.nombre_rol;
        const currentPath = location.pathname;

        // Lógica estricta para Visualizador
        if (roleName === 'Visualizador') {
            if (currentPath !== '/visualizador') {
                setIsAuthorized(false);
                navigate('/visualizador', { replace: true });
                return;
            }
        } else {
            if (currentPath === '/visualizador') {
                setIsAuthorized(false);
                navigate('/Dashboard', { replace: true });
                return;
            }

            const allowedRoles = menuPermissions[currentPath];
            if (allowedRoles && !allowedRoles.includes(userRole)) {
                setIsAuthorized(false);
                navigate('/Dashboard', { replace: true });
                return;
            }
        }

        // Autorizar solo si la verificación fue exitosa
        setIsAuthorized(true);
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
