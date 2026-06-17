import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';

const reportes = [
  {
    id: 1,
    titulo: 'Caja de Ahorro',
    descripcion: 'Reporte comparativo de aportes empleado vs patrono, con filtros por período y tipo de personal.',
    icono: 'bx bx-wallet-alt',
    ruta: '/Reportes/CajaAhorro',
    color: 'primary',
  },
    {
        id: 2,
        titulo: 'Reporte de Pagos',
        descripcion: 'Total de asignaciones, deducciones y neto a pagar por empleado con resúmenes globales del período.',
        icono: 'bx bx-money',
        ruta: '/Reportes/Pagos',
        color: 'success',
    },
    {
        id: 3,
        titulo: 'Primas y Bonificaciones',
        descripcion: 'Primas por empleado: transporte, hogares, hijos, alimentación, reconocimiento, jerarquía y profesionalización.',
        icono: 'bx bx-gift',
        ruta: '/Reportes/Primas',
        color: 'warning',
    },
    {
        id: 4,
        titulo: 'Ingresos de Personal',
        descripcion: 'Tendencia histórica de contrataciones e ingresos con detalle del personal incorporado.',
        icono: 'bx bx-user-plus',
        ruta: '/Reportes/Ingresos',
        color: 'danger',
    },
  {
    id: 5,
    titulo: 'Resumen de Nómina',
    descripcion: 'Resumen consolidado de nómina con totales por concepto y tipo de empleado.',
    icono: 'bx bx-file',
    ruta: '/Reportes/ResumenNomina',
    color: 'info',
  },
  {
    id: 6,
    titulo: 'Empleados Padres',
    descripcion: 'Empleados con hijos, segmentados por rango de edad. Ideal para planes del Día del Padre/Madre.',
    icono: 'bx bx-heart',
    ruta: '/Reportes/Padres',
    color: 'danger',
  },
];

export const Reportes = () => {
  const navigate = useNavigate();

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <h4 className="fw-bold py-3 mb-4">
        <span className="text-muted fw-light">Reportes /</span> Módulo de Reportes
      </h4>

      <Row className="g-4">
        {reportes.map((r) => (
          <Col key={r.id} md={6} lg={3}>
            <Card
              className={`h-100 border-${r.color} shadow-sm reporte-card`}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(r.ruta)}
              onMouseEnter={(e) => e.currentTarget.classList.add('shadow')}
              onMouseLeave={(e) => e.currentTarget.classList.remove('shadow')}
            >
              <Card.Body className="d-flex flex-column text-center py-4">
                <div className={`display-4 text-${r.color} mb-3`}>
                  <i className={r.icono}></i>
                </div>
                <Card.Title className={`text-${r.color}`}>{r.titulo}</Card.Title>
                <Card.Text className="text-muted small">{r.descripcion}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
