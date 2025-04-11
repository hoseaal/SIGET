import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios';

// Configuración Axios
axios.defaults.withCredentials = true;

// Nuevo interceptor que usa React Router
const setupAxiosInterceptors = (navigate) => {
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        // Usa el navigate del router en lugar de window.location
        navigate('/Login', { replace: true });
      }
      return Promise.reject(error);
    }
  );
};

// Componente wrapper para inyectar navigate
const AxiosInterceptorSetup = ({ children }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    setupAxiosInterceptors(navigate);
  }, [navigate]);

  return children;
};


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
