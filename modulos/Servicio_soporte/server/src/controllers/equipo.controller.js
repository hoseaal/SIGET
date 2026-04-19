import { EquipoService } from '../services/equipo.service.js'
/**
 * 
 * @return {promise<object[]>} Lista de equipos con sus detalles y componentes  
 */
export const getAll = async (req, res) => {
    try {
        const equipos = await EquipoService.obtenerTodos()
        res.json(equipos)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
/**
 * 
 * @param {object} req.body 
 * @return {promise<object[]>} 
 */
export const createFullEquipo = async (req, res) => {
    try {
        // req.body debe contener { general: {}, detallesComputo: {}, componentes: [] }
        const resultado = await EquipoService.registrarCompleto(req.body)
        res.status(201).json({
            message: "registrado con éxito",
            data: resultado
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }   
}

export const updateFullEquipo = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await EquipoService.actualizarCompleto(id, req.body);
        res.json({
            message: "Equipo actualizado con éxito",
            data: resultado
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const deleteEquipo = async (req, res) => {
        try{
            const { id } = req.params
            await EquipoService.eliminarCompleto(id)
            res.json({ message: 'Equipo eliminado correctamente' })
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
}