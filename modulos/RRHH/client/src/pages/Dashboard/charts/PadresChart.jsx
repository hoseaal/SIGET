import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const RANGOS = [
  { key: '0-5', label: '0-5', color: '#696cff' },
  { key: '5-10', label: '5-10', color: '#71dd37' },
  { key: '10-12', label: '10-12', color: '#ffab00' },
  { key: '12-15', label: '12-15', color: '#ff6384' },
  { key: '15-18', label: '15-18', color: '#9966ff' },
  { key: '18-20', label: '18-20', color: '#03c3ec' },
  { key: '20-25', label: '20-24', color: '#dc3545' },
];

const TIPOS = ['Todos', 'Funcionario', 'Obrero Fijo'];

const RANGO_COLORS = Object.fromEntries(RANGOS.map(r => [r.key, r.color]));

export function PadresChart() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tipoPersonal, setTipoPersonal] = useState('Todos');
  const [rangosActivos, setRangosActivos] = useState(RANGOS.map(r => r.key));

  const toggleRango = (key) => {
    setRangosActivos(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const cargar = async (tipo) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ tipo_personal: tipo });
      const res = await fetch(`/api/rrhh/reporte-padres/generar?${params}`);
      const d = await res.json();
      if (d.ok) {
        setData(d.rangos || []);
        setTotal(d.resumen?.total_hijos || 0);
      }
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(tipoPersonal); }, [tipoPersonal]);

  const filteredData = data
    .filter(r => rangosActivos.includes(r.rango) && r.cantidad > 0)
    .map(r => ({ name: r.label, value: r.cantidad, rango: r.rango }));

  if (loading) return <Card className="shadow-sm"><Card.Body className="text-center py-4"><div className="spinner-border spinner-border-sm" /></Card.Body></Card>;

  return (
    <Card className="shadow-sm h-100">
      <Card.Body className="d-flex flex-column">
        <h6 className="text-muted mb-3"><i className="bx bx-heart me-1"></i>Hijos por Edad ({total})</h6>

        <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={tipoPersonal} onChange={e => setTipoPersonal(e.target.value)}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <div className="d-flex gap-1 flex-wrap">
            {RANGOS.map(r => (
              <button
                key={r.key}
                className={`btn btn-sm ${rangosActivos.includes(r.key) ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={rangosActivos.includes(r.key) ? { backgroundColor: r.color, borderColor: r.color } : {}}
                onClick={() => toggleRango(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-grow-1">
          {filteredData.length === 0 ? (
            <p className="text-muted text-center py-4">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={filteredData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {filteredData.map((entry, i) => <Cell key={i} fill={RANGO_COLORS[entry.rango] || '#ccc'} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
