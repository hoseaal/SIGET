import React from 'react';
import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../components/atoms/Buttons';
import Alert from "../../components/atoms/Alert";
import { fetchData } from '../../data/fetchData';
import Select from 'react-select';
import axios from 'axios';

export const Bm2 = () => {
    const [relacion, setRelacion] = useState(true);

    const [formEnviado, setFormEnviado] = useState(false)
    const [mensajeMostrado, setMensajeMostrado] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(false); 

    const [formData, setFormData] = useState({
        numero_identificacion: '',
        unidad_administrativa: '',
        descripcion_bien: '',
        forma_adquisicion: '',
        fecha_adquisicion: '',
        numero_documento: '',
        valor_monetario: '',
        moneda: '',
        color_bien: '',
        codigo_sudebin: '',
        estado_uso: '',
        condicion_fisica: '',
        marca: '',
        modelo: '',
        tipo_bien: '',
        categoria_general: '',
        subcategoria: '',
        categoria_especifica: '',
        concepto_incorporacion: ''
    });

    const handleRelacionChange = (e) => {
        setRelacion(e.target.value === "true");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    //tablas Foraneas
    const [unidadAdmin, setUnidadAdmin] = useState([]);
    const [formaAdquisicion, setFormaAdquisicion] = useState([]);
    const [moneda, setMoneda] = useState([]);
    const [estadoUso, setEstadoUso] = useState([]);
    const [condicionFisica, setCondicionFisica] = useState([]);
    const [marca, setMarca] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [tipoBien, setTipoBien] = useState([]);
    const [catGen, setCatgen] = useState([]);
    const [subCat, setsubCat] = useState([]);
    const [catEsp, setCatEsp] = useState([]);
    const [conceptoMov, setConceptoMov] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            const unidadAdminData = await fetchData('tesdep', '*');
            const formaAdquisicionData = await fetchData('tmafoa', '*');
            const monedaData = [
                {
                    "mon_ide": 1,
                    "mon_mon": "Bolivares"
                },
                {
                    "mon_ide": 2,
                    "mon_mon": "Dolares"
                }
            ];
            const estadoUsoData = await fetchData('tmaesu', '*');
            const condicionFisicaData = await fetchData('tmacon', '*');
            const marcaData = await fetchData('tmamar', '*');
            const tipoBienData = await fetchData('tmatip', '*');
            const catGenData = await fetchData('tmacat', '*');
            const conceptoMovData = await fetchData('tmacom', '*');

            setUnidadAdmin(unidadAdminData || []);
            setFormaAdquisicion(formaAdquisicionData || []);
            setMoneda(monedaData || []);
            setEstadoUso(estadoUsoData || []);
            setCondicionFisica(condicionFisicaData || []);
            setMarca(marcaData || []);
            setTipoBien(tipoBienData || []);
            setCatgen(catGenData || []);
            setConceptoMov(conceptoMovData || []);
        };

        fetchAllData();
    }, []);

    // Efecto para cargar modelos cuando se selecciona una marca
    useEffect(() => {
        const fetchModelos = async () => {
            if (!formData.marca) {
                setModelo([]);
                return;
            }

            const modelosData = await fetchData('tesmod', '*', 'mar_ide', formData.marca);
            setModelo(modelosData || []);
        };

        fetchModelos();
    }, [formData.marca]);

    // Efecto para cargar subcategorías cuando se selecciona una categoría general
    useEffect(() => {
        const fetchSubCategorias = async () => {
            if (!formData.categoria_general) {
                setsubCat([]);
                return;
            }

            const subCatData = await fetchData('tessca', '*', 'cat_ide', formData.categoria_general);
            setsubCat(subCatData || []);
        };

        fetchSubCategorias();
    }, [formData.categoria_general]);

    // Efecto para cargar categorías específicas cuando se selecciona una subcategoría
    useEffect(() => {
        const fetchCatEspecificas = async () => {
            if (!formData.subcategoria) {
                setCatEsp([]);
                return;
            }

            const catEspData = await fetchData('tescae', '*', 'sca_ide', formData.subcategoria);
            setCatEsp(catEspData || []);
        };

        fetchCatEspecificas();
    }, [formData.subcategoria]);

     // Agregamos estado para el filtro de búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCatEsp, setFilteredCatEsp] = useState([]);

    // Efecto para filtrar categorías específicas
    useEffect(() => {
    if (catEsp && catEsp.length > 0) {
        const filtered = catEsp
            .filter(item => 
                item.cae_cae.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(item => ({
                value: item.cae_ide,
                label: item.cae_cae
            }));
        setFilteredCatEsp(filtered);
    }
}, [searchTerm, catEsp]);

const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('/api/insert', {
                table: 'tmab_m', 
                data: formData
            });


            if (response.status === 201) {
                setFormEnviado(true)
                    setMensajeMostrado(true)
                    setTimeout(() => {
                        setMensajeMostrado(false);
                    }, 1000);
                }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error === 'DUPLICATE_KEY') {
                setErrorMessage('Error: Este codigo ya existe.'); 
            }
                setFormEnviado(false); // Indicar que hubo un error
                setMensajeMostrado(true);
                console.error('Error al insertar:', error);
                setErrorMessage(error.response?.data?.error || error.message)

                setTimeout(() => {
                    setMensajeMostrado(false);
                  }, 3000);
        }
    };


    return (
        <>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Bienes Muebles/</span> BM-2</h4>
            <div className='row'>
                <div className="col-xxl">
                    <div className="card mb-4">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="mb-0">Reportes</h5>
                        </div>
                        <div className="card-body">
                            <div className="demo-inline-spacing mx-auto">
                                <Button type='primary'>Generar Reporte de BM-2</Button>
                                <Button type='primary'>Generar Acta de Incorporación de Bien</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="row">
                <div className="col-xxl">
                    <div className="card mb-4">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="mb-0">Relación de Movimiento de Bienes Muebles</h5>
                            <Form.Group className="mb-3">
                                <Form.Select onChange={handleRelacionChange} value={relacion.toString()}>
                                    <option value="true">Incorporación</option>
                                    <option value="false">Desincorporación</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                        {relacion ? (
                            <div className="card-body">
                                <form>
                                    <div className="row mb-3">
                                        <label className="col-sm-2 col-form-label" htmlFor="basic-default-name">Número de Identificación</label>
                                        <div className="col-sm-10">
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="basic-default-name" 
                                                placeholder="xxxx" 
                                                name="numero_identificacion"
                                                value={formData.numero_identificacion}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <Form.Group className="mb-3">
                                        <Form.Label>UNIDAD ADMINISTRATIVA</Form.Label>
                                        <Form.Select 
                                            name='unidad_administrativa'
                                            value={formData.unidad_administrativa}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {unidadAdmin.map((item) => (
                                                <option key={item.dep_ide} value={item.dep_ide}>
                                                    {item.dep_nom}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <div className="row mb-3">
                                        <label className="col-sm-2 col-form-label" htmlFor="basic-default-company">Descripción del Bien</label>
                                        <div className="col-sm-10">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="basic-default-company"
                                                placeholder="xxxx"
                                                name="descripcion_bien"
                                                value={formData.descripcion_bien}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Forma de Adquisición</Form.Label>
                                        <Form.Select 
                                            name='forma_adquisicion'
                                            value={formData.forma_adquisicion}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {formaAdquisicion.map((item) => (
                                                <option key={item.foa_ide} value={item.foa_ide}>
                                                    {item.foa_nom}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <div className="row mb-3">
                                        <label className="col-sm-2 col-form-label" htmlFor="basic-default-email">Fecha de Adquisición</label>
                                        <div className="col-sm-10">
                                            <div className="input-group input-group-merge">
                                                <input
                                                    type="date"
                                                    id="basic-default-email"
                                                    className="form-control"
                                                    placeholder="xxxx"
                                                    name="fecha_adquisicion"
                                                    value={formData.fecha_adquisicion}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label className="col-sm-2 col-form-label" htmlFor="basic-default-email">Número de Documento</label>
                                        <div className="col-sm-10">
                                            <div className="input-group input-group-merge">
                                                <input
                                                    type="text"
                                                    id="basic-default-email"
                                                    className="form-control"
                                                    placeholder="xxxx"
                                                    name="numero_documento"
                                                    value={formData.numero_documento}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label className="col-sm-2 col-form-label" htmlFor="basic-default-phone">Valor Monetario</label>
                                        <div className="col-sm-10">
                                            <input
                                                type="text"
                                                id="basic-default-phone"
                                                className="form-control phone-mask"
                                                placeholder="0.00"
                                                name="valor_monetario"
                                                value={formData.valor_monetario}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Moneda</Form.Label>
                                        <Form.Select 
                                            name='moneda'
                                            value={formData.moneda}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {moneda.map((item) => (
                                                <option key={item.mon_ide} value={item.mon_ide}>
                                                    {item.mon_mon}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <div className="row mb-3">
                                        <label className="col-sm-2 col-form-label" htmlFor="basic-default-phone">Color del Bien</label>
                                        <div className="col-sm-10">
                                            <input
                                                type="text"
                                                id="basic-default-phone"
                                                className="form-control phone-mask"
                                                placeholder="Ej: Rojo"
                                                name="color_bien"
                                                value={formData.color_bien}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label className="col-sm-2 col-form-label" htmlFor="basic-default-phone">Código SUDEBIN</label>
                                        <div className="col-sm-10">
                                            <input
                                                type="text"
                                                id="basic-default-phone"
                                                className="form-control phone-mask"
                                                placeholder="Ej: 12345"
                                                name="codigo_sudebin"
                                                value={formData.codigo_sudebin}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Estado de uso</Form.Label>
                                        <Form.Select 
                                            name='estado_uso'
                                            value={formData.estado_uso}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {estadoUso.map((item) => (
                                                <option key={item.esu_ide} value={item.esu_ide}>
                                                    {item.esu_esu}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Condición física</Form.Label>
                                        <Form.Select 
                                            name='condicion_fisica'
                                            value={formData.condicion_fisica}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {condicionFisica.map((item) => (
                                                <option key={item.con_ide} value={item.con_ide}>
                                                    {item.con_con}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Marca</Form.Label>
                                        <Form.Select 
                                            name='marca'
                                            value={formData.marca}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {marca.map((item) => (
                                                <option key={item.mar_ide} value={item.mar_ide}>
                                                    {item.mar_mar}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Modelo</Form.Label>
                                        <Form.Select 
                                            name='modelo'
                                            value={formData.modelo}
                                            onChange={handleChange}
                                            disabled={!formData.marca}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {modelo.map((item) => (
                                                <option key={item.mod_ide} value={item.mod_ide}>
                                                    {item.mod_mod}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tipo de Bien</Form.Label>
                                        <Form.Select 
                                            name='tipo_bien'
                                            value={formData.tipo_bien}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {tipoBien.map((item) => (
                                                <option key={item.tip_ide} value={item.tip_ide}>
                                                    {item.tip_tip}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Categoría General</Form.Label>
                                        <Form.Select 
                                            name='categoria_general'
                                            value={formData.categoria_general}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {catGen.map((item) => (
                                                <option key={item.cat_ide} value={item.cat_ide}>
                                                    {item.cat_cat}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sub-Categoría</Form.Label>
                                        <Form.Select 
                                            name='subcategoria'
                                            value={formData.subcategoria}
                                            onChange={handleChange}
                                            disabled={!formData.categoria_general}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {subCat.map((item) => (
                                                <option key={item.sca_ide} value={item.sca_ide}>
                                                    {item.sca_sca}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Categoría Específica</Form.Label>
                                        <Select
                                            options={filteredCatEsp}
                                            onInputChange={inputValue => setSearchTerm(inputValue)}
                                            onChange={selectedOption => {
                                                handleChange({
                                                    target: {
                                                        name: 'categoria_especifica',
                                                        value: selectedOption ? selectedOption.value : ''
                                                    }
                                                });
                                            }}
                                            value={filteredCatEsp.find(option => 
                                                option.value === formData.categoria_especifica)}
                                            isDisabled={!formData.subcategoria}
                                            placeholder="Buscar categoría..."
                                            noOptionsMessage={() => "No se encontraron opciones"}
                                            loadingMessage={() => "Buscando..."}
                                            isClearable
                                            isSearchable
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Concepto de Movimiento</Form.Label>
                                        <Form.Select 
                                            name='concepto_incorporacion'
                                            value={formData.concepto_incorporacion}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {conceptoMov.map((item) => (
                                                <option key={item.com_ide} value={item.com_ide}>
                                                    {item.com_com}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <div className="row justify-content-end">
                                        <Button type='primary' size='lg' onClick={handleSubmit}>Guardar</Button>
                                    </div>
                                    {mensajeMostrado && 
                                        <Alert key={formEnviado ? 'success' : 'danger'} type={formEnviado ? 'success' : 'danger'}>
                                        {formEnviado ? 'Insertado con exito' : `${errorMessage}`}
                                    </Alert>
                                    }
                                </form>
                            </div>
                        ) : (
                            <div className="card-body">
                                <form>
                                    {/* Aquí iría el formulario para Desincorporación */}
                                    <div className="row justify-content-end">
                                        <Button type='primary'>Generar acta de Desincorporación de Bien</Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}