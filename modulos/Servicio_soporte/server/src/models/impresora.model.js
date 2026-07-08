export class ImpresoraModel {
    static async create(datos, connection) {
        const { equipo_id, toner_id } = datos
        await connection.query(
            'INSERT INTO impresoras (equipo_id, toner_id) VALUES (?, ?)',
            [equipo_id, toner_id]
        )
    }

    static async update(equipo_id, datos, connection) {
        const { toner_id } = datos
        await connection.query(
            'UPDATE impresoras SET toner_id = ? WHERE equipo_id = ?',
            [toner_id, equipo_id]
        )
    }
}