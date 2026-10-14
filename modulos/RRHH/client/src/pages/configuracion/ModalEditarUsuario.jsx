import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

/**
 * Modal para editar un usuario de login.
 * Los selects de Rol y Módulo se cargan dinámicamente desde la base de datos
 * (roles_sistema y modulos_acceso) mediante /api/rrhh/meta/roles y /api/rrhh/meta/modulos.
 */
const ModalEditarUsuario = ({ show, handleClose, onSuccess, rowData, idColumn = 'usuario_id' }) => {
    const [formData, setFormData] = useState({
        username: '', cedula_referencia: '', nombres: '', apellidos: '', rol_id: '', modulo_id: ''
    });

    // ── Catálogos dinámicos desde la BD ──────────────────────────────────────
    const [roles, setRoles] = useState([]);
    const [modulos, setModulos] = useState([]);
    const [loadingCatalogos, setLoadingCatalogos] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Cargar roles y módulos cuando el modal se abre
    useEffect(() => {
        if (!show) return;
        const fetchCatalogos = async () => {
            setLoadingCatalogos(true);
            try {
                const [resRoles, resModulos] = await Promise.all([
                    fetch('/api/rrhh/meta/roles'),
                    fetch('/api/rrhh/meta/modulos')
                ]);
                if (resRoles.ok) setRoles(await resRoles.json());
                if (resModulos.ok) setModulos(await resModulos.json());
            } catch (err) {
                console.error('Error cargando catálogos:', err);
            } finally {
                setLoadingCatalogos(false);
            }
        };
        fetchCatalogos();
    }, [show]);

    // Precargar los datos del usuario seleccionado
    useEffect(() => {
        if (show && rowData) {
            setFormData({
                username: rowData.username ?? '',
                cedula_referencia: rowData.cedula_referencia ?? '',
                nombres: rowData.nombres ?? '',
                apellidos: rowData.apellidos ?? '',
                rol_id: rowData.rol_id != null ? String(rowData.rol_id) : '',
                modulo_id: rowData.modulo_id != null ? String(rowData.modulo_id) : ''
            });
            setError('');
        }
    }, [show, rowData]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onClose = () => { setError(''); handleClose(); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = rowData?.[idColumn];
        if (!userId) { setError('No se encontró el ID del usuario a actualizar.'); return; }

        setIsSubmitting(true);
        setError('');
        try {
            const response = await fetch(`/api/rrhh/user/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    cedula_referencia: formData.cedula_referencia,
                    nombres: formData.nombres,
                    apellidos: formData.apellidos,
                    rol_id: formData.rol_id,
                    modulo_id: formData.modulo_id
                })
            });
            const data = await response.json().catch(() => ({}));
            if (response.ok) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                setError(data.error || 'Error al actualizar el usuario.');
            }
        } catch (err) {
            setError('Error de conexión.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Editar Usuario</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label>Usuario</Form.Label>
                                <Form.Control type="text" name="username" required value={formData.username} onChange={handleChange} />
                            </Form.Group>
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label>Cédula de Referencia</Form.Label>
                                <Form.Control type="text" name="cedula_referencia" value={formData.cedula_referencia} onChange={handleChange} />
                            </Form.Group>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label>Nombres</Form.Label>
                                <Form.Control type="text" name="nombres" required value={formData.nombres} onChange={handleChange} />
                            </Form.Group>
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label>Apellidos</Form.Label>
                                <Form.Control type="text" name="apellidos" required value={formData.apellidos} onChange={handleChange} />
                            </Form.Group>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label>Rol del Sistema</Form.Label>
                                {loadingCatalogos
                                    ? <div className="mt-1"><Spinner size="sm" className="me-2" />Cargando roles...</div>
                                    : (
                                        <Form.Select name="rol_id" required value={formData.rol_id} onChange={handleChange}>
                                            <option value="">Seleccione un rol...</option>
                                            {/* Cargado dinámicamente desde roles_sistema */}
                                            {roles.map(r => (
                                                <option key={r.rol_id} value={r.rol_id}>{r.nombre_rol}</option>
                                            ))}
                                        </Form.Select>
                                    )
                                }
                            </Form.Group>
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label>Módulo de Acceso</Form.Label>
                                {loadingCatalogos
                                    ? <div className="mt-1"><Spinner size="sm" className="me-2" />Cargando módulos...</div>
                                    : (
                                        <Form.Select name="modulo_id" required value={formData.modulo_id} onChange={handleChange}>
                                            <option value="">Seleccione un módulo...</option>
                                            {/* Cargado dinámicamente desde modulos_acceso */}
                                            {modulos.map(m => (
                                                <option key={m.modulo_id} value={m.modulo_id}>{m.nombre_modulo}</option>
                                            ))}
                                        </Form.Select>
                                    )
                                }
                            </Form.Group>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Guardar Cambios'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ModalEditarUsuario;
