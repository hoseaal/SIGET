import React, { useState, useEffect, useCallback } from 'react';
import { fetchTableColumns, fetchData } from '../../data/fetchData';
import { Dropdown } from 'react-bootstrap';
import ModalInsert from '../Modales/modalInsert';
import ModalUpdate from '../Modales/modalUpdate';
import ModalDelete from '../Modales/modalDelete';


export const Tipos = () => {
    // Estado para Marcas
    const [columns, setColumns] = useState([]);
    const [idColumn, setIdColumn] = useState(null);
    const [data, setData] = useState([]);
    const [showTiposModal, setShowTiposModal] = useState(false);
    const [showTiposUpModal, setShowTiposUpModal] = useState(false);
    const [showTiposDelModal, setShowTiposDelModal] = useState(false);

    //Alias para categorías

    const columnAliasTipos = {
        'tip_ide': 'Código',
        'tip_tip': 'Tipo'
    };

    const [refreshKey, setRefreshKey] = useState(0);

     const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    

        const handleSuccess = () => {
            setRefreshKey(prev => prev + 1); // Fuerza recarga
        };

    // Cargar columnas de Tipos
    useEffect(() => {
        const loadData = async () => {
            try {
                const { columns: tiposColumns, idColumn: tiposIdColumns } = await fetchTableColumns('tmatip');
                
                // Transformar las columnas en objetos con ambos nombres
                const processedColumnsTipos = tiposColumns.map(col => ({
                    originalName: col,
                    displayName: columnAliasTipos[col.toLowerCase()] || col
                }));
                
                setColumns(processedColumnsTipos);
                setIdColumn(tiposIdColumns);
            } catch (error) {
                console.error("Error cargando categorías:", error);
                setColumns([]);
            }
        };
        loadData();
    }, [showTiposModal]);


    const TiposMap = data.reduce((acc, mar) => {
        acc[mar.mar_ide] = mar.mar_mar; // Asume que cat_cat es el nombre
        return acc;
    }, {});


    // Cargar datos de Tipos
    useEffect(() => {
        if (columns.length > 0) {
            const fetchAllData = async () => {
                try {
                    const registrosData = await fetchData('tmatip', '*');
                    setData(registrosData);
                    console.log(data)
                } catch (error) {
                    console.error("Error cargando datos:", error);
                }
            };
            fetchAllData();
        }

    }, [columns, showTiposModal, refreshKey]);


   return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración General /</span> Tipos</h4>
            <div className="card">
                <h5 className="card-header">Tipos
                   <div className="mt-3">
                    <button type="button" className="btn btn-primary"  onClick={() => setShowTiposModal(true)}>Agregar Tipo</button>
                    <ModalInsert show={showTiposModal}
                     handleClose={() => setShowTiposModal(false)}
                     columns={columns}
                     tableName='tmatip'
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
                                    setShowTiposUpModal(true); // Abre el modal
                                }}>
                                    <i className="bx bx-edit-alt me-1"></i> Edit
                                </Dropdown.Item>
                                <Dropdown.Item href="#" onClick={() => {
                                    setDeleteItem(item.tip_ide)
                                    setShowTiposDelModal(true); // Abre el modal
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
                    show={showTiposUpModal}
                    handleClose={() => setShowTiposUpModal(false)}
                    columns={columns}
                    tableName='tmatip'
                    rowData={editingItem} 
                    onSuccess={handleSuccess}
                    idColumn={idColumn}
                />
                <ModalDelete 
                    show={showTiposDelModal}
                    handleClose={() => setShowTiposDelModal(false)}
                    tableName="tmatip"
                    rowId={deleteItem} 
                    idColumn={idColumn} 
                    onSuccess={handleSuccess} 
                />
                </table>
                </div>
            </div>
        </div>
    )
}