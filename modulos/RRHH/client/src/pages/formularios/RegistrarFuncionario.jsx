import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../components/atoms/Buttons'; // Asegúrate de que la ruta sea correcta
import Alert from "../../components/atoms/Alert";   // Asegúrate de que la ruta sea correcta
import Spinner from 'react-bootstrap/Spinner';
// import { hasPermission, ACTIONS } from '../../data/dataPermissions' // Descomentar si usas permisos

export const RegistrarFuncionario = () => {
    // Estado para verificar permisos (opcional, basado en tu código anterior)
    const [userType, setUserType] = useState(null);
    
    // Estados de carga y alertas
    const [isSaving, setIsSaving] = useState(false);
    const [savingMessage, setSavingMessage] = useState('');
    const [formEnviado, setFormEnviado] = useState(false);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Estado del Formulario (Coincide con el endpoint POST /api/funcionarios)
    const [formData, setFormData] = useState({
        // Datos Personales
        fun_ced: '',
        fun_nom: '',
        fun_ape: '',
        fun_rif: '',
        fun_fna: '',
        fun_lna: '',
        fun_gen: '',
        fun_est: 'Soltero', // Valor por defecto
        fun_san: '',
        fun_dir: '',
        fun_tel: '',
        fun_cel: '',
        fun_ema1: '',
        fun_ema2: '',
        fun_fing: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        fun_emer1: '',
        fun_teme1: '',
        fun_emer2: '',
        fun_teme2: '',
        fun_dep: '',
        fun_cul: '',
        
        // Tablas Maestras Personales
        pro_ide: '',
        est_ide: 1, // Por defecto Activo (asumiendo ID 1)

        // Datos Contractuales (Opcionales pero recomendados)
        cet_ide: '',
        ona_ide: '',
        niv_ide: '',
        col_ide: '',
        dir_ide: '' // Al enviar Dirección, el backend calcula División
    });

    // Estados para los Selectores (Catalogos)
    const [catalogos, setCatalogos] = useState({
        profesiones: [],
        estatus: [],
        cargosCET: [],
        cargosONAPRE: [],
        niveles: [],
        condiciones: [],
        direcciones: []
    });

    console.log("Catalogos:", catalogos);

    // Cargar catalogos al montar el componente
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                // Aquí asumimos que existen estos endpoints basados en tu estructura
                const [proRes, estRes, cetRes, onaRes, colRes, dirRes] = await Promise.all([
                    fetch('/api/profesiones'),
                    fetch('/api/estatus'),
                    fetch('/api/cargos-cet'),
                    fetch('/api/cargos-onapre'),
                    fetch('/api/condiciones-laborales'), // tmacol
                    fetch('/api/direcciones')
                ]);

                setCatalogos({
                    profesiones: await proRes.json(),
                    estatus: await estRes.json(),
                    cargosCET: await cetRes.json(),
                    cargosONAPRE: await onaRes.json(),
                    condiciones: await colRes.json(),
                    direcciones: await dirRes.json(),
                    niveles: [] // Se cargan dinámicamente según ONAPRE
                });

            } catch (error) {
                console.error("Error cargando catálogos:", error);
                setErrorMessage("Error cargando listas desplegables.");
            }
        };

        fetchCatalogos();
    }, []);

    // Efecto: Cargar Niveles cuando cambia el Cargo ONAPRE (ona_ide)
    useEffect(() => {
        const fetchNiveles = async () => {
            if (!formData.ona_ide) {
                setCatalogos(prev => ({ ...prev, niveles: [] }));
                return;
            }
            try {
                // Asumiendo un endpoint que filtre niveles por cargo ONAPRE
                const res = await fetch(`/api/niveles-salariales?ona_ide=${formData.ona_ide}`);
                const data = await res.json();
                setCatalogos(prev => ({ ...prev, niveles: data }));
            } catch (error) {
                console.error("Error cargando niveles:", error);
            }
        };
        fetchNiveles();
    }, [formData.ona_ide]);


    // Manejador de cambios en inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const limpiarFormulario = () => {
        setFormData({
            fun_ced: '', fun_nom: '', fun_ape: '', fun_rif: '',
            fun_fna: '', fun_lna: '', fun_gen: '', fun_est: 'Soltero',
            fun_san: '', fun_dir: '', fun_cel: '', fun_ema1: '', fun_ema2: '',
            fun_fing: new Date().toISOString().split('T')[0],
            fun_emer1: '', fun_teme1: '', fun_emer2: '', fun_teme2: '', pro_ide: '', est_ide: 1,
            cet_ide: '', ona_ide: '', niv_ide: '', col_ide: '', dir_ide: ''
        });
        setErrorMessage('');
        setMensajeMostrado(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones básicas antes de enviar
        if (!formData.fun_ced || !formData.fun_nom || !formData.fun_ape || !formData.dir_ide) {
            setErrorMessage('Por favor complete Cédula, Nombres, Apellidos y Dirección de Adscripción.');
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 3000);
            return;
        }

        setIsSaving(true);
        setSavingMessage('Guardando Funcionario...');

        try {
            const response = await fetch('/api/funcionarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al registrar funcionario');
            }

            // Éxito
            setFormEnviado(true);
            setMensajeMostrado(true);

            setTimeout(() => {
                setMensajeMostrado(false);
                setFormEnviado(false);
                limpiarFormulario();
            }, 3000);

        } catch (error) {
            console.error('Error:', error);
            setFormEnviado(false);
            setErrorMessage(error.message);
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 4000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="py-3 mb-4"><span className="text-muted fw-light">RRHH /</span> Registrar Nuevo Funcionario</h4>
            </div>
            
            <div className="row">
                <div className="col-xxl">
                    <div className="card mb-4">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="mb-0">Ficha de Ingreso</h5>
                            <small className="text-muted float-end">* Campos obligatorios</small>
                        </div>
                        
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                
                                {/* SECCIÓN 1: DATOS PERSONALES */}
                                <h6 className="mt-2 mb-3 text-primary">1. Datos Personales</h6>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Cédula de Identidad *</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                name="fun_ced"
                                                placeholder="Ej: V-12345678" 
                                                value={formData.fun_ced} 
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>RIF (Opcional)</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                name="fun_rif" 
                                                placeholder="Ej: V123456789"
                                                value={formData.fun_rif} 
                                                onChange={handleChange} 
                                            />
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nombres *</Form.Label>
                                            <Form.Control type="text" name="fun_nom" value={formData.fun_nom} onChange={handleChange} required />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Apellidos *</Form.Label>
                                            <Form.Control type="text" name="fun_ape" value={formData.fun_ape} onChange={handleChange} required />
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-4">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Fecha de Nacimiento</Form.Label>
                                            <Form.Control type="date" name="fun_fna" value={formData.fun_fna} onChange={handleChange} />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Género</Form.Label>
                                            <Form.Select name="fun_gen" value={formData.fun_gen} onChange={handleChange}>
                                                <option value="">Seleccione</option>
                                                <option value="M">Masculino</option>
                                                <option value="F">Femenino</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Estado Civil</Form.Label>
                                            <Form.Select name="fun_est" value={formData.fun_est} onChange={handleChange}>
                                                <option value="Soltero">Soltero(a)</option>
                                                <option value="Casado">Casado(a)</option>
                                                <option value="Divorciado">Divorciado(a)</option>
                                                <option value="Viudo">Viudo(a)</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Lugar de Nacimiento</Form.Label>
                                        <Form.Control as="textarea" rows={2} name="fun_lna" value={formData.fun_lna} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-4">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tipo de Sangre</Form.Label>
                                            <Form.Control type="text" name="fun_san" value={formData.fun_san} onChange={handleChange} />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Numero de Telefono Residencial</Form.Label>
                                            <Form.Control type="text" name="fun_tel" placeholder="0276-0000000" value={formData.fun_tel} onChange={handleChange} />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Numero de Celular</Form.Label>
                                            <Form.Control type="text" name="fun_cel" placeholder="0426-0000000" value={formData.fun_cel} onChange={handleChange} />
                                        </Form.Group>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Correo Electrónico</Form.Label>
                                            <Form.Control type="email" name="fun_ema1" value={formData.fun_ema1} onChange={handleChange} />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Correo Electrónico Secundario</Form.Label>
                                            <Form.Control type="email" name="fun_ema2" value={formData.fun_ema2} onChange={handleChange} />
                                        </Form.Group>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Actividades Culturales</Form.Label>
                                            <Form.Control type="text" name="fun_cul" value={formData.fun_cul} onChange={handleChange} />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Deportes que practica</Form.Label>
                                            <Form.Control type="text" name="fun_dep" value={formData.fun_dep} onChange={handleChange} />
                                        </Form.Group>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Dirección de Habitación</Form.Label>
                                        <Form.Control as="textarea" rows={2} name="fun_dir" value={formData.fun_dir} onChange={handleChange} />
                                    </Form.Group>
                                </div>

                                <div className="row mb-3">
                                    <h6 className="mt-2 mb-3 text-primary">En caso de emergencia avisar a:</h6>
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>1. Nombres Y Apellidos</Form.Label>
                                            <Form.Control type="text" name="fun_emer1" value={formData.fun_emer1} onChange={handleChange} />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>1. Teléfono de Emergencia</Form.Label>
                                            <Form.Control type="text" name="fun_teme1" value={formData.fun_teme1} onChange={handleChange} />
                                        </Form.Group>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>2. Nombres Y Apellidos</Form.Label>
                                            <Form.Control type="text" name="fun_emer2" value={formData.fun_emer2} onChange={handleChange} />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>2. Teléfono de Emergencia</Form.Label>
                                            <Form.Control type="text" name="fun_teme2" value={formData.fun_teme2} onChange={handleChange} />
                                        </Form.Group>
                                    </div>
                                </div>

                                <hr className="my-4" />

                                {/* SECCIÓN 2: DATOS CONTRACTUALES */}
                                <h6 className="mb-3 text-primary">2. Datos Laborales y Contractuales</h6>

                                <div className="row mb-3">
                                    <div className="col-md-4">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Fecha de Ingreso</Form.Label>
                                            <Form.Control type="date" name="fun_fing" value={formData.fun_fing} onChange={handleChange} required />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Estatus</Form.Label>
                                            <Form.Select name="est_ide" value={formData.est_ide} onChange={handleChange}>
                                                <option value="">Seleccione</option>
                                                {catalogos.estatus.map(e => (
                                                    <option key={e.est_ide} value={e.est_ide}>{e.est_nom}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-4">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Profesión</Form.Label>
                                            <Form.Select name="pro_ide" value={formData.pro_ide} onChange={handleChange}>
                                                <option value="">Seleccione</option>
                                                {catalogos.profesiones.map(p => (
                                                    <option key={p.pro_ide} value={p.pro_ide}>{p.pro_nom}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Cargo CET (Interno)</Form.Label>
                                            <Form.Select name="cet_ide" value={formData.cet_ide} onChange={handleChange}>
                                                <option value="">Seleccione</option>
                                                {catalogos.cargosCET.map(c => (
                                                    <option key={c.cet_ide} value={c.cet_ide}>{c.cet_nom}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Condición Laboral</Form.Label>
                                            <Form.Select name="col_ide" value={formData.col_ide} onChange={handleChange}>
                                                <option value="">Seleccione</option>
                                                {catalogos.condiciones.map(c => (
                                                    <option key={c.col_ide} value={c.col_ide}>{c.col_nom}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Clasificación ONAPRE</Form.Label>
                                            <Form.Select name="ona_ide" value={formData.ona_ide} onChange={handleChange}>
                                                <option value="">Seleccione</option>
                                                {catalogos.cargosONAPRE.map(o => (
                                                    <option key={o.ona_ide} value={o.ona_ide}>{o.ona_nom}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nivel Salarial</Form.Label>
                                            <Form.Select name="niv_ide" value={formData.niv_ide} onChange={handleChange} disabled={!formData.ona_ide}>
                                                <option value="">Seleccione</option>
                                                {catalogos.niveles.map(n => (
                                                    <option key={n.niv_ide} value={n.niv_ide}>{n.niv_nom} - {n.niv_sal} Bs.</option>
                                                ))}
                                            </Form.Select>
                                            {catalogos.niveles.length === 0 && formData.ona_ide && (
                                                <Form.Text className="text-muted">No hay niveles para este cargo.</Form.Text>
                                            )}
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Dirección de Adscripción *</Form.Label>
                                        <Form.Select name="dir_ide" value={formData.dir_ide} onChange={handleChange} required>
                                            <option value="">Seleccione la Dirección</option>
                                            {catalogos.direcciones.map(d => (
                                                <option key={d.dir_ide} value={d.dir_ide}>{d.dir_nom}</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Text className="text-muted">
                                            Al seleccionar la dirección, el sistema asignará automáticamente la División y Dirección correspondientes.
                                        </Form.Text>
                                    </Form.Group>
                                </div>

                                {/* BOTONES DE ACCIÓN */}
                                <div className="row justify-content-end mt-4">
                                    <div className="col-auto">
                                        <Button type='secondary' className="me-2" onClick={limpiarFormulario}>Limpiar</Button>
                                        <Button type='primary' size='lg' onClick={handleSubmit} disabled={isSaving}>
                                            {isSaving ? 'Guardando...' : 'Registrar Funcionario'}
                                        </Button>
                                    </div>
                                </div>

                                {/* MENSAJES DE ALERTA */}
                                <div className="mt-3">
                                    {mensajeMostrado && 
                                        <Alert key={formEnviado ? 'success' : 'danger'} type={formEnviado ? 'success' : 'danger'}>
                                            {formEnviado ? 'Funcionario registrado exitosamente.' : errorMessage}
                                        </Alert>
                                    }
                                    {isSaving && (
                                        <div className="text-center mt-3">
                                            <Spinner animation="border" role="status">
                                                <span className="visually-hidden">{savingMessage}</span>
                                            </Spinner>
                                            <p className="mt-2 text-muted">{savingMessage}</p>
                                        </div>
                                    )}
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};