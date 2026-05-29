import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import './page-auth.css'
import Form from 'react-bootstrap/Form';
import Alert from "../../components/atoms/Alert";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?/{}~|])/;

const schema = z.object({
  ced: z.string().min(6, "La cédula debe tener al menos 6 caracteres").max(15, "La cédula es muy larga").regex(/^\d+$/, "Solo se permiten números"),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre es muy largo"),
  ape: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50, "El apellido es muy largo"),
  rol_id: z.string().min(1, "Seleccione un tipo de usuario"),
  modulo_id: z.string().min(1, "Seleccione un módulo"),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(30, "El nombre de usuario es muy largo"),
  password1: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").regex(passwordRegex, "Debe contener mayúscula, minúscula, número y símbolo"),
  password2: z.string().min(8, "La confirmación debe tener al menos 8 caracteres")
}).refine((data) => data.password1 === data.password2, {
  message: "Las contraseñas no coinciden",
  path: ["password2"]
});

export const RegisterPage = () => {
    const [formEnviado, setFormEnviado] = useState(false);
    const [mensajeMostrado, setMensajeMostrado] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(""); 

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            ced: '', nombre: '', ape: '', rol_id: '', modulo_id: '', username: '', password1: '', password2: ''
        }
    });

    const tipo = [
        { "rol_id": 1, "tipo": "Visualizador" },
        { "rol_id": 2, "tipo": "Temporal" },
        { "rol_id": 3, "tipo": "Trabajador" },
        { "rol_id": 4, "tipo": "Jefe de area" },
        { "rol_id": 5, "tipo": "Administrador" }
    ];

    const modulos = [
        { "modulo_id": 1, "mod": "Acceso Global" },
        { "modulo_id": 2, "mod": "Modulo de Recursos Humanos" },
        { "modulo_id": 3, "mod": "Modulo de Bienes Muebles" }
    ];

    const onSubmit = async (data) => {
        try {
           const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (response.ok) {
                setFormEnviado(true);
                setMensajeMostrado(true);
            } else {
                throw new Error(responseData.error || 'Error al Agregar nuevo usuario');
            }
        } catch (error) {
            setFormEnviado(false);
            setMensajeMostrado(true);

            let errorMsg = error.message;
            if (errorMsg.includes("Duplicate entry")) {
                errorMsg = "Este usuario o cédula ya existe";
            }
            // Si el backend devuelve un array de errores Zod (nuestra implementación en el servidor)
            if (Array.isArray(error.response?.data?.error)) {
                errorMsg = error.response.data.error.map(e => e.message).join(", ");
            } else if (error.response?.data?.error) {
                errorMsg = error.response.data.error;
            }

            setErrorMessage(errorMsg);

            setTimeout(() => {
                setMensajeMostrado(false);
            }, 3000);
        }
    }

    return (
        <>
        <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración/</span> Nuevo Usuario</h4>

            <div className="row">
                 <div className="col-xxl">
                    <div className="card mb-4">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="mb-0">Registrar nuevo Usuario</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="ced">Cédula</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span className="input-group-text"><i className="bx bx-id-card"></i></span>
                                            <input type="text" className={`form-control ${errors.ced ? 'is-invalid' : ''}`}
                                                id="ced" placeholder="ej. 12345678" {...register("ced")} autoFocus />
                                        </div>
                                        {errors.ced && <small className="text-danger">{errors.ced.message}</small>}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="nombre">Nombre</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span className="input-group-text"><i className="bx bx-user"></i></span>
                                            <input type="text" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                                                id="nombre" placeholder="Ingresa el Nombre" {...register("nombre")} />
                                        </div>
                                        {errors.nombre && <small className="text-danger">{errors.nombre.message}</small>}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="ape">Apellido</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span className="input-group-text"><i className="bx bx-user"></i></span>
                                            <input type="text" className={`form-control ${errors.ape ? 'is-invalid' : ''}`}
                                                id="ape" placeholder="Ingresa el Apellido" {...register("ape")} />
                                        </div>
                                        {errors.ape && <small className="text-danger">{errors.ape.message}</small>}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="rol_id">Tipo de Usuario</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span className="input-group-text"><i className="bx bx-briefcase"></i></span>
                                            <Form.Select className={`form-control ${errors.rol_id ? 'is-invalid' : ''}`} {...register("rol_id")}>
                                                <option value="">Seleccione una opción</option>
                                                {tipo.map((item) => (
                                                    <option key={item.rol_id} value={item.rol_id}>{item.tipo}</option>
                                                ))}
                                            </Form.Select>
                                        </div>
                                        {errors.rol_id && <small className="text-danger">{errors.rol_id.message}</small>}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="modulo_id">Módulo al que tiene Acceso</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span className="input-group-text"><i className="bx bx-layout"></i></span>
                                            <Form.Select className={`form-control ${errors.modulo_id ? 'is-invalid' : ''}`} {...register("modulo_id")}>
                                                <option value="">Seleccione una opción</option>
                                                {modulos.map((item) => (
                                                    <option key={item.modulo_id} value={item.modulo_id}>{item.mod}</option>
                                                ))}
                                            </Form.Select>
                                        </div>
                                        {errors.modulo_id && <small className="text-danger">{errors.modulo_id.message}</small>}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="username">User Name</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span className="input-group-text"><i className="bx bx-user-circle"></i></span>
                                            <input type="text" className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                                id="username" placeholder="Ingresa el usuario" {...register("username")} />
                                        </div>
                                        {errors.username && <small className="text-danger">{errors.username.message}</small>}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="password1">Contraseña</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span className="input-group-text"><i className="bx bx-lock-alt"></i></span>
                                            <input type="password" autoComplete="true" className={`form-control ${errors.password1 ? 'is-invalid' : ''}`}
                                                id="password1" placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;" {...register("password1")} />
                                        </div>
                                        {errors.password1 && <small className="text-danger">{errors.password1.message}</small>}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="password2">Confirmar Contraseña</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span className="input-group-text"><i className="bx bx-lock-alt"></i></span>
                                            <input type="password" autoComplete="true" className={`form-control ${errors.password2 ? 'is-invalid' : ''}`}
                                                id="password2" placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;" {...register("password2")} />
                                        </div>
                                        {errors.password2 && <small className="text-danger">{errors.password2.message}</small>}
                                    </div>
                                </div>
                                <div className="row justify-content-end">
                                    <button type="submit" className="btn btn-primary">Registrar</button>
                                    {mensajeMostrado && 
                                        <Alert key={formEnviado ? 'success' : 'danger'} type={formEnviado ? 'success' : 'danger'}>
                                        {formEnviado ? 'Registrado con Exito' : `${errorMessage}`}
                                        </Alert>
                                    }
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}