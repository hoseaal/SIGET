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

    // Estado para subcategorías
    const [columns2, setColumns2] = useState([]);
    const [idColumn2, setIdColumn2] = useState(null);
    const [data2, setData2] = useState([]);
    const [showSubcatModal, setShowSubcatModal] = useState(false);

    // Cargar columnas de categoría
    useEffect(() => {
        const loadData = async () => {
            try {
                const { columns: catColumns, idColumn: catIdColumns } = await fetchTableColumns('tmacat');
                setColumns(catColumns || []);
                setIdColumn(catIdColumns);
            } catch (error) {
                console.error("Error cargando categorías:", error);
                setColumns([]);
            }
        };
        loadData();
    }, []);

    // Cargar columnas de subcategoría
    useEffect(() => {
        const loadData = async () => {
            try {
                const { columns: subcatColumns, idColumn: subcatIdColumn } = await fetchTableColumns('tessca');
                setColumns2(subcatColumns || []);
                setIdColumn2(subcatIdColumn);
            } catch (error) {
                console.error("Error cargando subcategorías:", error);
                setColumns2([]);
            }
        };
        loadData();
    }, []);

    // Cargar datos de categoría
    useEffect(() => {
        if (columns.length > 0) {
            const fetchAllData = async () => {
                try {
                    const registrosData = await fetchData('tmacat', '*');
                    setData(registrosData);
                } catch (error) {
                    console.error("Error cargando datos:", error);
                }
            };
            fetchAllData();
        }
    }, [columns]);

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
    }, [columns2]);
   return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración General /</span> Categorias</h4>
            <div className="card">
                <h5 className="card-header">Categorias 
                   <div className="mt-3">
                    <button type="button" className="btn btn-primary"  onClick={() => setShowCatModal(true)}>Abrir Modal</button>
                    <ModalInsert show={showCatModal}
                     handleClose={() => setShowCatModal(false)}
                     columns={columns}
                      />
                  </div>        
                </h5>
                <div className="table-responsive text-nowrap">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      {columns.map((col, index) => (
                        <th key={index}>{col}</th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-border-bottom-0">
                    {data.map((item, index) => (
                      <tr key={index}>
                        {/* Mapea solo las columnas que existen en los datos */}
                        {columns.map((col) => (
                          <td key={`${index}-${col}`}>
                            {item[col.toLowerCase()] || 'N/A'}
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
                <h5 className="card-header">Sub-Categorias 
                <div className="mt-3">
                    <button type="button" className="btn btn-primary"  onClick={() => setShowSubcatModal(true)}>Abrir Modal</button>
                    <ModalInsert show={showSubcatModal}
                    handleClose={() => setShowSubcatModal(false)}
                     columns={columns2}
                      />
                  </div> 
                </h5>
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {
                                  columns2.map((col, index) => (
                                    <th key={index}>
                                      {typeof col === 'string' ? col : 'Columna inválida'}
                                    </th>
                                  ))
                                }
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {data2.map((item, index) => (
                                <tr key={index}>
                                    {/* Mapea solo las columnas que existen en los datos */}
                                      {columns2.map((col) => (
                                        <td key={`${index}-${col}`}>
                                          {item[col.toLowerCase()] || 'N/A'}
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
            {/*Modal Insert */}
              
        </div>
    )
}