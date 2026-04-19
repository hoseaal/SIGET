export class ImpresoraModel {
    static async create(datos, connection) {
        const { equipo_id, marca, toner_id } = datos
        await connection.query(
            'INSERT INTO impresoras (equipo_id, marca, toner_id) VALUES (?, ?, ?)',
            [equipo_id, marca, toner_id]
        )
    }

    static async update(equipo_id, datos, connection) {
        const { marca, toner_id } = datos
        await connection.query(
            'UPDATE impresoras SET marca = ?, toner_id = ? WHERE equipo_id = ?',
            [marca, toner_id, equipo_id]
        )
    }
}