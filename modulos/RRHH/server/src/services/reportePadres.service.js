import pool from '../utils/database.js'

const RANGOS = [
  { label: '0-5', min: 0, max: 5 },
  { label: '5-10', min: 5, max: 10 },
  { label: '10-12', min: 10, max: 12 },
  { label: '12-15', min: 12, max: 15 },
  { label: '15-18', min: 15, max: 18 },
  { label: '18-20', min: 18, max: 20 },
  { label: '20-25', min: 20, max: 25 },
]

export class ReportePadresService {

  static getRango(edad) {
    for (const r of RANGOS) {
      if (edad >= r.min && edad < r.max) return r.label
    }
    return edad >= 25 ? '25+' : '0-5'
  }

  static async generarReporte(tipoPersonal) {
    let tipoFilter = ''
    if (tipoPersonal === 'Funcionario') {
      tipoFilter = `AND (ona.nombre IS NULL OR ona.nombre NOT LIKE 'Obrero%')`
    } else if (tipoPersonal === 'Obrero Fijo') {
      tipoFilter = `AND ona.nombre LIKE 'Obrero%'`
    }

    const sql = `
      SELECT
        e.empleado_id, e.cedula, e.nombres, e.apellidos,
        CASE WHEN LOWER(ona.nombre) LIKE '%obrero%' THEN 'Obrero Fijo' ELSE 'Funcionario' END AS tipo_personal,
        COALESCE(cet.nombre, ona.nombre, '') AS cargo,
        nf.familiar_id, nf.nombres AS hijo_nombres, nf.apellidos AS hijo_apellidos,
        nf.fecha_nacimiento,
        TIMESTAMPDIFF(YEAR, nf.fecha_nacimiento, CURDATE()) AS edad
      FROM empleados e
      JOIN datos_laborales c ON e.empleado_id = c.empleado_id
      LEFT JOIN cargos_cet cet ON c.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON c.cargo_onapre_id = ona.cargo_onapre_id
      INNER JOIN sobreviviente s ON e.empleado_id = s.empleado_id
      INNER JOIN nucleo_familiar nf ON s.familiar_id = nf.familiar_id
      WHERE e.estatus_id IN (1, 8, 9)
        AND LOWER(nf.parentesco) IN ('hijo', 'hija')
        ${tipoFilter}
      ORDER BY e.apellidos, e.nombres, nf.fecha_nacimiento
    `

    const [rows] = await pool.query(sql)

    const empleadosMap = new Map()
    const rangosAcc = {}

    for (const r of RANGOS) {
      rangosAcc[r.label] = 0
    }
    rangosAcc['25+'] = 0

    for (const row of rows) {
      const empId = row.empleado_id
      if (!empleadosMap.has(empId)) {
        empleadosMap.set(empId, {
          empleado_id: empId,
          cedula: row.cedula,
          nombres: row.nombres,
          apellidos: row.apellidos,
          tipo_personal: row.tipo_personal,
          cargo: row.cargo,
          hijos: [],
        })
      }

      const edad = Number(row.edad)
      const rango = this.getRango(edad)
      rangosAcc[rango] = (rangosAcc[rango] || 0) + 1

      empleadosMap.get(empId).hijos.push({
        familiar_id: row.familiar_id,
        nombres: row.hijo_nombres,
        apellidos: row.hijo_apellidos,
        fecha_nacimiento: row.fecha_nacimiento,
        edad,
        rango,
      })
    }

    const empleados = Array.from(empleadosMap.values()).map(emp => ({
      ...emp,
      total_hijos: emp.hijos.length,
    }))

    empleados.sort((a, b) => b.total_hijos - a.total_hijos || a.apellidos.localeCompare(b.apellidos, 'es'))

    const rangos = RANGOS.map(r => ({
      rango: r.label,
      label: `${r.label} años`,
      cantidad: rangosAcc[r.label] || 0,
    }))
    if (rangosAcc['25+'] > 0) {
      rangos.push({ rango: '25+', label: '25+ años', cantidad: rangosAcc['25+'] })
    }

    const resumen = {
      total_empleados: empleados.length,
      total_hijos: rows.length,
      total_funcionarios: empleados.filter(e => e.tipo_personal === 'Funcionario').length,
      total_obreros: empleados.filter(e => e.tipo_personal === 'Obrero Fijo').length,
    }

    const tiposList = ['Funcionario', 'Obrero Fijo', 'Jubilado', 'Pensionado', 'Sobreviviente']
    const porTipo = tiposList.map(tipo => ({
      tipo_personal: tipo,
      cantidad: tipo === 'Funcionario' ? resumen.total_funcionarios : tipo === 'Obrero Fijo' ? resumen.total_obreros : 0,
    }))

    return { data: empleados, rangos, resumen, porTipo }
  }
}
