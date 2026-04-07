import pool from '../utils/database.js'

export class tipo_actModel {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM tipo_act')
        return rows
    }
    static async create({nombre}){
        const[result] = await pool.query('INSERT INTO tipo_act (nombre) VALUES (?)', [nombre])
        return {tipo_act_id: result.insertId, nombre}
    }
    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM tipo_act WHERE id = ?', [id])
        return rows[0] || null
    }
    static async update(id, {nombre}){
        const[_] = await pool.query('UPDATE tipo_act SET nombre = ? WHERE id = ?', [nombre, id])
        return {id, nombre}
    }
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM tipo_act WHERE id = ?', [id])
        return result.affectedRows > 0
    }
}