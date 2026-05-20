import React, { useState, useEffect } from 'react';
import { Dropdown, Form, Button, Table, Pagination } from 'react-bootstrap';
import ModalRegistrarPrestamo from '../Modales/modalRegistrarPrestamo';
import ModalVerDetallesPrestamo from '../Modales/modalVerDetallesPrestamo';
import { hasPermission, ACTIONS } from '../../data/dataPermissions'

export const Prestamos = () => {
    const [data, setData] = useState([]);
    const [departamentos, setDepartamentos] = useState([]); // Para cargar la lista de departamentos
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null);     // Estado de error

    const [refreshKey, setRefreshKey] = useState(0); // Para forzar una recarga de datos
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({});

    const [searchText, setSearchText] = useState('');          // Texto en el input de búsqueda
    const [searchType, setSearchType] = useState('pre_ndo');   // 'pre_ndo' | 'bim_cod'
    const [searchQuery, setSearchQuery] = useState({ type: 'pre_ndo', value: '' }); // Estado que dispara la búsqueda

    // Filtros para departamento de origen y destino
    const [filtros, setFiltros] = useState({
        dep_origen_id: '',   // Cadena vacía para "Todos"
        dep_destino_id: '',  // Cadena vacía para "Todos"
    });

    const [showCreateModal, setShowCreateModal] = useState(false);

    const [showDetallesModal, setShowDetallesModal] = useState(false);
    const [selectedPrestamoId, setSelectedPrestamoId] = useState(null);

    const handleVerDetalles = (prestamoId) => {
        setSelectedPrestamoId(prestamoId);
        setShowDetallesModal(true);
    };

    const handleCloseDetallesModal = () => {
        setShowDetallesModal(false);
        setSelectedPrestamoId(null); // Limpiar el ID seleccionado al cerrar
    };
    const [userType, setUserType] = useState(null);
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
                if (!userRes.ok) throw new Error('No autorizado.');
                const userDataResult = await userRes.json();
                if (!userDataResult.success) throw new Error(userDataResult.message || 'Error desconocido al verificar usuario.');

                const currentUserType = userDataResult.user.usu_tip;
                setUserType(currentUserType);
                setFilteredMenuData(filterMenuByUserType(menuData, currentUserType));
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    // --- Cargar datos de préstamos normales activos ---
    useEffect(() => {
        const loadPrestamos = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = `/api/prestamos/normales/pagina?page=${page}&limit=10&`;

                // Añadir filtros a la URL
                if (searchQuery.value) {
                    if (searchQuery.type === 'pre_ndo') {
                        url += `pre_ndo=${encodeURIComponent(searchQuery.value)}&`;
                    } else if (searchQuery.type === 'bim_cod') {
                        url += `bim_cod=${encodeURIComponent(searchQuery.value)}&`;
                    }
                }
                if (filtros.dep_origen_id) {
                    url += `dep_origen_id=${filtros.dep_origen_id}&`;
                }
                if (filtros.dep_destino_id) {
                    url += `dep_destino_id=${filtros.dep_destino_id}&`;
                }

                // Eliminar el último '&' si existe
                url = url.endsWith('&') ? url.slice(0, -1) : url;

                const response = await fetch(url, { credentials: 'include' }); // 'include' para enviar cookies de autenticación
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                const result = await response.json();

                setData(Array.isArray(result.data) ? result.data : []);
                setMeta(result.meta || {});
            } catch (err) {
                console.error('Error al cargar préstamos normales:', err);
                setError('No se pudieron cargar los préstamos. ' + err.message);
                setData([]);
                setMeta({});
            } finally {
                setLoading(false);
            }
        };

        loadPrestamos();
    }, [page, filtros.dep_origen_id, filtros.dep_destino_id, searchQuery, refreshKey, showDetallesModal]); // Dependencias del useEffectl useEffect

    // --- Cargar la lista de departamentos para los filtros ---
    useEffect(() => {
        const fetchDepartamentos = async () => {
            try {
                const response = await fetch('/api/departamentos', { credentials: 'include' });
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                const result = await response.json();
                // Aquí también aplica el .data si tu API lo requiere
                setDepartamentos(Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : []);
            } catch (err) {
                console.error('Error al cargar departamentos:', err);
                // Manejar error de carga de departamentos
            }
        };
        fetchDepartamentos();
    }, []);

    // --- Manejadores de eventos ---
    const handleSearch = (e) => {
        e.preventDefault();
        setSearchQuery({ type: searchType, value: searchText.trim() });
        setPage(1);
    };

    const handleClearSearch = () => {
        setSearchText('');
        setSearchQuery({ type: searchType, value: '' });
        setPage(1);
    };

    const handleSearchTypeChange = (newType) => {
        setSearchType(newType);
        // Si hay una búsqueda activa, limpiarla al cambiar el tipo para evitar confusión
        if (searchQuery.value) {
            setSearchText('');
            setSearchQuery({ type: newType, value: '' });
            setPage(1);
        }
    };

    const handleFiltroChange = (filterName, value) => {
        setFiltros(prev => ({ ...prev, [filterName]: value }));
        setPage(1);
    };

    // --- Funciones de Utilidad para la UI ---
    const truncateText = (text, maxLength = 30) => {
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;

        return (
            <span title={text}>
                {`${text.substring(0, maxLength)}...`}
            </span>
        );
    };

    // Función para obtener el badge del estado del préstamo
    const getEstadoPrestamoBadge = (pre_est) => {
        switch (pre_est) {
            case 1:
                return <span className="badge bg-label-success me-1">Activo</span>;
            case 0:
                return <span className="badge bg-label-secondary me-1">Inactivo</span>;
            default:
                return <span className="badge bg-label-dark me-1">Desconocido</span>;
        }
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setRefreshKey(prevKey => prevKey + 1); // Forzar la recarga de la tabla de préstamos
    };

    // console.log(data) // Mantener para depuración si es necesario

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="py-3 mb-4"><span className="text-muted fw-light">Gestión de Movimientos /</span> Préstamos</h4>
                {userType !== 1 ? (
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        Registrar Nuevo Prestamo
                        <i className="bx bx-plus-circle ms-1"></i>
                    </Button>) : null}
            </div>

            <div className="card">
                <h5 className="card-header">Relación de Préstamos Normales Activos</h5>
                <div className="card-body">
                    {/* Sección de Filtros y Búsqueda */}
                    <Form onSubmit={handleSearch} className="d-flex align-items-center gap-2 mb-4">

                            {/* Selector de tipo de búsqueda + input en grupo */}
                            <div className="input-group flex-grow-1" style={{ minWidth: 0 }}>
                                <select
                                    className="form-select flex-grow-0"
                                    style={{ width: '130px' }}
                                    value={searchType}
                                    onChange={(e) => handleSearchTypeChange(e.target.value)}
                                    title="Selecciona el criterio de búsqueda"
                                >
                                    <option value="pre_ndo">N° Oficio</option>
                                    <option value="bim_cod">N° de Bien</option>
                                </select>
                                <Form.Control
                                    type="text"
                                    placeholder={searchType === 'pre_ndo' ? 'Buscar por número de oficio...' : 'Buscar por código de bien...'}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>

                            <Button type="submit" variant="outline-primary" disabled={!searchText.trim()} className="flex-shrink-0">
                                <i className="bx bx-search me-1"></i>Buscar
                            </Button>
                            {searchQuery.value && (
                                <Button type="button" variant="outline-secondary" className="flex-shrink-0" onClick={handleClearSearch}>
                                    <i className="bx bx-x"></i>
                                </Button>
                            )}

                            {/* Badge informativo si hay búsqueda activa */}
                            {searchQuery.value && (
                                <span className="badge bg-label-primary text-nowrap flex-shrink-0">
                                    {searchQuery.type === 'pre_ndo' ? 'Oficio' : 'N° Bien'}: <strong>{searchQuery.value}</strong>
                                </span>
                            )}

                            <Form.Select
                                value={filtros.dep_origen_id}
                                onChange={(e) => handleFiltroChange('dep_origen_id', e.target.value)}
                                style={{ width: '160px', flexShrink: 0 }}
                                title="Departamento Origen"
                            >
                                <option value="">Dep. Origen</option>
                                {departamentos.map(dep => (
                                    (dep.dep_ide !== parseInt(filtros.dep_destino_id) && dep.dep_ide !== 11) && (
                                        <option key={dep.dep_ide} value={dep.dep_ide}>{dep.dep_nom}</option>
                                    )
                                ))}
                            </Form.Select>

                            <Form.Select
                                value={filtros.dep_destino_id}
                                onChange={(e) => handleFiltroChange('dep_destino_id', e.target.value)}
                                style={{ width: '160px', flexShrink: 0 }}
                                title="Departamento Destino"
                            >
                                <option value="">Dep. Destino</option>
                                {departamentos.map(dep => (
                                    (dep.dep_ide !== parseInt(filtros.dep_origen_id) && dep.dep_ide !== 11) && (
                                        <option key={dep.dep_ide} value={dep.dep_ide}>{dep.dep_nom}</option>
                                    )
                                ))}
                            </Form.Select>

                    </Form>

                    <hr className="my-2 w-100" /> {/* Separador visual */}



                    {/* Tabla de Préstamos */}
                    {loading ? (
                        <div className="text-center">Cargando préstamos...</div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">{error}</div>
                    ) : (
                        <div className="table-responsive text-nowrap">
                            <Table striped bordered hover className="table">
                                <thead>
                                    <tr>
                                        <th>N° Oficio/Transferencia</th>
                                        <th>Fecha Préstamo</th>
                                        <th>Departamento Origen</th>
                                        <th>Departamento Destino</th>
                                        <th>Estado</th>
                                        {hasPermission(userType, ACTIONS.VIEW_LOAN_DETAILS) && (<th>Acciones</th>)}
                                    </tr>
                                </thead>
                                <tbody className="table-border-bottom-0">
                                    {data.length > 0 ? (
                                        data.map((prestamo) => (
                                            <tr key={prestamo.pre_ide}>
                                                <td><strong>{truncateText(prestamo.pre_ndo)}</strong></td>
                                                <td>{prestamo.pre_fec && new Date(prestamo.pre_fec).toLocaleDateString('es-ES') || 'Sin Fecha'}</td>
                                                {/* Usar los nombres que vienen directamente de la API */}
                                                <td>{prestamo.departamento_origen_nombre || 'N/A'}</td>
                                                <td>{prestamo.departamento_destino_nombre || 'N/A'}</td>
                                                <td>{getEstadoPrestamoBadge(prestamo.pre_est)}</td>
                                                {hasPermission(userType, ACTIONS.VIEW_LOAN_DETAILS) && (
                                                    <td>
                                                        <Dropdown>
                                                            <Dropdown.Toggle variant="secondary" id={`dropdown-${prestamo.pre_ide}`} className="nav-dropdown-dark-example">
                                                                <i className="bx bx-dots-vertical-rounded"></i>
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item href="#" onClick={() => handleVerDetalles(prestamo.pre_ide)}>
                                                                    <i className="bx bx-info-circle me-1"></i> Ver Detalles y Devolver
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </td>)}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">No se encontraron préstamos normales activos con los filtros aplicados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {/* Dynamic Pagination Bar */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-3 bg-light border-top rounded-bottom mt-4">
                        <div className="text-muted small">
                            {meta.total > 0 ? (
                                <span>
                                    Mostrando <strong>{((page - 1) * 10) + 1}</strong> a{' '}
                                    <strong>{Math.min(page * 10, meta.total)}</strong> de{' '}
                                    <strong>{meta.total}</strong> préstamos
                                </span>
                            ) : (
                                <span>No hay resultados</span>
                            )}
                        </div>
                        <nav aria-label="Navegación de páginas">
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button
                                        type="button"
                                        className="page-link d-flex align-items-center"
                                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                        aria-label="Anterior"
                                    >
                                        <i className="bx bx-chevron-left me-1"></i> Anterior
                                    </button>
                                </li>
                                
                                {Array.from({ length: meta.totalPages || 1 }, (_, i) => i + 1).map((p) => {
                                    const totalPages = meta.totalPages || 1;
                                    if (totalPages > 6) {
                                        if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                                            return (
                                                <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                                    <button type="button" className="page-link" onClick={() => setPage(p)}>
                                                        {p}
                                                    </button>
                                                </li>
                                            );
                                        } else if ((p === 2 && page > 3) || (p === totalPages - 1 && page < totalPages - 2)) {
                                            return (
                                                <li key={p} className="page-item disabled">
                                                    <span className="page-link">...</span>
                                                </li>
                                            );
                                        }
                                        return null;
                                    }
                                    return (
                                        <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                            <button type="button" className="page-link" onClick={() => setPage(p)}>
                                                {p}
                                            </button>
                                        </li>
                                    );
                                })}

                                <li className={`page-item ${page === (meta.totalPages || 1) ? 'disabled' : ''}`}>
                                    <button
                                        type="button"
                                        className="page-link d-flex align-items-center"
                                        onClick={() => setPage(prev => Math.min(prev + 1, meta.totalPages || prev + 1))}
                                        aria-label="Siguiente"
                                    >
                                        Siguiente <i className="bx bx-chevron-right ms-1"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            <ModalRegistrarPrestamo
                show={showCreateModal}
                handleClose={handleCloseCreateModal}
            />

            <ModalVerDetallesPrestamo
                show={showDetallesModal}
                handleClose={handleCloseDetallesModal}
                prestamoId={selectedPrestamoId}
            />
        </>
    );
};
