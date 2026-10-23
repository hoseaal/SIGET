export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

/**
 * Clasificaciones del sistema. Se mantienen como referencia visual (colores y
 * etiquetas cortas); el listado oficial se obtiene del endpoint
 * /api/soporte/clasificaciones.
 */
export const CLASIFICACIONES = [
  {
    codigo: 'PREV_HW',
    nombre: 'Mantenimiento preventivo de hardware',
    short: 'Prev. HW',
    color: 'badge-soft-blue',
    kpi: 'blue'
  },
  {
    codigo: 'PREV_SW',
    nombre: 'Mantenimiento preventivo de software',
    short: 'Prev. SW',
    color: 'badge-soft-green',
    kpi: 'green'
  },
  {
    codigo: 'CORR_HW',
    nombre: 'Mantenimiento correctivo de hardware',
    short: 'Corr. HW',
    color: 'badge-soft-gold',
    kpi: 'gold'
  },
  {
    codigo: 'CORR_SW',
    nombre: 'Mantenimiento correctivo de software',
    short: 'Corr. SW',
    color: 'badge-soft-red',
    kpi: 'red'
  },
  {
    codigo: 'SERV_REDES',
    nombre: 'Servicios / Redes',
    short: 'Serv./Redes',
    color: 'badge-soft-blue',
    kpi: 'blue'
  },
  {
    codigo: 'INFORMES',
    nombre: 'Informes',
    short: 'Informes',
    color: 'badge-soft-gray',
    kpi: 'green'
  }
]

const MAPA_CLASIFICACIONES = CLASIFICACIONES.reduce((acc, c) => {
  acc[c.codigo] = c
  acc[c.nombre] = c
  return acc
}, {})

export function clasificacionInfo (value) {
  return MAPA_CLASIFICACIONES[value] || null
}

export function clasificacionLabel (value, short = false) {
  const found = clasificacionInfo(value)
  if (!found) return value || '-'
  return short ? found.short : found.nombre
}

export function clasificacionColor (value) {
  return clasificacionInfo(value)?.color || 'badge-soft-gray'
}

export function clasificacionKpi (value) {
  return clasificacionInfo(value)?.kpi || 'blue'
}

export function clasificacionShort (nombre, codigo) {
  return clasificacionInfo(codigo)?.short || nombre || '-'
}

// Lunes de la semana de la fecha dada (hora local)
export function getMonday (date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

export function getFriday (monday) {
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  friday.setHours(23, 59, 59, 999)
  return friday
}

export function toISODate (date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate (value) {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatLongDate (value) {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })
}
