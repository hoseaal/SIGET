import React, { useState, useEffect, useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import { getTableMetadata } from '../../data/fetchData';
import ModalInsert from '../Modales/modalInsert';
import ModalUpdate from '../Modales/modalUpdate';
import ModalDelete from '../Modales/modalDelete';


export const ModelosyMarcas = () => {
    // Estado para Marcas
    const [columns, setColumns] = useState([]);
    const [idColumn, setIdColumn] = useState(null);
    const [data, setData] = useState([]);
    const [showMarcasModal, setShowMarcasModal] = useState(false);
    const [showMarcasUpModal, setShowMarcasUpModal] = useState(false);
    const [showMarcasDelModal, setShowMarcasDelModal] = useState(false);

    //Alias para categorías

    const columnAliasMarcas = {
        'mar_ide': 'Código',
        'mar_mar': 'Marca'
    };

    // Estado para Modelos
    const [columns2, setColumns2] = useState([]);
    const [idColumn2, setIdColumn2] = useState(null);
    const [data2, setData2] = useState([]);
    const [showModModal, setShowModModal] = useState(false);
    const [showModUpModal, setShowModUpModal] = useState(false);
    const [showModDelModal, setShowModDelModal] = useState(false);

    //Alias para SubCategorías

    const columnAliasMod = {
        'mod_ide': 'Código',
        'mod_mod': 'Modelo',
        'mar_ide': 'Marca'
    };

    const [refreshKey, setRefreshKey] = useState(0);

     const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    

        const handleSuccess = () => {
            setRefreshKey(prev => prev + 1); // Fuerza recarga
        };

    // Estados para paginación y búsqueda: Marcas
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Estados para paginación y búsqueda: Modelos
    const [meta2, setMeta2] = useState({});
    const [page2, setPage2] = useState(1);
    const [search2, setSearch2] = useState('');
    const [searchQuery2, setSearchQuery2] = useState('');

    // Estado para traducción de marcas (unpaginated map)
    const [MarcasMap, setMarcasMap] = useState({});

    // Cargar mapa de marcas (unpaginated) para que las traducciones de ID a nombre siempre funcionen
    useEffect(() => {
        const loadMarcasMap = async () => {
          try {
            const res = await fetch('/api/marcas', { credentials: 'include' });
            const result = await res.json();
            const marMap = result.reduce((acc, mar) => {
              acc[mar.mar_ide] = mar.mar_mar;
              return acc;
            }, {});
            setMarcasMap(marMap);
          } catch (error) {
            console.error('Error cargando marcas para mapa:', error);
          }
        };
        loadMarcasMap();
    }, [refreshKey]);

    // Cargar columnas y datos de Marca (paginado)
    useEffect(() => {
        const loadCatData = async () => {
          try {
            const { columns, primaryKey } = await getTableMetadata('tmamar');
            setColumns(columns.map(col => ({
              originalName: col.name,
              displayName: columnAliasMarcas[col.name] || col.name,
              isPrimaryKey: col.name === primaryKey
            })));
            setIdColumn(primaryKey);

            const url = `/api/marcas?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`;
            const res = await fetch(url, { credentials: 'include' });
            const result = await res.json();
            setData(Array.isArray(result.data) ? result.data : []);
            setMeta(result.meta || {});
          } catch (error) {
            console.error('Error cargando marcas:', error);
            setData([]);
            setMeta({});
          }
        };
        loadCatData();
    }, [refreshKey, page, searchQuery]);
    
    // Cargar columnas de Modelo (paginado)
    useEffect(() => {
        const loadModelosData = async () => {
          try {
            const { columns, primaryKey } = await getTableMetadata('tesmod');
            setColumns2(columns.map(col => ({
              originalName: col.name,
              displayName: columnAliasMod[col.name] || col.name,
              isPrimaryKey: col.name === primaryKey
            })));
            setIdColumn2(primaryKey);

            const url = `/api/modelos?page=${page2}&limit=10&search=${encodeURIComponent(searchQuery2)}`;
            const res = await fetch(url, { credentials: 'include' });
            const result = await res.json();
            setData2(Array.isArray(result.data) ? result.data : []);
            setMeta2(result.meta || {});
          } catch (error) {
            console.error('Error cargando modelos:', error);
            setData2([]);
            setMeta2({});
          }
        };
        loadModelosData();
    }, [refreshKey, page2, searchQuery2]);


   return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración General /</span> Modelos y Marcas</h4>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Marcas</h5>
                    <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => setShowMarcasModal(true)}
                    >
                    Agregar Marca
                    </button>
                </div>
                <ModalInsert
                    show={showMarcasModal}
                    handleClose={() => setShowMarcasModal(false)}
                    columns={columns}
                    tableName="tmamar"
                    onSuccess={handleSuccess}
                />
                <div className="table-responsive text-nowrap">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setSearchQuery(search); // Solo dispara búsqueda cuando se presiona el botón
                            setPage(1);
                        }}
                        className="p-3 d-flex gap-2 align-items-center"
                    >
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar marca..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn btn-outline-primary">
                            Buscar
                        </button>
                        {search && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setSearch('');
                                    setSearchQuery('');
                                    setPage(1);
                                }}
                            >
                                Limpiar
                            </button>
                        )}
                    </form>
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
                                        {item[col.originalName.toLowerCase()] ?? 'N/A'}
                                    </td>
                                ))}
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic" className="nav-dropdown-dark-example">
                                <i className="bx bx-dots-vertical-rounded"></i>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item href="#"  onClick={() => {
                                    setEditingItem(item); // Guarda el item que se va a editar
                                    setShowMarcasUpModal(true); // Abre el modal
                                }}>
                                    <i className="bx bx-edit-alt me-1"></i> Edit
                                </Dropdown.Item>
                                <Dropdown.Item href="#" onClick={() => {
                                    setDeleteItem(item.mar_ide)
                                    setShowMarcasDelModal(true); // Abre el modal
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
                    show={showMarcasUpModal}
                    handleClose={() => setShowMarcasUpModal(false)}
                    columns={columns}
                    tableName='tmamar'
                    rowData={editingItem} 
                    onSuccess={handleSuccess}
                    idColumn={idColumn}
                />
                <ModalDelete 
                    show={showMarcasDelModal}
                    handleClose={() => setShowMarcasDelModal(false)}
                    tableName="tmamar"
                    rowId={deleteItem} 
                    idColumn={idColumn} 
                    onSuccess={handleSuccess} 
                />
                </table>
                </div>

                {/* Dynamic Pagination Bar for Marcas */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-3 bg-light border-top rounded-bottom">
                    <div className="text-muted small">
                        {meta.total > 0 ? (
                            <span>
                                Mostrando <strong>{((page - 1) * 10) + 1}</strong> a{' '}
                                <strong>{Math.min(page * 10, meta.total)}</strong> de{' '}
                                <strong>{meta.total}</strong> marcas
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
            <hr className="my-5" />
            {/* modelos */}
            <div className="card">
               <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Modelos</h5>
                    <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => setShowModModal(true)}
                    >
                    Agregar Modelo
                    </button>
                </div>
                <ModalInsert
                    show={showModModal}
                    handleClose={() => setShowModModal(false)}
                    columns={columns2}
                    foreign={'tmamar'} // Asumiendo que 'tmamar' es la tabla de marcas
                    idColumn={idColumn2}
                    tableName="tesmod"
                    onSuccess={handleSuccess}
                />
                <div className="table-responsive text-nowrap">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setSearchQuery2(search2);
                            setPage2(1);
                        }}
                        className="p-3 d-flex gap-2 align-items-center"
                    >
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar modelo..."
                            value={search2}
                            onChange={(e) => setSearch2(e.target.value)}
                        />
                        <button type="submit" className="btn btn-outline-primary">
                            Buscar
                        </button>
                        {search2 && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setSearch2('');
                                    setSearchQuery2('');
                                    setPage2(1);
                                }}
                            >
                                Limpiar
                            </button>
                        )}
                    </form>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columns2
                                    .filter(col => col.originalName !== 'mar_ide') // Excluye la columna de categoría si existe
                                    .map((col, index) => (
                                        <th key={index}>{col.displayName}</th>
                                    ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {Object.entries(
                                data2.reduce((acc, item) => {
                                    const MarcaId = item.mar_ide;
                                    if (!acc[MarcaId]) {
                                        acc[MarcaId] = [];
                                    }
                                    acc[MarcaId].push(item);
                                    return acc;
                                }, {})
                            ).map(([MarcaId, modelos]) => (
                                <React.Fragment key={`cat-${MarcaId}`}>
                                    {/* Fila de categoría */}
                                    <tr className="bg-light">
                                        <td colSpan={columns2.filter(col => col.originalName !== 'mar_ide').length + 1}>
                                            <strong>Marca {MarcaId}: {MarcasMap[MarcaId] || `Marca ${MarcaId}`}</strong>
                                        </td>
                                    </tr>
                                    
                                    {/* Filas de subcategorías */}
                                    {modelos.map((item, index) => (
                                        <tr key={`subcat-${MarcaId}-${index}`}>
                                            {columns2
                                                .filter(col => col.originalName !== 'mar_ide') // Excluye la columna de categoría
                                                .map((col) => (
                                                    <td key={`${MarcaId}-${index}-${col.originalName}`}>
                                                        {item[col.originalName.toLowerCase()] ?? 'N/A'}
                                                    </td>
                                                ))}
                                            <td>
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="secondary" id={`dropdown-${MarcaId}-${index}`} className="nav-dropdown-dark-example">
                                                        <i className="bx bx-dots-vertical-rounded"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item href="#" onClick={() => {
                                                            setEditingItem(item); // Guarda el item que se va a editar
                                                            setShowModUpModal(true); // Abre el modal
                                                        }}>
                                                            <i className="bx bx-edit-alt me-1"></i> Editar
                                                        </Dropdown.Item>
                                                        <Dropdown.Item href="#" onClick={() => {
                                                            setDeleteItem(item.mod_ide)
                                                            setShowModDelModal(true); // Abre el modal
                                                        }}>
                                                            <i className="bx bx-trash me-1"></i> Eliminar
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                        <ModalUpdate 
                            show={showModUpModal}
                            handleClose={() => setShowModUpModal(false)}
                            columns={columns2}
                            tableName='tesmod'
                            rowData={editingItem} // Pasa el item específico a editar
                            foreign='tmamar'
                            onSuccess={handleSuccess}
                            idColumn={idColumn2}
                        />
                <ModalDelete 
                    show={showModDelModal}
                    handleClose={() => setShowModDelModal(false)}
                    tableName="tesmod"
                    rowId={deleteItem} 
                    idColumn={idColumn2} 
                    onSuccess={handleSuccess} 
                />
                    </table>
                </div>

                {/* Dynamic Pagination Bar for Modelos */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-3 bg-light border-top rounded-bottom">
                    <div className="text-muted small">
                        {meta2.total > 0 ? (
                            <span>
                                Mostrando <strong>{((page2 - 1) * 10) + 1}</strong> a{' '}
                                <strong>{Math.min(page2 * 10, meta2.total)}</strong> de{' '}
                                <strong>{meta2.total}</strong> modelos
                            </span>
                        ) : (
                            <span>No hay resultados</span>
                        )}
                    </div>
                    <nav aria-label="Navegación de páginas">
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${page2 === 1 ? 'disabled' : ''}`}>
                                <button
                                    type="button"
                                    className="page-link d-flex align-items-center"
                                    onClick={() => setPage2(prev => Math.max(prev - 1, 1))}
                                    aria-label="Anterior"
                                >
                                    <i className="bx bx-chevron-left me-1"></i> Anterior
                                </button>
                            </li>
                            
                            {Array.from({ length: meta2.totalPages || 1 }, (_, i) => i + 1).map((p) => {
                                const totalPages = meta2.totalPages || 1;
                                if (totalPages > 6) {
                                    if (p === 1 || p === totalPages || Math.abs(p - page2) <= 1) {
                                        return (
                                            <li key={p} className={`page-item ${page2 === p ? 'active' : ''}`}>
                                                <button type="button" className="page-link" onClick={() => setPage2(p)}>
                                                    {p}
                                                </button>
                                            </li>
                                        );
                                    } else if ((p === 2 && page2 > 3) || (p === totalPages - 1 && page2 < totalPages - 2)) {
                                        return (
                                            <li key={p} className="page-item disabled">
                                                <span className="page-link">...</span>
                                            </li>
                                        );
                                    }
                                    return null;
                                }
                                return (
                                    <li key={p} className={`page-item ${page2 === p ? 'active' : ''}`}>
                                        <button type="button" className="page-link" onClick={() => setPage2(p)}>
                                            {p}
                                        </button>
                                    </li>
                                );
                            })}

                            <li className={`page-item ${page2 === (meta2.totalPages || 1) ? 'disabled' : ''}`}>
                                <button
                                    type="button"
                                    className="page-link d-flex align-items-center"
                                    onClick={() => setPage2(prev => Math.min(prev + 1, meta2.totalPages || prev + 1))}
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
    )
}