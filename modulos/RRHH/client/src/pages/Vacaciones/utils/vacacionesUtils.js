export const API = '/api/rrhh/vacaciones'

export const STATUS = {
  PROGRAMADO: 1,
  DE_DISFRUTE: 2,
  FINALIZADO: 3,
  REINTEGRO: 4,
  EN_ESPERA: 5
}

export const POR_DERECHO_TAB = 'por_derecho'

export const TABS = [
  { id: POR_DERECHO_TAB, label: 'Por obtener derecho', icon: 'bx bx-time-five', variant: 'info' },
  { id: STATUS.PROGRAMADO, label: 'Programado', icon: 'bx bx-calendar-check', variant: 'primary' },
  { id: STATUS.DE_DISFRUTE, label: 'De disfrute', icon: 'bx bx-sun', variant: 'success' },
  { id: STATUS.FINALIZADO, label: 'Finalizado', icon: 'bx bx-check-double', variant: 'secondary' },
  { id: STATUS.REINTEGRO, label: 'Reintegro', icon: 'bx bx-redo', variant: 'warning' },
  { id: STATUS.EN_ESPERA, label: 'En espera', icon: 'bx bx-shield-quarter', variant: 'dark' }
]

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length !== 3) return '-'
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatCurrency(n) {
  return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES', minimumFractionDigits: 2 }).format(Number(n || 0))
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24))
}

export function esPorDerecho(row) {
  return row.estado_vacaciones === 'por_derecho'
}

export function buildGroups(rows) {
  const groups = []
  const sorted = [...rows].sort((a, b) => {
    const da = (a.direccion_nombre || '').localeCompare(b.direccion_nombre || '')
    if (da) return da
    const dda = (a.division_nombre || '').localeCompare(b.division_nombre || '')
    if (dda) return dda
    return (a.unidad_nombre || '').localeCompare(b.unidad_nombre || '')
  })

  let currentDir = null, currentDiv = null, currentUni = null
  for (const row of sorted) {
    const dir = row.direccion_nombre || 'Sin Dirección'
    const div = row.division_nombre || 'Sin División'
    const uni = row.unidad_nombre || 'Sin Unidad'

    if (dir !== currentDir || div !== currentDiv || uni !== currentUni) {
      groups.push({ type: 'header', dir, div, uni, key: `${dir}|${div}|${uni}` })
      currentDir = dir; currentDiv = div; currentUni = uni
    }
    groups.push({ type: 'row', data: row })
  }
  return groups
}
