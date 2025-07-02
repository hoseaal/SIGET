import React, { useState, useEffect, useCallback } from 'react';
import ModalCerrarMes from '../Modales/modalCerrarMes'; // Asegúrate de la ruta correcta
import  ModalGenerarReporteBM4 from '../Modales/modalRepBm4';
import { hasPermission, ACTIONS } from '../data/permissions'

export const Bm4 = () => {
     const [userData, setUserData] = useState([]);
            const [usuTipo, setUsuTipo] = useState(null);
        
            useEffect(() => {
                const fetchUserData = async () => {
                    try {
                        const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
                        if (!userRes.ok) throw new Error('No autorizado.');
                        const userDataResult = await userRes.json();
                        if (!userDataResult.success) throw new Error(userDataResult.message || 'Error desconocido al verificar usuario.');
                        setUserData(userDataResult.user);
                        setUsuTipo(userData.usu_tip);
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                    }
                };
        
                fetchUserData();
            },[]);
    // Estados para manejar el modal y los datos del reporte
    const [showModal, setShowModal] = useState(false);
    const [existenciaAnterior, setExistenciaAnterior] = useState(null);
    const [existenciaActualRealTime, setExistenciaActualRealTime] = useState(null);
    const [incorporacionesMesActual, setIncorporacionesMesActual] = useState(null);
    const [desincorporacionesMesActual, setDesincorporacionesMesActual] = useState(null);
    const [mesCerrado, setMesCerrado] = useState(false); // Mantener para el mensaje de la tarjeta
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //modal para reporte

    const [showModalBm4, setShowModalBm4] = useState(false)

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() es 0-indexado (0 = enero, 11 = diciembre)
    const currentMonthName = new Date(currentYear, currentDate.getMonth(), 1)
        .toLocaleString('es-ES', { month: 'long' })
        .replace(/\b\w/g, char => char.toUpperCase()); // Para obtener "Junio" en vez de "junio"

    // Calcular las fechas de inicio y fin del mes actual en formato YYYY-MM-DD
    const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentYear, currentDate.getMonth() + 1, 0);

    const formattedFirstDay = `${firstDayOfMonth.getFullYear()}-${(firstDayOfMonth.getMonth() + 1).toString().padStart(2, '0')}-${firstDayOfMonth.getDate().toString().padStart(2, '0')}`;
    const formattedLastDay = `${lastDayOfMonth.getFullYear()}-${(lastDayOfMonth.getMonth() + 1).toString().padStart(2, '0')}-${lastDayOfMonth.getDate().toString().padStart(2, '0')}`;

    // Función para formatear valores a Bs. (ej. 1.234.567,89 Bs.)
    const formatCurrency = (value) => {
        if (value === null || isNaN(value)) return 'N/A';
        if (value < 0) return value = 0.00;
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: 'VEF',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value).replace('VEF', 'Bs.');
    };

    // Función para realizar las llamadas fetch
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Helper para fetch y parsear JSON
            const fetchAndParse = async (url) => {
                const response = await fetch(url);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error en la petición GET a ${url}`);
                }
                return response.json();
            };

            // 1. Obtener Existencia Anterior (del cierre del mes)
            const prevExistenceData = await fetchAndParse('/api/reporteBM4/existencia-anterior');
            setExistenciaAnterior(prevExistenceData.valorExistenciaAnterior || null);
            setMesCerrado(!!prevExistenceData.valorExistenciaAnterior || !!prevExistenceData.fechaCierre);

            // 2. Obtener Existencia Actual en Tiempo Real
            const realTimeData = await fetchAndParse('/api/reporteBM4/existencia-actual');
            setExistenciaActualRealTime(realTimeData.existenciaActualRealTime);

            // 3. Obtener Incorporaciones del Mes Actual
            const incorpRes = await fetchAndParse(`/api/bienes/all?inc=1&fechaIncDesde=${formattedFirstDay}&fechaIncHasta=${formattedLastDay}`);
            // --- CORRECCIÓN AQUÍ: Convertir bim_val a float ---
            const totalIncorporaciones = incorpRes.reduce((sum, bien) => sum + parseFloat(bien.bim_val || 0), 0);
            setIncorporacionesMesActual(totalIncorporaciones);

            // 4. Obtener Desincorporaciones del Mes Actual
            const desincorpRes = await fetchAndParse(`/api/bienes/all?inc=0&fechaDesDesde=${formattedFirstDay}&fechaDesHasta=${formattedLastDay}`);
            // --- CORRECCIÓN AQUÍ: Convertir bim_val a float ---
            const totalDesincorporaciones = desincorpRes.reduce((sum, bien) => sum + parseFloat(bien.bim_val || 0), 0);
            setDesincorporacionesMesActual(totalDesincorporaciones);

        } catch (err) {
            console.error('Error al cargar datos del reporte BM4:', err);
            setError('No se pudieron cargar los datos del reporte. Por favor, intente de nuevo.');
            setExistenciaAnterior(null);
            setExistenciaActualRealTime(null);
            setIncorporacionesMesActual(null);
            setDesincorporacionesMesActual(null);
            setMesCerrado(false);
        } finally {
            setLoading(false);
        }
    }, [formattedFirstDay, formattedLastDay]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    let existenciaCalculadaDelMes = (parseFloat(existenciaAnterior) || 0) + (parseFloat(incorporacionesMesActual)) - (parseFloat(desincorporacionesMesActual) || 0);
    existenciaCalculadaDelMes = parseFloat(existenciaCalculadaDelMes.toFixed(2));
    if (existenciaCalculadaDelMes < 0) {existenciaCalculadaDelMes = existenciaCalculadaDelMes * -1};
    const diferenciaCalculadaYReal = existenciaActualRealTime !== null ? Math.abs(existenciaActualRealTime - existenciaCalculadaDelMes) : 0;
    const umbralDiferencia = 0.01;

    const handleCloseMesSuccess = () => {
        setShowModal(false);
        fetchData();
    };

    const handleGeneratePdf = () => {
        alert("Función para generar el PDF en desarrollo.");
    };

    let initialFinancialData = {
        existenciaAnterior: existenciaAnterior,
        existenciaFinal: existenciaActualRealTime,
        incorporacionesMesActual: incorporacionesMesActual,
        desincorporacionesMesActual: desincorporacionesMesActual
    }
    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">Bienes Muebles /</span> Reporte BM-4
                </h4>
                { hasPermission(userType, ACTIONS.JEFE_AREA) && (
                    <button
                    id="consolidarInventarioBtn"
                    className={`btn btn-outline-primary`}
                    onClick={() => setShowModal(true)}
                    disabled={loading}
                    >
                    <i className='bx bx-wallet me-1'></i>
                    {mesCerrado ? 'Mes Consolidado' : 'Consolidar Inventario Mensual'}
                </button>)}
            </div>

            <div className="card">
                <h5 className="card-header">
                    Resumen Mensual de Bienes de {currentMonthName} {currentYear}
                </h5>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-2">Cargando datos del reporte...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    ) : (
                        <div className="row g-4">
                            {/* Tarjeta de Existencia Anterior */}
                            <div className="col-md-6 col-lg-4">
                                <div className="card text-white bg-info mb-3 h-100 shadow-sm">
                                    <div className="card-header border-bottom border-light-subtle">Existencia al Inicio de Mes</div>
                                    <div className="card-body d-flex flex-column justify-content-between">
                                        <div>
                                            <h3 className="card-title text-white mb-2">
                                                {existenciaAnterior !== null ? formatCurrency(existenciaAnterior) : 'Pendiente'}
                                            </h3>
                                            <p className="card-text">
                                                Valor consolidado al final del mes anterior ({currentMonth === 1 ? 12 : currentMonth - 1}/{currentYear}).
                                            </p>
                                        </div>
                                        {!mesCerrado && (
                                            <small className="d-block mt-2 text-white-75">
                                                Este valor se consolidará al presionar "Consolidar Inventario Mensual".
                                            </small>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta de Movimientos del Mes */}
                            <div className="col-md-6 col-lg-4">
                                <div className="card text-white bg-warning mb-3 h-100 shadow-sm">
                                    <div className="card-header border-bottom border-light-subtle">Movimientos del Mes Actual</div>
                                    <div className="card-body d-flex flex-column justify-content-between">
                                        <p className="card-text mb-2">
                                            Ingresos: {formatCurrency(incorporacionesMesActual)}
                                        </p>
                                        <p className="card-text mb-2">
                                            Egresos: {formatCurrency(desincorporacionesMesActual)}
                                        </p>
                                        <small className="d-block mt-2 text-white-75">
                                            Refleja las incorporaciones y desincorporaciones de {currentMonth}/{currentYear}.
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta de Existencia Actual en Tiempo Real */}
                            <div className="col-md-6 col-lg-4">
                                <div className="card text-white bg-success mb-3 h-100 shadow-sm">
                                    <div className="card-header border-bottom border-light-subtle">Existencia Actual</div>
                                    <div className="card-body d-flex flex-column justify-content-between">
                                        <h3 className="card-title text-white mb-2">
                                            {formatCurrency(existenciaActualRealTime)}
                                        </h3>
                                        <p className="card-text">
                                            Valor total de bienes activos en el inventario al día de hoy.
                                        </p>
                                        <small className="d-block mt-2 text-white-75">
                                            Este valor se actualiza con cada movimiento en el inventario.
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Sección de Validación/Coherencia */}
                            <div className="col-12 mt-4">
                                <div className="card border-info shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title text-info mb-3">Análisis de Coherencia del Inventario</h5>
                                        <p className="card-text fs-5">
                                            Existencia Teórica: {formatCurrency(existenciaCalculadaDelMes)}
                                            <br/><small className="text-muted">(Existencia Anterior + Ingresos del Mes - Egresos del Mes)</small>
                                        </p>
                                        {diferenciaCalculadaYReal > umbralDiferencia && (
                                            <div className="alert alert-danger mt-3" role="alert">
                                                <strong>¡Advertencia de Inconsistencia!</strong> Se ha detectado una diferencia de <strong className="text-danger">{formatCurrency(diferenciaCalculadaYReal)}</strong> entre la existencia proyectada y la existencia actual en tiempo real. Por favor, revise los movimientos del inventario para {currentMonth}/{currentYear}.
                                            </div>
                                        )}
                                        {diferenciaCalculadaYReal <= umbralDiferencia && (
                                            <div className="alert alert-success mt-3" role="alert">
                                                La existencia proyectada y la existencia actual en tiempo real son coherentes. ¡Datos consistentes!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Botón para Generar PDF */}
                            <div className="col-12 text-center mt-4">
                                <button
                                    className="btn btn-dark btn-lg shadow-sm"
                                    onClick={() => setShowModalBm4(true)}
                                    disabled={loading}
                                >
                                    <i className='bx bxs-file-pdf me-2'></i>
                                    Generar Reporte BM-4 ({currentMonth}/{currentYear})
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ModalCerrarMes
                show={showModal}
                handleClose={() => setShowModal(false)}
                onSuccess={handleCloseMesSuccess}
            />

            <ModalGenerarReporteBM4
                show={showModalBm4}
                handleClose={() => setShowModalBm4(false)}
                initialFinancialData= {initialFinancialData}
            />
        </>
    );
};