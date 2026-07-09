import React, { useEffect, useState, useCallback } from 'react';
import { Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MESES = [
  { id: 1, name: 'Enero' }, { id: 2, name: 'Febrero' }, { id: 3, name: 'Marzo' },
  { id: 4, name: 'Abril' }, { id: 5, name: 'Mayo' }, { id: 6, name: 'Junio' },
  { id: 7, name: 'Julio' }, { id: 8, name: 'Agosto' }, { id: 9, name: 'Septiembre' },
  { id: 10, name: 'Octubre' }, { id: 11, name: 'Noviembre' }, { id: 12, name: 'Diciembre' }
];

const ANIOS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
const TIPOS = ['Todos', 'Funcionario', 'Obrero Fijo', 'Jubilado', 'Pensionado', 'Sobreviviente'];

const formatCurrency = (v) => Number(v || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 });

export function CajaAhorroChart({ tipoPersonal: propTipo }) {
  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  const periodoNomina = {
    mes: mesActual === 12 ? 1 : mesActual + 1,
    anio: mesActual === 12 ? hoy.getFullYear() + 1 : hoy.getFullYear(),
  };

  const [periodo, setPeriodo] = useState('mensual');
  const [quincenaNo, setQuincenaNo] = useState(1);
  const [mes, setMes] = useState(periodoNomina.mes);
  const [anio, setAnio] = useState(periodoNomina.anio);
  const [tipoPersonal, setTipoPersonal] = useState(propTipo || 'Todos');
  const [data, setData] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    if (propTipo) setTipoPersonal(propTipo);
  }, [propTipo]);

  const cargar = useCallback(async () => {
    setLoading(true);
    setCargado(false);
    try {
      const params = new URLSearchParams({ mes, anio, tipo_personal: tipoPersonal });
      if (periodo === 'quincenal') params.append('quincena_no', quincenaNo);
      const res = await fetch(`/api/rrhh/caja-ahorro/reporte?${params}`);
      const d = await res.json();
      if (d.ok) {
        setResumen(d.resumen);
        const top = d.data.slice(0, 10).map(r => ({
          name: `${r.nombres?.split(' ')[0] || ''} ${r.apellidos?.split(' ')[0] || ''}`,
          'Aporte': Number(r.total),
        }));
        setData(top);
        setCargado(true);
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, [mes, anio, periodo, quincenaNo, tipoPersonal]);

  useEffect(() => { cargar(); }, []);

  return (
    <Card className="shadow-sm h-100">
      <Card.Body className="d-flex flex-column">
        <h6 className="text-muted mb-3">
          <i className="bx bx-wallet-alt me-1"></i>Caja de Ahorro
        </h6>

        {/* Filtros */}
        <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={periodo} onChange={e => setPeriodo(e.target.value)}>
            <option value="mensual">Mensual</option>
            <option value="quincenal">Quincenal</option>
          </select>

          {periodo === 'quincenal' && (
            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={quincenaNo} onChange={e => setQuincenaNo(Number(e.target.value))}>
              <option value={1}>Q1</option>
              <option value={2}>Q2</option>
            </select>
          )}

          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={mes} onChange={e => setMes(Number(e.target.value))}>
            {MESES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={anio} onChange={e => setAnio(Number(e.target.value))}>
            {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={tipoPersonal} onChange={e => setTipoPersonal(e.target.value)}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <button className="btn btn-sm btn-primary" onClick={cargar} disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-1" />Cargando...</> : <><i className="bx bx-search me-1" />Cargar</>}
          </button>
        </div>

        {/* Resumen */}
        {cargado && resumen && (
          <div className="d-flex gap-4 mb-3">
            <div className="text-center px-3 py-1 rounded" style={{ background: '#f0f8ff' }}>
              <small className="text-muted d-block" style={{ lineHeight: 1.2 }}>Empleados</small>
              <strong className="fs-5">{resumen.total_empleados}</strong>
            </div>
            <div className="text-center px-3 py-1 rounded" style={{ background: '#fffbe6' }}>
              <small className="text-muted d-block" style={{ lineHeight: 1.2 }}>Total Aportes</small>
              <strong className="fs-5">{formatCurrency(resumen.total_general)}</strong>
            </div>
          </div>
        )}

        {/* Gráfica */}
        <div className="flex-grow-1" style={{ minHeight: 250 }}>
          {!cargado && !loading && (
            <p className="text-muted text-center py-5">Haga clic en «Cargar» para ver los datos</p>
          )}
          {loading && (
            <div className="text-center py-5"><div className="spinner-border spinner-border-sm" /></div>
          )}
          {cargado && data.length === 0 && (
            <p className="text-muted text-center py-5">Sin datos para este período</p>
          )}
          {cargado && data.length > 0 && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `Bs.${v.toFixed(0)}`} width={70} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="Aporte" fill="#696cff" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
