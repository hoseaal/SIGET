import React, { useState, useEffect } from 'react';
import { Table, Pagination, Card, Dropdown } from 'react-bootstrap'; 
import moment from 'moment';
import { DetailsModal } from '../Modales/modalDetallesBitacora'; 

export const Bitacora = () => {
    // Estados principales para los datos de la bitácora
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Estados para el Modal de Detalles
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedLogItem, setSelectedLogItem] = useState(null); // Para almacenar el ítem de la fila seleccionada

    // Alias para las columnas de la Bitácora
    const columnAliasBitacora = {
        'bit_id': 'ID',
        'usuario_id': 'ID Usuario',
        'nombre_usuario': 'Nombre',
        'apellido_usuario': 'Apellido',
        'fecha_hora': 'Fecha y Hora',
        'registro_id_afectado': 'Bien Afectado',
        'tipo_cambio': 'Acción',
        'acciones': 'Acciones' // Nuevo alias para la columna de acciones
    };

    // Lista explícita de columnas a mostrar y en qué orden
    const columnsToShow = [
        'bit_id',
        'registro_id_afectado',
        'tipo_cambio',
        'nombre_usuario',
        'apellido_usuario',
        'fecha_hora',
        'acciones' // Nueva columna para las acciones
    ];

    // Cargar datos de Bitacora
    useEffect(() => {
        const loadBitacoraData = async () => {
            setLoading(true);
            setError(null);
            try {
                const processedColumns = columnsToShow.map(originalName => ({
                    originalName: originalName,
                    displayName: columnAliasBitacora[originalName] || originalName,
                }));
                setColumns(processedColumns);

                const res = await fetch(`/api/rrhh/bienes/bitacora?page=${currentPage}&limit=${limit}`, { credentials: 'include' });

                if (!res.ok) {
                    throw new Error(`Error HTTP! estado: ${res.status}`);
                }

                const result = await res.json();
                
                if (result.data && result.meta) {
                    setData(result.data);
                    setTotalItems(result.meta.total);
                    setTotalPages(result.meta.totalPages);
                } else {
                    throw new Error('Formato de respuesta de la API inesperado. Se esperaba { data, meta }.');
                }
                
            } catch (error) {
                console.error('Error cargando la bitácora:', error);
                setError('Error al cargar los datos de la bitácora: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        loadBitacoraData();
    }, [currentPage, limit]);

    // Función para manejar el cambio de página
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Generar los items de paginación
    const renderPaginationItems = () => {
        let items = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                    {number}
                </Pagination.Item>,
            );
        }
        return items;
    };

    const handleViewDetails = (item) => {
        setSelectedLogItem(item);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedLogItem(null);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="ms-2">Cargando bitácora...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger text-center m-4" role="alert">
                <h4 className="alert-heading">¡Error!</h4>
                <p>{error}</p>
                <hr />
                <p className="mb-0">Por favor, intente recargar la página.</p>
            </div>
        );
    }

    return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Administración /</span> Bitácora de Bienes Muebles</h4>
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Bitácora de Bienes Muebles</h5>
                    <Dropdown>
                        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                            Registros por página: {limit}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => { setLimit(10); setCurrentPage(1); }}>10</Dropdown.Item>
                            <Dropdown.Item onClick={() => { setLimit(20); setCurrentPage(1); }}>20</Dropdown.Item>
                            <Dropdown.Item onClick={() => { setLimit(50); setCurrentPage(1); }}>50</Dropdown.Item>
                            <Dropdown.Item onClick={() => { setLimit(100); setCurrentPage(1); }}>100</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Card.Header>
                <div className="table-responsive text-nowrap">
                    <Table striped className="mb-0">
                        <thead>
                            <tr>
                                {columns.map((col, index) => (
                                    <th key={index}>{col.displayName}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={index}>
                                        {columns.map((col) => {
                                            if (col.originalName === 'acciones') {
                                                // Columna de Acciones con Dropdown
                                                return (
                                                    <td key={`${index}-${col.originalName}`}>
                                                        <Dropdown>
                                                            <Dropdown.Toggle variant="secondary" id={`dropdown-acciones-${item.bit_id}`} className="nav-dropdown-dark-example">
                                                                <i className="bx bx-dots-vertical-rounded"></i>
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item href="#" onClick={() => handleViewDetails(item)}>
                                                                    <i className="bx bx-show me-1"></i> Ver Detalles
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </td>
                                                );
                                            } else {
                                                // Resto de las columnas
                                                return (
                                                    <td key={`${index}-${col.originalName}`}>
                                                        {col.originalName === 'fecha_hora' ?
                                                            moment(item[col.originalName]).format('DD/MM/YYYY HH:mm:ss') :
                                                            item[col.originalName] ?? 'N/A'
                                                        }
                                                    </td>
                                                );
                                            }
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center">No hay registros en la bitácora para mostrar.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
                {totalPages > 1 && (
                    <Card.Footer className="d-flex justify-content-center">
                        <Pagination>
                            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                            {renderPaginationItems()}
                            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                            <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                        </Pagination>
                    </Card.Footer>
                )}
            </Card>

            {/* Modal de Detalles */}
            {selectedLogItem && (
                <DetailsModal
                    show={showDetailsModal}
                    onHide={handleCloseDetailsModal}
                    oldData={selectedLogItem.datos_antiguos}
                    newData={selectedLogItem.datos_nuevos}
                />
            )}
        </div>
    );
};