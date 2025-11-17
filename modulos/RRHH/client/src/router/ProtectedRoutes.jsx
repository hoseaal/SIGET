import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify-auth', {
          method: 'GET',
          credentials: 'include', // Esencial para enviar cookies
        });

        if (!res.ok) throw new Error();

        // Si llega acá, hay sesión activa
        setIsLoading(false);
      } catch (err) {
        navigate('/Login', { replace: true });
      }
    };

    verifyAuth();
  }, [navigate]);

  if (isLoading) return <div>Cargando...</div>; // O tu spinner facherito

  return children;
};

export default ProtectedRoute;
