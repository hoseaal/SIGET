import pool from '../utils/database.js'

const QUERIES = {
  'Funcionario': {
    sql: `
      SELECT e.empleado_id, e.cedula, e.nombres, e.apellidos,
             e.fecha_ingreso AS fecha_ingreso,
             COALESCE(cet.nombre, '') AS cargo,
             COALESCE(dir.nombre, '') AS departamento,
             'Funcionario' AS tipo_personal
      FROM empleados e
      JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON dl.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      WHERE e.fecha_ingreso BETWEEN ? AND ?
        AND (cet.nombre IS NULL OR (cet.nombre NOT LIKE '%OBRERO%' AND cet.nombre NOT LIKE '%ASEADOR%' AND cet.nombre NOT LIKE '%MENSAJERO%' AND cet.nombre NOT LIKE '%VIGILANTE%' AND cet.nombre NOT LIKE '%CHOFER%'))
        AND (ona.nombre IS NULL OR ona.nombre NOT LIKE 'Obrero%')
      ORDER BY e.fecha_ingreso DESC
    `,
  },
  'Obrero Fijo': {
    sql: `
      SELECT e.empleado_id, e.cedula, e.nombres, e.apellidos,
             e.fecha_ingreso AS fecha_ingreso,
             COALESCE(cet.nombre, '') AS cargo,
             COALESCE(dir.nombre, '') AS departamento,
             'Obrero Fijo' AS tipo_personal
      FROM empleados e
      JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON dl.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      WHERE e.fecha_ingreso BETWEEN ? AND ?
        AND (cet.nombre LIKE '%OBRERO%' OR cet.nombre LIKE '%ASEADOR%' OR cet.nombre LIKE '%MENSAJERO%' OR cet.nombre LIKE '%VIGILANTE%' OR cet.nombre LIKE '%CHOFER%' OR ona.nombre LIKE 'Obrero%')
      ORDER BY e.fecha_ingreso DESC
    `,
  },
  'Jubilado': {
    sql: `
      SELECT e.empleado_id, e.cedula, e.nombres, e.apellidos,
             j.fecha_efectiva AS fecha_ingreso,
             COALESCE(cet.nombre, '') AS cargo,
             COALESCE(dir.nombre, '') AS departamento,
             'Jubilado' AS tipo_personal
      FROM jubilados j
      JOIN empleados e ON j.empleado_id = e.empleado_id
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      WHERE j.fecha_efectiva BETWEEN ? AND ?
      ORDER BY j.fecha_efectiva DESC
    `,
  },
  'Pensionado': {
    sql: `
      SELECT e.empleado_id, e.cedula, e.nombres, e.apellidos,
             p.fecha_ingreso AS fecha_ingreso,
             COALESCE(cet.nombre, '') AS cargo,
             COALESCE(dir.nombre, '') AS departamento,
             'Pensionado' AS tipo_personal
      FROM pensionado p
      JOIN empleados e ON p.empleado_id = e.empleado_id
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      WHERE p.fecha_ingreso BETWEEN ? AND ?
      ORDER BY p.fecha_ingreso DESC
    `,
  },
  'Sobreviviente': {
    sql: `
      SELECT e.empleado_id, e.cedula, e.nombres, e.apellidos,
             s.fecha_ingreso AS fecha_ingreso,
             COALESCE(cet.nombre, '') AS cargo,
             COALESCE(dir.nombre, '') AS departamento,
             'Sobreviviente' AS tipo_personal
      FROM sobreviviente s
      JOIN empleados e ON s.empleado_id = e.empleado_id
      LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
      LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
      WHERE s.fecha_ingreso BETWEEN ? AND ?
      ORDER BY s.fecha_ingreso DESC
    `,
  },
}

const TIPOS = ['Funcionario', 'Obrero Fijo', 'Jubilado', 'Pensionado', 'Sobreviviente']

export class ReporteIngresosService {

  static async generarReporte({ desde, hasta, tipo_personal }) {
    const tiposConsultar = !tipo_personal || tipo_personal === 'Todos'
      ? TIPOS
      : [tipo_personal]

    const resultados = await Promise.all(
      tiposConsultar.map(async (tipo) => {
        const q = QUERIES[tipo]
        if (!q) return []
        try {
          const [rows] = await pool.query(q.sql, [desde, hasta])
          return rows
        } catch (e) {
          console.error(`[ReporteIngresos] Error en query ${tipo}:`, e.message)
          return []
        }
      })
    )

    const data = resultados.flat()

    data.sort((a, b) => {
      const d = new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso)
      if (d !== 0) return d
      return (a.apellidos || '').localeCompare(b.apellidos || '', 'es')
    })

    const trend = this._calcularTendencia(data, desde, hasta)

    return { data, trend }
  }

  static _calcularTendencia(data, desde, hasta) {
    const inicio = new Date(desde)
    const fin = new Date(hasta)
    const meses = []
    const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1)

    while (cursor <= fin) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
      meses.push({
        periodo: key,
        label: cursor.toLocaleDateString('es-VE', { month: 'short', year: 'numeric' }),
        total: 0,
        ...Object.fromEntries(TIPOS.map((t) => [t, 0])),
      })
      cursor.setMonth(cursor.getMonth() + 1)
    }

    for (const row of data) {
      if (!row.fecha_ingreso) continue
      const d = new Date(row.fecha_ingreso)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const mes = meses.find((m) => m.periodo === key)
      if (mes) {
        mes.total++
        if (mes[row.tipo_personal] !== undefined) {
          mes[row.tipo_personal]++
        }
      }
    }

    return meses
  }
}
