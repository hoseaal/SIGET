import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaClipboardList, FaCalendarDay, FaDesktop, FaUsers,
  FaArrowRight, FaCircleInfo
} from 'react-icons/fa6'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import api from '../../utils/helpFetch.js'
import { CLASIFICACIONES, clasificacionShort, formatDate } from '../../utils/dateHelpers.js'

const COLORS = ['#1466a8', '#1c8a4c', '#e6a817', '#c0392b', '#6a45c2', '#0b3d6b']

export default function DashboardPage () {
  const [stats, setStats] = useState(null)
  const [recientes, setRecientes] = useState([])
  const [clasificaciones, setClasificaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      try {
        const [statsData, actividades, clas] = await Promise.all([
          api.get('/actividades/estadisticas'),
          api.get('/actividades'),
          api.get('/clasificaciones')
        ])
        if (!activo) return
        setStats(statsData)
        setRecientes(actividades.slice(0, 6))
        setClasificaciones(clas)
      } catch (error) {
        console.error(error)
      } finally {
        if (activo) setLoading(false)
      }
    }
    cargar()
    return () => { activo = false }
  }, [])

  const baseClasificaciones = clasificaciones.length ? clasificaciones : CLASIFICACIONES

  const porClasificacion = baseClasificaciones.map(c => {
    const encontrada = stats?.porClasificacion?.find(
      p => p.clasificacion_codigo === c.codigo
    )
    return {
      name: c.short || clasificacionShort(c.nombre, c.codigo),
      total: Number(encontrada?.total || 0),
      codigo: c.codigo,
      nombre: c.nombre
    }
  })

  const kpis = [
    {
      label: 'Actividades registradas',
      value: stats?.total ?? 0,
      icon: FaClipboardList,
      color: 'blue'
    },
    {
      label: 'Actividades este mes',
      value: stats?.mes_actual ?? 0,
      icon: FaCalendarDay,
      color: 'gold'
    },
    {
      label: 'Bienes de soporte',
      value: stats?.total_equipos ?? 0,
      icon: FaDesktop,
      color: 'green'
    },
    {
      label: 'Usuarios activos',
      value: stats?.total_usuarios ?? 0,
      icon: FaUsers,
      color: 'purple'
    }
  ]

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-muted">Cargando informacion...</p>
      </div>
    )
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Panel de control</h2>
          <p>Resumen general de las actividades de soporte tecnico.</p>
        </div>
        <Link to="/actividades" className="btn btn-cet">
          <FaClipboardList className="me-2" /> Ir a actividades
        </Link>
      </div>

      <div className="row g-3 mb-4">
        {kpis.map(kpi => (
          <div className="col-12 col-sm-6 col-xl-3" key={kpi.label}>
            <div className="kpi-card">
              <div className={`kpi-icon ${kpi.color}`}>
                <kpi.icon />
              </div>
              <div>
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-label">{kpi.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <div className="card-cet h-100">
            <div className="p-4 pb-2 d-flex justify-content-between align-items-center">
              <h3 className="section-title">Actividades del mes por clasificacion</h3>
              <span className="badge badge-soft-blue">{stats?.mes_actual ?? 0} en total</span>
            </div>
            <div style={{ height: 320, padding: '10px 18px 22px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porClasificacion} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eef6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7a8d' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7a8d' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(20, 102, 168, 0.06)' }}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e3e9f1', fontSize: 12 }}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {porClasificacion.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card-cet h-100">
            <div className="p-4 pb-2 d-flex justify-content-between align-items-center">
              <h3 className="section-title">Ultimas actividades</h3>
              <Link to="/actividades" className="text-decoration-none small fw-semibold">
                Ver todas <FaArrowRight size={11} />
              </Link>
            </div>
            <div className="px-2 pb-2">
              {recientes.length === 0
                ? (
                  <div className="empty-state py-4">
                    <FaCircleInfo />
                    <div>Aun no hay actividades registradas.</div>
                  </div>
                  )
                : (
                  <div className="list-group list-group-flush">
                    {recientes.map(a => (
                      <div key={a.id} className="list-group-item border-0 px-3 py-3">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div>
                            <div className="fw-semibold" style={{ fontSize: '0.86rem' }}>
                              {a.tipo_actividad_nombre}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.76rem' }}>
                              {a.departamento_nombre}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="badge badge-soft-blue d-inline-block">
                              {a.nro_act}
                            </div>
                            <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                              {formatDate(a.fecha)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
            </div>
          </div>
        </div>
      </div>

      <div className="card-cet mt-4">
        <div className="p-4 pb-2">
          <h3 className="section-title">Distribucion por clasificacion</h3>
        </div>
        <div className="row g-3 p-4 pt-2">
          {porClasificacion.map(c => (
            <div className="col-12 col-md-6 col-xl-4" key={c.codigo}>
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.8rem' }}>
                <span className="text-muted">{c.nombre}</span>
                <span className="fw-bold">{c.total}</span>
              </div>
              <div className="progress" style={{ height: 7, borderRadius: 8 }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${stats?.mes_actual ? (c.total / stats.mes_actual) * 100 : 0}%`,
                    backgroundColor: '#696cff'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
