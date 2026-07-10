export class ComponenteModel {
    static async create(datos, connection) {
        let { equipo_id, tipo_id, marca_id, modelo_id, serial, capacidad, nro_bien } = datos
        marca_id = marca_id === "" ? null : marca_id
        modelo_id = modelo_id === "" ? null : modelo_id
        
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