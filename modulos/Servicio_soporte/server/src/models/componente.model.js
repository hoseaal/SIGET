export class ComponenteModel {
    static async create(datos, connection) {
        const { equipo_id, tipo_id, marca_id, modelo_id, serial, capacidad, nro_bien } = datos
        await connection.query(
            `INSERT INTO componentes 
            (equipo_id, tipo_id, marca_id, modelo_id, serial, capacidad, nro_bien) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [equipo_id, tipo_id, marca_id, modelo_id, serial, capacidad, nro_bien]
        )
    }

    static async deleteByEquipoId(equipo_id, connection) {
        await connection.query('DELETE FROM componentes WHERE equipo_id = ?', [equipo_id])
    }
}