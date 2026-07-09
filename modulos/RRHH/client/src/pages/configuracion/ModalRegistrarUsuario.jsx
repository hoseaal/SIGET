import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, ListGroup } from 'react-bootstrap';

const ModalRegistrarUsuario = ({ show, handleClose, onSuccess }) => {
    // ── Fase 1: Búsqueda de empleado ─────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState('');
    const [empleados, setEmpleados] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);

    // ── Fase 2: Formulario de credenciales ───────────────────────────────────
    const [formData, setFormData] = useState({ username: '', password: '', rol_id: '', modulo_id: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // ── Catálogos dinámicos desde la BD ──────────────────────────────────────
    const [roles, setRoles] = useState([]);
    const [modulos, setModulos] = useState([]);
    const [loadingCatalogos, setLoadingCatalogos] = useState(false);

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
                if (resModulos.ok) {
                    const mods = await resModulos.json();
                    setModulos(mods);
                    // Preseleccionar el primer módulo disponible
                    if (mods.length > 0) setFormData(f => ({ ...f, modulo_id: String(mods[0].modulo_id) }));
                }
            } catch (err) {
                console.error('Error cargando catálogos:', err);
            } finally {
                setLoadingCatalogos(false);
            }
        };
        fetchCatalogos();
    }, [show]);

    // ── Búsqueda de empleados con debounce ───────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.length >= 3 && !selectedEmpleado) {
                setIsSearching(true);
                try {
                    const response = await fetch(`/api/rrhh/empleados/buscar-registro?q=${searchTerm}`);
                    if (response.ok) setEmpleados(await response.json());
                } catch (err) {
                    console.error('Error buscando empleados', err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setEmpleados([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedEmpleado]);

    const handleSelectEmpleado = (empleado) => {
        setSelectedEmpleado(empleado);
        setSearchTerm(`${empleado.nombres} ${empleado.apellidos} - ${empleado.cedula}`);
        setEmpleados([]);
    };

    const handleReset = () => {
        setSelectedEmpleado(null);
        setSearchTerm('');
        setFormData(f => ({ username: '', password: '', rol_id: '', modulo_id: f.modulo_id }));
        setError('');
    };

    const onClose = () => { handleReset(); handleClose(); };
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEmpleado) { setError('Debe seleccionar un empleado.'); return; }

        setIsSubmitting(true);
        setError('');
        try {
            const response = await fetch('/api/rrhh/user/registrar-con-empleado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    empleado_id: selectedEmpleado.empleado_id,
                    nombres: selectedEmpleado.nombres,
                    apellidos: selectedEmpleado.apellidos,
                    cedula: selectedEmpleado.cedula
                })
            });
            const data = await response.json();
            if (response.ok) { onSuccess(); onClose(); }
            else setError(data.error || 'Error al registrar usuario.');
        } catch (err) {
            setError('Error de conexión.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Registrar Nuevo Usuario</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* ── Fase 1: Buscar empleado ─────────────────────────── */}
                    <h5 className="mb-3">1. Seleccionar Empleado</h5>
                    <Form.Group className="mb-3">
                        <Form.Label>Buscar por Cédula, Nombre o Apellido</Form.Label>
                        <div className="d-flex gap-2">
                            <Form.Control
                                type="text"
                                placeholder="Ingrese al menos 3 caracteres..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={selectedEmpleado !== null}
                            />
                            {selectedEmpleado && (
                                <Button variant="outline-secondary" onClick={handleReset}>Cambiar</Button>
                            )}
                        </div>

                        {isSearching && <div className="mt-2"><Spinner animation="border" size="sm" /> Buscando...</div>}

                        {!selectedEmpleado && empleados.length > 0 && (
                            <ListGroup className="mt-2 position-absolute w-75 shadow z-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {empleados.map((emp) => (
                                    <ListGroup.Item key={emp.empleado_id} action onClick={() => handleSelectEmpleado(emp)}>
                                        <strong>{emp.cedula}</strong> — {emp.nombres} {emp.apellidos}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                        {!selectedEmpleado && searchTerm.length >= 3 && !isSearching && empleados.length === 0 && (
                            <div className="mt-2 text-muted small">No se encontraron empleados sin cuenta.</div>
                        )}
                    </Form.Group>

                    {/* ── Fase 2: Credenciales (solo visible con empleado seleccionado) ── */}
                    {selectedEmpleado && (
                        <>
                            <hr />
                            <h5 className="mb-3">2. Credenciales de Acceso</h5>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <Form.Group>
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control type="text" name="username" required value={formData.username} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <Form.Group>
                                        <Form.Label>Contraseña</Form.Label>
                                        <Form.Control type="password" name="password" required value={formData.password} onChange={handleChange} />
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
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={!selectedEmpleado || isSubmitting}>
                        {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Registrar Usuario'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ModalRegistrarUsuario;
