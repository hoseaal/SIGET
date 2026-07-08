import React from 'react'
import { useState, useEffect } from "react"

export const Bm3 = () => {


    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({});
    const [unidadAdmin, setUnidadAdmin] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

     const [showVeriModal, setShowVeriModal] = useState(false);

  const handleOpenModal = () => setShowVeriModal(true);

    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    const [mensajeMostrado, setMensajeMostrado] = useState(false);



    useEffect(() => {
    const loadData = async () => {
        try {
            const limit = 10;
            let url = `/api/bienes?inc=1&page=${page}&limit=${limit}&estado=3`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
            
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
}, [page, searchQuery, refreshKey]);

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownloadBM3 = async () => {
   try {
  // Hacer la petición para el Excel (GET en lugar de POST)
  const excelResp = await fetch('/api/excel/BM3', {
    method: 'GET',
    credentials: 'include'
  }).then(response => response.blob());

  // Crear y descargar el archivo
  const url = window.URL.createObjectURL(excelResp);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `BM3-${new Date().toISOString().split('T')[0]}.xlsx`);
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
                <h4 className="py-3 mb-4"><span className="text-muted fw-light">Bienes Muebles/</span> BM-3</h4>
                <button id="exportToExcel" className="btn btn-dark shadow-sm" onClick={handleDownloadBM3}>
                    <i className="bx bxs-file me-2"></i> Generar Formulario de BM3
                </button>
            </div>
            <div className="card">
                <h5 className="card-header">Relación de Bienes Faltantes</h5>
                <div className="card-body">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setSearchQuery(search); // Solo dispara búsqueda cuando se presiona el botón
                            setPage(1);
                        }}
                        className="mb-4"
                    >
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
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
                                            }}
                                        >
                                            Limpiar
                                        </button>
                                    )}
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
                                </tr>
                            </thead>
                            <tbody className="table-border-bottom-0">
                                {Object.entries(datosPorDepartamento).map(([depId, bienes]) => (
                                    <React.Fragment key={depId}>
                                        <tr className="bg-light">
                                            <td colSpan="5">
                                                <strong>Departamento {depId}: {departamentosMap[depId] || `Departamento ${depId}`}</strong>
                                            </td>
                                        </tr>
                                        {bienes.map((item, index) => (
                                            <tr key={`${depId}-${index}`}>
                                                <td>{item.bim_ide || ' '}</td>
                                                <td>{truncateText(item.bim_des)}</td>
                                                <td>{truncateText(item.bim_obs)}</td>
                                                <td>{getEstadoBadge(item.est_ide)}</td>
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
            </div>


        </>
    )
}