/* eslint-disable camelcase */
import pool from '../utils/database.js'
import {
  CAMPOS_BIEN,
  JOINS_BIEN,
  SCOPE_REGEX,
  SQL_TIPO_SOPORTE,
  SORT_FIELDS,
  TIPOS_SOPORTE,
  CAE_SOPORTE,
  CAE_EXTRA
} from '../config/soporteBienes.config.js'

const CAE_EXTRA_LIST = Object.values(CAE_EXTRA).flat()

function toArray (value) {
  if (value === undefined || value === null || value === '') return []
  if (Array.isArray(value)) return value.flatMap(v => String(v).split(',')).map(v => v.trim()).filter(Boolean)
  return String(value).split(',').map(v => v.trim()).filter(Boolean)
}

function placeholders (values) {
  return values.map(() => '?').join(', ')
}

function buildBase ({ incluirBaja = false } = {}) {
  const params = [SCOPE_REGEX]
  const where = [
    incluirBaja ? '1 = 1' : 'b.bim_inc = 1',
    `(
      ca.sca_ide = 2
      OR b.cae_ide IN (${CAE_EXTRA_LIST.map(() => '?').join(', ')})
      OR UPPER(COALESCE(b.bim_des, '')) REGEXP ?
    )`
  ]

  // Los cae extra van antes del regex para respetar el orden de los parametros.
  params.unshift(...CAE_EXTRA_LIST)

  return {
    sql: `
      SELECT ${CAMPOS_BIEN}, ${SQL_TIPO_SOPORTE} AS tipo_soporte
      FROM tmab_m b
      ${JOINS_BIEN}
      WHERE ${where.join(' AND ')}
    `,
    params
  }
}

function buildOuterFilters (filters = {}) {
  const conditions = []
  const params = []

  const q = String(filters.q || '').trim()
  if (q) {
    const like = `%${q}%`
    conditions.push(`(
      t.bim_ide LIKE ? OR t.bim_des LIKE ? OR t.bim_ser LIKE ? OR
      t.bim_cod LIKE ? OR t.bim_ndo LIKE ? OR t.marca LIKE ? OR
      t.modelo LIKE ? OR t.departamento LIKE ? OR t.categoria_especifica LIKE ? OR
      t.tipo_soporte LIKE ?
    )`)
    params.push(like, like, like, like, like, like, like, like, like, like)
  }

  const tipo = toArray(filters.tipo)
  if (tipo.length) {
    conditions.push(`t.tipo_soporte IN (${placeholders(tipo)})`)
    params.push(...tipo)
  }

  const caeIde = toArray(filters.cae_ide)
  if (caeIde.length) {
    conditions.push(`t.cae_ide IN (${placeholders(caeIde)})`)
    params.push(...caeIde)
  }

  const scaIde = toArray(filters.sca_ide)
  if (scaIde.length) {
    conditions.push(`t.sca_ide IN (${placeholders(scaIde)})`)
    params.push(...scaIde)
  }

  const depIde = toArray(filters.dep_ide)
  if (depIde.length) {
    conditions.push(`t.dep_ide IN (${placeholders(depIde)})`)
    params.push(...depIde)
  }

  for (const [key, column] of [
    ['est_ide', 't.est_ide'],
    ['esu_ide', 't.esu_ide'],
    ['con_ide', 't.con_ide'],
    ['foa_ide', 't.foa_ide']
  ]) {
    const values = toArray(filters[key])
    if (values.length) {
      conditions.push(`${column} IN (${placeholders(values)})`)
      params.push(...values)
    }
  }

  for (const [key, column] of [
    ['marca', 't.marca'],
    ['modelo', 't.modelo'],
    ['serial', 't.bim_ser'],
    ['codigo', 't.bim_cod'],
    ['sede', 't.bim_sede']
  ]) {
    const value = String(filters[key] || '').trim()
    if (value) {
      conditions.push(`${column} LIKE ?`)
      params.push(`%${value}%`)
    }
  }

  if (filters.activo !== undefined && filters.activo !== null && filters.activo !== '') {
    conditions.push('t.bim_inc = ?')
    params.push(Number(filters.activo) ? 1 : 0)
  }

  if (filters.fechaDesde) {
    conditions.push('t.bim_fec >= ?')
    params.push(filters.fechaDesde)
  }
  if (filters.fechaHasta) {
    conditions.push('t.bim_fec <= ?')
    params.push(filters.fechaHasta)
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  }
}

function resolveSort (sort, order) {
  const column = SORT_FIELDS[sort] || SORT_FIELDS.bim_ide
  const direction = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC'
  return `${column} ${direction}`
}

export class SoporteBienesModel {
  static buildQuery (filters = {}) {
    const incluirBaja = filters.incluirBaja === true || filters.incluirBaja === '1'
    const base = buildBase({ incluirBaja })
    const outer = buildOuterFilters(filters)
    return { base, outer }
  }

  static async getAll (filters = {}) {
    const { base, outer } = this.buildQuery(filters)
    const page = Math.max(1, Number(filters.page) || 1)
    const limit = Math.max(1, Math.min(Number(filters.limit) || 20, 5000))
    const offset = (page - 1) * limit

    const dataQuery = `
      SELECT t.*
      FROM (${base.sql}) t
      ${outer.where}
      ORDER BY ${resolveSort(filters.sort, filters.order)}
      LIMIT ? OFFSET ?
    `
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM (${base.sql}) t
      ${outer.where}
    `

    const [rows] = await pool.query(dataQuery, [
      ...base.params,
      ...outer.params,
      limit,
      offset
    ])
    const [[{ total }]] = await pool.query(countQuery, [
      ...base.params,
      ...outer.params
    ])

    return {
      data: rows,
      total: Number(total),
      page,
      limit
    }
  }

  static async getById (id) {
    const { base } = this.buildQuery({ incluirBaja: true })
    const [rows] = await pool.query(
      `SELECT t.* FROM (${base.sql}) t WHERE t.bim_ide = ? LIMIT 1`,
      [...base.params, id]
    )
    return rows[0] || null
  }

  static async getResumen (filters = {}) {
    const { base, outer } = this.buildQuery(filters)
    const params = [...base.params, ...outer.params]

    const totalsQuery = `
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(t.bim_inc = 1), 0) AS activos,
        COALESCE(SUM(t.bim_inc = 0), 0) AS inactivos,
        COALESCE(SUM(t.bim_val), 0) AS valor_total
      FROM (${base.sql}) t
      ${outer.where}
    `
    const porTipoQuery = `
      SELECT t.tipo_soporte, COUNT(*) AS total, COALESCE(SUM(t.bim_val), 0) AS valor
      FROM (${base.sql}) t
      ${outer.where}
      GROUP BY t.tipo_soporte
      ORDER BY total DESC, t.tipo_soporte ASC
    `
    const porDepartamentoQuery = `
      SELECT t.dep_ide, COALESCE(t.departamento, 'SIN DEPARTAMENTO') AS departamento, COUNT(*) AS total
      FROM (${base.sql}) t
      ${outer.where}
      GROUP BY t.dep_ide, t.departamento
      ORDER BY total DESC, departamento ASC
    `
    const porEstadoQuery = `
      SELECT t.est_ide, COALESCE(t.estado, 'SIN ESTADO') AS estado, COUNT(*) AS total
      FROM (${base.sql}) t
      ${outer.where}
      GROUP BY t.est_ide, t.estado
      ORDER BY total DESC, estado ASC
    `
    const porMarcaQuery = `
      SELECT COALESCE(t.marca, 'SIN MARCA') AS marca, COUNT(*) AS total
      FROM (${base.sql}) t
      ${outer.where}
      GROUP BY t.marca
      ORDER BY total DESC, marca ASC
    `

    const [[totales]] = await pool.query(totalsQuery, params)
    const [porTipo] = await pool.query(porTipoQuery, params)
    const [porDepartamento] = await pool.query(porDepartamentoQuery, params)
    const [porEstado] = await pool.query(porEstadoQuery, params)
    const [porMarca] = await pool.query(porMarcaQuery, params)

    return {
      total: Number(totales.total),
      activos: Number(totales.activos),
      inactivos: Number(totales.inactivos),
      valor_total: Number(totales.valor_total),
      por_tipo: porTipo.map(row => ({ ...row, total: Number(row.total), valor: Number(row.valor) })),
      por_departamento: porDepartamento.map(row => ({ ...row, total: Number(row.total) })),
      por_estado: porEstado.map(row => ({ ...row, total: Number(row.total) })),
      por_marca: porMarca.map(row => ({ ...row, total: Number(row.total) }))
    }
  }

  static async getCatalogos () {
    const { base } = this.buildQuery({})
    const params = [...base.params]

    const [tiposRows] = await pool.query(
      `SELECT t.tipo_soporte, COUNT(*) AS total
       FROM (${base.sql}) t
       GROUP BY t.tipo_soporte
       ORDER BY total DESC, t.tipo_soporte ASC`,
      params
    )

    const tiposMap = new Map(tiposRows.map(row => [row.tipo_soporte, Number(row.total)]))
    const tipos = TIPOS_SOPORTE.map(tipo => ({
      value: tipo.value,
      label: tipo.label,
      total: tiposMap.get(tipo.value) || 0
    }))

    const [cae] = await pool.query(
      `SELECT ca.cae_ide, ca.cae_cae, ca.sca_ide, sc.sca_sca,
              COUNT(b.bim_ide) AS total
       FROM tescae ca
       LEFT JOIN tessca sc ON ca.sca_ide = sc.sca_ide
       LEFT JOIN tmab_m b ON b.cae_ide = ca.cae_ide AND b.bim_inc = 1
       WHERE ca.sca_ide = 2 OR ca.cae_ide IN (${CAE_EXTRA_LIST.map(() => '?').join(', ')})
       GROUP BY ca.cae_ide, ca.cae_cae, ca.sca_ide, sc.sca_sca
       ORDER BY ca.sca_ide ASC, ca.cae_ide ASC`,
      CAE_EXTRA_LIST
    )

    const [departamentos] = await pool.query(
      'SELECT dep_ide, dep_nom FROM tesdep ORDER BY CAST(dep_ide AS UNSIGNED) ASC'
    )
    const [estados] = await pool.query('SELECT est_ide, est_est FROM tmaest ORDER BY est_ide ASC')
    const [estadosUso] = await pool.query('SELECT esu_ide, esu_esu FROM tmaesu ORDER BY esu_ide ASC')
    const [condiciones] = await pool.query('SELECT con_ide, con_con FROM tmacon ORDER BY con_ide ASC')
    const [formas] = await pool.query('SELECT foa_ide, foa_nom FROM tmafoa ORDER BY foa_ide ASC')

    const [marcas] = await pool.query(
      `SELECT t.marca, COUNT(*) AS total
       FROM (${base.sql}) t
       WHERE t.marca IS NOT NULL
       GROUP BY t.marca
       ORDER BY marca ASC`,
      params
    )

    const [modelos] = await pool.query(
      `SELECT t.modelo, COUNT(*) AS total
       FROM (${base.sql}) t
       WHERE t.modelo IS NOT NULL
       GROUP BY t.modelo
       ORDER BY modelo ASC`,
      params
    )

    return {
      tipos,
      cae: cae.map(row => ({ ...row, total: Number(row.total) })),
      departamentos,
      estados,
      estados_uso: estadosUso,
      condiciones,
      formas_adquisicion: formas,
      marcas: marcas.map(row => ({ ...row, total: Number(row.total) })),
      modelos: modelos.map(row => ({ ...row, total: Number(row.total) })),
      alcance: {
        sca_ide: 2,
        subcategoria: 'Equipos de procesamiento de datos',
        cae_soporte: CAE_SOPORTE,
        cae_extra: CAE_EXTRA
      }
    }
  }

  static async lookup (filters = {}) {
    const { base } = this.buildQuery({ incluirBaja: true })
    const ids = toArray(filters.ids)
    const q = String(filters.q || '').trim()
    const conditions = []
    const params = [...base.params]

    if (ids.length) {
      conditions.push(`t.bim_ide IN (${placeholders(ids)})`)
      params.push(...ids)
    }

    if (q) {
      const like = `%${q}%`
      conditions.push(`(t.bim_ide LIKE ? OR t.bim_des LIKE ? OR t.marca LIKE ? OR t.modelo LIKE ?)`)
      params.push(like, like, like, like)
    }

    if (!conditions.length) return []

    const limit = Math.max(1, Math.min(Number(filters.limit) || 500, 1000))
    const [rows] = await pool.query(
      `SELECT t.bim_ide, t.bim_des, t.tipo_soporte, t.marca, t.modelo,
              t.bim_ser, t.dep_ide, t.departamento, t.est_ide, t.estado
       FROM (${base.sql}) t
       WHERE ${conditions.join(' AND ')}
       ORDER BY t.bim_ide ASC
       LIMIT ?`,
      [...params, limit]
    )
    return rows
  }
}
