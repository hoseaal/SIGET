import pool from '../utils/database.js'

export class TransferenciaModel {
    /**
     * Obtiene todas las transferencias con información detallada
     */
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT 
                t.*, 
                s.nombre as status_nombre,
                d_orig.nombre as origen_nombre,
                d_dest.nombre as destino_nombre,
                e.nro_bien as equipo_nro_bien,
                te.nombre as equipo_tipo,
                u.username as usuario_crea,
                ut.username as tecnico_recibe,
                t.codigo_entrega
            FROM transferencia t
            JOIN status s ON t.status = s.id
            JOIN departamentos d_orig ON t.origen_id = d_orig.id
            JOIN departamentos d_dest ON t.destino_id = d_dest.id
            JOIN equipos e ON t.equipo_id = e.id
            JOIN tipo_equipo te ON e.tipo_equipo = te.id
            JOIN usuarios u ON t.usuario_id = u.usuario_id
            LEFT JOIN usuarios ut ON t.usuario_tecnico_id = ut.usuario_id
            ORDER BY t.fecha DESC
        `)
        return rows
    }

    /**
     * Obtiene una transferencia por ID
     */
    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM transferencia WHERE id = ?', [id])
        return rows[0] || null
    }

    /**
     * Obtiene transferencias por departamento de origen
     */
    static async getByOrigen(origen_id) {
        const [rows] = await pool.query(`
            SELECT 
                t.*, 
                s.nombre as status_nombre,
                d_dest.nombre as destino_nombre,
                e.nro_bien as equipo_nro_bien,
                te.nombre as equipo_tipo,
                u.username as usuario_crea,
                t.codigo_entrega
            FROM transferencia t
            JOIN status s ON t.status = s.id
            JOIN departamentos d_dest ON t.destino_id = d_dest.id
            JOIN equipos e ON t.equipo_id = e.id
            JOIN tipo_equipo te ON e.tipo_equipo = te.id
            JOIN usuarios u ON t.usuario_id = u.usuario_id
            WHERE t.origen_id = ?
            ORDER BY t.fecha DESC
        `, [origen_id])
        return rows
    }

    /**
     * Verifica si un equipo ya tiene una transferencia pendiente
     */
    static async hasPendingTransfer(equipo_id) {
        const [rows] = await pool.query(`
            SELECT id FROM transferencia 
            WHERE equipo_id = ? AND status NOT IN (7, 8)
            LIMIT 1
        `, [equipo_id])
        return rows.length > 0
    }

    /**
     * Obtiene el último número de caso para un prefijo dado
     */
    static async getLastCaseNumber(prefix) {
        const [rows] = await pool.query(`
            SELECT nro_caso FROM transferencia 
            WHERE nro_caso LIKE ? 
            ORDER BY id DESC LIMIT 1
        `, [`${prefix}%`])
        return rows.length > 0 ? rows[0].nro_caso : null
    }

    /**
     * Crea una nueva transferencia
     */
    static async create({ nro_caso, origen_id, destino_id, equipo_id, usuario_id, asunto, observaciones, codigo_entrega }) {
        // Validar si ya hay una pendiente (mantenido en modelo por integridad)
        const isPending = await this.hasPendingTransfer(equipo_id)
        if (isPending) {
            throw new Error('El equipo ya tiene una transferencia en curso.')
        }

        const [result] = await pool.query(`
            INSERT INTO transferencia 
            (nro_caso, origen_id, destino_id, equipo_id, usuario_id, asunto, prioridad, observaciones, status, codigo_entrega) 
            VALUES (?, ?, ?, ?, ?, ?, 'Media', ?, 2, ?)
        `, [nro_caso, origen_id, destino_id, equipo_id, usuario_id, asunto, observaciones, codigo_entrega])

        return { id: result.insertId, nro_caso, codigo_entrega }
    }

    /**
     * Actualiza el estatus y datos técnicos
     */
    static async updateStatus(id, data) {
        const { 
            status, 
            usuario_tecnico_id, 
            fecha_recepcion, 
            prioridad, 
            diagnostico_tecnico, 
            solucion_tecnica, 
            fecha_entrega 
        } = data

        const updates = []
        const params = []

        if (status) {
            updates.push('status = ?')
            params.push(status)
        }
        if (usuario_tecnico_id) {
            updates.push('usuario_tecnico_id = ?')
            params.push(usuario_tecnico_id)
        }
        if (fecha_recepcion) {
            updates.push('fecha_recepcion = ?')
            params.push(fecha_recepcion)
        }
        if (prioridad) {
            updates.push('prioridad = ?')
            params.push(prioridad)
        }
        if (diagnostico_tecnico !== undefined) {
            updates.push('diagnostico_tecnico = ?')
            params.push(diagnostico_tecnico)
        }
        if (solucion_tecnica !== undefined) {
            updates.push('solucion_tecnica = ?')
            params.push(solucion_tecnica)
        }
        if (fecha_entrega) {
            updates.push('fecha_entrega = ?')
            params.push(fecha_entrega)
        }

        if (updates.length === 0) return false

        params.push(id)
        const [result] = await pool.query(`
            UPDATE transferencia SET ${updates.join(', ')} WHERE id = ?
        `, params)

        return result.affectedRows > 0
    }
}
