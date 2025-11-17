import React from 'react'
import { useState, useEffect } from "react"
import { getTableMetadata } from '../../data/fetchData';
import { Dropdown } from 'react-bootstrap';
import ModalEditBm from '../Modales/modalEditBm';
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

    const [userData, setUserData] = useState([]);

     const [search, setSearch] = useState();
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
                    setFilteredMenuData(filterMenuByUserType(menuData, currentUserType));
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
            const limit = searchQuery ? 20 : 10;
            let url;
            
            if (searchQuery) {
                url = `/api/bienes/des?search=${encodeURIComponent(searchQuery)}&page=1&limit=20`;
            } else {
                url = `/api/bienes?inc=1&page=${page}&limit=${limit}`;
                if (filtros.estado) url += `&estado=${filtros.estado}`;
                if (filtros.condicion) url += `&con=${filtros.condicion}`;
                if (filtros.departamento) url += `&dep=${filtros.departamento}`;
            }
            
            const response = await fetch(url);
            const result = await response.json();
            setData(Array.isArray(result.data) ? result.data : result);
            
            setMeta(result.meta || {});
        } catch (error) {
            console.error('Error:', error);
            setData([]);
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
                        className=" d-flex gap-2 align-items-center"
                        >
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar bien por codigo o por descripcion..."
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
                                setFiltros('');
                            }}
                            >
                            Limpiar
                            </button>
                        )}
                        <hr className="my-5" />

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
                        </form>
                        <div className="table-responsive text-nowrap">
                        <table className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Descripción</th>
                                    <th>Observación</th>
                                    <th>Estado</th>
                                    {hasPermission(userType, ACTIONS.VIEW_LOAN_DETAILS) && (<th>Acciones</th> )}
                                </tr>
                            </thead>
                            <tbody className="table-border-bottom-0">
                                {Object.entries(datosPorDepartamento).map(([depId, bienes]) => (
                                    <React.Fragment key={depId}>
                                        <tr className="bg-light">
                                            <td colSpan={userType != '1' ? 5 : 4}>
                                                <strong>Departamento {depId}: {departamentosMap[depId] || `Departamento ${depId}`}</strong>
                                            </td>
                                        </tr>
                                        {bienes.map((item, index) => (
                                            <tr key={`${depId}-${index}`}>
                                                <td>{item.bim_ide || ' '}</td>
                                                <td>{truncateText(item.bim_des)}</td>
                                                <td>{truncateText(item.bim_obs)}</td>
                                                <td>{getEstadoBadge(item.est_ide)}</td>
                                                {hasPermission(userType, ACTIONS.VIEW_LOAN_DETAILS) && (
                                                    <td>
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="secondary" id={`dropdown-${depId}-${index}`} className="nav-dropdown-dark-example">
                                                            <i className="bx bx-dots-vertical-rounded"></i>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item href="#" onClick={() => {
                                                                setEditingItem(item);
                                                                setShowUpdateModal(true);
                                                            }}>
                                                                <i className="bx bx-edit-alt me-1"></i> Editar
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </td>)}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="d-flex justify-content-between align-items-center px-4 pb-3"> 
                        <span className="fw-semibold">{`Total de resultados: ${meta.total || '...'}` }</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center px-4 pb-3">
                    <button
                    className="btn btn-outline-secondary"
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    >
                    ← Anterior
                    </button>

                    <span className="fw-semibold">Página {page} de {meta.totalPages || '...'}</span>

                    <button
                    className="btn btn-outline-secondary"
                    onClick={() => setPage(prev => Math.min(prev + 1, meta.totalPages || prev + 1))}
                    disabled={page === meta.totalPages}
                    >
                    Siguiente →
                    </button>
                </div>
                </div>
                <ModalEditBm 
                show={showUpdateModal}
                handleClose={() => setShowUpdateModal(false)}
                BienId={editingItem?.bim_ide} 
                onSuccess={handleSuccess} />

                
            </div>


        </>
    )
}