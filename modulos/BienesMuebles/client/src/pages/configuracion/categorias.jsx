import React, { useState, useEffect, useCallback } from 'react';
import { fetchTableColumns, fetchData } from '../../data/fetchData';
import { Dropdown } from 'react-bootstrap';
import ModalInsert from '../Modales/modalInsert';
import ModalUpdate from '../Modales/modalUpdate';
import ModalDelete from '../Modales/modalDelete';


export const Categorias = () => {
    // Estado para categorías
    const [columns, setColumns] = useState([]);
    const [idColumn, setIdColumn] = useState(null);
    const [data, setData] = useState([]);
    const [showCatModal, setShowCatModal] = useState(false);
    const [showCatUpModal, setShowCatUpModal] = useState(false)
    const [showCatDelModal, setShowCatDelModal] = useState(false)

    //Alias para categorías

    const columnAliasCat = {
        'cat_ide': 'Código',
        'cat_cat': 'Categoría'
    };

    // Estado para subcategorías
    const [columns2, setColumns2] = useState([]);
    const [idColumn2, setIdColumn2] = useState(null);
    const [data2, setData2] = useState([]);
    const [showSubcatModal, setShowSubcatModal] = useState(false);
    const [showSubcatUpModal, setShowSubcatUpModal] = useState(false);
    const [showSubcatDelModal, setShowSubcatDelModal] = useState(false);

    //Alias para SubCategorías

    const columnAliasSubCat = {
        'sca_ide': 'Código',
        'sca_sca': 'Sub-Categoría',
        'cat_ide': 'Categoría'
    };

    // Estado para categoría Especifica
    const [columns3, setColumns3] = useState([]);
    const [idColumn3, setIdColumn3] = useState(null);
    const [data3, setData3] = useState([]);
    const [showcatEsModal, setShowcatEsModal] = useState(false);
    const [showcatEsUpModal, setShowcatEsUpModal] = useState(false);
    const [showcatEsDelModal, setShowcatEsDelModal] = useState(false);

    //Alias para Categoría Especifica

    const columnAliasCatEs = {
        'cae_ide': 'Código',
        'cae_cae': 'Categoría Especifica',
        'sca_ide': 'Sub-Categoría'
    };

    const [refreshKey, setRefreshKey] = useState(0);

        const handleSuccess = () => {
            setRefreshKey(prev => prev + 1); // Fuerza recarga
        };

        const [editingItem, setEditingItem] = useState(null);
        const [deleteItem, setDeleteItem] = useState(null);

    // Cargar columnas de categoría
    useEffect(() => {
        const loadData = async () => {
            try {
                const { columns: catColumns, idColumn: catIdColumns } = await fetchTableColumns('tmacat');
                
                // Transformar las columnas en objetos con ambos nombres
                const processedColumnsCat = catColumns.map(col => ({
                    originalName: col,
                    displayName: columnAliasCat[col.toLowerCase()] || col
                }));
                
                setColumns(processedColumnsCat);
                setIdColumn(catIdColumns);
            } catch (error) {
                console.error("Error cargando categorías:", error);
                setColumns([]);
            }
        };
        loadData();
    }, [showCatModal]);

    
    // Cargar columnas de subcategoría
    useEffect(() => {
        const loadData = async () => {
            try {
                const { columns: subcatColumns, idColumn: subcatIdColumn } = await fetchTableColumns('tessca');
                 // Transformar las columnas en objetos con ambos nombres
                 const processedColumnsSubCat = subcatColumns.map(col => ({
                    originalName: col,
                    displayName: columnAliasSubCat[col.toLowerCase()] || col,
                    isPrimaryKey: col === subcatIdColumn
                }));
                
                setColumns2(processedColumnsSubCat);
                setIdColumn2(subcatIdColumn);
            } catch (error) {
                console.error("Error cargando subcategorías:", error);
                setColumns2([]);
            }
        };
        loadData();
    }, [showSubcatModal]);

    const categoriasMap = data.reduce((acc, cat) => {
        acc[cat.cat_ide] = cat.cat_cat; // Asume que cat_cat es el nombre
        return acc;
    }, {});

    const subcategoriasMap = data2.reduce((acc, subcat) => {
        acc[subcat.sca_ide] = subcat.sca_sca; // Asume que cat_cat es el nombre
        return acc;
    }, {});

    // Cargar columnas de Categoría Especifica
    useEffect(() => {
        const loadData = async () => {
            try {
                const { columns: catEsColumns, idColumn: catEsIdColumn } = await fetchTableColumns('tescae');
                 // Transformar las columnas en objetos con ambos nombres
                 const processedColumnsSubCat = catEsColumns.map(col => ({
                    originalName: col,
                    displayName: columnAliasCatEs[col.toLowerCase()] || col,
                    isPrimaryKey: col === catEsIdColumn
                }));
                
                setColumns3(processedColumnsSubCat);
                setIdColumn3(catEsIdColumn);
            } catch (error) {
                console.error("Error cargando subcategorías:", error);
                setColumns2([]);
            }
        };
        loadData();
    }, [showcatEsModal]);

    // Cargar datos de categoría
    useEffect(() => {
        const controller = new AbortController();
        
        const fetchAllData = async () => {
            try {
            const registrosData = await fetchData('tmacat', '*', controller.signal);
            setData(registrosData);
            } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("Error cargando datos:", error);
            }
            }
        };

        if (columns.length > 0) {
            fetchAllData();
        }

        return () => {
            controller.abort(); // Cancela la petición al desmontar el componente
        };
    }, [columns, refreshKey]);

    // Cargar datos de subcategoría
    useEffect(() => {
        const controller = new AbortController();

        if (columns2.length > 0) {
            const fetchAllData = async () => {
                try {
                    const registrosData2 = await fetchData('tessca', '*',  controller.signal);
                    setData2(registrosData2);
                } catch (error) {
                    console.error("Error cargando datos:", error);
                }
            };
            fetchAllData();
        }

        return () => {
            controller.abort(); // Cancela la petición al desmontar el componente
        };
    }, [columns2, showSubcatModal, refreshKey]);

    // Cargar datos de categoría especifica
    useEffect(() => {
         const controller = new AbortController();

        if (columns3.length > 0) {
            const fetchAllData = async () => {
                try {
                    const registrosData = await fetchData('tescae', '*',  controller.signal);
                    setData3(registrosData);
                } catch (error) {
                    console.error("Error cargando datos:", error);
                }
            };
            fetchAllData();
        }

          return () => {
            controller.abort(); // Cancela la petición al desmontar el componente
        };
    }, [columns3, showcatEsModal, refreshKey]);

    console.log("cat", data)
    console.log("subcat", data2)
    console.log("especificas", data3)

   return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración General /</span> Categorias</h4>
            <div className="card">
                <h5 className="card-header">Categorias 
                   <div className="mt-3">
                    <button type="button" className="btn btn-primary"  onClick={() => setShowCatModal(true)}>Agregar Categoría</button>
                    <ModalInsert show={showCatModal}
                     handleClose={() => setShowCatModal(false)}
                     columns={columns}
                     tableName='tmacat'
                     onSuccess={handleSuccess}
                      />
                  </div>        
                </h5>
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
                <h5 className="card-header">Sub-Categorías 
                    <div className="mt-3">
                        <button 
                            type="button" 
                            className="btn btn-primary"  
                            onClick={() => setShowSubcatModal(true)}
                        >
                            Agregar Sub-Categoría
                        </button>
                        <ModalInsert show={showSubcatModal}
                        handleClose={() => setShowSubcatModal(false)}
                        columns={columns2}
                        tableName='tessca'
                        foreign='tmacat'
                        onSuccess={handleSuccess}
                      />
                    </div> 
                </h5>
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
                        <tbody className="table-border-bottom-0">
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
                                    {/* Fila de categoría */}
                                    <tr className="bg-light">
                                        <td colSpan={columns2.filter(col => col.originalName !== 'cat_ide').length + 1}>
                                            <strong>Categoría {categoriaId}: {categoriasMap[categoriaId] || `Categoría ${categoriaId}`}</strong>
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
                <h5 className="card-header">Categoría Especifica
                    <div className="mt-3">
                        <button 
                            type="button" 
                            className="btn btn-primary"  
                            onClick={() => setShowcatEsModal(true)}
                        >
                            Agregar Categoría Especifica
                        </button>
                        <ModalInsert show={showcatEsModal}
                        handleClose={() => setShowcatEsModal(false)}
                        columns={columns3}
                        tableName='tescae'
                        foreign='tessca'
                        onSuccess={handleSuccess}
                      />
                    </div> 
                </h5>
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columns3
                                    .filter(col => col.originalName !== 'sca_ide') // Excluye la columna de categoría si existe
                                    .map((col, index) => (
                                        <th key={index}>{col.displayName}</th>
                                    ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {Object.entries(
                                data3.reduce((acc, item) => {
                                    const subcategoriaId = item.sca_ide;
                                    if (!acc[subcategoriaId]) {
                                        acc[subcategoriaId] = [];
                                    }
                                    acc[subcategoriaId].push(item);
                                    return acc;
                                }, {})
                            ).map(([subcategoriaId, catEsp]) => (
                                <React.Fragment key={`cat-${subcategoriaId}`}>
                                    {/* Fila de categoría */}
                                    <tr className="bg-light">
                                        <td colSpan={columns3.filter(col => col.originalName !== 'sca_ide').length + 1}>
                                            <strong>Sub-Categoría {subcategoriaId}: {subcategoriasMap[subcategoriaId] || `Categoría ${subcategoriaId}`}</strong>
                                        </td>
                                    </tr>
                                    
                                    {/* Filas de subcategorías */}
                                    {catEsp.map((item, index) => (
                                        <tr key={`subcat-${subcategoriaId}-${index}`}>
                                            {columns3
                                                .filter(col => col.originalName !== 'sca_ide') // Excluye la columna de categoría
                                                .map((col) => (
                                                    <td key={`${subcategoriaId}-${index}-${col.originalName}`}>
                                                        {item[col.originalName.toLowerCase()] ?? 'N/A'}
                                                    </td>
                                                ))}
                                            <td>
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="secondary" id={`dropdown-${subcategoriaId}-${index}`} className="nav-dropdown-dark-example">
                                                        <i className="bx bx-dots-vertical-rounded"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item href="#"  onClick={() => {
                                                            setEditingItem(item); // Guarda el item que se va a editar
                                                            setShowcatEsUpModal(true); // Abre el modal
                                                        }}>
                                                            <i className="bx bx-edit-alt me-1"></i> Edit
                                                        </Dropdown.Item>
                                                        <Dropdown.Item href="#" onClick={() => {
                                                            setDeleteItem(item.cae_ide)
                                                            setShowcatEsDelModal(true); // Abre el modal
                                                        }}>
                                                            <i className="bx bx-trash me-1"></i> Delete
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
            </div>
              
        </div>
    )
}