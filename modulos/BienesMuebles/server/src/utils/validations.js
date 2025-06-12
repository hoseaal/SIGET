export class Validaciones {
  static username (username) {
    if (typeof username !== 'string') throw new Error('Username inválido')
    if (username.length < 3) throw new Error('Username muy corto')
  }

  static password (password) {
    if (typeof password !== 'string') throw new Error('Contraseña inválida')
    if (password.length < 3) throw new Error('Contraseña muy corta')
  }

  static validarBienMueble (datos) {
    // Validación de campos requeridos
    const camposRequeridos = [
      'bim_ide', 'bim_des', 'bim_fec', 'bim_ndo',
      'bim_val', 'bim_moneda', 'bim_sede',
      'est_ide', 'foa_ide', 'con_ide', 'esu_ide'
    ]

    camposRequeridos.forEach(campo => {
      if (!datos[campo] && datos[campo] !== 0) {
        throw new Error(`El campo ${campo} es requerido`)
      }
    })

    // Validación de tipos numéricos
    const camposNumericos = {
      bim_val: 'valor',
      est_ide: 'estado',
      foa_ide: 'forma de adquisición',
      con_ide: 'condición',
      esu_ide: 'estado de uso',
      dep_ide: 'departamento'
    }

    Object.entries(camposNumericos).forEach(([campo, nombre]) => {
      if (datos[campo] && isNaN(Number(datos[campo]))) {
        throw new Error(`El ${nombre} debe ser un valor numérico (campo: ${campo})`)
      }
    })

    // Validación de IDs alfanuméricos (mod_ide y cae_ide pueden ser null)
    const idsAlfanumericos = ['mod_ide', 'cae_ide']
    idsAlfanumericos.forEach(campo => {
      if (datos[campo] && !/^[A-Z0-9-]+$/.test(datos[campo])) {
        throw new Error(`El campo ${campo} debe contener solo números, letras mayúsculas o guiones`)
      }
    })

    // Validación de fechas
    if (isNaN(new Date(datos.bim_fec).getTime())) {
      throw new Error('Fecha de adquisición inválida')
    }

    if (datos.bim_fed && isNaN(new Date(datos.bim_fed).getTime())) {
      throw new Error('Fecha de desincorporación inválida')
    }

    // Validación de valores monetarios
    if (Number(datos.bim_val) <= 0) {
      throw new Error('El valor debe ser mayor a cero')
    }

    // Validación de moneda
    const monedasPermitidas = ['Bolívares', 'Dólares', 'Euros']
    if (!monedasPermitidas.includes(datos.bim_moneda)) {
      throw new Error(`Moneda no permitida. Use: ${monedasPermitidas.join(', ')}`)
    }

    // Validación de sede
    if (typeof datos.bim_sede !== 'string' || datos.bim_sede.length > 20) {
      throw new Error('La sede debe ser un texto de máximo 20 caracteres')
    }

    // Validación de estado incorporación (debe ser 0 o 1)
    if (datos.bim_inc !== undefined && ![0, 1].includes(Number(datos.bim_inc))) {
      throw new Error('El estado de incorporación debe ser 0 (No) o 1 (Sí)')
    }
  }
}
