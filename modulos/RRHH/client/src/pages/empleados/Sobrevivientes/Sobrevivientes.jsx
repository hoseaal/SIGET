import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { DepartamentoSelect } from '../../layouts/selectInfinito';
import ModalVerPerfil from '../../Modales/ModalVerPerfil';
import RegistrarSobreviviente from './RegistrarSobreviviente';
import EditarSobrevivientes from './EditarSobrevivientes';
import VerFamiliares from './VerFamiliares';

export const Sobrevivientes = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const highlightId = searchParams.get('empleado_id');

    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({});

    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;

    // Estado de modales
    const [perfilItem, setPerfilItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [showRegistro, setShowRegistro] = useState(false);
    const [showPerfil, setShowPerfil] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showVerFamiliares, setShowVerFamiliares] = useState(false);
    const [verFamiliaresId, setVerFamiliaresId] = useState(null);

    const [refreshKey, setRefreshKey] = useState(0);
    const [isRegistering, setIsRegistering] = useState(false);
    const [registroStatus, setRegistroStatus] = useState({ show: false, success: false, message: '' });

    const [filtros, setFiltros] = useState({ departamento: null });
    const [direcciones, setDirecciones] = useState([]);

    // Catálogo de direcciones para el filtro
    useEffect(() => {
        fetch('/api/rrhh/direcciones')
            .then(r => r.json())
            .then(data => setDirecciones(data || []))
            .catch(e => console.error('Error cargando direcciones:', e));
    }, []);

    // Si viene de ModalCambioEstatus con empleado_id, abrir directamente el editor
    useEffect(() => {
        if (highlightId) {
            setEditItem(parseInt(highlightId));
            setShowEdit(true);
        }
    }, [highlightId]);

    // Carga de datos
    useEffect(() => {
        const loadData = async () => {
            try {
                let url = `/api/rrhh/sobrevivientes?page=${page}&limit=${limit}`;

                if (searchQuery) {
                    url += `&search=${encodeURIComponent(searchQuery)}`;
                } else if (filtros.departamento) {
                    url += `&direccion_id=${filtros.departamento}`;
                }

                const response = await fetch(url);
                const result = await response.json();

                if (result.data) {
                    setData(result.data);
                    setMeta(result.pagination || {});
                } else if (Array.isArray(result)) {
                    setData(result);
                    setMeta({});
                }
            } catch (error) {
                console.error('Error cargando sobrevivientes:', error);
                setData([]);
            }
        };

        loadData();
    }, [page, searchQuery, filtros.departamento, refreshKey]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery(search);
        setPage(1);
    };

    const handleClearSearch = () => {
        setSearch('');
        setSearchQuery('');
        setPage(1);
    };

    // Limpiar highlight de la URL al cerrar el editor
    const handleCloseEdit = () => {
        setShowEdit(false);
        if (highlightId) {
            setSearchParams({});
        }
    };

    const handleDeleteSobreviviente = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este registro de sobreviviente? Se eliminarán también los familiares vinculados.')) return;

        try {
            const response = await fetch(`/api/rrhh/sobrevivientes/${id}`, { method: 'DELETE' });
            const result = await response.json();

            if (response.ok) {
                setRegistroStatus({ show: true, success: true, message: 'Sobreviviente eliminado correctamente.' });
                setRefreshKey(prev => prev + 1);
            } else {
                throw new Error(result.error || 'Error al eliminar');
            }
        } catch (error) {
            console.error('Error eliminando:', error);
            setRegistroStatus({ show: true, success: false, message: error.message });
        } finally {
            setTimeout(() => setRegistroStatus(prev => ({ ...prev, show: false })), 3000);
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">Personal /</span> Sobrevivientes
                </h4>
                <button className="btn btn-primary" onClick={() => setShowRegistro(true)}>
                    <i className="bx bx-plus me-1"></i> Registrar Sobreviviente
                </button>
            </div>

            <div className="card">
                <h5 className="card-header">Directorio de Sobrevivientes</h5>
                <div className="card-body">

                    {isRegistering && (
                        <div className="alert alert-info d-flex align-items-center mb-4">
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Procesando datos del Sobreviviente...
                        </div>
                    )}
                    {registroStatus.show && (
                        <div className={`alert alert-${registroStatus.success ? 'success' : 'danger'} mb-4`}>
                            {registroStatus.message}
                        </div>
                    )}

                    {/* BARRA DE BÚSQUEDA */}
                    <form onSubmit={handleSearchSubmit} className="d-flex gap-2 align-items-center mb-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por cédula, nombre o apellido..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Buscar</button>
                        {searchQuery && (
                            <button type="button" className="btn btn-outline-secondary" onClick={handleClearSearch}>
                                Limpiar
                            </button>
                        )}
                        <DepartamentoSelect
                            tipoBien={direcciones}
                            value={filtros.departamento}
                            onChange={(depId) => setFiltros(prev => ({ ...prev, departamento: depId }))}
                        />
                    </form>

                    {/* AVISO CUANDO VIENE DEL MODAL DE CAMBIO DE ESTATUS */}
                    {highlightId && (
                        <div className="alert alert-warning d-flex align-items-center mb-4" style={{
                            borderLeft: '4px solid #ff9800',
                            backgroundColor: '#fff8e1'
                        }}>
                            <i className="bx bx-info-circle me-2 fs-5"></i>
                            <div>
                                <strong>Empleado reasignado como Sobreviviente.</strong>{' '}
                                Registre los datos del familiar sobreviviente en el formulario de edición que se abrió automáticamente.
                            </div>
                        </div>
                    )}

                    {/* TABLA */}
                    <div className="table-responsive text-nowrap">
                        <table className="table table-bordered table-hover table-striped">
                            <thead>
                                <tr>
                                    <th>Cédula</th>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th>Nombre Familiar</th>
                                    <th>Apellido Familiar</th>
                                    <th>Ingreso Beneficio</th>

                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="table-border-bottom-0">
                                {data.length > 0 ? (
                                    data.map((item) => (
                                        <tr
                                            key={item.sobreviviente_id}
                                            style={
                                                highlightId && parseInt(highlightId) === item.sobreviviente_id
                                                    ? {
                                                        backgroundColor: '#fff3cd',
                                                        borderLeft: '4px solid #ffc107',
                                                        transition: 'background-color 0.5s ease'
                                                    }
                                                    : {}
                                            }
                                        >
                                            <td><span className="fw-semibold">{item.cedula}</span></td>
                                            <td>{item.nombres}</td>
                                            <td>{item.apellidos}</td>
                                            <td>{item.familiar_nombres || <span className="text-muted fst-italic">—</span>}</td>
                                            <td>{item.familiar_apellidos || <span className="text-muted fst-italic">—</span>}</td>
                                            <td>
                                                <span className="badge bg-label-info">
                                                    {item.fecha_ingreso_beneficio ? new Date(item.fecha_ingreso_beneficio).toLocaleDateString('es-VE') : <span className="text-muted fst-italic">—</span>}
                                                </span>
                                            </td>

                                            <td>
                                                <Dropdown>
                                                    <Dropdown.Toggle
                                                        variant="secondary"
                                                        id={`dropdown-sobreviviente-${item.sobreviviente_id}`}
                                                        className="nav-dropdown-dark-example btn-sm"
                                                    >
                                                        <i className="bx bx-dots-vertical-rounded"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item href="#" onClick={(e) => {
                                                            e.preventDefault();
                                                            setVerFamiliaresId(item.sobreviviente_id);
                                                            setShowVerFamiliares(true);
                                                        }}>
                                                            <i className="bx bx-group me-1"></i> Ver Familiares
                                                        </Dropdown.Item>
                                                        <Dropdown.Item href="#" onClick={(e) => {
                                                            e.preventDefault();
                                                            setPerfilItem(item.sobreviviente_id);
                                                            setShowPerfil(true);
                                                        }}>
                                                            <i className="bx bx-show me-1"></i> Ver Perfil
                                                        </Dropdown.Item>
                                                        <Dropdown.Item href="#" onClick={(e) => {
                                                            e.preventDefault();
                                                            setEditItem(item.sobreviviente_id);
                                                            setShowEdit(true);
                                                        }}>
                                                            <i className="bx bx-edit-alt me-1"></i> Editar / Familiares
                                                        </Dropdown.Item>
                                                        <Dropdown.Divider />
                                                        <Dropdown.Item href="#" className="text-danger" onClick={(e) => {
                                                            e.preventDefault();
                                                            handleDeleteSobreviviente(item.sobreviviente_id);
                                                        }}>
                                                            <i className="bx bx-trash me-1"></i> Eliminar
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4 text-muted">
                                            No se encontraron sobrevivientes registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN */}
                    {meta.total > 0 && (
                        <>
                            <div className="d-flex justify-content-between align-items-center px-4 pb-3 mt-3">
                                <span className="text-muted small">Total de resultados: {meta.total}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center px-4 pb-3">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                >
                                    ← Anterior
                                </button>
                                <span className="fw-semibold small">Página {page} de {meta.totalPages}</span>
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setPage(prev => Math.min(prev + 1, meta.totalPages))}
                                    disabled={page === meta.totalPages}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* MODALES */}
                <ModalVerPerfil
                    show={showPerfil}
                    handleClose={() => setShowPerfil(false)}
                    empleado_id={perfilItem}
                    tipo="sobreviviente"
                />

                <RegistrarSobreviviente
                    show={showRegistro}
                    handleClose={() => setShowRegistro(false)}
                    onSaveStart={() => {
                        setShowRegistro(false);
                        setIsRegistering(true);
                        setRegistroStatus({ show: false, success: false, message: '' });
                    }}
                    onSaveEnd={(success, msg) => {
                        setIsRegistering(false);
                        setRegistroStatus({ show: true, success, message: msg });
                        if (success) setRefreshKey(prev => prev + 1);
                        setTimeout(() => setRegistroStatus(prev => ({ ...prev, show: false })), 4000);
                    }}
                />

                <EditarSobrevivientes
                    show={showEdit}
                    handleClose={handleCloseEdit}
                    sobreviviente_id={editItem}
                    fromStatusChange={!!highlightId}
                    onSaveStart={() => {
                        setShowEdit(false);
                        setIsRegistering(true);
                        setRegistroStatus({ show: false, success: false, message: '' });
                    }}
                    onSaveEnd={(success, msg) => {
                        setIsRegistering(false);
                        setRegistroStatus({ show: true, success, message: msg });
                        if (success) {
                            setRefreshKey(prev => prev + 1);
                            setEditItem(null);
                            if (highlightId) setSearchParams({});
                        }
                        setTimeout(() => setRegistroStatus(prev => ({ ...prev, show: false })), 4000);
                    }}
                />

                <VerFamiliares
                    show={showVerFamiliares}
                    handleClose={() => setShowVerFamiliares(false)}
                    sobreviviente_id={verFamiliaresId}
                />
            </div>
        </>
    );
};
