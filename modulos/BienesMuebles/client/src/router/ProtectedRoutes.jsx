import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Verificar con el backend si la cookie es válida
        await axios.get('/api/verify-auth', {
          withCredentials: true // Importante para enviar cookies
        });
      } catch (error) {
        navigate('/Login', { replace: true });
      }
    };

    verifyAuth();
  }, [navigate]);

  return children;
};

export default ProtectedRoute;