import mysql from 'mysql2/promise';

async function addOtro() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'control_informatica'
    });

    try {
        const [rows] = await connection.query('SELECT * FROM tipo_act WHERE nombre = "OTRO"');
        if (rows.length === 0) {
            await connection.query('INSERT INTO tipo_act (nombre) VALUES ("OTRO")');
            console.log('Opción "OTRO" agregada exitosamente a tipo_act');
        } else {
            console.log('La opción "OTRO" ya existe');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
        process.exit();
    }
}

addOtro();
