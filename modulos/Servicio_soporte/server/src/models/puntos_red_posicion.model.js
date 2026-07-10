import pool from '../utils/database.js'

export class PuntosRedPosicionModel {
    static async getByCroquisId(croquisId) {
        const [rows] = await pool.query(`
            SELECT prp.*, p.nro_puerto, pp.id AS panel_id, pp.is_patch_panel1,
                   e.id AS equipo_id, e.nro_bien, e.tipo_equipo, e.ip,
                   ec.nombre_equipo,
                   te.nombre AS tipo_equipo_nombre
            FROM puntos_red_posicion prp
            JOIN puertos p ON prp.puerto_id = p.id
            JOIN panel_pared pp ON p.panel_id = pp.id
            LEFT JOIN equipos e ON e.pp_pared = p.id
            LEFT JOIN equipos_computo ec ON e.id = ec.equipo_id
            LEFT JOIN tipo_equipo te ON e.tipo_equipo = te.id
            WHERE prp.croquis_id = ?
        `, [croquisId])
        return rows
    }

    static async getAvailablePuertosByPiso(pisoId, currentPuertoId = null) {
        // Obtenemos los puertos del piso que no estén en la tabla puntos_red_posicion,
        // o que coincidan con el puerto que se está editando actualmente.
        const query = `
            SELECT p.id, p.nro_puerto, pp.id AS panel_id, pp.is_patch_panel1
            FROM puertos p
            JOIN panel_pared pp ON p.panel_id = pp.id
            WHERE pp.piso = ? 
              AND (p.id NOT IN (SELECT puerto_id FROM puntos_red_posicion) 
                   ${currentPuertoId ? 'OR p.id = ?' : ''})
        `
        const params = currentPuertoId ? [pisoId, currentPuertoId] : [pisoId]
        const [rows] = await pool.query(query, params)
        return rows
    }

    static async create({ croquis_id, puerto_id, x_pct, y_pct }) {
        const [result] = await pool.query(`
            INSERT INTO puntos_red_posicion (croquis_id, puerto_id, x_pct, y_pct)
            VALUES (?, ?, ?, ?)
        `, [croquis_id, puerto_id, x_pct, y_pct])
        return { id: result.insertId, croquis_id, puerto_id, x_pct, y_pct }
    }

    static async update(id, { puerto_id, x_pct, y_pct }) {
        await pool.query(`
            UPDATE puntos_red_posicion 
            SET puerto_id = ?, x_pct = ?, y_pct = ?
            WHERE id = ?
        `, [puerto_id, x_pct, y_pct, id])
        return { id, puerto_id, x_pct, y_pct }
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM puntos_red_posicion WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}
