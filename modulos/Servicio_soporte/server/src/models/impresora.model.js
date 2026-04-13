export class ImpresoraModel {
    static async create(datos, connection) {
        const { equipo_id, marca, toner_id } = datos
        await connection.query(
            'INSERT INTO impresoras (equipo_id, marca, toner_id) VALUES (?, ?, ?)',
            [equipo_id, marca, toner_id]
        )
    }
}