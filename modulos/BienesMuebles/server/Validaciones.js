export class Validaciones {
  static username(ci) {
    if (typeof ci !== 'string') throw new Error('El CI está vacío');
    if (ci.length < 3) throw new Error('El CI debe tener mínimo 3 caracteres');
    if (!/^[VvEeJjPp]\d+$/.test(ci)) throw new Error('Formato de CI inválido');
  }

  static password(password) {
    if (typeof password !== 'string') throw new Error('La contraseña está vacía');
  }

  static terms(terms) {
    if (terms !== true) throw new Error('Debes aceptar los términos y condiciones');
  }

  static errors(error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2' ||
      error.code === 'ER_ROW_IS_REFERENCED_2' ||
      error.sqlMessage?.includes('foreign key constraint fails')) {
      throw new Error('La cédula no existe en el sistema de personal');
    }
  }
}
