import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';

const TIPOS = ['Todos', 'Funcionario', 'Obrero Fijo', 'Jubilado', 'Pensionado', 'Sobreviviente'];

const formatCurrency = (v) => Number(v || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calcularPeriodoObjetivo() {
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  return {
    mes: mes === 12 ? 1 : mes + 1,
    anio: mes === 12 ? hoy.getFullYear() + 1 : hoy.getFullYear(),
  };
}

function KpiCard({ label, value, color, icon }) {
  return (
    <div className="text-center p-3 rounded" style={{ background: '#f8f9fa' }}>
      <div className={`text-${color} mb-1`}><i className={`${icon} fs-4`}></i></div>
      <div className="fw-bold fs-5" style={{ color: '#212529' }}>Bs. {formatCurrency(value)}</div>
      <small className="text-muted">{label}</small>
    </div>
  );
}

export function NominaResumenCard() {
  const { mes: mesObj, anio: anioObj } = calcularPeriodoObjetivo();

  const [mes, setMes] = useState(mesObj);
  const [anio, setAnio] = useState(anioObj);
  const [quincena, setQuincena] = useState(1);
  const [tipoPersonal, setTipoPersonal] = useState('Todos');
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cargado, setCargado] = useState(false);

  const cargar = async () => {
    setLoading(true);
    setCargado(false);
    try {
      const params = new URLSearchParams({ mes, anio, quincena, tipo_personal: tipoPersonal });
      const res = await fetch(`/api/rrhh/nomina/resumen-quincenal?${params}`);
      const d = await res.json();
      if (d.ok) {
        setResumen(d.resumen);
        setCargado(true);
      }
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  return (
    <Card className="shadow-sm h-100">
      <Card.Body className="d-flex flex-column">
        <h6 className="text-muted mb-3">
          <i className="bx bx-money me-1"></i>Nómina — Resumen Quincenal
        </h6>

        <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={quincena} onChange={e => { setQuincena(Number(e.target.value)); }}>
            <option value={1}>Q1</option>
            <option value={2}>Q2</option>
          </select>

          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={mes} onChange={e => setMes(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('es', { month: 'long' })}</option>
            ))}
          </select>

          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={anio} onChange={e => setAnio(Number(e.target.value))}>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={tipoPersonal} onChange={e => setTipoPersonal(e.target.value)}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <button className="btn btn-sm btn-primary" onClick={cargar} disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-1" />Cargando...</> : <><i className="bx bx-search me-1" />Cargar</>}
          </button>
        </div>

        <div className="flex-grow-1 d-flex flex-column justify-content-center">
          {!cargado && !loading && (
            <p className="text-muted text-center py-4">Haga clic en «Cargar» para ver los datos</p>
          )}
          {loading && (
            <div className="text-center py-4"><div className="spinner-border spinner-border-sm" /></div>
          )}
          {cargado && resumen && (
            <div className="row g-2">
              <div className="col-4"><KpiCard label="Total Asignaciones" value={resumen.total_asignaciones} color="success" icon="bx bx-credit-card" /></div>
              <div className="col-4"><KpiCard label="Total Deducciones" value={resumen.total_deducciones} color="danger" icon="bx bx-minus-circle" /></div>
              <div className="col-4"><KpiCard label="Monto Total" value={resumen.total_salario_neto} color="primary" icon="bx bx-money" /></div>
            </div>
          )}
          {cargado && !resumen && (
            <p className="text-muted text-center py-4">Sin datos para este período</p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
