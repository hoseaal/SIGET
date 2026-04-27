import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../../components/atoms/Buttons';
import Alert from "../../../components/atoms/Alert";
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import { useSelectsDependientes } from '../../../hooks/useSelectsDependientes';
// import { hasPermission, ACTIONS } from '../../../data/dataPermissions' // Descomentar si usas permisos

export const RegistrarFuncionario = ({ show, handleClose, onSaveStart, onSaveEnd }) => {
    const [paso, setPaso] = useState(1);
    const [userType, setUserType] = useState(null);
    const [mensajeMostrado, setMensajeMostrado] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Estado del Formulario (Coincide con el endpoint POST /api/funcionarios)
    const [formData, setFormData] = useState({
        // Datos Personales
        cedula: '',
        nombres: '',
        apellidos: '',
        rif: '',
        fecha_nacimiento: '',
        lugar_nacimiento: '',
        genero: '',
        estado_civil: 'Soltero', // Valor por defecto
        tipo_sangre: '',
        direccion_habitacion: '',
        telefono_fijo: '',
        celular: '',
        correo_principal: '',
        correo_secundario: '',
        cuenta_bancaria: '',
        fecha_ingreso: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        contacto_emergencia_1: '',
        telefono_emergencia_1: '',
        contacto_emergencia_2: '',
        telefono_emergencia_2: '',
        deportes: '',
        actividades_culturales: '',

        // Tablas Maestras Personales
        profesion_id: '',
        estatus_id: 1, // Por defecto Activo (asumiendo ID 1)

        // Datos Contractuales (Opcionales pero recomendados)
        cargo_cet_id: '',
        cargo_onapre_id: '',
        nivel_salarial_id: '',
        condicion_laboral_id: '',
        direccion_id: '', // Nivel 1
        division_id: '', // Nivel 2
        unidad_id: ''  // Nivel 3
    });

    // Estados para los Selectores (Catalogos)
    const [catalogos, setCatalogos] = useState({
        profesiones: [],
        estatus: [],
        cargosCET: [],
        cargosONAPRE: [],
        niveles: [],
        condiciones: [],
        direcciones: [],
        divisiones: [],
        unidades: []
    });

    // Hook de selects dependientes: filtra CET, divisiones y unidades localmente
    const {
        cargosCETFiltrados,
        divisionesFiltradas,
        unidadesFiltradas,
        tieneDivisiones,
        tieneUnidades,
        tieneUnidadesDirectas
    } = useSelectsDependientes(formData, catalogos);

    // Cargar catalogos al montar el componente
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const [proRes, estRes, cetRes, onaRes, colRes, dirRes, divRes, uniRes] = await Promise.all([
                    fetch('/api/profesiones'),
                    fetch('/api/estatus'),
                    fetch('/api/cargos-cet'),
                    fetch('/api/cargos-onapre'),
                    fetch('/api/condiciones-laborales'),
                    fetch('/api/direcciones'),
                    fetch('/api/divisiones'),
                    fetch('/api/unidades')
                ]);

                setCatalogos({
                    profesiones: await proRes.json(),
                    estatus: await estRes.json(),
                    cargosCET: await cetRes.json(),
                    cargosONAPRE: await onaRes.json(),
                    condiciones: await colRes.json(),
                    direcciones: await dirRes.json(),
                    divisiones: await divRes.json(),
                    unidades: await uniRes.json(),
                    niveles: [] // Se cargan dinámicamente según ONAPRE
                });

            } catch (error) {
                console.error("Error cargando catálogos:", error);
                setErrorMessage("Error cargando listas desplegables.");
            }
        };

        fetchCatalogos();
    }, []);

    // Efecto: Cargar Niveles cuando cambia el Cargo ONAPRE (cargo_onapre_id)
    useEffect(() => {
        const fetchNiveles = async () => {
            if (!formData.cargo_onapre_id) {
                setCatalogos(prev => ({ ...prev, niveles: [] }));
                return;
            }
            try {
                // Asumiendo un endpoint que filtre niveles por cargo ONAPRE
                const res = await fetch(`/api/niveles-salariales?cargo_onapre_id=${formData.cargo_onapre_id}`);
                const data = await res.json();
                setCatalogos(prev => ({ ...prev, niveles: data }));
            } catch (error) {
                console.error("Error cargando niveles:", error);
            }
        };
        fetchNiveles();
    }, [formData.cargo_onapre_id]);


    // Manejador de cambios en inputs
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Lógica de limpieza en cascada
            if (name === 'direccion_id') {
                newData.division_id = '';
                newData.unidad_id = '';
            } else if (name === 'division_id') {
                newData.unidad_id = '';
            } else if (name === 'cargo_onapre_id') {
                newData.cargo_cet_id = '';
                newData.nivel_salarial_id = '';
            }

            return newData;
        });
    };

    const limpiarFormulario = () => {
        setFormData({
            cedula: '', nombres: '', apellidos: '', rif: '',
            fecha_nacimiento: '', lugar_nacimiento: '', genero: '', estado_civil: 'Soltero',
            tipo_sangre: '', direccion_habitacion: '', celular: '', correo_principal: '', correo_secundario: '', cuenta_bancaria: '',
            fecha_ingreso: new Date().toISOString().split('T')[0],
            contacto_emergencia_1: '', telefono_emergencia_1: '', contacto_emergencia_2: '', telefono_emergencia_2: '', profesion_id: '', estatus_id: 1,
            cargo_cet_id: '', cargo_onapre_id: '', nivel_salarial_id: '', condicion_laboral_id: '', direccion_id: '', division_id: '', unidad_id: ''
        });
        setErrorMessage('');
        setMensajeMostrado(false);
        setPaso(1);
    };

    const handleSiguiente = () => {
        if (!formData.cedula || !formData.nombres || !formData.apellidos) {
            setErrorMessage('Por favor complete Cédula, Nombres, y Apellidos requeridos.');
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 3000);
            return;
        }
        setErrorMessage('');
        setMensajeMostrado(false);
        setPaso(2);
    };

    const handleAtras = () => {
        setErrorMessage('');
        setMensajeMostrado(false);
        setPaso(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones básicas antes de enviar
        if (!formData.direccion_id) {
            setErrorMessage('Por favor complete la Dirección de Adscripción.');
            setMensajeMostrado(true);
            setTimeout(() => setMensajeMostrado(false), 3000);
            return;
        }

        if (onSaveStart) onSaveStart();

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
            limpiarFormulario();
            if (onSaveEnd) onSaveEnd(true, 'Funcionario registrado exitosamente.');

        } catch (error) {
            console.error('Error:', error);
            if (onSaveEnd) onSaveEnd(false, error.message);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {paso === 1 ? 'Registrar Funcionario - Datos Personales' : 'Registrar Funcionario - Datos Laborales'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* MENSAJES DE ALERTA DE VALIDACIÓN */}
                {mensajeMostrado &&
                    <Alert key="danger" type="danger">
                        {errorMessage}
                    </Alert>
                }

                <form onSubmit={handleSubmit}>
                    {paso === 1 && (
                        <>
                            {/* SECCIÓN 1: DATOS PERSONALES */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mt-2 text-primary mb-0">1. Datos Personales</h6>
                                <small className="text-muted">* Campos obligatorios</small>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cédula de Identidad *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="cedula"
                                            placeholder="Ej: V-12345678"
                                            value={formData.cedula}
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
                                            name="rif"
                                            placeholder="Ej: V123456789"
                                            value={formData.rif}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombres *</Form.Label>
                                        <Form.Control type="text" name="nombres" value={formData.nombres} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Apellidos *</Form.Label>
                                        <Form.Control type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Nacimiento</Form.Label>
                                        <Form.Control type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Género</Form.Label>
                                        <Form.Select name="genero" value={formData.genero} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Estado Civil</Form.Label>
                                        <Form.Select name="estado_civil" value={formData.estado_civil} onChange={handleChange}>
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
                                    <Form.Control as="textarea" rows={2} name="lugar_nacimiento" value={formData.lugar_nacimiento} onChange={handleChange} />
                                </Form.Group>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tipo de Sangre</Form.Label>
                                        <Form.Control type="text" name="tipo_sangre" value={formData.tipo_sangre} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Numero de Telefono Residencial</Form.Label>
                                        <Form.Control type="text" name="telefono_fijo" placeholder="0276-0000000" value={formData.telefono_fijo} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Numero de Celular</Form.Label>
                                        <Form.Control type="text" name="celular" placeholder="0426-0000000" value={formData.celular} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Correo Electrónico</Form.Label>
                                        <Form.Control type="email" name="correo_principal" value={formData.correo_principal} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Correo Electrónico Secundario</Form.Label>
                                        <Form.Control type="email" name="correo_secundario" value={formData.correo_secundario} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Número de Cuenta Bancaria</Form.Label>
                                        <Form.Control type="text" name="cuenta_bancaria" maxLength={20} placeholder="Ej: 01020000000000000000" value={formData.cuenta_bancaria} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Actividades Culturales</Form.Label>
                                        <Form.Control type="text" name="actividades_culturales" value={formData.actividades_culturales} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Deportes que practica</Form.Label>
                                        <Form.Control type="text" name="deportes" value={formData.deportes} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="mb-3">
                                <Form.Group>
                                    <Form.Label>Dirección de Habitación</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="direccion_habitacion" value={formData.direccion_habitacion} onChange={handleChange} />
                                </Form.Group>
                            </div>
                        </>
                    )}

                    {paso === 2 && (
                        <>
                            <div className="row mb-3">
                                <h6 className="mt-2 mb-3 text-primary">En caso de emergencia avisar a:</h6>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>1. Nombres Y Apellidos</Form.Label>
                                        <Form.Control type="text" name="contacto_emergencia_1" value={formData.contacto_emergencia_1} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>1. Teléfono de Emergencia</Form.Label>
                                        <Form.Control type="text" name="telefono_emergencia_1" value={formData.telefono_emergencia_1} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>2. Nombres Y Apellidos</Form.Label>
                                        <Form.Control type="text" name="contacto_emergencia_2" value={formData.contacto_emergencia_2} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>2. Teléfono de Emergencia</Form.Label>
                                        <Form.Control type="text" name="telefono_emergencia_2" value={formData.telefono_emergencia_2} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>

                            {/* SECCIÓN 2: DATOS CONTRACTUALES */}
                            <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                                <h6 className="text-primary mb-0">2. Datos Laborales y Contractuales</h6>
                                <small className="text-muted">* Campos obligatorios</small>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Ingreso</Form.Label>
                                        <Form.Control type="date" name="fecha_ingreso" value={formData.fecha_ingreso} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Estatus</Form.Label>
                                        <Form.Select name="estatus_id" value={formData.estatus_id} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            {catalogos.estatus.map(e => (
                                                <option key={e.estatus_id} value={e.estatus_id}>{e.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Profesión</Form.Label>
                                        <Form.Select name="profesion_id" value={formData.profesion_id} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            {catalogos.profesiones.map(p => (
                                                <option key={p.profesion_id} value={p.profesion_id}>{p.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Clasificación ONAPRE</Form.Label>
                                        <Form.Select name="cargo_onapre_id" value={formData.cargo_onapre_id} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            {catalogos.cargosONAPRE.map(o => (
                                                <option key={o.cargo_onapre_id} value={o.cargo_onapre_id}>{o.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cargo CET (Interno)</Form.Label>
                                        <Form.Select
                                            name="cargo_cet_id"
                                            value={formData.cargo_cet_id}
                                            onChange={handleChange}
                                            disabled={!formData.cargo_onapre_id || cargosCETFiltrados.length === 0}
                                        >
                                            <option value="">Seleccione</option>
                                            {cargosCETFiltrados.map(c => (
                                                <option key={c.cargo_cet_id} value={c.cargo_cet_id}>{c.nombre}</option>
                                            ))}
                                        </Form.Select>
                                        {formData.cargo_onapre_id && cargosCETFiltrados.length === 0 && (
                                            <Form.Text className="text-muted">No hay cargos CET para esta clasificación.</Form.Text>
                                        )}
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Condición Laboral</Form.Label>
                                        <Form.Select name="condicion_laboral_id" value={formData.condicion_laboral_id} onChange={handleChange}>
                                            <option value="">Seleccione</option>
                                            {catalogos.condiciones.map(c => (
                                                <option key={c.condicion_laboral_id} value={c.condicion_laboral_id}>{c.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nivel Salarial</Form.Label>
                                        <Form.Select name="nivel_salarial_id" value={formData.nivel_salarial_id} onChange={handleChange} disabled={!formData.cargo_onapre_id}>
                                            <option value="">Seleccione</option>
                                            {catalogos.niveles.map(n => (
                                                <option key={n.nivel_salarial_id} value={n.nivel_salarial_id}>{n.nombre} — {n.salario_base} Bs.</option>
                                            ))}
                                        </Form.Select>
                                        {catalogos.niveles.length === 0 && formData.cargo_onapre_id && (
                                            <Form.Text className="text-muted">No hay niveles para este cargo.</Form.Text>
                                        )}
                                    </Form.Group>
                                </div>
                            </div>

                            {/* SECCIÓN: UBICACIÓN ORGANIZACIONAL */}
                            <h6 className="mt-4 mb-3 text-primary">Ubicación Organizacional</h6>
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <Form.Group>
                                        <Form.Label>Dirección *</Form.Label>
                                        <Form.Select name="direccion_id" value={formData.direccion_id} onChange={handleChange} required>
                                            <option value="">Seleccione la Dirección</option>
                                            {catalogos.direcciones.map(d => (
                                                <option key={d.direccion_id} value={d.direccion_id}>{d.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-4">
                                    <Form.Group>
                                        <Form.Label>División (Opcional)</Form.Label>
                                        <Form.Select
                                            name="division_id"
                                            value={formData.division_id}
                                            onChange={handleChange}
                                            disabled={!formData.direccion_id || !tieneDivisiones}
                                        >
                                            <option value="">-- Directo a la Dirección --</option>
                                            {divisionesFiltradas.map(d => (
                                                <option key={d.division_id} value={d.division_id}>{d.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-4">
                                    <Form.Group>
                                        <Form.Label>Unidad (Opcional)</Form.Label>
                                        <Form.Select
                                            name="unidad_id"
                                            value={formData.unidad_id}
                                            onChange={handleChange}
                                            disabled={!formData.direccion_id || !tieneUnidades}
                                        >
                                            <option value="">{formData.division_id ? '-- Directo a la División --' : '-- Directo a la Dirección --'}</option>
                                            {unidadesFiltradas.map(u => (
                                                <option key={u.unidad_id} value={u.unidad_id}>{u.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-12 mt-2">
                                    <Form.Text className="text-muted">
                                        <i className="bx bx-info-circle me-1"></i>
                                        Seleccione el nivel más profundo al que pertenece el funcionario. Si no pertenece a ninguna Unidad o División específica, deje la opción en "-- Directo a la... --".
                                    </Form.Text>
                                </div>
                            </div>
                        </>
                    )}
                </form>
            </Modal.Body>
            <Modal.Footer>
                {paso === 1 && (
                    <Button type='primary' onClick={handleSiguiente}>Siguiente</Button>
                )}
                {paso === 2 && (
                    <>
                        <Button type='secondary' className="me-2" onClick={handleAtras}>Atrás</Button>
                        <Button type='secondary' className="me-2" onClick={limpiarFormulario}>Limpiar</Button>
                        <Button type='primary' onClick={handleSubmit}>Registrar Funcionario</Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};