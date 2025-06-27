import React, { useEffect, useState, useCallback } from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
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

/**
 * Obtiene datos de la API. Maneja credenciales y errores básicos.
 * @param {string} url - El endpoint de la API.
 * @param {string} accessToken - El token de acceso para autorización.
 * @returns {Promise<any>} - Los datos de la respuesta en JSON.
 */
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
      const errorData = await res.json();
      throw new Error(`Error en la API (${res.status}): ${errorData.message || res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error al obtener datos de ${url}:`, error);
    throw error;
  }
};

/**
 * Obtiene las fechas de inicio y fin del mes actual.
 * @returns {{startDate: string, endDate: string}} - Objeto con fechas formateadas.
 */
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

// --- Componente de Gráfico de Torta (Aislado) ---
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
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

// --- Componente de Gráfico de Barras (Aislado) ---
const DepartmentBarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={450}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={180} interval={0} />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(value) => value.toLocaleString('es-VE')} />
        <Legend />
        <Bar dataKey="count" fill="#82ca9d" name="Cantidad de Bienes" />
      </BarChart>
    </ResponsiveContainer>
  );
};


// --- Componente Principal del Dashboard ---
export const DashboardPage = () => {
  // --- Estados del Componente ---
  const [userData, setUserData] = useState(null);
  const [totalValor, setTotalValor] = useState(0);
  const [totalBienes, setTotalBienes] = useState(0);
  const [incorporatedThisMonth, setIncorporatedThisMonth] = useState(0);
  const [decommissionedThisMonth, setDecommissionedThisMonth] = useState(0);
  const [missingBienes, setMissingBienes] = useState(0);
  const [badConditionBienes, setBadConditionBienes] = useState(0);
  const [noTagBienes, setNoTagBienes] = useState(0);
  const [loanedBienes, setLoanedBienes] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [bienesPorDepartamento, setBienesPorDepartamento] = useState([]);
  const [quarterlyReportData, setQuarterlyReportData] = useState(null);
  const [currentDepartmentIndex, setCurrentDepartmentIndex] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const { startDate, endDate } = getCurrentMonthDates();

  const truncateText = (text, maxLength = 10) => {
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;

        return (
            <span title={text}>
                {`${text.substring(0, maxLength)}...`}
            </span>
        );
    };

  // --- Efecto para Cargar Todos los Datos Iniciales ---
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      setError(null);
      try {
        const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
        if (!userRes.ok) throw new Error('No autorizado.');
        const userDataResult = await userRes.json();
        if (!userDataResult.success) throw new Error(userDataResult.message || 'Error desconocido al verificar usuario.');
        setUserData(userDataResult.user);
        const accessToken = userDataResult.user?.accessToken;

        const [
          valorData, totalBienesData, incMesData, desMesData, faltantesData,
          malEstadoData, sinEtiquetaData, prestamosData,
        ] = await Promise.all([
          fetchApiData('/api/reporteBM4/existencia-actual', accessToken),
          fetchApiData('/api/bienes/count?inc=1', accessToken),
          fetchApiData(`/api/bienes/count?fechaIncDesde=${startDate}&fechaIncHasta=${endDate}&inc=1`, accessToken),
          fetchApiData(`/api/bienes/count?fechaDesDesde=${startDate}&fechaDesHasta=${endDate}&inc=0`, accessToken),
          fetchApiData('/api/bienes/count?est=3&inc=1', accessToken),
          fetchApiData('/api/bienes/count?con=4&inc=1', accessToken),
          fetchApiData('/api/bienes/count?est=1&inc=1', accessToken),
          fetchApiData('/api/prestamos/normales', accessToken),
        ]);

        setTotalValor(valorData.existenciaActualRealTime || 0);
        setTotalBienes(totalBienesData.meta.total || 0);
        setIncorporatedThisMonth(incMesData.meta.total || 0);
        setDecommissionedThisMonth(desMesData.meta.total || 0);
        setMissingBienes(faltantesData.meta.total || 0);
        setBadConditionBienes(malEstadoData.meta.total || 0);
        setNoTagBienes(sinEtiquetaData.meta.total || 0);
        setLoanedBienes(prestamosData.length || 0);

        const depts = await fetchApiData('/api/departamentos', accessToken);
        setDepartments(depts);

        const bienesCountPromises = depts.map(dept =>
          fetchApiData(`/api/bienes/count?dep=${dept.dep_ide}&inc=1`, accessToken)
        );
        const bienesCountsResults = await Promise.all(bienesCountPromises);

        const formattedBienesPorDepartamento = depts.map((dept, index) => ({
          name: dept.dep_nom.substring(0, 30),
          count: bienesCountsResults[index]?.meta?.total || 0,
        }));
        setBienesPorDepartamento(formattedBienesPorDepartamento);

        if (depts.length > 0) {
           // Lógica para el reporte trimestral inicial se moverá al callback
        }

      } catch (err) {
        console.error('Error general al cargar el dashboard:', err);
        setError('Error al cargar los datos del dashboard: ' + err.message);
        setUserData(null);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchAllDashboardData();
  }, [startDate, endDate]);

  // --- Callback para Cargar el Reporte Trimestral ---
  const fetchQuarterlyReport = useCallback(async () => {
    if (departments.length === 0 || !userData || initialLoading) {
      setQuarterlyReportData(null);
      return;
    }
    setError(null);
    try {
      const accessToken = userData?.accessToken;
      const currentDept = departments[currentDepartmentIndex];
      const dep_ide = currentDept.dep_ide;

      const [
        bienesData, malEstadoAlmacenData, prestadosAOtroData,
        prestadosDeOtroData, bienesMalEstadoEnDepartamentoData
      ] = await Promise.all([
        fetchApiData(`/api/bienes/all?dep=${dep_ide}&inc=1`, accessToken),
        fetchApiData(`/api/prestamos/almacen?dep_origen_id=${dep_ide}`, accessToken),
        fetchApiData(`/api/prestamos/normales?dep_origen_id=${dep_ide}`, accessToken),
        fetchApiData(`/api/prestamos/normales?dep_destino_id=${dep_ide}`, accessToken),
        fetchApiData(`/api/bienes/all?dep=${dep_ide}&inc=1&con=4`, accessToken)
      ]);

      setQuarterlyReportData({
        departmentName: currentDept.dep_nom,
        totalBienesActivos: bienesData.length,
        bienesMalEstadoEnAlmacen: malEstadoAlmacenData.length,
        prestadosAOtroDepartamento: prestadosAOtroData.length,
        prestadosDeOtroDepartamento: prestadosDeOtroData.length,
        bienesMalEstadoEnDepartamento: bienesMalEstadoEnDepartamentoData.length,
      });

    } catch (err) {
      setError('Error al cargar el reporte trimestral: ' + err.message);
    }
  }, [departments, currentDepartmentIndex, userData, initialLoading]);

  // --- Efecto para Disparar la Carga del Reporte Trimestral ---
  useEffect(() => {
    fetchQuarterlyReport();
  }, [fetchQuarterlyReport]);

  // --- Manejadores de Eventos ---
  const handleNextDepartment = () => setCurrentDepartmentIndex(p => (p + 1) % departments.length);
  const handlePrevDepartment = () => setCurrentDepartmentIndex(p => (p - 1 + departments.length) % departments.length);

  // --- Preparación de Datos para Gráficos ---
  const pieChartData = [
    { name: 'Faltantes', value: missingBienes, color: '#FF6384' },
    { name: 'Mal Estado', value: badConditionBienes, color: '#FF9F40' },
    { name: 'Sin Etiqueta', value: noTagBienes, color: '#FFCD56' },
    { name: 'Prestados', value: loanedBienes, color: '#4BC0C0' },
  ].filter(item => item.value > 0);
  
  const userRole = userData?.rol_ide;

  // --- Renderizado Condicional ---
  if (initialLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="ms-2">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center m-4">
        <h4>¡Error!</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">Por favor, intente recargar la página.</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="alert alert-warning text-center m-4">
        No se pudo cargar la información del usuario.
        <br />
        <a href="/login" className="alert-link">Por favor, inicie sesión.</a>
      </div>
    );
  }

  // --- Renderizado del Componente ---
  return (
    <>
      <div className="row">
        {/* Tarjeta de Bienvenida */}
        <Col lg={6} className="mb-4 order-0">
          <Card>
            <div className="d-flex align-items-end row">
              <div className="col-sm-12">
                <Card.Body>
                  <h5 className="card-title text-primary">
                    ¡Bienvenido {userData?.usu_nom || ''} {userData?.usu_ape || ''} 🎉!
                  </h5>
                  <p className="mb-4">
                    Aquí tienes un resumen rápido del estado actual del inventario SIGET.
                  </p>
                </Card.Body>
              </div>
            </div>
          </Card>
        </Col>

        {/* KPIs Generales */}
        <Col lg={6} md={4} className="order-1">
          <Row>
            {/* Valor Total del Inventario */}
            <Col lg={8} md={12} className="mb-4">
              <Card>
                <Card.Body>
                  <span className="fw-medium d-block mb-1">Valor Total <i class='bx  bx-dollar'  ></i> </span>
                  <h3 className="card-title mb-2">
                    Bs. {totalValor.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <small className="text-muted">Inventario Activo</small>
                </Card.Body>
              </Card>
            </Col>
            {/* Cantidad Total de Bienes */}
            <Col lg={4} md={12} className="mb-4">
              <Card>
                <Card.Body>
                  <span>Total Bienes</span>
                  <h3 className="card-title text-nowrap mb-1">
                    {totalBienes.toLocaleString('es-VE')}
                  </h3>
                  <small className="text-muted">Bienes Activos</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </div>

      <div className="row">
        {/* Movimientos del Mes */}
        <Col md={6} lg={4} xl={4} className="order-0 mb-4">
          <Card className="h-100">
            <Card.Header className="d-flex align-items-center justify-content-between pb-0">
              <div className="card-title mb-4">
                <h5 className="m-0 me-8 ">Movimientos del Mes</h5>
                <small className="text-muted">Cifras del mes actual</small>
              </div>
            </Card.Header>
            <Card.Body>
              <ul className="p-0 m-0">
                <li className="d-flex mb-4 pb-1 ">
                  <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2 ">
                    <div className="me-2 ">
                      <h6 className="mb-0 text-success">Incorporados</h6>
                      <small className="text-muted">Bienes nuevos</small>
                    </div>
                    <div className="user-progress">
                      <small className="fw-medium text-success">{incorporatedThisMonth.toLocaleString('es-VE')}</small>
                    </div>
                  </div>
                </li>
                <li className="d-flex mb-4 pb-1">
                  <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                    <div className="me-2">
                      <h6 className="mb-0 text-danger">Desincorporados</h6>
                      <small className="text-muted">Bienes dados de baja</small>
                    </div>
                    <div className="user-progress">
                      <small className="fw-medium text-danger">{decommissionedThisMonth.toLocaleString('es-VE')}</small>
                    </div>
                  </div>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Estado de Bienes Críticos (Gráfico de Torta) */}
        <Col md={6} lg={8} className="order-1 mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="card-title m-0 me-2">Estado de Bienes Críticos</h5>
            </Card.Header>
            <Card.Body className="px-0">
              {pieChartData.length > 0 ? (
                <CriticalGoodsPieChart data={pieChartData} />
              ) : (
                <p className="text-center text-muted p-3">No hay bienes en estado crítico.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Bienes por Departamento (Gráfico de Barras) */}
        <Col xs={12} className="order-2 mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="card-title m-0 me-2">Bienes por Departamento</h5>
            </Card.Header>
            <Card.Body className="px-0">
              {bienesPorDepartamento.length > 0 ? (
                <DepartmentBarChart data={bienesPorDepartamento} />
              ) : (
                <p className="text-center text-muted p-3">No hay datos de bienes por departamento.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </div>

      {/* Reporte Trimestral por Departamento */}
      <div className="row">
        <Col xs={12} className="mb-4">
          <Card className="h-100">
            <Card.Header className="d-flex align-items-center justify-content-between">
              <h5 className="card-title m-0 me-2">Reporte Trimestral por Departamento</h5>
              <div className="d-flex">
                <Button variant="outline-primary" onClick={handlePrevDepartment} disabled={departments.length <= 1}>
                  &#8592; Anterior
                </Button>
                <Button variant="outline-primary" onClick={handleNextDepartment} disabled={departments.length <= 1} className="ms-2">
                  Siguiente &#8594;
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
  {departments.length > 0 && quarterlyReportData ? (
    <div>
      <h4 className="text-center mb-4">{quarterlyReportData.departmentName}</h4>
      <Row className="g-2">
        {/* --- Tarjeta: Total Bienes Activos --- */}
        <Col md={6} lg={4} className="mb-2">
          <Card className=" bg-primary-subtle h-100">
            <Card.Body className="p-2">
              <h6 className="card-title text-muted mb-1" style={{ fontSize: '0.85rem' }}>Total Bienes Pertenecientes a este dep.</h6>
              <p className="card-text h5 fw-bold text-primary-emphasis mb-0">
                {quarterlyReportData.totalBienesActivos.toLocaleString('es-VE')}
              </p>
            </Card.Body>
          </Card>
        </Col>

        {/* --- Tarjeta: Bienes en Mal Estado (Almacén) --- */}
        <Col md={6} lg={4} className="mb-2">
          <Card className=" bg-danger-subtle h-100">
            <Card.Body className="p-2">
              <h6 className="card-title text-muted mb-1" style={{ fontSize: '0.85rem' }}>B. en Mal Estado (Alm.)</h6>
              <p className="card-text h5 fw-bold text-danger-emphasis mb-0">
                {quarterlyReportData.bienesMalEstadoEnAlmacen.toLocaleString('es-VE')}
              </p>
            </Card.Body>
          </Card>
        </Col>

        {/* --- Tarjeta: Bienes Prestados A Otros --- */}
        <Col md={6} lg={4} className="mb-2">
          <Card className=" bg-warning-subtle h-100">
            <Card.Body className="p-2">
              <h6 className="card-title text-muted mb-1" style={{ fontSize: '0.85rem' }}>B. Prestados a Otros</h6>
              <p className="card-text h5 fw-bold text-warning-emphasis mb-0">
                {quarterlyReportData.prestadosAOtroDepartamento.toLocaleString('es-VE')}
              </p>
            </Card.Body>
          </Card>
        </Col>

        {/* --- Tarjeta: Bienes Prestados DE Otros --- */}
        <Col md={6} lg={4} className="mb-2">
          <Card className="bg-info-subtle h-100">
            <Card.Body className="p-2">
              <h6 className="card-title text-muted mb-1" style={{ fontSize: '0.85rem' }}>B. Prestados de Otros</h6>
              <p className="card-text h5 fw-bold text-info-emphasis mb-0">
                {quarterlyReportData.prestadosDeOtroDepartamento.toLocaleString('es-VE')}
              </p>
            </Card.Body>
          </Card>
        </Col>

        {/* --- Tarjeta: Bienes Mal Estado (En Dept.) --- */}
        <Col md={6} lg={4} className="mb-2">
          <Card className="bg-danger-subtle h-100">
            <Card.Body className="p-2">
              <h6 className="card-title text-muted mb-1" style={{ fontSize: '0.85rem' }}>B. Mal Estado (en Dept.)</h6>
              <p className="card-text h5 fw-bold mb-0">
                {quarterlyReportData.bienesMalEstadoEnDepartamento.toLocaleString('es-VE')}
              </p>
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </div>
  ) : (
    <p className="text-center text-muted">No hay departamentos o datos para el reporte trimestral.</p>
  )}
</Card.Body>
          </Card>
        </Col>
      </div>
    </>
  );
};
