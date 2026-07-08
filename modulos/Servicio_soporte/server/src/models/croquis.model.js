import pool from '../utils/database.js'

export class CroquisModel {
    static async getByPisoId(pisoId) {
        const [rows] = await pool.query('SELECT * FROM croquis WHERE piso_id = ?', [pisoId])
        return rows[0] || null
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM croquis WHERE id = ?', [id])
        return rows[0] || null
    }

    static async createOrUpdate({ piso_id, imagen_url }) {
        // Al ser piso_id UNIQUE, insertamos y si ya existe actualizamos la imagen
        const [result] = await pool.query(`
            INSERT INTO croquis (piso_id, imagen_url) 
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE imagen_url = VALUES(imagen_url)
        `, [piso_id, imagen_url])
        
        return { id: result.insertId || null, piso_id, imagen_url }
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM croquis WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}
