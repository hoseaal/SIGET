import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import Alert from '../../components/atoms/Alert';

function ModalCargaFamiliar({ show, handleClose, empleado_id }) {
    const [empleado, setEmpleado] = useState(null);
    const [cargas, setCargas] = useState([]);
    
    // Estados del formulario y UI
    const [formData, setFormData] = useState({ nombres: '', apellidos: '', fecha_nacimiento: '' });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [editId, setEditId] = useState(null);

    const formatearFecha = (fechaString) => {
        if (!fechaString) return '';
        const date = new Date(fechaString);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toLocaleDateString('es-VE');
    };

    const cargarDatos = async () => {
        if (!empleado_id) return;
        
        setLoading(true);
        setError('');
        
        try {
            // Obtener empleado
            const resEmp = await fetch(`/api/funcionarios/${empleado_id}`);
            if (resEmp.ok) {
                const dataEmp = await resEmp.json();
                const personalInfo = dataEmp.datos_personales || dataEmp;
                setEmpleado(personalInfo);
            } else {
                // If it's an obrero, try fetching from /api/obreros
                const resObrero = await fetch(`/api/obreros/${empleado_id}`);
                if (resObrero.ok) {
                    const dataObrero = await resObrero.json();
                    const personalInfo = dataObrero.datos_personales || dataObrero;
                    setEmpleado(personalInfo);
                }
            }

            // Obtener carga familiar
            const resCarga = await fetch(`/api/carga-familiar/empleado/${empleado_id}`);
            if (resCarga.ok) {
                const dataCarga = await resCarga.json();
                setCargas(Array.isArray(dataCarga) ? dataCarga : []);
            }
        } catch (err) {
            console.error(err);
            setError('Error al cargar los datos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show && empleado_id) {
            setFormData({ nombres: '', apellidos: '', fecha_nacimiento: '' });
            setEditId(null);
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

        if (!formData.nombres || !formData.apellidos || !formData.fecha_nacimiento) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                empleado_id: empleado_id,
                nombres: formData.nombres,
                apellidos: formData.apellidos,
                fecha_nacimiento: formData.fecha_nacimiento
            };

            let url = '/api/carga-familiar';
            let method = 'POST';

            if (editId) {
                url = `/api/carga-familiar/${editId}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const resError = await response.json();
                throw new Error(resError.error || 'Error al guardar el registro.');
            }

            setSuccessMsg(editId ? 'Registro actualizado exitosamente.' : 'Registro agregado exitosamente.');
            setFormData({ nombres: '', apellidos: '', fecha_nacimiento: '' });
            setEditId(null);
            
            cargarDatos();
            setTimeout(() => setSuccessMsg(''), 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (carga) => {
        setEditId(carga.hijo_id);
        setFormData({
            nombres: carga.nombres,
            apellidos: carga.apellidos,
            // Al asignar fecha a un input type="date", debe ir en formato YYYY-MM-DD
            fecha_nacimiento: carga.fecha_nacimiento ? carga.fecha_nacimiento.split('T')[0] : ''
        });
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setFormData({ nombres: '', apellidos: '', fecha_nacimiento: '' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este registro?')) {
            return;
        }

        setError('');
        try {
            const response = await fetch(`/api/carga-familiar/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el registro.');
            }

            setSuccessMsg('Registro eliminado correctamente.');
            cargarDatos();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    Carga Familiar - {empleado ? `${empleado.nombres} ${empleado.apellidos}` : 'Cargando...'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert type="danger">{error}</Alert>}
                {successMsg && <Alert type="success">{successMsg}</Alert>}

                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Cargando datos...</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-light p-3 rounded mb-4 border">
                            <h6 className="text-primary mb-3">
                                <i className={`bx ${editId ? 'bx-edit' : 'bx-user-plus'} me-1`}></i> 
                                {editId ? 'Editar Familiar' : 'Agregar Familiar'}
                            </h6>
                            <Form onSubmit={handleSubmit}>
                                <div className="row align-items-end">
                                    <div className="col-md-3 mb-3 mb-md-0">
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted">Nombres *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="nombres"
                                                value={formData.nombres}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-3 mb-3 mb-md-0">
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted">Apellidos *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="apellidos"
                                                value={formData.apellidos}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-3 mb-3 mb-md-0">
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted">Fecha Nac. *</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="fecha_nacimiento"
                                                value={formData.fecha_nacimiento}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-3 d-flex gap-2">
                                        {editId && (
                                            <Button variant="secondary" onClick={handleCancelEdit} className="w-50" disabled={saving}>
                                                <i className="bx bx-x"></i>
                                            </Button>
                                        )}
                                        <Button variant="primary" type="submit" className={editId ? 'w-50' : 'w-100'} disabled={saving}>
                                            {saving ? '...' : (editId ? 'Guardar' : 'Agregar')}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="m-0 text-secondary">Familiares Registrados</h6>
                            <span className="badge bg-label-primary fs-6">
                                Total: {cargas.length}
                            </span>
                        </div>

                        <Table bordered hover size="sm" responsive className="text-center align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th>Fecha Nacimiento</th>
                                    <th>Estatus / Edad</th>
                                    <th style={{ width: '100px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargas.length > 0 ? (
                                    cargas.map((carga) => (
                                        <tr key={carga.hijo_id} className={carga.estatus === 0 ? 'table-secondary text-muted' : ''}>
                                            <td>{carga.nombres}</td>
                                            <td>{carga.apellidos}</td>
                                            <td>{formatearFecha(carga.fecha_nacimiento)}</td>
                                            <td>
                                                {carga.estatus === 0 ? (
                                                    <span className="badge bg-danger">Inactivo ({carga.edad} años)</span>
                                                ) : (
                                                    <span className="badge bg-success">Activo ({carga.edad} años)</span>
                                                )}
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-outline-primary me-1" 
                                                    title="Editar registro"
                                                    onClick={() => handleEdit(carga)}
                                                    disabled={carga.estatus === 0}
                                                >
                                                    <i className="bx bx-edit-alt"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger" 
                                                    title="Eliminar registro"
                                                    onClick={() => handleDelete(carga.hijo_id)}
                                                >
                                                    <i className="bx bx-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-4 text-muted fst-italic">
                                            No hay familiares registrados.
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
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalCargaFamiliar;
