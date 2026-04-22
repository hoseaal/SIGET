import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import helpFetch from "../../../utils/helpFetch";

export const ModalUsuario = ({ show, onHide, onSuccess, usuario }) => {
    const isEdit = !!usuario;
    const [loadingMaestros, setLoadingMaestros] = useState(false);

    // Listas Maestras
    const [maestros, setMaestros] = useState({
        roles: [],
        departamentos: []
    });

    const [formData, setFormData] = useState({
        username: "",
        password1: "",
        password2: "",
        nombres: "",
        apellidos: "",
        rol_id: "",
        direc_id: "",
        cedula_referencia: ""
    });

    useEffect(() => {
        if (show) {
            const load = async () => {
                setLoadingMaestros(true);
                try {
                    const [roles, deps] = await Promise.all([
                        helpFetch.GET("/user/roles"),
                        helpFetch.GET("/departamento")
                    ]);
                    setMaestros({
                        roles,
                        departamentos: deps
                    });

                    if (usuario) {
                        setFormData({
                            username: usuario.username || "",
                            password1: "",
                            password2: "",
                            nombres: usuario.nombres || "",
                            apellidos: usuario.apellidos || "",
                            rol_id: usuario.rol_id || "",
                            direc_id: usuario.direc_id || "",
                            cedula_referencia: usuario.cedula_referencia || ""
                        });
                    } else {
                        setFormData({
                            username: "",
                            password1: "",
                            password2: "",
                            nombres: "",
                            apellidos: "",
                            rol_id: "",
                            direc_id: "",
                            cedula_referencia: ""
                        });
                    }
                } catch (err) {
                    console.error("Error cargando maestros:", err);
                    toast.error("Error al cargar roles o departamentos");
                } finally {
                    setLoadingMaestros(false);
                }
            };
            load();
        }
    }, [show, usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEdit && (!formData.password1 || formData.password1 !== formData.password2)) {
            toast.error("Las contraseñas deben coincidir y no pueden estar vacías");
            return;
        }

        try {
            if (isEdit) {
                // Para actualizar (sin contraseña en este endpoint segun user.routes.js)
                const updateData = {
                    username: formData.username,
                    nombres: formData.nombres,
                    apellidos: formData.apellidos,
                    rol_id: formData.rol_id,
                    direc_id: formData.direc_id,
                    cedula_referencia: formData.cedula_referencia
                };
                await helpFetch.PUT(`/user/${usuario.usuario_id}`, updateData);
                
                // Si se escribió algo en password, intentar actualizar contraseña
                if (formData.password1) {
                    if (formData.password1 === formData.password2) {
                        await helpFetch.PUT(`/user/${usuario.usuario_id}/password`, { password: formData.password1 });
                    } else {
                        toast.warning("La contraseña no se actualizó porque no coinciden.");
                    }
                }
                
                toast.success("Usuario actualizado con éxito");
            } else {
                // Registrar nuevo (usa el endpoint /api/auth/register protegido en backend)
                const registerData = {
                    username: formData.username,
                    password1: formData.password1,
                    nombre: formData.nombres, // El backend espera 'nombre' y 'ape' en Auth register
                    ape: formData.apellidos,
                    rol_id: formData.rol_id,
                    direc_id: formData.direc_id,
                    ced: formData.cedula_referencia
                };
                await helpFetch.POST("/auth/register", registerData);
                toast.success("Usuario registrado con éxito");
            }
            onSuccess();
        } catch (error) {
            toast.error(error.message || "Error al procesar solicitud");
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEdit ? `Editar Usuario: ${usuario.username}` : "Registrar Nuevo Usuario"}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {loadingMaestros ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p>Cargando datos...</p>
                        </div>
                    ) : (
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Nombres</Form.Label>
                                    <Form.Control
                                        required
                                        name="nombres"
                                        value={formData.nombres}
                                        onChange={handleChange}
                                        placeholder="Ej. Juan Manuel"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Apellidos</Form.Label>
                                    <Form.Control
                                        required
                                        name="apellidos"
                                        value={formData.apellidos}
                                        onChange={handleChange}
                                        placeholder="Ej. Pérez García"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Cédula / ID</Form.Label>
                                    <Form.Control
                                        required
                                        name="cedula_referencia"
                                        value={formData.cedula_referencia}
                                        onChange={handleChange}
                                        placeholder="Ej. 12345678"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Nombre de Usuario</Form.Label>
                                    <Form.Control
                                        required
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Ej. jperez"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Rol</Form.Label>
                                    <Form.Select
                                        required
                                        name="rol_id"
                                        value={formData.rol_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione...</option>
                                        {maestros.roles.map(r => (
                                            <option key={r.rol_id} value={r.rol_id}>{r.nombre_rol}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Departamento / Dirección</Form.Label>
                                    <Form.Select
                                        required
                                        name="direc_id"
                                        value={formData.direc_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione...</option>
                                        {maestros.departamentos.map(d => (
                                            <option key={d.id} value={d.id}>{d.nombre}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>{isEdit ? "Nueva Contraseña (opcional)" : "Contraseña"}</Form.Label>
                                    <Form.Control
                                        required={!isEdit}
                                        type="password"
                                        name="password1"
                                        value={formData.password1}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Confirmar Contraseña</Form.Label>
                                    <Form.Control
                                        required={!isEdit && formData.password1}
                                        type="password"
                                        name="password2"
                                        value={formData.password2}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={onHide}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loadingMaestros}>
                        {isEdit ? "Guardar Cambios" : "Registrar Usuario"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
