import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, Row, Col } from "react-bootstrap";

function AnimatedNumber({ value, decimals = 0, prefix = '' }) {
  const [display, setDisplay] = useState(0)
  const target = Number(value || 0)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  const animate = useCallback((timestamp) => {
    if (!startRef.current) startRef.current = timestamp
    const elapsed = timestamp - startRef.current
    const duration = 800
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    setDisplay(Math.round(target * eased * Math.pow(10, decimals)) / Math.pow(10, decimals))
    if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    else setDisplay(target)
  }, [target, decimals])

  useEffect(() => {
    startRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [animate])

  return <>{prefix}{display.toLocaleString('es-VE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>
}

function StatItem({ icon, label, value, decimals = 0, prefix = '' }) {
  return (
    <div className="text-center py-2">
      <div className="text-muted mb-1"><i className={`${icon} fs-5`}></i></div>
      <h4 className="fw-bold mb-0" style={{ fontSize: '1.5rem' }}>
        <AnimatedNumber value={value} decimals={decimals} prefix={prefix} />
      </h4>
      <small className="text-muted">{label}</small>
    </div>
  )
}

function formatCurrency(n) {
  return Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const DashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rrhhStats, setRrhhStats] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setError(null);
      try {
        const userRes = await fetch('/api/auth/verify-auth', { credentials: 'include' });
        if (!userRes.ok) throw new Error('No autorizado.');
        const userDataResult = await userRes.json();
        if (!userDataResult.success) throw new Error(userDataResult.message || 'Error desconocido al verificar usuario.');
        setUserData(userDataResult.user);
        const statsRes = await fetch('/api/dashboard/stats', { credentials: 'include' });
        if (statsRes.ok) setRrhhStats(await statsRes.json());
      } catch (err) {
        console.error('Error al cargar el dashboard:', err);
        setError('Error al cargar los datos del dashboard: ' + err.message);
        setUserData(null);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

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

  const e = rrhhStats?.empleados
  const n = rrhhStats?.nomina

  return (
    <>
      <div className="row mb-4">
        <Col xs={12}>
          <Card className="shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Card.Body className="py-3">
              <h5 className="mb-0 text-white">
                <i className="bx bx-user-circle me-2"></i>
                ¡Bienvenido {userData?.nombres || ''} {userData?.apellidos || ''}!
              </h5>
              <small className="opacity-75 text-white-50">Resumen general de personal y nómina</small>
            </Card.Body>
          </Card>
        </Col>
      </div>

      {rrhhStats && (
        <>
          <div className="row g-3 mb-4">
            <Col xs={12}>
              <Card className="shadow-sm">
                <Card.Body className="py-3">
                  <h6 className="text-muted mb-3"><i className="bx bx-group me-1"></i>Empleados</h6>
                  <Row className="g-2">
                    <Col xs={4} md={2}><StatItem icon="bx bx-briefcase" label="Funcionarios" value={e.total_funcionarios} /></Col>
                    <Col xs={4} md={2}><StatItem icon="bx bx-hard-hat" label="Obreros" value={e.total_obreros} /></Col>
                    <Col xs={4} md={2}><StatItem icon="bx bx-user-check" label="Jubilados" value={e.total_jubilados} /></Col>
                    <Col xs={4} md={2}><StatItem icon="bx bx-user-x" label="Pensionados" value={e.total_pensionados} /></Col>
                    <Col xs={4} md={2}><StatItem icon="bx bx-user-plus" label="Sobrevivientes" value={e.total_sobrevivientes} /></Col>
                    <Col xs={4} md={2}><StatItem icon="bx bx-world" label="Total General" value={e.total_empleados} /></Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </div>

          <div className="row g-3">
            <Col xs={12}>
              <Card className="shadow-sm">
                <Card.Body className="py-3">
                  <h6 className="text-muted mb-3"><i className="bx bx-wallet me-1"></i>Nómina del Mes</h6>
                  <Row className="g-2">
                    <Col md={4}><StatItem icon="bx bx-credit-card" label="Total Ingresos (Bruto)" value={n.total_bruto} decimals={2} prefix="Bs. " /></Col>
                    <Col md={4}><StatItem icon="bx bx-minus-circle" label="Deducciones" value={n.total_deducciones} decimals={2} prefix="Bs. " /></Col>
                    <Col md={4}><StatItem icon="bx bx-money" label="Neto a Pagar" value={n.total_neto} decimals={2} prefix="Bs. " /></Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </div>
        </>
      )}
    </>
  );
};

export default DashboardPage
