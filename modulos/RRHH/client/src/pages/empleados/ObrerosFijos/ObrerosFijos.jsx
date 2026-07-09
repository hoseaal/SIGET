import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { DepartamentoSelect } from '../../layouts/selectInfinito';
import ModalAntiguedades from '../../Modales/ModalAntiguedades';
import { RegistrarObrero } from './RegistrarObrero';
import { EditarObrero } from './EditarObrero';
import ModalVerPerfil from '../../Modales/ModalVerPerfil';
import ModalCargaFamiliar from '../../Modales/modalCargaFamiliar';
import ModalCambioEstatus from '../../Modales/ModalCambioEstatus';

export const ObrerosFijos = () => {
    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({});

    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;

    // Modales
    const [antItem, setAntItem] = useState(null);
    const [perfilItem, setPerfilItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [showAnt, setShowAnt] = useState(false);
    const [showRegistro, setShowRegistro] = useState(false);
    const [showPerfil, setShowPerfil] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showCarga, setShowCarga] = useState(false);
    const [cargaItem, setCargaItem] = useState(null);

    const [showEstatus, setShowEstatus] = useState(false);
    const [estatusItem, setEstatusItem] = useState(null);

    const [refreshKey, setRefreshKey] = useState(0);
    const [isRegistering, setIsRegistering] = useState(false);
    const [registroStatus, setRegistroStatus] = useState({ show: false, success: false, message: '' });

    const [filtros, setFiltros] = useState({ departamento: null });
    const [direccion, setDireccion] = useState([]);

    // Carga inicial de catálogo de direcciones para filtro
    useEffect(() => {
        const fetchDirecciones = async () => {
            try {
                const res = await fetch('/api/rrhh/direcciones');
                const data = await res.json();
                setDireccion(data || []);
            } catch (e) {
                console.error('Error cargando direcciones:', e);
            }
        };
        fetchDirecciones();
    }, []);

    // Carga de datos de Obreros Fijos — apunta a /api/rrhh/obreros
    useEffect(() => {
        const loadData = async () => {
            try {
                let url = `/api/rrhh/obreros?page=${page}&limit=${limit}&estatus_id=1`;

                if (searchQuery) {
                    url += `&search=${encodeURIComponent(searchQuery)}`;
                } else if (filtros.departamento) {
                    url += `&dep=${filtros.departamento}`;
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
                console.error('Error cargando obreros:', error);
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

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="py-3 mb-4"><span className="text-muted fw-light">Personal /</span> Obreros Fijos</h4>
                <button className="btn btn-primary" onClick={() => setShowRegistro(true)}>
                    <i className="bx bx-plus me-1"></i> Registrar Nuevo Obrero
                </button>
            </div>

            <div className="card">
                <h5 className="card-header">Directorio de Obreros Fijos</h5>
                <div className="card-body">

                    {isRegistering && (
                        <div className="alert alert-info d-flex align-items-center mb-4">
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Procesando datos del obrero...
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
                            placeholder="Buscar obrero por cédula, nombre o apellido..."
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
                            tipoBien={direccion}
                            value={filtros.departamento}
                            onChange={(depId) => setFiltros(prev => ({ ...prev, departamento: depId }))}
                        />
                    </form>

                    {/* TABLA */}
                    <div className="table-responsive text-nowrap">
                        <table className="table table-bordered table-hover table-striped">
                            <thead>
                                <tr>
                                    <th>Cédula</th>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th>Cargo CET</th>
                                    <th>Cargo ONAPRE</th>
                                    <th>Dirección</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="table-border-bottom-0">
                                {data.length > 0 ? (
                                    data.map((item) => (
                                        <tr key={item.empleado_id}>
                                            <td><span className="fw-semibold">{item.cedula}</span></td>
                                            <td>{item.nombres}</td>
                                            <td>{item.apellidos}</td>
                                            <td>
                                                <span className="badge bg-label-info">{item.cargo_cet_nombre || <span className="text-muted fst-italic">—</span>}</span>
                                            </td>
                                            <td>
                                                <span className="badge bg-label-secondary">{item.cargo_onapre_nombre || <span className="text-muted fst-italic">—</span>}</span>
                                            </td>
                                            <td>
                                                {item.direccion_nombre || (
                                                    <span className="text-muted fst-italic">Sin asignar</span>
                                                )}
                                            </td>
                                            <td>
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="secondary" id={`dropdown-obrero-${item.empleado_id}`} className="nav-dropdown-dark-example btn-sm">
                                                        <i className="bx bx-dots-vertical-rounded"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item href="#" onClick={(e) => {
                                                            e.preventDefault();
                                                            setPerfilItem(item.empleado_id);
                                                            setShowPerfil(true);
                                                        }}>
                                                            <i className="bx bx-show me-1"></i> Ver Perfil
                                                        </Dropdown.Item>
                                                        <Dropdown.Item href="#" onClick={() => {
                                                            setAntItem(item);
                                                            setShowAnt(true);
                                                        }}>
                                                            <i className="bx bx-calendar me-1"></i> Registro de Antigüedades
                                                        </Dropdown.Item>
                                                        <Dropdown.Item href="#" onClick={(e) => {
                                                            e.preventDefault();
                                                            setCargaItem(item.empleado_id);
                                                            setShowCarga(true);
                                                        }}>
                                                            <i className="bx bx-group me-1"></i> Carga Familiar
                                                        </Dropdown.Item>
                                                        <Dropdown.Item href="#" onClick={(e) => {
                                                            e.preventDefault();
                                                            setEditItem(item.empleado_id);
                                                            setShowEdit(true);
                                                        }}>
                                                            <i className="bx bx-edit-alt me-1"></i> Editar
                                                        </Dropdown.Item>

                                                        <Dropdown.Item href="#" onClick={(e) => {
                                                            e.preventDefault();
                                                            setEstatusItem(item);
                                                            setShowEstatus(true);
                                                        }}>
                                                            <i className="bx bx-transfer me-1"></i> Cambiar Estatus
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">
                                            No se encontraron obreros fijos activos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN */}
                    {meta.totalItems > 0 && (
                        <>
                            <div className="d-flex justify-content-between align-items-center px-4 pb-3 mt-3">
                                <span className="text-muted small">{`Total de resultados: ${meta.totalItems}`}</span>
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

                <ModalAntiguedades
                    show={showAnt}
                    handleClose={() => setShowAnt(false)}
                    empleado_id={antItem?.empleado_id}
                />
                <ModalVerPerfil
                    show={showPerfil}
                    handleClose={() => setShowPerfil(false)}
                    empleado_id={perfilItem}
                    tipo="obrero"
                />
                <ModalCargaFamiliar
                    show={showCarga}
                    handleClose={() => setShowCarga(false)}
                    empleado_id={cargaItem}
                />
                <RegistrarObrero
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
                <EditarObrero
                    show={showEdit}
                    handleClose={() => setShowEdit(false)}
                    empleado_id={editItem}
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
                        }
                        setTimeout(() => setRegistroStatus(prev => ({ ...prev, show: false })), 4000);
                    }}
                />
                <ModalCambioEstatus 
                    show={showEstatus} 
                    handleClose={() => setShowEstatus(false)} 
                    empleado={estatusItem}
                />
            </div>

        </>
    );
};