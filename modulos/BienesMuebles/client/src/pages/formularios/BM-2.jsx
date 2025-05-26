import React from 'react';
import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../components/atoms/Buttons';
import Alert from "../../components/atoms/Alert";
import { fetchData } from '../../data/fetchData';
import Select from 'react-select';
import axios from 'axios';
import ModalActaInc from '../Modales/modalActaInc';
import ModalRepBm2 from '../Modales/modalRepBm2';

export const Bm2 = () => {

    //Modal Actas de incorporación
    const [showActInc, setShowActInc] = useState(false);

    //Modal Reporte Mensual de BM-2
    const [showRepBm2, setShowRepBm2] = useState(false);

    const [relacion, setRelacion] = useState(true);

    const [formEnviado, setFormEnviado] = useState(false)
    const [mensajeMostrado, setMensajeMostrado] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(false); 

    const [formData, setFormData] = useState({
        bim_ide: '',
        bim_des: '',
        bim_fec: '',
        bim_ndo: '',
        bim_val: '',
        bim_moneda: '',
        bim_color: '',
        bim_cod: '',
        bim_obs: null,
        bim_sede: 'PRINCIPAL',
        est_ide: 4,
        tip_ide: '',
        foa_ide: '',
        con_ide: '',
        esu_ide: '',
        mar_ide: '',
        mod_ide: '',
        cat_ide: '',
        sca_ide: '',
        cae_ide: '',
        com_ide: '',
        dep_ide: ''
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
    const [bim_moneda, setbim_moneda] = useState([]);
    const [estadoUso, setEstadoUso] = useState([]);
    const [condicionFisica, setCondicionFisica] = useState([]);
    const [mar_ide, setmar_ide] = useState([]);
    const [mod_ide, setmod_ide] = useState([]);
    const [tipoBien, setTipoBien] = useState([]);
    const [catGen, setCatgen] = useState([]);
    const [subCat, setsubCat] = useState([]);
    const [catEsp, setCatEsp] = useState([]);
    const [conceptoMov, setConceptoMov] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            const unidadAdminData = await fetchData('tesdep', '*');
            const formaAdquisicionData = await fetchData('tmafoa', '*');
            const bim_monedaData = [
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
            const mar_ideData = await fetchData('tmamar', '*');
            const tipoBienData = await fetchData('tmatip', '*');
            const catGenData = await fetchData('tmacat', '*');
            const conceptoMovData = await fetchData('tmacom', '*');

            setUnidadAdmin(unidadAdminData || []);
            setFormaAdquisicion(formaAdquisicionData || []);
            setbim_moneda(bim_monedaData || []);
            setEstadoUso(estadoUsoData || []);
            setCondicionFisica(condicionFisicaData || []);
            setmar_ide(mar_ideData || []);
            setTipoBien(tipoBienData || []);
            setCatgen(catGenData || []);
            setConceptoMov(conceptoMovData || []);
        };

        fetchAllData();
    }, []);

    // Efecto para cargar mod_ides cuando se selecciona una mar_ide
    useEffect(() => {
        const fetchmod_ides = async () => {
            if (!formData.mar_ide) {
                setmod_ide([]);
                return;
            }

            const mod_idesData = await fetchData('tesmod', '*', 'mar_ide', formData.mar_ide);
            setmod_ide(mod_idesData || []);
        };

        fetchmod_ides();
    }, [formData.mar_ide]);

    // Efecto para cargar subcategorías cuando se selecciona una categoría general
    useEffect(() => {
        const fetchsca_ides = async () => {
            if (!formData.cat_ide) {
                setsubCat([]);
                return;
            }

            const subCatData = await fetchData('tessca', '*', 'cat_ide', formData.cat_ide);
            setsubCat(subCatData || []);
        };

        fetchsca_ides();
    }, [formData.cat_ide]);

    // Efecto para cargar categorías específicas cuando se selecciona una subcategoría
    useEffect(() => {
        const fetchCatEspecificas = async () => {
            if (!formData.sca_ide) {
                setCatEsp([]);
                return;
            }

            const catEspData = await fetchData('tescae', '*', 'sca_ide', formData.sca_ide);
            setCatEsp(catEspData || []);
        };

        fetchCatEspecificas();
    }, [formData.sca_ide]);

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
    
    const datosEnviar = {
        bim_ide: formData.bim_ide,
        bim_des: formData.bim_des,
        bim_fec: formData.bim_fec,
        bim_ndo: formData.bim_ndo,
        bim_val: formData.bim_val,
        bim_moneda: formData.bim_moneda,
        bim_color: formData.bim_color,
        bim_cod: formData.bim_cod,
        bim_obs: null,
        bim_sede: 'PRINCIPAL',
        est_ide: 4,
        tip_ide: formData.tip_ide,
        foa_ide: formData.foa_ide,
        con_ide: formData.con_ide,
        esu_ide: formData.esu_ide,
        mod_ide: formData.mod_ide,
        cae_ide: formData.cae_ide,
        com_ide: formData.com_ide,
        dep_ide: formData.dep_ide
    }
    
    console.log('Datos a enviar:', datosEnviar);
    // Validación básica
    if (!formData.bim_ide || !formData.dep_ide) {
        setErrorMessage('Los campos obligatorios deben ser completados');
        setMensajeMostrado(true);
        setTimeout(() => setMensajeMostrado(false), 3000);
        return;
    }

    try {

        const CodBim = await fetchData('tmab_m', '*', 'bim_ide', formData.bim_ide);
        if (CodBim.length > 0) {
            throw new Error('Este código ya está asignado a un bien');
        }

        const response = await axios.post('/api/insert', {
            table: 'tmab_m', 
            data: datosEnviar
        });

        console.log('CORRECTO', response.status)

        if (response.status === 201) {
            setFormEnviado(true);
            setMensajeMostrado(true);

            setShowActInc(true);

            setFormEnviado(true);
            setTimeout(() => setMensajeMostrado(false), 3000);
        }
    } catch (error) {
        console.error('Error al insertar:', error);
        setFormEnviado(false);
        setMensajeMostrado(true);
        setErrorMessage(error.response?.data?.error || error.message || 'Error desconocido');
        setTimeout(() => setMensajeMostrado(false), 3000);
        setFormData({
            bim_ide: ''
        })
    }
};

//limpiar formulario
  const limpiarFormulario = () => {
    setFormData({
        bim_ide: '',
        bim_des: '',
        bim_fec: '',
        bim_ndo: '',
        bim_val: '',
        bim_moneda: '',
        bim_color: '',
        bim_cod: '',
        bim_obs: null,
        bim_sede: 'PRINCIPAL',
        est_ide: 4,
        tip_ide: '',
        foa_ide: '',
        con_ide: '',
        esu_ide: '',
        mar_ide: '',
        mod_ide: '',
        cat_ide: '',
        sca_ide: '',
        cae_ide: '',
        com_ide: '',
        dep_ide: ''
    });
  };

    return (
        <>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4 className="py-3 mb-4"><span className="text-muted fw-light">Bienes Muebles/</span> BM-2</h4>
                <button id="exportToExcel" className="btn btn-primary" onClick={() =>setShowActInc(true)}>
                    <i className="bx bx-export me-1"></i> Generar acta de Incorporación de Bien
                </button>
                <button id="exportToExcel" className="btn btn-primary" onClick={() =>setShowRepBm2(true)}>
                    <i className="bx bx-export me-1"></i> Generar Relacion de Movimiento de BM2
                </button>
                <ModalRepBm2
                    show= {showRepBm2}
                    handleClose={() => setShowRepBm2(false)}
                />
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
                                <form  onSubmit={handleSubmit}>
                                    <div className="row mb-3">
                                        <label className="col-sm-2 col-form-label" htmlFor="basic-default-name">Número de Identificación</label>
                                        <div className="col-sm-10">
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="basic-default-name" 
                                                placeholder="xxxx" 
                                                name="bim_ide"
                                                value={formData.bim_ide}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <Form.Group className="mb-3">
                                        <Form.Label>UNIDAD ADMINISTRATIVA</Form.Label>
                                        <Form.Select 
                                            name='dep_ide'
                                            value={formData.dep_ide}
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
                                            <textarea
                                                type="text"
                                                className="form-control"
                                                id="basic-default-company"
                                                placeholder="xxxx"
                                                name="bim_des"
                                                value={formData.bim_des}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Forma de Adquisición</Form.Label>
                                        <Form.Select 
                                            name='foa_ide'
                                            value={formData.foa_ide}
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
                                                    name="bim_fec"
                                                    value={formData.bim_fec}
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
                                                    name="bim_ndo"
                                                    value={formData.bim_ndo}
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
                                                name="bim_val"
                                                value={formData.bim_val}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Moneda</Form.Label>
                                        <Form.Select 
                                            name='bim_moneda'
                                            value={formData.bim_moneda}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {bim_moneda.map((item) => (
                                                <option key={item.mon_ide} value={item.mon_mon}>
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
                                                name="bim_color"
                                                value={formData.bim_color}
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
                                                name="bim_cod"
                                                value={formData.bim_cod}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Estado de uso</Form.Label>
                                        <Form.Select 
                                            name='esu_ide'
                                            value={formData.esu_ide}
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
                                            name='con_ide'
                                            value={formData.con_ide}
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
                                            name='mar_ide'
                                            value={formData.mar_ide}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {mar_ide.map((item) => (
                                                <option key={item.mar_ide} value={item.mar_ide}>
                                                    {item.mar_mar}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Modelo</Form.Label>
                                        <Form.Select 
                                            name='mod_ide'
                                            value={formData.mod_ide}
                                            onChange={handleChange}
                                            disabled={!formData.mar_ide}
                                        >
                                            <option value="">Seleccione una opción</option>
                                            {mod_ide.map((item) => (
                                                <option key={item.mod_ide} value={item.mod_ide}>
                                                    {item.mod_mod}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tipo de Bien</Form.Label>
                                        <Form.Select 
                                            name='tip_ide'
                                            value={formData.tip_ide}
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
                                            name='cat_ide'
                                            value={formData.cat_ide}
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
                                            name='sca_ide'
                                            value={formData.sca_ide}
                                            onChange={handleChange}
                                            disabled={!formData.cat_ide}
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
                                                        name: 'cae_ide',
                                                        value: selectedOption ? selectedOption.value : ''
                                                    }
                                                });
                                            }}
                                            value={filteredCatEsp.find(option => 
                                                option.value === formData.cae_ide)}
                                            isDisabled={!formData.sca_ide}
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
                                            name='com_ide'
                                            value={formData.com_ide}
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
                                                    <ModalActaInc show={showActInc}
                                                        handleClose={() => setShowActInc(false)}
                                                        BienId= {formData.bim_ide} 
                                                        DataBien= {formData}
                                                        limpiarFormulario = {() => limpiarFormulario()}
                                                      />
                            </div>
                        ) : (
                            <div className="card-body">
                                <form>
                                    {/* Aquí iría el formulario para Desincorporación */}
                                    <div className="row justify-content-end">
                                        
                                        <Button type='primary'> <i className="bx bx-export me-1"></i>Generar acta de Desincorporación de Bien</Button>
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