import { ObreroModel } from '../models/obrero.model.js'
import pool from '../utils/database.js'

export class ObreroService {

  static _separarDatos (datosSucios) {
    const camposPersonal = [
      'cedula', 'nombres', 'apellidos', 'rif', 'fecha_nacimiento', 'lugar_nacimiento',
      'genero', 'estado_civil', 'tipo_sangre', 'deportes', 'actividades_culturales', 'direccion_habitacion',
      'telefono_fijo', 'celular', 'correo_principal', 'correo_secundario', 'fecha_ingreso', 'estudios_actuales',
      'fecha_culminacion_estudios', 'contacto_emergencia_1', 'contacto_emergencia_2', 'telefono_emergencia_1', 'telefono_emergencia_2',
      'profesion_id', 'estatus_id', 'nro_cuenta_bancaria'
    ]

    const camposContrato = [
      'cargo_cet_id', 'cargo_onapre_id', 'nivel_salarial_id', 'nivel_salarial_antiguo_id', 'condicion_laboral_id', 'prima_profesional_id',
      'direccion_id', 'division_id', 'unidad_id'
    ]

    const datosPersonalClean = {}
    const datosContratoClean = {}
    let hayDatosContrato = false

    Object.keys(datosSucios).forEach(key => {
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

  static async _validarCargosObrero(cargo_cet_id, cargo_onapre_id) {
    // Validar cargos para asegurar que sean Obrero, Aseador, Mensajero o Vigilante
    const regex = /OBRERO|ASEADOR|MENSAJERO|VIGILANTE/i

    if (cargo_cet_id) {
      const [cetRows] = await pool.query('SELECT nombre FROM cargos_cet WHERE cargo_cet_id = ?', [cargo_cet_id])
      if (cetRows.length === 0) throw new Error('Cargo CET no existe')
      if (!regex.test(cetRows[0].nombre)) {
        throw new Error('El Cargo CET seleccionado no corresponde a un Obrero Fijo válido (Obrero, Aseador, Mensajero, Vigilante)')
      }
    }

    if (cargo_onapre_id) {
      const [onaRows] = await pool.query('SELECT nombre FROM cargos_onapre WHERE cargo_onapre_id = ?', [cargo_onapre_id])
      if (onaRows.length === 0) throw new Error('Cargo ONAPRE no existe')
      if (!regex.test(onaRows[0].nombre)) {
        throw new Error('El Cargo ONAPRE seleccionado no corresponde a un Obrero Fijo válido')
      }
    }
  }

  static async obtenerConFiltros (query) {
    const { page = 1, limit = 20, all, ...filtros } = query
    const offset = (page - 1) * limit

    if (all === 'true') {
      return await ObreroModel.getFiltered({ ...filtros, limit: null })
    }

    const [data, total] = await Promise.all([
      ObreroModel.getFiltered({ ...filtros, limit: Number(limit), offset: Number(offset) }),
      ObreroModel.countFiltered(filtros)
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

  static async obtenerPorId (id) {
    const rawData = await ObreroModel.getById(id)
    if (!rawData) throw new Error('Obrero no encontrado')

    const respuesta = {
      ...rawData,
      encargo_activo: rawData.enc_id ? {
        id: rawData.enc_id,
        cargo: rawData.enc_cargo,
        salario: rawData.enc_salario,
        direccion: rawData.enc_direccion,
        unidad: rawData.enc_unidad,
        fecha_inicio: rawData.enc_fecha_inicio,
        diferencia_salarial: (Number(rawData.enc_salario) - Number(rawData.salario_base || 0)).toFixed(2)
      } : null
    }

    return respuesta
  }

  static async crearCompleto (datos) {
    let { datosPersonalClean, datosContratoClean } = this._separarDatos(datos)

    if (!datosPersonalClean.cedula || !datosPersonalClean.nombres || !datosPersonalClean.apellidos) {
      throw new Error('Cédula, Nombre y Apellido son obligatorios')
    }

    if (!datosContratoClean) {
      throw new Error('Los datos del contrato (ONAPRE, CET) son obligatorios para un Obrero')
    }

    // Forzar condición laboral a Fijo (1)
    datosContratoClean.condicion_laboral_id = 1

    await this._validarCargosObrero(datosContratoClean.cargo_cet_id, datosContratoClean.cargo_onapre_id)

    if (datosContratoClean) {
      const jerarquia = await this._validarJerarquia(
        datosContratoClean.direccion_id,
        datosContratoClean.division_id,
        datosContratoClean.unidad_id
      )
      datosContratoClean = { ...datosContratoClean, ...jerarquia }
    }

    return await ObreroModel.createTransactional(datosPersonalClean, datosContratoClean)
  }

  static async actualizarCompleto (id, datos) {
    const existe = await ObreroModel.getById(id)
    if (!existe) throw new Error('Obrero no existe')

    let { datosPersonalClean, datosContratoClean } = this._separarDatos(datos)

    if (datosContratoClean) {
      datosContratoClean.condicion_laboral_id = 1 // Asegurar Obrero Fijo
      
      await this._validarCargosObrero(
        datosContratoClean.cargo_cet_id || existe.cargo_cet_id, 
        datosContratoClean.cargo_onapre_id || existe.cargo_onapre_id
      )

      if (datosContratoClean.direccion_id !== undefined || datosContratoClean.division_id !== undefined || datosContratoClean.unidad_id !== undefined) {
         const jerarquia = await this._validarJerarquia(
            datosContratoClean.direccion_id,
            datosContratoClean.division_id,
            datosContratoClean.unidad_id
         )
         datosContratoClean = { ...datosContratoClean, ...jerarquia }
      }
    }

    return await ObreroModel.updateTransactional(id, datosPersonalClean, datosContratoClean)
  }

  static async eliminar (id) {
    const existe = await ObreroModel.getById(id)
    if (!existe) throw new Error('Obrero no existe')
    return await ObreroModel.delete(id)
  }
}