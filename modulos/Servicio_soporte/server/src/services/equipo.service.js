import pool from '../utils/database.js'
import { EquipoModel } from '../models/equipo.model.js'
import { EquipoComputoModel } from '../models/equipo_computo.model.js'
import { ComponenteModel } from '../models/componente.model.js'
import { ImpresoraModel } from '../models/impresora.model.js'

export class EquipoService {
    static async obtenerTodos() {
        return await EquipoModel.getAll()
    }
    static async registrarCompleto(datos) {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            const puerto = await EquipoModel.getByPuerto({pp_pared: datos.general.pp_pared}, connection) 
            console.log(puerto)
            if(puerto) throw new Error('Ya existe un equipo registrado en ese puerto del panel')  
            // 1. Crear el equipo base (Siempre se hace)
            const { id: equipoId } = await EquipoModel.create(datos.general, connection)

            // 2. Lógica condicional según el tipo
            // Supongamos que tipo_equipo 1 = PC, 2 = Impresora
            const tipo = datos.general.tipo_equipo

            if (tipo === 1) { 
                // ES UNA COMPUTADORA
                if (datos.detallesComputo) {
                    await EquipoComputoModel.create({ equipo_id: equipoId, ...datos.detallesComputo }, connection)
                }else{
                    throw new Error('Faltan detalles para computadora')
                }
                if (datos.componentes && datos.componentes.length > 0) {
                    for (const comp of datos.componentes) {
                        await ComponenteModel.create({ equipo_id: equipoId, ...comp }, connection)
                    }
                }else{
                    throw new Error('Debe agregar al menos un componente para computadoras')
                }
            } 
            else if (tipo === 2) { 
                // ES UNA IMPRESORA
                if (datos.detallesImpresora) {
                    await ImpresoraModel.create({ equipo_id: equipoId, ...datos.detallesImpresora }, connection)
                }else{
                    throw new Error('Faltan detalles para impresora')
                }
            }

            await connection.commit()
            return { success: true, id: equipoId }

        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    }
    
    static async eliminarCompleto(equipoId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Borrar de tablas secundarias (hijos)
        // Borramos componentes asociados
        await connection.query('DELETE FROM componentes WHERE equipo_id = ?', [equipoId]);
        
        // Borramos detalles si era computadora
        await connection.query('DELETE FROM equipos_computo WHERE equipo_id = ?', [equipoId]);
        
        // Borramos detalles si era impresora
        await connection.query('DELETE FROM impresoras WHERE equipo_id = ?', [equipoId]);

        // 2. Limpiar referencias en otras tablas (Opcional)
        // Si el equipo está en 'estandar_detall', podrías querer ponerlo en NULL o borrarlo
        await connection.query('UPDATE estandar_detall SET equipo_id = NULL WHERE equipo_id = ?', [equipoId]);

        // 3. Borrar el registro principal
        const eliminado = await EquipoModel.delete(equipoId, connection);

        if (!eliminado) {
            throw new Error("El equipo no existe o ya fue eliminado.");
        }

        await connection.commit();
        return { success: true, message: "Equipo y sus componentes eliminados correctamente" };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
}