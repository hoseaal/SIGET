import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
// import { hasPermission, ACTIONS } from '../../data/dataPermissions'; // Descomenta si usas tu sistema de permisos

export const FuncionariosActivos = () => {
    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({});
    
    // Estados para la búsqueda y paginación
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;

    // Estado de Autenticación (Mantenido de tu diseño original)
    const [userType, setUserType] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Simulación/Llamada real a tu auth
                const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
                if (!userRes.ok) throw new Error('No autorizado.');
                const userDataResult = await userRes.json();
                
                if (!userDataResult.success) throw new Error(userDataResult.message || 'Error desconocido.');
                
                setUserType(userDataResult.user.usu_tip);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    // Carga de Datos de Funcionarios
    useEffect(() => {
        const loadData = async () => {
            try {
                // type=full es necesario para que el backend devuelva "dir_nom" (Dirección)
                let url = `/api/funcionarios?page=${page}&limit=${limit}&est_ide=1&type=full`;
                
                if (searchQuery) {
                    url += `&search=${encodeURIComponent(searchQuery)}`;
                }
                
                const response = await fetch(url);
                const result = await response.json();
                
                // Adaptado a la estructura de respuesta del Backend que construimos
                if (result.data) {
                    setData(result.data);
                    setMeta(result.pagination || {});
                } else if (Array.isArray(result)) {
                    // Por si acaso el backend devuelve un array directo
                    setData(result);
                    setMeta({});
                }
            } catch (error) {
                console.error('Error cargando funcionarios:', error);
                setData([]);
            }
        };
        
        loadData();
    }, [page, searchQuery]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery(search); // Dispara el useEffect al cambiar el query
        setPage(1); // Reinicia a la página 1 al buscar
    };

    const handleClearSearch = () => {
        setSearch('');
        setSearchQuery('');
        setPage(1);
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="py-3 mb-4"><span className="text-muted fw-light">Personal /</span> Funcionarios Activos</h4>
            </div>
            
            <div className="card">
                <h5 className="card-header">Directorio de Funcionarios</h5>
                <div className="card-body">
                    
                    {/* BARRA DE BÚSQUEDA */}
                    <form onSubmit={handleSearchSubmit} className="d-flex gap-2 align-items-center mb-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar funcionario por cédula, nombre o apellido..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">
                            Buscar
                        </button>
                        {searchQuery && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleClearSearch}
                            >
                                Limpiar
                            </button>
                        )}
                    </form>

                    {/* TABLA DE FUNCIONARIOS */}
                    <div className="table-responsive text-nowrap">
                        <table className="table table-bordered table-hover table-striped">
                            <thead>
                                <tr>
                                    <th>Cédula</th>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th>Dirección</th>
                                    {/* {hasPermission(userType, ACTIONS.JEFE_AREA) && <th>Acciones</th>} */}
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="table-border-bottom-0">
                                {data.length > 0 ? (
                                    data.map((item) => (
                                        <tr key={item.fun_ide}>
                                            <td><span className="fw-semibold">{item.fun_ced}</span></td>
                                            <td>{item.fun_nom}</td>
                                            <td>{item.fun_ape}</td>
                                            <td>
                                                {/* Mostramos la dirección del encargo si lo tiene, sino la base */}
                                                {item.enc_direccion || item.dir_nom || (
                                                    <span className="text-muted fst-italic">Sin asignar</span>
                                                )}
                                            </td>
                                            <td>
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="secondary" id={`dropdown-${item.fun_ide}`} className="nav-dropdown-dark-example btn-sm">
                                                        <i className="bx bx-dots-vertical-rounded"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item href="#">
                                                            <i className="bx bx-show me-1"></i> Ver Perfil
                                                        </Dropdown.Item>
                                                        <Dropdown.Item href="#">
                                                            <i className="bx bx-edit-alt me-1"></i> Editar
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">
                                            No se encontraron funcionarios activos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN */}
                    {meta.totalItems > 0 && (
                        <>
                            <div className="d-flex justify-content-between align-items-center px-4 pb-3 mt-3"> 
                                <span className="text-muted small">{`Total de resultados: ${meta.totalItems}` }</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center px-4 pb-3">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                >
                                    ← Anterior
                                </button>

                                <span className="fw-semibold small">Página {page} de {meta.totalPages}</span>

                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setPage(prev => Math.min(prev + 1, meta.totalPages))}
                                    disabled={page === meta.totalPages}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}