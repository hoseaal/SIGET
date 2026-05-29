import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Table, Badge } from "react-bootstrap";
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a83232', '#6b32a8'];

export const DashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setError(null);
      try {
        const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
        if (!userRes.ok) throw new Error('No autorizado.');
        const userDataResult = await userRes.json();
        if (!userDataResult.success) throw new Error(userDataResult.message || 'Error desconocido al verificar usuario.');
        setUserData(userDataResult.user);
        const accessToken = userDataResult.user?.accessToken;

        // Cargar métricas del nuevo endpoint
        const data = await fetchApiData('/api/dashboard', accessToken);
        setDashboardData(data);

      } catch (err) {
        console.error('Error al cargar el dashboard:', err);
        setError('Error al cargar los datos del dashboard: ' + err.message);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (initialLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 mb-0">Cargando Dashboard de Soporte...</p>
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

  // Preparar datos para los gráficos
  const pieChartData = dashboardData?.mantenimientos?.porStatus?.map(item => ({
    name: item.status_nombre,
    value: item.cantidad
  })) || [];

  const barChartData = dashboardData?.equipos?.porTipo?.map(item => ({
    name: item.tipo_nombre,
    count: item.cantidad
  })) || [];

  return (
    <>
      <div className="row mb-4">
        <Col lg={12}>
          <Card>
            <Card.Body>
              <h5 className="card-title text-primary">
                ¡Bienvenido {userData?.nombres || ''} {userData?.apellidos || ''} !
              </h5>
              <p className="mb-0">
                Resumen del estado actual del servicio de Soporte Técnico SIGET.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </div>

      <div className="row">
        {/* KPI: Mantenimientos */}
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <div className="avatar me-2">
                  <span className="avatar-initial rounded bg-label-danger"><i className="bx bx-wrench"></i></span>
                </div>
                <span className="fw-semibold">Mantenimientos</span>
              </div>
              <h4 className="card-title mb-1">{dashboardData?.mantenimientos?.total || 0}</h4>
              <small className="text-muted">Tickets Totales</small>
            </Card.Body>
          </Card>
        </Col>

        {/* KPI: Equipos */}
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <div className="avatar me-2">
                  <span className="avatar-initial rounded bg-label-primary"><i className="bx bx-desktop"></i></span>
                </div>
                <span className="fw-semibold">Equipos</span>
              </div>
              <h4 className="card-title mb-1">{dashboardData?.equipos?.total || 0}</h4>
              <small className="text-muted">Equipos Registrados</small>
            </Card.Body>
          </Card>
        </Col>

        {/* KPI: Actividades */}
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <div className="avatar me-2">
                  <span className="avatar-initial rounded bg-label-success"><i className="bx bx-task"></i></span>
                </div>
                <span className="fw-semibold">Actividades</span>
              </div>
              <h4 className="card-title mb-1">{dashboardData?.actividades?.total || 0}</h4>
              <small className="text-muted">Realizadas</small>
            </Card.Body>
          </Card>
        </Col>

        {/* KPI: Transferencias */}
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <div className="avatar me-2">
                  <span className="avatar-initial rounded bg-label-info"><i className="bx bx-transfer"></i></span>
                </div>
                <span className="fw-semibold">Transferencias</span>
              </div>
              <h4 className="card-title mb-1">{dashboardData?.transferencias?.total || 0}</h4>
              <small className="text-muted">Movimientos de equipos</small>
            </Card.Body>
          </Card>
        </Col>
      </div>

      <div className="row">
        {/* Gráfico de Mantenimientos por Estado */}
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="card-title m-0">Estado de los Mantenimientos</h5>
            </Card.Header>
            <Card.Body>
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} tickets`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted p-3">No hay datos de mantenimientos.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Gráfico de Equipos por Tipo */}
        <Col md={6} lg={8} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="card-title m-0">Equipos Registrados por Tipo</h5>
            </Card.Header>
            <Card.Body>
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value) => value.toLocaleString('es-VE')} />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Cantidad de Equipos">
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted p-3">No hay datos de equipos.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </div>

      <div className="row">
        {/* Mantenimientos Recientes */}
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="card-title m-0">Últimos Tickets de Mantenimiento</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="m-0">
                <thead>
                  <tr>
                    <th>Nro. Caso</th>
                    <th>Asunto</th>
                    <th>Fecha</th>
                    <th>Solicitante</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.mantenimientos?.recientes?.length > 0 ? (
                    dashboardData.mantenimientos.recientes.map((m) => (
                      <tr key={m.id}>
                        <td><strong>{m.nro_caso || 'N/A'}</strong></td>
                        <td>{m.asunto}</td>
                        <td>{new Date(m.fecha_solicitud).toLocaleDateString()}</td>
                        <td>{m.usuario_nombres}</td>
                        <td>
                          <Badge bg={
                            m.status_nombre === 'Resuelto' ? 'success' :
                              m.status_nombre === 'En Proceso' ? 'warning' :
                                m.status_nombre === 'Pendiente' ? 'danger' : 'secondary'
                          }>
                            {m.status_nombre}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-3">No hay mantenimientos recientes.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </div>
    </>
  );
};
