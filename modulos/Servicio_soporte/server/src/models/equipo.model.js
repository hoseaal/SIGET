import pool from '../utils/database.js'

export class EquipoModel {
    // El parámetro 'connection' permite que esta consulta sea parte de una transacción
    static async create({ nro_bien, direc_id, tipo_equipo, pp_pared, modelo_id, marca_id, ip }, connection = pool) {
        const mid = modelo_id === "" ? null : modelo_id;
        const maid = marca_id === "" ? null : marca_id;
        const tip = ip === "" ? null : ip;
        const [result] = await connection.query(
            'INSERT INTO equipos (nro_bien, direc_id, tipo_equipo, pp_pared, modelo_id, marca_id, ip) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nro_bien, direc_id, tipo_equipo, pp_pared, mid, maid, tip]
        )
        return { id: result.insertId }
    }

    static async update(id, { nro_bien, direc_id, tipo_equipo, pp_pared, modelo_id, marca_id, ip }, connection = pool) {
        const mid = modelo_id === "" ? null : modelo_id;
        const maid = marca_id === "" ? null : marca_id;
        const tip = ip === "" ? null : ip;
        await connection.query(
            'UPDATE equipos SET nro_bien = ?, direc_id = ?, tipo_equipo = ?, pp_pared = ?, modelo_id = ?, marca_id = ?, ip = ? WHERE id = ?',
            [nro_bien, direc_id, tipo_equipo, pp_pared, mid, maid, tip, id]
        )
    }
    static async getByPuerto({ pp_pared }, connection = pool) {
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
        SELECT 
            e.*, 
            e.marca_id as equipo_marca_id, -- Alias explícito para el ID de marca del equipo
            e.modelo_id as equipo_modelo_id, -- Alias explícito para el ID de modelo del equipo
            d.nombre as Departamento, 
            te.nombre as Tipo_de_equipo, 
            p.nro_puerto as Puerto, 
            pp.piso as piso_id, 
            pi.nombre as Piso,
            pps.nro_puerto as Puerto_soporte, 
            pps.p_router as Puerto_router, 
            ps.nro_bien as nro_bien_soport, 
            ps.descripcion, 
            t.nombre as toner, 
            t.descripcion as toner_descripcion,
            t.marca_id as toner_marca_id,
            t.modelo_id as toner_modelo_id,
            ma_t.nombre as toner_marca_nombre,
            mo_t.nombre as toner_modelo_nombre,
            imp.asig_toner,
            ec.nombre_equipo, 
            ec.sistema_operativo, 
            ec.version_office, 
            ec.elaborado_por, 
            ec.observaciones,
            mo.nombre as modelo_equipo_nombre, 
            ma_e.nombre as marca_equipo_nombre,
            imp.toner_id as printer_toner_id,
            -- Datos de componentes
            tc.nombre as Tipo_componente, 
            c.id as component_id,
            c.tipo_id, 
            c.marca_id as comp_marca_id, 
            c.modelo_id as comp_modelo_id, 
            c.serial as c_serial, 
            c.capacidad as c_capacidad, 
            c.nro_bien as c_nro_bien,
            ma_c.nombre as marca_comp_nombre, 
            mo_c.nombre as modelo_comp_nombre
        FROM equipos e
        LEFT JOIN departamentos d ON e.direc_id = d.id
        LEFT JOIN tipo_equipo te ON e.tipo_equipo = te.id
        LEFT JOIN marca ma_e ON e.marca_id = ma_e.id 
        LEFT JOIN modelo mo ON e.modelo_id = mo.id
        LEFT JOIN puertos p ON e.pp_pared = p.id
        LEFT JOIN panel_pared pp ON p.panel_id = pp.id
        LEFT JOIN piso pi ON pp.piso = pi.id
        LEFT JOIN puertos_panel_s pps ON pp.pp_soporte_id = pps.id
        LEFT JOIN panel_soport ps ON pps.panel_soport_id = ps.id
        LEFT JOIN componentes c ON e.id = c.equipo_id
        LEFT JOIN tipo_componente tc ON c.tipo_id = tc.id
        LEFT JOIN marca ma_c ON c.marca_id = ma_c.id
        LEFT JOIN modelo mo_c ON c.modelo_id = mo_c.id
        LEFT JOIN equipos_computo ec ON e.id = ec.equipo_id
        LEFT JOIN impresoras imp ON e.id = imp.equipo_id
        LEFT JOIN tipo_toner t ON imp.toner_id = t.id
        LEFT JOIN marca ma_t ON t.marca_id = ma_t.id
        LEFT JOIN modelo mo_t ON t.modelo_id = mo_t.id
    `);

        const equiposMap = new Map();

        rows.forEach(row => {
            if (!equiposMap.has(row.id)) {
                equiposMap.set(row.id, {
                    id: row.id,
                    nro_bien: row.nro_bien,
                    departamento: row.Departamento,
                    direc_id: row.direc_id, // Importante para el select de dirección
                    tipo_de_equipo: row.Tipo_de_equipo,
                    tipo_equipo_id: row.tipo_equipo, // Importante para el select de tipo
                    puerto_en_panel: row.Puerto,
                    pp_pared: row.pp_pared, // ID real del puerto
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
                    // AQUÍ ESTÁ LA CORRECCIÓN CLAVE:
                    marca_id: row.equipo_marca_id,
                    marca_nombre: row.marca_equipo_nombre,
                    modelo_id: row.equipo_modelo_id,
                    modelo_nombre: row.modelo_equipo_nombre,
                    // Datos de Impresora
                    toner_id: row.printer_toner_id || row.toner_id,
                    toner_nombre: row.toner,
                    toner_descripcion: row.toner_descripcion,
                    toner_marca_nombre: row.toner_marca_nombre,
                    toner_modelo_nombre: row.toner_modelo_nombre,
                    ip: row.ip,
                    asig_toner: row.asig_toner || 0,
                    detalles: []
                });
            }

            // Agregar detalles de componentes (si existen)
            if (row.component_id !== null) {
                const equipo = equiposMap.get(row.id);
                // Evitar duplicados de componentes por el LEFT JOIN usando el ID real de la tabla
                const existeComp = equipo.detalles.some(d => d.id === row.component_id);
                if (!existeComp) {
                    equipo.detalles.push({
                        id: row.component_id,
                        tipo: row.Tipo_componente,
                        tipo_id: row.tipo_id,
                        marca_id: row.comp_marca_id,
                        marca_nombre: row.marca_comp_nombre,
                        modelo_id: row.comp_modelo_id,
                        modelo_nombre: row.modelo_comp_nombre,
                        serial: row.c_serial,
                        capacidad: row.c_capacidad,
                        nro_bien: row.c_nro_bien
                    });
                }
            }
        });

        return Array.from(equiposMap.values());
    }

    static async incrementarAsigToner(equipoId, connection = pool) {
        const [result] = await connection.query(
            'UPDATE impresoras SET asig_toner = asig_toner + 1 WHERE equipo_id = ?',
            [equipoId]
        );
        return result.affectedRows > 0;
    }
}