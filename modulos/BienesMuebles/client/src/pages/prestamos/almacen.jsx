import React, { useState, useEffect } from 'react';
import { Dropdown, Form, Button, Table, Pagination, Alert, Spinner } from 'react-bootstrap';
import ModalEnviarBienAlmacen from '../Modales/modalEnviarBienAlmacen';
import ModalVerDetallesPrestamo from '../Modales/modalVerDetallesPrestamo';
import { hasPermission, ACTIONS } from '../../data/dataPermissions'

export const Almacen = () => {
    const DEP_ALMACEN_03 = 11; // ID del departamento "Almacén"
    const DEP_ALMACEN_04 = 9; // ID del departamento "Almacén"

    const [data, setData] = useState([]);
    const [departamentos, setDepartamentos] = useState([]); // Para cargar la lista de departamentos
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null);    // Estado de error

    const [refreshKey, setRefreshKey] = useState(0); // Para forzar una recarga de datos

    const [searchText, setSearchText] = useState('');          // Texto en el input de búsqueda
    const [searchType, setSearchType] = useState('pre_ndo');   // 'pre_ndo' | 'bim_cod'
    const [searchQuery, setSearchQuery] = useState({ type: 'pre_ndo', value: '' }); // Estado que dispara la búsqueda

    // Filtros: solo necesitamos el departamento de origen para esta vista
    const [filtros, setFiltros] = useState({
        dep_origen_id: '',   // Cadena vacía para "Todos"
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
        setSelectedPrestamoId(null); // Limpiar el ID seleccionado al cerrar
        setRefreshKey(prevKey => prevKey + 1); // Forzar la recarga de datos de la tabla principal si se hizo una devolución
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

    // --- Cargar datos de préstamos en almacén ---
    useEffect(() => {
        const loadPrestamosEnAlmacen = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = `/api/prestamos/almacen?`;

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

                setData(Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : []);
            } catch (err) {
                console.error('Error al cargar bienes en almacén:', err);
                setError('No se pudieron cargar los bienes en almacén. ' + err.message);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        loadPrestamosEnAlmacen();
    }, [filtros.dep_origen_id, filtros.dep_destino_id, searchQuery, refreshKey]); // Dependencias del useEffect

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
    };

    const handleClearSearch = () => {
        setSearchText('');
        setSearchQuery({ type: searchType, value: '' });
    };

    const handleSearchTypeChange = (newType) => {
        setSearchType(newType);
        // Si hay una búsqueda activa, limpiarla al cambiar el tipo para evitar confusión
        if (searchQuery.value) {
            setSearchText('');
            setSearchQuery({ type: newType, value: '' });
        }
    };

    const handleFiltroChange = (filterName, value) => {
        setFiltros(prev => ({ ...prev, [filterName]: value }));
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
                return <span className="badge bg-label-secondary me-1">Inactivo / Devuelto</span>;
            default:
                return <span className="badge bg-label-dark me-1">Desconocido</span>;
        }
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setRefreshKey(prevKey => prevKey + 1); // Forzar la recarga de la tabla de préstamos
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="py-3 mb-4"><span className="text-muted fw-light">Gestión de Movimientos /</span> Bienes en Almacén</h4>
                {userType !== 1 ? (
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        Registrar Nuevo Bien en Almacén
                        <i className="bx bx-plus-circle ms-1"></i>
                    </Button>) : null}
            </div>

            <div className="card">
                <h5 className="card-header">Relación de Bienes en Almacén (Préstamos con destino a Almacén)</h5>
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
                                    (dep.dep_ide !== 11) && (
                                        <option key={dep.dep_ide} value={dep.dep_ide}>{dep.dep_nom}</option>
                                    )
                                ))}
                            </Form.Select>

                            <Form.Group controlId="filtroDepDestino" style={{ width: '160px', flexShrink: 0 }}>
                                <Form.Label className="visually-hidden">Almacen de Destino</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={filtros.dep_destino_id}
                                    onChange={(e) => handleFiltroChange('dep_destino_id', e.target.value)}
                                >
                                    <option value="">Almacen de Destino</option>
                                    {departamentos
                                        .filter(dep => dep.dep_ide === DEP_ALMACEN_03 || dep.dep_ide === DEP_ALMACEN_04)
                                        .map(dep => (
                                            <option key={dep.dep_ide} value={dep.dep_ide}>
                                                {dep.dep_nom}
                                            </option>
                                        ))}
                                </Form.Control>
                            </Form.Group>

                    </Form>

                    <hr className="my-2 w-100" /> {/* Separador visual */}

                    {/* Tabla de Préstamos */}
                    {loading ? (
                        <div className="text-center my-4">
                            <Spinner animation="border" role="status" className="me-2" />
                            Cargando bienes en almacén...
                        </div>
                    ) : error ? (
                        <Alert variant="danger" className="text-center mt-3">{error}</Alert>
                    ) : (
                        <div className="table-responsive text-nowrap">
                            <Table striped bordered hover className="table">
                                <thead>
                                    <tr>
                                        <th>N° Oficio/Transferencia</th>
                                        <th>Fecha Préstamo</th>
                                        <th>Departamento Origen</th>
                                        {/* La columna de Departamento Destino se elimina */}
                                        <th>Estado</th>
                                        {hasPermission(userType, ACTIONS.JEFE_AREA) && (<th>Acciones</th>)}
                                    </tr>
                                </thead>
                                <tbody className="table-border-bottom-0">
                                    {data.length > 0 ? (
                                        data.map((prestamo) => (
                                            <tr key={prestamo.pre_ide}>
                                                <td><strong>{truncateText(prestamo.pre_ndo)}</strong></td>
                                                <td>{prestamo.pre_fec && new Date(prestamo.pre_fec).toLocaleDateString('es-ES') || 'Sin fecha'}</td>
                                                {/* Usar los nombres que vienen directamente de la API */}
                                                <td>{prestamo.departamento_origen_nombre || 'N/A'}</td>
                                                {/* Se asume que el destino es el almacén, por lo que no se muestra */}
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
                                                                {/* Aquí NO se permite modificar ni borrar préstamos directamente, solo ver/devolver */}
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </td>)}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center">No se encontraron bienes actualmente en el almacén con los filtros aplicados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {/* Aquí iría la paginación si tu endpoint /almacen la soportara */}
                </div>
            </div>
            <ModalEnviarBienAlmacen
                show={showCreateModal}
                handleClose={handleCloseCreateModal}
            />

            <ModalVerDetallesPrestamo
                show={showDetallesModal}
                handleClose={handleCloseDetallesModal}
                prestamoId={selectedPrestamoId}
                onSuccess={() => setRefreshKey(prevKey => prevKey + 1)} // Forzar recarga si se devuelve algo
            />
        </>
    );
};
