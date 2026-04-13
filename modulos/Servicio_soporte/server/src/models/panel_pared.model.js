import pool from '../utils/database.js'

export class PanelParedModel {
    static async getAll() {
        // Hacemos JOIN con piso y puertos_panel_s para dar información completa
        const [rows] = await pool.query(`
            SELECT pp.*, p.nombre as nombre_piso, pps.nro_puerto as puerto_servidor
            FROM panel_pared pp
            JOIN piso p ON pp.piso = p.id
            LEFT JOIN puertos_panel_s pps ON pp.pp_soporte_id = pps.id
        `)
        return rows
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM panel_pared WHERE id = ?', [id])
        return rows[0] || null
    }

    static async create({ piso, es_panel_principal, pp_soporte_id }) {
        const [result] = await pool.query(
            'INSERT INTO panel_pared (piso, es_panel_principal, pp_soporte_id) VALUES (?, ?, ?)',
            [piso, es_panel_principal, pp_soporte_id]
        )
        return { id: result.insertId, piso, es_panel_principal, pp_soporte_id }
    }

    static async update(id, { piso, es_panel_principal, pp_soporte_id }) {
        await pool.query(
            'UPDATE panel_pared SET piso = ?, es_panel_principal = ?, pp_soporte_id = ? WHERE id = ?',
            [piso, es_panel_principal, pp_soporte_id, id]
        )
        return { id, piso, es_panel_principal, pp_soporte_id }
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM panel_pared WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}