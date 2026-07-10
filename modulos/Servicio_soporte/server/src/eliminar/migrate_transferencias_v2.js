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
        const [columns] = await connection.query('SHOW COLUMNS FROM transferencia LIKE "tipo_act"');
        
        if (columns.length === 0) {
            await connection.query('ALTER TABLE transferencia ADD COLUMN tipo_act INT DEFAULT NULL');
            await connection.query('ALTER TABLE transferencia ADD CONSTRAINT fk_transferencia_tipo_act FOREIGN KEY (tipo_act) REFERENCES tipo_act(id)');
            console.log('Columna tipo_act añadida a la tabla transferencia');
        } else {
            console.log('La columna tipo_act ya existe en transferencia');
        }
    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        await connection.end();
        process.exit();
    }
}

migrateTransferencias();
