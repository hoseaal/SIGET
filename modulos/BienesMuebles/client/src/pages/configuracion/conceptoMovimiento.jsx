import React, { useState, useEffect, useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import { getTableMetadata } from '../../data/fetchData';
import ModalInsert from '../Modales/modalInsert';
import ModalUpdate from '../Modales/modalUpdate';
import ModalDelete from '../Modales/modalDelete';


export const ConceptoMovimiento = () => {
    // Estado para Marcas
    const [columns, setColumns] = useState([]);
    const [idColumn, setIdColumn] = useState(null);
    const [data, setData] = useState([]);
    const [showConMovModal, setshowConMovModal] = useState(false);
    const [showConMovUpModal, setShowConMovUpModal] = useState(false);
    const [showConMovDelModal, setShowConMovDelModal] = useState(false);

    //Alias para categorías

    const columnAliasMarcas = {
        'com_ide': 'Código',
        'com_com': 'Concepto de Movimiento'
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
            const { columns, primaryKey } = await getTableMetadata('tmacom');
            setColumns(columns.map(col => ({
              originalName: col.name,
              displayName: columnAliasMarcas[col.name] || col.name,
              isPrimaryKey: col.name === primaryKey
            })));
            setIdColumn(primaryKey);

            const res = await fetch('/api/conceptos-movimiento', { credentials: 'include' });
            const data = await res.json();
            setData(data);
          } catch (error) {
            console.error('Error cargando categorías:', error);
          }
        };
        loadCatData();
    }, [refreshKey]);


   return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración General /</span> Conceptos de Movimiento</h4>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Conceptos de Movimiento</h5>
                    <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => setshowConMovModal(true)}
                    >
                    Agregar Concepto
                    </button>
                </div>
                <ModalInsert
                    show={showConMovModal}
                    handleClose={() => setshowConMovModal(false)}
                    columns={columns}
                    tableName="tmacom"
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
                                    setShowConMovUpModal(true); // Abre el modal
                                }}>
                                    <i className="bx bx-edit-alt me-1"></i> Edit
                                </Dropdown.Item>
                                <Dropdown.Item href="#" onClick={() => {
                                    setDeleteItem(item.mar_ide)
                                    setShowConMovDelModal(true); // Abre el modal
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
                    show={showConMovUpModal}
                    handleClose={() => setShowConMovUpModal(false)}
                    columns={columns}
                    tableName='tmacom'
                    rowData={editingItem} 
                    onSuccess={handleSuccess}
                    idColumn={idColumn}
                />
                <ModalDelete 
                    show={showConMovDelModal}
                    handleClose={() => setShowConMovDelModal(false)}
                    tableName="tmacom"
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