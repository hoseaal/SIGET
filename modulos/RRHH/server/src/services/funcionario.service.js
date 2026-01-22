import { FuncionarioModel } from '../models/funcionario.model.js'
import pool from '../utils/database.js'

export class FuncionarioService {

  /**
   * HELPER: Separa el body en datos personales y contractuales.
   * Evita errores de SQL por enviar columnas que no existen en la tabla destino.
   */
  static _separarDatos (datosSucios) {
    // Columnas exactas de tabla tmafun
    const camposPersonal = [
      'fun_ced', 'fun_nom', 'fun_ape', 'fun_rif', 'fun_fna', 'fun_lna',
      'fun_gen', 'fun_est', 'fun_san', 'fun_dep', 'fun_cul', 'fun_dir',
      'fun_tel', 'fun_cel', 'fun_ema1', 'fun_ema2', 'fun_fing', 'fun_estu',
      'fun_fcul', 'fun_emer1', 'fun_emer2', 'fun_teme1', 'fun_teme2',
      'pro_ide', 'est_ide'
    ]

    // Columnas exactas de tabla tesfun (Contrato)
    const camposContrato = [
      'cet_ide', 'ona_ide', 'niv_ide', 'nivant_ide', 'col_ide', 'prf_ide',
      'dir_ide', 'div_ide', 'uni_ide'
    ]

    const datosPersonalClean = {}
    const datosContratoClean = {}
    let hayDatosContrato = false

    Object.keys(datosSucios).forEach(key => {
      if (camposPersonal.includes(key)) {
        datosPersonalClean[key] = datosSucios[key]
      } else if (camposContrato.includes(key)) {
        datosContratoClean[key] = datosSucios[key]
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
  static async _validarJerarquia (dir_ide, div_ide, uni_ide) {
    if (uni_ide) {
      const [uniRows] = await pool.query('SELECT div_ide FROM tesuni WHERE uni_ide = ?', [uni_ide])
      if (uniRows.length === 0) throw new Error('Unidad no existe')
      
      const realDiv = uniRows[0].div_ide
      const [divRows] = await pool.query('SELECT dir_ide FROM tesdiv WHERE div_ide = ?', [realDiv])
      
      return { dir_ide: divRows[0].dir_ide, div_ide: realDiv, uni_ide }
    }
    
    if (div_ide) {
      const [divRows] = await pool.query('SELECT dir_ide FROM tesdiv WHERE div_ide = ?', [div_ide])
      if (divRows.length === 0) throw new Error('División no existe')
      
      return { dir_ide: divRows[0].dir_ide, div_ide, uni_ide: null }
    }
    
    if (dir_ide) {
      // Validamos que exista dirección
      const [dirRows] = await pool.query('SELECT dir_ide FROM tmadir WHERE dir_ide = ?', [dir_ide])
      if (dirRows.length === 0) throw new Error('Dirección no existe')

      return { dir_ide, div_ide: null, uni_ide: null }
    }

    // Caso: Funcionario sin ubicación asignada (válido en algunos casos)
    return { dir_ide: null, div_ide: null, uni_ide: null }
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

    // Si es FULL, estructuramos el JSON para mejor UX/UI
    // Separamos en Datos Personales, Contrato Base y Encargo Activo
    const respuesta = {
      datos_personales: {
        fun_ide: rawData.fun_ide,
        fun_ced: rawData.fun_ced,
        fun_nom: rawData.fun_nom,
        fun_ape: rawData.fun_ape,
        fun_rif: rawData.fun_rif,
        edad: rawData.edad,
        fun_gen: rawData.fun_gen,
        fun_fing: rawData.fun_fing,
        fun_cel: rawData.fun_cel,
        fun_ema1: rawData.fun_ema1,
        fun_dir: rawData.fun_dir,
        // ...puedes agregar más campos personales aquí si lo necesitas
        est_ide: rawData.est_ide
      },
      contrato_base: {
        cet_nom: rawData.cet_nom, // Nombre Cargo Base
        ona_nom: rawData.ona_nom,
        niv_sal: rawData.niv_sal, // Salario Base
        dir_nom: rawData.dir_nom,
        div_nom: rawData.div_nom,
        uni_nom: rawData.uni_nom
      },
      // Objeto de Encargo (Solo si enc_id existe, sino null)
      encargo_activo: rawData.enc_id ? {
        id: rawData.enc_id,
        cargo: rawData.enc_cargo, // Nombre Cargo Encargado
        salario: rawData.enc_salario, // Salario Encargado
        direccion: rawData.enc_direccion,
        unidad: rawData.enc_unidad,
        fecha_inicio: rawData.enc_ini,
        // Calculamos diferencia salarial para el frontend
        diferencia_salarial: (Number(rawData.enc_salario) - Number(rawData.niv_sal)).toFixed(2)
      } : null
    }

    return respuesta
  }

  static async crearCompleto (datos) {
    // 1. Limpieza de datos
    let { datosPersonalClean, datosContratoClean } = this._separarDatos(datos)

    // Validaciones básicas de personales
    if (!datosPersonalClean.fun_ced || !datosPersonalClean.fun_nom || !datosPersonalClean.fun_ape) {
      throw new Error('Cédula, Nombre y Apellido son obligatorios')
    }

    // 2. Si hay contrato, validar jerarquía
    if (datosContratoClean) {
      const jerarquia = await this._validarJerarquia(
        datosContratoClean.dir_ide,
        datosContratoClean.div_ide,
        datosContratoClean.uni_ide
      )
      // Fusionamos la jerarquía validada sobre los datos limpios
      datosContratoClean = { ...datosContratoClean, ...jerarquia }
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
      if (datosContratoClean.dir_ide !== undefined || datosContratoClean.div_ide !== undefined || datosContratoClean.uni_ide !== undefined) {
         // Re-calculamos jerarquía
         const jerarquia = await this._validarJerarquia(
            datosContratoClean.dir_ide,
            datosContratoClean.div_ide,
            datosContratoClean.uni_ide
         )
         datosContratoClean = { ...datosContratoClean, ...jerarquia }
      }
    }

    return await FuncionarioModel.updateTransactional(id, datosPersonalClean, datosContratoClean)
  }

  static async eliminar (id) {
    const existe = await FuncionarioModel.getById(id, false)
    if (!existe) throw new Error('Funcionario no existe')
    return await FuncionarioModel.delete(id)
  }

  static async asignarEncargo (fun_ide, datos) {
    // 1. Validar que el funcionario exista
    const funcionario = await FuncionarioModel.getById(fun_ide, false)
    if (!funcionario) throw new Error('Funcionario no encontrado')

    // 2. Validar datos mínimos del encargo
    if (!datos.cet_ide || !datos.enc_ini || !datos.niv_ide) {
      throw new Error('Faltan datos del encargo (Cargo, Fecha Inicio o Nivel Salarial)')
    }

    // 3. Validar Jerarquía del Encargo
    // Asumimos que para un encargo deben decir al menos la unidad (o dirección)
    // Usamos el mismo helper _validarJerarquia
    const jerarquia = await this._validarJerarquia(datos.dir_ide, datos.div_ide, datos.uni_ide)
    
    // Si la jerarquía retorna nulls puros, lanzamos error (un encargo debe tener sitio)
    if (!jerarquia.dir_ide) {
      throw new Error('Debe especificar la ubicación (Unidad o Dirección) del encargo')
    }

    // 4. Construir payload
    const payload = {
      fun_ide,
      ...datos,
      ...jerarquia, // dir_ide, div_ide, uni_ide corregidos
      enc_est: 1 // Forzamos estatus activo
    }

    return await FuncionarioModel.createEncargo(payload)
  }

  static async finalizarEncargo (fun_ide) {
    const afectado = await FuncionarioModel.deactivateEncargo(fun_ide)
    if (!afectado) throw new Error('El funcionario no tiene encargos activos para finalizar.')
    return true
  }
}