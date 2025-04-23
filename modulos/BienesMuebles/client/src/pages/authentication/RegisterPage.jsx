import { useState, useEffect } from "react";
import { Link } from "react-router-dom"
import './page-auth.css'
import { AuthWrapper } from "./AuthWrapper";
import Alert from "../../components/atoms/Alert";
import axios from "axios";

export const RegisterPage = () => {
    const [formEnviado, setFormEnviado] = useState(false); // Estado para alternar vista
    const [mensajeMostrado, setMensajeMostrado] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(false); 

    const [formData, setFormData] = useState({
        ci: '',
        password: '',
        terms: false,
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
          const response = await axios.post('/api/register', formData);
          setFormEnviado(true); 
        setMensajeMostrado(true); 
        } catch (error) {
            setFormEnviado(false); // Indicar que hubo un error
            setMensajeMostrado(true);
            setErrorMessage(error.response?.data?.error || error.message)
            
            setTimeout(() => {
                setMensajeMostrado(false);
              }, 3000);
        }
      };

    return (
        <AuthWrapper>

            <h4 className="mb-2">Registrate 🚀</h4>
            <p className="mb-4">Modulo de Gestion de Bienes Muebles! </p>

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
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox" id="terms-conditions"
                            name="terms"
                            value={formData.terms}
                            onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="terms-conditions">
                            I agree to
                            <a aria-label="pricacy policy and terms" href="#"> privacy policy & terms</a>
                        </label>
                    </div>
                </div>
                <button aria-label='Click me' className="btn btn-primary d-grid w-100">Sign up</button>
                <br></br>
                {mensajeMostrado && 
                <Alert key={formEnviado ? 'success' : 'danger'} type={formEnviado ? 'success' : 'danger'}>
                {formEnviado ? 'Iniciando sesion...' : `${errorMessage}`}
            </Alert>
              }
            </form>

            <p className="text-center">
                <span>Already have an account?</span>
                <Link aria-label="Go to Login Page" to="/Login" className="d-flex align-items-center justify-content-center">
                    <i className="bx bx-chevron-left scaleX-n1-rtl bx-sm"></i>
                    Back to login
                </Link>
            </p>

        </AuthWrapper>
    )
}