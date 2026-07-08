import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'react-bootstrap';

export const ReportePlaceholder = ({ titulo, descripcion }) => {
  const navigate = useNavigate();

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <h4 className="fw-bold py-3 mb-4">
        <span className="text-muted fw-light">Reportes /</span> {titulo}
      </h4>

      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <div className="display-1 text-muted mb-4">
            <i className="bx bx-building"></i>
          </div>
          <h4 className="text-muted mb-3">{titulo}</h4>
          <p className="text-muted mb-4">{descripcion}</p>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/Reportes')}>
            <i className="bx bx-arrow-back me-1"></i> Volver a Reportes
          </button>
        </Card.Body>
      </Card>
    </div>
  );
};
