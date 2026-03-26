import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import Alert from '../../components/atoms/Alert';

function ModalAntiguedades({ show, handleClose, empleado_id }) {
    const [funcionario, setFuncionario] = useState(null);
    const [registros, setRegistros] = useState([]);
    const [totalAnios, setTotalAnios] = useState(0);
    
    // Estados del formulario y UI
    const [formData, setFormData] = useState({ fecha_inicio: '', fecha_fin: '' });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Formatear fechas para mostrar en la tabla (Ej: 2015-01-01 -> 01/01/2015)
    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'Vigente';
        const date = new Date(fechaString);
        // Ajuste por zona horaria para evitar que reste un día
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toLocaleDateString('es-VE');
    };

    // Función para cargar los datos del funcionario y su historial
    const cargarDatos = async () => {
        if (!empleado_id) return;
        
        setLoading(true);
        setError('');
        
        try {
            // 1. Obtener datos básicos del funcionario para el título
            const resFun = await fetch(`/api/funcionarios/${empleado_id}`);
            if (resFun.ok) {
                const dataFun = await resFun.json();
                // Si el backend devuelve el JSON anidado (type=full), o plano:
                const personalInfo = dataFun.datos_personales || dataFun;
                setFuncionario(personalInfo);
            }

            // 2. Obtener el historial de antigüedad
            const resAnt = await fetch(`/api/registros-antiguedad/funcionario/${empleado_id}`);
            if (resAnt.ok) {
                const dataAnt = await resAnt.json();
                
                // Basado en tu Service, esto devuelve un objeto con { historial, total_anios_acumulados }
                if (dataAnt.historial) {
                    setRegistros(dataAnt.historial);
                    setTotalAnios(dataAnt.total_anios_acumulados || 0);
                } else if (Array.isArray(dataAnt)) {
                    // Fallback por si devuelve un arreglo directo
                    setRegistros(dataAnt);
                    const totalCalculado = dataAnt.reduce((acc, curr) => acc + Number(curr.anios || 0), 0);
                    setTotalAnios(totalCalculado);
                }

                console.log('Datos de antigüedad cargados:', dataAnt);
            }
        } catch (err) {
            console.error(err);
            setError('Error al cargar los datos del funcionario.');
        } finally {
            setLoading(false);
        }
    };

    // Efecto que se dispara al abrir el modal o cambiar el funcionario
    useEffect(() => {
        if (show && empleado_id) {
            // Limpiar estados previos
            setFormData({ fecha_inicio: '', fecha_fin: '' });
            setSuccessMsg('');
            setError('');
            cargarDatos();
        }
    }, [show, empleado_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        // Validaciones locales
        if (!formData.fecha_inicio) {
            setError('La fecha de inicio es obligatoria.');
            return;
        }

        if (formData.fecha_inicio && formData.fecha_fin) {
            if (new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
                setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
                return;
            }
        }

        setSaving(true);
        try {
            const payload = {
                empleado_id: empleado_id,
                fecha_inicio: formData.fecha_inicio,
                fecha_fin: formData.fecha_fin || null // Si está vacío enviamos null
            };

            const response = await fetch('/api/registros-antiguedad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const resError = await response.json();
                throw new Error(resError.error || 'Error al guardar el registro.');
            }

            setSuccessMsg('Registro agregado exitosamente.');
            setFormData({ fecha_inicio: '', fecha_fin: '' }); // Limpiar formulario
            
            // Recargar la tabla
            cargarDatos();

            // Ocultar mensaje de éxito después de 3 segundos
            setTimeout(() => setSuccessMsg(''), 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (antiguedad_id) => {
        if (!window.confirm('¿Está seguro de eliminar este registro de antigüedad? Esto podría afectar el cálculo de nómina.')) {
            return;
        }

        setError('');
        try {
            const response = await fetch(`/api/registros-antiguedad/${antiguedad_id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el registro.');
            }

            setSuccessMsg('Registro eliminado correctamente.');
            cargarDatos(); // Recargar la tabla

            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    Gestión de Antigüedad - {funcionario ? `${funcionario.nombres} ${funcionario.apellidos}` : 'Cargando...'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                
                {/* ZONA DE ALERTAS */}
                {error && <Alert type="danger">{error}</Alert>}
                {successMsg && <Alert type="success">{successMsg}</Alert>}

                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Cargando historial...</p>
                    </div>
                ) : (
                    <>
                        {/* FORMULARIO PARA NUEVO REGISTRO */}
                        <div className="bg-light p-3 rounded mb-4 border">
                            <h6 className="text-primary mb-3"><i className="bx bx-calendar-plus me-1"></i> Agregar Nuevo Periodo</h6>
                            <Form onSubmit={handleSubmit}>
                                <div className="row align-items-end">
                                    <div className="col-md-5 mb-3 mb-md-0">
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted">Fecha de Inicio *</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="fecha_inicio"
                                                value={formData.fecha_inicio}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-5 mb-3 mb-md-0">
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted">Fecha de Fin (Opcional)</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="fecha_fin"
                                                value={formData.fecha_fin}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-2">
                                        <Button variant="primary" type="submit" className="w-100" disabled={saving}>
                                            {saving ? '...' : 'Guardar'}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </div>

                        {/* RESUMEN DE ANTIGÜEDAD */}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="m-0 text-secondary">Historial Registrado</h6>
                            <span className="badge bg-label-primary fs-6">
                                Total Acumulado: {totalAnios} {totalAnios === 1 ? 'Año' : 'Años'}
                            </span>
                        </div>

                        {/* TABLA DE REGISTROS */}
                        <Table bordered hover size="sm" responsive className="text-center align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Fecha Inicio</th>
                                    <th>Fecha Fin</th>
                                    <th>Años Reconocidos</th>
                                    <th style={{ width: '80px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registros.length > 0 ? (
                                    registros.map((reg) => (
                                        <tr key={reg.antiguedad_id}>
                                            <td>{formatearFecha(reg.fecha_inicio)}</td>
                                            <td>
                                                {reg.fecha_fin ? formatearFecha(reg.fecha_fin) : (
                                                    <span className="badge bg-success bg-opacity-10 text-success">Vigente</span>
                                                )}
                                            </td>
                                            <td className="fw-semibold text-primary">{reg.anios + " años " + reg.meses + " meses " + reg.dias + " días"}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger" 
                                                    title="Eliminar registro"
                                                    onClick={() => handleDelete(reg.antiguedad_id)}
                                                >
                                                    <i className="bx bx-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-4 text-muted fst-italic">
                                            No hay registros de antigüedad para este funcionario.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </>
                )}

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar Ventana
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalAntiguedades;