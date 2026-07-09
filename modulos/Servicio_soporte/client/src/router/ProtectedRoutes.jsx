import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch('/api/sp/auth/verify-auth', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        if (!data.success) throw new Error();

        setUser(data.user);
        setIsLoading(false);
      } catch (err) {
        navigate('/Login', { replace: true });
      }
    };

    verifyAuth();
  }, [navigate]);

  if (isLoading) return <div>Cargando...</div>;

  // Si se definieron roles permitidos, verificar que el usuario tenga uno de ellos
  if (allowedRoles && !allowedRoles.includes(user.rol_id)) {
    // Redirigir al Dashboard si no tiene permiso para esta ruta específica
    return <Navigate to="/Dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;


