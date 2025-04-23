import { useState, useEffect } from "react";
import { Link } from "react-router-dom"
import './page-auth.css'
import { useNavigate } from "react-router-dom";
import { AuthWrapper } from "./AuthWrapper";
import Alert from "../../components/atoms/Alert";
import axios from 'axios';

export const LoginPage = () => {
    const [formEnviado, setFormEnviado] = useState(false); // Estado para alternar vista
    const [mensajeMostrado, setMensajeMostrado] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(false); 

    const navigate = useNavigate();
    
    
    
    const [formData, setFormData] = useState({
        ci: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await axios.post('/api/login', formData, {
            withCredentials: true // Necesario para recibir cookies
          });
      
          if (response.data.success) {
            console.log(response.data.user);
            setFormEnviado(true); 
            setMensajeMostrado(true); 
            setTimeout(() => {
                navigate('/Dashboard', { replace: true });  
              }, 1000); 
          }
        } catch (error) {
            setFormEnviado(false); // Indicar que hubo un error
            setMensajeMostrado(true);
            setErrorMessage(error.response?.data?.error || error.message)

             setFormData(prev => ({ ...prev, password: '' }));

             setTimeout(() => {
                setMensajeMostrado(false);
              }, 3000);
        }
      };
    return (
        <AuthWrapper>
            <h4 className="mb-2">Bienvenido al modulo de Gestion de Bienes Muebles! 👋</h4>
            <p className="mb-4">Porfavor ingresa tus datos para acceder. </p>

            <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Cedula de identidad</label>
                    <input
                        type="text"
                        className="form-control"
                        id="ci"
                        value={formData.ci}
                        onChange={handleChange}
                        name="ci"
                        placeholder="ej. 12345678"
                        autoFocus />
                </div>
                <div className="mb-3 form-password-toggle">
                    <div className="d-flex justify-content-between">
                        <label className="form-label" htmlFor="password">Contraseña</label>
                        <Link aria-label="Go to Forgot Password Page" to="/auth/forgot-password">
                            <small>Forgot Password?</small>
                        </Link>
                    </div>
                    <div className="input-group input-group-merge">
                        <input
                            type="password"
                            autoComplete="true"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-control"
                            name="password"
                            placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                            aria-describedby="password" />
                        <span className="input-group-text cursor-pointer"></span>
                    </div>
                </div>
                <div className="mb-3">
                    <button aria-label='Click me' className="btn btn-primary d-grid w-100" type="submit">Ingresar</button>
                </div>
                {mensajeMostrado && 
                <Alert key={formEnviado ? 'success' : 'danger'} type={formEnviado ? 'success' : 'danger'}>
                {formEnviado ? 'Iniciando sesion...' : `${errorMessage}`}
            </Alert>
              }
            </form>

        </AuthWrapper>
    )
}