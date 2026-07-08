import { JubiladoService } from '../services/jubilado.service.js'

/**
 * HELPER: Identifica qué campo causó un error de duplicidad (ER_DUP_ENTRY).
 */
const identificarCampoDuplicado = (sqlMessage) => {
  if (!sqlMessage) return 'Ya existe un registro con esos datos.'
  const msg = sqlMessage.toLowerCase()

  if (msg.includes('cedula')) return 'Ya existe un jubilado con ese número de cédula.'
  if (msg.includes('rif')) return 'Ya existe un jubilado con ese RIF.'
  if (msg.includes('correo_principal')) return 'Ya existe un jubilado con ese correo electrónico principal.'
  if (msg.includes('empleado_id')) return 'Este empleado ya tiene un registro de jubilación asociado.'

  return 'Ya existe un registro con datos duplicados: ' + sqlMessage
}

/**
 * Obtiene la lista de todos los jubilados con paginación y filtros.
 * Query params soportados: page, limit, all, search, profesion_id, genero
 */
export const obtenerJubilados = async (req, res) => {
  try {
    const resultado = await JubiladoService.obtenerConFiltros(req.query)
    res.json(resultado)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Obtiene un jubilado específico por su jubilado_id.
 * Retorna datos personales + laborales + jubilación completos.
 */
export const obtenerJubilado = async (req, res) => {
  try {
    const { id } = req.params
    const jubilado = await JubiladoService.obtenerPorId(id)
    res.json(jubilado)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

/**
 * Registra un nuevo jubilado con todos sus datos.
 *
 * Body esperado:
 * --- Datos Personales (tabla empleados) ---
 *   nombres, apellidos, cedula, rif, fecha_nacimiento, tipo_sangre,
 *   celular, telefono_fijo, correo_principal, correo_secundario,
 *   direccion_habitacion, cuenta_bancaria, profesion_id,
 *   genero, estado_civil, lugar_nacimiento (opcionales)
 *
 * --- Datos Laborales (tabla datos_laborales) ---
 *   fecha_ingreso (va en empleados), cargo_cet_id, cargo_onapre_id,
 *   condicion_laboral_id, nivel_salarial_id, direccion_id, division_id, unidad_id
 *   (clasificacion_onapre se refleja a través de cargo_onapre_id)
 *
 * --- Datos de Jubilación (tabla jubilados) ---
 *   porcentaje_jubilacion (1-100), fecha_efectiva
 */
export const crearJubilado = async (req, res) => {
  try {
    const nuevo = await JubiladoService.crear(req.body)
    res.status(201).json({
      success: true,
      message: 'Jubilado registrado correctamente.',
      data: nuevo
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: identificarCampoDuplicado(error.sqlMessage) })
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Uno de los valores de referencia (cargo, nivel, profesión) no existe.' })
    }
    res.status(400).json({ error: error.message })
  }
}

/**
 * Actualiza datos personales, laborales y/o de jubilación.
 * Solo se actualizan los campos enviados en el body.
 */
export const actualizarJubilado = async (req, res) => {
  try {
    const { id } = req.params
    const actualizado = await JubiladoService.actualizar(id, req.body)
    res.json({ success: actualizado, message: 'Jubilado actualizado correctamente.' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: identificarCampoDuplicado(error.sqlMessage) })
    }
    res.status(400).json({ error: error.message })
  }
}

/**
 * Elimina el registro del jubilado y su empleado asociado.
 */
export const eliminarJubilado = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await JubiladoService.eliminar(id)
    res.json({ success: eliminado })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}