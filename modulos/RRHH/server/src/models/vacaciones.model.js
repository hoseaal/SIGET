import pool from '../utils/database.js'

const EXCLUDE_OBRERO = `(cet.nombre LIKE '%OBRERO%' OR cet.nombre LIKE '%ASEADOR%' OR cet.nombre LIKE '%MENSAJERO%' OR cet.nombre LIKE '%VIGILANTE%' OR cet.nombre LIKE '%CHOFER%' OR
ona.nombre LIKE '%OBRERO%' OR ona.nombre LIKE '%ASEADOR%' OR ona.nombre LIKE '%MENSAJERO%' OR ona.nombre LIKE '%VIGILANTE%' OR ona.nombre LIKE '%CHOFER%')`

function tipoEmpleadoSQL(alias = 't') {
  return `IF((${EXCLUDE_OBRERO}) AND c.condicion_laboral_id = 1, 'obrero', 'funcionario') AS tipo_empleado`
}

function joinLaboral(alias = 't') {
  return `LEFT JOIN datos_laborales c ON ${alias}.empleado_id = c.empleado_id
LEFT JOIN cargos_cet cet ON c.cargo_cet_id = cet.cargo_cet_id
LEFT JOIN cargos_onapre ona ON c.cargo_onapre_id = ona.cargo_onapre_id
LEFT JOIN niveles_salariales ns ON c.nivel_salarial_id = ns.nivel_salarial_id
LEFT JOIN direcciones dir ON c.direccion_id = dir.direccion_id
LEFT JOIN divisiones divi ON c.division_id = divi.division_id
LEFT JOIN unidades uni ON c.unidad_id = uni.unidad_id`
}

export class VacacionesModel {
  static async init() {
    // Migración: agregar columna pagado si no existe
    try {
      const [cols] = await pool.query('SHOW COLUMNS FROM vacaciones LIKE ?', ['pagado'])
      if (cols.length === 0) {
        await pool.query('ALTER TABLE vacaciones ADD COLUMN pagado TINYINT(1) NOT NULL DEFAULT 0 AFTER fecha_tope')
        console.log('Migración: columna pagado agregada a vacaciones')
      }
      const [colsFv] = await pool.query('SHOW COLUMNS FROM fechas_vacaciones LIKE ?', ['dias_habiles'])
      if (colsFv.length === 0) {
        await pool.query('ALTER TABLE fechas_vacaciones ADD COLUMN dias_habiles INT NULL AFTER fecha_fin')
        console.log('Migración: columna dias_habiles agregada a fechas_vacaciones')
      }
      const [colsStatus] = await pool.query('SHOW COLUMNS FROM fechas_vacaciones LIKE ?', ['id_status_vacaciones'])
      if (colsStatus.length === 0) {
        await pool.query('ALTER TABLE fechas_vacaciones ADD COLUMN id_status_vacaciones INT NULL DEFAULT NULL AFTER dias_habiles')
        console.log('Migración: columna id_status_vacaciones agregada a fechas_vacaciones')
      }
    } catch (err) {
      console.warn('VacacionesModel init (migración opcional):', err.message)
    }
    return true
  }

  /* ───────── TAREA 1: Alertas ───────── */

  static async getProximosDerecho() {
    const [rows] = await pool.query(`
      SELECT t.empleado_id, t.cedula, t.nombres, t.apellidos, t.fecha_ingreso,
             DATEDIFF(
               CASE
                 WHEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH) >= CURDATE()
                   THEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH)
                 ELSE DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso)) YEAR), INTERVAL 4 MONTH)
               END, CURDATE()) AS dias_restantes_para_derecho,
             CASE
               WHEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH) >= CURDATE()
                 THEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH)
               ELSE DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso)) YEAR), INTERVAL 4 MONTH)
             END AS fecha_derecho_proximo,
             ${tipoEmpleadoSQL('t')}
      FROM empleados t
      ${joinLaboral('t')}
      WHERE t.estatus_id IN (1, 8, 9)
        AND CASE
          WHEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH) >= CURDATE()
            THEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH)
          ELSE DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso)) YEAR), INTERVAL 4 MONTH)
        END >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND CASE
          WHEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH) >= CURDATE()
            THEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH)
          ELSE DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso)) YEAR), INTERVAL 4 MONTH)
        END <= LAST_DAY(DATE_ADD(CURDATE(), INTERVAL 1 MONTH))
        AND NOT EXISTS (
           SELECT 1 FROM vacaciones v
           INNER JOIN fechas_vacaciones fv ON v.id_vacaciones = fv.id_vacaciones
           WHERE v.id_empleado = t.empleado_id
             AND fv.fecha_inicio IS NOT NULL
             AND YEAR(fv.fecha_inicio) = YEAR(CURDATE())
        )
        AND NOT EXISTS (
           SELECT 1 FROM vacaciones v2
           WHERE v2.id_empleado = t.empleado_id
             AND v2.id_status_vacaciones = 5
        )
      ORDER BY t.apellidos ASC, t.nombres ASC
    `)
    return rows
  }

  static async getVacacionesProximasRetornar() {
    const [rows] = await pool.query(`
      SELECT t.empleado_id, t.cedula, t.nombres, t.apellidos,
             fv.fecha_inicio, fv.fecha_fin, fv.id_fecha,
             ${tipoEmpleadoSQL('t')}
      FROM empleados t
      ${joinLaboral('t')}
      INNER JOIN vacaciones v ON t.empleado_id = v.id_empleado
      INNER JOIN fechas_vacaciones fv ON v.id_vacaciones = fv.id_vacaciones
      WHERE t.estatus_id = 8
        AND CURDATE() BETWEEN DATE_SUB(fv.fecha_fin, INTERVAL 2 DAY) AND fv.fecha_fin
      ORDER BY fv.fecha_fin ASC
    `)
    return rows
  }

  static async getVacacionesFinalizadas(statusId) {
    const [rows] = await pool.query(`
      SELECT t.empleado_id, t.cedula, t.nombres, t.apellidos,
             fv.fecha_inicio, fv.fecha_fin, fv.id_fecha,
             ${tipoEmpleadoSQL('t')}
      FROM empleados t
      ${joinLaboral('t')}
      INNER JOIN vacaciones v ON t.empleado_id = v.id_empleado
      INNER JOIN fechas_vacaciones fv ON v.id_vacaciones = fv.id_vacaciones AND fv.id_fecha = (
        SELECT MAX(fv2.id_fecha) FROM fechas_vacaciones fv2 WHERE fv2.id_vacaciones = v.id_vacaciones
      )
      WHERE v.id_status_vacaciones = ?
        AND fv.fecha_fin < CURDATE()
      ORDER BY fv.fecha_fin DESC
    `, [statusId])
    return rows
  }

  /* ───────── TAREA 2: CRUD ───────── */

  static async getConsolidado(tipoEmpleadoFilter = null) {
    let tipoWhere = ''
    if (tipoEmpleadoFilter === 'funcionario') {
      tipoWhere = `AND NOT (${EXCLUDE_OBRERO})`
    } else if (tipoEmpleadoFilter === 'obrero') {
      tipoWhere = `AND (${EXCLUDE_OBRERO})`
    }
    const [rows] = await pool.query(`
      SELECT t.empleado_id, t.cedula, t.nombres, t.apellidos,
             t.fecha_ingreso, t.estatus_id,
             cet.nombre AS cargo_cet_nombre,
             ona.nombre AS cargo_onapre_nombre,
             ns.nombre AS nivel_salarial_nombre,
             dir.nombre AS direccion_nombre,
             divi.nombre AS division_nombre,
             uni.nombre AS unidad_nombre,
             v.id_vacaciones, v.dias_acumulados, v.id_status_vacaciones,
             sv.descripcion AS estatus_vacaciones_db,
             CASE 
               WHEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH) >= CURDATE()
                 THEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH)
               ELSE DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso)) YEAR), INTERVAL 4 MONTH)
             END AS fecha_tope,
             CASE WHEN t.estatus_id IN (8, 9) THEN 1 ELSE v.pagado END AS pagado,
             fv.id_fecha, fv.fecha_inicio, fv.fecha_fin, fv.observaciones,
      ${tipoEmpleadoSQL('t')},
              
              -- LÓGICA DE ESTATUS BASADA EN LA BD
              CASE
                 WHEN v.id_vacaciones IS NOT NULL AND v.id_status_vacaciones = 2 THEN 'de_vacaciones'
                 WHEN v.id_vacaciones IS NOT NULL AND (v.id_status_vacaciones = 4 OR t.estatus_id = 9) THEN 'reintegro'
                 WHEN v.id_vacaciones IS NOT NULL AND v.id_status_vacaciones = 3 THEN 'finalizadas'
                 WHEN v.id_vacaciones IS NOT NULL AND v.id_status_vacaciones = 1 THEN 'programadas'
                 WHEN v.id_vacaciones IS NOT NULL AND v.id_status_vacaciones = 5 THEN 'sin_vacaciones'
                  -- Sin registro activo de vacaciones: validamos si fecha_tope está en el mes actual o el siguiente
                  WHEN t.estatus_id IN (1, 8, 9)
                    AND CASE
                      WHEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH) >= CURDATE()
                        THEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH)
                      ELSE DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso)) YEAR), INTERVAL 4 MONTH)
                    END >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                    AND CASE
                      WHEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH) >= CURDATE()
                        THEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH)
                      ELSE DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso)) YEAR), INTERVAL 4 MONTH)
                    END <= LAST_DAY(DATE_ADD(CURDATE(), INTERVAL 1 MONTH))
                  THEN 'por_derecho'
                 ELSE 'sin_vacaciones'
              END AS estado_vacaciones,
               DATEDIFF(
                 CASE
                   WHEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH) >= CURDATE()
                     THEN DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso) - 1) YEAR), INTERVAL 4 MONTH)
                   ELSE DATE_ADD(DATE_ADD(t.fecha_ingreso, INTERVAL (YEAR(CURDATE()) - YEAR(t.fecha_ingreso)) YEAR), INTERVAL 4 MONTH)
                 END, CURDATE()) AS dias_para_derecho
      FROM empleados t
      ${joinLaboral('t')}
      LEFT JOIN (
        SELECT empleado_id, SUM(DATEDIFF(COALESCE(fecha_fin, CURDATE()), fecha_inicio) + 1) AS dias_externos
        FROM registros_antiguedades
        GROUP BY empleado_id
      ) ext ON t.empleado_id = ext.empleado_id
      LEFT JOIN vacaciones v ON t.empleado_id = v.id_empleado
      LEFT JOIN status_vacaciones sv ON v.id_status_vacaciones = sv.id_status_vacaciones
      LEFT JOIN fechas_vacaciones fv ON v.id_vacaciones = fv.id_vacaciones AND fv.id_fecha = (
        SELECT MAX(fv2.id_fecha) FROM fechas_vacaciones fv2 WHERE fv2.id_vacaciones = v.id_vacaciones
      )
      WHERE t.estatus_id IN (1, 8, 9)
        ${tipoWhere}
      ORDER BY t.apellidos ASC, t.nombres ASC
    `)
    return rows
  }


  static async buscarEmpleados(query, tipoEmpleadoFilter = null) {
    let tipoWhere = ''
    if (tipoEmpleadoFilter === 'funcionario') {
      tipoWhere = `AND NOT (${EXCLUDE_OBRERO})`
    } else if (tipoEmpleadoFilter === 'obrero') {
      tipoWhere = `AND (${EXCLUDE_OBRERO})`
    }

    const searchPattern = `%${query}%`
    const [rows] = await pool.query(`
      SELECT t.empleado_id, t.cedula, t.nombres, t.apellidos,
             cet.nombre AS cargo_cet_nombre,
             ${tipoEmpleadoSQL('t')}
      FROM empleados t
      ${joinLaboral('t')}
      WHERE t.estatus_id IN (1, 8, 9)
        ${tipoWhere}
        AND (t.cedula LIKE ? OR t.nombres LIKE ? OR t.apellidos LIKE ?
             OR CONCAT(t.nombres, ' ', t.apellidos) LIKE ?)
      LIMIT 20
    `, [searchPattern, searchPattern, searchPattern, searchPattern])
    return rows
  }

  static async getConfiguracionVacaciones(anio, tipoEmpleado) {
    const table = tipoEmpleado === 'obrero' ? 'configuracion_vacaciones_obreros' : 'configuracion_vacaciones'
    let query, params
    if (tipoEmpleado === 'obrero') {
      query = `SELECT dias_disfrute, pago FROM ${table} WHERE anio <= ? ORDER BY anio DESC LIMIT 1`
      params = [anio]
    } else {
      query = `SELECT dias_disfrute, pago FROM ${table} WHERE rango_minimo <= ? AND (rango_maximo = 0 OR rango_maximo > ?) ORDER BY rango_minimo DESC LIMIT 1`
      params = [anio, anio]
    }
    const [rows] = await pool.query(query, params)
    return rows[0] || null
  }

  static async getVacacionesRecord(empleadoId) {
    const [rows] = await pool.query(
      `SELECT v.*, fv.fecha_inicio, fv.fecha_fin, fv.dias_habiles, fv.observaciones
       FROM vacaciones v
       LEFT JOIN fechas_vacaciones fv ON v.id_vacaciones = fv.id_vacaciones AND (fv.id_status_vacaciones != 4 OR fv.id_status_vacaciones IS NULL)
       WHERE v.id_empleado = ?
       ORDER BY fv.fecha_fin DESC, fv.id_fecha DESC
       LIMIT 1`,
      [empleadoId]
    )
    return rows[0] || null
  }

  static async getHistorialVacaciones(empleadoId) {
    const [rows] = await pool.query(`
      SELECT
        v.id_vacaciones,
        v.dias_acumulados,
        v.fecha_tope,
        fv.id_fecha,
        fv.fecha_inicio,
        fv.fecha_fin,
        fv.dias_habiles,
        fv.observaciones,
        fv.id_status_vacaciones,
        sv.descripcion AS nombre_status
      FROM vacaciones v
      INNER JOIN fechas_vacaciones fv ON v.id_vacaciones = fv.id_vacaciones
      INNER JOIN status_vacaciones sv
        ON fv.id_status_vacaciones = sv.id_status_vacaciones
      WHERE v.id_empleado = ?
      ORDER BY fv.fecha_inicio ASC
    `, [empleadoId])
    return rows
  }

  static async crearVacacion(data) {
    const [result] = await pool.query(
      `INSERT INTO vacaciones (id_empleado, id_status_vacaciones, dias_acumulados, fecha_tope, pagado)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.id_empleado,
        data.id_status_vacaciones || 1, // Por defecto "Programado"
        data.dias_acumulados || 0,
        data.fecha_tope || null,
        data.pagado || 0
      ]
    )
    return result.insertId
  }

  static async actualizarVacacion(id, data) {
    const sets = Object.entries(data).map(([k]) => `${k} = ?`).join(', ')
    const values = Object.values(data)
    values.push(id)
    const [result] = await pool.query(
      `UPDATE vacaciones SET ${sets} WHERE id_vacaciones = ?`,
      values
    )
    return result.affectedRows > 0
  }

  static async crearFechaVacacion(data) {
    const [result] = await pool.query(
      `INSERT INTO fechas_vacaciones (id_vacaciones, fecha_inicio, fecha_fin, dias_habiles, id_status_vacaciones, observaciones)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.id_vacaciones,
        data.fecha_inicio,
        data.fecha_fin,
        data.dias_habiles ?? null,
        data.id_status_vacaciones ?? null,
        data.observaciones ?? null
      ]
    )
    return result.insertId
  }

  static async actualizarFechaVacacion(idFecha, data) {
    const sets = Object.entries(data).map(([k]) => `${k} = ?`).join(', ')
    const values = Object.values(data)
    values.push(idFecha)
    const [result] = await pool.query(
      `UPDATE fechas_vacaciones SET ${sets} WHERE id_fecha = ?`,
      values
    )
    return result.affectedRows > 0
  }

  static async getDatosAntiguedadTotal(empleadoId) {
    const [rows] = await pool.query(`
      SELECT t.fecha_ingreso,
             ra.antiguedad_id, ra.fecha_inicio AS ext_fecha_inicio, ra.fecha_fin AS ext_fecha_fin
      FROM empleados t
      LEFT JOIN registros_antiguedades ra ON t.empleado_id = ra.empleado_id
      WHERE t.empleado_id = ?
    `, [empleadoId])

    if (!rows.length) return null

    const registrosExternos = rows
      .filter(r => r.antiguedad_id !== null)
      .map(r => ({
        antiguedad_id: r.antiguedad_id,
        fecha_inicio: r.ext_fecha_inicio,
        fecha_fin: r.ext_fecha_fin
      }))

    return {
      fecha_ingreso: rows[0].fecha_ingreso,
      registros_externos: registrosExternos
    }
  }

  static async getAntiguedadEmpleado(empleadoId, fechaRef = null) {
    const refParam = fechaRef || null
    const [rows] = await pool.query(`
      SELECT FLOOR((
        COALESCE((
          SELECT SUM(DATEDIFF(COALESCE(ra.fecha_fin, COALESCE(?, CURDATE())), ra.fecha_inicio) + 1)
          FROM registros_antiguedades ra
          WHERE ra.empleado_id = ?
        ), 0) + DATEDIFF(COALESCE(?, CURDATE()), t.fecha_ingreso) + 1
      ) / 365) AS anios_antiguedad
      FROM empleados t
      WHERE t.empleado_id = ?
    `, [refParam, empleadoId, refParam, empleadoId])
    return rows[0]?.anios_antiguedad || 0
  }

  static async getEmpleadoTipoPersonal(empleadoId) {
    const [rows] = await pool.query(`
      SELECT t.fecha_ingreso,
             ${tipoEmpleadoSQL('t')}
      FROM empleados t
      ${joinLaboral('t')}
      WHERE t.empleado_id = ?
    `, [empleadoId])

    if (!rows[0]) return null
    return {
      tipo_personal: rows[0].tipo_empleado === 'obrero' ? 'OBRERO' : 'FUNCIONARIO',
      fecha_ingreso: rows[0].fecha_ingreso
    }
  }

  static async getUltimaNomina(empleadoId) {
    const [rows] = await pool.query(`
      SELECT hs.historial_salario_id, hs.fecha_pago, hs.monto_neto, hs.monto_bruto
      FROM historial_salarios hs
      WHERE hs.empleado_id = ?
      ORDER BY hs.fecha_pago DESC
      LIMIT 1
    `, [empleadoId])
    return rows[0] || null
  }

  static async getDatosSalariales(empleadoId) {
    const [rows] = await pool.query(`
      SELECT t.empleado_id, t.cedula, t.nombres, t.apellidos, t.nro_cuenta_bancaria, t.fecha_ingreso,
             ns.nivel_salarial_id, ns.nombre AS nivel_nombre,
             COALESCE(ns.salario_base, 0) AS salario_base,
             COALESCE(nsa.salario_antiguo, ns.salario_base, 0) AS salario_historico,
             cet.nombre AS cargo_cet_nombre,
             ona.nombre AS cargo_onapre_nombre,
             COALESCE(pp.porcentaje_actual, 0) AS porcentaje_profesionalizacion,
             dir.nombre AS direccion_nombre,
             divi.nombre AS division_nombre,
             uni.nombre AS unidad_nombre
      FROM empleados t
      ${joinLaboral('t')}
      LEFT JOIN niveles_salariales_antiguos nsa ON c.nivel_salarial_antiguo_id = nsa.nivel_salarial_antiguo_id
      LEFT JOIN primas_profesionalizacion pp ON c.prima_profesional_id = pp.prima_profesional_id
      WHERE t.empleado_id = ?
    `, [empleadoId])
    return rows[0] || null
  }

  static async getReciboData(empleadoId) {
    const [rows] = await pool.query(`
      SELECT t.empleado_id, t.cedula, t.nombres, t.apellidos, t.fecha_ingreso, t.nro_cuenta_bancaria,
             cet.nombre AS cargo_cet_nombre,
             ona.nombre AS cargo_onapre_nombre,
             COALESCE(ns.salario_base, 0) AS salario_base,
             COALESCE(pp.porcentaje_actual, 0) AS porcentaje_profesionalizacion,
             hs.monto_neto, hs.fecha
      FROM empleados t
      ${joinLaboral('t')}
      LEFT JOIN niveles_salariales_antiguos nsa ON c.nivel_salarial_antiguo_id = nsa.nivel_salarial_antiguo_id
      LEFT JOIN primas_profesionalizacion pp ON c.prima_profesional_id = pp.prima_profesional_id
      LEFT JOIN historial_salarios hs ON hs.id_historial = (
        SELECT MAX(hs2.id_historial) FROM historial_salarios hs2 WHERE hs2.empleado_id = t.empleado_id
      )
      WHERE t.empleado_id = ?
    `, [empleadoId])
    return rows[0] || null
  }

  static async updateEstatusEmpleado(empleadoId, estatusId) {
    const [result] = await pool.query(
      'UPDATE empleados SET estatus_id = ? WHERE empleado_id = ?',
      [estatusId, empleadoId]
    )
    return result.affectedRows > 0
  }

  /* ───────── TAREA 3: Perfil ───────── */

  static async getPerfilEmpleado(empleadoId) {
    const [rows] = await pool.query(`
      SELECT t.*,
             p.nombre AS profesion_nombre,
             e.nombre AS estatus_nombre,
             cet.nombre AS cargo_cet_nombre,
             ona.nombre AS cargo_onapre_nombre,
             ns.nombre AS nivel_salarial_nombre,
             ns.salario_base,
             cl.nombre AS condicion_laboral_nombre,
             dir.nombre AS direccion_nombre,
             divi.nombre AS division_nombre,
             uni.nombre AS unidad_nombre,
             pp.porcentaje_actual AS porcentaje_profesionalizacion
      FROM empleados t
      LEFT JOIN profesiones p ON t.profesion_id = p.profesion_id
      LEFT JOIN estatus_funcionarios e ON t.estatus_id = e.estatus_id
      LEFT JOIN datos_laborales c ON t.empleado_id = c.empleado_id
      LEFT JOIN cargos_cet cet ON c.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON c.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales ns ON c.nivel_salarial_id = ns.nivel_salarial_id
      LEFT JOIN condiciones_laborales cl ON c.condicion_laboral_id = cl.condicion_laboral_id
      LEFT JOIN direcciones dir ON c.direccion_id = dir.direccion_id
      LEFT JOIN divisiones divi ON c.division_id = divi.division_id
      LEFT JOIN unidades uni ON c.unidad_id = uni.unidad_id
      LEFT JOIN primas_profesionalizacion pp ON c.prima_profesional_id = pp.prima_profesional_id
      WHERE t.empleado_id = ?
    `, [empleadoId])
    return rows[0] || null
  }
}
