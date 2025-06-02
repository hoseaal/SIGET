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

    // Cargar columnas y datos de Marca
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

            const res = await fetch('/api/marcas', { credentials: 'include' });
            const data = await res.json();
            setData(data);
          } catch (error) {
            console.error('Error cargando categorías:', error);
          }
        };
        loadCatData();
    }, [refreshKey]);
    
    // Cargar columnas de Modelo
    useEffect(() => {
        const loadCatData = async () => {
          try {
            const { columns, primaryKey } = await getTableMetadata('tesmod');
            setColumns2(columns.map(col => ({
              originalName: col.name,
              displayName: columnAliasMod[col.name] || col.name,
              isPrimaryKey: col.name === primaryKey
            })));
            setIdColumn2(primaryKey);

            const res = await fetch('/api/modelos', { credentials: 'include' });
            const data = await res.json();
            setData2(data);
          } catch (error) {
            console.error('Error cargando categorías:', error);
          }
        };
        loadCatData();
    }, [refreshKey]);

    const MarcasMap = data.reduce((acc, mar) => {
        acc[mar.mar_ide] = mar.mar_mar; // Asume que cat_cat es el nombre
        return acc;
    }, {});


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
            </div>
              
        </div>
    )
}