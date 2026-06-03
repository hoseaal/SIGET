import React from 'react'
import { useState, useEffect } from "react"
import { getTableMetadata } from '../../data/fetchData';
import { Dropdown } from 'react-bootstrap';
import ModalEditBm from '../Modales/modalEditBm';
import ModalViewBm from '../Modales/modalViewBm';
import ModalPrestarBienRapido from '../Modales/modalPrestarBienRapido';
import ModalEnviarAlmacenRapido from '../Modales/modalEnviarAlmacenRapido';
import { EstadoSelect, EstadoDeUsoSelect, DepartamentoSelect} from '../layouts/selectInfinito';
import { hasPermission, ACTIONS } from '../../data/dataPermissions'

import { FixedSizeList as List } from 'react-window';

export const Bm1 = () => {

    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({});
    const [unidadAdmin, setUnidadAdmin] = useState([]);
    const [condicion, setCondicion] = useState([]);

    const [editingItem, setEditingItem] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [viewingItem, setViewingItem] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const [lendingItem, setLendingItem] = useState(null);
    const [showLendingModal, setShowLendingModal] = useState(false);

    const [sendingItem, setSendingItem] = useState(null);
    const [showSendingModal, setShowSendingModal] = useState(false);

    const [userData, setUserData] = useState([]);

     const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [filtros, setFiltros] = useState({
        estado: null,
        condicion: null,
        departamento: null
    });


   const [userType, setUserType] = useState(null);
    useEffect(() => {
            const fetchUserData = async () => {
                try {
                    const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
                    if (!userRes.ok) throw new Error('No autorizado.');
                    const userDataResult = await userRes.json();
                    if (!userDataResult.success) throw new Error(userDataResult.message || 'Error desconocido al verificar usuario.');
                    
                    const currentUserType = userDataResult.user.usu_tip;
                    setUserType(currentUserType);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
    
            fetchUserData();
        }, []);


   
    const handleSuccess = () => {
            setRefreshKey(prev => prev + 1); // Fuerza recarga
        };
    

    useEffect(() => {
    const loadData = async () => {
        try {
            const limit = 10;
            let url = `/api/bienes?inc=1&page=${page}&limit=${limit}`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
            if (filtros.estado) url += `&estado=${filtros.estado}`;
            if (filtros.condicion) url += `&con=${filtros.condicion}`;
            if (filtros.departamento) url += `&dep=${filtros.departamento}`;
            
            const response = await fetch(url);
            const result = await response.json();
            setData(Array.isArray(result.data) ? result.data : result);
            setMeta(result.meta || {});
        } catch (error) {
            console.error('Error:', error);
            setData([]);
            setMeta({});
        }
    };
    
    loadData();
}, [page, filtros.estado, filtros.condicion, filtros.departamento, searchQuery, refreshKey]);

    useEffect(() => {
        const fetchAllData = async () => {
            const condicionRes = await fetch('/api/condiciones-fisicas');
            const condicionData = await condicionRes.json();
            setCondicion(condicionData || []);
        };
        fetchAllData();
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            const DepRes = await fetch('/api/departamentos');
            const DepData = await DepRes.json();
            setUnidadAdmin(DepData || []);
        };
        fetchAllData();
    }, []);

    const Estados = [
        {   
            "est_ide": "1",
            "est_est": "Sin etiqueta"
        },
        {   
            "est_ide": "2",
            "est_est": "inoperativo"
        },
        {   
            "est_ide": "3",
            "est_est": "Faltante"
        },
        {   
            "est_ide": "4",
            "est_est": "Operativo"
        }
    ]

    const departamentosMap = unidadAdmin.reduce((acc, dep) => {
        acc[dep.dep_ide] = dep.dep_nom;
        return acc;
    }, {});

    // Agrupar datos por departamento
    const datosPorDepartamento = data.reduce((acc, item) => {
        const depId = item.dep_ide;
        if (!acc[depId]) {
            acc[depId] = [];
        }
        acc[depId].push(item);
        return acc;
    }, {});

    // Función para obtener el badge según est_ide
    const getEstadoBadge = (est_ide) => {
        switch(est_ide) {
            case 1:
                return <span className="badge bg-label-secondary me-1">Sin etiqueta</span>;
            case 2:
                return <span className="badge bg-label-danger me-1">Inoperativo</span>;
            case 3:
                return <span className="badge bg-label-warning me-1">Faltante</span>;
            case 4:
                return <span className="badge bg-label-success me-1">Operativo</span>;
            default:
                return <span className="badge bg-label-dark me-1">Desconocido</span>;
        }
    };


    const truncateText = (text, maxLength = 10) => {
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;
        
        return (
            <span title={text}>
                {`${text.substring(0, maxLength)}...`}
            </span>
        );
    };

        const handleEstadoChange = (estadoId) => {
            setFiltros(prev => ({ ...prev, estado: estadoId }));
            setPage(1);
            
            // Aquí puedes agregar lógica adicional cuando cambia el estado
            console.log("estado seleccionado:", estadoId);
        };

        const handleCondicionChange = (condicionId) => {
            setFiltros(prev => ({ ...prev, condicion: condicionId }));
            setPage(1);
            
            // Aquí puedes agregar lógica adicional cuando cambia el estado
            console.log("condición seleccionada:", condicionId);
        };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
   try {
  // Hacer la petición para el Excel (GET en lugar de POST)
  const excelResp = await fetch('/api/excel/BM1-sudebim', {
    method: 'GET',
    credentials: 'include'
  }).then(response => response.blob());

  // Crear y descargar el archivo
  const url = window.URL.createObjectURL(excelResp);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `BM1-sudebim_${new Date().toISOString().split('T')[0]}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();


} catch (error) {
  console.error('Error al generar Excel:', error);
} finally {
  setLoading(false);
}
  };

  const handleDownloadBM1 = async () => {
   try {
  // Hacer la petición para el Excel (GET en lugar de POST)
  const excelResp = await fetch('/api/excel/BM1', {
    method: 'GET',
    credentials: 'include'
  }).then(response => response.blob());

  // Crear y descargar el archivo
  const url = window.URL.createObjectURL(excelResp);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `BM1-${new Date().toISOString().split('T')[0]}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();


} catch (error) {
  console.error('Error al generar Excel:', error);
} finally {
  setLoading(false);
}
  };

    return (
        <>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="py-3 mb-4"><span className="text-muted fw-light">Bienes Muebles/</span> BM-1</h4>
                <button id="exportToExcel" className="btn btn-dark shadow-sm" onClick={handleDownload}>
                    <i className="bx bxs-file me-2"></i> SUDEBIM carga de bienes muebles
                </button>
                <button id="exportToExcel" className="btn btn-dark shadow-sm" onClick={handleDownloadBM1}>
                    <i className="bx bxs-file me-2"></i> Generar Formulario de BM1 
                </button>
            </div>
            
            <div className="card">
                <h5 className="card-header">Relación de Bienes Actuales</h5>
                <div className="card-body">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setSearchQuery(search); // Solo dispara búsqueda cuando se presiona el botón
                            setPage(1);
                        }}
                        className="mb-4"
                    >
                        <div className="row g-3 align-items-center">
                            <div className="col-12 col-md-5">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Buscar por código o descripción..."
                                        value={search || ''}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <button type="submit" className="btn btn-outline-primary">
                                        Buscar
                                    </button>
                                    {(searchQuery || search) && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => {
                                                setSearch('');
                                                setSearchQuery('');
                                                setPage(1);
                                                setFiltros({
                                                    estado: null,
                                                    condicion: null,
                                                    departamento: null
                                                });
                                            }}
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="col-12 col-md-7">
                                <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                                    <EstadoSelect
                                        tipoBien={Estados}
                                        value={filtros.estado}
                                        onChange={handleEstadoChange}
                                    />

                                    <EstadoDeUsoSelect
                                        tipoBien={condicion}
                                        value={filtros.condicion}
                                        onChange={handleCondicionChange}
                                    />

                                    <DepartamentoSelect
                                        tipoBien={unidadAdmin}
                                        value={filtros.departamento}
                                        onChange={(depId) => setFiltros(prev => ({ ...prev, departamento: depId }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                        <div className="table-responsive text-nowrap">
                        <table className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Descripción</th>
                                    <th>Observación</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="table-border-bottom-0">
                                {Object.entries(datosPorDepartamento).map(([depId, bienes]) => (
                                    <React.Fragment key={depId}>
                                        <tr className="bg-light">
                                            <td colSpan={5}>
                                                <strong>Departamento {depId}: {departamentosMap[depId] || `Departamento ${depId}`}</strong>
                                            </td>
                                        </tr>
                                        {bienes.map((item, index) => (
                                            <tr key={`${depId}-${index}`}>
                                                <td>{item.bim_ide || ' '}</td>
                                                <td>{truncateText(item.bim_des)}</td>
                                                <td>{truncateText(item.bim_obs)}</td>
                                                <td>{getEstadoBadge(item.est_ide)}</td>
                                                <td>
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="secondary" id={`dropdown-${depId}-${index}`} className="nav-dropdown-dark-example">
                                                            <i className="bx bx-dots-vertical-rounded"></i>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item href="#" onClick={() => {
                                                                setViewingItem(item);
                                                                setShowViewModal(true);
                                                            }}>
                                                                <i className="bx bx-show me-1"></i> Vista
                                                            </Dropdown.Item>
                                                            {[3, 4, 5].includes(Number(userType)) && (
                                                                <Dropdown.Item href="#" onClick={() => {
                                                                    setEditingItem(item);
                                                                    setShowUpdateModal(true);
                                                                }}>
                                                                    <i className="bx bx-edit-alt me-1"></i> Editar
                                                                </Dropdown.Item>
                                                            )}
                                                            <Dropdown.Item href="#" onClick={() => {
                                                                setLendingItem(item);
                                                                setShowLendingModal(true);
                                                            }}>
                                                                <i className="bx bx-share-alt me-1"></i> Prestar bien
                                                            </Dropdown.Item>
                                                            <Dropdown.Item href="#" onClick={() => {
                                                                setSendingItem(item);
                                                                setShowSendingModal(true);
                                                            }}>
                                                                <i className="bx bx-archive-in me-1"></i> Enviar a almacén
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
                    {/* Dynamic Pagination Bar */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-3 bg-light border-top rounded-bottom mt-4">
                         <div className="text-muted small">
                            {meta.total > 0 ? (
                                <span>
                                    Mostrando <strong>{((page - 1) * 10) + 1}</strong> a{' '}
                                    <strong>{Math.min(page * 10, meta.total)}</strong> de{' '}
                                    <strong>{meta.total}</strong> resultados
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
                <ModalEditBm 
                    show={showUpdateModal}
                    handleClose={() => setShowUpdateModal(false)}
                    BienId={editingItem?.bim_ide} 
                    onSuccess={handleSuccess} 
                />

                <ModalViewBm
                    show={showViewModal}
                    handleClose={() => setShowViewModal(false)}
                    BienId={viewingItem?.bim_ide}
                />

                <ModalPrestarBienRapido
                    show={showLendingModal}
                    handleClose={() => setShowLendingModal(false)}
                    item={lendingItem}
                    onSuccess={handleSuccess}
                />

                <ModalEnviarAlmacenRapido
                    show={showSendingModal}
                    handleClose={() => setShowSendingModal(false)}
                    item={sendingItem}
                    onSuccess={handleSuccess}
                />

                
            </div>


        </>
    )
}