import React, { useState, useEffect } from 'react';
import { Dropdown, Form, Button, Table, Pagination } from 'react-bootstrap';
import ModalRegistrarPrestamo from '../Modales/modalRegistrarPrestamo'; 
import ModalVerDetallesPrestamo from '../Modales/modalVerDetallesPrestamo';
import { hasPermission, ACTIONS } from '../../data/dataPermissions'

const ITEMS_PER_PAGE = 10;

export const Prestamos = () => {
    const [data, setData] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });

    const [searchOficio, setSearchOficio] = useState('');
    const [searchQueryOficio, setSearchQueryOficio] = useState('');
    
    const [filtros, setFiltros] = useState({
        dep_origen_id: '',
        dep_destino_id: '',
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
        setSelectedPrestamoId(null);
    };

    const [userType, setUserType] = useState(null);
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
                if (!userRes.ok) throw new Error('No autorizado.');
                const userDataResult = await userRes.json();
                if (!userDataResult.success) throw new Error(userDataResult.message || 'Error desconocido al verificar usuario.');
                setUserType(userDataResult.user.usu_tip);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    // --- Cargar datos de préstamos normales paginados ---
    useEffect(() => {
        const loadPrestamos = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                params.append('page', currentPage);
                params.append('limit', ITEMS_PER_PAGE);
                if (searchQueryOficio) params.append('pre_ndo', searchQueryOficio);
                if (filtros.dep_origen_id) params.append('dep_origen_id', filtros.dep_origen_id);
                if (filtros.dep_destino_id) params.append('dep_destino_id', filtros.dep_destino_id);

                const response = await fetch(`/api/prestamos/normales/pagina?${params.toString()}`, { credentials: 'include' });
                if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
                const result = await response.json();

                setData(Array.isArray(result.data) ? result.data : []);
                setMeta(result.meta || { total: 0, totalPages: 1, page: 1 });
            } catch (err) {
                console.error('Error al cargar préstamos normales:', err);
                setError('No se pudieron cargar los préstamos. ' + err.message);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        loadPrestamos();
    }, [filtros.dep_origen_id, filtros.dep_destino_id, searchQueryOficio, refreshKey, showDetallesModal, currentPage]);

    // --- Cargar la lista de departamentos para los filtros ---
    useEffect(() => {
        const fetchDepartamentos = async () => {
            try {
                const response = await fetch('/api/departamentos', { credentials: 'include' });
                if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
                const result = await response.json();
                setDepartamentos(Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : []);
            } catch (err) {
                console.error('Error al cargar departamentos:', err);
            }
        };
        fetchDepartamentos();
    }, []);

    // --- Manejadores de eventos ---
    const handleSearchOficio = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Resetear a página 1 al buscar
        setSearchQueryOficio(searchOficio);
    };

    const handleClearSearch = () => {
        setSearchOficio('');
        setSearchQueryOficio('');
        setCurrentPage(1);
    };

    const handleFiltroChange = (filterName, value) => {
        setCurrentPage(1); // Resetear a página 1 al cambiar filtros
        setFiltros(prev => ({ ...prev, [filterName]: value }));
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= meta.totalPages) {
            setCurrentPage(page);
        }
    };

    // --- Funciones de Utilidad para la UI ---
    const truncateText = (text, maxLength = 30) => {
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;
        return (<span title={text}>{`${text.substring(0, maxLength)}...`}</span>);
    };

    const getEstadoPrestamoBadge = (pre_est) => {
        switch(pre_est) {
            case 1: return <span className="badge bg-label-success me-1">Activo</span>;
            case 0: return <span className="badge bg-label-secondary me-1">Inactivo</span>;
            default: return <span className="badge bg-label-dark me-1">Desconocido</span>;
        }
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setCurrentPage(1);
        setRefreshKey(prevKey => prevKey + 1);
    };

    // --- Renderizar controles de paginación ---
    const renderPagination = () => {
        if (!meta || meta.totalPages <= 1) return null;

        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(meta.totalPages, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let p = startPage; p <= endPage; p++) {
            pages.push(p);
        }

        return (
            <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">
                    Mostrando {data.length} de {meta.total} préstamos · Página {meta.page} de {meta.totalPages}
                </small>
                <Pagination size="sm" className="mb-0">
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {startPage > 1 && <><Pagination.Item onClick={() => handlePageChange(1)}>1</Pagination.Item><Pagination.Ellipsis disabled /></>}
                    {pages.map(p => (
                        <Pagination.Item key={p} active={p === currentPage} onClick={() => handlePageChange(p)}>{p}</Pagination.Item>
                    ))}
                    {endPage < meta.totalPages && <><Pagination.Ellipsis disabled /><Pagination.Item onClick={() => handlePageChange(meta.totalPages)}>{meta.totalPages}</Pagination.Item></>}
                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === meta.totalPages} />
                </Pagination>
            </div>
        );
    };

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
                    <Form onSubmit={handleSearchOficio} className="d-flex flex-wrap gap-2 align-items-center mb-4">
                        <div className=" d-flex gap-3 align-items-center"> 
                        <Form.Control
                            type="text"
                            placeholder="Buscar por número de oficio..."
                            value={searchOficio}
                            onChange={(e) => setSearchOficio(e.target.value)}
                            className="flex-grow-5"
                        />
                        <Button type="submit" variant="outline-primary">
                            Buscar
                        </Button>
                        {searchQueryOficio && (
                            <Button type="button" variant="outline-secondary" onClick={handleClearSearch}>
                                Limpiar
                            </Button>
                        )}

                        <Form.Group controlId="filtroDepOrigen" className="flex-grow-1">
                            <Form.Label className="visually-hidden">Departamento Origen</Form.Label>
                            <Form.Control
                                as="select"
                                value={filtros.dep_origen_id}
                                onChange={(e) => handleFiltroChange('dep_origen_id', e.target.value)}
                            >
                                <option value="">Departamento Origen</option>
                                {departamentos.map(dep => (
                                    (dep.dep_ide !== parseInt(filtros.dep_destino_id) && dep.dep_ide !== 11) && ( 
                                        <option key={dep.dep_ide} value={dep.dep_ide}>{dep.dep_nom}</option>
                                    )
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="filtroDepDestino" className="flex-grow-1">
                            <Form.Label className="visually-hidden">Departamento Destino</Form.Label>
                            <Form.Control
                                as="select"
                                value={filtros.dep_destino_id}
                                onChange={(e) => handleFiltroChange('dep_destino_id', e.target.value)}
                            >
                                <option value="">Departamento Destino</option>
                                {departamentos.map(dep => (
                                    (dep.dep_ide !== parseInt(filtros.dep_origen_id) && dep.dep_ide !== 11) && (
                                        <option key={dep.dep_ide} value={dep.dep_ide}>{dep.dep_nom}</option>
                                    )
                                ))}
                            </Form.Control>
                        </Form.Group>
                        </div>
                    </Form>
                        
                        <hr className="my-2 w-100" />
                        
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
                                        {hasPermission(userType, ACTIONS.VIEW_LOAN_DETAILS) && ( <th>Acciones</th>)}
                                    </tr>
                                </thead>
                                <tbody className="table-border-bottom-0">
                                    {data.length > 0 ? (
                                        data.map((prestamo) => (
                                            <tr key={prestamo.pre_ide}>
                                                <td><strong>{truncateText(prestamo.pre_ndo)}</strong></td>
                                                <td>{prestamo.pre_fec && new Date(prestamo.pre_fec).toLocaleDateString('es-ES') || 'Sin Fecha'}</td>
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
                    
                    {/* Controles de Paginación */}
                    {!loading && !error && renderPagination()}
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