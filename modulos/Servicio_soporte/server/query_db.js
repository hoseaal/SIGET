import pool from './src/utils/database.js';

async function alterDB() {
    try {
        console.log("Adding depto_destino_id to mantenimiento...");
        await pool.query("ALTER TABLE mantenimiento ADD COLUMN depto_destino_id INT NULL");
        
        console.log("Adding depto_id to tipo_act...");
        await pool.query("ALTER TABLE tipo_act ADD COLUMN depto_id INT NULL");

        console.log("Checking if 'Servicio Técnico' exists in departamentos...");
        const [deptos] = await pool.query("SELECT * FROM departamentos WHERE nombre LIKE '%Servicio Técnico%' OR nombre LIKE '%Informatica%' OR nombre LIKE '%Tecnologia%'");
        let servicioTecnicoId = null;
        if (deptos.length > 0) {
            servicioTecnicoId = deptos[0].id;
        } else {
            console.log("Inserting 'Oficina de Tecnologia de la Informacion / Servicio Tecnico' department...");
            const [result] = await pool.query("INSERT INTO departamentos (nombre, piso_id) VALUES ('Oficina de Tecnologia de la Informacion', 3)");
            servicioTecnicoId = result.insertId;
        }
        console.log("Servicio Tecnico ID:", servicioTecnicoId);

        console.log("Updating tipo_act with depto_id for Servicio Técnico...");
        // IDs 1 to 21
        await pool.query("UPDATE tipo_act SET depto_id = ? WHERE id BETWEEN 1 AND 21", [servicioTecnicoId]);

        console.log("Updating tipo_act with depto_id for Servicios Generales...");
        // IDs 23 to 32 -> depto 3 (Direccion de Servicios Generales, Seguridad y Transporte)
        await pool.query("UPDATE tipo_act SET depto_id = 3 WHERE id BETWEEN 23 AND 32");

        console.log("Done successfully.");
        process.exit(0);
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Columns already exist, continuing...");
        } else {
            console.error(e);
            process.exit(1);
        }
    }
}

alterDB();
