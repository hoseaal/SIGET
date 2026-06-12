export const MESES_NOMINA = [
  { id: 1, name: 'Enero' },
  { id: 2, name: 'Febrero' },
  { id: 3, name: 'Marzo' },
  { id: 4, name: 'Abril' },
  { id: 5, name: 'Mayo' },
  { id: 6, name: 'Junio' },
  { id: 7, name: 'Julio' },
  { id: 8, name: 'Agosto' },
  { id: 9, name: 'Septiembre' },
  { id: 10, name: 'Octubre' },
  { id: 11, name: 'Noviembre' },
  { id: 12, name: 'Diciembre' }
]

export const TIPOS_NOMINA = new Set(['1', '2', 'unificada'])

export function calcularPeriodoNominaObjetivo(fechaServidor = new Date()) {
  const fecha = fechaServidor instanceof Date ? fechaServidor : new Date(fechaServidor)

  if (Number.isNaN(fecha.getTime())) {
    throw new Error('Fecha de servidor invalida')
  }

  const mesCalendario = fecha.getMonth() + 1
  const mesObjetivo = mesCalendario === 12 ? 1 : mesCalendario + 1
  const anioObjetivo = mesCalendario === 12 ? fecha.getFullYear() + 1 : fecha.getFullYear()
  const mesNombre = MESES_NOMINA.find(mes => mes.id === mesObjetivo)?.name

  return {
    mes: mesObjetivo,
    mesNombre,
    anio: anioObjetivo,
    fechaServidor: fecha.toISOString()
  }
}

export function normalizarTipoNomina(tipoNomina) {
  const tipo = String(tipoNomina ?? '1').trim().toLowerCase()

  if (!TIPOS_NOMINA.has(tipo)) {
    throw new Error('Tipo de nomina invalido. Use 1, 2 o unificada.')
  }

  return tipo
}

export function crearEncabezadoAuditoria(periodo, fechaEmision = new Date()) {
  return `Nómina correspondiente al mes: ${periodo.mesNombre} ${periodo.anio} | Generado el: ${fechaEmision.toLocaleString('es-VE')}`
}
