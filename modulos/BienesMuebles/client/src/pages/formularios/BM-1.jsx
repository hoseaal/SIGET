import React from 'react'
import { useState, useEffect } from "react"
import { getTableMetadata } from '../../data/fetchData';
import { Dropdown } from 'react-bootstrap';
import ModalEditBm from '../Modales/modalEditBm';
import TipoBienSelect from '../layouts/selectInfinito';

export const Bm1 = () => {
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({});
    const [unidadAdmin, setUnidadAdmin] = useState([]);
    const [tipoBien, setTipoBien] = useState([]);
    const [estado, setEstado] = useState([]);

    const [editingItem, setEditingItem] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const columnAliasBim = {
        'bim_ide': 'Codigo',
        'bim_des': 'Descripcion' ,
        'bim_fec': 'Fecha',
        'bim_ndo': 'Numero de Documento', 
        'bim_val': 'valor',
        'bim_moneda': 'Moneda',
       'bim_color': 'Color', 
       'bim_cod': 'Codigo SUDEBIM',
        'bim_obs': 'Observacion', 
        'bim_sede': 'Sede',
        'est_ide': 'Estado',
        'tip_ide': 'Tipo de Bien',
        'foa_ide': 'Forma de Adquisicion',
        'con_ide': 'Condicion Fisica',
        'esu_ide': 'Estado de Uso',
        'mod_ide': 'Modelo',
        'cae_ide': 'Categoría Especifica',
        'bim_inc': 'Bien',
        'bim_fed': 'Fecha de Desincorporacion',
        'com_ide': 'Concepto de Movimiento',
        'dep_ide': 'Departamento'
    };

    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [filtros, setFiltros] = useState({
        tipo: null,
        estado: null,
    });

    useEffect(() => {
    const loadData = async () => {
        try {
            const limit = searchQuery ? 20 : 10;
            let url;
            
            if (searchQuery) {
                url = `/api/bienes/des?search=${encodeURIComponent(searchQuery)}&page=1&limit=20`;
            } else {
                url = `/api/bienes?inc=1&page=${page}&limit=${limit}`;
                if (filtros.tipo) url += `&tipo=${filtros.tipo}`;
                if (filtros.estado) url += `&estado=${filtros.estado}`;
            }
            
            const response = await fetch(url);
            const result = await response.json();
            
            setData(Array.isArray(result.data) ? result.data : []);
            console.log(url)
            console.log(data)
            setMeta(result.meta || {});
        } catch (error) {
            console.error('Error:', error);
            setData([]);
        }
    };
    
    loadData();
}, [page, filtros.tipo, filtros.estado, searchQuery]);

    useEffect(() => {
        const fetchAllData = async () => {
            const unidadAdminRes = await fetch('/api/departamentos');
            const unidadAdminData = await unidadAdminRes.json();
            setUnidadAdmin(unidadAdminData || []);
        };
        fetchAllData();
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            const tipoBienRes = await fetch('/api/tipos-bien');
            const tipoBienData = await tipoBienRes.json();
            setTipoBien(tipoBienData || []);
        };
        fetchAllData();
    }, []);

    const tiposMap = tipoBien.reduce((acc, tip) => {
        acc[tip.tip_ide] = tip.tip_tip;
        return acc;
    }, {});

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


    const truncateText = (text, maxLength = 30) => {
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;
        
        return (
            <span title={text}>
                {`${text.substring(0, maxLength)}...`}
            </span>
        );
    };

     

        const handleTipoChange = (tipoId) => {
            setFiltros(prev => ({ ...prev, tipo: tipoId }));
            setPage(1);
            
            // Aquí puedes agregar lógica adicional cuando cambia el tipo
            console.log("Tipo seleccionado:", tipoId);
        };

       



    return (
        <>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Bienes Muebles/</span> BM-1</h4>
            
            <div className="card">
                <h5 className="card-header">Relación de Bienes Actuales</h5>
                <div className="card-body">
                    <div className="table-responsive text-nowrap">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setSearchQuery(search); // Solo dispara búsqueda cuando se presiona el botón
                            setPage(1);
                        }}
                        className="p-3 d-flex gap-2 align-items-center"
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
                            <TipoBienSelect
                                tipoBien={tipoBien}
                                value={filtros.tipo}
                                onChange={handleTipoChange}
                            />

                            <div className="dropdown ">
                                <select 
                                    id="estado-select"
                                    className="btn btn-primary dropdown-toggle"
                                    value={filtros.estado || ''}
                                    onChange={(e) => setFiltros({...filtros, estado: e.target.value || null})}
                                >
                                    <option className="form-control" value="">Estado</option>
                                    <option className="form-control" value="1">Sin Etiqueta</option>
                                    <option className="form-control" value="2">Inoperativo</option>
                                    <option className="form-control" value="3">Faltante</option>
                                    <option className="form-control" value="4">Operativo</option>
                                </select>
                            </div>
                        </form>
                        <table className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Tipo de Bien</th>
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
                                            <td colSpan="6">
                                                <strong>Departamento {depId}: {departamentosMap[depId] || `Departamento ${depId}`}</strong>
                                            </td>
                                        </tr>
                                        {bienes.map((item, index) => (
                                            <tr key={`${depId}-${index}`}>
                                                <td>{item.bim_ide || 'N/A'}</td>
                                                <td>{tiposMap[item.tip_ide] || 'N/A'}</td>
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
                                                                setEditingItem(item);
                                                                setShowUpdateModal(true);
                                                            }}>
                                                                <i className="bx bx-edit-alt me-1"></i> Editar
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
            </div>

            {/* Modales */}
            {showUpdateModal && (
                 <ModalEditBm
                        show={showUpdateModal}
                        handleClose={() => setShowUpdateModal(false)}
                        columns={columns}
                        tableName='tmab_m'
                        rowData={editingItem} 
                        foreign='tesdep'
                        idColumn='bim_ide'
                    />
            )}

            {showDeleteModal && (
                <ModalDelete
                    show={showDeleteModal}
                    onHide={() => setShowDeleteModal(false)}
                    itemId={deleteItemId}
                    onDelete={() => {
                        // Aquí puedes implementar la lógica para eliminar el item
                        setShowDeleteModal(false);
                    }}
                />
            )}
        </>
    )
}