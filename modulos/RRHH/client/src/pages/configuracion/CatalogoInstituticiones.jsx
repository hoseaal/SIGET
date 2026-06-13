import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { getTableMetadata } from '../../data/fetchData';
import ModalInsert from '../Modales/modalInsert';
import ModalUpdate from '../Modales/modalUpdate';
import ModalDelete from '../Modales/modalDelete';

export const CatalogoInstituticiones = () => {
    const [columns, setColumns] = useState([]);
    const [modalColumns, setModalColumns] = useState([]);
    const [idColumn, setIdColumn] = useState(null);
    const [data, setData] = useState([]);
    const [showInsertModal, setShowInsertModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const columnAlias = {
        'id_institucion': 'ID',
        'nombre': 'Nombre de la Institución',
        'siglas': 'Siglas'
    };

    const [refreshKey, setRefreshKey] = useState(0);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    useEffect(() => {
        const loadData = async () => {
          try {
            const { columns, primaryKey } = await getTableMetadata('catalogo_instituciones');
            
            const formattedColumns = columns.map(col => ({
                originalName: col.name,
                displayName: columnAlias[col.name] || col.name,
                isPrimaryKey: col.name === primaryKey
            }));
            
            setColumns(formattedColumns);
            
            // Ocultamos las siglas en el modal porque se generan automáticamente desde el backend
            setModalColumns(formattedColumns.filter(col => col.originalName !== 'siglas'));
            setIdColumn(primaryKey);

            const res = await fetch('/api/instituciones', { credentials: 'include' });
            const data = await res.json();
            setData(data);
          } catch (error) {
            console.error('Error cargando instituciones:', error);
          }
        };
        loadData();
    }, [refreshKey]);

    const filteredData = data.filter(item => {
        const query = searchTerm.toLowerCase();
        const nombre = (item.nombre || '').toLowerCase();
        const siglas = (item.siglas || '').toLowerCase();
        return nombre.includes(query) || siglas.includes(query);
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración /</span> Catálogo de Instituciones</h4>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Instituciones</h5>
                    <button onClick={() => setShowInsertModal(true)} className="btn btn-primary">
                        <i className="bx bx-plus me-1"></i> Nueva Institución
                    </button>
                </div>
                
                <div className="card-body pb-0">
                    <input 
                        type="text" 
                        className="form-control mb-3" 
                        placeholder="Buscar por nombre o siglas..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <ModalInsert
                    show={showInsertModal}
                    handleClose={() => setShowInsertModal(false)}
                    columns={modalColumns}
                    tableName="catalogo_instituciones"
                    onSuccess={handleSuccess}
                />
                
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columns.map((col, index) => (
                                    <th key={index}>{col.displayName}</th>
                                ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {currentItems.map((item, index) => (
                                <tr key={index}>
                                    {columns.map((col) => (
                                        <td key={`${index}-${col.originalName}`}>
                                            {item[col.originalName.toLowerCase()] ?? item[col.originalName] ?? null}
                                        </td>
                                    ))}
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="secondary" id="dropdown-basic" className="nav-dropdown-dark-example">
                                                <i className="bx bx-dots-vertical-rounded"></i>
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item href="#" onClick={() => {
                                                    setEditingItem(item);
                                                    setShowUpdateModal(true);
                                                }}>
                                                    <i className="bx bx-edit-alt me-1"></i> Editar
                                                </Dropdown.Item>
                                                <Dropdown.Item href="#" onClick={() => {
                                                    setDeleteItem(item[idColumn] || item[idColumn.toLowerCase()]);
                                                    setShowDeleteModal(true);
                                                }}>
                                                    <i className="bx bx-trash me-1"></i> Eliminar
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card-footer d-flex justify-content-between align-items-center">
                    <span>
                        Mostrando {filteredData.length === 0 ? 0 : indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredData.length)} de {filteredData.length} entradas
                    </span>
                    <nav>
                        <ul className="pagination mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Anterior</button>
                            </li>
                            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Siguiente</button>
                            </li>
                        </ul>
                    </nav>
                </div>

                <ModalUpdate 
                    show={showUpdateModal}
                    handleClose={() => setShowUpdateModal(false)}
                    columns={modalColumns}
                    tableName="catalogo_instituciones"
                    rowData={editingItem} 
                    onSuccess={handleSuccess}
                    idColumn={idColumn}
                />
                
                <ModalDelete 
                    show={showDeleteModal}
                    handleClose={() => setShowDeleteModal(false)}
                    tableName="catalogo_instituciones"
                    rowId={deleteItem} 
                    idColumn={idColumn} 
                    onSuccess={handleSuccess} 
                />
            </div>     
        </div>
    );
}

export default CatalogoInstituticiones;
