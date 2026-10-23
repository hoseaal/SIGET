export class Validaciones {
  static username (value) {
    if (!value || String(value).trim().length < 3) {
      throw new Error('El usuario debe tener al menos 3 caracteres')
    }
  }

  static password (value) {
    if (!value || String(value).length < 6) {
      throw new Error('La contrasena debe tener al menos 6 caracteres')
    }
  }

  static requerido (value, campo) {
    if (value === undefined || value === null || String(value).trim() === '') {
      throw new Error(`El campo ${campo} es obligatorio`)
    }
  }

  static email (value) {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error('El correo electronico no es valido')
    }
  }

  static ip (value) {
    if (value && !/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
      throw new Error('La direccion IP no es valida')
    }
    if (value) {
      const partes = value.split('.').map(Number)
      if (partes.some(p => p < 0 || p > 255)) {
        throw new Error('La direccion IP no es valida')
      }
    }
  }
}
