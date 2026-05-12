import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Row, Col, Badge, Spinner, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import helpFetch from "../../utils/helpFetch";
import { ModalUsuario } from "./components/ModalUsuario";

export const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRol, setFilterRol] = useState("");

    // Maestros para filtros
    const [roles, setRoles] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const data = await helpFetch.GET("/user");
            setUsuarios(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar listado de usuarios");
        } finally {
            setLoading(false);
        }
    };

    const fetchMaestros = async () => {
        try {
            const [rolesData, deps] = await Promise.all([
                helpFetch.GET("/user/roles"),
                helpFetch.GET("/departamento")
            ]);
            setRoles(rolesData);
            setDepartamentos(deps);
        } catch (error) {
            console.error("Error cargando maestros:", error);
        }
    };

    useEffect(() => {
        fetchUsuarios();
        fetchMaestros();
    }, []);

    const handleOpenCreate = () => {
        setSelectedUsuario(null);
        setModalVisible(true);
    };

    const handleOpenEdit = (usuario) => {
        setSelectedUsuario(usuario);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.")) return;
        try {
            const res = await helpFetch.DELETE(`/user/${id}`);
            if (res) {
                toast.success("Usuario eliminado correctamente");
                fetchUsuarios();
            }
        } catch (error) {
            toast.error(error.message || "Error al eliminar usuario");
        }
    };

    const filteredUsuarios = usuarios.filter(user => {
        const fullString = `${user.nombres} ${user.apellidos} ${user.username} ${user.cedula_referencia}`.toLowerCase();
        const matchesSearch = fullString.includes(searchTerm.toLowerCase());
        const matchesRol = filterRol === "" || String(user.rol_id) === filterRol;
        return matchesSearch && matchesRol;
    });

    const getRoleBadgeVariant = (rolId) => {
        switch (parseInt(rolId)) {
            case 1: return "danger"; // Admin
            case 2: return "primary"; // Tecnico
            case 3: return "info"; // Consulta
            default: return "secondary";
        }
    };

    const getRoleName = (rolId) => {
        return roles.find(r => String(r.rol_id) === String(rolId))?.nombre_rol || "Desconocido";
    };

    const getDepName = (depId) => {
        return departamentos.find(d => String(d.id) === String(depId))?.nombre || "N/A";
    };

    return (
        <div className="container-fluid flex-grow-1 container-p-y">
            <ToastContainer />
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Seguridad /</span> Gestión de Usuarios
            </h4>

            <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2 bg-white">
                    <h5 className="mb-0">Listado de Usuarios del Sistema</h5>
                    <Button variant="primary" onClick={handleOpenCreate}>
                        <i className="bx bx-user-plus me-1"></i> Nuevo Usuario
                    </Button>
                </Card.Header>
                <Card.Body>
                    {/* Filtros */}
                    <Row className="mb-4 g-3">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0">
                                    <i className="bx bx-search"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    className="bg-light border-start-0"
                                    placeholder="Buscar por nombre, usuario o cédula..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Select

                                className="bg-light"
                                value={filterRol}
                                onChange={(e) => setFilterRol(e.target.value)}
                            >
                                <option value="">Todos los roles</option>
                                {roles.map(r => (
                                    <option key={r.rol_id} value={r.rol_id}>{r.nombre_rol}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={3} className="text-md-end">
                            <Button
                                variant="secondary"
                                className="w-100"
                                onClick={() => { setSearchTerm(""); setFilterRol(""); }}
                            >
                                Limpiar
                            </Button>
                        </Col>
                    </Row>

                    <Table responsive hover className="align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Cédula</th>
                                <th>Nombre Completo</th>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Departamento</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 mb-0">Cargando usuarios...</p>
                                    </td>
                                </tr>
                            ) : filteredUsuarios.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">
                                        <div className="mb-2"><i className="bx bx-info-circle fs-1"></i></div>
                                        No se encontraron usuarios registrados
                                    </td>
                                </tr>
                            ) : (
                                filteredUsuarios.map(user => (
                                    <tr key={user.usuario_id}>
                                        <td><span className="text-muted small">V-{user.cedula_referencia}</span></td>
                                        <td><strong>{user.nombres} {user.apellidos}</strong></td>
                                        <td><code>{user.username}</code></td>
                                        <td>
                                            <Badge bg={getRoleBadgeVariant(user.rol_id)}>
                                                {getRoleName(user.rol_id)}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="small">{getDepName(user.direc_id)}</div>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <Button size="sm" variant="warning" title="Editar" onClick={() => handleOpenEdit(user)}>
                                                    <i className="bx bx-edit-alt"></i>
                                                </Button>
                                                <Button size="sm" variant="danger" title="Eliminar" onClick={() => handleDelete(user.usuario_id)}>
                                                    <i className="bx bx-trash"></i>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <ModalUsuario
                show={modalVisible}
                onHide={() => setModalVisible(false)}
                onSuccess={() => { setModalVisible(false); fetchUsuarios(); }}
                usuario={selectedUsuario}
            />
        </div>
    );
};
