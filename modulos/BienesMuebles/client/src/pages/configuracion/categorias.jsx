import React, { useState, useEffect } from 'react';
import { getTableMetadata } from '../../data/fetchData';
import { Dropdown } from 'react-bootstrap';
import ModalInsert from '../Modales/modalInsert';
import ModalUpdate from '../Modales/modalUpdate';
import ModalDelete from '../Modales/modalDelete';


export const Categorias = () => {
    // Estados para modales
    const [showCatModal, setShowCatModal] = useState(false);
    const [showCatUpModal, setShowCatUpModal] = useState(false);
    const [showCatDelModal, setShowCatDelModal] = useState(false);
    const [showSubcatModal, setShowSubcatModal] = useState(false);
    const [showSubcatUpModal, setShowSubcatUpModal] = useState(false);
    const [showSubcatDelModal, setShowSubcatDelModal] = useState(false);
    const [showcatEsModal, setShowcatEsModal] = useState(false);
    const [showcatEsUpModal, setShowcatEsUpModal] = useState(false);
    const [showcatEsDelModal, setShowcatEsDelModal] = useState(false);

    // Estado para editar y eliminar
    const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    
    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1); // Fuerza recarga
    };

  // categorías
  const [columns, setColumns] = useState([]);
  const [idColumn, setIdColumn] = useState(null);
  const [data, setData] = useState([]);

  // sub categorias
  const [columns2, setColumns2] = useState([]);
  const [idColumn2, setIdColumn2] = useState(null);
  const [data2, setData2] = useState([]);

  // categorías específicas
  const [columns3, setColumns3] = useState([]);
  const [idColumn3, setIdColumn3] = useState(null);
  const [data3, setData3] = useState([]);

  //forzar recargar
  const [refreshKey, setRefreshKey] = useState(0);

  // Alias
  const columnAliasCat = {
    'cat_ide': 'Código',
    'cat_cat': 'Categoría'
  };

  const columnAliasSubCat = {
    'sca_ide': 'Código',
    'sca_sca': 'Sub-Categoría',
    'cat_ide': 'Categoría'
  };

  const columnAliasCatEs = {
    'cae_ide': 'Código',
    'cae_cae': 'Categoría Específica',
    'sca_ide': 'Sub-Categoría'
  };

  // Estados para paginación y búsqueda: Categorías
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para paginación y búsqueda: Subcategorías
  const [meta2, setMeta2] = useState({});
  const [page2, setPage2] = useState(1);
  const [search2, setSearch2] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');

  // Estados para traducción de IDs (para mapas de Categorías y Subcategorías no paginados)
  const [categoriasMap, setCategoriasMap] = useState({});
  const [subCatMap, setSubCatMap] = useState({});

  // Cargar mapas de IDs (unpaginated) para que las traducciones de ID a nombre siempre funcionen
  useEffect(() => {
    const loadMaps = async () => {
      try {
        const catRes = await fetch('/api/categorias', { credentials: 'include' });
        const catData = await catRes.json();
        const catMap = catData.reduce((acc, cat) => {
          acc[cat.cat_ide] = cat.cat_cat;
          return acc;
        }, {});
        setCategoriasMap(catMap);

        const subRes = await fetch('/api/subcategorias', { credentials: 'include' });
        const subData = await subRes.json();
        const sCatMap = subData.reduce((acc, subCat) => {
          acc[subCat.sca_ide] = subCat.sca_sca;
          return acc;
        }, {});
        setSubCatMap(sCatMap);
      } catch (error) {
        console.error('Error cargando mapas:', error);
      }
    };
    loadMaps();
  }, [refreshKey]);

  // Cargar columnas y datos de categorías (paginado)
  useEffect(() => {
    const loadCatData = async () => {
      try {
        const { columns, primaryKey } = await getTableMetadata('tmacat');
        setColumns(columns.map(col => ({
          originalName: col.name,
          displayName: columnAliasCat[col.name] || col.name,
          isPrimaryKey: col.name === primaryKey
        })));
        setIdColumn(primaryKey);

        const url = `/api/categorias?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`;
        const res = await fetch(url, { credentials: 'include' });
        const result = await res.json();
        setData(Array.isArray(result.data) ? result.data : []);
        setMeta(result.meta || {});
      } catch (error) {
        console.error('Error cargando categorías:', error);
        setData([]);
        setMeta({});
      }
    };

    loadCatData();
  }, [refreshKey, page, searchQuery]);

  // Cargar columnas y datos de subcategorías (paginado)
  useEffect(() => {
    const loadSubCatData = async () => {
      try {
        const { columns, primaryKey } = await getTableMetadata('tessca');
        setColumns2(columns.map(col => ({
          originalName: col.name,
          displayName: columnAliasSubCat[col.name] || col.name,
          isPrimaryKey: col.name === primaryKey
        })));
        setIdColumn2(primaryKey);

        const url = `/api/subcategorias?page=${page2}&limit=10&search=${encodeURIComponent(searchQuery2)}`;
        const res = await fetch(url, { credentials: 'include' });
        const result = await res.json();
        setData2(Array.isArray(result.data) ? result.data : []);
        setMeta2(result.meta || {});
      } catch (error) {
        console.error('Error cargando subcategorías:', error);
        setData2([]);
        setMeta2({});
      }
    };

    loadSubCatData();
  }, [refreshKey, page2, searchQuery2]);

  // Estados para paginación: Categorías específicas
  const [meta3, setMeta3] = useState({});
  const [page3, setPage3] = useState(1);
  const [search3, setSearch3] = useState('');
  const [searchQuery3, setSearchQuery3] = useState('');

  useEffect(() => {
  const loadCatEsData = async () => {
    try {
        const { columns, primaryKey } = await getTableMetadata('tescae');
        setColumns3(columns.map(col => ({
          originalName: col.name,
          displayName: columnAliasCatEs[col.name] || col.name,
          isPrimaryKey: col.name === primaryKey
        })));
        setIdColumn3(primaryKey);
      const limit = searchQuery3 ? 20 : 10; // O usa el mismo límite para ambos
        const url = searchQuery3
        ? `/api/categorias-especificas/buscar?search=${encodeURIComponent(searchQuery3)}&page=${page3}&limit=${limit}`
        : `/api/categorias-especificas/pagina?page=${page3}&limit=${limit}`;
      
      const response = await fetch(url);
      const result = await response.json();

      const dataArray = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
        const metaData = result.meta || {};

        setData3(dataArray);
        setMeta3(metaData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setData3([]);
    }
  };

  loadCatEsData();
}, [searchQuery3, page3]);

  return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración General /</span> Categorias</h4>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Categorías</h5>
                    <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => setShowCatModal(true)}
                    >
                    Agregar Categoría
                    </button>
                </div>
                <ModalInsert
                    show={showCatModal}
                    handleClose={() => setShowCatModal(false)}
                    columns={columns}
                    tableName="tmacat"
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
                            placeholder="Buscar categoría..."
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
                                    setShowCatUpModal(true); // Abre el modal
                                }}>
                                    <i className="bx bx-edit-alt me-1"></i> Edit
                                </Dropdown.Item>
                                <Dropdown.Item href="#" onClick={() => {
                                    setDeleteItem(item.cat_ide)
                                    setShowCatDelModal(true); // Abre el modal
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
                        show={showCatUpModal}
                        handleClose={() => setShowCatUpModal(false)}
                        columns={columns}
                        tableName='tmacat'
                        rowData={editingItem} 
                        onSuccess={handleSuccess}
                        idColumn={idColumn}
                    />
                    <ModalDelete 
                        show={showCatDelModal}
                        handleClose={() => setShowCatDelModal(false)}
                        tableName="tmacat"
                        rowId={deleteItem} 
                        idColumn={idColumn} 
                        onSuccess={handleSuccess} 
                        />
                </table>
                </div>

                {/* Dynamic Pagination Bar for Categorías */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-3 bg-light border-top rounded-bottom">
                    <div className="text-muted small">
                        {meta.total > 0 ? (
                            <span>
                                Mostrando <strong>{((page - 1) * 10) + 1}</strong> a{' '}
                                <strong>{Math.min(page * 10, meta.total)}</strong> de{' '}
                                <strong>{meta.total}</strong> categorías
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
            {/* subcategorias */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Sub Categorías</h5>
                    <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => setShowSubcatModal(true)}
                    >
                    Agregar Sub-Categoría
                    </button>
                </div>
                <ModalInsert
                    show={showSubcatModal}
                    handleClose={() => setShowSubcatModal(false)}
                    columns={columns2}
                    tableName="tessca"
                    foreign="tmacat"
                    onSuccess={handleSuccess}
                />
                <div className="table-responsive text-nowrap">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setSearchQuery2(search2); // Solo dispara búsqueda cuando se presiona el botón
                            setPage2(1);
                        }}
                        className="p-3 d-flex gap-2 align-items-center"
                    >
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar sub-categoría..."
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
                                    .filter(col => col.originalName !== 'cat_ide') // Excluye la columna de categoría si existe
                                    .map((col, index) => (
                                        <th key={index}>{col.displayName}</th>
                                    ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(
                            data2.reduce((acc, item) => {
                                const categoriaId = item.cat_ide;
                                if (!acc[categoriaId]) {
                                acc[categoriaId] = [];
                                }
                                acc[categoriaId].push(item);
                                return acc;
                            }, {})
                            ).map(([categoriaId, subcategorias]) => (
                            <React.Fragment key={`cat-${categoriaId}`}>
                                {/* Fila de encabezado de categoría */}
                                <tr className="table-secondary">
                                <td colSpan={columns2.length}>
                                    <strong>
                                    Categoría {categoriaId}: {categoriasMap[categoriaId] || `Categoría ${categoriaId}`}
                                    </strong>
                                </td>
                                </tr>
                                    
                                    {/* Filas de subcategorías */}
                                    {subcategorias.map((item, index) => (
                                        <tr key={`subcat-${categoriaId}-${index}`}>
                                            {columns2
                                                .filter(col => col.originalName !== 'cat_ide') // Excluye la columna de categoría
                                                .map((col) => (
                                                    <td key={`${categoriaId}-${index}-${col.originalName}`}>
                                                        {item[col.originalName.toLowerCase()] ?? 'N/A'}
                                                    </td>
                                                ))}
                                            <td>
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="secondary" id={`dropdown-${categoriaId}-${index}`} className="nav-dropdown-dark-example">
                                                        <i className="bx bx-dots-vertical-rounded"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item href="#" onClick={() => {
                                                            setEditingItem(item); // Guarda el item que se va a editar
                                                            setShowSubcatUpModal(true); // Abre el modal
                                                        }}>
                                                            <i className="bx bx-edit-alt me-1"></i> Editar
                                                        </Dropdown.Item>
                                                        <Dropdown.Item href="#" onClick={() => {
                                                            setDeleteItem(item.sca_ide)
                                                            setShowSubcatDelModal(true); // Abre el modal
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
                        show={showSubcatUpModal}
                        handleClose={() => setShowSubcatUpModal(false)}
                        columns={columns2}
                        tableName='tessca'
                        rowData={editingItem} // Pasa el item específico a editar
                        foreign='tmacat'
                        onSuccess={handleSuccess}
                        idColumn={idColumn2}
                    />
                    <ModalDelete 
                        show={showSubcatDelModal}
                        handleClose={() => setShowSubcatDelModal(false)}
                        tableName="tessca"
                        rowId={deleteItem} 
                        idColumn={idColumn2} 
                        onSuccess={handleSuccess} 
                        />
                    </table>
                </div>

                {/* Dynamic Pagination Bar for Subcategorías */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-3 bg-light border-top rounded-bottom">
                    <div className="text-muted small">
                        {meta2.total > 0 ? (
                            <span>
                                Mostrando <strong>{((page2 - 1) * 10) + 1}</strong> a{' '}
                                <strong>{Math.min(page2 * 10, meta2.total)}</strong> de{' '}
                                <strong>{meta2.total}</strong> subcategorías
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
            <hr className="my-5" />
             {/* Categorías específicas */}
             <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Categoría Específica</h5>
                    <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => setShowcatEsModal(true)}
                    >
                    Agregar Categoría Específica
                    </button>
                </div>

                <ModalInsert
                    show={showcatEsModal}
                    handleClose={() => setShowcatEsModal(false)}
                    columns={columns3}
                    tableName="tescae"
                    foreign="tessca"
                    onSuccess={handleSuccess}
                />

                <div className="table-responsive text-nowrap">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setSearchQuery3(search3); // Solo dispara búsqueda cuando se presiona el botón
                            setPage3(1);
                        }}
                        className="p-3 d-flex gap-2 align-items-center"
                        >
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar categoría específica..."
                            value={search3}
                            onChange={(e) => setSearch3(e.target.value)}
                        />
                        <button type="submit" className="btn btn-outline-primary">
                            Buscar
                        </button>
                        {search3 && (
                            <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setSearch3('');
                                setSearchQuery3('');
                                setPage3(1);
                            }}
                            >
                            Limpiar
                            </button>
                        )}
                        </form>
                    <table className="table table-striped">
                        
                    <thead className="table-light">
                        
                        <tr>
                        {columns3
                            .filter(col => col.originalName !== 'sca_ide')
                            .map((col, index) => (
                            <th key={index}>{col.displayName}</th>
                            ))}
                        <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data3.length === 0 ? (
                        <tr>
                            <td colSpan={columns3.length + 1} className="text-center text-muted">
                            No hay datos disponibles.
                            </td>
                        </tr>
                        ) : (
                        Object.entries(
                            data3.reduce((acc, item) => {
                            const subCategoriaId = item.sca_ide;
                            if (!acc[subCategoriaId]) acc[subCategoriaId] = [];
                            acc[subCategoriaId].push(item);
                            return acc;
                            }, {})
                        ).map(([subCategoriaId, catEsp]) => (
                            <React.Fragment key={`cat-${subCategoriaId}`}>
                            <tr className="table-secondary">
                                <td colSpan={columns3.length + 1}>
                                <strong>
                                    Subcategoría {subCategoriaId}: {catEsp[0]?.subcategoria || subCatMap[subCategoriaId] || `Subcategoría ${subCategoriaId}`}
                                </strong>
                                </td>
                            </tr>

                            {catEsp.map((item, index) => (
                                <tr key={`subcat-${subCategoriaId}-${index}`}>
                                {columns3
                                    .filter(col => col.originalName !== 'sca_ide')
                                    .map(col => (
                                    <td key={`${subCategoriaId}-${index}-${col.originalName}`}>
                                        {item[col.originalName.toLowerCase()] ?? 'N/A'}
                                    </td>
                                    ))}
                                <td>
                                    <Dropdown>
                                    <Dropdown.Toggle
                                        variant="secondary"
                                        id={`dropdown-${subCategoriaId}-${index}`}
                                        className="nav-dropdown-dark-example"
                                    >
                                        <i className="bx bx-dots-vertical-rounded"></i>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                        href="#"
                                        onClick={() => {
                                            setEditingItem(item);
                                            setShowcatEsUpModal(true);
                                        }}
                                        >
                                        <i className="bx bx-edit-alt me-1"></i> Editar
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                        href="#"
                                        onClick={() => {
                                            setDeleteItem(item.cae_ide);
                                            setShowcatEsDelModal(true);
                                        }}
                                        >
                                        <i className="bx bx-trash me-1"></i> Eliminar
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                    </Dropdown>
                                </td>
                                </tr>
                            ))}
                            </React.Fragment>
                        ))
                        )}
                    </tbody>
                    <ModalUpdate 
                        show={showcatEsUpModal}
                        handleClose={() => setShowcatEsUpModal(false)}
                        columns={columns3}
                        tableName='tescae'
                        rowData={editingItem} // Pasa el item específico a editar
                        foreign='tessca'
                        onSuccess={handleSuccess}
                        idColumn={idColumn3}
                    />
                    <ModalDelete 
                        show={showcatEsDelModal}
                        handleClose={() => setShowcatEsDelModal(false)}
                        tableName="tescae"
                        rowId={deleteItem} 
                        idColumn={idColumn3} 
                        onSuccess={handleSuccess} 
                        />
                    </table>
                </div>

                {/* Dynamic Pagination Bar for Categorías Específicas */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-3 bg-light border-top rounded-bottom">
                    <div className="text-muted small">
                        {meta3.total > 0 ? (
                            <span>
                                Mostrando <strong>{((page3 - 1) * (searchQuery3 ? 20 : 10)) + 1}</strong> a{' '}
                                <strong>{Math.min(page3 * (searchQuery3 ? 20 : 10), meta3.total)}</strong> de{' '}
                                <strong>{meta3.total}</strong> categorías específicas
                            </span>
                        ) : (
                            <span>No hay resultados</span>
                        )}
                    </div>
                    <nav aria-label="Navegación de páginas">
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${page3 === 1 ? 'disabled' : ''}`}>
                                <button
                                    type="button"
                                    className="page-link d-flex align-items-center"
                                    onClick={() => setPage3(prev => Math.max(prev - 1, 1))}
                                    aria-label="Anterior"
                                >
                                    <i className="bx bx-chevron-left me-1"></i> Anterior
                                </button>
                            </li>
                            
                            {Array.from({ length: meta3.totalPages || 1 }, (_, i) => i + 1).map((p) => {
                                const totalPages = meta3.totalPages || 1;
                                if (totalPages > 6) {
                                    if (p === 1 || p === totalPages || Math.abs(p - page3) <= 1) {
                                        return (
                                            <li key={p} className={`page-item ${page3 === p ? 'active' : ''}`}>
                                                <button type="button" className="page-link" onClick={() => setPage3(p)}>
                                                    {p}
                                                </button>
                                            </li>
                                        );
                                    } else if ((p === 2 && page3 > 3) || (p === totalPages - 1 && page3 < totalPages - 2)) {
                                        return (
                                            <li key={p} className="page-item disabled">
                                                <span className="page-link">...</span>
                                            </li>
                                        );
                                    }
                                    return null;
                                }
                                return (
                                    <li key={p} className={`page-item ${page3 === p ? 'active' : ''}`}>
                                        <button type="button" className="page-link" onClick={() => setPage3(p)}>
                                            {p}
                                        </button>
                                    </li>
                                );
                            })}

                            <li className={`page-item ${page3 === (meta3.totalPages || 1) ? 'disabled' : ''}`}>
                                <button
                                    type="button"
                                    className="page-link d-flex align-items-center"
                                    onClick={() => setPage3(prev => Math.min(prev + 1, meta3.totalPages || prev + 1))}
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