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
    const funcionario = await FuncionarioModel.getById(id, includeContract)
    if (!funcionario) throw new Error('Funcionario no encontrado')
    return funcionario
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
         // Nota: Si el frontend manda solo 'uni_ide', asumimos el resto null para recalcular.
         // Lo ideal es que el Service busque la ubicación actual si vienen datos parciales,
         // pero para este ejemplo, asumimos que la validación _validarJerarquia maneja los inputs.
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
}