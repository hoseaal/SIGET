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
}