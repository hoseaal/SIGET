import { FuncionarioModel } from '../models/funcionario.model.js'
import pool from '../utils/database.js'

export class FuncionarioService {

  /**
   * HELPER: Separa el body en datos personales y contractuales.
   * Evita errores de SQL por enviar columnas que no existen en la tabla destino.
   */
  static _separarDatos (datosSucios) {
    // Columnas exactas de tabla empleados
    const camposPersonal = [
      'cedula', 'nombres', 'apellidos', 'rif', 'fecha_nacimiento', 'lugar_nacimiento',
      'genero', 'estado_civil', 'tipo_sangre', 'deportes', 'actividades_culturales', 'direccion_habitacion',
      'telefono_fijo', 'celular', 'correo_principal', 'correo_secundario', 'cuenta_bancaria', 'fecha_ingreso', 'estudios_actuales',
      'fecha_culminacion_estudios', 'contacto_emergencia_1', 'contacto_emergencia_2', 'telefono_emergencia_1', 'telefono_emergencia_2',
      'profesion_id', 'estatus_id'
    ]

    // Columnas exactas de tabla datos_laborales (Contrato)
    const camposContrato = [
      'cargo_cet_id', 'cargo_onapre_id', 'nivel_salarial_id', 'nivel_salarial_antiguo_id', 'condicion_laboral_id', 'prima_profesional_id',
      'direccion_id', 'division_id', 'unidad_id'
    ]

    const datosPersonalClean = {}
    const datosContratoClean = {}
    let hayDatosContrato = false

    Object.keys(datosSucios).forEach(key => {
      // Forzar null para strings vacíos o "null" u strings con espacios
      let val = datosSucios[key]
      if (val === '' || val === ' ' || val === 'null' || val === undefined) {
        val = null
      }

      if (camposPersonal.includes(key)) {
        datosPersonalClean[key] = val
      } else if (camposContrato.includes(key)) {
        datosContratoClean[key] = val
        hayDatosContrato = true
      }
    })

    return {
      datosPersonalClean,
      datosContratoClean: hayDatosContrato ? datosContratoClean : null
    }
  }

  /**
   * HELPER: Valida y corrige la jerarquía Unidad -> División -> Dirección.
   * Si se asigna unidad, ignora la dir/div enviada y busca la correcta en DB.
   */
  static async _validarJerarquia (direccion_id, division_id, unidad_id) {
    if (unidad_id) {
      const [uniRows] = await pool.query('SELECT division_id FROM unidades WHERE unidad_id = ?', [unidad_id])
      if (uniRows.length === 0) throw new Error('Unidad no existe')
      
      const realDiv = uniRows[0].division_id
      const [divRows] = await pool.query('SELECT direccion_id FROM divisiones WHERE division_id = ?', [realDiv])
      
      return { direccion_id: divRows[0].direccion_id, division_id: realDiv, unidad_id }
    }
    
    if (division_id) {
      const [divRows] = await pool.query('SELECT direccion_id FROM divisiones WHERE division_id = ?', [division_id])
      if (divRows.length === 0) throw new Error('División no existe')
      
      return { direccion_id: divRows[0].direccion_id, division_id, unidad_id: null }
    }
    
    if (direccion_id) {
      // Validamos que exista dirección
      const [dirRows] = await pool.query('SELECT direccion_id FROM direcciones WHERE direccion_id = ?', [direccion_id])
      if (dirRows.length === 0) throw new Error('Dirección no existe')

      return { direccion_id, division_id: null, unidad_id: null }
    }

    // Caso: Funcionario sin ubicación asignada (válido en algunos casos)
    return { direccion_id: null, division_id: null, unidad_id: null }
  }

  /**
   * HELPER: Deduce y vincula automáticamente el nivel_salarial_antiguo_id 
   * en los datos contractuales, buscando el nivel antiguo coincidente por nombre.
   */
  static async _vincularNivelesSalariales (datosContratoClean) {
    if (datosContratoClean && datosContratoClean.nivel_salarial_id) {
       const [oldLevelRows] = await pool.query(`
         SELECT nsa.nivel_salarial_antiguo_id
         FROM niveles_salariales_antiguos nsa
         INNER JOIN niveles_salariales ns ON ns.nombre = nsa.nombre
         WHERE ns.nivel_salarial_id = ?
       `, [datosContratoClean.nivel_salarial_id])

       if (oldLevelRows && oldLevelRows.length > 0) {
          datosContratoClean.nivel_salarial_antiguo_id = oldLevelRows[0].nivel_salarial_antiguo_id
       }
    }
  }

  // --- MÉTODOS PÚBLICOS ---

  static async obtenerConFiltros (query) {
    const { page = 1, limit = 20, type, all, ...filtros } = query
    const offset = (page - 1) * limit
    const includeContract = type === 'full'

    if (all === 'true') {
      return await FuncionarioModel.getFiltered({ ...filtros, includeContract, limit: null })
    }

    const [data, total] = await Promise.all([
      FuncionarioModel.getFiltered({ ...filtros, includeContract, limit: Number(limit), offset: Number(offset) }),
      FuncionarioModel.countFiltered(filtros)
    ])

    return {
      data,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        itemsPerPage: Number(limit)
      }
    }
  }

  static async obtenerPorId (id, includeContract) {
    // Obtenemos la data cruda del modelo
    const rawData = await FuncionarioModel.getById(id, includeContract)
    if (!rawData) throw new Error('Funcionario no encontrado')

    // Si no se pidieron datos completos, devolvemos tal cual
    if (!includeContract) return rawData

    // Si es FULL, estructuramos el JSON manteniendo todos los datos intactos
    const respuesta = {
      ...rawData,
      
      // Objeto de Encargo (Solo si enc_id existe, sino null)
      encargo_activo: rawData.enc_id ? {
        id: rawData.enc_id,
        cargo: rawData.enc_cargo, // Nombre Cargo Encargado
        salario: rawData.enc_salario, // Salario Encargado
        direccion: rawData.enc_direccion,
        unidad: rawData.enc_unidad,
        fecha_inicio: rawData.enc_fecha_inicio,
        // Calculamos diferencia salarial para el frontend
        diferencia_salarial: (Number(rawData.enc_salario) - Number(rawData.salario_base || 0)).toFixed(2)
      } : null
    }

    return respuesta
  }

  static async crearCompleto (datos) {
    // 1. Limpieza de datos
    let { datosPersonalClean, datosContratoClean } = this._separarDatos(datos)

    // Validaciones básicas de personales
    if (!datosPersonalClean.cedula || !datosPersonalClean.nombres || !datosPersonalClean.apellidos) {
      throw new Error('Cédula, Nombre y Apellido son obligatorios')
    }

    // 2. Si hay contrato, validar jerarquía
    if (datosContratoClean) {
      const jerarquia = await this._validarJerarquia(
        datosContratoClean.direccion_id,
        datosContratoClean.division_id,
        datosContratoClean.unidad_id
      )
      // Fusionamos la jerarquía validada sobre los datos limpios
      datosContratoClean = { ...datosContratoClean, ...jerarquia }

      // Vinculamos ID antiguo basándonos en ID actual
      await this._vincularNivelesSalariales(datosContratoClean)
    }

    // 3. Crear Transaccional
    return await FuncionarioModel.createTransactional(datosPersonalClean, datosContratoClean)
  }

  static async actualizarCompleto (id, datos) {
    const existe = await FuncionarioModel.getById(id, false)
    if (!existe) throw new Error('Funcionario no existe')

    // 1. Limpieza de datos
    let { datosPersonalClean, datosContratoClean } = this._separarDatos(datos)

    // 2. Si hay contrato y se está cambiando la ubicación, re-validar jerarquía
    if (datosContratoClean) {
      if (datosContratoClean.direccion_id !== undefined || datosContratoClean.division_id !== undefined || datosContratoClean.unidad_id !== undefined) {
         // Re-calculamos jerarquía
         const jerarquia = await this._validarJerarquia(
            datosContratoClean.direccion_id,
            datosContratoClean.division_id,
            datosContratoClean.unidad_id
         )
         datosContratoClean = { ...datosContratoClean, ...jerarquia }
      }

      // Vinculamos ID antiguo basándonos en ID actual
      await this._vincularNivelesSalariales(datosContratoClean)
    }
    
    console.log('--- ACTUALIZANDO FUNCIONARIO ID:', id)
    console.log('PAYLOAD PERSONAL:', datosPersonalClean)
    console.log('PAYLOAD CONTRATO:', datosContratoClean)

    return await FuncionarioModel.updateTransactional(id, datosPersonalClean, datosContratoClean)
  }

  static async eliminar (id) {
    const existe = await FuncionarioModel.getById(id, false)
    if (!existe) throw new Error('Funcionario no existe')
    return await FuncionarioModel.delete(id)
  }

  static async asignarEncargo (empleado_id, datos) {
    // 1. Validar que el funcionario exista
    const funcionario = await FuncionarioModel.getById(empleado_id, false)
    if (!funcionario) throw new Error('Funcionario no encontrado')

    // 2. Validar datos mínimos del encargo
    if (!datos.cargo_cet_id || !datos.fecha_inicio || !datos.nivel_salarial_id) {
      throw new Error('Faltan datos del encargo (Cargo, Fecha Inicio o Nivel Salarial)')
    }

    // 3. Validar Jerarquía del Encargo
    // Asumimos que para un encargo deben decir al menos la unidad (o dirección)
    // Usamos el mismo helper _validarJerarquia
    const jerarquia = await this._validarJerarquia(datos.direccion_id, datos.division_id, datos.unidad_id)
    
    // Si la jerarquía retorna nulls puros, lanzamos error (un encargo debe tener sitio)
    if (!jerarquia.direccion_id) {
      throw new Error('Debe especificar la ubicación (Unidad o Dirección) del encargo')
    }

    // 4. Construir payload
    const payload = {
      empleado_id,
      ...datos,
      ...jerarquia, // direccion_id, division_id, unidad_id corregidos
      estatus_encargo: 1 // Forzamos estatus activo
    }

    return await FuncionarioModel.createEncargo(payload)
  }

  static async finalizarEncargo (empleado_id) {
    const afectado = await FuncionarioModel.deactivateEncargo(empleado_id)
    if (!afectado) throw new Error('El funcionario no tiene encargos activos para finalizar.')
    return true
  }

  static async cambiarEstatus (empleado_id, { nuevo_estatus_id, datos_adicionales }) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // 1. Validar que el empleado exista
      const [empleado] = await connection.query('SELECT empleado_id, estatus_id FROM empleados WHERE empleado_id = ?', [empleado_id])
      if (!empleado) throw new Error('Empleado no encontrado')

      // 2. Actualizar estatus_id en tabla empleados
      await connection.query('UPDATE empleados SET estatus_id = ? WHERE empleado_id = ?', [nuevo_estatus_id, empleado_id])

      // 3. Lógica específica por tipo de estatus
      if (Number(nuevo_estatus_id) === 3) {
        // JUBILADO: Requiere entrada en la tabla 'jubilados'
        const { porcentaje_jubilacion, fecha_efectiva } = datos_adicionales || {}
        
        // Verificar si ya existe en jubilados
        const [existeJub] = await connection.query('SELECT jubilado_id FROM jubilados WHERE empleado_id = ?', [empleado_id])
        
        if (existeJub.length > 0) {
          await connection.query(
            'UPDATE jubilados SET porcentaje_jubilacion = ?, fecha_efectiva = ? WHERE empleado_id = ?',
            [porcentaje_jubilacion || 0, fecha_efectiva || new Date(), empleado_id]
          )
        } else {
          await connection.query(
            'INSERT INTO jubilados (empleado_id, porcentaje_jubilacion, fecha_efectiva) VALUES (?, ?, ?)',
            [empleado_id, porcentaje_jubilacion || 0, fecha_efectiva || new Date()]
          )
        }
      }

      await connection.commit()
      return true
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }
}