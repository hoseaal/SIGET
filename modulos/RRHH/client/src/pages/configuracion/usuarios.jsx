import React, { useState, useEffect, useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import { getTableMetadata } from '../../data/fetchData';
import ModalRegistrarUsuario from './ModalRegistrarUsuario';
import ModalUpdate from '../Modales/modalUpdate';
import ModalDelete from '../Modales/modalDelete';
import ModalContraseña from '../Modales/modalContraseña'

export const Usuarios = () => {
    // Estado para User
    const [columns, setColumns] = useState([]);
    const [idColumn, setIdColumn] = useState(null);
    const [data, setData] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showUserUpModal, setShowUserUpModal] = useState(false);
    const [showUserDelModal, setShowUserDelModal] = useState(false);
    const [showUserConModal, setShowUserConModal] = useState(false);


    const columnAliasUser = {
        'usuario_id': 'Código',
        'username': 'Usuario',
        'cedula_referencia': 'Numero de Cedula',
        'nombres': 'Nombre de Usuario',
        'apellidos': 'Apellido del Usuario',
        'rol_id': 'Tipo de Usuario',
        'modulo_id': 'Modulo de Acceso',
    };
    const [refreshKey, setRefreshKey] = useState(0);

    const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);


    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1); // Fuerza recarga
    };

    // Cargar columnas y datos de Marca
    useEffect(() => {
        const loadCatData = async () => {
            try {
                const { columns, primaryKey } = await getTableMetadata('usuarios');
                const filteredColumns = columns.filter(col => col.name !== 'password_hash');

                setColumns(filteredColumns.map(col => ({
                    originalName: col.name,
                    displayName: columnAliasUser[col.name] || null,
                    isPrimaryKey: col.name === primaryKey
                })));
                setIdColumn(primaryKey);

                const res = await fetch('/api/rrhh/user', { credentials: 'include' });
                const data = await res.json();
                setData(data);
            } catch (error) {
                console.error('Error cargando categorías:', error);
            }
        };
        loadCatData();
    }, [refreshKey]);


    return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración General /</span> Modelos y User</h4>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Usuarios</h5>
                    <button className="btn btn-primary" onClick={() => setShowUserModal(true)}>
                        <i className="bx bx-plus me-1"></i> Registrar Usuario
                    </button>
                </div>
                <ModalRegistrarUsuario
                    show={showUserModal}
                    handleClose={() => setShowUserModal(false)}
                    onSuccess={handleSuccess}
                />
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columns.map((col, index) => (
                                    <th key={index}>{col.displayName}</th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {data.map((item, index) => (
                                <tr key={index}>
                                    {/* Acceder a los datos usando originalName */}
                                    {columns.map((col) => (
                                        <td key={`${index}-${col.originalName}`}>
                                            {item[col.originalName.toLowerCase()] ?? null}
                                        </td>
                                    ))}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" id="dropdown-basic" className="nav-dropdown-dark-example">
                                                <i className="bx bx-dots-vertical-rounded"></i>
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item href="#" onClick={() => {
                                                    setEditingItem(item); // Guarda el item que se va a editar
                                                    setShowUserUpModal(true); // Abre el modal
                                                }}>
                                                    <i className="bx bx-edit-alt me-1"></i> Edit
                                                </Dropdown.Item>
                                                <Dropdown.Item href="#" onClick={() => {
                                                    setEditingItem(item); // Guarda el item que se va a editar
                                                    setShowUserConModal(true); // Abre el modal
                                                }}>
                                                    <i className="bx bx-edit-alt me-1"></i> Cambiar Contraseña
                                                </Dropdown.Item>
                                                <Dropdown.Item href="#" onClick={() => {
                                                    setDeleteItem(item.usuario_id)
                                                    setShowUserDelModal(true); // Abre el modal
                                                }}>
                                                    <i className="bx bx-trash me-1"></i> Delete
                                                </Dropdown.Item>
                                            </Dropdown.Menu>

                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <ModalUpdate
                            show={showUserUpModal}
                            handleClose={() => setShowUserUpModal(false)}
                            columns={columns}
                            tableName='usuarios'
                            rowData={editingItem}
                            onSuccess={handleSuccess}
                            idColumn={idColumn}
                        />
                        <ModalDelete
                            show={showUserDelModal}
                            handleClose={() => setShowUserDelModal(false)}
                            tableName="usuarios"
                            rowId={deleteItem}
                            idColumn={idColumn}
                            onSuccess={handleSuccess}
                        />
                        <ModalContraseña
                            show={showUserConModal}
                            handleClose={() => setShowUserConModal(false)}
                            rowData={editingItem}
                            onSuccess={handleSuccess}
                            idColumn={idColumn}
                        />
                    </table>
                </div>
            </div>
        </div>
    )
}