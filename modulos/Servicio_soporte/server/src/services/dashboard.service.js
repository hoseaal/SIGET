import pool from '../utils/database.js'

export class DashboardService {
    static async getSummaryStats(user) {
        try {
            // 1. Métricas de Mantenimientos
            // Total
            const [[totalMantenimientosRow]] = await pool.query('SELECT COUNT(*) as total FROM mantenimiento')
            const totalMantenimientos = totalMantenimientosRow.total

            // Por Status (Pendientes, En Proceso, Resueltos...)
            const [mantenimientosPorStatus] = await pool.query(`
                SELECT s.nombre as status_nombre, s.id as status_id, COUNT(m.id) as cantidad
                FROM status s
                LEFT JOIN mantenimiento m ON s.id = m.status
                GROUP BY s.id, s.nombre
                HAVING cantidad > 0 OR s.nombre IN ('Pendiente', 'En Proceso', 'Resuelto')
            `)

            // 2. Métricas de Equipos
            // Total
            const [[totalEquiposRow]] = await pool.query('SELECT COUNT(*) as total FROM equipos')
            const totalEquipos = totalEquiposRow.total

            // Por Tipo de Equipo
            const [equiposPorTipo] = await pool.query(`
                SELECT te.nombre as tipo_nombre, COUNT(e.id) as cantidad
                FROM tipo_equipo te
                LEFT JOIN equipos e ON te.id = e.tipo_equipo
                GROUP BY te.id, te.nombre
                HAVING cantidad > 0
            `)

            // 3. Métricas de Actividades (Total)
            const [[totalActividadesRow]] = await pool.query('SELECT COUNT(*) as total FROM actividades_sm')
            const totalActividades = totalActividadesRow.total

            // 4. Métricas de Transferencias (Total)
            const [[totalTransferenciasRow]] = await pool.query('SELECT COUNT(*) as total FROM transferencia')
            const totalTransferencias = totalTransferenciasRow.total
            
            // 5. Mantenimientos recientes (últimos 5)
            const [mantenimientosRecientes] = await pool.query(`
                SELECT m.id, m.nro_caso, m.asunto, m.fecha_solicitud, s.nombre as status_nombre, u.nombres as usuario_nombres
                FROM mantenimiento m
                JOIN status s ON m.status = s.id
                JOIN usuarios u ON m.usuario_id = u.usuario_id
                ORDER BY m.fecha_solicitud DESC
                LIMIT 5
            `)

            return {
                mantenimientos: {
                    total: totalMantenimientos,
                    porStatus: mantenimientosPorStatus,
                    recientes: mantenimientosRecientes
                },
                equipos: {
                    total: totalEquipos,
                    porTipo: equiposPorTipo
                },
                actividades: {
                    total: totalActividades
                },
                transferencias: {
                    total: totalTransferencias
                }
            }
        } catch (error) {
            throw error
        }
    }
}
