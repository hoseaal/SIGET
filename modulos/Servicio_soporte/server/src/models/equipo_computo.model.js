export class EquipoComputoModel {
    static async create(datos, connection) {
        const { equipo_id, nombre_equipo, sistema_operativo, version_office, elaborado_por, observaciones } = datos
        await connection.query(
            `INSERT INTO equipos_computo 
            (equipo_id, nombre_equipo, sistema_operativo, version_office, elaborado_por, observaciones) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [equipo_id, nombre_equipo, sistema_operativo, version_office, elaborado_por, observaciones]
        )
    }

    static async update(equipo_id, datos, connection) {
        const { nombre_equipo, sistema_operativo, version_office, elaborado_por, observaciones } = datos
        await connection.query(
            `UPDATE equipos_computo 
            SET nombre_equipo = ?, sistema_operativo = ?, version_office = ?, elaborado_por = ?, observaciones = ? 
            WHERE equipo_id = ?`,
            [nombre_equipo, sistema_operativo, version_office, elaborado_por, observaciones, equipo_id]
        )
    }
}