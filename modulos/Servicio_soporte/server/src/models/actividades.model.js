import pool from '../utils/database.js'

export class actividadesModel {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM actividades_sm')
        return rows
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM actividades_sm WHERE id = ?', [id])
        return rows[0] || null
    }

    static async create({ nro_act, fecha, direc_id, descrip_id, equipo_id, tipo_act, status, observaciones, usuario_id }) {
        const [result] = await pool.query('INSERT INTO actividades_sm ( nro_act, fecha, direc_id, descrip_id, equipo_id, tipo_act, status, observaciones, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nro_act, fecha, direc_id, descrip_id, equipo_id, tipo_act, status, observaciones, usuario_id]
        )
        return { id: result.insertId, nro_act, fecha, direc_id, descrip_id, equipo_id, tipo_act, status, observaciones, usuario_id }
    }

    static async update(id, datos) {
        const { nro_act, fecha, direc_id, descrip_id, equipo_id, tipo_act, status, observaciones, usuario_id } = datos;

        await pool.query(
            `UPDATE actividades_sm SET 
            nro_act = ?, fecha = ?, direc_id = ?, descrip_id = ?, 
            equipo_id = ?, tipo_act = ?, status = ?, observaciones = ?, 
            usuario_id = ? 
            WHERE id = ?`,
            [nro_act, fecha, direc_id, descrip_id, equipo_id, tipo_act, status, observaciones, usuario_id, id]
        );

        return { id, ...datos };
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM actividades_sm WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}