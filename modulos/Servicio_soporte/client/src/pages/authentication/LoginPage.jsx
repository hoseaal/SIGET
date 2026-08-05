import { useState, useEffect } from "react";
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import './page-auth.css'
import { useNavigate } from "react-router-dom";
import { AuthWrapper } from "./AuthWrapper";
import Alert from "../../components/atoms/Alert";

const loginSchema = z.object({
    ci: z.string().min(1, "Ingrese su nombre de usuario"),
    password: z.string().min(1, "Ingrese su contraseña")
});

export const LoginPage = () => {
    const [formEnviado, setFormEnviado] = useState(false);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);

    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            ci: '',
            password: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            const res = await fetch('/api/sp/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al iniciar sesión');
            }

            const responseData = await res.json();

            if (responseData.success) {
                setFormEnviado(true);
                setMensajeMostrado(true);
                setTimeout(() => {
                    navigate('/Dashboard', { replace: true });
                }, 1000);
            }
        } catch (error) {
            setFormEnviado(false);
            setMensajeMostrado(true);
            setErrorMessage(error.message);

            setTimeout(() => {
                setMensajeMostrado(false);
            }, 3000);
        }
    };
    return (
        <AuthWrapper>
            <h4 className="mb-2">Bienvenido al modulo de Servicio Técnico! 👋</h4>
            <p className="mb-4">Porfavor ingresa tus datos para acceder. </p>

            <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label htmlFor="ci" className="form-label">Nombre de usuario</label>
                    <input
                        type="text"
                        className={`form-control ${errors.ci ? 'is-invalid' : ''}`}
                        id="ci"
                        {...register("ci")}
                        placeholder=""
                        autoFocus />
                    {errors.ci && <small className="text-danger">{errors.ci.message}</small>}
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
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            {...register("password")}
                            placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                            aria-describedby="password" />
                        <span className="input-group-text cursor-pointer"></span>
                    </div>
                    {errors.password && <small className="text-danger">{errors.password.message}</small>}
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
