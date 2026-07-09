import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function IngresosChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hoy = new Date();
    const hace12m = new Date(hoy.getFullYear() - 1, hoy.getMonth(), 1);
    const params = new URLSearchParams({
      desde: hace12m.toISOString().split('T')[0],
      hasta: hoy.toISOString().split('T')[0],
      tipo_personal: 'Todos',
    });
    fetch(`/api/rrhh/reporte-ingresos/generar?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setData((d.trend || []).map(t => ({
            label: t.label,
            Ingresos: t.total,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Card className="shadow-sm"><Card.Body className="text-center py-4"><div className="spinner-border spinner-border-sm" /></Card.Body></Card>;

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <h6 className="text-muted mb-3"><i className="bx bx-line-chart me-1"></i>Tendencia de Ingresos (12 meses)</h6>
        {data.length === 0 ? (
          <p className="text-muted text-center py-4">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} width={30} />
              <Tooltip />
              <Line type="monotone" dataKey="Ingresos" stroke="#696cff" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card.Body>
    </Card>
  );
}
