import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import helpFetch from "../../../utils/helpFetch";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?/{}~|])/;

const createSchema = z.object({
    cedula_referencia: z.string().min(6, "La cédula debe tener al menos 6 dígitos").max(15, "La cédula es muy larga").regex(/^\d+$/, "Debe contener solo números"),
    nombres: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre es muy largo"),
    apellidos: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50, "El apellido es muy largo"),
    username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(30, "El nombre de usuario es muy largo"),
    rol_id: z.string().min(1, "Seleccione un rol"),
    direc_id: z.string().min(1, "Seleccione un departamento"),
    password1: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").regex(passwordRegex, "Debe contener mayúscula, minúscula, número y símbolo"),
    password2: z.string().min(8, "La confirmación debe tener al menos 8 caracteres")
}).refine((data) => data.password1 === data.password2, {
    message: "Las contraseñas no coinciden",
    path: ["password2"]
});

const updatePasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?/{}~|])/;

const updateSchema = z.object({
    cedula_referencia: z.string().min(6, "La cédula debe tener al menos 6 dígitos").max(15, "La cédula es muy larga").regex(/^\d+$/, "Debe contener solo números"),
    nombres: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre es muy largo"),
    apellidos: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50, "El apellido es muy largo"),
    username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(30, "El nombre de usuario es muy largo"),
    rol_id: z.string().min(1, "Seleccione un rol"),
    direc_id: z.string().min(1, "Seleccione un departamento"),
    password1: z.string().optional(),
    password2: z.string().optional()
}).refine((data) => {
    if (data.password1 || data.password2) {
        return data.password1 === data.password2;
    }
    return true;
}, {
    message: "Las contraseñas no coinciden",
    path: ["password2"]
}).refine((data) => {
    if (data.password1 && data.password1.length > 0) {
        if (data.password1.length < 8) return false;
        return updatePasswordRegex.test(data.password1);
    }
    return true;
}, {
    message: "Debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo",
    path: ["password1"]
});

export const ModalUsuario = ({ show, onHide, onSuccess, usuario }) => {
    const isEdit = !!usuario;
    const [loadingMaestros, setLoadingMaestros] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Listas Maestras
    const [maestros, setMaestros] = useState({
        roles: [],
        departamentos: []
    });

    const { register, handleSubmit, formState: { errors }, reset, setError } = useForm({
        resolver: zodResolver(isEdit ? updateSchema : createSchema),
        defaultValues: {
            username: "",
            password1: "",
            password2: "",
            nombres: "",
            apellidos: "",
            rol_id: "",
            direc_id: "",
            cedula_referencia: ""
        }
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
                    setMaestros({ roles, departamentos: deps });

                    if (usuario) {
                        reset({
                            username: usuario.username || "",
                            password1: "",
                            password2: "",
                            nombres: usuario.nombres || "",
                            apellidos: usuario.apellidos || "",
                            rol_id: String(usuario.rol_id || ""),
                            direc_id: String(usuario.direc_id || ""),
                            cedula_referencia: usuario.cedula_referencia || ""
                        });
                    } else {
                        reset({
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
                    toast.error("Error al cargar roles o departamentos");
                } finally {
                    setLoadingMaestros(false);
                }
            };
            load();
        }
    }, [show, usuario, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (isEdit) {
                const updateData = {
                    username: data.username,
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    rol_id: data.rol_id,
                    direc_id: data.direc_id,
                    cedula_referencia: data.cedula_referencia
                };
                await helpFetch.PUT(`/user/${usuario.usuario_id}`, updateData);
                
                if (data.password1) {
                    await helpFetch.PUT(`/user/${usuario.usuario_id}/password`, { password: data.password1 });
                }
                
                toast.success("Usuario actualizado con éxito");
            } else {
                const registerData = {
                    username: data.username,
                    password1: data.password1,
                    password2: data.password1,
                    nombre: data.nombres,
                    ape: data.apellidos,
                    rol_id: data.rol_id,
                    direc_id: data.direc_id,
                    ced: data.cedula_referencia
                };
                await helpFetch.POST("/auth/register", registerData);
                toast.success("Usuario registrado con éxito");
            }
            onSuccess();
        } catch (error) {
            toast.error(error.message || "Error al procesar solicitud");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEdit ? `Editar Usuario: ${usuario?.username}` : "Registrar Nuevo Usuario"}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
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
                                        {...register("nombres")}
                                        isInvalid={!!errors.nombres}
                                        placeholder="Ej. Juan Manuel"
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.nombres?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Apellidos</Form.Label>
                                    <Form.Control
                                        {...register("apellidos")}
                                        isInvalid={!!errors.apellidos}
                                        placeholder="Ej. Pérez García"
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.apellidos?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Cédula / ID</Form.Label>
                                    <Form.Control
                                        {...register("cedula_referencia")}
                                        isInvalid={!!errors.cedula_referencia}
                                        placeholder="Ej. 12345678"
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.cedula_referencia?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Nombre de Usuario</Form.Label>
                                    <Form.Control
                                        {...register("username")}
                                        isInvalid={!!errors.username}
                                        placeholder="Ej. jperez"
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Rol</Form.Label>
                                    <Form.Select
                                        {...register("rol_id")}
                                        isInvalid={!!errors.rol_id}
                                    >
                                        <option value="">Seleccione...</option>
                                        {maestros.roles.map(r => (
                                            <option key={r.rol_id} value={r.rol_id}>{r.nombre_rol}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{errors.rol_id?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Departamento / Dirección</Form.Label>
                                    <Form.Select
                                        {...register("direc_id")}
                                        isInvalid={!!errors.direc_id}
                                    >
                                        <option value="">Seleccione...</option>
                                        {maestros.departamentos.map(d => (
                                            <option key={d.id} value={d.id}>{d.nombre}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{errors.direc_id?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>{isEdit ? "Nueva Contraseña (opcional)" : "Contraseña"}</Form.Label>
                                    <Form.Control
                                        type="password"
                                        {...register("password1")}
                                        isInvalid={!!errors.password1}
                                        placeholder="••••••••"
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.password1?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Confirmar Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        {...register("password2")}
                                        isInvalid={!!errors.password2}
                                        placeholder="••••••••"
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.password2?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loadingMaestros || isSubmitting}>
                        {isSubmitting ? (
                            <><Spinner as="span" animation="border" size="sm" className="me-2" />{isEdit ? "Guardando..." : "Registrando..."}</>
                        ) : (
                            isEdit ? "Guardar Cambios" : "Registrar Usuario"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
