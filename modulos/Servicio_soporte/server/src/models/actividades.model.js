import pool from '../utils/database.js'

export class actividadesModel {
    /**
     * Obtiene todas las actividades con información detallada
     */
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT 
                a.*, 
                d.nombre as depto_nombre,
                descrip.nombre as descripcion_nombre,
                e.nro_bien as equipo_nro_bien,
                t.nombre as tipo_act_nombre,
                u.username as usuario_nombre
            FROM actividades_sm a
            LEFT JOIN departamentos d ON a.direc_id = d.id
            LEFT JOIN descripciones descrip ON a.descrip_id = descrip.id
            LEFT JOIN equipos e ON a.equipo_id = e.id
            LEFT JOIN tipo_act t ON a.tipo_act = t.id
            LEFT JOIN usuarios u ON a.usuario_id = u.usuario_id
            ORDER BY a.fecha DESC, a.id DESC
        `)
        return rows
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM actividades_sm WHERE id = ?', [id])
        return rows[0] || null
    }

    static async create({ nro_act, fecha, direc_id, descrip_id, equipo_id, tipo_act, observaciones, usuario_id }) {
        const [result] = await pool.query(
            'INSERT INTO actividades_sm (nro_act, fecha, direc_id, descrip_id, equipo_id, tipo_act, observaciones, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nro_act, fecha, direc_id, descrip_id, equipo_id, tipo_act, observaciones, usuario_id]
        )
        return { id: result.insertId, nro_act, fecha, direc_id, descrip_id, equipo_id, tipo_act, observaciones, usuario_id }
    }

    static async update(id, datos) {
        const { nro_act, fecha, direc_id, descrip_id, equipo_id, tipo_act, observaciones, usuario_id } = datos;

        await pool.query(
            `UPDATE actividades_sm SET 
            nro_act = ?, fecha = ?, direc_id = ?, descrip_id = ?, 
            equipo_id = ?, tipo_act = ?, observaciones = ?, 
            usuario_id = ? 
            WHERE id = ?`,
            [nro_act, fecha, direc_id, descrip_id, equipo_id, tipo_act, observaciones, usuario_id, id]
        );

        return { id, ...datos };
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM actividades_sm WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}