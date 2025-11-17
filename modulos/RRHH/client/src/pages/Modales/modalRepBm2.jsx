import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Alert from '../../components/atoms/Alert';

const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function ModalRepBm2({ show, handleClose }) {
    const [nombreJefe, setNombreJefe] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [mesSeleccionado, setMesSeleccionado] = useState(''); // Valor inicial vacío para el select
    const [datos, setDatos] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const truncateText = (text, maxLength = 10) => {
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;

        return (
            <span title={text}>
                {`${text.substring(0, maxLength)}...`}
            </span>
        );
    };

    const añoActual = new Date().getFullYear(); // El año siempre será el actual

    // useEffect para cargar los datos del mes actual al abrir el modal, si es la primera vez
    // y si no se ha seleccionado un mes previamente.
    useEffect(() => {
        if (show && mesSeleccionado === '') {
            const currentMonthIndex = new Date().getMonth();
            setMesSeleccionado(currentMonthIndex.toString()); // Convertir a string para el valor del select
            obtenerDatos(currentMonthIndex);
        }
    }, [show]); // Dependencia del `show` del modal

    const obtenerDatos = async (mesIndex) => {
        setLoading(true);
        setError(''); // Limpiamos errores previos

        // Calculamos el primer día y el último día del mes y año seleccionados
        const primerDiaMes = new Date(añoActual, mesIndex, 1);
        const ultimoDiaMes = new Date(añoActual, mesIndex + 1, 0); // El día 0 del siguiente mes es el último día del mes actual

        // Formateamos las fechas a 'YYYY-MM-DD' para enviarlas a la API
        const formatDate = (date) => date.toISOString().split('T')[0];
        const fechaIncorporacionDesde = formatDate(primerDiaMes);
        const fechaIncorporacionHasta = formatDate(ultimoDiaMes);
        const fechaDesincorporacionDesde = formatDate(primerDiaMes);
        const fechaDesincorporacionHasta = formatDate(ultimoDiaMes);

        try {
            const resultados = [];

            // Consulta de incorporados, aplicando los filtros de fecha directamente en la API
            const resIncorporados = await fetch(`/api/bienes/all?inc=1&fechaIncDesde=${fechaIncorporacionDesde}&fechaIncHasta=${fechaIncorporacionHasta}`);
            if (!resIncorporados.ok) throw new Error('Error al obtener bienes incorporados');
            const incorporados  = await resIncorporados.json();
            resultados.push(...incorporados?.map(item => ({
                ...item,
                bim_val: parseFloat(item.bim_val)
            })) || []);

            // Consulta de desincorporados, aplicando los filtros de fecha directamente en la API
            const resDesincorporados = await fetch(`/api/bienes/all?inc=0&fechaDesDesde=${fechaDesincorporacionDesde}&fechaDesHasta=${fechaDesincorporacionHasta}`);
            if (!resDesincorporados.ok) throw new Error('Error al obtener bienes desincorporados');
            const desincorporados = await resDesincorporados.json();
            resultados.push(...desincorporados?.map(item => ({
                ...item,
                bim_val: parseFloat(item.bim_val)
            })) || []);

            // Enriquecer con jerarquía grupo/subgrupo (asumiendo que tus APIs de categorías devuelven los nombres)
            const datosConJerarquia = await Promise.all(resultados.map(async (item) => {
                let grupo = '', subgrupo = '';

                try {
                    // 1. Buscar sca_ide desde tescae usando cae_ide
                    const resCatEspecifica = await fetch(`/api/categorias-especificas/${item.cae_ide}`);
                    const catEspecifica = await resCatEspecifica.json();
                    const sca_ide = catEspecifica.sca_ide;

                    // 2. Buscar cat_ide desde tessca usando sca_ide
                    const resSubgrupo = await fetch(`/api/subcategorias/${sca_ide}`);
                    const subgrupoData = await resSubgrupo.json();
                    
                    // Asumimos que subgrupoData y catEspecifica tienen los nombres
                    subgrupo = subgrupoData.sca_ide || 'N/A';
                    grupo = subgrupoData.cat_ide || 'N/A'; 

                } catch (err) {
                    console.error('Error al obtener jerarquía de categorías:', err);
                    grupo = 'Desconocido';
                    subgrupo = 'Desconocido';
                }

                return {
                    ...item,
                    grupo,
                    subgrupo,
                    bim_val: item.bim_val
                };
            }));

            setDatos(datosConJerarquia);
        } catch (err) {
            console.error(err);
            setError('Error al obtener datos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const mesIndex = parseInt(e.target.value);
        setMesSeleccionado(e.target.value); // Almacenar el valor del select (string)
        if (e.target.value !== '') { // Solo si se selecciona un mes válido
            obtenerDatos(mesIndex);
        } else {
            setDatos([]); // Limpiar datos si no hay mes seleccionado
        }
    };

    const enviarPDF = async () => {
        setEnviando(true);
        try {
            const response = await fetch('/api/pdf/reporte-bm2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    datos,
                    nombreJefe,
                    mesSeleccionado: meses[parseInt(mesSeleccionado)], // Enviar el nombre del mes
                    añoActual: añoActual
                }),
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_BM2_${meses[parseInt(mesSeleccionado)]}_${añoActual}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url); // Limpiar el objeto URL para liberar memoria

            setMensaje('PDF generado exitosamente.');
        } catch (error) {
            console.error('Error al generar PDF:', error);
            setMensaje('Error al generar el PDF');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Reporte BM-2</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Selecciona un mes</Form.Label>
                    <Form.Select value={mesSeleccionado} onChange={handleChange}>
                        <option value="">Seleccione un mes</option>
                        {meses.map((mes, index) => (
                            <option key={index} value={index}>{mes}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {error && <Alert type="danger">{error}</Alert>}
                {loading && <p>Cargando datos...</p>}

                {!loading && datos.length > 0 && mesSeleccionado !== '' && ( // Mostrar tabla solo si hay datos y un mes seleccionado
                    <>
                        <p><strong>PERIODO DE LA CUENTA:</strong> {meses[parseInt(mesSeleccionado)]?.toUpperCase()} {añoActual}</p>
                        <Table bordered hover size="sm" responsive>
                            <thead>
                                <tr>
                                    <th>GRUPO</th>
                                    <th>SUBGRUPO</th>
                                    <th>CONCEPTO DE MOVIMIENTO</th>
                                    <th>CANTIDAD</th>
                                    <th>IDENTIFICACIÓN</th>
                                    <th>NOMBRE Y DESCRIPCIÓN</th>
                                    <th>INCORPORACIÓN (Bs.)</th>
                                    <th>DESINCORPORACIÓN (Bs.)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datos.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.grupo}</td>
                                        <td>{item.subgrupo}</td>
                                        <td>{item.com_ide}</td>
                                        <td>01</td>
                                        <td>{item.bim_ide}</td>
                                        <td>{truncateText(item.bim_des)}</td>
                                        <td>{item.bim_inc === 1 ? item.bim_val?.toFixed(2) : ''}</td>
                                        <td>{item.bim_inc === 0 ? item.bim_val?.toFixed(2) : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        {(() => {
                            const totalIncorporaciones = datos
                                .filter(item => item.bim_inc === 1)
                                .reduce((sum, item) => sum + (parseFloat(item.bim_val) || 0), 0);

                            const totalDesincorporaciones = datos
                                .filter(item => item.bim_inc === 0)
                                .reduce((sum, item) => sum + (parseFloat(item.bim_val) || 0), 0);

                            return (
                                <>
                                    <p><strong>TOTAL INCORPORACIONES:</strong> {totalIncorporaciones.toFixed(2)} Bs.</p>
                                    <p><strong>TOTAL DESINCORPORACIONES:</strong> {totalDesincorporaciones.toFixed(2)} Bs.</p>
                                </>
                            );
                        })()}
                    </>
                )}
                {!loading && datos.length === 0 && mesSeleccionado !== '' && (
                    <Alert type="info">No se encontraron bienes para el mes seleccionado.</Alert>
                )}


                <Form.Group className="mt-3">
                    <Form.Label>Nombre del Jefe de la Unidad de Trabajo</Form.Label>
                    <Form.Control
                        type="text"
                        value={nombreJefe}
                        onChange={e => setNombreJefe(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
                <Button variant="primary" onClick={enviarPDF} disabled={enviando || datos.length === 0 || mesSeleccionado === ''}>
                    {enviando ? 'Generando...' : 'Generar PDF'}
                </Button>
            </Modal.Footer>
            {mensaje && <p className="text-center mt-2">{mensaje}</p>}
        </Modal>
    );
}

export default ModalRepBm2;