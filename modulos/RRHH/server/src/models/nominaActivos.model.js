import pool from '../utils/database.js'

export class NominaActivosModel {
  static async getActivosData() {
    // Obtenemos los empleados activos, con su contrato, cargo, salario, etc.
    const sql = `
      SELECT t.empleado_id, t.cedula, t.nombres AS nombre, t.apellidos AS apellido, 
        t.fecha_ingreso, 
        (SELECT COUNT(*) FROM hijos h WHERE h.empleado_id = t.empleado_id) AS numero_hijos,
        c.cargo_cet_id, cet.nombre AS cargo_cet, 
        c.cargo_onapre_id, ona.nombre AS cargo_onapre,
        c.nivel_salarial_id, niv.salario_base,
        (
          SELECT salario_base 
          FROM historial_salarios hs 
          WHERE hs.nivel_salarial_id = c.nivel_salarial_id 
          ORDER BY fecha_vigencia DESC LIMIT 1
        ) AS salario_historico,
        c.direccion_id, dir.nombre AS departamento,
        pp.porcentaje AS profesionalizacion
      FROM empleados t
      JOIN datos_laborales c ON t.empleado_id = c.empleado_id
      LEFT JOIN cargos_cet cet ON c.cargo_cet_id = cet.cargo_cet_id
      LEFT JOIN cargos_onapre ona ON c.cargo_onapre_id = ona.cargo_onapre_id
      LEFT JOIN niveles_salariales niv ON c.nivel_salarial_id = niv.nivel_salarial_id
      LEFT JOIN direcciones dir ON c.direccion_id = dir.direccion_id
      LEFT JOIN primas_profesionalizacion pp ON t.profesion_id = pp.profesion_id
      WHERE t.estatus_id = 1
      ORDER BY dir.nombre, t.apellidos, t.nombres
    `;
    const [rows] = await pool.query(sql);
    return rows;
  }

  static async getAntiguedades() {
    const sql = `SELECT empleado_id, fecha_inicio, fecha_fin FROM registros_antiguedades`;
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
                SELECT salario_base 
                FROM historial_salarios hs 
                WHERE hs.nivel_salarial_id = e.nivel_salarial_id 
                ORDER BY fecha_vigencia DESC LIMIT 1
             ) AS salario_historico_suplencia
      FROM encargos_temporales e
      JOIN cargos_cet ecet ON e.cargo_cet_id = ecet.cargo_cet_id
      JOIN niveles_salariales eniv ON e.nivel_salarial_id = eniv.nivel_salarial_id
      LEFT JOIN direcciones edir ON e.direccion_id = edir.direccion_id
      WHERE e.estatus_encargo = 1
    `;
    const [rows] = await pool.query(sql);
    return rows;
  }

  static async getEscalasAntiguedad() {
    const sql = `SELECT anios_cumplidos, ant_act, ant_ant FROM configuracion_antiguedad`;
    const [rows] = await pool.query(sql);
    return rows;
  }

  static async getPrimas() {
    // Simulamos la recuperación de primas fijas desde la BD
    const sql = `SELECT nombre, porcentaje FROM primas`;
    try {
      const [rows] = await pool.query(sql);
      return rows;
    } catch (e) {
      // Valor por defecto en caso de no existir tabla primas
      return [];
    }
  }

  static async getDeducciones() {
    const sql = `SELECT nombre, porcentaje FROM deducciones`;
    const [rows] = await pool.query(sql);
    return rows;
  }
}
