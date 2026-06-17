import { NominaActivosService } from './nominaActivos.service.js'
import { NominaObreroService } from './nominaObrero.services.js'
import { NominaJubiladosService } from './nominaJubilados.service.js'
import { NominaPensionadosService } from './nominaPensionados.service.js'
import { NominaSobrevivientesService } from './nominaSobrevivientes.service.js'
import { NominaPersistenceService } from './nominaPersistence.service.js'
import { validarPeriodoDisponible } from '../utils/nominaResponse.js'

const SERVICE_MAP = {
  'Funcionario': { service: NominaActivosService, tipoPersist: 'Funcionario' },
  'Obrero Fijo': { service: NominaObreroService, tipoPersist: 'Obrero Fijo' },
  'Jubilado': { service: NominaJubiladosService, tipoPersist: 'Jubilado' },
  'Pensionado': { service: NominaPensionadosService, tipoPersist: 'Pensionado' },
  'Sobreviviente': { service: NominaSobrevivientesService, tipoPersist: 'Sobreviviente' }
}

export class NominaService {

  static _getEntry(tipoPersonal) {
    const entry = SERVICE_MAP[tipoPersonal]
    if (!entry) throw new Error(`No hay servicio registrado para tipo_personal: ${tipoPersonal}`)
    return entry
  }

  static async calcular({ tipo_personal, mes, anio, quincena }) {
    const { service } = this._getEntry(tipo_personal)
    return service.generarNomina(mes, anio, quincena)
  }

  static async cerrarYPersistir({ tipo_personal, mes, anio, quincenas }) {
    const { service, tipoPersist } = this._getEntry(tipo_personal)
    console.log('[cerrarYPersistir]', { tipo_personal, mes, anio, quincenas })

    const persistencia = {}
    for (const q of quincenas) {
      console.log(`[cerrarYPersistir] Procesando Q${q}...`)
      await validarPeriodoDisponible(mes, anio, [q], tipo_personal)
      const resultado = await service.generarNomina(mes, anio, q)
      console.log(`[cerrarYPersistir] Q${q} generó ${resultado?.length ?? 0} registros`)
      const resPersist = await NominaPersistenceService.persistir({
        registros: resultado,
        mes,
        anio,
        quincena_no: q,
        tipo_personal: tipoPersist,
        normalizador: this._getNormalizador(tipo_personal)
      })
      console.log(`[cerrarYPersistir] Q${q} persistió:`, JSON.stringify(resPersist))
      persistencia[`q${q}`] = resPersist
    }

    return persistencia
  }

  static _getNormalizador(tipoPersonal) {
    const map = {
      'Funcionario': NominaActivosService.normalizarRegistro.bind(NominaActivosService),
      'Obrero Fijo': NominaObreroService.normalizarRegistro.bind(NominaObreroService),
      'Jubilado': NominaJubiladosService.normalizarRegistro.bind(NominaJubiladosService),
      'Pensionado': NominaPensionadosService.normalizarRegistro.bind(NominaPensionadosService),
      'Sobreviviente': NominaSobrevivientesService.normalizarRegistro.bind(NominaSobrevivientesService)
    }
    return map[tipoPersonal]
  }
}
