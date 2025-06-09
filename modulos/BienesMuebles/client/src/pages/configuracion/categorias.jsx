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

  // Cargar columnas y datos de categorías
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

        const res = await fetch('/api/categorias', { credentials: 'include' });
        const data = await res.json();
        setData(data);
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    };

    loadCatData();
  }, [refreshKey]);

  const categoriasMap = data.reduce((acc, cat) => {
        acc[cat.cat_ide] = cat.cat_cat; // Asume que cat_cat es el nombre
        return acc;
    }, {});

  // Cargar columnas y datos de subcategorías
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

        const res = await fetch('/api/subcategorias', { credentials: 'include' });
        const data = await res.json();
        setData2(data);
      } catch (error) {
        console.error('Error cargando subcategorías:', error);
      }
    };

    loadSubCatData();
  }, [refreshKey]);

  
    const subCatMap = data2.reduce((acc, subCat) => {
        acc[subCat.sca_ide] = subCat.sca_sca; // Asume que sca_sca es el nombre
        return acc;
    }, {});

    //Estados para paginación
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

  console.log('Categorías:', data);
  console.log('Subcategorías:', data2);
  console.log('Categorías específicas:', data3);
  console.log(idColumn2, idColumn3);

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
                        tableName='tesscae'
                        rowData={editingItem} // Pasa el item específico a editar
                        foreign='tessca'
                        onSuccess={handleSuccess}
                        idColumn={idColumn3}
                    />
                    <ModalDelete 
                        show={showcatEsDelModal}
                        handleClose={() => setShowcatEsDelModal(false)}
                        tableName="tesscae"
                        rowId={deleteItem} 
                        idColumn={idColumn3} 
                        onSuccess={handleSuccess} 
                        />
                    </table>
                </div>

                {/* Paginación */}
                <div className="d-flex justify-content-between align-items-center px-4 pb-3">
                    <button
                    className="btn btn-outline-secondary"
                    onClick={() => setPage3(prev => Math.max(prev - 1, 1))}
                    disabled={page3 === 1}
                    >
                    ← Anterior
                    </button>

                    <span className="fw-semibold">Página {page3} de {meta3.totalPages || '...'}</span>

                    <button
                    className="btn btn-outline-secondary"
                    onClick={() => setPage3(prev => Math.min(prev + 1, meta3.totalPages || prev + 1))}
                    disabled={page3 === meta3.totalPages}
                    >
                    Siguiente →
                    </button>
                </div>
                </div>
            </div>
    )
}