import { useState, useEffect } from "react";
import { Link } from "react-router-dom"
import './page-auth.css'
import { useNavigate } from "react-router-dom";
import { AuthWrapper } from "./AuthWrapper";
import Alert from "../../components/atoms/Alert";

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
            const res = await fetch('/api/rrhh/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // 🔑 Para que el backend mande la cookie
            body: JSON.stringify(formData),
            });

            if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al iniciar sesión');
            }

            const responseData = await res.json();

            if (responseData.success) {
            console.log(responseData.user);
            setFormEnviado(true);
            setMensajeMostrado(true);
            // Redirigir según el rol: el Visualizador va a su portal exclusivo
            const destino = responseData.user?.nombre_rol === 'Visualizador'
                ? '/visualizador'
                : '/Dashboard';
            setTimeout(() => {
                navigate(destino, { replace: true });
            }, 1000);
            }
        } catch (error) {
            setFormEnviado(false);
            setMensajeMostrado(true);
            setErrorMessage(error.message);

            setFormData(prev => ({ ...prev, password: '' }));

            setTimeout(() => {
            setMensajeMostrado(false);
            }, 3000);
        }
        };
    return (
        <AuthWrapper>
            <h4 className="mb-2">Bienvenido al modulo de Gestion de Recursos Humanos! 👋</h4>
            <p className="mb-4">Porfavor ingresa tus datos para acceder. </p>

            <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Nombre de usuario</label>
                    <input
                        type="text"
                        className="form-control"
                        id="ci"
                        value={formData.ci}
                        onChange={handleChange}
                        name="ci"
                        placeholder=""
                        autoFocus />
                </div>
                <div className="mb-3 form-password-toggle">
                    <div className="d-flex justify-content-between">
                        <label className="form-label" htmlFor="password">Contraseña</label>
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