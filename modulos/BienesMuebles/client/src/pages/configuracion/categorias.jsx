import React, { useState, useEffect, useCallback } from 'react';
import { fetchTableColumns, fetchData } from '../../data/fetchData';
import { Dropdown } from 'react-bootstrap';
import ModalInsert from '../Modales/modalInsert';


export const Categorias = () => {
    // Estado para categorías
    const [columns, setColumns] = useState([]);
    const [idColumn, setIdColumn] = useState(null);
    const [data, setData] = useState([]);
    const [showCatModal, setShowCatModal] = useState(false);

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

    //Alias para SubCategorías

    const columnAliasSubCat = {
        'sca_ide': 'Código',
        'sca_sca': 'Sub-Categoría',
        'cat_ide': 'Categoría'
    };

    const [refreshKey, setRefreshKey] = useState(0);

        const handleSuccess = () => {
            setRefreshKey(prev => prev + 1); // Fuerza recarga
        };
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

    // Cargar datos de categoría
    useEffect(() => {
        if (columns.length > 0) {
            const fetchAllData = async () => {
                try {
                    const registrosData = await fetchData('tmacat', '*');
                    setData(registrosData);
                    console.log(data)
                } catch (error) {
                    console.error("Error cargando datos:", error);
                }
            };
            fetchAllData();
        }

    }, [columns, showCatModal, refreshKey]);

    // Cargar datos de subcategoría
    useEffect(() => {
        if (columns2.length > 0) {
            const fetchAllData = async () => {
                try {
                    const registrosData2 = await fetchData('tessca', '*');
                    setData2(registrosData2);
                } catch (error) {
                    console.error("Error cargando datos:", error);
                }
            };
            fetchAllData();
        }
    }, [columns2, showSubcatModal, refreshKey]);
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
                                <Dropdown.Item href="#">
                                    <i className="bx bx-edit-alt me-1"></i> Edit
                                </Dropdown.Item>
                                <Dropdown.Item href="#">
                                    <i className="bx bx-trash me-1"></i> Delete
                                </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
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
                                                        <Dropdown.Item href="#">
                                                            <i className="bx bx-edit-alt me-1"></i> Editar
                                                        </Dropdown.Item>
                                                        <Dropdown.Item href="#">
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
                    </table>
                </div>
            </div>
            {/*Modal Insert */}
              
        </div>
    )
}