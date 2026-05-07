import pool from '../utils/database.js'

export class MantenimientoModel {
    /**
     * Obtiene todos los mantenimientos con información detallada
     */
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT 
                m.*, 
                s.nombre as status_nombre,
                d.nombre as depto_nombre,
                e.nro_bien as equipo_nro_bien,
                u.username as usuario_reporta,
                ut.username as tecnico_asignado,
                t.nombre as tipo_falla_nombre
            FROM mantenimiento m
            JOIN status s ON m.status = s.id
            JOIN departamentos d ON m.direc_id = d.id
            LEFT JOIN equipos e ON m.equipo_id = e.id
            JOIN usuarios u ON m.usuario_id = u.usuario_id
            LEFT JOIN usuarios ut ON m.usuario_tecnico_id = ut.usuario_id
            LEFT JOIN tipo_act t ON m.tipo_falla = t.id
            ORDER BY m.fecha_solicitud DESC
        `)
        return rows
    }

    /**
     * Obtiene mantenimientos por departamento de origen
     */
    static async getByDepto(direc_id) {
        const [rows] = await pool.query(`
            SELECT 
                m.*, 
                s.nombre as status_nombre,
                d.nombre as depto_nombre,
                e.nro_bien as equipo_nro_bien,
                u.username as usuario_reporta,
                t.nombre as tipo_falla_nombre
            FROM mantenimiento m
            JOIN status s ON m.status = s.id
            JOIN departamentos d ON m.direc_id = d.id
            LEFT JOIN equipos e ON m.equipo_id = e.id
            JOIN usuarios u ON m.usuario_id = u.usuario_id
            LEFT JOIN tipo_act t ON m.tipo_falla = t.id
            WHERE m.direc_id = ?
            ORDER BY m.fecha_solicitud DESC
        `, [direc_id])
        return rows
    }

    /**
     * Obtiene un mantenimiento por ID
     */
    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT 
                m.*, 
                s.nombre as status_nombre,
                d.nombre as depto_nombre,
                e.nro_bien as equipo_nro_bien,
                u.username as usuario_reporta,
                ut.username as tecnico_asignado,
                t.nombre as tipo_falla_nombre
            FROM mantenimiento m
            JOIN status s ON m.status = s.id
            JOIN departamentos d ON m.direc_id = d.id
            LEFT JOIN equipos e ON m.equipo_id = e.id
            JOIN usuarios u ON m.usuario_id = u.usuario_id
            LEFT JOIN usuarios ut ON m.usuario_tecnico_id = ut.usuario_id
            LEFT JOIN tipo_act t ON m.tipo_falla = t.id
            WHERE m.id = ?
        `, [id])
        return rows[0] || null
    }

    /**
     * Obtiene el último número de caso para mantenimientos
     */
    static async getLastCaseNumber(prefix) {
        const [rows] = await pool.query(`
            SELECT nro_caso FROM mantenimiento 
            WHERE nro_caso LIKE ? 
            ORDER BY id DESC LIMIT 1
        `, [`${prefix}%`])
        return rows.length > 0 ? rows[0].nro_caso : null
    }

    /**
     * Crea un nuevo registro de mantenimiento
     */
    static async create(data) {
        const { nro_caso, usuario_id, direc_id, tipo_falla, equipo_id, asunto, descripcion } = data
        const [result] = await pool.query(`
            INSERT INTO mantenimiento 
            (nro_caso, usuario_id, direc_id, tipo_falla, equipo_id, asunto, descripcion, prioridad, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Media', 2)
        `, [nro_caso, usuario_id, direc_id, tipo_falla, equipo_id || null, asunto, descripcion])
        
        return { id: result.insertId, ...data, prioridad: 'Media' }
    }

    /**
     * Actualiza el estado y datos técnicos del mantenimiento
     */
    static async update(id, data) {
        const fields = []
        const params = []

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = ?`)
                params.push(value)
            }
        })

        if (fields.length === 0) return false

        params.push(id)
        const [result] = await pool.query(`
            UPDATE mantenimiento SET ${fields.join(', ')} WHERE id = ?
        `, params)

        return result.affectedRows > 0
    }
}
