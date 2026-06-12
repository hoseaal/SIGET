import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ModalCambioEstatus = ({ show, handleClose, empleado }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nuevo_estatus_id: '',
        porcentaje_jubilacion: '',
        porcentaje_antiguedad: '',
        familiar_id: '',
        fecha_efectiva: new Date().toISOString().split('T')[0],
        familiar_cedula: '',
        familiar_nombres: '',
        familiar_apellidos: '',
        familiar_fecha_nacimiento: '',
        familiar_parentesco: '',
        familiar_direccion: '',
        familiar_telefono: '',
        familiar_cuenta_bancaria: '',
        familiar_fecha_ingreso_beneficio: '',
        familiar_observacion: ''
    });

    const [familiares, setFamiliares] = useState([]);

    const [estatusList, setEstatusList] = useState([
        { id: 3, nombre: 'Jubilado' },
        { id: 4, nombre: 'Pensionado' },
        { id: 7, nombre: 'Sobreviviente' }
    ]);

    useEffect(() => {
        if (show) {
            setFormData({
                nuevo_estatus_id: '',
                porcentaje_jubilacion: '',
                familiar_id: '',
                fecha_efectiva: new Date().toISOString().split('T')[0],
                familiar_cedula: '',
                familiar_nombres: '',
                familiar_apellidos: '',
                familiar_fecha_nacimiento: '',
                familiar_parentesco: '',
                familiar_direccion: '',
                familiar_telefono: '',
                familiar_cuenta_bancaria: '',
                familiar_fecha_ingreso_beneficio: '',
                familiar_observacion: ''
            });
            setError('');
        }
    }, [show]);

    useEffect(() => {
        const fetchFamiliares = async () => {
            if (formData.nuevo_estatus_id == 7 && empleado) {
                try {
                    const response = await fetch(`/api/carga-familiar/${empleado.empleado_id}`);
                    const data = await response.json();
                    const current = new Date();
                    const familiaresMayores = data.filter(f => {
                        if (!f.fecha_nacimiento) return false;
                        const birthDate = new Date(f.fecha_nacimiento);
                        let age = current.getFullYear() - birthDate.getFullYear();
                        const m = current.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && current.getDate() < birthDate.getDate())) {
                            age--;
                        }
                        return age > 18;
                    });
                    setFamiliares(familiaresMayores);
                } catch (err) {
                    console.error('Error fetching familiares:', err);
                }
            }
        };
        fetchFamiliares();
    }, [formData.nuevo_estatus_id, empleado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nuevo_estatus_id) {
            setError('Debe seleccionar un nuevo estatus.');
            return;
        }

        if (formData.nuevo_estatus_id == 7 && familiares.length === 0) {
            const birthDate = new Date(formData.familiar_fecha_nacimiento);
            const current = new Date();
            let age = current.getFullYear() - birthDate.getFullYear();
            const m = current.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && current.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age <= 18) {
                setError('El familiar debe ser mayor de 18 años.');
                return;
            }
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/funcionarios/${empleado.empleado_id}/cambiar-estatus`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nuevo_estatus_id: formData.nuevo_estatus_id,
                    datos_adicionales: {
                        porcentaje_jubilacion: formData.porcentaje_jubilacion,
                        familiar_id: formData.familiar_id,
                        fecha_efectiva: formData.fecha_efectiva,
                        familiar_nuevo: formData.nuevo_estatus_id == 7 && familiares.length === 0 ? {
                            cedula: formData.familiar_cedula,
                            nombres: formData.familiar_nombres,
                            apellidos: formData.familiar_apellidos,
                            fecha_nacimiento: formData.familiar_fecha_nacimiento,
                            parentesco: formData.familiar_parentesco,
                            direccion: formData.familiar_direccion,
                            telefono: formData.familiar_telefono,
                            cuenta_bancaria: formData.familiar_cuenta_bancaria,
                            fecha_ingreso_beneficio: formData.familiar_fecha_ingreso_beneficio,
                            observacion: formData.familiar_observacion
                        } : null
                    }
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al cambiar el estatus');

            // Redirección según el nuevo estatus
            handleClose();
            if (formData.nuevo_estatus_id == 3) {
                navigate('/Personal/Jubilados');
            } else if (formData.nuevo_estatus_id == 4) {
                navigate('/Personal/Pensionados');
            } else if (formData.nuevo_estatus_id == 7) {
                navigate(`/Personal/Sobrevivientes?empleado_id=${empleado.empleado_id}`);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Cambiar Estatus de Funcionario</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <div className="mb-3 text-center">
                        <p>Estás cambiando el estatus de:</p>
                        <h5 className="text-primary">{empleado?.nombres} {empleado?.apellidos}</h5>
                        <p className="text-muted">Cédula: {empleado?.cedula}</p>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Seleccionar Nuevo Estatus</Form.Label>
                        <Form.Select
                            name="nuevo_estatus_id"
                            value={formData.nuevo_estatus_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Seleccione --</option>
                            {estatusList.map(st => (
                                <option key={st.id} value={st.id}>{st.nombre}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* Campos adicionales si es Jubilado o Pensionado */}
                    {(formData.nuevo_estatus_id == 3 || formData.nuevo_estatus_id == 4) && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha Efectiva</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fecha_efectiva"
                                    value={formData.fecha_efectiva}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            {formData.nuevo_estatus_id == 3 && (
                                <div className="row">
                                    <div className="col-md-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Porcentaje de Jubilación (%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="porcentaje_jubilacion"
                                                placeholder="Ej: 80"
                                                value={formData.porcentaje_jubilacion}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </div>

                                </div>
                            )}
                        </>
                    )}

                    {formData.nuevo_estatus_id == 7 && familiares.length > 0 && (
                        <Form.Group className="mb-3">
                            <Form.Label>Seleccionar Sobreviviente (Carga Familiar)</Form.Label>
                            <Form.Select
                                name="familiar_id"
                                value={formData.familiar_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Seleccione un familiar --</option>
                                {familiares.map(f => (
                                    <option key={f.hijo_id} value={f.hijo_id}>
                                        {f.nombres} {f.apellidos} ({f.parentesco})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}

                    {formData.nuevo_estatus_id == 7 && familiares.length === 0 && (
                        <>
                            <div className="alert alert-warning mb-3">
                                <i className="bx bx-error-circle me-1"></i>
                                El funcionario no tiene carga familiar registrada. Complete los datos para registrar al familiar sobreviviente.
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Ingreso al Beneficio</Form.Label>
                                        <Form.Control type="date" name="familiar_fecha_ingreso_beneficio"
                                            value={formData.familiar_fecha_ingreso_beneficio} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cédula del Familiar *</Form.Label>
                                        <Form.Control type="text" name="familiar_cedula"
                                            value={formData.familiar_cedula} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombres del Familiar *</Form.Label>
                                        <Form.Control type="text" name="familiar_nombres"
                                            value={formData.familiar_nombres} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Apellidos del Familiar *</Form.Label>
                                        <Form.Control type="text" name="familiar_apellidos"
                                            value={formData.familiar_apellidos} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Nacimiento *</Form.Label>
                                        <Form.Control type="date" name="familiar_fecha_nacimiento"
                                            value={formData.familiar_fecha_nacimiento} onChange={handleChange} required />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Parentesco *</Form.Label>
                                        <Form.Select name="familiar_parentesco" value={formData.familiar_parentesco} onChange={handleChange} required>
                                            <option value="">Seleccione</option>
                                            <option value="hijo">Hijo(a)</option>
                                            <option value="conyuge">Cónyuge</option>
                                            <option value="esposo">Esposo</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Teléfono del Familiar</Form.Label>
                                        <Form.Control type="text" name="familiar_telefono"
                                            value={formData.familiar_telefono} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cuenta Bancaria del Familiar (20 dígitos)</Form.Label>
                                        <Form.Control type="text" name="familiar_cuenta_bancaria" maxLength={20}
                                            value={formData.familiar_cuenta_bancaria} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="mb-3">
                                <Form.Group>
                                    <Form.Label>Dirección del Familiar</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="familiar_direccion"
                                        value={formData.familiar_direccion} onChange={handleChange} />
                                </Form.Group>
                            </div>

                            <div className="mb-3">
                                <Form.Group>
                                    <Form.Label>Observaciones (Opcional)</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="familiar_observacion"
                                        placeholder="Ingrese alguna observación..."
                                        value={formData.familiar_observacion} onChange={handleChange} />
                                </Form.Group>
                            </div>
                        </>
                    )}

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Procesando...' : 'Cambiar Estatus'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ModalCambioEstatus;
