import React, { useState, useEffect } from 'react';
import { Dropdown, Form, Button, Table, Pagination } from 'react-bootstrap';
import ModalRegistrarPrestamo from '../Modales/modalRegistrarPrestamo'; 

export const Prestamos = () => {
    const [data, setData] = useState([]);
    const [departamentos, setDepartamentos] = useState([]); // Para cargar la lista de departamentos
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null);     // Estado de error

    const [refreshKey, setRefreshKey] = useState(0); // Para forzar una recarga de datos

    const [searchOficio, setSearchOficio] = useState(''); // Para el input de búsqueda de oficio
    const [searchQueryOficio, setSearchQueryOficio] = useState(''); // Estado que dispara la búsqueda
    
    // Filtros para departamento de origen y destino
    const [filtros, setFiltros] = useState({
        dep_origen_id: '',   // Cadena vacía para "Todos"
        dep_destino_id: '',  // Cadena vacía para "Todos"
    });

    const [showCreateModal, setShowCreateModal] = useState(false);

    // --- Cargar datos de préstamos normales activos ---
    useEffect(() => {
        const loadPrestamos = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = `/api/prestamos/normales?`;

                // Añadir filtros a la URL
                if (searchQueryOficio) {
                    url += `pre_ndo=${encodeURIComponent(searchQueryOficio)}&`;
                }
                if (filtros.dep_origen_id) {
                    url += `dep_origen_id=${filtros.dep_origen_id}&`;
                }
                if (filtros.dep_destino_id) {
                    url += `dep_destino_id=${filtros.dep_destino_id}&`;
                }
                
                // Eliminar el último '&' si existe
                url = url.endsWith('&') ? url.slice(0, -1) : url;

                const response = await fetch(url, {credentials: 'include'}); // 'include' para enviar cookies de autenticación
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                const result = await response.json();
                
                setData(Array.isArray(result) ? result : []); // Asegúrate de que siempre sea un array
            } catch (err) {
                console.error('Error al cargar préstamos normales:', err);
                setError('No se pudieron cargar los préstamos. ' + err.message);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        loadPrestamos();
    }, [filtros.dep_origen_id, filtros.dep_destino_id, searchQueryOficio, refreshKey]); // Dependencias del useEffect

    // --- Cargar la lista de departamentos para los filtros ---
    useEffect(() => {
        const fetchDepartamentos = async () => {
            try {
                const response = await fetch('/api/departamentos', {credentials: 'include'});
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                const data = await response.json();
                setDepartamentos(data || []);
            } catch (err) {
                console.error('Error al cargar departamentos:', err);
                // Manejar error de carga de departamentos
            }
        };
        fetchDepartamentos();
    }, []);

    // Mapeo de IDs de departamento a nombres para mostrar en la tabla
    const departamentosMap = departamentos.reduce((acc, dep) => {
        acc[dep.dep_ide] = dep.dep_nom;
        return acc;
    }, {});

    // --- Manejadores de eventos ---
    const handleSearchOficio = (e) => {
        e.preventDefault();
        setSearchQueryOficio(searchOficio); // Actualiza el estado que dispara el useEffect
    };

    const handleClearSearch = () => {
        setSearchOficio('');
        setSearchQueryOficio('');
    };

    const handleFiltroChange = (filterName, value) => {
        setFiltros(prev => ({ ...prev, [filterName]: value }));
        // No hay paginación implementada en este ejemplo, así que no se resetea la página
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
        switch(pre_est) {
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

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="py-3 mb-4"><span className="text-muted fw-light">Gestión de Movimientos /</span> Préstamos Normales</h4>
                <Button variant="primary"  onClick={() => setShowCreateModal(true)}>
                    Registrar Nuevo Préstamo
                </Button>
            </div>

            <div className="card">
                <h5 className="card-header">Relación de Préstamos Normales Activos</h5>
                <div className="card-body">
                    {/* Sección de Filtros y Búsqueda */}
                    <Form onSubmit={handleSearchOficio} className="d-flex flex-wrap gap-2 align-items-center mb-4">
                        {/* Input de Búsqueda por Oficio */}
                        <Form.Control
                            type="text"
                            placeholder="Buscar por número de oficio..."
                            value={searchOficio}
                            onChange={(e) => setSearchOficio(e.target.value)}
                            className="flex-grow-1"
                        />
                        <Button type="submit" variant="outline-primary">
                            Buscar
                        </Button>
                        {searchQueryOficio && (
                            <Button type="button" variant="outline-secondary" onClick={handleClearSearch}>
                                Limpiar Búsqueda
                            </Button>
                        )}
                        
                        {/* Filtros Dropdown para Departamentos */}
                        <hr className="my-2 w-100" /> {/* Separador visual */}
                        
                        <Form.Group controlId="filtroDepOrigen" className="flex-grow-1">
                            <Form.Label className="visually-hidden">Departamento Origen</Form.Label>
                            <Form.Control
                                as="select"
                                value={filtros.dep_origen_id}
                                onChange={(e) => handleFiltroChange('dep_origen_id', e.target.value)}
                            >
                                <option value="">Filtrar por Depto. Origen</option>
                                {departamentos.map(dep => (
                                    <option key={dep.dep_ide} value={dep.dep_ide}>{dep.dep_nom}</option>
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
                                <option value="">Filtrar por Depto. Destino</option>
                                {departamentos.map(dep => (
                                    <option key={dep.dep_ide} value={dep.dep_ide}>{dep.dep_nom}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Form>

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
                                        <th>N° Oficio</th>
                                        <th>Fecha Préstamo</th>
                                        <th>Departamento Origen</th>
                                        <th>Departamento Destino</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="table-border-bottom-0">
                                    {data.length > 0 ? (
                                        data.map((prestamo) => (
                                            <tr key={prestamo.pre_ide}>
                                                <td><strong>{truncateText(prestamo.pre_ndo)}</strong></td>
                                                <td>{new Date(prestamo.pre_fec).toLocaleDateString('es-ES')}</td>
                                                <td>{departamentosMap[prestamo.dep_origen_ide] || 'N/A'}</td> {/* Usar dep_origen_ide de ttrpre */}
                                                <td>{departamentosMap[prestamo.dep_ide] || 'N/A'}</td> {/* dep_ide es el departamento de destino */}
                                                <td>{getEstadoPrestamoBadge(prestamo.pre_est)}</td>
                                                <td>
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="secondary" id={`dropdown-${prestamo.pre_ide}`} className="nav-dropdown-dark-example">
                                                            <i className="bx bx-dots-vertical-rounded"></i>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item href="#" onClick={() => console.log('Ver detalles de:', prestamo.pre_ide)}>
                                                                <i className="bx bx-info-circle me-1"></i> Ver Detalles
                                                            </Dropdown.Item>
                                                            {/* Aquí irían otras acciones como "Devolver Préstamo" si pre_est es 1 */}
                                                            {/* <Dropdown.Item href="#">
                                                                <i className="bx bx-undo me-1"></i> Devolver
                                                            </Dropdown.Item> */}
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </td>
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
                    
                    {/* Aquí iría la paginación si tu endpoint /normales la soportara */}
                    {/* <Pagination className="mt-4">
                        <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
                        {[...Array(meta.totalPages)].map((_, i) => (
                            <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => handlePageChange(i + 1)}>
                                {i + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === meta.totalPages} />
                    </Pagination> */}
                </div>
            </div>
             <ModalRegistrarPrestamo
                show={showCreateModal}
                handleClose={handleCloseCreateModal}
            />
        </>
    );
};