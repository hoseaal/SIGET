import pool from '../utils/database.js'

export class NominaObrerosModel {
    static async getObrerosData() {
        // Obreros fijos activos: estatus_id = 1 (Activo).
        // Se filtran por cargo_onapre LIKE 'Obrero%'.
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
        c.division_id, divi.nombre AS division,
        c.unidad_id, uni.nombre AS unidad,
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
      WHERE t.estatus_id IN (1, 8, 9)
        AND ona.nombre LIKE 'Obrero%'
        AND c.nivel_salarial_id IS NOT NULL
      ORDER BY dir.nombre, t.apellidos, t.nombres
    `;
        const [rows] = await pool.query(sql);
        return rows;
    }

    static async getEscalasAntiguedad() {
        const sql = `SELECT anios_cumplidos, porcentaje_actual, porcentaje_anterior FROM configuracion_antiguedad ORDER BY anios_cumplidos ASC`;
        const [rows] = await pool.query(sql);
        return rows;
    }

    static async getPrimasGenerales() {
        const sql = `SELECT nombre, asignacion AS monto FROM primas_generales WHERE asignacion IS NOT NULL`;
        try {
            const [rows] = await pool.query(sql);
            return rows;
        } catch (e) {
            console.warn('[NominaObrerosModel] No se pudo leer primas_generales:', e.message);
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
}
