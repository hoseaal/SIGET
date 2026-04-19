import pool from '../utils/database.js'

export class EquipoModel {
    // El parámetro 'connection' permite que esta consulta sea parte de una transacción
    static async create({ nro_bien, direc_id, tipo_equipo, pp_pared }, connection = pool) {
        const [result] = await connection.query(
            'INSERT INTO equipos (nro_bien, direc_id, tipo_equipo, pp_pared) VALUES (?, ?, ?, ?)',
            [nro_bien, direc_id, tipo_equipo, pp_pared]
        )
        return { id: result.insertId }
    }

    static async update(id, { nro_bien, direc_id, tipo_equipo, pp_pared }, connection = pool) {
        await connection.query(
            'UPDATE equipos SET nro_bien = ?, direc_id = ?, tipo_equipo = ?, pp_pared = ? WHERE id = ?',
            [nro_bien, direc_id, tipo_equipo, pp_pared, id]
        )
    }
    static async getByPuerto({pp_pared}, connection = pool) {
        const [rows] = await connection.query(`
            SELECT * FROM equipos WHERE pp_pared = ?` 
           , [pp_pared])
        return rows[0] || null
    }
    // Dentro de la clase EquipoModel
    static async delete(id, connection = pool) {
        const [result] = await connection.query(
            'DELETE FROM equipos WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
    static async getAll() {
    const [rows] = await pool.query(`
        SELECT e.*, tc.nombre as Tipo_componente, c.tipo_id, c.marca_id, c.modelo_id, c.serial as c_serial, c.capacidad as c_capacidad, c.nro_bien as c_nro_bien,
        d.nombre as Departamento, te.nombre as Tipo_de_equipo, p.nro_puerto as Puerto, pp.piso as piso_id, pi.nombre as Piso,
        pps.nro_puerto as Puerto_soporte, pps.p_router as Puerto_router, ps.nro_bien as nro_bien_soport, ps.descripcion, m.nombre as marca, t.nombre as toner, t.descripcion as toner_descripcion,
        ec.nombre_equipo, ec.sistema_operativo, ec.version_office, ec.elaborado_por, ec.observaciones
        FROM equipos e
        JOIN departamentos d ON e.direc_id = d.id
        JOIN tipo_equipo te ON e.tipo_equipo = te.id
        JOIN puertos p ON e.pp_pared = p.id
        JOIN panel_pared pp ON p.panel_id = pp.id
        JOIN piso pi ON pp.piso = pi.id
        JOIN puertos_panel_s pps ON pp.pp_soporte_id = pps.id
        JOIN panel_soport ps ON pps.panel_soport_id = ps.id
        LEFT JOIN componentes c ON e.id = c.equipo_id
        LEFT JOIN tipo_componente tc ON c.tipo_id = tc.id
        LEFT JOIN equipos_computo ec ON e.id = ec.equipo_id
        LEFT JOIN impresoras imp ON e.id = imp.equipo_id
        LEFT JOIN marca m ON imp.marca = m.id
        LEFT JOIN tipo_toner t ON imp.toner_id = t.id
            `);

    // Objeto para agrupar
    const equiposMap = new Map();

    rows.forEach(row => {
        if (!equiposMap.has(row.id)) {
            // Si el equipo no está en el mapa, lo agregamos con un array vacío de componentes
            equiposMap.set(row.id, {
                id: row.id,
                nro_bien: row.nro_bien,
                departamento: row.Departamento,
                tipo_de_equipo: row.Tipo_de_equipo,
                puerto_en_panel: row.Puerto,
                piso_id: row.piso_id,
                piso: row.Piso,
                puerto_soporte: row.Puerto_soporte,
                puerto_router: row.Puerto_router,
                nro_bien_panel_soporte: row.nro_bien_soport,
                descripcion_panel: row.descripcion,
                nombre_equipo: row.nombre_equipo,
                sistema_operativo: row.sistema_operativo,
                version_office: row.version_office,
                elaborado_por: row.elaborado_por,
                observaciones: row.observaciones,
                detalles: []
            });
        }

        // Si la fila tiene un componente, lo metemos al array del equipo correspondiente
        if (row.marca !== null) {
            equiposMap.get(row.id).detalles.push({
                marca: row.marca,
                toner: row.toner,
                toner_descripcion: row.toner_descripcion
            });
        }
        if (row.c_serial !== null) {
            equiposMap.get(row.id).detalles.push({
                tipo: row.Tipo_componente,
                tipo_id: row.tipo_id,
                marca_id: row.marca_id,
                modelo_id: row.modelo_id,
                serial: row.c_serial,
                capacidad: row.c_capacidad,
                nro_bien: row.c_nro_bien
            });
        }
    });

    return Array.from(equiposMap.values());
}
}