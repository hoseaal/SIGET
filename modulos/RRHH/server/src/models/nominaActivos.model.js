import pool from '../utils/database.js'
import { RetroactivoModel } from './retroactivo.model.js'

export class NominaActivosModel {
  static async getActivosData() {
    // Empleados activos: estatus_id = 1 (Activo).
    // Se excluyen los Obreros: cargo_onapre que comience con 'Obrero'.
    // Se requiere nivel_salarial_id para tener salario_base.
    const sql = `
      SELECT t.empleado_id, t.cedula, t.nombres AS nombre, t.apellidos AS apellido, 
        t.fecha_ingreso, 
        (
          SELECT COUNT(*) 
          FROM nucleo_familiar nf 
          INNER JOIN sobreviviente s ON nf.familiar_id = s.familiar_id 
          WHERE s.empleado_id = t.empleado_id 
            AND LOWER(nf.parentesco) IN ('hijo', 'hija') 
            AND TIMESTAMPDIFF(YEAR, nf.fecha_nacimiento, CURDATE()) < 18
        ) AS numero_hijos,
        c.cargo_cet_id, cet.nombre AS cargo_cet, 
        c.cargo_onapre_id, ona.nombre AS cargo_onapre,
        c.nivel_salarial_id, COALESCE(niv.salario_base, 0) AS salario_base,
        (
          SELECT nsa.salario_antiguo 
          FROM niveles_salariales_antiguos nsa 
          WHERE nsa.nombre = niv.nombre 
            AND nsa.cargo_onapre_id = niv.cargo_onapre_id
          LIMIT 1
        ) AS salario_historico,
        c.direccion_id, dir.nombre AS departamento,
        divi.nombre AS division, uni.nombre AS unidad,
        pp.porcentaje_actual AS profesionalizacion,
        FLOOR((
          COALESCE((
            SELECT SUM(DATEDIFF(COALESCE(ra.fecha_fin, CURDATE()), ra.fecha_inicio))
            FROM registros_antiguedades ra
            WHERE ra.empleado_id = t.empleado_id
          ), 0) + DATEDIFF(CURDATE(), t.fecha_ingreso)
        ) / 365) AS anios_antiguedad
      FROM empleados t
      JOIN datos_laborales c ON t.empleado_id = c.empleado_id
      LEFT JOIN cargos_cet cet ON c.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON c.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales niv ON c.nivel_salarial_id = niv.nivel_salarial_id
      LEFT JOIN direcciones dir ON c.direccion_id = dir.direccion_id
      LEFT JOIN divisiones divi ON c.division_id = divi.division_id
      LEFT JOIN unidades uni ON c.unidad_id = uni.unidad_id
      LEFT JOIN primas_profesionalizacion pp ON c.prima_profesional_id = pp.prima_profesional_id
      WHERE t.estatus_id IN (1, 8, 9)
        AND (ona.nombre IS NULL OR ona.nombre NOT LIKE 'Obrero%')
        AND c.nivel_salarial_id IS NOT NULL
      ORDER BY 
        (c.direccion_id = (SELECT dl2.direccion_id FROM datos_laborales dl2 JOIN cargos_onapre ona2 ON dl2.cargo_onapre_id = ona2.cargo_onapre_id WHERE ona2.nombre = 'Contralor del Estado' LIMIT 1)) DESC,
        dir.nombre, 
        (ona.nombre = 'Contralor del Estado') DESC,
        t.apellidos, 
        t.nombres
    `;
    const [rows] = await pool.query(sql);
    return rows;
  }

  static async getEncargosTemporales() {
    const sql = `
      SELECT e.empleado_id, 1 as sup_activa, 
             eniv.salario_base AS salario_suplencia,
             ecet.nombre AS cargo_suplencia,
             edir.nombre AS departamento_suplencia,
             (
                SELECT nsa.salario_antiguo 
                FROM niveles_salariales_antiguos nsa 
                WHERE nsa.nombre = eniv.nombre 
                  AND nsa.cargo_onapre_id = eniv.cargo_onapre_id
                LIMIT 1
             ) AS salario_historico_suplencia,
             eona.nombre AS cargo_onapre_suplencia
      FROM encargos_temporales e
      JOIN cargos_cet ecet ON e.cargo_cet_id = ecet.cargo_cet_id
      JOIN niveles_salariales eniv ON e.nivel_salarial_id = eniv.nivel_salarial_id
      LEFT JOIN direcciones edir ON e.direccion_id = edir.direccion_id
      LEFT JOIN cargos_onapre eona ON e.cargo_onapre_id = eona.cargo_onapre_id
      WHERE e.estatus_encargo = 1
    `;
    const [rows] = await pool.query(sql);
    return rows;
  }

  static async getEscalasAntiguedad() {
    const sql = `SELECT anios_cumplidos, porcentaje_actual, porcentaje_anterior FROM configuracion_antiguedad ORDER BY anios_cumplidos ASC`;
    const [rows] = await pool.query(sql);
    return rows;
  }

  /**
   * Primas generales (montos fijos): transporte, hogares, alimentación, hijos.
   * La tabla primas_generales almacena el monto en la columna `asignacion`.
   */
  static async getPrimasGenerales() {
    const sql = `SELECT nombre, asignacion AS monto FROM primas_generales WHERE asignacion IS NOT NULL`;
    try {
      const [rows] = await pool.query(sql);
      return rows;
    } catch (e) {
      console.warn('[NominaActivosModel] No se pudo leer primas_generales:', e.message);
      return [];
    }
  }

  /**
   * Porcentajes de jerarquía desde la tabla dinámica porcentajes_jerarquias.
   * Columnas: jerarquia_id, cargo, porcentaje
   */
  static async getPorcentajesJerarquias() {
    const sql = `SELECT cargo, porcentaje FROM porcentajes_jerarquias`;
    try {
      const [rows] = await pool.query(sql);
      return rows;
    } catch (e) {
      console.warn('[NominaActivosModel] No se pudo leer porcentajes_jerarquias:', e.message);
      return [];
    }
  }

  static async getDeducciones() {
    const sql = `SELECT nombre, porcentaje FROM deducciones`;
    const [rows] = await pool.query(sql);
    return rows;
  }

  static async getMinSalarialBase() {
    const sql = `SELECT MIN(salario_base) AS salario_minimo FROM niveles_salariales`;
    const [rows] = await pool.query(sql);
    return Number(rows[0]?.salario_minimo) || 130.00;
  }

  static async getRetroactivosPagados(mes, anio, quincena) {
    try {
      return await RetroactivoModel.getPagadosPorPeriodo(mes, anio, quincena)
    } catch (error) {
      console.warn('[NominaActivosModel] No se pudo leer retroactivos:', error.message)
      return []
    }
  }

  static async getRetroactivosDetalle(mes, anio, quincena) {
    try {
      return await RetroactivoModel.getPagadosDetallePorPeriodo(mes, anio, quincena)
    } catch (error) {
      console.warn('[NominaActivosModel] No se pudo leer detalle retroactivos:', error.message)
      return []
    }
  }

  /**
   * Obtiene los 4 firmantes autorizados para el bloque de firmas del Excel.
   * Cada firma se determina por cargo_cet_id + adscripción (direccion_id/division_id),
   * ordenando por fecha_inicio_actual DESC en relacion_cargos para obtener el vigente.
   */
  static async getFirmantes() {
    const sql = `
      SELECT DISTINCT
        e.empleado_id,
        TRIM(CONCAT(e.nombres, ' ', e.apellidos)) AS nombre_completo,
        dl.cargo_cet_id,
        cet.nombre AS cargo_nombre,
        CASE dl.cargo_cet_id
          WHEN 69 THEN 'ASISTENTE ADMINISTRATIVO'
          WHEN 44 THEN 'JEFE DE DIVISIÓN DE REMUNERACIONES'
          WHEN 43 THEN 'JEFE DE DIVISIÓN GENERAL DE RECURSOS HUMANOS'
          WHEN 80 THEN 'DIRECTOR(A) DE RECURSOS HUMANOS'
        END AS cargo_firma
      FROM datos_laborales dl
      INNER JOIN empleados e ON dl.empleado_id = e.empleado_id
      INNER JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
      INNER JOIN relacion_cargos rc ON dl.empleado_id = rc.empleado_id
        AND dl.cargo_cet_id = rc.cargo_cet_id
      WHERE e.estatus_id = 1
        AND (
          (dl.cargo_cet_id = 69 AND dl.direccion_id = 2)
          OR (dl.cargo_cet_id = 44 AND dl.division_id = 9)
          OR (dl.cargo_cet_id = 43 AND dl.division_id = 8)
          OR (dl.cargo_cet_id = 80 AND dl.direccion_id = 2)
        )
      ORDER BY rc.fecha_inicio_actual DESC
    `;
    const [rows] = await pool.query(sql);

    // Deduplicar por cargo_cet_id (quedarse con el más reciente según ORDER BY)
    const seen = new Set();
    return rows.filter(r => {
      if (seen.has(r.cargo_cet_id)) return false;
      seen.add(r.cargo_cet_id);
      return true;
    });
  }
}
