import { useState, useEffect } from "react";
import './page-auth.css'
import Form from 'react-bootstrap/Form';
import Alert from "../../components/atoms/Alert";

export const RegisterPage = () => {
    const [formEnviado, setFormEnviado] = useState(false); // Estado para alternar vista
    const [mensajeMostrado, setMensajeMostrado] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(false); 

    const [formData, setFormData] = useState({
        ced: '',
        password1: '',
        password2: '',
        usu_usu: '',
        nombre: '',
        ape: '',
        usu_tip: '',
        usu_mod: ''
    });

    const tipo = [
                {
                    "usu_tip": 1,
                    "tipo": "Visualizador"
                },
                {
                    "usu_tip": 2,
                    "tipo": "Temporal"
                },
                {
                    "usu_tip": 3,
                    "tipo": "Trabajador"
                },
                {
                    "usu_tip": 4,
                    "tipo": "Jefe de area"
                },
                {
                    "usu_tip": 5,
                    "tipo": "Administrador"
                }
            ];

            const modulos = [
                {
                    "usu_mod": 1,
                    "mod": "Acceso Global"
                },
                {
                    "usu_mod": 2,
                    "mod": "Modulo de Recursos Humanos"
                },
                {
                    "usu_mod": 3,
                    "mod": "Modulo de Bienes Muebles"
                }
            ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(formData.password1 !== formData.password2) throw new Error('Las contraseñas no concuerdan')
        try {
           const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const responseData = await response.json();

            if (response.ok) {
                setFormEnviado(true);
                setMensajeMostrado(true);
            } else {
                throw new Error(responseData.error || 'Error al Agregar nuevo usuario');
            }
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
        <>

        <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración/</span> Nuevo Usuario</h4>

            <div className="row">
                 <div className="col-xxl">
                    <div className="card mb-4">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="mb-0">Registrar nuevo Usuario</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-icon-default-fullname">Cedula</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span id="basic-icon-default-fullname2" className="input-group-text"
                                            ><i className="bx bx-user"></i
                                            ></span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="ced"
                                                value={formData.ced}
                                                onChange={handleChange}
                                                name="ced"
                                                placeholder="ej. 12345678"
                                                autoFocus />
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-icon-default-fullname">Nombre</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span id="basic-icon-default-fullname2" className="input-group-text"
                                            ><i className="bx bx-user"></i
                                            ></span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="nombre"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                name="nombre"
                                                placeholder="Ingresa el Nombre"
                                                autoFocus />
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-icon-default-fullname">Apellido</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span id="basic-icon-default-fullname2" className="input-group-text"
                                            ><i className="bx bx-user"></i
                                            ></span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="ape"
                                                value={formData.ape}
                                                onChange={handleChange}
                                                name="ape"
                                                placeholder="Ingresa el Apellido"
                                                autoFocus />
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-icon-default-fullname">Tipo de Usuario</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span id="basic-icon-default-fullname2" className="input-group-text"
                                            ><i className="bx bx-user"></i
                                            ></span>
                                            <Form.Group >
                                                <Form.Select 
                                                className="form-control"
                                                    name='usu_tip'
                                                    value={formData.usu_tip}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Seleccedone una opción</option>
                                                {tipo.map((item) => (
                                                    <option key={item.usu_tip} value={item.usu_tip}>
                                                        {item.tipo}
                                                    </option>
                                                ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-icon-default-fullname">Modulo al que tiene Acceso</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span id="basic-icon-default-fullname2" className="input-group-text"
                                            ><i className="bx bx-user"></i
                                            ></span>
                                            <Form.Group >
                                                <Form.Select 
                                                className="form-control"
                                                    name='usu_mod'
                                                    value={formData.usu_mod}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Seleccedone una opción</option>
                                                    {modulos.map((item) => (
                                                    <option key={item.usu_mod} value={item.usu_mod}>
                                                        {item.mod}
                                                    </option>
                                                ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-icon-default-fullname">User Name</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span id="basic-icon-default-fullname2" className="input-group-text"
                                            ><i className="bx bx-user"></i
                                            ></span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="usu_usu"
                                                value={formData.usu_usu}
                                                onChange={handleChange}
                                                name="usu_usu"
                                                placeholder="Ingresa el usuario"
                                                autoFocus />
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-icon-default-fullname">Contraseña</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span id="basic-icon-default-fullname2" className="input-group-text"
                                            ><i className="bx bx-user"></i
                                            ></span>
                                            <input
                                                type="password"
                                                autoComplete="true"
                                                id="password1"
                                                value={formData.password1}
                                                onChange={handleChange}
                                                className="form-control"
                                                name="password1"
                                                placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                                                aria-describedby="password1" />
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-icon-default-fullname">Confimar Contraseña</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <span id="basic-icon-default-fullname2" className="input-group-text"
                                            ><i className="bx bx-user"></i
                                            ></span>
                                            <input
                                                type="password"
                                                autoComplete="true"
                                                id="password2"
                                                value={formData.password2}
                                                onChange={handleChange}
                                                className="form-control"
                                                name="password2"
                                                placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                                                aria-describedby="password2" />
                                        </div>
                                    </div>
                                </div>
                                <div className="row justify-content-end">
                                        <button aria-label='Click me' type="submit" className="btn btn-primary" onClick={handleSubmit}>Registrar</button>
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