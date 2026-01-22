import React, { useEffect, useState, useCallback } from "react";
import { Card, Row, Col, Button, Spinner } from "react-bootstrap"; // Agregué Spinner
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --- Funciones de Ayuda ---

const fetchApiData = async (url, accessToken) => {
  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');
      }
      // Manejo silencioso de 404 para arrays vacíos (común en búsquedas sin resultados)
      if (res.status === 404) return [];
      
      const errorData = await res.json();
      throw new Error(`Error en la API (${res.status}): ${errorData.message || res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error al obtener datos de ${url}:`, error);
    return []; // Retornar array vacío en caso de error para no romper Promise.all
  }
};

const getCurrentMonthDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  const formatDate = (date) => date.toISOString().split('T')[0];
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

/**
 * NUEVA FUNCIÓN: Cuenta los bienes individuales dentro de un array de préstamos.
 * Parsea el campo 'bienes_detalles' que viene de la base de datos.
 */
const countItemsInLoans = (loanList) => {
  if (!loanList || !Array.isArray(loanList)) return 0;

  return loanList.reduce((acc, loan) => {
    try {
      // El campo puede venir como string JSON o como objeto ya parseado
      const detalles = typeof loan.bienes_detalles === 'string'
        ? JSON.parse(loan.bienes_detalles)
        : (loan.bienes_detalles || []);
      
      // Si es un array, sumamos su longitud. Si es un objeto único, sumamos 1.
      const cantidad = Array.isArray(detalles) ? detalles.length : (detalles ? 1 : 0);
      return acc + cantidad;
    } catch (e) {
      console.warn('Error al contar bienes en préstamo ID:', loan.pre_ide, e);
      return acc;
    }
  }, 0);
};

// --- Componentes de Gráficos (Sin cambios mayores) ---
const CriticalGoodsPieChart = ({ data }) => {
  const COLORS = data.map(item => item.color);
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value.toLocaleString('es-VE')} bienes`, name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const DepartmentBarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={450}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} fontSize={12} />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(value) => value.toLocaleString('es-VE')} />
        <Legend />
        <Bar dataKey="count" fill="#82ca9d" name="Cantidad de Bienes" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// --- Componente Principal ---
export const DashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [totalValor, setTotalValor] = useState(0);
  const [totalBienes, setTotalBienes] = useState(0);
  const [incorporatedThisMonth, setIncorporatedThisMonth] = useState(0);
  const [decommissionedThisMonth, setDecommissionedThisMonth] = useState(0);
  const [missingBienes, setMissingBienes] = useState(0);
  const [badConditionBienes, setBadConditionBienes] = useState(0); // Rotos fisicamente
  const [noTagBienes, setNoTagBienes] = useState(0);
  const [loanedBienes, setLoanedBienes] = useState(0);
  const [buenEstado, setBuenEstado] = useState(0);

  const [departments, setDepartments] = useState([]);
  const [bienesPorDepartamento, setBienesPorDepartamento] = useState([]);
  
  // Reporte Trimestral
  const [quarterlyReportData, setQuarterlyReportData] = useState(null);
  const [currentDepartmentIndex, setCurrentDepartmentIndex] = useState(0);
  const [loadingReport, setLoadingReport] = useState(false); // Loading especifico para el reporte

  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const { startDate, endDate } = getCurrentMonthDates();

  // --- Carga Inicial ---
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      setError(null);
      try {
        const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
        if (!userRes.ok) throw new Error('No autorizado.');
        const userDataResult = await userRes.json();
        if (!userDataResult.success) throw new Error('Error al verificar usuario.');
        
        setUserData(userDataResult.user);
        const accessToken = userDataResult.user?.accessToken;

        const [
          valorData, 
          totalBienesData, 
          incMesData, 
          desMesData, 
          faltantesData,
          malEstadoData, 
          sinEtiquetaData, 
          prestamosData, // Array de préstamos
          buenEstadoData // Conteo simple de BD
        ] = await Promise.all([
          fetchApiData('/api/reporteBM4/existencia-actual', accessToken),
          fetchApiData('/api/bienes/count?inc=1', accessToken),
          fetchApiData(`/api/bienes/count?fechaIncDesde=${startDate}&fechaIncHasta=${endDate}&inc=1`, accessToken),
          fetchApiData(`/api/bienes/count?fechaDesDesde=${startDate}&fechaDesHasta=${endDate}&inc=0`, accessToken),
          fetchApiData('/api/bienes/count?estado=3&inc=1', accessToken),
          fetchApiData('/api/bienes/count?con=4&inc=1', accessToken),
          fetchApiData('/api/bienes/count?estado=1&inc=1', accessToken),
          fetchApiData('/api/prestamos/normales', accessToken),
          fetchApiData('/api/bienes/count?estado=4&con=1&inc=1', accessToken)
        ]);

        // --- CÁLCULOS CORREGIDOS ---
        const totalItemsPrestados = countItemsInLoans(prestamosData); // Usamos la nueva función

        setTotalValor(valorData.existenciaActualRealTime || 0);
        setTotalBienes(totalBienesData?.meta?.total || 0);
        setIncorporatedThisMonth(incMesData?.meta?.total || 0);
        setDecommissionedThisMonth(desMesData?.meta?.total || 0);
        setMissingBienes(faltantesData?.meta?.total || 0);
        setBadConditionBienes(malEstadoData?.meta?.total || 0);
        setNoTagBienes(sinEtiquetaData?.meta?.total || 0);
        setLoanedBienes(totalItemsPrestados); // Guardamos la cantidad de ITEMS, no de préstamos

        // Calculamos buen estado restando lo que está prestado (ya que el endpoint cuenta todo lo activo y bueno)
        const totalBuenosBD = buenEstadoData?.meta?.total || 0;
        // Evitamos negativos por si acaso los datos no están sincronizados perfectamente
        setBuenEstado(Math.max(0, totalBuenosBD - totalItemsPrestados));

        // Departamentos
        const depts = await fetchApiData('/api/departamentos', accessToken);
        setDepartments(depts);

        // Gráfico de Barras
        const bienesCountPromises = depts.map(dept =>
          fetchApiData(`/api/bienes/count?dep=${dept.dep_ide}&inc=1`, accessToken)
        );
        const bienesCountsResults = await Promise.all(bienesCountPromises);

        const formattedBienesPorDepartamento = depts.map((dept, index) => ({
          name: dept.dep_nom.substring(0, 15) + (dept.dep_nom.length > 15 ? '...' : ''), // Truncar nombre largo
          fullName: dept.dep_nom,
          count: bienesCountsResults[index]?.meta?.total || 0,
        }));
        setBienesPorDepartamento(formattedBienesPorDepartamento);

      } catch (err) {
        console.error(err);
        setError('Error al cargar datos: ' + err.message);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchAllDashboardData();
  }, [startDate, endDate]);

  // --- Carga del Reporte Trimestral (Individual por Depto) ---
  const fetchQuarterlyReport = useCallback(async () => {
    if (departments.length === 0 || !userData || initialLoading) {
      setQuarterlyReportData(null);
      return;
    }
    
    setLoadingReport(true); // Spinner local
    
    try {
      const accessToken = userData?.accessToken;
      const currentDept = departments[currentDepartmentIndex];
      const dep_ide = currentDept.dep_ide;

      const [
        bienesData, 
        malEstadoAlmacenData, 
        prestadosAOtroData,
        prestadosDeOtroData, 
        bienesMalEstadoEnDepartamentoData
      ] = await Promise.all([
        fetchApiData(`/api/bienes/all?dep=${dep_ide}&inc=1`, accessToken),
        fetchApiData(`/api/prestamos/almacen?dep_origen_id=${dep_ide}`, accessToken),
        fetchApiData(`/api/prestamos/normales?dep_origen_id=${dep_ide}`, accessToken),
        fetchApiData(`/api/prestamos/normales?dep_destino_id=${dep_ide}`, accessToken),
        fetchApiData(`/api/bienes/all?dep=${dep_ide}&inc=1&con=4`, accessToken)
      ]);

      // --- CORRECCIÓN DE CONTEOS AQUÍ TAMBIÉN ---
      const countAlmacen = countItemsInLoans(malEstadoAlmacenData);
      const countPrestadosSalida = countItemsInLoans(prestadosAOtroData);
      const countPrestadosEntrada = countItemsInLoans(prestadosDeOtroData);
      
      // Filtrar bienes que están rotos en el depto pero NO están en la lista de enviados a almacén
      // (Para no contarlos doble si la API de bienes/all devuelve todo)
      const bienesEnAlmacenIds = new Set();
      // Un pequeño hack para obtener IDs de los items en almacen si es necesario, 
      // pero por simplicidad asumiremos que el endpoint con=4 trae los locales.
      // Para mayor precisión, el backend debería filtrar esto, pero aquí hacemos conteo simple.
      const countMalEstadoLocal = (Array.isArray(bienesMalEstadoEnDepartamentoData) ? bienesMalEstadoEnDepartamentoData.length : 0);

      setQuarterlyReportData({
        departmentName: currentDept.dep_nom,
        totalBienesActivos: Array.isArray(bienesData) ? bienesData.length : 0,
        bienesMalEstadoEnAlmacen: countAlmacen,
        prestadosAOtroDepartamento: countPrestadosSalida,
        prestadosDeOtroDepartamento: countPrestadosEntrada,
        bienesMalEstadoEnDepartamento: countMalEstadoLocal,
      });

    } catch (err) {
      console.error(err);
      // No seteamos error global para no romper todo el dashboard si falla un depto
    } finally {
      setLoadingReport(false);
    }
  }, [departments, currentDepartmentIndex, userData, initialLoading]);

  useEffect(() => {
    fetchQuarterlyReport();
  }, [fetchQuarterlyReport]);

  const handleNextDepartment = () => setCurrentDepartmentIndex(p => (p + 1) % departments.length);
  const handlePrevDepartment = () => setCurrentDepartmentIndex(p => (p - 1 + departments.length) % departments.length);

  // --- Datos Gráficos ---
  const pieChartData = [
    { name: 'Condiciones Optimas', value: buenEstado, color: '#36A2EB' },
    { name: 'Faltantes', value: missingBienes, color: '#FF6384' },
    { name: 'Mal Estado', value: badConditionBienes, color: '#FF9F40' },
    { name: 'Sin Etiqueta', value: noTagBienes, color: '#FFCD56' },
    { name: 'Prestados', value: loanedBienes, color: '#4BC0C0' },
  ].filter(item => item.value > 0);

  // --- Render ---
  if (initialLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 mb-0">Cargando Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-4">{error}</div>;
  }

  return (
    <>
      <Row>
        {/* Tarjeta Bienvenida */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <h5 className="card-title text-primary">
                ¡Bienvenido {userData?.usu_nom} {userData?.usu_ape}! 🎉
              </h5>
              <p className="card-text">Resumen general del sistema de inventario SIGET.</p>
            </Card.Body>
          </Card>
        </Col>

        {/* KPIs Top */}
        <Col lg={6}>
          <Row>
            <Col sm={6} className="mb-4">
              <Card>
                <Card.Body>
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-2">
                      <span className="avatar-initial rounded bg-label-success"><i className="bx bx-dollar"></i></span>
                    </div>
                    <span className="fw-semibold">Valor Total</span>
                  </div>
                  <h4 className="card-title mb-0">
                    Bs. {totalValor.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h4>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} className="mb-4">
              <Card>
                <Card.Body>
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-2">
                      <span className="avatar-initial rounded bg-label-info"><i className="bx bx-package"></i></span>
                    </div>
                    <span className="fw-semibold">Total Bienes</span>
                  </div>
                  <h4 className="card-title mb-0">{totalBienes.toLocaleString('es-VE')}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        {/* Movimientos Mes */}
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="card-title m-0">Movimientos del Mes</h5>
            </Card.Header>
            <Card.Body>
              <ul className="p-0 m-0 list-unstyled">
                <li className="d-flex mb-4 pb-1 align-items-center justify-content-between">
                  <div>
                    <h6 className="mb-0 text-success">Incorporados</h6>
                    <small className="text-muted">Altas recientes</small>
                  </div>
                  <div className="badge bg-label-success rounded-pill fs-6">
                    +{incorporatedThisMonth}
                  </div>
                </li>
                <li className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="mb-0 text-danger">Desincorporados</h6>
                    <small className="text-muted">Bajas recientes</small>
                  </div>
                  <div className="badge bg-label-danger rounded-pill fs-6">
                    -{decommissionedThisMonth}
                  </div>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Gráfico Torta */}
        <Col md={6} lg={8} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="card-title m-0">Estado de los Bienes</h5>
            </Card.Header>
            <Card.Body>
               <CriticalGoodsPieChart data={pieChartData} />
            </Card.Body>
          </Card>
        </Col>

        {/* Gráfico Barras */}
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="card-title m-0">Distribución por Departamento</h5>
            </Card.Header>
            <Card.Body>
               <DepartmentBarChart data={bienesPorDepartamento} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Reporte Trimestral (Carrusel) */}
      <Row>
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <h5 className="card-title m-0">Reporte Detallado por Departamento</h5>
              <div>
                <Button variant="outline-primary" size="sm" onClick={handlePrevDepartment} disabled={departments.length <= 1 || loadingReport}>
                  <i className="bx bx-chevron-left"></i> Anterior
                </Button>
                <Button variant="outline-primary" size="sm" onClick={handleNextDepartment} disabled={departments.length <= 1 || loadingReport} className="ms-2">
                  Siguiente <i className="bx bx-chevron-right"></i>
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {loadingReport ? (
                 <div className="text-center py-5">
                   <Spinner animation="border" variant="primary" />
                 </div>
              ) : quarterlyReportData ? (
                <div>
                  <h4 className="text-center text-primary mb-4">{quarterlyReportData.departmentName}</h4>
                  <Row className="g-3">
                    <Col md={6} lg={4}>
                      <div className="card shadow-none bg-label-primary h-100">
                        <div className="card-body text-center">
                          <h6 className="mb-2">Total Bienes Propios</h6>
                          <h3 className="mb-0 text-primary">{quarterlyReportData.totalBienesActivos}</h3>
                        </div>
                      </div>
                    </Col>
                    <Col md={6} lg={4}>
                      <div className="card shadow-none bg-label-danger h-100">
                        <div className="card-body text-center">
                          <h6 className="mb-2">En Almacén (Resguardo)</h6>
                          <h3 className="mb-0 text-danger">{quarterlyReportData.bienesMalEstadoEnAlmacen}</h3>
                        </div>
                      </div>
                    </Col>
                    <Col md={6} lg={4}>
                      <div className="card shadow-none bg-label-warning h-100">
                        <div className="card-body text-center">
                          <h6 className="mb-2">Prestados (Salidas)</h6>
                          <h3 className="mb-0 text-warning">{quarterlyReportData.prestadosAOtroDepartamento}</h3>
                        </div>
                      </div>
                    </Col>
                    <Col md={6} lg={4}>
                      <div className="card shadow-none bg-label-info h-100">
                        <div className="card-body text-center">
                          <h6 className="mb-2">Recibidos (Entradas)</h6>
                          <h3 className="mb-0 text-info">{quarterlyReportData.prestadosDeOtroDepartamento}</h3>
                        </div>
                      </div>
                    </Col>
                    <Col md={6} lg={4}>
                      <div className="card shadow-none bg-label-secondary h-100">
                         <div className="card-body text-center">
                          <h6 className="mb-2">Mal Estado (Local)</h6>
                          <h3 className="mb-0 text-secondary">{quarterlyReportData.bienesMalEstadoEnDepartamento}</h3>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              ) : (
                <p className="text-center text-muted">No hay datos disponibles.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};