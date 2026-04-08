import { JubiladoModel } from '../models/jubilado.model.js'
import pool from '../utils/database.js'

export class JubiladoService {

  /**
   * HELPER: Separa el body en datos personales, laborales y de jubilación.
   * Datos personales → tabla `empleados`
   * Datos laborales  → tabla `datos_laborales`
   * Datos jubilación → tabla `jubilados`
   */
  static _separarDatos (datosSucios, isUpdate = false) {
    // Campos de tabla `empleados`
    const camposPersonal = [
      'cedula', 'nombres', 'apellidos', 'rif', 'fecha_nacimiento', 'lugar_nacimiento',
      'genero', 'estado_civil', 'tipo_sangre', 'deportes', 'actividades_culturales',
      'direccion_habitacion', 'telefono_fijo', 'celular',
      'correo_principal', 'correo_secundario', 'cuenta_bancaria',
      'fecha_ingreso', 'estudios_actuales', 'fecha_culminacion_estudios',
      'contacto_emergencia_1', 'contacto_emergencia_2',
      'telefono_emergencia_1', 'telefono_emergencia_2',
      'profesion_id', 'estatus_id'
    ]

    // Campos de tabla `datos_laborales`
    const camposContrato = [
      'cargo_cet_id', 'cargo_onapre_id', 'nivel_salarial_id',
      'nivel_salarial_antiguo_id', 'condicion_laboral_id', 'prima_profesional_id',
      'direccion_id', 'division_id', 'unidad_id'
    ]

    // Campos propios de la tabla `jubilados`
    const camposJubilacion = [
      'porcentaje_jubilacion', 'fecha_efectiva'
    ]

    const datosPersonalClean = {}
    const datosContratoClean = {}
    const datosJubilacionClean = {}
    let hayDatosContrato = false
    let hayDatosJubilacion = false

    // Campos que no deben ser NULL en la DB (o que son VARCHAR NOT NULL y esperan string vacío)
    const evitarNull = [
      'celular', 'cuenta_bancaria', 'lugar_nacimiento', 'rif', 'tipo_sangre', 
      'deportes', 'actividades_culturales', 'direccion_habitacion', 'telefono_fijo', 
      'correo_principal', 'correo_secundario', 'estudios_actuales', 
      'contacto_emergencia_1', 'telefono_emergencia_1', 
      'contacto_emergencia_2', 'telefono_emergencia_2'
    ]

    const processField = (key, val, targetObj, isContrato, isJubilacion) => {
      // Limpieza básica
      if (val === '' || val === ' ' || val === 'null' || val === undefined || val === null) {
        val = evitarNull.includes(key) ? '' : null
      }
      targetObj[key] = val
      if (val !== null && val !== '') {
        if (isContrato) hayDatosContrato = true
        if (isJubilacion) hayDatosJubilacion = true
      }
    }

    if (isUpdate) {
      // Si es actualización, SÓLO procesamos los campos enviados para NO blanquear (borrar) 
      // datos que no gestionamos en el formulario (como estatus_id o historiales)
      Object.keys(datosSucios).forEach(key => {
        if (camposPersonal.includes(key)) {
          processField(key, datosSucios[key], datosPersonalClean, false, false)
        } else if (camposContrato.includes(key)) {
          processField(key, datosSucios[key], datosContratoClean, true, false)
        } else if (camposJubilacion.includes(key)) {
          processField(key, datosSucios[key], datosJubilacionClean, false, true)
        }
      })
    } else {
      // Si es inserción, forzamos todos los campos para prevenir 
      // errores de "Field doesn't have a default value" (envía nulos y strings vacíos explícitos)
      camposPersonal.forEach(key => processField(key, datosSucios[key], datosPersonalClean, false, false))
      camposContrato.forEach(key => processField(key, datosSucios[key], datosContratoClean, true, false))
      camposJubilacion.forEach(key => processField(key, datosSucios[key], datosJubilacionClean, false, true))
    }

    return {
      datosPersonalClean,
      datosContratoClean: hayDatosContrato || Object.keys(datosContratoClean).length > 0 ? datosContratoClean : null,
      datosJubilacionClean: hayDatosJubilacion || Object.keys(datosJubilacionClean).length > 0 ? datosJubilacionClean : null
    }
  }

  /**
   * HELPER: Valida la jerarquía Unidad → División → Dirección
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
      const [dirRows] = await pool.query('SELECT direccion_id FROM direcciones WHERE direccion_id = ?', [direccion_id])
      if (dirRows.length === 0) throw new Error('Dirección no existe')
      return { direccion_id, division_id: null, unidad_id: null }
    }
    return { direccion_id: null, division_id: null, unidad_id: null }
  }

  // --- MÉTODOS PÚBLICOS ---

  static async obtenerConFiltros (query) {
    const { page = 1, limit = 20, all, ...filtros } = query
    const offset = (page - 1) * limit

    if (all === 'true') {
      return await JubiladoModel.getFiltered({ ...filtros, limit: null })
    }

    const [data, total] = await Promise.all([
      JubiladoModel.getFiltered({ ...filtros, limit: Number(limit), offset: Number(offset) }),
      JubiladoModel.countFiltered(filtros)
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

  static async obtenerTodos () {
    return await JubiladoModel.getFiltered({ limit: null })
  }

  static async obtenerPorId (id) {
    const registro = await JubiladoModel.getById(id)
    if (!registro) throw new Error('Registro de jubilado no encontrado')
    return registro
  }

  /**
   * Registra un jubilado desde cero con todos los datos personales, laborales y de jubilación.
   *
   * Campos personales requeridos:
   *   nombres, apellidos, cedula, rif, fecha_nacimiento, tipo_sangre,
   *   celular, telefono_fijo, correo_principal, correo_secundario,
   *   direccion_habitacion, cuenta_bancaria
   *
   * Campos laborales (opcionales pero recomendados):
   *   fecha_ingreso (en empleados), profesion_id, cargo_cet_id,
   *   cargo_onapre_id, condicion_laboral_id, nivel_salarial_id (salario),
   *   clasificación ONAPRE = cargo_onapre_id
   *
   * Campos de jubilación requeridos:
   *   porcentaje_jubilacion, fecha_efectiva
   */
  static async crear (datos) {
    let { datosPersonalClean, datosContratoClean, datosJubilacionClean } = this._separarDatos(datos)

    // Validaciones mínimas obligatorias
    if (!datosPersonalClean.cedula || !datosPersonalClean.nombres || !datosPersonalClean.apellidos) {
      throw new Error('Cédula, Nombre y Apellido son obligatorios')
    }
    if (!datosJubilacionClean || !datosJubilacionClean.porcentaje_jubilacion || !datosJubilacionClean.fecha_efectiva) {
      throw new Error('porcentaje_jubilacion y fecha_efectiva son obligatorios')
    }
    if (datosJubilacionClean.porcentaje_jubilacion < 1 || datosJubilacionClean.porcentaje_jubilacion > 100) {
      throw new Error('El porcentaje de jubilación debe estar entre 1 y 100')
    }

    // Validar jerarquía organizativa si se envían datos laborales
    if (datosContratoClean) {
      if (!datosContratoClean.cargo_cet_id) {
        throw new Error('El Cargo Interno (CET) es obligatorio al registrar datos laborales')
      }
      const jerarquia = await this._validarJerarquia(
        datosContratoClean.direccion_id,
        datosContratoClean.division_id,
        datosContratoClean.unidad_id
      )
      datosContratoClean = { ...datosContratoClean, ...jerarquia }
    }

    return await JubiladoModel.createTransactional(datosPersonalClean, datosContratoClean, datosJubilacionClean)
  }

  static async actualizar (id, datos) {
    const existe = await JubiladoModel.getById(id)
    if (!existe) throw new Error('Registro de jubilado no existe')

    let { datosPersonalClean, datosContratoClean, datosJubilacionClean } = this._separarDatos(datos, true)

    // Validar porcentaje si se envía
    if (datosJubilacionClean?.porcentaje_jubilacion !== undefined && datosJubilacionClean.porcentaje_jubilacion !== null) {
      if (datosJubilacionClean.porcentaje_jubilacion < 1 || datosJubilacionClean.porcentaje_jubilacion > 100) {
        throw new Error('El porcentaje de jubilación debe estar entre 1 y 100')
      }
    }

    // Validar jerarquía si se modifican datos laborales
    if (datosContratoClean) {
      if (!datosContratoClean.cargo_cet_id) {
        throw new Error('El Cargo Interno (CET) es obligatorio en los datos laborales')
      }
      if (
        datosContratoClean.direccion_id !== undefined ||
        datosContratoClean.division_id !== undefined ||
        datosContratoClean.unidad_id !== undefined
      ) {
        const jerarquia = await this._validarJerarquia(
          datosContratoClean.direccion_id,
          datosContratoClean.division_id,
          datosContratoClean.unidad_id
        )
        datosContratoClean = { ...datosContratoClean, ...jerarquia }
      }
    }

    console.log('--- ACTUALIZANDO JUBILADO ID:', id)
    console.log('PAYLOAD PERSONAL:', datosPersonalClean)
    console.log('PAYLOAD CONTRATO:', datosContratoClean)
    console.log('PAYLOAD JUBILACIÓN:', datosJubilacionClean)

    return await JubiladoModel.updateTransactional(id, datosPersonalClean, datosContratoClean, datosJubilacionClean)
  }

  static async eliminar (id) {
    const existe = await JubiladoModel.getById(id)
    if (!existe) throw new Error('Registro de jubilado no existe')
    return await JubiladoModel.delete(id)
  }
}