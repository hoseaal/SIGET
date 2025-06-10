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
    const [mesSeleccionado, setMesSeleccionado] = useState('');
    const [datos, setDatos] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const añoActual = new Date().getFullYear();

    const obtenerDatos = async (mesIndex) => {
        setLoading(true);
        try {
            const resultados = [];

            // Consulta de incorporados
            const resIncorporados = await fetch('/api/bienes?inc=1');
            const { data: incorporados } = await resIncorporados.json(); // <-- Aquí el cambio
            resultados.push(...incorporados?.filter(item => {
                const fecha = new Date(item.bim_fec);
                return fecha.getMonth() === mesIndex && fecha.getFullYear() === añoActual;
            }).map(item => ({
                ...item,
                bim_val: parseFloat(item.bim_val)
            })));

            // Consulta de desincorporados
            const resDesincorporados = await fetch('/api/bienes?inc=0');
            const { data: desincorporados } = await resDesincorporados.json(); // <-- Aquí el cambio
            resultados.push(...desincorporados.filter(item => {
                const fecha = new Date(item.bim_fed);
                return fecha.getMonth() === mesIndex && fecha.getFullYear() === añoActual;
            }).map(item => ({
                ...item,
                bim_val: parseFloat(item.bim_val)
            })));

            // Enriquecer con jerarquía grupo/subgrupo
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
                    const cat_ide = subgrupoData.cat_ide;

                    subgrupo = sca_ide;
                    grupo = cat_ide;
                } catch (err) {
                    console.error('Error jerarquía:', err);
                }

                return {
                    ...item,
                    grupo,
                    subgrupo,
                    bim_val: item.bim_val
                };
            }));

            setDatos(datosConJerarquia);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Error al obtener datos');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const mesIndex = parseInt(e.target.value);
        setMesSeleccionado(mesIndex);
        obtenerDatos(mesIndex);
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
                }),
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_BM2.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpiar el objeto URL para liberar memoria
            window.URL.revokeObjectURL(url);
            
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

                {!loading && datos.length > 0 && (
                    <>
                        <p><strong>PERIODO DE LA CUENTA:</strong> {meses[mesSeleccionado]?.toUpperCase()} {añoActual}</p>
                        <Table bordered hover size="sm">
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
                                        <td>{item.bim_des}</td>
                                        <td>{item.bim_inc === 1 ? item.bim_val : ''}</td>
                                        <td>{item.bim_inc === 0 ? item.bim_val : ''}</td>
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
                <Button variant="primary" onClick={enviarPDF} disabled={enviando}>
                {enviando ? 'Generando...' : 'Generar PDF'}
                </Button>
            </Modal.Footer>
            {mensaje && <p className="text-center mt-2">{mensaje}</p>}
        </Modal>
    );
}

export default ModalRepBm2;
