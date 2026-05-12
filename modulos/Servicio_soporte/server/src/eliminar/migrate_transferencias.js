import mysql from 'mysql2/promise';

async function migrateTransferencias() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'control_informatica'
    });

    try {
        // Verificar si la columna ya existe
        const [columns] = await connection.query('SHOW COLUMNS FROM transferencia LIKE "clasificacion_id"');
        
        if (columns.length === 0) {
            await connection.query('ALTER TABLE transferencia ADD COLUMN clasificacion_id INT DEFAULT NULL');
            await connection.query('ALTER TABLE transferencia ADD CONSTRAINT fk_transferencia_clasificacion FOREIGN KEY (clasificacion_id) REFERENCES tipo_clasificacion_sm(id)');
            console.log('Columna clasificacion_id añadida a la tabla transferencia');
        } else {
            console.log('La columna clasificacion_id ya existe en transferencia');
        }
    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        await connection.end();
        process.exit();
    }
}

migrateTransferencias();
